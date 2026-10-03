from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import create_access_token, get_current_user, verify_password
from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, TokenResponse

router = APIRouter(tags=["Autenticação"])


def _authenticate(payload: LoginRequest, db: Session) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower().strip()))
    if not user or not verify_password(payload.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")
    if not user.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo")
    return TokenResponse(
        access_token=create_access_token(user),
        nome=user.nome,
        perfil=user.perfil,
        email=user.email,
    )


@router.post("/login", response_model=TokenResponse)
@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return _authenticate(payload, db)


@router.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "nome": user.nome, "email": user.email, "perfil": user.perfil}
