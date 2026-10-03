from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..models import Pizza, RecipeItem, Sale

BRT = ZoneInfo("America/Sao_Paulo")


class SaleRuleError(Exception):
    """Raised when a sale violates an operational rule."""


def brasilia_now() -> datetime:
    return datetime.now(BRT).replace(tzinfo=None)


def register_sale(
    db: Session,
    pizza_id: int,
    quantity: int,
    criada_em: datetime | None = None,
) -> Sale:
    if quantity <= 0:
        raise SaleRuleError("A quantidade da venda deve ser maior que zero")

    pizza = db.scalar(
        select(Pizza)
        .options(joinedload(Pizza.receita_itens).joinedload(RecipeItem.ingrediente))
        .where(Pizza.id == pizza_id)
    )
    if not pizza or not pizza.ativa:
        raise SaleRuleError("Pizza não encontrada ou inativa")
    if not pizza.receita_itens:
        raise SaleRuleError("A pizza não possui uma receita cadastrada")

    # data de validade e “hoje” no fuso de Brasília
    today_brt = (criada_em or brasilia_now()).date()

    total_cost = 0.0
    for recipe_item in pizza.receita_itens:
        ingredient = recipe_item.ingrediente
        consumption = recipe_item.quantidade * quantity
        if ingredient.data_validade and ingredient.data_validade.date() < today_brt:
            raise SaleRuleError(f"Ingrediente vencido: {ingredient.nome}")
        if ingredient.estoque < consumption:
            raise SaleRuleError(f"Estoque insuficiente: {ingredient.nome}")
        total_cost += recipe_item.quantidade * ingredient.custo_unitario * quantity

    for recipe_item in pizza.receita_itens:
        recipe_item.ingrediente.estoque -= recipe_item.quantidade * quantity

    sale_time = criada_em or brasilia_now()
    sale = Sale(
        pizza_id=pizza.id,
        quantidade=quantity,
        valor_total=round(pizza.preco * quantity, 2),
        custo_total=round(total_cost, 2),
        criada_em=sale_time,
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale
