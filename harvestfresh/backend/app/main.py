import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.db.seed import seed_database
from app.tasks.scheduler import start_scheduler, shutdown_scheduler

from app.routers import (
    auth, products, categories, cart, delivery_zones,
    orders, subscriptions, payments, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    try:
        await seed_database()
    except Exception as e:
        print(f"Seed error: {e}")
    try:
        start_scheduler()
    except Exception as e:
        print(f"Scheduler start error: {e}")
    yield
    # Shutdown
    shutdown_scheduler()
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="HarvestFresh - Organic Produce Delivery Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(delivery_zones.router)
app.include_router(orders.router)
app.include_router(subscriptions.router)
app.include_router(payments.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": "/docs",
        "terra_vine_design": "v1.0"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
