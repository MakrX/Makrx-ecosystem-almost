# MakrX Gateway Frontend - Production Deployment Guide

This guide provides step-by-step instructions for deploying the MakrX Gateway Frontend to production environments.

## 🎯 Pre-Deployment Requirements

### System Requirements
- **Node.js**: Version 18+ (LTS recommended)
- **Memory**: Minimum 4GB RAM for build process
- **Storage**: At least 10GB free space
- **Network**: HTTPS capability with valid SSL certificate
- **Domain**: Configured DNS pointing to your server

### Infrastructure Prerequisites
- **Web Server**: Nginx (recommended) or Apache
- **SSL Certificate**: Valid certificate for your domain
- **CDN**: CloudFlare, AWS CloudFront, or similar (recommended)
- **Monitoring**: Application performance monitoring solution
- **Backup**: Automated backup solution for static assets

## 📋 Pre-Deployment Checklist

### ✅ Configuration Verification

#### 1. Environment Variables
Ensure all production environment variables are configured:

```bash
# Check required variables are set
echo "Keycloak URL: $VITE_KEYCLOAK_URL"
echo "API Base URL: $VITE_API_BASE_URL"
echo "Company Name: $VITE_COMPANY_NAME"
echo "Support Email: $VITE_SUPPORT_EMAIL"
```

**Critical Variables to Update:**
```env
# Production URLs (MUST be updated)
VITE_KEYCLOAK_URL=https://auth.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_MAKRCAVE_URL=https://makrcave.yourdomain.com
VITE_STORE_URL=https://store.yourdomain.com
VITE_LEARN_URL=https://learn.yourdomain.com

# Company Information (MUST be updated)
VITE_COMPANY_NAME="Your Company Name"
VITE_COMPANY_CIN="YOUR_ACTUAL_CIN_NUMBER"
VITE_COMPANY_ADDRESS="Your registered office address"
VITE_SUPPORT_EMAIL="support@yourdomain.com"
VITE_SUPPORT_PHONE="+91 XXXX XXXXXX"

# Analytics (MUST be updated)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_HOTJAR_ID=XXXXXXX
```

#### 2. Code Customization Points
Update these files with your actual information:

**`components/Footer.tsx`** - Company Information:
```typescript
// Lines 100-130: Update company details
const companyInfo = {
  name: "Your Company Name",
  cin: "YOUR_ACTUAL_CIN",
  address: "Your registered address",
  phone: "+91 XXXX XXXXXX",
  email: "support@yourdomain.com"
};
```

**`pages/PrivacyPolicy.tsx`** - Data Protection Officer:
```typescript
// Lines 150-160: Update DPO contact information
const dpoContact = {
  name: "Your Data Protection Officer",
  email: "dpo@yourdomain.com",
  phone: "+91 XXXX XXXXXX"
};
```

**`pages/TermsOfService.tsx`** - Legal Jurisdiction:
```typescript
// Lines 200-210: Update jurisdiction and company details
const legalInfo = {
  company: "Your Company Name",
  jurisdiction: "Your State, India",
  registeredOffice: "Your complete address"
};
```

#### 3. Legal Policy Review
- [ ] Privacy Policy reviewed and updated with actual practices
- [ ] Terms of Service updated with your business model
- [ ] Cookie Policy configured for your analytics setup
- [ ] Accessibility Statement updated with contact information
- [ ] Returns Policy aligned with your business practices

#### 4. SEO Configuration
Update meta tags in `App.tsx`:
```typescript
<Helmet>
  <title>Your Company - Your Tagline</title>
  <meta name="description" content="Your actual value proposition and description" />
  <meta property="og:title" content="Your Company Name" />
  <meta property="og:url" content="https://yourdomain.com" />
  <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
  <link rel="canonical" href="https://yourdomain.com" />
</Helmet>
```

Update `public/sitemap.xml` with your domain:
```xml
<loc>https://yourdomain.com/</loc>
```

### ✅ Build Verification

#### 1. Production Build Test
```bash
# Navigate to gateway frontend
cd frontend/gateway-frontend

# Install dependencies
npm ci

# Run production build
npm run build

# Test build locally
npm run preview

# Check build output
ls -la dist/
```

