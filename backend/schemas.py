from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class IngredientCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    estoque: float = Field(ge=0)
    unidade: str = Field(default="kg", max_length=20)
    estoque_minimo: float = Field(ge=0)
    custo_unitario: float = Field(ge=0)
    data_validade: datetime | None = None


class IngredientUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=120)
    estoque: float | None = Field(default=None, ge=0)
    unidade: str | None = Field(default=None, max_length=20)
    estoque_minimo: float | None = Field(default=None, ge=0)
    custo_unitario: float | None = Field(default=None, ge=0)
    data_validade: datetime | None = None


class IngredientRead(IngredientCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class RecipeItemCreate(BaseModel):
    ingrediente_id: int
    quantidade: float = Field(gt=0)


class RecipeItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ingrediente_id: int
    quantidade: float


class PizzaCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    preco: float = Field(gt=0)
    itens: list[RecipeItemCreate] = Field(min_length=1)


class PizzaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    preco: float
    ativa: bool
    receita_itens: list[RecipeItemRead] = []


class SaleCreate(BaseModel):
    pizza_id: int
    quantidade: int = Field(gt=0)


class SaleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    pizza_id: int
    quantidade: int
    valor_total: float
    custo_total: float
    criada_em: datetime


class LoginRequest(BaseModel):
    email: EmailStr | str
    senha: str = Field(min_length=4)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nome: str
    perfil: str
    email: str


class AlertRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    tipo: str
    mensagem: str
    severidade: str
    resolvido: bool
    criado_em: datetime
