import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
from pydantic import BaseModel

from app.models.models import Payment, Order, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

# Payment Gateway Interface
class PaymentGateway(ABC):
    @abstractmethod
    async def process_payment(self, amount: float, method: str, user_id: str) -> dict:
        pass

class StubPaymentGateway(PaymentGateway):
    async def process_payment(self, amount: float, method: str, user_id: str) -> dict:
        # TODO: swap StubGateway for RazorpayGateway/StripeGateway in production
        ref_id = f"PAY-STUB-{uuid.uuid4().hex[:10].upper()}"
        return {
            "status": "success" if method in ["stub_card", "stub_upi", "cod"] else "pending",
            "gateway_ref": ref_id,
            "message": "Payment simulation successful"
        }

gateway_instance = StubPaymentGateway()

class PaymentInitiateRequest(BaseModel):
    order_id: Optional[str] = None
    subscription_id: Optional[str] = None
    amount: float
    method: str = "cod"  # cod | stub_card | stub_upi

@router.post("/initiate", response_model=dict)
async def initiate_payment(payload: PaymentInitiateRequest, user: User = Depends(get_current_user)):
    result = await gateway_instance.process_payment(payload.amount, payload.method, str(user.id))
    
    order_obj_id = PydanticObjectId(payload.order_id) if payload.order_id else None
    sub_obj_id = PydanticObjectId(payload.subscription_id) if payload.subscription_id else None
    
    payment = Payment(
        user_id=user.id,
        order_id=order_obj_id,
        subscription_id=sub_obj_id,
        amount=payload.amount,
        method=payload.method,
        status=result["status"],
        gateway_ref=result["gateway_ref"]
    )
    await payment.insert()
    
    if order_obj_id and result["status"] == "success":
        order = await Order.get(order_obj_id)
        if order:
            order.payment_status = "paid"
            await order.save()
            
    return {
        "payment_id": str(payment.id),
        "status": payment.status,
        "gateway_ref": payment.gateway_ref,
        "message": result["message"]
    }

@router.post("/webhook")
async def payment_webhook(payload: dict):
    # Stubbed webhook handler for future Razorpay/Stripe webhooks
    print(f"[PAYMENT WEBHOOK RECEIVED]: {payload}")
    return {"status": "received"}
