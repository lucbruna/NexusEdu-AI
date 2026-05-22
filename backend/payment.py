import mercadopago
from config import settings


def get_sdk():
    token = settings.mercadopago_access_token
    if not token:
        return None
    return mercadopago.SDK(token)


def create_pix_payment(email: str) -> dict:
    sdk = get_sdk()
    if sdk is None:
        return {"error": "MercadoPago não configurado"}
    payment_data = {
        "transaction_amount": 1,
        "description": "NexusEdu AI PRO",
        "payment_method_id": "pix",
        "payer": {"email": email}
    }
    payment_response = sdk.payment().create(payment_data)
    return payment_response["response"]
