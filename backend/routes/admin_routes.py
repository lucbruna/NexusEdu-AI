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
