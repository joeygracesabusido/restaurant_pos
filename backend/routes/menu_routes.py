from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

from core.database import get_database
from dependencies import get_current_admin_user
from models.user_models import User
from models.pos_models import (
    Category, CategoryCreate, MenuItem, MenuItemCreate, MenuItemUpdate
)
from file_handler import save_menu_image

router = APIRouter(
    prefix="/api/menu",
    tags=["Menu Management"],
)

# ============= Category Routes =============

@router.post("/categories", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Create a new menu category. Admin only.
    """
    category_data = category_in.dict()
    result = await db.categories.insert_one(category_data)
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    created_category["id"] = str(created_category["_id"])
    return Category(**created_category)


@router.get("/categories", response_model=list[Category])
async def list_categories(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get all menu categories. Admin only.
    """
    categories = await db.categories.find().to_list(None)
    return [Category(**cat, id=str(cat["_id"])) for cat in categories]


@router.get("/categories/public", response_model=list[Category])
async def list_categories_public(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all menu categories (public endpoint).
    """
    categories = await db.categories.find().to_list(None)
    return [Category(**cat, id=str(cat["_id"])) for cat in categories]


@router.get("/categories/{category_id}", response_model=Category)
async def get_category(
    category_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get a specific menu category. Admin only.
    """
    try:
        obj_id = ObjectId(category_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
    
    category = await db.categories.find_one({"_id": obj_id})
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    category["id"] = str(category["_id"])
    return Category(**category)


@router.put("/categories/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_in: CategoryCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update a menu category. Admin only.
    """
    try:
        obj_id = ObjectId(category_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
    
    category_data = category_in.dict()
    result = await db.categories.update_one({"_id": obj_id}, {"$set": category_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    updated_category = await db.categories.find_one({"_id": obj_id})
    updated_category["id"] = str(updated_category["_id"])
    return Category(**updated_category)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Delete a menu category. Admin only.
    """
    try:
        obj_id = ObjectId(category_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
    
    result = await db.categories.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")


# ============= Menu Item Routes =============

@router.post("/items", response_model=MenuItem, status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    item_in: MenuItemCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Create a new menu item. Admin only.
    """
    item_data = item_in.dict()
    item_data["created_at"] = datetime.utcnow()
    item_data["updated_at"] = datetime.utcnow()
    
    result = await db.menu_items.insert_one(item_data)
    created_item = await db.menu_items.find_one({"_id": result.inserted_id})
    
    if created_item:
        created_item["id"] = str(created_item["_id"])
    
    return MenuItem(**created_item)


@router.get("/items", response_model=list[MenuItem])
async def list_menu_items(
    category_id: str = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all menu items, optionally filtered by category.
    """
    query = {}
    if category_id:
        query["category_id"] = category_id
    
    items = await db.menu_items.find(query).to_list(None)
    print(f"Found {len(items)} items in the database.")
    
    processed_items = []
    for item_doc in items:
        item_doc["id"] = str(item_doc["_id"])
        processed_items.append(MenuItem(**item_doc))
    return processed_items


@router.get("/items/{item_id}", response_model=MenuItem)
async def get_menu_item(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific menu item.
    """
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item ID")
    
    item = await db.menu_items.find_one({"_id": obj_id})
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    
    item["id"] = str(item["_id"])
    return MenuItem(**item)


@router.put("/items/{item_id}", response_model=MenuItem)
async def update_menu_item(
    item_id: str,
    item_in: MenuItemUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update a menu item. Admin only.
    """
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item ID")
    
    item_data = item_in.dict(exclude_unset=True)
    item_data["updated_at"] = datetime.utcnow()
    
    result = await db.menu_items.update_one({"_id": obj_id}, {"$set": item_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    
    updated_item = await db.menu_items.find_one({"_id": obj_id})
    updated_item["id"] = str(updated_item["_id"])
    return MenuItem(**updated_item)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Delete a menu item. Admin only.
    """
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item ID")
    
    result = await db.menu_items.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")


# ============= Image Upload Route =============

@router.post("/upload-image")
async def upload_menu_image(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Upload an image for a menu item. Admin only.
    Returns the image URL path.
    """
    image_url = await save_menu_image(file)
    return {
        "url": image_url,
        "filename": file.filename,
        "message": "Image uploaded successfully"
    }
