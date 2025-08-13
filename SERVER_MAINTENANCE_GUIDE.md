# 🔧 Server Maintenance & Monitoring Guide

This guide covers ongoing maintenance, monitoring, and troubleshooting for the MakrCave production system.

## 📊 System Monitoring

### 1. **Health Check Endpoints**

#### Backend Health Check
```bash
# Check backend API health
curl -f http://localhost:8000/health

# Expected response: {"status": "healthy", "timestamp": "..."}
```

#### Frontend Health Check
```bash
# Check frontend availability
curl -f http://localhost:3000/health

# Expected response: "healthy"
```

#### Database Health Check
```bash
# Check database connectivity
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U makrcave_user -d makrcave_db

# Expected response: accepting connections
```

### 2. **Log Monitoring**

#### View Real-time Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres

# Nginx logs (if using host nginx)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### Log Analysis Commands
```bash
# Check for errors in backend logs
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Check API response times
docker-compose -f docker-compose.prod.yml logs nginx | awk '{print $4, $10}' | tail -100

# Monitor disk usage
df -h
docker system df
```

### 3. **Performance Monitoring**

#### System Resources
```bash
# CPU and memory usage
htop
docker stats

# Disk usage
du -sh ./logs ./uploads ./backups
docker system df

# Network connections
ss -tulpn | grep -E ':(80|443|8000|5432)'
```

#### Database Performance
```bash
# Check active connections
docker-compose -f docker-compose.prod.yml exec postgres psql -U makrcave_user -d makrcave_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
docker-compose -f docker-compose.prod.yml exec postgres psql -U makrcave_user -d makrcave_db -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Database size
docker-compose -f docker-compose.prod.yml exec postgres psql -U makrcave_user -d makrcave_db -c "SELECT pg_size_pretty(pg_database_size('makrcave_db'));"
```

## 🔄 Backup and Recovery

### 1. **Automated Backup Script**

Create `/opt/makrcave/backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/makrcave"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Creating database backup..."
docker-compose -f /opt/makrcave/docker-compose.prod.yml exec -T postgres pg_dump -U makrcave_user makrcave_db | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Application files backup
echo "Creating uploads backup..."
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /opt/makrcave ./uploads

# Configuration backup
echo "Creating config backup..."
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C /opt/makrcave .env.production nginx/ docker-compose.prod.yml

# Cleanup old backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

Schedule daily backups:
```bash
# Edit crontab
sudo crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /opt/makrcave/backup.sh >> /var/log/makrcave-backup.log 2>&1
```

### 2. **Recovery Procedures**

#### Database Recovery
```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database from backup
gunzip -c /var/backups/makrcave/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U makrcave_user -d makrcave_db

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

#### File Recovery
```bash
# Restore uploads
tar -xzf /var/backups/makrcave/uploads_backup_YYYYMMDD_HHMMSS.tar.gz -C ./

# Restore configuration
tar -xzf /var/backups/makrcave/config_backup_YYYYMMDD_HHMMSS.tar.gz -C ./
```

## 🚨 Alert Configuration

### 1. **System Alerts Script**

Create `/opt/makrcave/alerts.sh`:
```bash
#!/bin/bash

# Configuration
ALERT_EMAIL="admin@yourdomain.com"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERT: Disk usage is ${DISK_USAGE}%" | mail -s "MakrCave Disk Alert" $ALERT_EMAIL
fi

# Check service health
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "ALERT: Backend service is down" | mail -s "MakrCave Backend Alert" $ALERT_EMAIL
fi

if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "ALERT: Frontend service is down" | mail -s "MakrCave Frontend Alert" $ALERT_EMAIL
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "ALERT: Memory usage is ${MEMORY_USAGE}%" | mail -s "MakrCave Memory Alert" $ALERT_EMAIL
fi

# Check database connections
DB_CONNECTIONS=$(docker-compose -f /opt/makrcave/docker-compose.prod.yml exec -T postgres psql -U makrcave_user -d makrcave_db -t -c "SELECT count(*) FROM pg_stat_activity;" | tr -d ' ')
if [ $DB_CONNECTIONS -gt 50 ]; then
    echo "ALERT: High database connections: ${DB_CONNECTIONS}" | mail -s "MakrCave DB Alert" $ALERT_EMAIL
fi
```

