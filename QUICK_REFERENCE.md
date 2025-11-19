# 🚀 Quick Reference Card

## Start Your POS System

```bash
# Option 1: Automated (Recommended)
./start.sh              # Linux/Mac
start.bat              # Windows

# Option 2: Manual
docker-compose up --build
```

## Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| Alternative Docs | http://localhost:8000/redoc |

## Default Login

```
Email: admin@restaurant.com
Password: admin123456
```

## Key Directories

```
backend/               # FastAPI application
├── main.py           # Main app
├── models/           # Data models
├── routes/           # API endpoints
├── core/             # Config & DB
└── seed_db.py        # Sample data

frontend/             # Web interface
├── index.html        # Main page
└── app.js            # Application

docker-compose.yml    # Docker setup
```

## Essential Commands

```bash
# Start
docker-compose up --build

# Stop
docker-compose down

# View logs
docker-compose logs -f api          # Backend
docker-compose logs -f db           # Database
docker-compose logs -f frontend     # Frontend

# Check health
curl http://localhost:8000/api/health

# Access database
docker exec -it pos_mongo_db mongosh

# Reinitialize data
docker exec pos_api python seed_db.py

# Rebuild without cache
docker-compose build --no-cache

# Reset everything
docker-compose down -v && docker-compose up --build
```

## API Quick Reference

### Authentication
```
POST /api/auth/register
POST /api/auth/token
GET /api/users/me
```

### Menu Management
```
POST /api/menu/categories
GET /api/menu/categories
POST /api/menu/items
GET /api/menu/items
```

### Orders
```
POST /api/orders
GET /api/orders
PUT /api/orders/{id}/status/{status}
POST /api/orders/{id}/payment
```

## Documentation Map

| File | Purpose |
|------|---------|
| START_HERE.md | First steps |
| README.md | Full setup |
| FEATURES.md | All features |
| API_TESTING.md | API guide |
| DEPLOYMENT.md | Production |
| TROUBLESHOOTING.md | Problem fixing |

## Common Tasks

### Create Menu Category
1. Go to http://localhost:8000/docs
2. Authenticate as admin
3. POST /api/menu/categories
4. Fill in name and description

### Add Menu Item
1. POST /api/menu/items
2. Provide name, price, category_id
3. Set available: true

### Take an Order
1. Login to http://localhost as staff
2. Browse and add items
3. Enter customer details
4. Place order

### Process Payment
1. View order in dashboard
2. Click "Pay" button
3. Enter amount and method
4. Submit

## Troubleshooting Quick Fix

**App won't start?**
```bash
docker-compose down -v
docker-compose up --build
```

**Can't login?**
- Check credentials
- Verify backend runs: http://localhost:8000/api/health

**Port in use?**
```bash
docker-compose down
# Edit docker-compose.yml if needed
docker-compose up
```

**Database down?**
```bash
docker-compose restart db
docker-compose logs db  # Check logs
```

## Port Mappings

| Service | Port | Access |
|---------|------|--------|
| Frontend | 80 | http://localhost |
| Backend | 8000 | http://localhost:8000 |
| MongoDB | 27017 | localhost:27017 |

## Default Data

**Categories**
- Appetizers
- Main Courses
- Beverages
- Desserts
- Salads

**Users**
- Admin: admin@restaurant.com / admin123456
- Staff: staff@restaurant.com / staff123456

## Environment Variables

```env
DATABASE_URL=mongodb://db:27017
DATABASE_NAME=pos_restaurant
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Backend | FastAPI (Python) |
| Frontend | HTML/JS/Tailwind CSS |
| Database | MongoDB |
| Async Driver | Motor |
| Auth | JWT + Bcrypt |
| Containerization | Docker |
| Reverse Proxy | Nginx |

## Important Files

| File | Purpose |
|------|---------|
| main.py | FastAPI application entry point |
| app.js | Frontend SPA logic |
| pos_models.py | POS data models |
| docker-compose.yml | Container orchestration |
| seed_db.py | Database initialization |

## Status Commands

```bash
# Check all services
docker-compose ps

# Check specific service
docker-compose ps api

# Check logs for errors
docker-compose logs --tail=50

# Real-time logs
docker-compose logs -f

# Check health endpoint
curl -s http://localhost:8000/api/health | jq
```

## Browser Shortcuts

- Open Frontend: http://localhost
- Open API Docs: http://localhost:8000/docs
- Try API: Click "Try it out" in Swagger UI
- Health Check: http://localhost:8000/api/health

## Development Tips

1. **Edit code**: Files auto-reload with hot reload enabled
2. **Test API**: Use http://localhost:8000/docs
3. **Debug Frontend**: Press F12 in browser
4. **Debug Backend**: Check logs with `docker-compose logs -f api`
5. **Check Database**: Use mongosh connection

## File Size Reference

| Component | Size |
|-----------|------|
| Backend | ~100KB (source) |
| Frontend | ~50KB (source) |
| Database | Grows with data |
| Docker Image | ~500MB each |

## Security Reminders

- ⚠️ Change SECRET_KEY in production
- ⚠️ Use strong passwords
- ⚠️ Enable HTTPS in production
- ⚠️ Restrict CORS origins
- ⚠️ Don't commit .env file
- ⚠️ Keep dependencies updated

## Performance Tips

- Use category filtering for large menus
- Keep images optimized
- Monitor database indexes
- Check browser cache
- Use production mode deployment

## Getting Help

1. Read relevant documentation
2. Check logs: `docker-compose logs`
3. Verify health: `curl http://localhost:8000/api/health`
4. Test in Swagger UI: http://localhost:8000/docs
5. Check browser console (F12)

## Next Steps

1. ✅ Start: `./start.sh`
2. ✅ Test: http://localhost
3. ✅ Login: admin@restaurant.com
4. ✅ Create menu
5. ✅ Take orders
6. ✅ Deploy: Read DEPLOYMENT.md

---

**Save this file for quick reference!**
📄 Print it or bookmark it for easy access.
