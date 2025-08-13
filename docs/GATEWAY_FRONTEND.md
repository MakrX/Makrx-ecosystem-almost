# MakrX Gateway Frontend Documentation

## Overview

The MakrX Gateway Frontend serves as the primary entry point and unified portal for the entire MakrX ecosystem. This document provides comprehensive technical documentation for setup, configuration, deployment, and maintenance of the gateway application.

## Quick Start

### Development Setup
```bash
cd frontend/gateway-frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Test build locally
```

## Architecture & Design

### System Architecture
The Gateway Frontend follows a simplified React architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Browser/Client                        │
├─────────────────────────────────────────────────────────┤
│  React Router (Client-side routing)                     │
├─────────────────────────────────────────────────────────┤
│  Theme Provider (UI theming)                            │
├─────────────────────────────────────────────────────────┤
│  Component Layer                                        │
│  ├── Pages (Public route components)                   │
│  ├── Components (Header, Footer, UI)                   │
���  └── Utilities (Helpers, styles)                       │
├─────────────────────────────────────────────────────────┤
│  External Ecosystem Links                               │
│  ├── MakrCave (makrcave.com)                           │
│  ├── MakrX.Store (makrx.store)                         │
│  ├── 3D.MakrX.Store (3d.makrx.store)                   │
│  └── External Auth (auth.makrx.org)                    │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.2.2 (fast development, optimized builds)
- **Styling**: Tailwind CSS with custom MakrX design system
- **Routing**: React Router DOM v6 (client-side routing)
- **State Management**: Minimal (theme provider only)
- **Icons**: Lucide React (lightweight icon library)
- **Data Fetching**: TanStack React Query (for future API needs)
- **Testing**: Vitest + React Testing Library
- **Type Safety**: TypeScript with strict configuration
- **Meta Tags**: React Helmet Async for SEO

### Design System Integration
The Gateway uses a unified MakrX design system:

```typescript
// Tailwind configuration
export const makrxTheme = {
  colors: {
    'makrx-blue': '#1e40af',     // Primary brand color
    'makrx-yellow': '#f59e0b',   // Accent/CTA color  
    'makrx-dark': '#0f172a',     // Dark theme base
  },
  fontFamily: {
    'sans': ['Inter', 'system-ui', 'sans-serif'],
  },
  spacing: {
    // 8px grid system
  }
}
```

## Core Features

### 1. Unified Authentication (SSO)
- **Provider**: Keycloak hosted at `auth.makrx.org`
- **Flow**: Authorization Code with PKCE
- **Session Management**: JWT tokens with refresh capability
- **Cross-Portal**: Shared authentication across all MakrX apps

```typescript
// Authentication configuration
const keycloakConfig = {
  url: process.env.VITE_KEYCLOAK_URL,
  realm: 'makrx',
  clientId: 'makrx-gateway'
};
```

### 2. App Launcher System
Central hub providing access to all MakrX applications:

- **MakrCave**: Makerspace management and booking
- **Store**: E-commerce marketplace for maker tools
- **Learn**: Educational platform and skill development
- **Admin**: Administrative interfaces (role-based)

### 3. Feature Flag System
Dynamic feature control without deployments:

```typescript
// Feature flag usage
const showStats = useBooleanFlag('org.homepage.stats', true);
const enableNewFeature = useBooleanFlag('org.new-feature', false);
```

Available flags:
- `org.homepage.stats` - Statistics display
- `org.homepage.testimonials` - User testimonials
- `org.homepage.video` - Promotional video
- `org.header.app-launcher` - App launcher visibility
- `org.footer.newsletter` - Newsletter subscription

### 4. Legal Compliance
Comprehensive compliance with Indian regulations:

- **DPDP Act 2023**: Data protection and privacy
- **Consumer Protection Act 2019**: E-commerce compliance
- **WCAG 2.1 AA**: Accessibility standards
- **GST Compliance**: Tax-related disclosures

## Configuration

### Environment Variables
Create `.env.local` file in the Gateway Frontend directory:

