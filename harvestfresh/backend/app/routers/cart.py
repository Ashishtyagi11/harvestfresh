from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId

from app.models.models import Cart, CartItem, Product, User
from app.schemas.schemas import AddCartItem, CartItemDetail, CartResponse, UpdateCartItem
from app.routers.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])

async def get_or_create_user_cart(user_id: PydanticObjectId) -> Cart:
    cart = await Cart.find_one(Cart.user_id == user_id)
    if not cart:
        cart = Cart(user_id=user_id, items=[])
        await cart.insert()
    return cart

@router.get("", response_model=CartResponse)
async def get_cart(user: User = Depends(get_current_user)):
    cart = await get_or_create_user_cart(user.id)
    
    item_details: list[CartItemDetail] = []
    subtotal = 0.0
    item_count = 0
    
    for item in cart.items:
        product = await Product.get(item.product_id)
        if product and product.is_active:
            item_total = product.price * item.qty
            subtotal += item_total
            item_count += item.qty
            item_details.append(CartItemDetail(
                product_id=str(product.id),
                name=product.name,
                slug=product.slug,
                price=product.price,
                unit=product.unit,
                image=product.images[0] if product.images else None,
                qty=item.qty,
                item_total=item_total
            ))
            
    return CartResponse(items=item_details, subtotal=round(subtotal, 2), item_count=item_count)

@router.post("/items", response_model=CartResponse)
async def add_to_cart(payload: AddCartItem, user: User = Depends(get_current_user)):
    product = await Product.get(PydanticObjectId(payload.product_id))
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found or inactive")
        
    cart = await get_or_create_user_cart(user.id)
    
    # Check if item exists in cart
    existing_item = None
    for item in cart.items:
        if item.product_id == product.id:
            existing_item = item
            break
            
    if existing_item:
        existing_item.qty += payload.qty
    else:
        cart.items.append(CartItem(
            product_id=product.id,
            qty=payload.qty,
            price_at_add=product.price
        ))
        
    cart.updated_at = datetime.utcnow()
    await cart.save()
    
    return await get_cart(user)

@router.patch("/items/{product_id}", response_model=CartResponse)
async def update_cart_item(product_id: str, payload: UpdateCartItem, user: User = Depends(get_current_user)):
    p_id = PydanticObjectId(product_id)
    cart = await get_or_create_user_cart(user.id)
    
    if payload.qty <= 0:
        cart.items = [item for item in cart.items if item.product_id != p_id]
    else:
        for item in cart.items:
            if item.product_id == p_id:
                item.qty = payload.qty
                break
                
    cart.updated_at = datetime.utcnow()
    await cart.save()
    return await get_cart(user)

@router.delete("/items/{product_id}", response_model=CartResponse)
async def remove_cart_item(product_id: str, user: User = Depends(get_current_user)):
    p_id = PydanticObjectId(product_id)
    cart = await get_or_create_user_cart(user.id)
    cart.items = [item for item in cart.items if item.product_id != p_id]
    cart.updated_at = datetime.utcnow()
    await cart.save()
    return await get_cart(user)

@router.delete("/clear", response_model=CartResponse)
async def clear_cart(user: User = Depends(get_current_user)):
    cart = await get_or_create_user_cart(user.id)
    cart.items = []
    cart.updated_at = datetime.utcnow()
    await cart.save()
    return await get_cart(user)
