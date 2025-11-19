from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import List

from core.database import get_database
from dependencies import get_current_user, get_current_admin_user
from models.user_models import User
from models.pos_models import (
    Order, OrderCreate, OrderUpdate, OrderStatus, PaymentCreate, Payment
)

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"],
)

# ============= Order Routes =============

@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new order.
    """
    # Fetch menu items and calculate total
    total_amount = 0
    order_items = []
    
    for item_in in order_in.items:
        try:
            menu_item_id = ObjectId(item_in.menu_item_id)
        except:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid menu item ID")
        
        menu_item = await db.menu_items.find_one({"_id": menu_item_id})
        if not menu_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Menu item not found")
        
        if not menu_item.get("available", True):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Menu item {menu_item['name']} is not available")
        
        subtotal = menu_item["price"] * item_in.quantity
        total_amount += subtotal
        
        order_items.append({
            "menu_item_id": str(menu_item_id),
            "quantity": item_in.quantity,
            "special_instructions": item_in.special_instructions,
            "price_per_item": menu_item["price"],
            "subtotal": subtotal
        })
    
    order_data = {
        "items": order_items,
        "status": OrderStatus.PENDING,
        "table_number": order_in.table_number,
        "customer_name": order_in.customer_name,
        "notes": order_in.notes,
        "total_amount": total_amount,
        "payment": None,
        "created_by": str(current_user.id),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(order_data)
    created_order = await db.orders.find_one({"_id": result.inserted_id})
    
    return Order(**created_order, id=str(created_order["_id"]))


@router.get("", response_model=List[Order])
async def list_orders(
    status_filter: OrderStatus = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Get all orders, optionally filtered by status.
    """
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    orders = await db.orders.find(query).sort("created_at", -1).to_list(None)
    return [Order(**order, id=str(order["_id"])) for order in orders]


@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific order.
    """
    try:
        obj_id = ObjectId(order_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order ID")
    
    order = await db.orders.find_one({"_id": obj_id})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    return Order(**order, id=str(order["_id"]))


@router.put("/{order_id}", response_model=Order)
async def update_order(
    order_id: str,
    order_in: OrderUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Update an order status or details.
    """
    try:
        obj_id = ObjectId(order_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order ID")
    
    order_data = order_in.dict(exclude_unset=True)
    order_data["updated_at"] = datetime.utcnow()
    
    result = await db.orders.update_one({"_id": obj_id}, {"$set": order_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    updated_order = await db.orders.find_one({"_id": obj_id})
    return Order(**updated_order, id=str(updated_order["_id"]))


@router.put("/{order_id}/status/{new_status}", response_model=Order)
async def update_order_status(
    order_id: str,
    new_status: OrderStatus,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Update order status (e.g., pending -> preparing -> ready -> completed).
    """
    try:
        obj_id = ObjectId(order_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order ID")
    
    result = await db.orders.update_one(
        {"_id": obj_id},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    updated_order = await db.orders.find_one({"_id": obj_id})
    return Order(**updated_order, id=str(updated_order["_id"]))


@router.post("/{order_id}/payment", response_model=Order)
async def pay_order(
    order_id: str,
    payment_in: PaymentCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Process payment for an order.
    """
    try:
        obj_id = ObjectId(order_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order ID")
    
    order = await db.orders.find_one({"_id": obj_id})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Validate payment amount matches order total
    if payment_in.amount < order["total_amount"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount ({payment_in.amount}) is less than order total ({order['total_amount']})"
        )
    
    payment = {
        "method": payment_in.method,
        "amount": payment_in.amount,
        "paid_at": datetime.utcnow()
    }
    
    result = await db.orders.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "payment": payment,
                "status": OrderStatus.COMPLETED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    updated_order = await db.orders.find_one({"_id": obj_id})
    return Order(**updated_order, id=str(updated_order["_id"]))


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_order(
    order_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel an order (soft delete - mark as cancelled).
    """
    try:
        obj_id = ObjectId(order_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order ID")
    
    result = await db.orders.update_one(
        {"_id": obj_id},
        {"$set": {"status": OrderStatus.CANCELLED, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
