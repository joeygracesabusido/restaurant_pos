# Troubleshooting Guide

## 🆘 Common Issues and Solutions

### Backend Issues

#### 1. "Cannot connect to MongoDB"
**Error**: `Connection refused` or `Failed to connect to server`

**Solutions**:
```bash
# Check if MongoDB container is running
docker-compose ps

# View MongoDB logs
docker-compose logs db

# Restart MongoDB
docker-compose restart db

# Verify connection string
# Check DATABASE_URL in docker-compose.yml or .env
```

#### 2. "ModuleNotFoundError: No module named 'fastapi'"
**Error**: Python dependencies not installed

**Solutions**:
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Or with venv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

#### 3. "Port 8000 already in use"
**Error**: `OSError: [Errno 48] Address already in use`

**Solutions**:
```bash
# Find process using port 8000
lsof -i :8000          # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port in docker-compose.yml:
# ports: - "8001:8000"
```

#### 4. "Invalid token" on protected endpoints
**Error**: `401 Unauthorized - Invalid authentication credentials`

**Solutions**:
- Ensure you're including the token in the Authorization header
- Format: `Authorization: Bearer <token>`
- Check if token has expired (default 30 minutes)
- Try logging out and logging back in
- Verify SECRET_KEY hasn't changed

#### 5. "CORS error - blocked by CORS policy"
**Error**: Cross-Origin Request Blocked

**Solutions**:
- Check CORS middleware in `main.py`
- Verify frontend URL is in allowed origins
- For development, `allow_origins=["*"]` is fine
- For production, restrict to specific domains:
```python
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

#### 6. "Database authentication failed"
**Error**: `Authentication failed`

**Solutions**:
```bash
# Check credentials in .env
# Verify MONGODB_ADMIN_USER and MONGODB_ADMIN_PASSWORD

# Reset MongoDB (caution: deletes data)
docker-compose down -v
docker-compose up -d db
```

---

### Frontend Issues

#### 1. "Blank page or 'Loading...' never completes"
**Causes**: 
- Backend not running
- API not accessible
- CORS issue
- JavaScript error

**Solutions**:
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Check browser console for errors
# Press F12 → Console tab

# Check if frontend can reach backend
# Try in browser: http://localhost:8000/api/health
```

#### 2. "Can't login - wrong credentials"
**Error**: "Incorrect email or password"

**Solutions**:
- Verify email is correct: `admin@restaurant.com`
- Verify password: `admin123456`
- Check if user was created in database
- Try registering a new account
- Check backend logs: `docker-compose logs api`

#### 3. "Cart items disappear"
**Causes**: Page refresh, JavaScript error, localStorage issue

**Solutions**:
```javascript
// In browser console, check localStorage
localStorage.getItem('token')
// Should return a token

// Check if cart state is maintained
// Refresh page - cart should persist
```

#### 4. "API Docs give 404 error"
**Solutions**:
- Correct URL: `http://localhost:8000/docs`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Verify backend is running on port 8000

#### 5. "Can't create order - validation error"
**Error**: `422 Unprocessable Entity`

**Solutions**:
- Check cart is not empty
- Ensure all items exist in database
- Verify menu items are available
- Check amount is positive number
- View error details in response body

#### 6. "Pagination doesn't work"
**Solutions**:
- Not implemented in current version
- All items/orders loaded at once
- For large datasets, implement pagination in API

---

### Docker Issues

#### 1. "Docker command not found"
**Error**: `command not found: docker`

**Solutions**:
```bash
# Install Docker
# macOS: brew install docker
# Ubuntu: sudo apt-get install docker.io
# Windows: Download Docker Desktop

# Or use Docker Desktop GUI
```

#### 2. "docker-compose build fails"
**Error**: Build error, missing dependencies

**Solutions**:
```bash
# Clear build cache
docker-compose build --no-cache

# View detailed build logs
docker-compose build --verbose

# Check Dockerfile syntax
```

#### 3. "Container keeps restarting"
**Cause**: Application error or exit

**Solutions**:
```bash
# View container logs
docker-compose logs api

# Check for errors
docker-compose logs db

# Restart specific service
docker-compose restart api

# Rebuild and restart
docker-compose down
docker-compose up --build
```

#### 4. "Out of disk space"
**Error**: `No space left on device`

**Solutions**:
```bash
# Clean up Docker
docker system prune -a

# Remove old containers
docker-compose down -v

# Check disk space
df -h

# Remove large log files
docker logs --truncate-output <container_id>
```

#### 5. "Permission denied"
**Error**: `permission denied while trying to connect to Docker daemon`

**Solutions** (Linux):
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login
exit

# Or run with sudo
sudo docker-compose up
```

---

### Database Issues

#### 1. "No data in database"
**Solutions**:
- Run seed script: `python backend/seed_db.py`
- Or create data via API at `/docs`
- Check if collection exists: `docker exec pos_mongo_db mongosh`

#### 2. "Can't find orders/items"
**Solutions**:
```bash
# Connect to MongoDB
docker exec -it pos_mongo_db mongosh

# Switch to database
use pos_restaurant

# View collections
show collections

