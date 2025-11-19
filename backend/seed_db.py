import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from core.config import settings
from security import get_password_hash

async def seed_database():
    """Initialize database with sample data"""
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DATABASE_NAME]

    # Clear existing data
    await db.users.delete_many({})
    await db.categories.delete_many({})
    await db.menu_items.delete_many({})
    await db.orders.delete_many({})

    # Create admin user
    admin_user = {
        "email": "admin@restaurant.com",
        "full_name": "Admin User",
        "hashed_password": get_password_hash("admin123456"),
        "role": "admin"
    }
    await db.users.insert_one(admin_user)
    print("✓ Admin user created: admin@restaurant.com / admin123456")

    # Create staff user
    staff_user = {
        "email": "staff@restaurant.com",
        "full_name": "Staff User",
        "hashed_password": get_password_hash("staff123456"),
        "role": "staff"
    }
    await db.users.insert_one(staff_user)
    print("✓ Staff user created: staff@restaurant.com / staff123456")

    # Create categories
    categories_data = [
        {"name": "Appetizers", "description": "Starters and appetizers"},
        {"name": "Main Courses", "description": "Main dishes"},
        {"name": "Beverages", "description": "Drinks and beverages"},
        {"name": "Desserts", "description": "Sweet treats"},
        {"name": "Salads", "description": "Fresh salads"}
    ]
    categories = await db.categories.insert_many(categories_data)
    print(f"✓ Created {len(categories.inserted_ids)} categories")

    # Create menu items
    menu_items_data = [
        # Appetizers
        {
            "name": "Bruschetta",
            "description": "Toasted bread with tomato and garlic",
            "price": 6.99,
            "category_id": str(categories.inserted_ids[0]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Spring Rolls",
            "description": "Crispy spring rolls with sauce",
            "price": 5.99,
            "category_id": str(categories.inserted_ids[0]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Main Courses
        {
            "name": "Grilled Salmon",
            "description": "Fresh grilled salmon with vegetables",
            "price": 18.99,
            "category_id": str(categories.inserted_ids[1]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Ribeye Steak",
            "description": "Premium cut steak cooked to perfection",
            "price": 24.99,
            "category_id": str(categories.inserted_ids[1]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Chicken Parmesan",
            "description": "Crispy chicken with marinara and mozzarella",
            "price": 15.99,
            "category_id": str(categories.inserted_ids[1]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Beverages
        {
            "name": "Espresso",
            "description": "Strong espresso shot",
            "price": 3.50,
            "category_id": str(categories.inserted_ids[2]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Cappuccino",
            "description": "Espresso with steamed milk",
            "price": 4.50,
            "category_id": str(categories.inserted_ids[2]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Iced Tea",
            "description": "Refreshing iced tea",
            "price": 3.99,
            "category_id": str(categories.inserted_ids[2]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Desserts
        {
            "name": "Chocolate Cake",
            "description": "Rich chocolate cake with ganache",
            "price": 7.99,
            "category_id": str(categories.inserted_ids[3]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Tiramisu",
            "description": "Classic Italian dessert",
            "price": 6.99,
            "category_id": str(categories.inserted_ids[3]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Salads
        {
            "name": "Caesar Salad",
            "description": "Crisp romaine with Caesar dressing",
            "price": 9.99,
            "category_id": str(categories.inserted_ids[4]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Greek Salad",
            "description": "Fresh vegetables with feta cheese",
            "price": 10.99,
            "category_id": str(categories.inserted_ids[4]),
            "available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    items = await db.menu_items.insert_many(menu_items_data)
    print(f"✓ Created {len(items.inserted_ids)} menu items")

    print("\n✓ Database seeding completed successfully!")
    print("\nYou can now login with:")
    print("  Admin: admin@restaurant.com / admin123456")
    print("  Staff: staff@restaurant.com / staff123456")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
