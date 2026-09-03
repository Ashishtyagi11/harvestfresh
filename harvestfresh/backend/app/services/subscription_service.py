import uuid
from datetime import datetime, timedelta
from app.models.models import Subscription, SubscriptionPlan, Order, OrderItem, Product

async def process_due_subscriptions() -> int:
    today = datetime.utcnow()
    due_subs = await Subscription.find(
        Subscription.status == "active",
        Subscription.next_delivery_date <= today
    ).to_list()
    
    generated_count = 0
    for sub in due_subs:
        plan = await SubscriptionPlan.get(sub.plan_id)
        if not plan:
            continue
            
        # Select popular organic products to populate the recurring subscription basket
        featured_products = await Product.find(Product.is_active == True, Product.organic_certified == True).limit(4).to_list()
        
        items = []
        subtotal = 0.0
        for p in featured_products:
            items.append(OrderItem(
                product_id=p.id,
                name=p.name,
                qty=1,
                price=p.price
            ))
            subtotal += p.price
            
        order_num = f"HF-SUB-{uuid.uuid4().hex[:6].upper()}"
        order = Order(
            user_id=sub.user_id,
            order_number=order_num,
            items=items,
            subtotal=subtotal,
            delivery_fee=0.0,
            total_amount=subtotal,
            delivery_address=sub.delivery_address,
            delivery_slot={"date": today.strftime("%Y-%m-%d"), "window": "7AM-9AM"},
            status="confirmed",
            payment_status="paid",
            source="subscription",
            subscription_id=sub.id
        )
        await order.insert()
        
        # Advance next delivery date based on frequency
        if sub.frequency == "daily":
            sub.next_delivery_date = today + timedelta(days=1)
        elif sub.frequency == "weekly":
            sub.next_delivery_date = today + timedelta(days=7)
        else:
            sub.next_delivery_date = today + timedelta(days=30)
            
        await sub.save()
        generated_count += 1
        
    return generated_count
