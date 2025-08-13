# MakrX Gateway Frontend - Current Deployment Guide

## Overview

This guide covers deployment of the **simplified MakrX Gateway Frontend** - a public gateway that serves as an informational entry point to the MakrX ecosystem without internal authentication complexity.

## Pre-Deployment Checklist

### ✅ Required Configuration Updates

#### 1. Environment Variables
Update `.env.local` with production values:

```env
# Application Configuration
VITE_APP_NAME=MakrX Gateway
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production

# External Ecosystem URLs (UPDATE THESE)
VITE_MAKRCAVE_URL=https://makrcave.com
VITE_STORE_URL=https://makrx.store
VITE_3D_STORE_URL=https://3d.makrx.store
VITE_AUTH_URL=https://auth.makrx.org

# Company Information (MUST UPDATE FOR PRODUCTION)
VITE_COMPANY_NAME="Your Company Name"
VITE_COMPANY_LEGAL_NAME="Your Company Legal Name Pvt Ltd"
VITE_COMPANY_CIN="U72900XX2024PTC123456"
VITE_COMPANY_GST="29XXXXX1234X1ZX"
VITE_COMPANY_ADDRESS="Your complete registered office address"
VITE_COMPANY_CITY="Your City"
VITE_COMPANY_STATE="Your State"
VITE_COMPANY_PINCODE="123456"
VITE_SUPPORT_EMAIL="support@yourdomain.com"
VITE_SUPPORT_PHONE="+91 XXXX XXXXXX"
VITE_PRIVACY_OFFICER_EMAIL="privacy@yourdomain.com"

# Social Media (UPDATE FOR PRODUCTION)
VITE_TWITTER_HANDLE="@yourcompany"
VITE_LINKEDIN_URL="https://linkedin.com/company/yourcompany"
VITE_GITHUB_URL="https://github.com/yourcompany"

# Analytics (Optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_HOTJAR_ID=XXXXXXX
```

#### 2. Legal Policy Updates
Review and customize these pages with your company information:
- `pages/PrivacyPolicy.tsx` - Data protection and DPDP Act 2023 compliance
- `pages/TermsOfService.tsx` - Update jurisdiction and company details
- All legal pages automatically use environment variables for company information

#### 3. SEO Configuration
Update meta tags in `App.tsx`:
```typescript
<Helmet>
  <title>Your Company - Digital Manufacturing Ecosystem</title>
  <meta name="description" content="Your actual value proposition..." />
  <meta property="og:title" content="Your Company Name" />
  <meta property="og:url" content="https://yourdomain.com" />
  <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
  <link rel="canonical" href="https://yourdomain.com" />
</Helmet>
```

### ✅ Build Verification

```bash
# Navigate to gateway frontend
cd frontend/gateway-frontend

# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Create production build
npm run build

# Test build locally
npm run preview
```

### ✅ Security Checklist
- [ ] All environment variables use production values
- [ ] No sensitive information in code
- [ ] HTTPS enforced for external links
- [ ] Content Security Policy configured
- [ ] Legal policies reviewed and customized

### ✅ Performance Checklist
- [ ] Bundle size analyzed (`npm run build:analyze`)
- [ ] Images optimized and compressed
- [ ] Lighthouse scores meet targets (90+)
- [ ] Core Web Vitals optimized

## Deployment Options

### Option 1: Static Hosting (Recommended)

The simplified gateway is ideal for static hosting services.

#### Netlify Deployment

1. **Prepare build:**
```bash
npm run build
```

2. **Deploy via CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=dist
```

3. **Configure build settings in `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Vercel Deployment

1. **Deploy via CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

2. **Configure in `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### AWS S3 + CloudFront

1. **Build and prepare:**
```bash
npm run build
```

2. **Deploy to S3:**
```bash
# Sync to S3 bucket
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Configure bucket for static website hosting
aws s3 website s3://your-bucket-name/ --index-document index.html --error-document index.html
```

3. **Configure CloudFront distribution:**
```json
{
  "Origins": [
    {
      "Id": "S3-your-bucket-name",
      "DomainName": "your-bucket-name.s3.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-your-bucket-name",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "managed-caching-optimized"
  },
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html"
    }
  ]
}
```

### Option 2: Docker Deployment

The gateway includes a production-ready Dockerfile.

#### Build and Run

```bash
# Build Docker image
docker build -t makrx-gateway .

# Run container
docker run -p 8080:8080 makrx-gateway

# Or use npm scripts
npm run build:docker
npm run docker:run
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  gateway:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: makrx-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: makrx-gateway
  template:
    metadata:
      labels:
        app: makrx-gateway
    spec:
      containers:
      - name: makrx-gateway
        image: makrx-gateway:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: makrx-gateway-service
spec:
  selector:
    app: makrx-gateway
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

### Option 3: Traditional Web Server

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/makrx-gateway
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CSP header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://auth.makrx.org;" always;

    # Document root
    root /var/www/makrx-gateway/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Handle React Router (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check endpoint (for Docker deployments)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Post-Deployment Verification

### 1. Functional Testing
- [ ] All pages load correctly
- [ ] External app links work properly
- [ ] Mobile responsiveness verified
- [ ] Contact forms functional (if any)
- [ ] Legal pages display correct company information

### 2. Performance Testing
```bash
# Run Lighthouse audit
npm install -g @lhci/cli
lhci autorun --upload.target=filesystem --upload.outputDir=./lighthouse-reports
```

### 3. SEO Verification
- [ ] Meta tags display correctly in social media previews
- [ ] Sitemap.xml accessible and valid
- [ ] Robots.txt configured properly
- [ ] Structured data validates in Google's Rich Results Test

### 4. Security Testing
- [ ] HTTPS enforced (no HTTP access)
- [ ] Security headers present
- [ ] No console errors or warnings
- [ ] External links use `rel="noopener noreferrer"`

### 5. Analytics Setup
If using Google Analytics:
```javascript
// Verify GA4 is tracking properly
gtag('config', 'G-XXXXXXXXXX', {
  page_title: document.title,
  page_location: window.location.href
});
```

## Monitoring and Maintenance

### Health Monitoring
- **Uptime Monitoring**: Set up external monitoring (Pingdom, UptimeRobot)
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Sentry integration (if configured)

### Regular Maintenance
- **Dependency Updates**: Monthly security updates
- **Performance Audits**: Quarterly Lighthouse audits
- **Content Review**: Regular legal policy updates
- **External Link Verification**: Ensure ecosystem links remain valid

### Backup and Recovery
- **Source Code**: Ensure code is backed up in version control
- **Environment Variables**: Secure backup of production environment config
- **Static Assets**: CDN and origin server backups

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

#### Routing Issues
- Ensure server is configured for SPA routing
- Check that all routes fall back to `/index.html`
- Verify no conflicting server rules

#### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npx webpack-bundle-analyzer dist/assets/*.js
```

#### External Link Issues
- Verify external ecosystem URLs are correct and accessible
- Check CORS configuration if needed
- Ensure HTTPS certificates are valid

### Support Channels
- **Technical Issues**: Create GitHub issue with reproduction steps
- **Security Issues**: Contact security@yourdomain.com immediately
- **Production Issues**: Follow incident response procedures

---

This deployment guide ensures a smooth deployment of the simplified MakrX Gateway Frontend with focus on performance, security, and maintainability.
