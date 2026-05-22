import mercadopago
from config import settings

sdk = mercadopago.SDK(settings.mercadopago_access_token)


def create_pix_payment(email: str) -> dict:
    payment_data = {
        "transaction_amount": 1,
        "description": "NexusEdu AI PRO",
        "payment_method_id": "pix",
        "payer": {"email": email}
    }
    payment_response = sdk.payment().create(payment_data)
    return payment_response["response"]
