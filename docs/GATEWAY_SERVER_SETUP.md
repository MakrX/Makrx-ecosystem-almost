# MakrX Gateway Frontend - Server Setup & Environment Guide

This comprehensive guide covers server setup, environment configuration, and infrastructure requirements for hosting the MakrX Gateway Frontend in production.

## 🎯 Overview

The Gateway Frontend can be deployed in various hosting environments, from simple static hosting to full Kubernetes clusters. This guide provides detailed instructions for setting up production-ready infrastructure.

## 🏗️ Infrastructure Requirements

### Minimum System Requirements

#### Static Hosting (Recommended)
- **CDN**: CloudFlare, AWS CloudFront, or similar
- **Storage**: 1GB for assets and builds
- **Bandwidth**: 100GB/month (scales with traffic)
- **SSL Certificate**: Valid TLS 1.2+ certificate
- **Domain**: Custom domain with DNS management

#### VPS/Server Hosting
- **CPU**: 2 vCPUs minimum (4 vCPUs recommended)
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 20GB SSD minimum (50GB recommended)
- **Network**: 100Mbps+ bandwidth
- **OS**: Ubuntu 20.04+ LTS or CentOS 8+

#### Container/Kubernetes Hosting
- **Nodes**: 3 worker nodes minimum
- **Resources per pod**: 256MB RAM, 0.25 CPU minimum
- **Storage**: Persistent volumes for assets
- **Load Balancer**: External load balancer capability
- **Ingress Controller**: Nginx or Traefik

### Network Requirements

#### Firewall Rules
```bash
# HTTP/HTTPS traffic
Port 80  (HTTP)  - Open to 0.0.0.0/0
Port 443 (HTTPS) - Open to 0.0.0.0/0

# SSH access (restrict to admin IPs)
Port 22  (SSH)   - Open to admin IP ranges only

# Optional: Custom ports for monitoring
Port 9090 (Prometheus) - Internal network only
Port 3000 (Grafana)    - Internal network only
```

#### DNS Configuration
```
# Primary domain
yourdomain.com          A     YOUR_SERVER_IP
www.yourdomain.com      CNAME yourdomain.com

# Subdomains (if hosting multiple services)
api.yourdomain.com      A     YOUR_API_SERVER_IP
auth.yourdomain.com     A     YOUR_KEYCLOAK_SERVER_IP
cdn.yourdomain.com      CNAME your-cdn-endpoint.com

# Security records
yourdomain.com          CAA   0 issue "letsencrypt.org"
yourdomain.com          CAA   0 issuewild "letsencrypt.org"
```

## 🖥️ Server Setup

### Option 1: Ubuntu Server Setup

#### 1. Initial Server Configuration
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Create non-root user
sudo adduser makrx
sudo usermod -aG sudo makrx
sudo su - makrx

# Configure SSH key authentication
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Add your public key to ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 2. Install Node.js and npm
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher

# Install process manager
sudo npm install -g pm2
```

#### 3. Install and Configure Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# Test Nginx installation
curl http://localhost
```

#### 4. SSL Certificate Setup with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run

# Set up auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Option 2: CentOS/RHEL Server Setup

#### 1. Initial Server Configuration
```bash
# Update system packages
sudo yum update -y

# Install EPEL repository
sudo yum install -y epel-release

# Install essential packages
sudo yum install -y curl wget git unzip firewalld

# Configure firewall
sudo systemctl enable firewalld
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

#### 2. Install Node.js and npm
```bash
# Install Node.js 18.x LTS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install development tools if needed
sudo yum groupinstall -y "Development Tools"

# Install PM2
sudo npm install -g pm2
```

#### 3. Install and Configure Nginx
```bash
# Install Nginx
sudo yum install -y nginx

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Test installation
curl http://localhost
```

## 🔧 Web Server Configuration

### Nginx Configuration

#### Main Nginx Configuration
File: `/etc/nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Events block
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

