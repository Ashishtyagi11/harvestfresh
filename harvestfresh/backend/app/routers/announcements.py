from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId

from app.models.models import Announcement, User
from app.schemas.schemas import AnnouncementCreate, AnnouncementResponse
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/announcements", tags=["Announcements & Sales"])

@router.get("/active", response_model=List[AnnouncementResponse])
async def get_active_announcements():
    """Public endpoint for customer storefront banners"""
    announcements = await Announcement.find(Announcement.is_active == True).sort("-created_at").to_list()
    return [
        AnnouncementResponse(
            id=str(a.id),
            title=a.title,
            message=a.message,
            promo_code=a.promo_code,
            discount_percentage=a.discount_percentage,
            banner_type=a.banner_type,
            target_page=a.target_page,
            is_active=a.is_active,
            bg_gradient=a.bg_gradient,
            created_at=a.created_at
        ) for a in announcements
    ]

@router.get("", response_model=List[AnnouncementResponse])
async def list_announcements(admin: User = Depends(get_current_admin)):
    """Admin endpoint to list all sales announcements"""
    announcements = await Announcement.find_all().sort("-created_at").to_list()
    return [
        AnnouncementResponse(
            id=str(a.id),
            title=a.title,
            message=a.message,
            promo_code=a.promo_code,
            discount_percentage=a.discount_percentage,
            banner_type=a.banner_type,
            target_page=a.target_page,
            is_active=a.is_active,
            bg_gradient=a.bg_gradient,
            created_at=a.created_at
        ) for a in announcements
    ]

@router.post("", response_model=AnnouncementResponse)
async def create_announcement(
    payload: AnnouncementCreate,
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to create a sales announcement / promo banner"""
    announcement = Announcement(
        title=payload.title.strip(),
        message=payload.message.strip(),
        promo_code=payload.promo_code.strip() if payload.promo_code else None,
        discount_percentage=payload.discount_percentage,
        banner_type=payload.banner_type,
        target_page=payload.target_page,
        is_active=payload.is_active,
        bg_gradient=payload.bg_gradient
    )
    await announcement.insert()
    return AnnouncementResponse(
        id=str(announcement.id),
        title=announcement.title,
        message=announcement.message,
        promo_code=announcement.promo_code,
        discount_percentage=announcement.discount_percentage,
        banner_type=announcement.banner_type,
        target_page=announcement.target_page,
        is_active=announcement.is_active,
        bg_gradient=announcement.bg_gradient,
        created_at=announcement.created_at
    )

@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: str,
    payload: AnnouncementCreate,
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to edit a sales announcement"""
    announcement = await Announcement.get(PydanticObjectId(announcement_id))
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    announcement.title = payload.title.strip()
    announcement.message = payload.message.strip()
    announcement.promo_code = payload.promo_code.strip() if payload.promo_code else None
    announcement.discount_percentage = payload.discount_percentage
    announcement.banner_type = payload.banner_type
    announcement.target_page = payload.target_page
    announcement.is_active = payload.is_active
    announcement.bg_gradient = payload.bg_gradient
    
    await announcement.save()
    return AnnouncementResponse(
        id=str(announcement.id),
        title=announcement.title,
        message=announcement.message,
        promo_code=announcement.promo_code,
        discount_percentage=announcement.discount_percentage,
        banner_type=announcement.banner_type,
        target_page=announcement.target_page,
        is_active=announcement.is_active,
        bg_gradient=announcement.bg_gradient,
        created_at=announcement.created_at
    )

@router.patch("/{announcement_id}/toggle", response_model=dict)
async def toggle_announcement(
    announcement_id: str,
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to toggle active status of a banner"""
    announcement = await Announcement.get(PydanticObjectId(announcement_id))
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    announcement.is_active = not announcement.is_active
    await announcement.save()
    return {"message": f"Announcement active status set to {announcement.is_active}", "is_active": announcement.is_active}

@router.delete("/{announcement_id}", response_model=dict)
async def delete_announcement(
    announcement_id: str,
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to delete a sales announcement"""
    announcement = await Announcement.get(PydanticObjectId(announcement_id))
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    await announcement.delete()
    return {"message": "Announcement deleted successfully"}
