# 🚀 Production Deployment Guide

This guide covers deploying the MakrCave system to production servers with all necessary configurations.

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or RHEL 8+
- **RAM**: Minimum 4GB (8GB recommended)
- **CPU**: 2+ cores
- **Storage**: 50GB+ SSD
- **Network**: Static IP with ports 80, 443, 8000 open

### Software Dependencies
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Nginx**: 1.18+ (for reverse proxy)
- **Node.js**: 18+ (for frontend builds)
- **Python**: 3.9+ (for backend)
- **PostgreSQL**: 13+ (recommended over SQLite for production)

## 🔧 Backend Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and pip
sudo apt install python3.9 python3-pip python3-venv -y
```

### 2. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE makrcave_db;
CREATE USER makrcave_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE makrcave_db TO makrcave_user;
ALTER USER makrcave_user CREATEDB;
\q
EOF
```

### 3. Backend Application Setup

```bash
# Clone repository
git clone https://github.com/your-org/makrcave-system.git
cd makrcave-system/makrcave-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production environment file
cp .env.example .env.production
```

### 4. Production Environment Configuration

Create `.env.production`:

```env
# Production Database
DATABASE_URL=postgresql://makrcave_user:your_secure_password@localhost:5432/makrcave_db

# Security Settings
JWT_SECRET_KEY=your-super-secure-jwt-key-min-256-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS Settings (update with your domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
ALLOWED_HEADERS=*

# File Upload
MAX_FILE_SIZE_MB=50
UPLOAD_DIR=/var/makrcave/uploads

# Production Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/makrcave/makrcave.log

# Email Configuration (production SMTP)
SMTP_SERVER=smtp.your-provider.com
SMTP_PORT=587
SMTP_USERNAME=your-production-email@yourdomain.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=MakrCave

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Payment Gateways (production keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_razorpay_secret
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx

# Skill Management Production Settings
SKILL_CERTIFICATION_EXPIRY_DAYS=365
SKILL_REQUEST_AUTO_APPROVE=false
SKILL_AUDIT_RETENTION_DAYS=1825
EQUIPMENT_SKILL_ENFORCEMENT=true
EQUIPMENT_EMERGENCY_OVERRIDE=false

# Production Mode
DEBUG=False
ENVIRONMENT=production
```

### 5. Database Migration

```bash
# Run all migrations
python migrations/create_member_tables.py
python migrations/create_skill_tables.py
python migrations/create_analytics_tables.py

# Verify migration success
python -c "
from sqlalchemy import inspect
from database import engine
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f'Created tables: {tables}')
"
```

### 6. Create Systemd Service

Create `/etc/systemd/system/makrcave-backend.service`:

```ini
[Unit]
Description=MakrCave Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=makrcave
Group=makrcave
WorkingDirectory=/opt/makrcave/makrcave-backend
Environment=PATH=/opt/makrcave/makrcave-backend/venv/bin
EnvironmentFile=/opt/makrcave/makrcave-backend/.env.production
ExecStart=/opt/makrcave/makrcave-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
# Create makrcave user
sudo useradd -r -s /bin/false makrcave
sudo mkdir -p /opt/makrcave /var/log/makrcave /var/makrcave/uploads
sudo chown -R makrcave:makrcave /opt/makrcave /var/log/makrcave /var/makrcave

# Copy application files
sudo cp -r . /opt/makrcave/makrcave-backend
sudo chown -R makrcave:makrcave /opt/makrcave

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable makrcave-backend
sudo systemctl start makrcave-backend
sudo systemctl status makrcave-backend
```

## 🎨 Frontend Deployment

### 1. Build Production Frontend

```bash
cd frontend/makrcave-frontend

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
EOF

# Build for production
npm run build
```

### 2. Nginx Configuration

Create `/etc/nginx/sites-available/makrcave`:

```nginx
# Frontend (main domain)
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /var/www/makrcave-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

# API Backend
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://127.0.0.1:8000;
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

    # File upload size
    client_max_body_size 50M;
}
```

### 3. Deploy Frontend Files