# HTTP block
http {
    # Basic settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';
    
    # Logging
    access_log /var/log/nginx/access.log main;
    
    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    
    # Security settings
    server_tokens off;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # Include virtual host configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

#### Virtual Host Configuration
File: `/etc/nginx/sites-available/makrx-gateway`

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Redirect www to non-www (optional)
server {
    listen 443 ssl http2;
    server_name www.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    return 301 https://yourdomain.com$request_uri;
}

# Main server configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # Document root
    root /var/www/makrx-gateway/dist;
    index index.html;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.yourdomain.com https://auth.yourdomain.com https://www.google-analytics.com; frame-ancestors 'none';" always;
    
    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Logging
    access_log /var/log/nginx/makrx-gateway-access.log main;
    error_log /var/log/nginx/makrx-gateway-error.log warn;
    
    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        
        # Enable CORS for fonts
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin '*';
            add_header Access-Control-Allow-Methods 'GET, OPTIONS';
            add_header Access-Control-Allow-Headers 'Range';
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
        
        if ($request_method = 'GET') {
            add_header Access-Control-Allow-Origin '*';
            add_header Access-Control-Allow-Methods 'GET, OPTIONS';
            add_header Access-Control-Allow-Headers 'Range';
        }
    }
    
    # Cache HTML with short expiry
    location ~* \.(html)$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # API proxy (if serving API from same domain)
    location /api/ {
        # Rate limiting for API endpoints
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass https://api.yourdomain.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # Headers
        proxy_set_header Connection "";
        proxy_http_version 1.1;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Monitoring endpoint (internal only)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        deny all;
    }
    
    # Block sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|log|htaccess|htpasswd|ini|conf|sql|backup|tar|gz|bak)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Security restrictions
    location ~ ^/(admin|wp-admin|phpmyadmin) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### Enable the Site
```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/makrx-gateway /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Apache Configuration (Alternative)

#### Main Apache Configuration
File: `/etc/apache2/apache2.conf` (Ubuntu) or `/etc/httpd/conf/httpd.conf` (CentOS)

```apache
# Basic configuration
ServerRoot "/etc/apache2"
PidFile ${APACHE_PID_FILE}
Timeout 300
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5

# Enable required modules
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so
LoadModule headers_module modules/mod_headers.so
LoadModule deflate_module modules/mod_deflate.so
LoadModule expires_module modules/mod_expires.so

# Security settings
ServerTokens Prod
ServerSignature Off

# Performance settings
StartServers 2
MinSpareServers 2
MaxSpareServers 5
MaxRequestWorkers 150
```

#### Virtual Host Configuration
File: `/etc/apache2/sites-available/makrx-gateway.conf`

```apache
# HTTP to HTTPS redirect
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # Let's Encrypt challenge
    DocumentRoot /var/www/letsencrypt
    <Directory "/var/www/letsencrypt">
        AllowOverride None
        Require all granted
    </Directory>
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/.well-known/acme-challenge/
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</VirtualHost>

# HTTPS Virtual Host
<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/makrx-gateway/dist
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305
    SSLHonorCipherOrder off
    SSLSessionTickets off
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    
    # Content Security Policy
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.yourdomain.com https://auth.yourdomain.com;"
    
    # Compression
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png|ico|svg|webp)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Cache static assets
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>
    
    # Cache HTML files briefly
    <LocationMatch "\.html$">
        ExpiresActive On
        ExpiresDefault "access plus 1 hour"
        Header set Cache-Control "public, must-revalidate"
    </LocationMatch>
    
    # Handle React Router
    RewriteEngine On
    
    # Handle client-side routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
    
    # Block sensitive files
    <FilesMatch "\.(env|log|htaccess|htpasswd|ini|conf|sql)$">
        Require all denied
    </FilesMatch>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/makrx-gateway-error.log
    CustomLog ${APACHE_LOG_DIR}/makrx-gateway-access.log combined
    LogLevel warn
