from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from database import get_db
from models import Payment, User
from payment import create_pix_payment

router = APIRouter(tags=["payment"])


@router.post("/create-payment")
def create_payment(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email é obrigatório")

    result = create_pix_payment(email)

    if "id" not in result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(result))

    payment_id = str(result["id"])
    transaction_data = result.get("point_of_interaction", {}).get("transaction_data", {})

    payment = Payment(
        email=email,
        payment_id=payment_id,
        status="pending",
        amount=1
    )
    db.add(payment)
    db.commit()

    return {
        "payment_id": payment_id,
        "qr_code": transaction_data.get("qr_code", ""),
        "qr_code_base64": transaction_data.get("qr_code_base64", "")
    }


@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        print("WEBHOOK:", data)

        action = data.get("action")
        if action in ("payment.updated", "payment.created"):
            payment_id = str(data["data"]["id"])
            payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()

            if payment:
                payment.status = "approved"
                user = db.query(User).filter(User.email == payment.email).first()
                if user:
                    user.plan = "pro"
                    user.credits += 100
                    print(f"USUÁRIO {user.email} VIROU PRO")
                db.commit()

        return {"status": "ok"}
    except Exception as e:
        print("ERRO WEBHOOK:", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
