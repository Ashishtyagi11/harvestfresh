from typing import List
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId

from app.models.models import Category, User
from app.schemas.schemas import CategoryCreate, CategoryResponse
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
async def list_categories():
    categories = await Category.find_all().to_list()
    return [
        CategoryResponse(
            id=str(c.id),
            name=c.name,
            slug=c.slug,
            parent_id=str(c.parent_id) if c.parent_id else None
        ) for c in categories
    ]

@router.post("", response_model=CategoryResponse)
async def create_category(payload: CategoryCreate, admin: User = Depends(get_current_admin)):
    existing = await Category.find_one(Category.slug == payload.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    parent_obj_id = PydanticObjectId(payload.parent_id) if payload.parent_id else None
    cat = Category(name=payload.name, slug=payload.slug, parent_id=parent_obj_id)
    await cat.insert()
    
    return CategoryResponse(
        id=str(cat.id),
        name=cat.name,
        slug=cat.slug,
        parent_id=str(cat.parent_id) if cat.parent_id else None
    )
