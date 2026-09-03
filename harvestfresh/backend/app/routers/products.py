from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from beanie import PydanticObjectId

from app.models.models import Product, Category, User
from app.schemas.schemas import ProductCreate, ProductResponse
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])

def calculate_freshness(harvested_on: datetime) -> int:
    hours_since_harvest = (datetime.utcnow() - harvested_on).total_seconds() / 3600
    if hours_since_harvest <= 12:
        return 99
    elif hours_since_harvest <= 24:
        return 95
    elif hours_since_harvest <= 48:
        return 88
    elif hours_since_harvest <= 72:
        return 80
    return 70

@router.get("", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = Query(None, description="Category slug"),
    search: Optional[str] = Query(None, description="Search query"),
    organic: Optional[bool] = Query(None, description="Filter organic certified"),
    seasonal: Optional[bool] = Query(None, description="Filter seasonal items"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    query_conditions = [Product.is_active == True]
    
    if category:
        cat = await Category.find_one(Category.slug == category)
        if cat:
            query_conditions.append(Product.category_id == cat.id)
    
    if organic is not None:
        query_conditions.append(Product.organic_certified == organic)
        
    if seasonal is not None:
        query_conditions.append(Product.seasonal == seasonal)
        
    products = await Product.find(*query_conditions).skip(skip).limit(limit).to_list()
    
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in p.name.lower() or search_lower in p.description.lower() or any(search_lower in tag.lower() for tag in p.tags)]
        
    categories = await Category.find_all().to_list()
    cat_dict = {c.id: c.name for c in categories}
    
    return [
        ProductResponse(
            id=str(p.id),
            name=p.name,
            slug=p.slug,
            category_id=str(p.category_id) if p.category_id else None,
            category_name=cat_dict.get(p.category_id, "Fresh Produce"),
            description=p.description,
            price=p.price,
            unit=p.unit,
            stock_qty=p.stock_qty,
            organic_certified=p.organic_certified,
            seasonal=p.seasonal,
            farm_source=p.farm_source,
            harvested_on=p.harvested_on,
            images=p.images,
            tags=p.tags,
            is_active=p.is_active,
            freshness_percentage=calculate_freshness(p.harvested_on)
        ) for p in products
    ]

@router.get("/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str):
    product = await Product.find_one(Product.slug == slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    cat_name = "Fresh Produce"
    if product.category_id:
        cat = await Category.get(product.category_id)
        if cat:
            cat_name = cat.name
            
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        slug=product.slug,
        category_id=str(product.category_id) if product.category_id else None,
        category_name=cat_name,
        description=product.description,
        price=product.price,
        unit=product.unit,
        stock_qty=product.stock_qty,
        organic_certified=product.organic_certified,
        seasonal=product.seasonal,
        farm_source=product.farm_source,
        harvested_on=product.harvested_on,
        images=product.images,
        tags=product.tags,
        is_active=product.is_active,
        freshness_percentage=calculate_freshness(product.harvested_on)
    )

@router.post("", response_model=ProductResponse)
async def create_product(payload: ProductCreate, admin: User = Depends(get_current_admin)):
    existing = await Product.find_one(Product.slug == payload.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Product slug already exists")
        
    cat_id = PydanticObjectId(payload.category_id) if payload.category_id else None
    product = Product(
        name=payload.name,
        slug=payload.slug,
        category_id=cat_id,
        description=payload.description,
        price=payload.price,
        unit=payload.unit,
        stock_qty=payload.stock_qty,
        organic_certified=payload.organic_certified,
        seasonal=payload.seasonal,
        farm_source=payload.farm_source,
        images=payload.images,
        tags=payload.tags,
        is_active=payload.is_active
    )
    await product.insert()
    
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        slug=product.slug,
        category_id=str(product.category_id) if product.category_id else None,
        category_name="Fresh Produce",
        description=product.description,
        price=product.price,
        unit=product.unit,
        stock_qty=product.stock_qty,
        organic_certified=product.organic_certified,
        seasonal=product.seasonal,
        farm_source=product.farm_source,
        harvested_on=product.harvested_on,
        images=product.images,
        tags=product.tags,
        is_active=product.is_active,
        freshness_percentage=98
    )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, payload: ProductCreate, admin: User = Depends(get_current_admin)):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.name = payload.name
    product.description = payload.description
    product.price = payload.price
    product.unit = payload.unit
    product.stock_qty = payload.stock_qty
    product.organic_certified = payload.organic_certified
    product.seasonal = payload.seasonal
    product.farm_source = payload.farm_source
    product.images = payload.images
    product.tags = payload.tags
    product.is_active = payload.is_active
    if payload.category_id:
        product.category_id = PydanticObjectId(payload.category_id)
        
    await product.save()
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        slug=product.slug,
        category_id=str(product.category_id) if product.category_id else None,
        category_name="Fresh Produce",
        description=product.description,
        price=product.price,
        unit=product.unit,
        stock_qty=product.stock_qty,
        organic_certified=product.organic_certified,
        seasonal=product.seasonal,
        farm_source=product.farm_source,
        harvested_on=product.harvested_on,
        images=product.images,
        tags=product.tags,
        is_active=product.is_active,
        freshness_percentage=calculate_freshness(product.harvested_on)
    )

@router.delete("/{product_id}")
async def delete_product(product_id: str, admin: User = Depends(get_current_admin)):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    await product.save()
    return {"message": "Product soft-deleted successfully"}
