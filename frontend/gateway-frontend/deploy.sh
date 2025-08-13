#!/bin/bash

# MakrX Gateway Frontend Deployment Script
# This script automates the deployment process for the Gateway Frontend

set -e  # Exit on any error

# Configuration
APP_NAME="makrx-gateway"
BUILD_DIR="dist"
BACKUP_DIR="backup"
LOG_FILE="deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if deployment target is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <deployment-target>"
    echo "Available targets: local, staging, production, docker"
    exit 1
fi

DEPLOYMENT_TARGET=$1

log "Starting deployment for target: $DEPLOYMENT_TARGET"

# Pre-deployment checks
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version must be 18 or higher (current: v$NODE_VERSION)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    npm ci
    success "Dependencies installed"
}

# Run tests
run_tests() {
    log "Running tests..."
    if npm run test --silent; then
        success "All tests passed"
    else
        warning "Some tests failed, continuing deployment..."
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log "Cleaned previous build"
    fi
    
    # Run build
    npm run build
    
    # Verify build
    if [ ! -d "$BUILD_DIR" ]; then
        error "Build failed - no dist directory found"
    fi
    
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        error "Build failed - no index.html found"
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    log "Build size: $BUILD_SIZE"
    
    success "Application built successfully"
}

# Create backup
create_backup() {
    if [ -d "/var/www/$APP_NAME" ]; then
        log "Creating backup..."
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        cp -r "/var/www/$APP_NAME" "$BACKUP_DIR/$BACKUP_NAME"
        success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Deploy to local preview
deploy_local() {
    log "Starting local deployment..."
    npm run preview &
    PREVIEW_PID=$!
    
    sleep 3
    
    if kill -0 $PREVIEW_PID 2>/dev/null; then
        success "Local preview started on http://localhost:4173"
        log "Preview PID: $PREVIEW_PID"
        log "To stop preview: kill $PREVIEW_PID"
    else
        error "Failed to start local preview"
    fi
}

# Deploy to staging
deploy_staging() {
    log "Starting staging deployment..."
    
    # Add staging-specific environment variables
    export NODE_ENV=staging
    
    # Build with staging config
    build_application
    
    # Deploy to staging server (customize this for your setup)
    if command -v rsync &> /dev/null; then
        log "Syncing files to staging server..."
        # rsync -avz --delete "$BUILD_DIR/" user@staging-server:/var/www/makrx-gateway/
        log "Staging deployment would sync to staging server (commented out for safety)"
    fi
    
    success "Staging deployment completed"
}

# Deploy to production
deploy_production() {
    log "Starting production deployment..."
    
    # Production safety checks
    read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " -r
    if [[ ! $REPLY =~ ^yes$ ]]; then
        log "Production deployment cancelled by user"
        exit 0
    fi
    
    # Verify environment
    if [ ! -f ".env.production" ]; then
        warning "No .env.production file found"
    fi
    
    export NODE_ENV=production
    
    # Create backup
    create_backup
    
    # Build application
    build_application
    
    # Deploy to production server (customize this for your setup)
    log "Production deployment would sync to production server (commented out for safety)"
    # rsync -avz --delete "$BUILD_DIR/" user@production-server:/var/www/makrx-gateway/
    
    # Restart web server
    # sudo systemctl reload nginx
    
    success "Production deployment completed"
}

# Docker deployment
deploy_docker() {
    log "Starting Docker deployment..."
    
    # Build Docker image
    log "Building Docker image..."
    docker build -t "$APP_NAME:latest" .
    
    # Stop existing container
    if docker ps -q -f name="$APP_NAME" | grep -q .; then
        log "Stopping existing container..."
        docker stop "$APP_NAME"
        docker rm "$APP_NAME"
    fi
    
    # Run new container
    log "Starting new container..."
    docker run -d \
        --name "$APP_NAME" \
        --restart unless-stopped \
        -p 8080:8080 \
        "$APP_NAME:latest"
    
    # Health check
    sleep 10
    if curl -f http://localhost:8080/health &>/dev/null; then
        success "Docker deployment completed - health check passed"
    else
        error "Docker deployment failed - health check failed"
    fi
}

# Health check
health_check() {
    log "Running health check..."
    
    case $DEPLOYMENT_TARGET in
        "local")
            URL="http://localhost:4173"
            ;;
        "staging")
            URL="https://staging.yourdomain.com"
            ;;
        "production")
            URL="https://yourdomain.com"
            ;;
        "docker")
            URL="http://localhost:8080"
            ;;
        *)
            log "Skipping health check for unknown target"
            return
            ;;
    esac
    
    if command -v curl &> /dev/null; then
        if curl -f -s "$URL/health" &>/dev/null; then
            success "Health check passed for $URL"
        else
            warning "Health check failed for $URL"
        fi
    else
        warning "curl not available, skipping health check"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up temporary files..."
    # Add cleanup commands here if needed
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "=== MakrX Gateway Frontend Deployment ==="
    log "Target: $DEPLOYMENT_TARGET"
    log "Timestamp: $(date)"
    
    check_prerequisites
    install_dependencies
    run_tests
    
    case $DEPLOYMENT_TARGET in
        "local")
            deploy_local
            ;;
        "staging")
            deploy_staging
            ;;
        "production")
            deploy_production
            ;;
        "docker")
            deploy_docker
            ;;
        *)
            error "Unknown deployment target: $DEPLOYMENT_TARGET"
            ;;
    esac
    
    health_check
    cleanup
    
    success "=== Deployment completed successfully ==="
    log "Deployment log saved to: $LOG_FILE"
}

# Trap errors and cleanup
trap 'error "Deployment failed at line $LINENO"' ERR

# Run main deployment
main

exit 0