**Expected Build Output:**
```
dist/
├── index.html                   (~1KB)
├── assets/
│   ├── index-[hash].css        (~120KB, ~19KB gzipped)
│   ├── index-[hash].js         (~720KB, ~107KB gzipped)
│   └── chunk-[hash].js         (various sizes)
└── [other static assets]
```

#### 2. Bundle Size Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check for large chunks (should be < 600KB warning)
# Optimize if necessary
```

#### 3. Performance Testing
```bash
# Run Lighthouse audit
npm run lighthouse

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 90+
# SEO: 90+
```

## 🚀 Deployment Methods

### Method 1: Static Hosting (Recommended)

#### Option A: Netlify Deployment

**Step 1: Prepare Netlify Configuration**
Create `netlify.toml` in project root:
```toml
[build]
  base = "frontend/gateway-frontend"
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer-when-downgrade"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "max-age=31536000, immutable"
```

**Step 2: Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=dist
```

**Step 3: Configure Environment Variables**
In Netlify dashboard, add all environment variables from your `.env.production` file.

#### Option B: Vercel Deployment

**Step 1: Configure Vercel**
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/gateway-frontend/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/gateway-frontend/dist/$1"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Step 2: Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option C: AWS S3 + CloudFront

**Step 1: Create S3 Bucket**
```bash
# Create S3 bucket
aws s3 mb s3://your-gateway-bucket

# Enable static website hosting
aws s3 website s3://your-gateway-bucket --index-document index.html --error-document index.html
```

**Step 2: Create CloudFront Distribution**
```bash
# Create distribution configuration
cat > cloudfront-config.json << EOF
{
  "CallerReference": "gateway-$(date +%s)",
  "Comment": "MakrX Gateway Frontend",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-gateway",
        "DomainName": "your-gateway-bucket.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-gateway",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "Enabled": true
}
EOF

# Create distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

**Step 3: Deploy Files**
```bash
# Build and sync to S3
npm run build
aws s3 sync dist/ s3://your-gateway-bucket/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Method 2: Docker Deployment

#### Step 1: Create Production Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/gateway-frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/gateway-frontend/ .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Step 2: Create Nginx Configuration
```nginx
# nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

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
    }
}
```

#### Step 3: Build and Deploy Docker Image
```bash
# Build Docker image
docker build -t makrx-gateway:latest -f Dockerfile .

# Test locally
docker run -p 8080:80 makrx-gateway:latest

# Tag for registry
docker tag makrx-gateway:latest your-registry/makrx-gateway:v1.0.0

# Push to registry
docker push your-registry/makrx-gateway:v1.0.0
```

### Method 3: Kubernetes Deployment

#### Step 1: Create Kubernetes Manifests

**Deployment Configuration:**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: makrx-gateway
  labels:
    app: makrx-gateway
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: makrx-gateway
  template:
    metadata:
      labels:
        app: makrx-gateway
        version: v1.0.0
    spec:
      containers:
      - name: makrx-gateway
        image: your-registry/makrx-gateway:v1.0.0
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Service Configuration:**
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: makrx-gateway-service
  labels:
    app: makrx-gateway
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
  selector:
    app: makrx-gateway
```

**Ingress Configuration:**
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: makrx-gateway-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - yourdomain.com
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
```

#### Step 2: Deploy to Kubernetes
```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress

# Monitor logs
kubectl logs -f deployment/makrx-gateway
```

## 🔧 Server Configuration

### Nginx Server Configuration

#### Complete Production Nginx Config
```nginx
# /etc/nginx/sites-available/makrx-gateway
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.yourdomain.com https://auth.yourdomain.com https://www.google-analytics.com;" always;

    # Document root
    root /var/www/makrx-gateway/dist;
    index index.html;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
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
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass https://api.yourdomain.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Block sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ \.(env|log|htaccess|htpasswd)$ {
        deny all;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Redirect www to non-www (optional)
server {
    listen 443 ssl http2;
    server_name www.yourdomain.com;
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    return 301 https://yourdomain.com$request_uri;
}
```