```bash
# Copy built files to web root
sudo mkdir -p /var/www/makrcave-frontend
sudo cp -r dist/* /var/www/makrcave-frontend/
sudo chown -R www-data:www-data /var/www/makrcave-frontend

# Enable site
sudo ln -s /etc/nginx/sites-available/makrcave /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🐳 Docker Deployment (Alternative)

### 1. Backend Dockerfile

Create `makrcave-backend/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN groupadd -r makrcave && useradd -r -g makrcave makrcave
RUN chown -R makrcave:makrcave /app
USER makrcave

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 2. Frontend Dockerfile

Create `frontend/makrcave-frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: makrcave_db
      POSTGRES_USER: makrcave_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  backend:
    build: ./makrcave-backend
    environment:
      DATABASE_URL: postgresql://makrcave_user:${POSTGRES_PASSWORD}@postgres:5432/makrcave_db
    env_file:
      - ./makrcave-backend/.env.production
    depends_on:
      - postgres
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  frontend:
    build: ./frontend/makrcave-frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
```

## 📊 Monitoring & Maintenance

### 1. Log Monitoring

```bash
# Backend logs
sudo journalctl -u makrcave-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
sudo tail -f /var/log/makrcave/makrcave.log
```

### 2. Health Checks

Create `/opt/makrcave/healthcheck.sh`:

```bash
#!/bin/bash

# Check backend API
if ! curl -f http://localhost:8000/health; then
    echo "Backend API is down"
    sudo systemctl restart makrcave-backend
fi

# Check database connection
if ! sudo -u postgres psql -d makrcave_db -c "SELECT 1;" > /dev/null; then
    echo "Database connection failed"
fi

# Check disk space
if [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -gt 80 ]; then
    echo "Disk space is running low"
fi
```

```bash
# Make executable
sudo chmod +x /opt/makrcave/healthcheck.sh

# Add to crontab
echo "*/5 * * * * /opt/makrcave/healthcheck.sh" | sudo crontab -
```

### 3. Backup Strategy

Create `/opt/makrcave/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/makrcave"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump makrcave_db > $BACKUP_DIR/db_backup_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /var/makrcave/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Schedule daily backups
echo "0 2 * * * /opt/makrcave/backup.sh" | sudo crontab -
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw -y

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if using non-standard)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 2. Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Create custom jail for MakrCave
sudo tee /etc/fail2ban/jail.local << EOF
[makrcave-backend]
enabled = true
port = 8000
filter = makrcave-backend
logpath = /var/log/makrcave/makrcave.log
maxretry = 5
bantime = 3600
EOF

# Restart Fail2Ban
sudo systemctl restart fail2ban
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Server meets minimum requirements
- [ ] Domain DNS pointing to server
- [ ] SSL certificates configured
- [ ] Database server installed and configured
- [ ] Environment variables set
- [ ] Firewall configured

### Backend Deployment
- [ ] Python dependencies installed
- [ ] Database migrations run successfully
- [ ] Environment file configured
- [ ] Systemd service created and enabled
- [ ] API endpoints responding correctly
- [ ] Skill management system functional

### Frontend Deployment
- [ ] Node.js dependencies installed
- [ ] Production build created
- [ ] Nginx configured correctly
- [ ] Static files served properly
- [ ] API connections working
- [ ] All pages loading correctly

### Post-Deployment
- [ ] Health checks configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] Security hardening applied
- [ ] Performance testing completed

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
```bash
# Check logs
sudo journalctl -u makrcave-backend -n 50

# Verify database connection
python -c "from database import engine; print(engine.execute('SELECT 1').scalar())"

# Check port availability
sudo netstat -tulpn | grep :8000
```

**Frontend not loading:**
```bash
# Check Nginx status
sudo systemctl status nginx

# Verify files exist
ls -la /var/www/makrcave-frontend/

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

**Database connection issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -d makrcave_db -c "SELECT version();"

# Verify user permissions
sudo -u postgres psql -c "\du"
```

This deployment guide ensures a robust, secure, and scalable production setup for the MakrCave system.
