from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from beanie import Document, Indexed, PydanticObjectId

class Address(BaseModel):
    label: str = "Home"
    line1: str
    pincode: str
    city: str
    lat: Optional[float] = 0.0
    lng: Optional[float] = 0.0
    is_default: bool = True

class User(Document):
    phone: Indexed(str, unique=True)
    name: str = "Fresh Customer"
    email: Optional[str] = None
    role: str = "customer"  # "customer" | "admin"
    approval_status: str = "approved"  # "pending" | "approved" | "rejected"
    is_active: bool = True
    account_type: str = "retail"  # "retail" | "wholesale" | "vip"
    addresses: List[Address] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

class OTPSession(Document):
    phone: Indexed(str)
    otp_hash: str
    expires_at: datetime
    verified: bool = False
    attempts: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "otp_sessions"

class Category(Document):
    name: str
    slug: Indexed(str, unique=True)
    parent_id: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "categories"

class Product(Document):
    name: str
    slug: Indexed(str, unique=True)
    category_id: Optional[Indexed(PydanticObjectId)] = None
    description: str
    price: float
    original_price: Optional[float] = None
    is_on_sale: bool = False
    unit: str = "500g"
    stock_qty: int = 100
    organic_certified: bool = True
    seasonal: bool = False
    farm_source: str = "Green Valley Organic Farm"
    harvested_on: datetime = Field(default_factory=datetime.utcnow)
    images: List[str] = []
    tags: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "products"

class Announcement(Document):
    title: str
    message: str
    promo_code: Optional[str] = None
    discount_percentage: Optional[float] = None
    banner_type: str = "sale"  # "sale" | "flash_deal" | "delivery_alert" | "harvest_special"
    target_page: str = "all"   # "all" | "shop" | "home"
    is_active: bool = True
    bg_gradient: str = "from-emerald-700 via-teal-800 to-emerald-900"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "announcements"

class CartItem(BaseModel):
    product_id: PydanticObjectId
    qty: int = 1
    price_at_add: float

class Cart(Document):
    user_id: Indexed(PydanticObjectId, unique=True)
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "carts"

class OrderItem(BaseModel):
    product_id: PydanticObjectId
    name: str
    qty: int
    price: float

class DeliverySlot(BaseModel):
    date: str
    window: str = "9AM-11AM"

class Order(Document):
    user_id: Indexed(PydanticObjectId)
    order_number: str
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float = 0.0
    total_amount: float
    delivery_address: Address
    delivery_slot: DeliverySlot
    status: Indexed(str) = "pending"  # pending | confirmed | packed | out_for_delivery | delivered | cancelled
    payment_status: str = "pending"  # pending | paid | failed | cod
    source: str = "one_time"  # one_time | subscription
    subscription_id: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"

class SubscriptionPlan(Document):
    name: str
    description: str
    price: float
    frequency: str = "weekly"  # daily | weekly | monthly
    included_items_value: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "subscription_plans"

class Subscription(Document):
    user_id: Indexed(PydanticObjectId)
    plan_id: PydanticObjectId
    status: str = "active"  # active | paused | cancelled
    delivery_address: Address
    frequency: str = "weekly"
    next_delivery_date: datetime
    start_date: datetime = Field(default_factory=datetime.utcnow)
    paused_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "subscriptions"

class DeliveryZone(Document):
    area_name: str
    pincode: Indexed(str, unique=True)
    city: str
    estimated_delivery_minutes: int = 60
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "delivery_zones"

class Payment(Document):
    user_id: PydanticObjectId
    order_id: Optional[PydanticObjectId] = None
    subscription_id: Optional[PydanticObjectId] = None
    amount: float
    method: str = "cod"  # cod | card_stub | upi_stub
    status: str = "pending"  # pending | success | failed
    gateway_ref: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "payments"