</VirtualHost>
```

## 🐳 Docker Setup

### Docker Installation

#### Ubuntu Docker Installation
```bash
# Remove old Docker versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker-compose --version
```

### Production Docker Deployment

#### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/gateway-frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY frontend/gateway-frontend/ .

# Build application
RUN npm run build

# Production stage
FROM nginx:1.24-alpine AS production

# Install additional packages
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -G nginx-user

# Set permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d

# Create pid file directory
RUN mkdir -p /var/run/nginx && \
    chown -R nginx-user:nginx-user /var/run/nginx

# Switch to non-root user
USER nginx-user

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose Configuration
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  makrx-gateway:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: makrx-gateway
    restart: unless-stopped
    ports:
      - "80:8080"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/var/log/nginx
    networks:
      - makrx-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.datadoghq.ad.check_names=[\"nginx\"]"
      - "com.datadoghq.ad.init_configs=[{}]"
      - "com.datadoghq.ad.instances=[{\"nginx_status_url\":\"http://%%host%%:8080/nginx_status\"}]"

  # Reverse proxy (if using Traefik)
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./acme.json:/acme.json
    networks:
      - makrx-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`traefik.yourdomain.com`)"
      - "traefik.http.routers.api.tls=true"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"

networks:
  makrx-network:
    driver: bridge

volumes:
  traefik-acme:
```

#### Nginx Configuration for Docker
File: `default.conf`

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Nginx status (for monitoring)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 172.16.0.0/12;
        deny all;
    }
}
```

## ☸️ Kubernetes Setup

### Kubernetes Cluster Requirements

#### Cluster Specifications
```yaml
# Minimum cluster requirements
apiVersion: v1
kind: Namespace
metadata:
  name: makrx-production
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: makrx-quota
  namespace: makrx-production
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "10"
    services: "5"
    secrets: "10"
    configmaps: "10"
```

### Kubernetes Manifests

#### Deployment Configuration
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: makrx-gateway
  namespace: makrx-production
  labels:
    app: makrx-gateway
    version: v1.0.0
    environment: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: makrx-gateway
  template:
    metadata:
      labels:
        app: makrx-gateway
        version: v1.0.0
    spec:
      # Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
        
      # Pod anti-affinity for high availability
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - makrx-gateway
              topologyKey: kubernetes.io/hostname
              
      containers:
      - name: makrx-gateway
        image: your-registry/makrx-gateway:v1.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP
          
        # Environment variables
        env:
        - name: NODE_ENV
          value: "production"
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
              
        # Resource limits
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
            
        # Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
          
        # Startup probe
        startupProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30
          
        # Security context
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
            
        # Volume mounts
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /var/cache/nginx
        - name: run
          mountPath: /var/run
          
      # Volumes
      volumes:
      - name: tmp
        emptyDir: {}
      - name: cache
        emptyDir: {}
      - name: run
        emptyDir: {}
        
      # Image pull secrets
      imagePullSecrets:
      - name: registry-secret
```

#### Service Configuration
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: makrx-gateway-service
  namespace: makrx-production
  labels:
    app: makrx-gateway
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: makrx-gateway
---
# Headless service for StatefulSets (if needed)
apiVersion: v1
kind: Service
metadata:
  name: makrx-gateway-headless
  namespace: makrx-production
  labels:
    app: makrx-gateway
spec:
  clusterIP: None
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: makrx-gateway
```

#### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: makrx-gateway-ingress
  namespace: makrx-production
  annotations:
    # Nginx ingress annotations
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    
    # Security annotations
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header X-Frame-Options "SAMEORIGIN" always;
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-XSS-Protection "1; mode=block" always;
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
      
    # Rate limiting
    nginx.ingress.kubernetes.io/rate-limit-rpm: "300"
    nginx.ingress.kubernetes.io/rate-limit-connections: "10"
    
    # SSL configuration
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    cert-manager.io/acme-challenge-type: http01
    
    # Monitoring annotations
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/metrics"
    
spec:
  tls:
  - hosts:
    - yourdomain.com
    - www.yourdomain.com
    secretName: makrx-gateway-tls
    
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: makrx-gateway-service
            port:
              number: 80
              
  - host: www.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: makrx-gateway-service
            port:
              number: 80
```

#### ConfigMap for Configuration
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: makrx-gateway-config
  namespace: makrx-production
