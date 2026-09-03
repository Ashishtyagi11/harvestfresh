from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from beanie import PydanticObjectId

from app.models.models import Order, User, Product, Subscription
from app.schemas.schemas import AdminStatsResponse
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
    
    return AdminStatsResponse(
        orders_today=orders_today_count,
        revenue_today=round(revenue_today, 2),
        total_orders=total_orders_count,
        total_revenue=round(total_revenue, 2),
        active_subscriptions=active_subs_count,
        low_stock_products=low_stock_count,
        total_users=total_users_count
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
            "pincode": o.delivery_address.pincode
        } for o in orders
    ]

@router.get("/users", response_model=List[dict])
async def admin_list_users(admin: User = Depends(get_current_admin)):
    users = await User.find_all().sort("-created_at").to_list()
    return [
        {
            "id": str(u.id),
            "phone": u.phone,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at,
            "addresses_count": len(u.addresses)
        } for u in users
    ]
