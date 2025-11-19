# API Testing Guide

This document provides examples of how to test the POS Restaurant API.

## Base URL
```
http://localhost:8000
```

## Authentication

Most endpoints require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## Endpoints

### 1. Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@restaurant.com",
  "full_name": "New User",
  "password": "securepassword123",
  "role": "staff"
}

Response (201):
{
  "id": "507f1f77bcf86cd799439011",
  "email": "newuser@restaurant.com",
  "full_name": "New User",
  "role": "staff"
}
```

#### Login
```
POST /api/auth/token
Content-Type: application/x-www-form-urlencoded

username=admin@restaurant.com&password=admin123456

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 2. User Endpoints

#### Get Current User
```
GET /api/users/me
Authorization: Bearer <token>

Response (200):
{
  "id": "507f1f77bcf86cd799439011",
  "email": "admin@restaurant.com",
  "full_name": "Admin User",
  "role": "admin"
}
```

### 3. Menu Category Endpoints

#### Create Category (Admin Only)
```
POST /api/menu/categories
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Beverages",
  "description": "All drinks and beverages"
}

Response (201):
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Beverages",
  "description": "All drinks and beverages"
}
```

#### List Categories (Public)
```
GET /api/menu/categories/public

Response (200):
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Beverages",
    "description": "All drinks and beverages"
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "name": "Main Courses",
    "description": "Main dishes"
  }
]
```

#### Get Category Details (Admin Only)
```
GET /api/menu/categories/{category_id}
Authorization: Bearer <admin_token>

Response (200):
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Beverages",
  "description": "All drinks and beverages"
}
```

#### Update Category (Admin Only)
```
PUT /api/menu/categories/{category_id}
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Hot Beverages",
  "description": "Hot drinks only"
}

Response (200):
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Hot Beverages",
  "description": "Hot drinks only"
}
```

#### Delete Category (Admin Only)
```
DELETE /api/menu/categories/{category_id}
Authorization: Bearer <admin_token>

Response (204): No content
```

### 4. Menu Item Endpoints

#### Create Menu Item (Admin Only)
```
POST /api/menu/items
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Espresso",
  "description": "Strong espresso shot",
  "price": 3.50,
  "category_id": "507f1f77bcf86cd799439012",
  "available": true
}

Response (201):
{
  "id": "507f1f77bcf86cd799439014",
  "name": "Espresso",
  "description": "Strong espresso shot",
  "price": 3.50,
  "category_id": "507f1f77bcf86cd799439012",
  "available": true,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### List Menu Items
```
GET /api/menu/items
GET /api/menu/items?category_id=507f1f77bcf86cd799439012

