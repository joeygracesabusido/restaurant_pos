"""
Seed script to populate the database with sample menu data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

async def seed_menu():
    """Seed the database with sample menu data"""
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DATABASE_NAME]
    
    # Sample categories
    categories = [
        {"name": "Appetizers", "description": "Starters and small plates"},
        {"name": "Main Courses", "description": "Entrees and main dishes"},
        {"name": "Desserts", "description": "Sweet treats and desserts"},
        {"name": "Beverages", "description": "Drinks and beverages"},
    ]
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.menu_items.delete_many({})
    
    # Insert categories and get their IDs
    cat_result = await db.categories.insert_many(categories)
    cat_ids = {cat["name"]: str(cat_result.inserted_ids[i]) for i, cat in enumerate(categories)}
    
    # Sample menu items with emojis as "pictures"
    menu_items = [
        # Appetizers
        {
            "name": "Bruschetta",
            "description": "Toasted bread with tomato and basil",
            "price": 8.99,
            "category_id": cat_ids["Appetizers"],
            "available": True,
            "emoji": "🍞"
        },
        {
            "name": "Mozzarella Sticks",
            "description": "Golden fried mozzarella with marinara sauce",
            "price": 6.99,
            "category_id": cat_ids["Appetizers"],
            "available": True,
            "emoji": "🧀"
        },
        {
            "name": "Calamari Rings",
            "description": "Crispy fried squid rings with lemon",
            "price": 9.99,
            "category_id": cat_ids["Appetizers"],
            "available": True,
            "emoji": "🦑"
        },
        
        # Main Courses
        {
            "name": "Grilled Salmon",
            "description": "Fresh salmon fillet with herbs and lemon",
            "price": 24.99,
            "category_id": cat_ids["Main Courses"],
            "available": True,
            "emoji": "🐟"
        },
        {
            "name": "Ribeye Steak",
            "description": "Premium 12oz ribeye with garlic butter",
            "price": 34.99,
            "category_id": cat_ids["Main Courses"],
            "available": True,
            "emoji": "🥩"
        },
        {
            "name": "Chicken Parmesan",
            "description": "Breaded chicken with marinara and cheese",
            "price": 18.99,
            "category_id": cat_ids["Main Courses"],
            "available": True,
            "emoji": "🍗"
        },
        {
            "name": "Vegetarian Pasta",
            "description": "Fresh pasta with seasonal vegetables",
            "price": 14.99,
            "category_id": cat_ids["Main Courses"],
            "available": True,
            "emoji": "🍝"
        },
        {
            "name": "Burger Deluxe",
            "description": "Juicy beef burger with bacon and special sauce",
            "price": 15.99,
            "category_id": cat_ids["Main Courses"],
            "available": True,
            "emoji": "🍔",
            "sizes": [
                {"name": "Single", "price_modifier": 0.0},
                {"name": "Double", "price_modifier": 4.0}
            ],
            "addons": [
                {"name": "Extra Cheese", "price": 1.50},
                {"name": "Avocado", "price": 2.00}
            ]
        },
        
        # Desserts
        {
            "name": "Chocolate Cake",
            "description": "Rich dark chocolate layer cake",
            "price": 7.99,
            "category_id": cat_ids["Desserts"],
            "available": True,
            "emoji": "🍰"
        },
        {
            "name": "Tiramisu",
            "description": "Classic Italian dessert with mascarpone",
            "price": 8.99,
            "category_id": cat_ids["Desserts"],
            "available": True,
            "emoji": "🎂"
        },
        {
            "name": "Vanilla Ice Cream",
            "description": "Premium vanilla ice cream with sprinkles",
            "price": 5.99,
            "category_id": cat_ids["Desserts"],
            "available": True,
            "emoji": "🍦",
            "addons": [
                {"name": "Chocolate Syrup", "price": 1.00},
                {"name": "Caramel Drizzle", "price": 1.00}
            ]
        },
        {
            "name": "Cheesecake",
            "description": "New York style cheesecake with berries",
            "price": 7.99,
            "category_id": cat_ids["Desserts"],
            "available": True,
            "emoji": "🍓"
        },
        
        # Beverages
        {
            "name": "Iced Coffee",
            "description": "Cold brew coffee with ice",
            "price": 3.99,
            "category_id": cat_ids["Beverages"],
            "available": True,
            "emoji": "☕",
             "sizes": [
                {"name": "Small", "price_modifier": 0.0},
                {"name": "Medium", "price_modifier": 1.0},
                {"name": "Large", "price_modifier": 1.50}
            ],
        },
        {
            "name": "Fresh Juice",
            "description": "Orange, apple, or cranberry juice",
            "price": 4.99,
            "category_id": cat_ids["Beverages"],
            "available": True,
            "emoji": "🧃"
        },
        {
            "name": "Soft Drink",
            "description": "Coke, Sprite, or Fanta",
            "price": 2.99,
            "category_id": cat_ids["Beverages"],
            "available": True,
            "emoji": "🥤",
            "sizes": [
                {"name": "Can", "price_modifier": 0.0},
                {"name": "Bottle", "price_modifier": 1.0}
            ],
        },
        {
            "name": "Wine Glass",
            "description": "Red or white wine (5oz)",
            "price": 8.99,
            "category_id": cat_ids["Beverages"],
            "available": True,
            "emoji": "🍷"
        },
    ]
    
    # Insert menu items
    await db.menu_items.insert_many(menu_items)
    
    print("✅ Menu data seeded successfully!")
    print(f"  - {len(categories)} categories created")
    print(f"  - {len(menu_items)} menu items created")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_menu())
