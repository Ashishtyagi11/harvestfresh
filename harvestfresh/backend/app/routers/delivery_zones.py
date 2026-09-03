from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from beanie import PydanticObjectId

from app.models.models import DeliveryZone, User
from app.schemas.schemas import DeliveryZoneCheckResponse, DeliveryZoneCreate
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/delivery-zones", tags=["Delivery Zones"])

@router.get("/check", response_model=DeliveryZoneCheckResponse)
async def check_pincode(pincode: str = Query(..., description="6-digit postal code")):
    clean_pincode = pincode.strip()
    zone = await DeliveryZone.find_one(DeliveryZone.pincode == clean_pincode, DeliveryZone.is_active == True)
    
    if zone:
        return DeliveryZoneCheckResponse(
            serviceable=True,
            pincode=zone.pincode,
            area_name=zone.area_name,
            city=zone.city,
            eta_minutes=zone.estimated_delivery_minutes,
            message=f"Guaranteed delivery in under {zone.estimated_delivery_minutes} minutes to {zone.area_name}, {zone.city}!"
        )
    else:
        return DeliveryZoneCheckResponse(
            serviceable=False,
            pincode=clean_pincode,
            message=f"Pincode {clean_pincode} is not in our direct 60-minute harvest delivery coverage zone yet."
        )

@router.get("", response_model=List[DeliveryZone])
async def list_delivery_zones():
    zones = await DeliveryZone.find_all().to_list()
    return zones

@router.post("", response_model=DeliveryZone)
async def create_delivery_zone(payload: DeliveryZoneCreate, admin: User = Depends(get_current_admin)):
    existing = await DeliveryZone.find_one(DeliveryZone.pincode == payload.pincode)
    if existing:
        raise HTTPException(status_code=400, detail="Delivery zone for this pincode already exists")
        
    zone = DeliveryZone(
        area_name=payload.area_name,
        pincode=payload.pincode,
        city=payload.city,
        estimated_delivery_minutes=payload.estimated_delivery_minutes,
        is_active=payload.is_active
    )
    await zone.insert()
    return zone