Schedule monitoring checks:
```bash
# Check every 5 minutes
*/5 * * * * /opt/makrcave/alerts.sh
```

### 2. **Log Rotation Configuration**

Create `/etc/logrotate.d/makrcave`:
```
/var/log/makrcave/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 makrcave makrcave
    postrotate
        docker-compose -f /opt/makrcave/docker-compose.prod.yml restart backend
    endscript
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        nginx -s reload
    endscript
}
```

## 🔄 Update Procedures

### 1. **Application Updates**

```bash
#!/bin/bash
# update.sh - Application update script

cd /opt/makrcave

# Create backup before update
/opt/makrcave/backup.sh

# Pull latest code
git pull origin main

# Build new images
docker-compose -f docker-compose.prod.yml build --no-cache

# Update services with zero downtime
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
sleep 30
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend

# Run any new migrations
docker-compose -f docker-compose.prod.yml exec backend python -c "
import os
migration_files = [
    'migrations/create_member_tables.py',
    'migrations/create_skill_tables.py', 
    'migrations/create_analytics_tables.py'
]
for migration in migration_files:
    if os.path.exists(migration):
        os.system(f'python {migration}')
"

# Verify health
sleep 10
curl -f http://localhost:8000/health || echo "Backend health check failed"
curl -f http://localhost:3000/health || echo "Frontend health check failed"

echo "Update completed"
```

### 2. **Security Updates**

```bash
# System package updates
sudo apt update && sudo apt upgrade -y

# Docker updates
sudo apt update && sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Image updates
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### 1. **Common Issues**

#### Backend Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common fixes:
# 1. Database connection issues
docker-compose -f docker-compose.prod.yml restart postgres
# 2. Port conflicts
sudo netstat -tulpn | grep :8000
# 3. Permission issues
sudo chown -R makrcave:makrcave ./uploads ./logs
```

#### Frontend Not Loading
```bash
# Check nginx status
docker-compose -f docker-compose.prod.yml logs nginx

# Check if files exist
docker-compose -f docker-compose.prod.yml exec frontend ls -la /usr/share/nginx/html/

# Rebuild frontend
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

#### Database Connection Issues
```bash
# Check postgres status
docker-compose -f docker-compose.prod.yml logs postgres

# Check connection from backend
docker-compose -f docker-compose.prod.yml exec backend python -c "
from database import engine
try:
    result = engine.execute('SELECT 1').scalar()
    print('Database connection: OK')
except Exception as e:
    print(f'Database error: {e}')
"

# Reset database connection
docker-compose -f docker-compose.prod.yml restart postgres backend
```

### 2. **Performance Issues**

#### High CPU Usage
```bash
# Identify resource-heavy containers
docker stats

# Check backend processes
docker-compose -f docker-compose.prod.yml exec backend ps aux

# Scale backend if needed
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

#### High Memory Usage
```bash
# Check memory usage by service
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Clear caches
docker system prune -f
```

#### Slow Database Queries
```bash
# Enable query logging
docker-compose -f docker-compose.prod.yml exec postgres psql -U makrcave_user -d makrcave_db -c "
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
"

# Analyze slow queries
docker-compose -f docker-compose.prod.yml logs postgres | grep "duration:"
```

## 📈 Capacity Planning

### 1. **Resource Monitoring**

Track these metrics daily:
- CPU usage percentage
- Memory usage percentage  
- Disk usage percentage
- Database connection count
- Active user count
- API request rate

### 2. **Scaling Triggers**

Consider scaling when:
- CPU usage > 70% for 10+ minutes
- Memory usage > 80% for 5+ minutes
- Disk usage > 85%
- Database connections > 80% of max
- API response time > 2 seconds

### 3. **Scaling Options**

#### Vertical Scaling (Upgrade Server)
```bash
# Backup data
/opt/makrcave/backup.sh

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore on new server
# Transfer backup files and configurations
# Start services on new server
```

#### Horizontal Scaling (Load Balancing)
```bash
# Scale backend containers
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update nginx upstream config
# Add load balancing configuration
```

This maintenance guide ensures your MakrCave system runs smoothly and can handle growth over time.
