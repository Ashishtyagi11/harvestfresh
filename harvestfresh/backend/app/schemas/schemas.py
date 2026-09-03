from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# Auth Schemas
class OTPRequest(BaseModel):
    phone: str

class OTPRequestResponse(BaseModel):
    message: str
    phone: str
    debug_otp: Optional[str] = None

class OTPVerify(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None
    email: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    phone: str
    role: str
    name: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

# Address Schema
class AddressSchema(BaseModel):
    label: str = "Home"
    line1: str
    pincode: str
    city: str
    lat: Optional[float] = 0.0
    lng: Optional[float] = 0.0
    is_default: bool = True

# Category Schemas
class CategoryCreate(BaseModel):
    name: str
    slug: str
    parent_id: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    parent_id: Optional[str] = None

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    slug: str
    category_id: Optional[str] = None
    description: str
    price: float
    unit: str = "500g"
    stock_qty: int = 100
    organic_certified: bool = True
    seasonal: bool = False
    farm_source: str = "Green Valley Organic Farm"
    images: List[str] = []
    tags: List[str] = []
    is_active: bool = True

class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    description: str
    price: float
    unit: str
    stock_qty: int
    organic_certified: bool
    seasonal: bool
    farm_source: str
    harvested_on: datetime
    images: List[str]
    tags: List[str]
    is_active: bool
    freshness_percentage: int = 95

# Cart Schemas
class AddCartItem(BaseModel):
    product_id: str
    qty: int = 1

class UpdateCartItem(BaseModel):
    qty: int

class CartItemDetail(BaseModel):
    product_id: str
    name: str
    slug: str
    price: float
    unit: str
    image: Optional[str] = None
    qty: int
    item_total: float

class CartResponse(BaseModel):
    items: List[CartItemDetail] = []
    subtotal: float = 0.0
    item_count: int = 0

# Delivery Zone Schemas
class DeliveryZoneCheckResponse(BaseModel):
    serviceable: bool
    pincode: str
    area_name: Optional[str] = None
    city: Optional[str] = None
    eta_minutes: Optional[int] = None
    message: str

class DeliveryZoneCreate(BaseModel):
    area_name: str
    pincode: str
    city: str
    estimated_delivery_minutes: int = 60
    is_active: bool = True

# Order Schemas
class CreateOrderRequest(BaseModel):
    delivery_address: AddressSchema
    delivery_slot_date: str
    delivery_slot_window: str = "9AM-11AM"
    payment_method: str = "cod"  # cod | stub_card | stub_upi
    promo_code: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    items: List[dict]
    subtotal: float
    delivery_fee: float
    total_amount: float
    delivery_address: AddressSchema
    delivery_slot: dict
    status: str
    payment_status: str
    source: str
    created_at: datetime
    eta_minutes: int = 60

class OrderStatusUpdate(BaseModel):
    status: str  # pending | confirmed | packed | out_for_delivery | delivered | cancelled

# Subscription Schemas
class SubscriptionCreateRequest(BaseModel):
    plan_id: str
    delivery_address: AddressSchema
    frequency: str = "weekly"

class SubscriptionResponse(BaseModel):
    id: str
    plan_name: str
    plan_price: float
    status: str
    frequency: str
    next_delivery_date: datetime
    delivery_address: AddressSchema
    start_date: datetime
    paused_until: Optional[datetime] = None

# Admin Stats Schema
class AdminStatsResponse(BaseModel):
    orders_today: int
    revenue_today: float
    total_orders: int
    total_revenue: float
    active_subscriptions: int
    low_stock_products: int
    total_users: int
