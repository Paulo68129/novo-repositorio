from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi import Depends

from .alerts import build_alerts
from .database import get_db, init_db
from .routers import auth, dashboards, estoque, pizzas, vendas

init_db()

app = FastAPI(
    title="PizzaStockAI API",
    version="1.0.0",
    description="Gestão de estoque, vendas, finanças e inteligência para pizzarias.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(estoque.router)
app.include_router(pizzas.router)
app.include_router(vendas.router)
app.include_router(dashboards.router)
app.include_router(auth.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "PizzaStockAI"}


@app.get("/alertas")
def listar_alertas(db: Session = Depends(get_db)):
    return build_alerts(db, persist=False)