# Check data
db.orders.find()
db.menu_items.find()
```

#### 3. "Duplicate key error"
**Error**: `E11000 duplicate key error`

**Solutions**:
- Email already exists in users collection
- Drop collection and reseed: `db.users.deleteMany({})`
- Or use different email for registration

#### 4. "ObjectId validation error"
**Error**: `Invalid ObjectId`

**Solutions**:
- Ensure ID is valid MongoDB ObjectId format
- 24 character hex string
- Check ID parameter in URL

---

### Network Issues

#### 1. "Can't reach localhost"
**Causes**: 
- Port not exposed
- Firewall blocking
- Wrong port number

**Solutions**:
```bash
# Check listening ports
netstat -tuln | grep 8000  # Linux
netstat -ano | findstr 8000  # Windows

# Check firewall
# On macOS: System Preferences → Security & Privacy → Firewall
# On Windows: Windows Defender Firewall

# Verify docker-compose port mapping
cat docker-compose.yml | grep ports
```

#### 2. "Timeout connecting to API"
**Causes**: 
- Slow network
- Backend processing
- Hanging request

**Solutions**:
```bash
# Check API health
curl -v http://localhost:8000/api/health

# Check container logs
docker-compose logs api

# Increase timeout in nginx.conf
# proxy_connect_timeout 60s;
# proxy_read_timeout 60s;
```

#### 3. "Network bridge issues"
**Error**: `docker network error`

**Solutions**:
```bash
# Recreate network
docker network rm pos_network
docker-compose up --build

# Or inspect network
docker network inspect pos_network
```

---

### Performance Issues

#### 1. "App is running slowly"
**Solutions**:
```bash
# Check resource usage
docker stats

# Check database performance
docker exec pos_mongo_db mongosh
# db.system.profile.find({millis: {$gt: 100}})

# Clear browser cache
# Ctrl+Shift+Delete (Chrome)

# Check network latency
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/api/health
```

#### 2. "High memory usage"
**Solutions**:
```bash
# Check which container uses memory
docker stats

# Restart service
docker-compose restart api

# Check for memory leaks
docker logs api | grep -i "memory"
```

#### 3. "Slow API responses"
**Solutions**:
```bash
# Enable MongoDB profiling
docker exec pos_mongo_db mongosh
db.setProfilingLevel(1, {slowms: 100})

# View slow queries
db.system.profile.find({millis: {$gt: 100}})

# Add database indexes
db.menu_items.createIndex({category_id: 1})
db.orders.createIndex({status: 1})
```

---

### Security Issues

#### 1. "Can't change SECRET_KEY"
**Solutions**:
```bash
# Stop containers
docker-compose down

# Update .env or docker-compose.yml
# Change SECRET_KEY value

# Restart
docker-compose up -d

# Note: Existing tokens become invalid
# Users must login again
```

#### 2. "Need to reset password"
**Solutions**:
```bash
# Connect to MongoDB
docker exec -it pos_mongo_db mongosh
use pos_restaurant

# Hash new password (in Python)
python -c "from security import get_password_hash; print(get_password_hash('newpassword'))"

# Update user
db.users.updateOne({email: "admin@restaurant.com"}, {$set: {hashed_password: "new_hash"}})
```

#### 3. "Exposed sensitive data in logs"
**Solutions**:
```bash
# Check what's being logged
docker-compose logs | grep -i password

# Update logging configuration
# In main.py, use proper logging levels
# Don't log passwords or tokens
```

---

### Development Issues

#### 1. "Hot reload not working"
**Solutions**:
```bash
# In docker-compose.yml, volume mapping must be correct:
volumes:
  - ./backend:/app

# Restart container
docker-compose restart api

# Check file is actually being modified
touch backend/main.py
```

#### 2. "Can't debug in container"
**Solutions**:
```bash
# Use logs
docker-compose logs -f api

# Interactive debug
docker exec -it pos_api bash
python -m pdb main.py

# Or use VS Code remote container debugging
```

#### 3. "Dependencies not updating"
**Solutions**:
```bash
# Rebuild without cache
docker-compose build --no-cache api

# Or manually update
docker exec pos_api pip install -r requirements.txt
```

---

## 🔍 Debugging Checklist

When something goes wrong, follow this checklist:

- [ ] Check all containers are running: `docker-compose ps`
- [ ] Check container logs: `docker-compose logs service_name`
- [ ] Verify health endpoint: `curl http://localhost:8000/api/health`
- [ ] Check database connection: `docker-compose logs db`
- [ ] Check browser console (F12 → Console)
- [ ] Check network tab in browser (F12 → Network)
- [ ] Verify environment variables are set
- [ ] Check firewall settings
- [ ] Clear browser cache and reload
- [ ] Try restarting containers
- [ ] Check disk space: `df -h`
- [ ] Check available ports: `netstat -tuln`

## 🆘 Getting Help

If issue persists:

1. **Check Documentation**
   - README.md
   - FEATURES.md
   - DEPLOYMENT.md

2. **Check Logs**
   ```bash
   docker-compose logs -f api db frontend
   ```

3. **Test Components Individually**
   - Backend: `http://localhost:8000/api/health`
   - Frontend: `http://localhost`
   - Database: `docker exec -it pos_mongo_db mongosh`

4. **Reinstall from Scratch**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up --build
   ```

5. **Check GitHub Issues** (if this is a known problem)

---

## 📝 Creating an Issue Report

If you need external help, provide:

1. **Error message** - Exact text of the error
2. **Steps to reproduce** - How to trigger the issue
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Logs** - Relevant logs from `docker-compose logs`
6. **Environment** - OS, Docker version, Python version
7. **Attempts** - What you've already tried

---

**Remember**: Most issues can be solved by:
1. Checking logs
2. Restarting containers
3. Rebuilding images
4. Clearing cache

Good luck! 🚀
