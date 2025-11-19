# Deployment Guide

This guide covers deploying the Restaurant POS System to production environments.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificates obtained
- [ ] Firewall rules configured
- [ ] Monitoring setup
- [ ] Logging configured

## Environment Setup

### Production Environment Variables

Create `.env` file in the backend directory:

```env
# Database
DATABASE_URL=mongodb://username:password@mongodb-host:27017
DATABASE_NAME=pos_restaurant
MONGODB_ADMIN_USER=admin
MONGODB_ADMIN_PASSWORD=secure_password

# Security
SECRET_KEY=generate-a-secure-key-with-at-least-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# API
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=INFO
```

### Generating a Secure Secret Key

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Docker Deployment

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: mongo:latest
    container_name: pos_mongo_db
    restart: always
    ports:
      - "127.0.0.1:27017:27017"  # Only accessible locally
    volumes:
      - mongo_data:/data/db
      - ./backups:/backups
    networks:
      - pos_network
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGODB_ADMIN_PASSWORD}
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh -u admin -p ${MONGODB_ADMIN_PASSWORD} localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    image: pos-api:latest
    container_name: pos_api
    restart: always
    ports:
      - "127.0.0.1:8000:8000"  # Only accessible locally
    depends_on:
      db:
        condition: service_healthy
    networks:
      - pos_network
    environment:
      - DATABASE_URL=mongodb://admin:${MONGODB_ADMIN_PASSWORD}@db:27017
      - DATABASE_NAME=pos_restaurant
      - SECRET_KEY=${SECRET_KEY}
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=60
    healthcheck:
      test: curl -f http://localhost:8000/api/health || exit 1
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: pos-frontend:latest
    container_name: pos_frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
    networks:
      - pos_network
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro

networks:
  pos_network:
    driver: bridge

volumes:
  mongo_data:
    driver: local
```

### Production nginx.conf

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Caching static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

### Building Production Images

```bash
# Build backend image
docker build -f Dockerfile.backend -t pos-api:latest .

# Build frontend image
docker build -f Dockerfile.frontend -t pos-frontend:latest .

# Tag for registry
docker tag pos-api:latest your-registry/pos-api:latest
docker tag pos-frontend:latest your-registry/pos-frontend:latest

# Push to registry
docker push your-registry/pos-api:latest
docker push your-registry/pos-frontend:latest
```

## Manual Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx mongodb-server

# Start services
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Application Setup

```bash
# Clone/copy application
git clone <repository> /app/pos-restaurant
cd /app/pos-restaurant

# Create environment file
cp .env.example backend/.env
# Edit backend/.env with production values

# Build and start
docker-compose -f docker-compose.yml up -d
```

### 3. SSL/TLS Setup

```bash
# Let's Encrypt with Certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 4. Database Backup

```bash
# Create backup directory
mkdir -p /backups/mongodb

# Daily backup script (crontab)
0 2 * * * /usr/bin/mongodump --out /backups/mongodb/$(date +\%Y\%m\%d) --username admin --password $MONGODB_PASSWORD

# Add to crontab
crontab -e
```

### 5. Monitoring & Logging

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f db
docker-compose logs -f frontend

# Set up centralized logging
# Consider: ELK Stack, Splunk, or CloudWatch

# Monitor containers
docker stats
```

## Cloud Deployment

### AWS ECS

```bash
# Create ECR repository
aws ecr create-repository --repository-name pos-api
aws ecr create-repository --repository-name pos-frontend

# Push images
docker tag pos-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/pos-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/pos-api:latest

# Create ECS task definition and service
# Use AWS Console or CLI
```

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create pos-restaurant-app

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DATABASE_URL=mongodb://...

# Deploy
git push heroku main
```

### DigitalOcean App Platform

```bash
# Push code to GitHub
git push origin main

# In DigitalOcean Console:
# 1. Create new app
# 2. Connect GitHub repo
# 3. Configure services
# 4. Deploy
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health
curl https://yourdomain.com/api/health

# Test endpoints
curl https://yourdomain.com/api/auth/token \
  -X POST \
  -d "username=admin@restaurant.com&password=your_password"
```

### 2. Database Initialization

```bash
# Access backend container
docker exec -it pos_api bash

# Run seed script
python seed_db.py
```

### 3. Set Up Monitoring

```bash
# Example: Prometheus + Grafana setup
# Or use: DataDog, New Relic, Sentry
```

### 4. Configure Backups

```bash
# MongoDB backup
mongodump --uri mongodb://admin:password@db:27017/pos_restaurant

# Database replication setup
# Consider: MongoDB Atlas or managed MongoDB service
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx, HAProxy, or cloud LB
2. **Multiple API Instances**: Run multiple backend containers
3. **Database Replication**: MongoDB replica set
4. **Static Assets**: CDN (CloudFlare, AWS CloudFront)

### Vertical Scaling

1. Increase container resources
2. Optimize database indexes
3. Implement caching (Redis)
4. Enable query optimization

### Example Scaled Architecture

```
Internet
   ↓
Cloudflare (CDN)
   ↓
AWS ALB (Load Balancer)
   ↓
┌─────────────────────┬────────────────┐
│  ECS Cluster        │  API Instances │
│  - 3 API Tasks      │  (Auto Scaled) │
│  - 1 Frontend Task  │                │
└─────────────────────┴────────────────┘
   ↓
MongoDB Atlas (Managed)
   ↓
S3 (Backups)
```

## Security Hardening

### Network Security

```bash
# Firewall rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 8000/tcp   # Block direct API access
sudo ufw deny 27017/tcp  # Block direct DB access
```

### Application Security

- [ ] Enable rate limiting
- [ ] Implement API key authentication
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS everywhere
- [ ] Implement CORS properly
- [ ] Add request validation
- [ ] Enable security headers
- [ ] Use parameterized queries
- [ ] Implement request logging
- [ ] Set up intrusion detection

### Database Security

```bash
# Create dedicated database users
db.createUser({
  user: "pos_app",
  pwd: "secure_password",
  roles: [{role: "readWrite", db: "pos_restaurant"}]
})

# Enable authentication
# Enable encryption at rest
# Enable audit logging
```

## Troubleshooting Production Issues

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart service
docker-compose restart api

# Check for memory leaks in logs
```

### Slow Database Queries

```bash
# Enable MongoDB profiling
db.setProfilingLevel(2)

# View slow queries
db.system.profile.find({millis: {$gt: 100}})
```

### SSL Certificate Expiration

```bash
# Check expiration
openssl x509 -in ssl/cert.pem -text -noout

# Renew before expiration
sudo certbot renew --force-renewal
```

## Maintenance

### Regular Tasks

- [ ] Monitor disk space
- [ ] Review logs daily
- [ ] Update dependencies monthly
- [ ] Test backups quarterly
- [ ] Review security policies quarterly
- [ ] Performance optimization review

### Update Procedure

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build --no-cache

# Restart services (zero-downtime)
docker-compose up -d --no-recreate

# Run migrations if needed
docker exec pos_api python migrations.py
```

## Disaster Recovery

### Backup Strategy

- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Test restore procedures monthly

### Recovery Procedure

```bash
# Restore database
mongorestore --uri mongodb://admin:password@db:27017 /backups/mongodb/latest

# Verify application
curl https://yourdomain.com/api/health

# Check data integrity
# Run validation scripts
```

---

For additional help, see README.md and FEATURES.md
