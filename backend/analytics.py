from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from .models import Ingredient, Pizza, RecipeItem, Sale

BRT = ZoneInfo("America/Sao_Paulo")

try:
    from ml.forecast import forecast_demand
    from ml.recommendation import purchase_recommendations
except ImportError:  # pragma: no cover - path bootstrap for uvicorn/pytest
    import sys
    from pathlib import Path

    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from ml.forecast import forecast_demand
    from ml.recommendation import purchase_recommendations


def _naive_now() -> datetime:
    return datetime.now(BRT).replace(tzinfo=None)


def period_bounds(periodo: str) -> datetime:
    today_start = datetime.combine(_naive_now().date(), datetime.min.time())
    if periodo == "hoje":
        return today_start
    if periodo == "semana":
        return today_start - timedelta(days=today_start.weekday())
    if periodo == "mes":
        return today_start.replace(day=1)
    if periodo == "ano":
        return today_start.replace(month=1, day=1)
    return today_start - timedelta(days=30)


def sales_totals(db: Session, since: datetime | None = None) -> dict:
    query = select(
        func.coalesce(func.sum(Sale.valor_total), 0),
        func.coalesce(func.sum(Sale.custo_total), 0),
        func.coalesce(func.sum(Sale.quantidade), 0),
        func.count(Sale.id),
    )
    if since is not None:
        query = query.where(Sale.criada_em >= since)
    revenue, cost, qty, pedidos = db.execute(query).one()
    revenue = float(revenue or 0)
    cost = float(cost or 0)
    qty = int(qty or 0)
    pedidos = int(pedidos or 0)
    return {
        "faturamento": revenue,
        "custo": cost,
        "lucro": revenue - cost,
        "quantidade": qty,
        "pedidos": pedidos,
        "ticket_medio": revenue / pedidos if pedidos else 0.0,
        "cmv_percentual": (cost / revenue * 100) if revenue else 0.0,
    }


def dashboard_kpis(db: Session, meta_diaria: float = 2000.0) -> dict:
    today = sales_totals(db, datetime.combine(_naive_now().date(), datetime.min.time()))
    critical = db.scalar(
        select(func.count()).select_from(Ingredient).where(Ingredient.estoque <= Ingredient.estoque_minimo)
    ) or 0
    return {
        "faturamento_hoje": today["faturamento"],
        "pedidos_hoje": today["quantidade"],
        "lucro_hoje": today["lucro"],
        "ingredientes_criticos": int(critical),
        "ticket_medio": today["ticket_medio"],
        "cmv_percentual": today["cmv_percentual"],
        "meta_diaria": meta_diaria,
        "meta_percentual": min(100.0, today["faturamento"] / meta_diaria * 100) if meta_diaria else 0.0,
    }


def financial_summary(db: Session) -> dict:
    return {
        "diario": sales_totals(db, period_bounds("hoje")),
        "semanal": sales_totals(db, period_bounds("semana")),
        "mensal": sales_totals(db, period_bounds("mes")),
        "anual": sales_totals(db, period_bounds("ano")),
    }


def daily_revenue_series(db: Session, days: int = 30) -> list[dict]:
    today = _naive_now().date()
    since = datetime.combine(today, datetime.min.time()) - timedelta(days=days - 1)
    rows = db.execute(
        select(func.date(Sale.criada_em), func.sum(Sale.valor_total))
        .where(Sale.criada_em >= since)
        .group_by(func.date(Sale.criada_em))
        .order_by(func.date(Sale.criada_em))
    ).all()
    mapped = {str(day): float(total or 0) for day, total in rows}
    series = []
    for offset in range(days):
        day = (today - timedelta(days=days - 1 - offset)).isoformat()
        series.append({"data": day, "valor": mapped.get(day, 0.0)})
    return series


def pizza_ranking(db: Session, days: int = 30) -> list[dict]:
    since = _naive_now() - timedelta(days=days)
    rows = db.execute(
        select(
            Pizza.nome,
            func.sum(Sale.quantidade),
            func.sum(Sale.valor_total),
            func.sum(Sale.custo_total),
        )
        .join(Sale, Sale.pizza_id == Pizza.id)
        .where(Sale.criada_em >= since)
        .group_by(Pizza.nome)
        .order_by(func.sum(Sale.quantidade).desc())
    ).all()
    ranking = []
    for idx, (nome, qty, revenue, cost) in enumerate(rows, start=1):
        revenue = float(revenue or 0)
        cost = float(cost or 0)
        ranking.append(
            {
                "posicao": idx,
                "pizza": nome,
                "quantidade": int(qty or 0),
                "faturamento": round(revenue, 2),
                "lucro": round(revenue - cost, 2),
            }
        )
    return ranking


