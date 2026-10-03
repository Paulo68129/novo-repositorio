from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

BRT = ZoneInfo("America/Sao_Paulo")


def utcnow() -> datetime:
    """Mantém o nome histórico; retorna horário de Brasília (naive)."""
    return datetime.now(BRT).replace(tzinfo=None)


class User(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255))
    perfil: Mapped[str] = mapped_column(String(30), default="atendente")
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)


class Ingredient(Base):
    __tablename__ = "ingredientes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    estoque: Mapped[float] = mapped_column(Float, default=0)
    unidade: Mapped[str] = mapped_column(String(20), default="kg")
    estoque_minimo: Mapped[float] = mapped_column(Float, default=0)
    custo_unitario: Mapped[float] = mapped_column(Float, default=0)
    data_validade: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    receita_itens: Mapped[list["RecipeItem"]] = relationship(back_populates="ingrediente")


class Pizza(Base):
    __tablename__ = "pizzas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    preco: Mapped[float] = mapped_column(Float, default=0)
    ativa: Mapped[bool] = mapped_column(Boolean, default=True)

    receita_itens: Mapped[list["RecipeItem"]] = relationship(
        back_populates="pizza", cascade="all, delete-orphan"
    )
    vendas: Mapped[list["Sale"]] = relationship(back_populates="pizza")


class RecipeItem(Base):
    __tablename__ = "receita_itens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pizza_id: Mapped[int] = mapped_column(ForeignKey("pizzas.id"))
    ingrediente_id: Mapped[int] = mapped_column(ForeignKey("ingredientes.id"))
    quantidade: Mapped[float] = mapped_column(Float)

    pizza: Mapped[Pizza] = relationship(back_populates="receita_itens")
    ingrediente: Mapped[Ingredient] = relationship(back_populates="receita_itens")


class Sale(Base):
    __tablename__ = "vendas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pizza_id: Mapped[int] = mapped_column(ForeignKey("pizzas.id"))
    quantidade: Mapped[int] = mapped_column(Integer)
    valor_total: Mapped[float] = mapped_column(Float)
    custo_total: Mapped[float] = mapped_column(Float, default=0)
    criada_em: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)

    pizza: Mapped[Pizza] = relationship(back_populates="vendas")


class Alert(Base):
    __tablename__ = "alertas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tipo: Mapped[str] = mapped_column(String(50), index=True)
    mensagem: Mapped[str] = mapped_column(Text)
    severidade: Mapped[str] = mapped_column(String(20), default="aviso")
    resolvido: Mapped[bool] = mapped_column(Boolean, default=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)
