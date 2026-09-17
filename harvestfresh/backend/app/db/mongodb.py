import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        tls=True,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True
    )
    database = db.client[settings.DATABASE_NAME]
    
    # Import document models
    from app.models.models import (
        User, OTPSession, Category, Product, Cart, Order,
        SubscriptionPlan, Subscription, DeliveryZone, Payment
    )
    
    await init_beanie(
        database=database,
        document_models=[
            User, OTPSession, Category, Product, Cart, Order,
            SubscriptionPlan, Subscription, DeliveryZone, Payment
        ]
    )
    print(f"Connected to MongoDB database: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection.")
