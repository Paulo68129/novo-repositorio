from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import require_role
from ..database import get_db
from ..models import Ingredient, User
from ..schemas import IngredientCreate, IngredientRead, IngredientUpdate

router = APIRouter(prefix="/ingredientes", tags=["Estoque"])


@router.get("", response_model=list[IngredientRead])
def listar_ingredientes(
    apenas_criticos: bool = Query(False),
    db: Session = Depends(get_db),
):
    query = select(Ingredient).order_by(Ingredient.nome)
    items = db.scalars(query).all()
    if apenas_criticos:
        items = [item for item in items if item.estoque <= item.estoque_minimo]
    return items


@router.post("", response_model=IngredientRead, status_code=201)
def criar_ingrediente(
    payload: IngredientCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("gerente", "administrador")),
):
    if db.scalar(select(Ingredient).where(Ingredient.nome == payload.nome.strip())):
        raise HTTPException(status_code=409, detail="Ingrediente já cadastrado")
    item = Ingredient(**payload.model_dump())
    item.nome = item.nome.strip()
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{ingredient_id}", response_model=IngredientRead)
def atualizar_ingrediente(
    ingredient_id: int,
    payload: IngredientUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("gerente", "administrador")),
):
    item = db.get(Ingredient, ingredient_id)
    if not item:
        raise HTTPException(status_code=404, detail="Ingrediente não encontrado")
    data = payload.model_dump(exclude_unset=True)
    if "nome" in data and data["nome"]:
        data["nome"] = data["nome"].strip()
        clash = db.scalar(
            select(Ingredient).where(Ingredient.nome == data["nome"], Ingredient.id != ingredient_id)
        )
        if clash:
            raise HTTPException(status_code=409, detail="Já existe ingrediente com esse nome")
    for key, value in data.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{ingredient_id}", status_code=204)
def excluir_ingrediente(
    ingredient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("administrador")),
):
    item = db.get(Ingredient, ingredient_id)
    if not item:
        raise HTTPException(status_code=404, detail="Ingrediente não encontrado")
    db.delete(item)
    db.commit()