#### Enable the Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/makrx-gateway /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Apache Server Configuration

#### Virtual Host Configuration
```apache
# /etc/apache2/sites-available/makrx-gateway.conf
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/makrx-gateway/dist

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/yourdomain.crt
    SSLCertificateKeyFile /etc/ssl/private/yourdomain.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384

    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    # Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>

    # Cache static assets
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>

    # Handle React Router
    RewriteEngine On
    RewriteRule ^(.*)$ /index.html [QSA,L]

    # Error and access logs
    ErrorLog ${APACHE_LOG_DIR}/makrx-gateway-error.log
    CustomLog ${APACHE_LOG_DIR}/makrx-gateway-access.log combined
</VirtualHost>
```

## 📊 Post-Deployment Verification

### Automated Testing

#### 1. Smoke Tests
```bash
#!/bin/bash
# smoke-test.sh

DOMAIN="https://yourdomain.com"

echo "Running smoke tests for $DOMAIN"

# Test homepage
echo "Testing homepage..."
curl -f -s "$DOMAIN" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Homepage accessible"
else
    echo "❌ Homepage failed"
    exit 1
fi

# Test key routes
ROUTES=(
    "/about"
    "/ecosystem"
    "/privacy"
    "/terms"
    "/accessibility"
)

for route in "${ROUTES[@]}"; do
    echo "Testing $route..."
    curl -f -s "$DOMAIN$route" > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ $route accessible"
    else
        echo "❌ $route failed"
        exit 1
    fi
done

echo "All smoke tests passed!"
```

#### 2. Performance Tests
```bash
# performance-test.sh
#!/bin/bash

DOMAIN="https://yourdomain.com"

echo "Running performance tests..."

# Test with curl timing
echo "Testing response times..."
curl -w "@curl-format.txt" -o /dev/null -s "$DOMAIN"

# Test with PageSpeed Insights API
echo "Running PageSpeed test..."
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$DOMAIN&category=performance&category=accessibility&category=best-practices&category=seo"
```

#### 3. Security Tests
```bash
# security-test.sh
#!/bin/bash

DOMAIN="yourdomain.com"

echo "Running security tests..."

# SSL Labs test
echo "SSL configuration test..."
curl -s "https://api.ssllabs.com/api/v3/analyze?host=$DOMAIN&publish=off&all=done"

# Security headers test
echo "Security headers test..."
curl -I "https://$DOMAIN" | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options)"
```

### Manual Verification Checklist

#### ✅ Functionality Tests
- [ ] Homepage loads correctly
- [ ] Navigation menu works
- [ ] App launcher modal opens
- [ ] Statistics animation works
- [ ] Footer links work
- [ ] Legal policy pages load
- [ ] Contact information is correct
- [ ] Search functionality works (if implemented)

#### ✅ Authentication Tests
- [ ] Sign In button redirects to Keycloak
- [ ] Authentication flow completes successfully
- [ ] User can access protected areas
- [ ] Logout functionality works
- [ ] Session management works correctly

#### ✅ Cross-Portal Tests
- [ ] Links to MakrCave work
- [ ] Links to Store work  
- [ ] Links to Learn work
- [ ] Cross-portal authentication works
- [ ] User context is maintained across apps

#### ✅ Performance Tests
- [ ] Page load time < 3 seconds
- [ ] First contentful paint < 1.8 seconds
- [ ] Largest contentful paint < 2.5 seconds
- [ ] Cumulative layout shift < 0.1
- [ ] Images load properly
- [ ] Fonts load without flash

#### ✅ SEO & Accessibility Tests
- [ ] Meta tags are correct
- [ ] Open Graph tags work (test with social media)
- [ ] Sitemap.xml is accessible
- [ ] Robots.txt is configured correctly
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets standards
- [ ] Alt text on images

#### ✅ Mobile & Responsive Tests
- [ ] Site works on mobile devices
- [ ] Touch interactions work
- [ ] Responsive breakpoints work
- [ ] Text is readable on small screens
- [ ] Buttons are touch-friendly

#### ✅ Browser Compatibility Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 🔄 CI/CD Pipeline Setup