Response (200):
[
  {
    "id": "507f1f77bcf86cd799439014",
    "name": "Espresso",
    "description": "Strong espresso shot",
    "price": 3.50,
    "category_id": "507f1f77bcf86cd799439012",
    "available": true,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
]
```

#### Get Menu Item Details
```
GET /api/menu/items/{item_id}

Response (200):
{
  "id": "507f1f77bcf86cd799439014",
  "name": "Espresso",
  "description": "Strong espresso shot",
  "price": 3.50,
  "category_id": "507f1f77bcf86cd799439012",
  "available": true,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### Update Menu Item (Admin Only)
```
PUT /api/menu/items/{item_id}
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "price": 4.00,
  "available": false
}

Response (200):
{
  "id": "507f1f77bcf86cd799439014",
  "name": "Espresso",
  "description": "Strong espresso shot",
  "price": 4.00,
  "category_id": "507f1f77bcf86cd799439012",
  "available": false,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:30:00"
}
```

#### Delete Menu Item (Admin Only)
```
DELETE /api/menu/items/{item_id}
Authorization: Bearer <admin_token>

Response (204): No content
```

### 5. Order Endpoints

#### Create Order
```
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "items": [
    {
      "menu_item_id": "507f1f77bcf86cd799439014",
      "quantity": 2,
      "special_instructions": "Extra hot"
    },
    {
      "menu_item_id": "507f1f77bcf86cd799439015",
      "quantity": 1,
      "special_instructions": null
    }
  ],
  "table_number": 5,
  "customer_name": "John Doe",
  "notes": "Urgent"
}

Response (201):
{
  "id": "507f1f77bcf86cd799439020",
  "items": [
    {
      "menu_item_id": "507f1f77bcf86cd799439014",
      "quantity": 2,
      "special_instructions": "Extra hot",
      "price_per_item": 3.50,
      "subtotal": 7.00
    },
    {
      "menu_item_id": "507f1f77bcf86cd799439015",
      "quantity": 1,
      "special_instructions": null,
      "price_per_item": 5.99,
      "subtotal": 5.99
    }
  ],
  "status": "pending",
  "table_number": 5,
  "customer_name": "John Doe",
  "notes": "Urgent",
  "total_amount": 12.99,
  "payment": null,
  "created_by": "507f1f77bcf86cd799439011",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### List Orders
```
GET /api/orders
GET /api/orders?status_filter=pending
Authorization: Bearer <token>

Response (200):
[
  {
    "id": "507f1f77bcf86cd799439020",
    "items": [...],
    "status": "pending",
    "table_number": 5,
    "customer_name": "John Doe",
    "notes": "Urgent",
    "total_amount": 12.99,
    "payment": null,
    "created_by": "507f1f77bcf86cd799439011",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
]
```

#### Get Order Details
```
GET /api/orders/{order_id}
Authorization: Bearer <token>

Response (200):
{
  "id": "507f1f77bcf86cd799439020",
  "items": [...],
  "status": "pending",
  "table_number": 5,
  "customer_name": "John Doe",
  "notes": "Urgent",
  "total_amount": 12.99,
  "payment": null,
  "created_by": "507f1f77bcf86cd799439011",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### Update Order
```
PUT /api/orders/{order_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "table_number": 7,
  "notes": "Updated notes"
}

Response (200):
{
  "id": "507f1f77bcf86cd799439020",
  "items": [...],
  "status": "pending",
  "table_number": 7,
  "customer_name": "John Doe",
  "notes": "Updated notes",
  "total_amount": 12.99,
  "payment": null,
  "created_by": "507f1f77bcf86cd799439011",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:30:00"
}
```

#### Update Order Status
```
PUT /api/orders/{order_id}/status/{new_status}
Authorization: Bearer <token>

Status options: pending, preparing, ready, completed, cancelled

Example:
PUT /api/orders/507f1f77bcf86cd799439020/status/preparing

Response (200):
{
  "id": "507f1f77bcf86cd799439020",
  "items": [...],
  "status": "preparing",
  "table_number": 7,
  "customer_name": "John Doe",
  "notes": "Updated notes",
  "total_amount": 12.99,
  "payment": null,
  "created_by": "507f1f77bcf86cd799439011",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:30:00"
}
```

#### Process Payment
```
POST /api/orders/{order_id}/payment
Content-Type: application/json
Authorization: Bearer <token>

{
  "method": "cash",
  "amount": 12.99
}

Payment methods: cash, card, digital

Response (200):
{
  "id": "507f1f77bcf86cd799439020",
  "items": [...],
  "status": "completed",
  "table_number": 7,
  "customer_name": "John Doe",
  "notes": "Updated notes",
  "total_amount": 12.99,
  "payment": {
    "method": "cash",
    "amount": 12.99,
    "paid_at": "2024-01-15T11:30:00"
  },
  "created_by": "507f1f77bcf86cd799439011",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:30:00"
}
```

#### Cancel Order
```
DELETE /api/orders/{order_id}
Authorization: Bearer <token>

Response (204): No content
```

## Health Check

```
GET /api/health

Response (200):
{
  "status": "ok"
}
```

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@restaurant.com",
    "full_name": "Test User",
    "password": "testpass123",
    "role": "staff"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@restaurant.com&password=admin123456"
```

### Get Current User
```bash
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Category
```bash
curl -X POST http://localhost:8000/api/menu/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Appetizers",
    "description": "Starters"
  }'
```

### List Menu Items
```bash
curl -X GET http://localhost:8000/api/menu/items
```

## Interactive API Documentation

FastAPI provides automatic interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to test all endpoints interactively in your browser.

## Error Responses

All errors return appropriate HTTP status codes with error messages:

```json
{
  "detail": "Error message description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `204` - No content (successful deletion)
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `422` - Validation error
- `500` - Internal server error
