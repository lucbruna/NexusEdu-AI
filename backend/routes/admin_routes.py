from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, History
from auth import get_current_user, require_admin
from schemas import UserResponse, HistoryResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def admin_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "plan": u.plan,
            "credits": u.credits,
            "role": u.role
        }
        for u in users
    ]


@router.put("/users/{user_id}")
def admin_update_user(
    user_id: int,
    role: str = None,
    plan: str = None,
    credits: int = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if role is not None:
        user.role = role
    if plan is not None:
        user.plan = plan
    if credits is not None:
        user.credits = credits
    db.commit()
    return {"message": "Usuário atualizado", "email": user.email, "role": user.role, "plan": user.plan, "credits": user.credits}