```env
# Core Application
VITE_APP_NAME=MakrX Gateway
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production

# Authentication (Keycloak SSO)
VITE_KEYCLOAK_URL=https://auth.makrx.org
VITE_KEYCLOAK_REALM=makrx
VITE_KEYCLOAK_CLIENT_ID=makrx-gateway

# Portal Integration
VITE_MAKRCAVE_URL=https://makrcave.makrx.org
VITE_STORE_URL=https://store.makrx.org  
VITE_LEARN_URL=https://learn.makrx.org

# API Configuration
VITE_API_BASE_URL=https://api.makrx.org
VITE_GATEWAY_API_URL=https://gateway-api.makrx.org

# Feature Flags
VITE_ENABLE_FEATURE_FLAGS=true
VITE_FEATURE_FLAG_SERVICE_URL=https://flags.makrx.org
VITE_FEATURE_FLAG_POLLING_INTERVAL=30000

# Analytics & Monitoring
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_HOTJAR_ID=XXXXXXX

# Company Information (Legal Pages)
VITE_COMPANY_NAME="Botness Technologies Pvt Ltd"
VITE_COMPANY_CIN="U72900KA2024PTC123456"
VITE_COMPANY_ADDRESS="Your registered office address"
VITE_SUPPORT_EMAIL="hello@makrx.org"
VITE_SUPPORT_PHONE="+91 80472 58000"
VITE_PRIVACY_OFFICER_EMAIL="privacy@makrx.org"

# Social Media
VITE_TWITTER_HANDLE="@makrx"
VITE_LINKEDIN_URL="https://linkedin.com/company/makrx"
VITE_GITHUB_URL="https://github.com/makrx"

# CDN & Assets
VITE_CDN_URL=https://cdn.makrx.org
VITE_ASSETS_VERSION=v1.0.0
```

### Required Production Changes

#### 1. Company Information Updates
In `components/Footer.tsx`, update these placeholder values:

```typescript
// CHANGE THESE FOR PRODUCTION:
const companyDetails = {
  name: "YOUR_COMPANY_NAME",           // Replace with actual company
  cin: "YOUR_ACTUAL_CIN_NUMBER",       // Replace with real CIN
  address: "YOUR_REGISTERED_ADDRESS",   // Complete registered address
  phone: "YOUR_SUPPORT_NUMBER",        // Customer support number
  email: "YOUR_SUPPORT_EMAIL"          // Customer support email
};
```

#### 2. Legal Policy Updates
Update contact information in all legal pages:

- **Privacy Policy** (`pages/PrivacyPolicy.tsx`): Update Data Protection Officer details
- **Terms of Service** (`pages/TermsOfService.tsx`): Update jurisdiction and company details
- **Accessibility Statement** (`pages/AccessibilityStatement.tsx`): Update feedback contact
- **Returns Policy** (`pages/ReturnsPolicy.tsx`): Update return process details

#### 3. Analytics Configuration
Replace placeholder tracking IDs:

```typescript
// In App.tsx or analytics configuration
const analyticsConfig = {
  googleAnalytics: 'G-XXXXXXXXXX',     // Your actual GA4 property
  hotjar: 'XXXXXXX',                   // Your Hotjar site ID  
  sentry: 'https://xxx@sentry.io/xxx', // Your actual Sentry DSN
};
```

#### 4. SEO Metadata
Update meta tags in `App.tsx`:

```typescript
<Helmet>
  <title>Your Company - Creative Ecosystem</title>
  <meta name="description" content="Your actual value proposition..." />
  <meta property="og:title" content="Your Company Name" />
  <meta property="og:url" content="https://yourdomain.com" />
  <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
  <link rel="canonical" href="https://yourdomain.com" />
</Helmet>
```

## Production Deployment

### Pre-Deployment Checklist

#### ✅ Environment Configuration
- [ ] All environment variables configured for production
- [ ] Company information updated (no placeholders)
- [ ] Legal policies reviewed and customized
- [ ] Analytics tracking IDs configured
- [ ] CDN URLs updated for static assets