data:
  nginx.conf: |
    server {
        listen 8080;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Metrics endpoint for Prometheus
        location /metrics {
            stub_status on;
            access_log off;
            allow 10.0.0.0/8;
            allow 172.16.0.0/12;
            allow 192.168.0.0/16;
            deny all;
        }
    }
```

#### Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: makrx-gateway-hpa
  namespace: makrx-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: makrx-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
```

#### Network Policy
```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: makrx-gateway-netpol
  namespace: makrx-production
spec:
  podSelector:
    matchLabels:
      app: makrx-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    # Allow traffic from ingress controller
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    # Allow traffic from monitoring
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 8080
  egress:
  # Allow DNS resolution
  - to: []
    ports:
    - protocol: UDP
      port: 53
  # Allow HTTPS outbound (for API calls)
  - to: []
    ports:
    - protocol: TCP
      port: 443
  # Allow HTTP outbound (for health checks)
  - to: []
    ports:
    - protocol: TCP
      port: 80
```

### Deployment Commands

#### Deploy to Kubernetes
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network-policy.yaml

# Check deployment status
kubectl get pods -n makrx-production
kubectl get services -n makrx-production
kubectl get ingress -n makrx-production

# Monitor rollout
kubectl rollout status deployment/makrx-gateway -n makrx-production

# View logs
kubectl logs -f deployment/makrx-gateway -n makrx-production

# Scale deployment
kubectl scale deployment makrx-gateway --replicas=5 -n makrx-production
```

## 📊 Monitoring & Logging Setup

### System Monitoring

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
- job_name: 'makrx-gateway'
  static_configs:
  - targets: ['yourdomain.com:443']
  scheme: https
  metrics_path: /metrics
  scrape_interval: 30s
  
- job_name: 'nginx'
  static_configs:
  - targets: ['yourdomain.com:443']
  scheme: https
  metrics_path: /nginx_status
  scrape_interval: 30s

alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - alertmanager:9093
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "MakrX Gateway Frontend",
    "panels": [
      {
        "title": "HTTP Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(nginx_http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(nginx_http_requests_total{status=~\"4..|5..\"}[5m]) / rate(nginx_http_requests_total[5m])"
          }
        ]
      }
    ]
  }
}
```

### Log Management

#### Logrotate Configuration
```bash
# /etc/logrotate.d/makrx-gateway
/var/log/nginx/makrx-gateway-*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    copytruncate
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

#### Centralized Logging with ELK Stack
```yaml
# docker-compose.elk.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
      
  logstash:
    image: logstash:8.11.0
    container_name: logstash
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
      - /var/log/nginx:/var/log/nginx:ro
    depends_on:
      - elasticsearch
      
  kibana:
    image: kibana:8.11.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

## 🔒 Security Hardening

### Firewall Configuration

#### UFW (Ubuntu)
```bash
# Reset firewall rules
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH access (restrict to specific IPs)
sudo ufw allow from YOUR_ADMIN_IP to any port 22

# HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow specific outbound connections
sudo ufw allow out 53/udp    # DNS
sudo ufw allow out 80/tcp    # HTTP
sudo ufw allow out 443/tcp   # HTTPS
sudo ufw allow out 123/udp   # NTP

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status verbose
```

#### Fail2Ban Configuration
```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create jail configuration
sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
banaction = ufw

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/*error.log
maxretry = 6

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/*error.log
maxretry = 10
EOF

# Start and enable Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

### SSL/TLS Security

#### SSL Test and Optimization
```bash
# Test SSL configuration
curl -I https://yourdomain.com
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Generate strong DH parameters
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048

# Add to Nginx configuration
ssl_dhparam /etc/nginx/dhparam.pem;
```

#### Security Headers Validation
```bash
# Test security headers
curl -I https://yourdomain.com

# Should include:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: default-src 'self'...
# Referrer-Policy: no-referrer-when-downgrade
```

### Automated Security Updates

#### Unattended Upgrades (Ubuntu)
```bash
# Install unattended upgrades
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Edit configuration
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades

# Enable automatic reboot if required
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
```

---

This comprehensive server setup guide provides everything needed to deploy the MakrX Gateway Frontend in a production environment with proper security, monitoring, and scalability configurations.
