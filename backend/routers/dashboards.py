from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..alerts import build_alerts
from ..analytics import buy_recommendations, demand_forecast, full_analytics
from ..database import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("")
def analytics(meta_diaria: float = Query(2000.0, ge=0), db: Session = Depends(get_db)):
    return full_analytics(db, meta_diaria=meta_diaria)["kpis"]


@router.get("/completo")
def analytics_completo(meta_diaria: float = Query(2000.0, ge=0), db: Session = Depends(get_db)):
    return full_analytics(db, meta_diaria=meta_diaria)


@router.get("/alertas")
def alertas(persistir: bool = False, db: Session = Depends(get_db)):
    return build_alerts(db, persist=persistir)


@router.get("/previsoes")
def previsoes(dias: int = Query(7, ge=1, le=30), db: Session = Depends(get_db)):
    return demand_forecast(db, days=dias)


@router.get("/recomendacoes")
def recomendacoes(dias: int = Query(7, ge=1, le=30), db: Session = Depends(get_db)):
    return buy_recommendations(db, horizon_days=dias)
