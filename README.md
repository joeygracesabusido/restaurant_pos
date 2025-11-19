# Restaurant POS System

A complete Point of Sale system for restaurants built with FastAPI (Backend), MongoDB (Database), and vanilla JavaScript (Frontend).

## Features

✅ **User Management**
- User registration and login with JWT authentication
- Role-based access control (Admin, Staff)

✅ **Menu Management**
- Create, read, update, delete menu categories
- Create, read, update, delete menu items
- Manage item availability

✅ **Order Management**
- Create orders with multiple items
- Track order status (Pending → Preparing → Ready → Completed)
- Add special instructions to items
- Support for table numbers and customer names

✅ **Payment Processing**
- Support multiple payment methods (Cash, Card, Digital)
- Track payment status
- Automatic order completion after payment

✅ **Real-time UI**
- Menu browsing with category filtering
- Shopping cart management
- Order tracking dashboard
- User-friendly interface with Tailwind CSS

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **ORM**: Motor (async MongoDB driver)

### Frontend
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **HTTP**: Fetch API

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx

## Project Structure

```
POS-Restaurant/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt         # Python dependencies
│   ├── security.py             # JWT and password utilities
│   ├── dependencies.py         # Dependency injection
│   ├── core/
│   │   ├── config.py           # Configuration settings
│   │   └── database.py         # MongoDB connection
│   ├── models/
│   │   ├── user_models.py      # User data models
│   │   └── pos_models.py       # POS data models (Category, MenuItem, Order, Payment)
│   └── routes/
│       ├── auth_routes.py      # Authentication endpoints
│       ├── user_routes.py      # User profile endpoints
│       ├── menu_routes.py      # Menu management endpoints
│       └── order_routes.py     # Order management endpoints
├── frontend/
│   ├── index.html              # Main HTML file
│   └── app.js                  # Main JavaScript application
├── docker-compose.yml          # Docker services configuration
├── Dockerfile.backend          # Backend container definition
├── Dockerfile.frontend         # Frontend container definition
└── nginx.conf                  # Nginx reverse proxy configuration
```

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git

### Installation & Running with Docker

1. **Clone or navigate to the project:**
```bash
cd POS-Restaurant
```

2. **Start the application:**
```bash
docker-compose up --build
```

3. **Access the application:**
- Frontend: http://localhost:80 (or http://localhost)
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

4. **Stop the application:**
```bash
docker-compose down
```

### Running Locally (Without Docker)

#### Backend Setup

1. **Create and activate virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Start MongoDB locally** (if not using Docker):
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod
```

4. **Run the backend:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **Serve the frontend** (simple approach):
```bash
# Using Python 3
python -m http.server 3000 --directory frontend

# Or using Node.js (if installed)
cd frontend
npx http-server -p 3000
```

2. **Access the application:**
- Frontend: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/token` - Login and get access token

### Users
- `GET /api/users/me` - Get current user profile

### Menu Management
- `GET /api/menu/categories/public` - List all categories
- `POST /api/menu/categories` - Create category (Admin only)
- `GET /api/menu/categories/{id}` - Get category (Admin only)
- `PUT /api/menu/categories/{id}` - Update category (Admin only)
- `DELETE /api/menu/categories/{id}` - Delete category (Admin only)

- `GET /api/menu/items` - List menu items
- `POST /api/menu/items` - Create menu item (Admin only)
- `GET /api/menu/items/{id}` - Get menu item
- `PUT /api/menu/items/{id}` - Update menu item (Admin only)
- `DELETE /api/menu/items/{id}` - Delete menu item (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}` - Update order
- `PUT /api/orders/{id}/status/{status}` - Update order status
- `POST /api/orders/{id}/payment` - Process payment
- `DELETE /api/orders/{id}` - Cancel order

## Usage Guide

### First Time Setup

1. **Register as Admin:**
   - Go to the registration page
   - Create an account (e.g., admin@restaurant.com)
   - You now have staff access (upgrade in database to admin role manually)

2. **Access Backend API Docs:**
   - Go to http://localhost:8000/docs
   - Use the Swagger UI to test endpoints

3. **Create Menu Categories and Items:**
   - Use the API endpoints to create categories (e.g., "Beverages", "Main Course")
   - Add menu items to each category with prices

4. **Take Orders:**
   - Browse menu by category
   - Add items to cart
   - Specify table number (optional)
   - Place order
   - Track order status
   - Process payment

### User Roles

- **Staff**: Can create and view orders, browse menu
- **Admin**: Can manage menu items, categories, and view orders

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=pos_restaurant
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Database Models

### User
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "full_name": "John Doe",
  "hashed_password": "hash...",
  "role": "staff|admin"
}
```

### Category
```json
{
  "_id": "ObjectId",
  "name": "Beverages",
  "description": "All drinks"
}
```

### MenuItem
```json
{
  "_id": "ObjectId",
  "name": "Coffee",
  "description": "Espresso coffee",
  "price": 3.99,
  "category_id": "ObjectId",
  "available": true,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Order
```json
{
  "_id": "ObjectId",
  "items": [
    {
      "menu_item_id": "ObjectId",
      "quantity": 2,
      "price_per_item": 3.99,
      "subtotal": 7.98,
      "special_instructions": "Extra sugar"
    }
  ],
  "status": "pending|preparing|ready|completed|cancelled",
  "table_number": 5,
  "customer_name": "John",
  "notes": "Urgent",
  "total_amount": 25.99,
  "payment": {
    "method": "cash|card|digital",
    "amount": 25.99,
    "paid_at": "timestamp"
  },
  "created_by": "user_id",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running on port 27017
- Check if port 8000 is available
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Can't connect to API from frontend
- Check if backend is running on http://localhost:8000
- Verify CORS is enabled (should be by default)
- Check browser console for specific errors

### Database connection issues
- MongoDB must be running
- Check DATABASE_URL in config.py or .env file
- For Docker, ensure mongo service is healthy: `docker-compose ps`

### Port conflicts
- Change port in docker-compose.yml or relevant Dockerfile
- Make sure ports 80, 8000, and 27017 are available

## Security Notes

⚠️ **For Production:**
- Change the `SECRET_KEY` to a secure random value
- Set `ALGORITHM` to a secure JWT algorithm
- Restrict CORS origins to your frontend domain
- Use HTTPS instead of HTTP
- Set strong MongoDB authentication
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for sensitive data
- Implement API key rotation
- Add logging and monitoring

## Future Enhancements

- [ ] Inventory management
- [ ] Kitchen display system (KDS)
- [ ] Employee time tracking
- [ ] Delivery management
- [ ] Analytics and reporting
- [ ] Mobile app
- [ ] Real-time WebSocket updates
- [ ] Multi-location support
- [ ] Subscription/loyalty programs
- [ ] Email and SMS notifications

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Check backend logs in Docker: `docker-compose logs api`
4. Check browser console for frontend errors

## License

This project is provided as-is for educational and commercial use.

---

Happy coding! 🍽️ 💻
