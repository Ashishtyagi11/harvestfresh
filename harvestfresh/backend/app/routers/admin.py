from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from beanie import PydanticObjectId

from app.models.models import Order, User, Product, Subscription, Announcement
from app.schemas.schemas import AdminStatsResponse, CustomerStatusUpdate
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(admin: User = Depends(get_current_admin)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    orders_today_list = await Order.find(Order.created_at >= today_start).to_list()
    orders_today_count = len(orders_today_list)
    revenue_today = sum(o.total_amount for o in orders_today_list if o.status != "cancelled")
    
    all_orders = await Order.find_all().to_list()
    total_orders_count = len(all_orders)
    total_revenue = sum(o.total_amount for o in all_orders if o.status != "cancelled")
    
    active_subs_count = await Subscription.find(Subscription.status == "active").count()
    low_stock_count = await Product.find(Product.stock_qty <= 20, Product.is_active == True).count()
    total_users_count = await User.find_all().count()
    pending_approvals_count = await User.find(User.approval_status == "pending").count()
    active_announcements_count = await Announcement.find(Announcement.is_active == True).count()
    
    return AdminStatsResponse(
        orders_today=orders_today_count,
        revenue_today=round(revenue_today, 2),
        total_orders=total_orders_count,
        total_revenue=round(total_revenue, 2),
        active_subscriptions=active_subs_count,
        low_stock_products=low_stock_count,
        total_users=total_users_count,
        pending_approvals=pending_approvals_count,
        active_announcements=active_announcements_count
    )

@router.get("/orders", response_model=List[dict])
async def admin_list_orders(admin: User = Depends(get_current_admin)):
    orders = await Order.find_all().sort("-created_at").to_list()
    users_dict = {}
    for o in orders:
        if str(o.user_id) not in users_dict:
            u = await User.get(o.user_id)
            users_dict[str(o.user_id)] = u.name if u else "Customer"
            
    return [
        {
            "id": str(o.id),
            "order_number": o.order_number,
            "customer_name": users_dict.get(str(o.user_id), "Customer"),
            "items_count": sum(i.qty for i in o.items),
            "total_amount": o.total_amount,
            "status": o.status,
            "payment_status": o.payment_status,
            "source": o.source,
            "created_at": o.created_at,
            "pincode": o.delivery_address.pincode if o.delivery_address else "N/A",
            "items": [{"name": i.name, "qty": i.qty, "price": i.price} for i in o.items]
        } for o in orders
    ]

@router.get("/users", response_model=List[dict])
async def admin_list_users(
    status_filter: Optional[str] = Query(None, alias="approval_status"),
    admin: User = Depends(get_current_admin)
):
    query = User.find_all()
    if status_filter and status_filter != "all":
        query = User.find(User.approval_status == status_filter)
        
    users = await query.sort("-created_at").to_list()
    all_orders = await Order.find_all().to_list()
    
    # Calculate user stats
    user_orders_map = {}
    user_spent_map = {}
    for o in all_orders:
        uid = str(o.user_id)
        user_orders_map[uid] = user_orders_map.get(uid, 0) + 1
        if o.status != "cancelled":
            user_spent_map[uid] = user_spent_map.get(uid, 0.0) + o.total_amount

    return [
        {
            "id": str(u.id),
            "phone": u.phone,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "approval_status": getattr(u, "approval_status", "approved"),
            "is_active": getattr(u, "is_active", True),
            "account_type": getattr(u, "account_type", "retail"),
            "created_at": u.created_at,
            "addresses_count": len(u.addresses),
            "addresses": [a.model_dump() for a in u.addresses],
            "total_orders": user_orders_map.get(str(u.id), 0),
            "total_spent": round(user_spent_map.get(str(u.id), 0.0), 2)
        } for u in users
    ]

@router.put("/users/{user_id}/status", response_model=dict)
async def update_customer_status(
    user_id: str,
    payload: CustomerStatusUpdate,
    admin: User = Depends(get_current_admin)
):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if payload.approval_status is not None:
        user.approval_status = payload.approval_status
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.account_type is not None:
        user.account_type = payload.account_type
    if payload.role is not None:
        user.role = payload.role
        
    user.updated_at = datetime.utcnow()
    await user.save()
    return {
        "message": f"Updated customer {user.name} status",
        "id": str(user.id),
        "approval_status": user.approval_status,
        "is_active": user.is_active,
        "account_type": user.account_type,
        "role": user.role
    }

@router.post("/users/{user_id}/approve", response_model=dict)
async def approve_customer(user_id: str, admin: User = Depends(get_current_admin)):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    user.approval_status = "approved"
    user.is_active = True
    user.updated_at = datetime.utcnow()
    await user.save()
    return {"message": f"Customer {user.name} approved successfully", "approval_status": "approved"}

@router.post("/users/{user_id}/reject", response_model=dict)
async def reject_customer(user_id: str, admin: User = Depends(get_current_admin)):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    user.approval_status = "rejected"
    user.updated_at = datetime.utcnow()
    await user.save()
    return {"message": f"Customer {user.name} approval rejected", "approval_status": "rejected"}
