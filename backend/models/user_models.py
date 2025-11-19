from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"

class UserBase(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    full_name: Optional[str] = Field(None, example="John Doe")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, example="strongpassword123")
    role: UserRole = Field(UserRole.STAFF, example="staff")

class UserInDBBase(UserBase):
    id: str = Field(..., alias="_id")
    role: UserRole = Field(..., example="staff")

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True


class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
