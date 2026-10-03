from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from .analytics import ingredient_consumption, sales_growth
from .models import Alert, Ingredient


def days_until_stockout(estoque: float, daily_consumption: float) -> float | None:
    if daily_consumption <= 0:
        return None
    return estoque / daily_consumption


def build_alerts(db: Session, persist: bool = False) -> list[dict]:
    alerts: list[dict] = []
    consumption = ingredient_consumption(db, days=30)
    ingredients = db.scalars(select(Ingredient).order_by(Ingredient.nome)).all()

    for ingredient in ingredients:
        daily = consumption.get(ingredient.nome, 0.0) / 30
        if ingredient.estoque <= ingredient.estoque_minimo:
            alerts.append(
                {
                    "tipo": "estoque_critico",
                    "severidade": "critico",
                    "mensagem": f"{ingredient.nome} abaixo do mínimo ({ingredient.estoque:.1f} {ingredient.unidade})",
                    "ingrediente_id": ingredient.id,
                }
            )
        days_left = days_until_stockout(ingredient.estoque, daily)
        if days_left is not None and days_left <= 2 and ingredient.estoque > ingredient.estoque_minimo:
            alerts.append(
                {
                    "tipo": "ruptura_proxima",
                    "severidade": "aviso",
                    "mensagem": f"{ingredient.nome} acaba em {days_left:.0f} dia(s)",
                    "ingrediente_id": ingredient.id,
                }
            )
        if ingredient.data_validade:
            remaining = (ingredient.data_validade.date() - date.today()).days
            if remaining < 0:
                alerts.append(
                    {
                        "tipo": "validade_vencida",
                        "severidade": "critico",
                        "mensagem": f"{ingredient.nome} está vencido",
                        "ingrediente_id": ingredient.id,
                    }
                )
            elif remaining <= 2:
                alerts.append(
                    {
                        "tipo": "validade",
                        "severidade": "aviso",
                        "mensagem": f"{ingredient.nome} vence em {remaining} dia(s)",
                        "ingrediente_id": ingredient.id,
                    }
                )

    growth = sales_growth(db)
    if growth is not None and growth >= 15:
        alerts.append(
            {
                "tipo": "aumento_vendas",
                "severidade": "info",
                "mensagem": f"Aumento de vendas (+{growth:.0f}%)",
                "ingrediente_id": None,
            }
        )

    if persist:
        today_start = datetime.combine(date.today(), datetime.min.time())
        for alert in alerts:
            exists = db.scalar(
                select(Alert).where(
                    Alert.mensagem == alert["mensagem"],
                    Alert.resolvido.is_(False),
                    Alert.criado_em >= today_start,
                )
            )
            if not exists:
                db.add(
                    Alert(
                        tipo=alert["tipo"],
                        mensagem=alert["mensagem"],
                        severidade=alert["severidade"],
                    )
                )
        db.commit()

    return alerts
