from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class OrderStatus(str, Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    DIGITAL = "digital"

# ============= Category Models =============

class CategoryBase(BaseModel):
    name: str = Field(..., example="Beverages")
    description: Optional[str] = Field(None, example="All drinks")

class CategoryCreate(CategoryBase):
    pass

class CategoryInDBBase(CategoryBase):
    id: str

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

class Category(CategoryInDBBase):
    pass

# ============= Menu Item Models =============

class MenuItemBase(BaseModel):
    name: str = Field(..., example="Burger")
    description: Optional[str] = Field(None, example="Delicious beef burger")
    price: float = Field(..., gt=0, example=9.99)
    category_id: str = Field(..., example="507f1f77bcf86cd799439011")
    available: bool = Field(default=True, example=True)
    image_url: Optional[str] = Field(None, example="/api/uploads/images/burger.jpg")
    emoji: Optional[str] = Field(None, example="🍔")

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category_id: Optional[str] = None
    available: Optional[bool] = None
    image_url: Optional[str] = None
    emoji: Optional[str] = None

class MenuItemInDBBase(MenuItemBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

class MenuItem(MenuItemInDBBase):
    pass

# ============= Order Item Models =============

class OrderItemBase(BaseModel):
    menu_item_id: str = Field(..., example="507f1f77bcf86cd799439011")
    quantity: int = Field(..., gt=0, example=2)
    special_instructions: Optional[str] = Field(None, example="No onions")

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemInDBBase(OrderItemBase):
    price_per_item: float = Field(..., gt=0, example=9.99)
    subtotal: float = Field(..., gt=0, example=19.98)

class OrderItem(OrderItemInDBBase):
    pass

# ============= Payment Models =============

class PaymentBase(BaseModel):
    method: PaymentMethod = Field(..., example="cash")
    amount: float = Field(..., gt=0, example=99.99)

class PaymentCreate(PaymentBase):
    pass

class PaymentInDBBase(PaymentBase):
    id: Optional[str] = None
    paid_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

class Payment(PaymentInDBBase):
    pass

# ============= Order Models =============

class OrderBase(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_items=1)
    table_number: Optional[int] = Field(None, example=5)
    customer_name: Optional[str] = Field(None, example="John Doe")
    notes: Optional[str] = Field(None, example="Urgent order")

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    items: Optional[List[OrderItemCreate]] = None
    table_number: Optional[int] = None
    notes: Optional[str] = None

class OrderInDBBase(BaseModel):
    id: str
    items: List[OrderItem]
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    table_number: Optional[int] = None
    customer_name: Optional[str] = None
    notes: Optional[str] = None
    total_amount: float = Field(..., gt=0)
    payment: Optional[Payment] = None
    created_by: str  # user_id who created the order
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

class Order(OrderInDBBase):
    pass