#### ✅ Security Configuration  
- [ ] HTTPS enforcement enabled
- [ ] Content Security Policy configured
- [ ] CORS settings properly configured
- [ ] API keys and secrets secured (not in code)
- [ ] Environment variables secured in deployment platform

#### ✅ Performance Optimization
- [ ] Production build tested (`npm run build`)
- [ ] Bundle size analyzed and optimized
- [ ] Image assets optimized and compressed
- [ ] CDN configured for static assets
- [ ] Caching headers configured

#### ✅ SEO & Accessibility
- [ ] Sitemap.xml generated and accessible
- [ ] Robots.txt configured correctly
- [ ] Meta tags and structured data verified
- [ ] Accessibility testing completed (WCAG 2.1 AA)
- [ ] Lighthouse scores meet targets (90+)

### Deployment Options

#### Option 1: Static Hosting (Recommended)

**Netlify Deployment:**
```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

**Vercel Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**AWS S3 + CloudFront:**
```bash
# Build and sync to S3
npm run build
aws s3 sync dist/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Option 2: Docker Deployment

Create `Dockerfile`:
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
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "no-referrer-when-downgrade" always;

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Handle client-side routing
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Build and deploy:
```bash
docker build -t makrx-gateway .
docker run -p 80:80 makrx-gateway
```

#### Option 3: Kubernetes Deployment

Create `k8s-deployment.yaml`:
```yaml
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
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
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
    targetPort: 80
  type: LoadBalancer
```

### Server Configuration

#### Web Server Setup (Nginx)
```nginx
# /etc/nginx/sites-available/makrx-gateway
server {
    listen 443 ssl http2;
    server_name makrx.org www.makrx.org;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # CSP header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.makrx.org https://auth.makrx.org;" always;

    # Document root
    root /var/www/makrx-gateway/dist;
    index index.html;

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
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass https://api.makrx.org/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name makrx.org www.makrx.org;
    return 301 https://$server_name$request_uri;
}
```

#### Apache Configuration
```apache
<VirtualHost *:443>
    ServerName makrx.org
    DocumentRoot /var/www/makrx-gateway/dist
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/ssl/certificate.crt
    SSLCertificateKeyFile /path/to/ssl/private.key
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    
    # Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
    </Location>
    
    # Handle React Router
    RewriteEngine On
    RewriteRule ^(.*)$ /index.html [QSA,L]
</VirtualHost>
```

## Integration Setup

### Keycloak SSO Configuration

#### 1. Realm Setup
Create a new realm named `makrx` in your Keycloak instance:

```json
{
  "realm": "makrx",
  "enabled": true,
  "loginTheme": "makrx-theme",
  "accessTokenLifespan": 300,
  "refreshTokenMaxReuse": 0,
  "ssoSessionMaxLifespan": 28800
}
```

#### 2. Client Configuration
Create client for the Gateway Frontend:

```json
{
  "clientId": "makrx-gateway",
  "enabled": true,
  "protocol": "openid-connect",
  "publicClient": true,
  "redirectUris": [
    "https://makrx.org/*",
    "http://localhost:5173/*"
  ],
  "webOrigins": [
    "https://makrx.org",
    "http://localhost:5173"
  ],
  "attributes": {
    "pkce.code.challenge.method": "S256"
  }
}
```

#### 3. Role Mappings
Define application roles:

```json
{
  "roles": {
    "realm": [
      {
        "name": "user",
        "description": "Standard user access"
      },
      {
        "name": "maker",
        "description": "Verified maker with enhanced access"
      },
      {
        "name": "admin",
        "description": "Administrative access"
      },
      {
        "name": "super-admin",
        "description": "Full system administration"
      }
    ]
  }
}
```

### Cross-Portal Authentication

The Gateway Frontend supports seamless authentication across all MakrX portals:

