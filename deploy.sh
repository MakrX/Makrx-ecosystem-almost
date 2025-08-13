#!/bin/bash

# ==============================================
# MakrCave Production Deployment Script
# ==============================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/var/backups/makrcave"
LOG_FILE="/var/log/makrcave-deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    error "Production environment file not found. Copy .env.production.template to .env.production and configure it."
fi

# Load environment variables
set -o allexport
source .env.production
set +o allexport

log "Starting MakrCave production deployment..."

# Create necessary directories
log "Creating necessary directories..."
sudo mkdir -p "$BACKUP_DIR" /var/log/makrcave /var/makrcave/uploads /etc/nginx/ssl
sudo chown -R $USER:$USER "$BACKUP_DIR" /var/log/makrcave /var/makrcave

# Backup existing data if it exists
if [ -d "makrcave-backend" ]; then
    log "Creating backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    
    # Backup database if running
    if docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
        log "Backing up database..."
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U makrcave_user makrcave_db > "$BACKUP_DIR/db_backup_$timestamp.sql"
    fi
    
    # Backup uploads
    if [ -d "./uploads" ]; then
        log "Backing up uploads..."
        tar -czf "$BACKUP_DIR/uploads_backup_$timestamp.tar.gz" ./uploads
    fi
fi

# Stop existing services
log "Stopping existing services..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Pull latest images and build
log "Building and pulling latest images..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml build --no-cache

# Start database first
log "Starting database..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for database to be ready
log "Waiting for database to be ready..."
timeout=60
counter=0
until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U makrcave_user -d makrcave_db; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -gt $timeout ]; then
        error "Database failed to start within $timeout seconds"
    fi
done

# Run database migrations
log "Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend python migrations/create_member_tables.py || warn "Member tables migration failed or already exists"
docker-compose -f docker-compose.prod.yml run --rm backend python migrations/create_skill_tables.py || warn "Skill tables migration failed or already exists"
docker-compose -f docker-compose.prod.yml run --rm backend python migrations/create_analytics_tables.py || warn "Analytics tables migration failed or already exists"

# Start all services
log "Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
log "Waiting for services to be healthy..."
timeout=120
counter=0
until docker-compose -f docker-compose.prod.yml ps | grep -E "(backend|frontend)" | grep -q "healthy\|Up"; do
    sleep 5
    counter=$((counter + 5))
    if [ $counter -gt $timeout ]; then
        error "Services failed to start within $timeout seconds"
    fi
    log "Waiting for services... ($counter/$timeout seconds)"
done

# Verify deployment
log "Verifying deployment..."

# Check backend health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    log "✓ Backend health check passed"
else
    error "✗ Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    log "✓ Frontend health check passed"
else
    error "✗ Frontend health check failed"
fi

# Check database connection
if docker-compose -f docker-compose.prod.yml exec -T postgres psql -U makrcave_user -d makrcave_db -c "SELECT 1;" > /dev/null 2>&1; then
    log "✓ Database connection check passed"
else
    error "✗ Database connection check failed"
fi

# Display running services
log "Deployment completed successfully!"
log "Running services:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
log "Recent logs from backend service:"
docker-compose -f docker-compose.prod.yml logs --tail=10 backend

log "Recent logs from frontend service:"
docker-compose -f docker-compose.prod.yml logs --tail=10 frontend

# Post-deployment instructions
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Services are running on:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo ""
echo "Next steps:"
echo "  1. Configure your domain DNS to point to this server"
echo "  2. Set up SSL certificates (Let's Encrypt recommended)"
echo "  3. Update nginx configuration with your domain"
echo "  4. Configure monitoring and alerting"
echo "  5. Set up automated backups"
echo ""
echo "Useful commands:"
echo "  • View logs: docker-compose -f docker-compose.prod.yml logs -f [service]"
echo "  • Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  • Update: git pull && ./deploy.sh"
echo ""
