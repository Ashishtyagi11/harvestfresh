from datetime import datetime, timedelta
from app.models.models import Category, Product, DeliveryZone, SubscriptionPlan, User, Address

async def seed_database():
    # 1. Seed Categories
    if await Category.find_all().count() == 0:
        categories_data = [
            {"name": "Leafy Greens", "slug": "leafy-greens"},
            {"name": "Root Vegetables", "slug": "root-vegetables"},
            {"name": "Organic Fruits", "slug": "organic-fruits"},
            {"name": "Herbs & Microgreens", "slug": "herbs-microgreens"},
            {"name": "Farm Eggs & Dairy", "slug": "eggs-dairy"}
        ]
        cat_map = {}
        for cdata in categories_data:
            cat = Category(**cdata)
            await cat.insert()
            cat_map[cat.slug] = cat.id
        print("Seeded Categories.")
    else:
        cats = await Category.find_all().to_list()
        cat_map = {c.slug: c.id for c in cats}

    # 2. Seed Products
    if await Product.find_all().count() == 0:
        products_data = [
            {
                "name": "Organic Heirloom Carrots",
                "slug": "organic-heirloom-carrots",
                "category_id": cat_map.get("root-vegetables"),
                "description": "Sweet, vibrant multi-colored heirloom carrots freshly harvested from soil rich in organic compost. Perfect for roasting, dipping, or raw crunching.",
                "price": 89.0,
                "unit": "500g",
                "stock_qty": 120,
                "organic_certified": True,
                "seasonal": True,
                "farm_source": "Sunburst Organic Farm, Valley Ridge",
                "harvested_on": datetime.utcnow() - timedelta(hours=6),
                "images": ["https://images.unsplash.com/photo-1598170845058-12f6a6723223?q=80&w=800&auto=format&fit=crop"],
                "tags": ["Gluten-Free", "Local", "Non-GMO", "High Vitamin A"],
                "is_active": True
            },
            {
                "name": "Fresh Baby Spinach",
                "slug": "fresh-baby-spinach",
                "category_id": cat_map.get("leafy-greens"),
                "description": "Tender, iron-rich baby spinach leaves harvested at dawn. Crisp, nutrient-dense, and ready for salads or morning green smoothies.",
                "price": 65.0,
                "unit": "250g bundle",
                "stock_qty": 85,
                "organic_certified": True,
                "seasonal": False,
                "farm_source": "Green Leaf Acres, Metro Outskirts",
                "harvested_on": datetime.utcnow() - timedelta(hours=4),
                "images": ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800&auto=format&fit=crop"],
                "tags": ["Organic", "Superfood", "Local"],
                "is_active": True
            },
            {
                "name": "Wild Honeycrisp Apples",
                "slug": "wild-honeycrisp-apples",
                "category_id": cat_map.get("organic-fruits"),
                "description": "Explosively crisp and naturally sweet apples picked directly from pesticide-free high-altitude orchards.",
                "price": 140.0,
                "unit": "1 kg",
                "stock_qty": 60,
                "organic_certified": True,
                "seasonal": True,
                "farm_source": "Highland Orchard Co.",
                "harvested_on": datetime.utcnow() - timedelta(hours=18),
                "images": ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=800&auto=format&fit=crop"],
                "tags": ["Seasonal", "Sweet", "Pesticide-Free"],
                "is_active": True
            },
            {
                "name": "Hydroponic Basil & Rosemary",
                "slug": "hydroponic-basil-rosemary",
                "category_id": cat_map.get("herbs-microgreens"),
                "description": "Aromatic Italian basil and woodsy rosemary cut fresh with roots preserved for maximum fragrance and longevity.",
                "price": 45.0,
                "unit": "100g pack",
                "stock_qty": 40,
                "organic_certified": True,
                "seasonal": False,
                "farm_source": "PureWater Hydroponics",
                "harvested_on": datetime.utcnow() - timedelta(hours=2),
                "images": ["https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=800&auto=format&fit=crop"],
                "tags": ["Aromatic", "Fresh Cut", "Herbal"],
                "is_active": True
            },
            {
                "name": "Pasture-Raised Organic Eggs",
                "slug": "pasture-raised-organic-eggs",
                "category_id": cat_map.get("eggs-dairy"),
                "description": "Farm-fresh eggs with rich golden yolks from free-roaming, pasture-fed heirloom hens.",
                "price": 120.0,
                "unit": "Pack of 6",
                "stock_qty": 50,
                "organic_certified": True,
                "seasonal": False,
                "farm_source": "Happy Hen Homestead",
                "harvested_on": datetime.utcnow() - timedelta(hours=12),
                "images": ["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=800&auto=format&fit=crop"],
                "tags": ["Pasture-Raised", "High Protein"],
                "is_active": True
            },
            {
                "name": "Vine-Ripened Cherry Tomatoes",
                "slug": "vine-ripened-cherry-tomatoes",
                "category_id": cat_map.get("root-vegetables"),
                "description": "Bursting with sun-kissed sweetness, these organic cherry tomatoes remain attached to their fragrant green vine.",
                "price": 95.0,
                "unit": "400g box",
                "stock_qty": 90,
                "organic_certified": True,
                "seasonal": True,
                "farm_source": "Terra Vine Estate",
                "harvested_on": datetime.utcnow() - timedelta(hours=5),
                "images": ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop"],
                "tags": ["Vine-Ripened", "Organic", "Juicy"],
                "is_active": True
            }
        ]
        for pdata in products_data:
            prod = Product(**pdata)
            await prod.insert()
        print("Seeded Products.")

    # 3. Seed Delivery Zones
    if await DeliveryZone.find_all().count() == 0:
        zones_data = [
            {"area_name": "Indiranagar & Koramangala", "pincode": "560038", "city": "Bengaluru", "estimated_delivery_minutes": 45},
            {"area_name": "Whitefield & ITPL", "pincode": "560066", "city": "Bengaluru", "estimated_delivery_minutes": 60},
            {"area_name": "Jayanagar & JP Nagar", "pincode": "560041", "city": "Bengaluru", "estimated_delivery_minutes": 50},
            {"area_name": "Central Business District", "pincode": "560001", "city": "Bengaluru", "estimated_delivery_minutes": 35},
            {"area_name": "Bandra & Khar", "pincode": "400050", "city": "Mumbai", "estimated_delivery_minutes": 55},
            {"area_name": "South Delhi & Connaught Place", "pincode": "110001", "city": "New Delhi", "estimated_delivery_minutes": 60}
        ]
        for zdata in zones_data:
            z = DeliveryZone(**zdata)
            await z.insert()
        print("Seeded Delivery Zones.")

    # 4. Seed Subscription Plans
    if await SubscriptionPlan.find_all().count() == 0:
        plans_data = [
            {
                "name": "Weekly Veggie Pass",
                "description": "Weekly curated basket of 7+ seasonal organic vegetables and greens delivered straight from our partner farms.",
                "price": 899.0,
                "frequency": "weekly",
                "included_items_value": 1200.0
            },
            {
                "name": "Family Harvest Pass",
                "description": "Complete weekly organic food supply: fruits, vegetables, microgreens, and farm-fresh eggs for a family of 4.",
                "price": 1499.0,
                "frequency": "weekly",
                "included_items_value": 2100.0
            },
            {
                "name": "Monthly Organic VIP Pass",
                "description": "Unlimited zero-fee express deliveries, priority morning slots, 15% bonus credit, and monthly rare heirloom harvest basket.",
                "price": 2999.0,
                "frequency": "monthly",
                "included_items_value": 4500.0
            }
        ]
        for pndata in plans_data:
            sp = SubscriptionPlan(**pndata)
            await sp.insert()
        print("Seeded Subscription Plans.")

    # 5. Seed Admin User
    admin_phone = "9999999999"
    admin_user = await User.find_one(User.phone == admin_phone)
    if not admin_user:
        admin_user = User(
            phone=admin_phone,
            name="Terra Admin",
            email="admin@harvestfresh.com",
            role="admin",
            addresses=[
                Address(label="Headquarters", line1="100 Feet Road, Indiranagar", pincode="560038", city="Bengaluru")
            ]
        )
        await admin_user.insert()
        print(f"Seeded Admin User: {admin_phone}")