def peak_hours(db: Session, days: int = 30) -> dict:
    since = _naive_now() - timedelta(days=days)
    sales = db.scalars(select(Sale).where(Sale.criada_em >= since)).all()
    buckets = defaultdict(int)
    for sale in sales:
        buckets[sale.criada_em.hour] += sale.quantidade
    if not buckets:
        return {"inicio": None, "fim": None, "distribuicao": [], "rotulo": "Sem dados"}
    best_start = max(range(0, 22), key=lambda h: sum(buckets.get(h + i, 0) for i in range(3)))
    best_end = best_start + 3
    dist = [{"hora": f"{h:02d}h", "pedidos": buckets.get(h, 0)} for h in range(24) if buckets.get(h, 0)]
    return {
        "inicio": best_start,
        "fim": best_end,
        "rotulo": f"{best_start:02d}h às {best_end:02d}h",
        "distribuicao": dist,
    }


def ingredient_consumption(db: Session, days: int = 30) -> dict[str, float]:
    since = _naive_now() - timedelta(days=days)
    sales = db.scalars(
        select(Sale)
        .options(joinedload(Sale.pizza).joinedload(Pizza.receita_itens).joinedload(RecipeItem.ingrediente))
        .where(Sale.criada_em >= since)
    ).unique().all()
    consumption: dict[str, float] = defaultdict(float)
    for sale in sales:
        if not sale.pizza:
            continue
        for item in sale.pizza.receita_itens:
            consumption[item.ingrediente.nome] += item.quantidade * sale.quantidade
    return dict(consumption)


def demand_forecast(db: Session, days: int = 7) -> dict:
    series = daily_revenue_series(db, days=21)
    history = [point["valor"] for point in series]
    predicted = forecast_demand(history, days=days)
    future = []
    for offset, value in enumerate(predicted, start=1):
        future.append({"data": (_naive_now().date() + timedelta(days=offset)).isoformat(), "valor": value})
    return {"historico": series[-14:], "previsao": future, "demanda_7dias": predicted}


def buy_recommendations(db: Session, horizon_days: int = 7) -> list[dict]:
    consumption = ingredient_consumption(db, days=30)
    ingredients = db.scalars(select(Ingredient).order_by(Ingredient.nome)).all()
    forecast_map: dict[str, float] = {}
    stock_map: dict[str, float] = {}
    units: dict[str, str] = {}
    for ingredient in ingredients:
        daily = consumption.get(ingredient.nome, 0.0) / 30
        forecast_map[ingredient.nome] = daily * horizon_days
        stock_map[ingredient.nome] = ingredient.estoque
        units[ingredient.nome] = ingredient.unidade
    recommendations = purchase_recommendations(
        forecast_map,
        stock_map,
        safety_stock={name: next(i.estoque_minimo for i in ingredients if i.nome == name) for name in forecast_map},
    )
    for item in recommendations:
        item["unidade"] = units.get(item["ingrediente"], "kg")
        item["custo_estimado"] = round(
            item["quantidade"]
            * next(i.custo_unitario for i in ingredients if i.nome == item["ingrediente"]),
            2,
        )
    return recommendations


def sales_growth(db: Session) -> float | None:
    today = datetime.combine(_naive_now().date(), datetime.min.time())
    yesterday = today - timedelta(days=1)
    today_total = sales_totals(db, today)["faturamento"]
    yday_total = float(
        db.scalar(
            select(func.coalesce(func.sum(Sale.valor_total), 0)).where(
                Sale.criada_em >= yesterday, Sale.criada_em < today
            )
        )
        or 0
    )
    if yday_total <= 0:
        return None
    return round((today_total - yday_total) / yday_total * 100, 1)


def full_analytics(db: Session, meta_diaria: float = 2000.0) -> dict:
    return {
        "kpis": dashboard_kpis(db, meta_diaria=meta_diaria),
        "financeiro": financial_summary(db),
        "serie_diaria": daily_revenue_series(db),
        "ranking": pizza_ranking(db),
        "horario_pico": peak_hours(db),
        "previsao": demand_forecast(db),
        "recomendacoes_compra": buy_recommendations(db),
        "crescimento_vendas_pct": sales_growth(db),
    }