### GitHub Actions Workflow

Create `.github/workflows/deploy-gateway.yml`:
```yaml
name: Deploy Gateway Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/gateway-frontend/**']
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/gateway-frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend/gateway-frontend
        npm ci
    
    - name: Run tests
      run: |
        cd frontend/gateway-frontend
        npm run test
    
    - name: Run linting
      run: |
        cd frontend/gateway-frontend
        npm run lint
    
    - name: Type check
      run: |
        cd frontend/gateway-frontend
        npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/gateway-frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend/gateway-frontend
        npm ci
    
    - name: Build application
      run: |
        cd frontend/gateway-frontend
        npm run build
      env:
        VITE_KEYCLOAK_URL: ${{ secrets.VITE_KEYCLOAK_URL }}
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        VITE_GA_TRACKING_ID: ${{ secrets.VITE_GA_TRACKING_ID }}
        # Add all your environment variables
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: gateway-build
        path: frontend/gateway-frontend/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: gateway-build
        path: dist
    
    - name: Deploy to S3
      run: |
        aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}/ --delete
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
    
    - name: Run smoke tests
      run: |
        sleep 30  # Wait for deployment
        curl -f ${{ secrets.PRODUCTION_URL }}/health
```

### GitLab CI Pipeline

Create `.gitlab-ci.yml`:
```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:18-alpine
  before_script:
    - cd frontend/gateway-frontend
    - npm ci
  script:
    - npm run test
    - npm run lint
    - npm run type-check
  only:
    changes:
      - frontend/gateway-frontend/**/*

build:
  stage: build
  image: node:18-alpine
  before_script:
    - cd frontend/gateway-frontend
    - npm ci
  script:
    - npm run build
  artifacts:
    paths:
      - frontend/gateway-frontend/dist/
    expire_in: 1 hour
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl aws-cli
  script:
    - aws s3 sync frontend/gateway-frontend/dist/ s3://$S3_BUCKET/ --delete
    - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
    - sleep 30
    - curl -f $PRODUCTION_URL/health
  environment:
    name: production
    url: $PRODUCTION_URL
  only:
    - main
```

## 🚨 Troubleshooting Deployment Issues

### Common Problems and Solutions

#### Build Failures
**Issue**: TypeScript compilation errors
```bash
# Solution: Fix type errors
cd frontend/gateway-frontend
npm run type-check
# Fix errors shown in output
```

**Issue**: Missing environment variables
```bash
# Solution: Verify all required variables are set
echo $VITE_KEYCLOAK_URL
echo $VITE_API_BASE_URL
# Set missing variables
```

#### Runtime Issues
**Issue**: White screen or app not loading
```bash
# Check browser console for errors
# Common causes:
# 1. Missing environment variables
# 2. CORS issues
# 3. API endpoints not accessible
# 4. Authentication configuration issues
```

**Issue**: Authentication not working
```bash
# Verify Keycloak configuration:
# 1. Realm exists and is enabled
# 2. Client ID matches environment variable
# 3. Redirect URIs include your domain
# 4. CORS settings allow your domain
```

#### Performance Issues
**Issue**: Slow loading times
```bash
# Check bundle size
npm run build:analyze

# Optimize if needed:
# 1. Enable code splitting
# 2. Optimize images
# 3. Configure CDN
# 4. Enable compression
```

### Support and Escalation

For production issues:
1. **Immediate Issues**: Contact on-call DevOps team
2. **Security Issues**: Email security@yourdomain.com
3. **User Reports**: Check monitoring dashboards first
4. **Performance Issues**: Review performance metrics and logs

### Rollback Procedures

#### Quick Rollback (Static Hosting)
```bash
# Rollback to previous deployment
aws s3 sync s3://your-backup-bucket/previous-version/ s3://your-main-bucket/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Docker Rollback
```bash
# Rollback to previous image version
kubectl set image deployment/makrx-gateway makrx-gateway=your-registry/makrx-gateway:v1.0.0-previous
```

---

This deployment guide ensures a smooth, secure, and well-monitored production deployment of the MakrX Gateway Frontend. Follow all steps carefully and test thoroughly before going live.