```typescript
// Cross-portal auth configuration
const crossPortalConfig = {
  portals: [
    {
      name: 'makrcave',
      url: 'https://makrcave.makrx.org',
      clientId: 'makrx-makrcave'
    },
    {
      name: 'store', 
      url: 'https://store.makrx.org',
      clientId: 'makrx-store'
    },
    {
      name: 'learn',
      url: 'https://learn.makrx.org', 
      clientId: 'makrx-learn'
    }
  ]
};
```

### Feature Flag Service Integration

#### 1. Service Setup
Deploy a feature flag service or integrate with existing solution:

```typescript
// Feature flag service configuration
const featureFlagConfig = {
  serviceUrl: 'https://flags.makrx.org',
  pollingInterval: 30000, // 30 seconds
  fallbackFlags: {
    'org.homepage.stats': true,
    'org.homepage.testimonials': true,
    'org.homepage.video': false
  }
};
```

#### 2. Flag Definitions
Define feature flags in your service:

```json
{
  "flags": [
    {
      "key": "org.homepage.stats",
      "name": "Homepage Statistics",
      "description": "Display user and makerspace statistics on homepage",
      "defaultValue": true,
      "rules": []
    },
    {
      "key": "org.header.app-launcher", 
      "name": "App Launcher Button",
      "description": "Show app launcher button in header",
      "defaultValue": true,
      "rules": [
        {
          "condition": "user.role == 'admin'",
          "value": true
        }
      ]
    }
  ]
}
```

## Monitoring & Operations

### Performance Monitoring

#### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms  
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.8s

#### Monitoring Setup
```typescript
// Performance monitoring configuration
const performanceConfig = {
  enableWebVitals: true,
  enableResourceTiming: true,
  enableUserTiming: true,
  samplingRate: 1.0, // 100% in production, reduce if needed
};
```

### Error Monitoring

#### Sentry Configuration
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Analytics Tracking

#### Google Analytics 4 Setup
```typescript
// GA4 configuration
const analyticsConfig = {
  measurementId: process.env.VITE_GA_TRACKING_ID,
  enableEnhancedEcommerce: true,
  enableUserID: true,
  customDimensions: {
    userRole: 'custom_dimension_1',
    portalSource: 'custom_dimension_2'
  }
};
```

### Health Checks

#### Application Health Endpoint
The Gateway includes health check endpoints:

```typescript
// Health check configuration
const healthChecks = {
  '/health': 'Application health status',
  '/health/ready': 'Readiness probe for K8s',
  '/health/live': 'Liveness probe for K8s'
};
```

#### External Service Monitoring
```typescript
// Monitor external service health
const serviceHealth = {
  keycloak: 'https://auth.makrx.org/health',
  api: 'https://api.makrx.org/health',
  flags: 'https://flags.makrx.org/health'
};
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Authentication Issues
- Verify Keycloak realm and client configuration
- Check CORS settings in Keycloak
- Ensure redirect URIs are correctly configured
- Verify SSL certificate validity

#### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check for memory leaks
npm run dev -- --debug

# Lighthouse audit
npm run lighthouse
```

#### Feature Flag Issues
- Verify feature flag service connectivity
- Check polling interval and fallback values
- Monitor flag evaluation performance
- Validate flag key naming conventions

### Debug Mode
Enable debug mode for development:

```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Support Escalation
- **Technical Issues**: Create GitHub issue with reproduction steps
- **Security Issues**: Contact security@makrx.org immediately  
- **Production Issues**: Follow incident response procedures
- **Integration Issues**: Contact DevOps team via established channels

## Security Considerations

### Authentication Security
- Implement PKCE for OAuth flows
- Use secure cookie settings for session management
- Enable MFA for administrative accounts
- Regular security audits of authentication flow

### Data Protection
- Implement DPDP Act 2023 compliance measures
- Use HTTPS everywhere with HSTS
- Implement proper CORS policies
- Regular security scans and vulnerability assessments

### Content Security
- Implement strict Content Security Policy
- Sanitize all user inputs
- Use prepared statements for database queries
- Regular dependency security updates

---

For additional technical documentation, see:
- [API Documentation](./API.md)
- [Security Guidelines](./SECURITY.md) 
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
