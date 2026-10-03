from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Ingredient, Pizza, RecipeItem, User
from ..schemas import PizzaCreate, PizzaRead

router = APIRouter(prefix="/pizzas", tags=["Pizzas"])


@router.get("", response_model=list[PizzaRead])
def listar_pizzas(db: Session = Depends(get_db)):
    return db.scalars(
        select(Pizza).options(joinedload(Pizza.receita_itens)).order_by(Pizza.nome)
    ).unique().all()


@router.get("/{pizza_id}", response_model=PizzaRead)
def obter_pizza(pizza_id: int, db: Session = Depends(get_db)):
    pizza = db.scalar(
        select(Pizza).options(joinedload(Pizza.receita_itens)).where(Pizza.id == pizza_id)
    )
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza não encontrada")
    return pizza


@router.post("", response_model=PizzaRead, status_code=201)
def criar_pizza(
    payload: PizzaCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("gerente", "administrador")),
):
    if db.scalar(select(Pizza).where(Pizza.nome == payload.nome.strip())):
        raise HTTPException(status_code=409, detail="Pizza já cadastrada")
    ingredient_ids = [item.ingrediente_id for item in payload.itens]
    if len(set(ingredient_ids)) != len(ingredient_ids):
        raise HTTPException(status_code=400, detail="Receita contém ingredientes repetidos")
    found = db.scalars(select(Ingredient).where(Ingredient.id.in_(ingredient_ids))).all()
    if len(found) != len(ingredient_ids):
        raise HTTPException(status_code=400, detail="Receita contém ingredientes inválidos")
    pizza = Pizza(nome=payload.nome.strip(), preco=payload.preco)
    pizza.receita_itens = [
        RecipeItem(ingrediente_id=item.ingrediente_id, quantidade=item.quantidade)
        for item in payload.itens
    ]
    db.add(pizza)
    db.commit()
    db.refresh(pizza)
    return db.scalar(
        select(Pizza).options(joinedload(Pizza.receita_itens)).where(Pizza.id == pizza.id)
    )
