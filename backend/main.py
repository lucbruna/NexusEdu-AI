from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from database import engine, get_db
from models import User, History, ChatMemory

from routes.auth_routes import router as auth_router
from routes.chat_routes import router as chat_router
from routes.content_routes import router as content_router
from routes.admin_routes import router as admin_router
from routes.payment_routes import router as payment_router

# =========================
# Criar tabelas
# =========================
User.metadata.create_all(bind=engine)
History.metadata.create_all(bind=engine)
ChatMemory.metadata.create_all(bind=engine)

# =========================
# Rate Limiter
# =========================
limiter = Limiter(key_func=get_remote_address)

# =========================
# APP
# =========================
app = FastAPI(
    title="NexusEdu AI",
    description="API do assistente educacional NexusEdu AI",
    version="2.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# =========================
# CORS
# =========================
raw_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
allow_all = "*" in raw_origins
origins = ["*"] if allow_all else raw_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROTAS
# =========================
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(content_router)
app.include_router(admin_router)
app.include_router(payment_router)


# =========================
# HOME / HEALTH
# =========================
@app.get("/")
def home():
    return {"message": "NexusEdu AI Backend Online 🚀", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}


# =========================
# PROFILE
# =========================
@app.get("/profile/{email}")
def get_profile(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    return {
        "email": user.email,
        "plan": user.plan,
        "credits": user.credits,
        "role": user.role
    }


# =========================
# HISTORY (global, with pagination)
# =========================
@app.get("/history")
def get_history(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    total = db.query(History).count()
    items = (
        db.query(History)
        .order_by(History.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


# =========================
# USERS (protegido)
# =========================
@app.get("/users")
def get_users(db: Session = Depends(get_db)):
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


# =========================
# STARTUP
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
