from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Sale, User
from ..schemas import SaleCreate, SaleRead
from ..services.sales import SaleRuleError, register_sale

router = APIRouter(prefix="/vendas", tags=["Vendas"])


@router.get("", response_model=list[SaleRead])
def listar_vendas(limit: int = Query(200, ge=1, le=1000), db: Session = Depends(get_db)):
    return db.scalars(select(Sale).order_by(Sale.criada_em.desc()).limit(limit)).all()


@router.post("", response_model=SaleRead, status_code=201)
def registrar_venda(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    try:
        return register_sale(db, payload.pizza_id, payload.quantidade)
    except SaleRuleError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
