from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId

from app.models.models import SubscriptionPlan, Subscription, User, Address
from app.schemas.schemas import SubscriptionCreateRequest, SubscriptionResponse
from app.routers.auth import get_current_user, get_current_admin
from app.services.subscription_service import process_due_subscriptions

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

@router.get("/plans", response_model=List[SubscriptionPlan])
async def list_subscription_plans():
    plans = await SubscriptionPlan.find(SubscriptionPlan.is_active == True).to_list()
    return plans

@router.post("", response_model=SubscriptionResponse)
async def create_subscription(payload: SubscriptionCreateRequest, user: User = Depends(get_current_user)):
    plan = await SubscriptionPlan.get(PydanticObjectId(payload.plan_id))
    if not plan or not plan.is_active:
        raise HTTPException(status_code=404, detail="Subscription plan not found or inactive")
        
    next_date = datetime.utcnow() + (timedelta(days=1) if payload.frequency == "daily" else timedelta(days=7))
    
    sub = Subscription(
        user_id=user.id,
        plan_id=plan.id,
        status="active",
        delivery_address=Address(**payload.delivery_address.model_dump()),
        frequency=payload.frequency,
        next_delivery_date=next_date,
        start_date=datetime.utcnow()
    )
    await sub.insert()
    
    return SubscriptionResponse(
        id=str(sub.id),
        plan_name=plan.name,
        plan_price=plan.price,
        status=sub.status,
        frequency=sub.frequency,
        next_delivery_date=sub.next_delivery_date,
        delivery_address=payload.delivery_address,
        start_date=sub.start_date,
        paused_until=sub.paused_until
    )

@router.get("/me", response_model=List[SubscriptionResponse])
async def get_user_subscriptions(user: User = Depends(get_current_user)):
    subs = await Subscription.find(Subscription.user_id == user.id).to_list()
    results = []
    for sub in subs:
        plan = await SubscriptionPlan.get(sub.plan_id)
        results.append(SubscriptionResponse(
            id=str(sub.id),
            plan_name=plan.name if plan else "Monthly Pass",
            plan_price=plan.price if plan else 1499.0,
            status=sub.status,
            frequency=sub.frequency,
            next_delivery_date=sub.next_delivery_date,
            delivery_address=sub.delivery_address.model_dump(),
            start_date=sub.start_date,
            paused_until=sub.paused_until
        ))
    return results

@router.patch("/{subscription_id}/pause", response_model=dict)
async def pause_subscription(subscription_id: str, days: int = 7, user: User = Depends(get_current_user)):
    sub = await Subscription.get(PydanticObjectId(subscription_id))
    if not sub or (sub.user_id != user.id and user.role != "admin"):
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    sub.status = "paused"
    sub.paused_until = datetime.utcnow() + timedelta(days=days)
    sub.next_delivery_date = sub.paused_until
    await sub.save()
    return {"message": f"Subscription paused for {days} days", "status": sub.status, "resume_date": sub.paused_until}

@router.patch("/{subscription_id}/resume", response_model=dict)
async def resume_subscription(subscription_id: str, user: User = Depends(get_current_user)):
    sub = await Subscription.get(PydanticObjectId(subscription_id))
    if not sub or (sub.user_id != user.id and user.role != "admin"):
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    sub.status = "active"
    sub.paused_until = None
    sub.next_delivery_date = datetime.utcnow() + timedelta(days=1)
    await sub.save()
    return {"message": "Subscription resumed successfully", "status": sub.status, "next_delivery_date": sub.next_delivery_date}

@router.delete("/{subscription_id}", response_model=dict)
async def cancel_subscription(subscription_id: str, user: User = Depends(get_current_user)):
    sub = await Subscription.get(PydanticObjectId(subscription_id))
    if not sub or (sub.user_id != user.id and user.role != "admin"):
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    sub.status = "cancelled"
    await sub.save()
    return {"message": "Subscription cancelled", "status": sub.status}

@router.post("/process-due", response_model=dict)
async def trigger_subscription_processing(admin: User = Depends(get_current_admin)):
    count = await process_due_subscriptions()
    return {"message": f"Processed {count} due subscription orders", "generated_orders_count": count}
