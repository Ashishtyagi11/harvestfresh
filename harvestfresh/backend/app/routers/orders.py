import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId

from app.models.models import Order, OrderItem, Cart, Product, User, DeliveryZone, DeliverySlot, Address
from app.schemas.schemas import CreateOrderRequest, OrderResponse, OrderStatusUpdate
from app.routers.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse)
async def create_order(payload: CreateOrderRequest, user: User = Depends(get_current_user)):
    cart = await Cart.find_one(Cart.user_id == user.id)
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty. Cannot place order.")
        
    # Check pincode serviceability
    zone = await DeliveryZone.find_one(DeliveryZone.pincode == payload.delivery_address.pincode, DeliveryZone.is_active == True)
    eta_mins = zone.estimated_delivery_minutes if zone else 60
    
    order_items: list[OrderItem] = []
    subtotal = 0.0
    
    for item in cart.items:
        product = await Product.get(item.product_id)
        if product and product.is_active:
            if product.stock_qty < item.qty:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}. Available: {product.stock_qty}")
                
            item_total = product.price * item.qty
            subtotal += item_total
            
            # Decrement stock
            product.stock_qty -= item.qty
            await product.save()
            
            order_items.append(OrderItem(
                product_id=product.id,
                name=product.name,
                qty=item.qty,
                price=product.price
            ))
            
    delivery_fee = 0.0 if subtotal >= 499 else 49.0
    if payload.promo_code and payload.promo_code.upper() in ["FRESH20", "ORGANIC10"]:
        subtotal = round(subtotal * 0.9, 2)  # 10% off
        
    total_amount = round(subtotal + delivery_fee, 2)
    order_num = f"HF-{uuid.uuid4().hex[:8].upper()}"
    
    order = Order(
        user_id=user.id,
        order_number=order_num,
        items=order_items,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        delivery_address=Address(**payload.delivery_address.model_dump()),
        delivery_slot=DeliverySlot(date=payload.delivery_slot_date, window=payload.delivery_slot_window),
        status="confirmed",
        payment_status="cod" if payload.payment_method == "cod" else "paid",
        source="one_time"
    )
    await order.insert()
    
    # Save address to user saved addresses if not present
    addr_exists = any(a.line1 == payload.delivery_address.line1 and a.pincode == payload.delivery_address.pincode for a in user.addresses)
    if not addr_exists:
        user.addresses.append(Address(**payload.delivery_address.model_dump()))
        await user.save()
        
    # Clear cart
    cart.items = []
    cart.updated_at = datetime.utcnow()
    await cart.save()
    
    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        items=[{"product_id": str(i.product_id), "name": i.name, "qty": i.qty, "price": i.price} for i in order.items],
        subtotal=order.subtotal,
        delivery_fee=order.delivery_fee,
        total_amount=order.total_amount,
        delivery_address=payload.delivery_address,
        delivery_slot={"date": order.delivery_slot.date, "window": order.delivery_slot.window},
        status=order.status,
        payment_status=order.payment_status,
        source=order.source,
        created_at=order.created_at,
        eta_minutes=eta_mins
    )

@router.get("", response_model=List[OrderResponse])
async def list_user_orders(user: User = Depends(get_current_user)):
    orders = await Order.find(Order.user_id == user.id).sort("-created_at").to_list()
    return [
        OrderResponse(
            id=str(o.id),
            order_number=o.order_number,
            items=[{"product_id": str(i.product_id), "name": i.name, "qty": i.qty, "price": i.price} for i in o.items],
            subtotal=o.subtotal,
            delivery_fee=o.delivery_fee,
            total_amount=o.total_amount,
            delivery_address=o.delivery_address.model_dump(),
            delivery_slot={"date": o.delivery_slot.date, "window": o.delivery_slot.window},
            status=o.status,
            payment_status=o.payment_status,
            source=o.source,
            created_at=o.created_at,
            eta_minutes=60
        ) for o in orders
    ]

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_detail(order_id: str, user: User = Depends(get_current_user)):
    order = await Order.get(PydanticObjectId(order_id))
    if not order or (order.user_id != user.id and user.role != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")
        
    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        items=[{"product_id": str(i.product_id), "name": i.name, "qty": i.qty, "price": i.price} for i in order.items],
        subtotal=order.subtotal,
        delivery_fee=order.delivery_fee,
        total_amount=order.total_amount,
        delivery_address=order.delivery_address.model_dump(),
        delivery_slot={"date": order.delivery_slot.date, "window": order.delivery_slot.window},
        status=order.status,
        payment_status=order.payment_status,
        source=order.source,
        created_at=order.created_at,
        eta_minutes=60
    )

@router.post("/{order_id}/cancel", response_model=dict)
async def cancel_order(order_id: str, user: User = Depends(get_current_user)):
    order = await Order.get(PydanticObjectId(order_id))
    if not order or (order.user_id != user.id and user.role != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.status in ["delivered", "cancelled", "out_for_delivery"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel order with status '{order.status}'")
        
    order.status = "cancelled"
    await order.save()
    return {"message": "Order cancelled successfully", "order_id": str(order.id), "status": order.status}

@router.patch("/{order_id}/status", response_model=dict)
async def update_order_status(order_id: str, payload: OrderStatusUpdate, admin: User = Depends(get_current_admin)):
    order = await Order.get(PydanticObjectId(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = payload.status
    if payload.status == "delivered":
        order.payment_status = "paid"
    await order.save()
    return {"message": f"Order status updated to {payload.status}", "order_id": str(order.id), "status": order.status}
