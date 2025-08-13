# MakrX Gateway Frontend

The **MakrX Gateway Frontend** is the primary landing page and entry point for the entire MakrX ecosystem. Built with React 18.3.1, TypeScript, and Vite, it serves as the unified public gateway connecting users to external MakrX ecosystem applications.

## 🎯 Overview

The Gateway Frontend is designed as a **simplified public gateway** that serves as the first touchpoint for visitors discovering the MakrX ecosystem. It provides:

- **Public Gateway**: Clean, informational landing page without authentication complexity
- **Dark/Light Mode Support**: Comprehensive theme system with system preference detection
- **External App Launcher**: Direct links to external MakrX ecosystem domains
- **Ecosystem Overview**: Comprehensive introduction to MakrX services and applications
- **Legal Compliance**: Full DPDP Act 2023 and Indian regulatory compliance
- **SEO Optimization**: Structured data and comprehensive meta tags for better discoverability
- **Performance**: Optimized for Core Web Vitals and accessibility

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.2.2 for fast development and optimized builds
- **Styling**: Tailwind CSS with custom MakrX design system
- **Routing**: React Router DOM v6 for client-side navigation
- **State Management**: React Context API (minimal, no authentication state)
- **UI Components**: Custom components with Lucide React icons
- **Query Management**: TanStack React Query for data fetching

### Project Structure
```
frontend/gateway-frontend/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, cards, etc.)
│   ├── Header.tsx       # Main navigation header with app launcher
│   ├── Footer.tsx       # Site footer with company information
│   └── SEOStructuredData.tsx # Structured data for SEO
├── lib/                 # Utility libraries
│   ├── ui.tsx           # UI theme provider and utilities
│   └── utils.ts         # Helper functions and utilities
├── pages/               # Route components (all public pages)
│   ├── HomePage.tsx     # Main landing page
│   ├── About.tsx        # Company information
│   ├── Ecosystem.tsx    # Ecosystem overview and app launcher
│   ├── Makerspaces.tsx  # MakrCave information and CTA
│   ├── Store.tsx        # MakrX.Store information
│   ├── ServiceProviders.tsx # Service provider onboarding
│   ├── ThreeDStore.tsx  # 3D printing services
│   ├── Events.tsx       # Events and workshops
│   ├── Blog.tsx         # Blog and content
│   ├── Docs.tsx         # Documentation portal
│   ├── Careers.tsx      # Career opportunities
│   ├── Press.tsx        # Press and media
│   ├── Contact.tsx      # Contact information
│   ├── Support.tsx      # Support and help
│   ├── Status.tsx       # System status
│   ├── PrivacyPolicy.tsx # DPDP Act 2023 compliant
│   ├── TermsOfService.tsx # Legal terms
│   └── NotFound.tsx     # 404 error page
├── public/              # Static assets
│   ├── sitemap.xml      # SEO sitemap
│   ├── robots.txt       # Search engine directives
│   └── manifest.json    # Web app manifest
└── src/
    └── main.tsx         # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Git for version control

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd frontend/gateway-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create a `.env.local` file with the following variables:

```env
# Application Configuration
VITE_APP_NAME=MakrX Gateway
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production

# MakrX Ecosystem URLs (External Domains)
VITE_MAKRCAVE_URL=https://makrcave.com
VITE_STORE_URL=https://makrx.store
VITE_3D_STORE_URL=https://3d.makrx.store

# Authentication (Optional - for external auth links)
VITE_AUTH_URL=https://auth.makrx.org

# Analytics & Monitoring
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_HOTJAR_ID=XXXXXXX

# Company Information (MUST UPDATE FOR PRODUCTION)
VITE_COMPANY_NAME="Your Company Name"
VITE_COMPANY_LEGAL_NAME="Your Company Legal Name Pvt Ltd"
VITE_COMPANY_CIN="U72900XX2024PTC123456"
VITE_SUPPORT_EMAIL="support@yourdomain.com"
VITE_SUPPORT_PHONE="+91 XXXX XXXXXX"
```

## 🎨 Customization

### Branding & Design
The Gateway uses a custom MakrX design system built on Tailwind CSS:

```css
/* Custom Colors in tailwind.config.ts */
colors: {
  'makrx-blue': '#1e40af',    // Primary brand blue
  'makrx-yellow': '#f59e0b',  // Accent yellow
  'makrx-dark': '#0f172a',    // Dark backgrounds
}
```

### Dark/Light Mode System
Comprehensive theme support with automatic system preference detection:

```typescript
// Theme usage in components
import { ThemeToggle, useTheme } from '../lib/ui';

function MyComponent() {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 transition-colors">
      <ThemeToggle variant="compact" />
      <p className="text-gray-900 dark:text-white">
        Current theme: {actualTheme}
      </p>
    </div>
  );
}
```

**Features:**
- Light, Dark, and System theme options
- Persistent theme storage in localStorage
- Automatic OS preference detection
- Mobile browser status bar integration
- WCAG 2.1 AA compliant contrast ratios
- Smooth transitions between themes

### External App Integration
The Gateway provides direct navigation to external MakrX ecosystem applications:

```typescript
// External app configuration in Header.tsx
const launcherApps = [
  {
    name: 'MakrCave',
    description: 'Makerspace Management',
    url: 'https://makrcave.com',
    color: 'blue'
  },
  {
    name: 'MakrX.Store',
    description: 'Tools & Components',
    url: 'https://makrx.store',
    color: 'green'
  },
  {
    name: '3D.MakrX.Store',
    description: 'Custom Fabrication',
    url: 'https://3d.makrx.store',
    color: 'purple'
  }
];
```

### Content Management
Key content areas that can be customized:

1. **Hero Section** (`pages/HomePage.tsx` lines 185-220)
2. **Statistics** (`pages/HomePage.tsx` lines 310-320)
3. **Company Information** (`components/Footer.tsx` lines 100-130)
4. **Legal Policies** (individual policy pages)

## 🔧 Configuration

### External Authentication
The Gateway links to external authentication services:

1. **Sign In Button**: Direct link to external auth service (e.g., `https://auth.makrx.org/login`)
2. **No Internal Auth State**: Gateway doesn't manage authentication internally
3. **External App Access**: Users authenticate directly on each external application
4. **SSO Recommendation**: External apps can share authentication via SSO

### Page Structure
The Gateway includes the following public pages:

- **/** - Homepage with ecosystem overview and hero section
- **/ecosystem** - Detailed ecosystem overview with app launcher
- **/makerspaces** - Information about MakrCave and makerspace access
- **/store** - Information about MakrX.Store marketplace
- **/service-providers** - Service provider onboarding and information
- **/3d** - 3D printing and custom fabrication services
- **/events** - Events, workshops, and community activities
- **/blog** - Blog and content hub
- **/docs** - Documentation and guides
- **/careers** - Career opportunities
- **/about** - Company information
- **/contact** - Contact information and support
- **/legal/privacy** - Privacy policy (DPDP Act 2023 compliant)
- **/legal/terms** - Terms of service

### SEO Configuration
Update SEO metadata in `App.tsx`:

```typescript
<Helmet>
  <title>MakrX - Your Creative Ecosystem</title>
  <meta name="description" content="Access world-class makerspaces..." />
  <meta property="og:title" content="MakrX - Your Creative Ecosystem" />
  <link rel="canonical" href="https://makrx.org" />
</Helmet>
```

## 📋 Production Deployment

### Build Process
```bash
# Create production build
npm run build

# Preview build locally
npm run preview

# Build size analysis (optional)
npm run build:analyze

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Required Changes for Production

#### 1. Environment Variables
Replace all placeholder environment variables with production values:

```env
# Update these for production
VITE_MAKRCAVE_URL=https://makrcave.com    # Your actual MakrCave domain
VITE_STORE_URL=https://makrx.store        # Your actual Store domain
VITE_3D_STORE_URL=https://3d.makrx.store  # Your actual 3D Store domain
VITE_GA_TRACKING_ID=G-XXXXXXXXXX         # Your Google Analytics ID
```

#### 2. Company Information
Update company details using environment variables (see `.env.example`):

```env
# Company Information (MUST UPDATE FOR PRODUCTION)
VITE_COMPANY_NAME="Your Company Name"
VITE_COMPANY_LEGAL_NAME="Your Company Legal Name Pvt Ltd"
VITE_COMPANY_CIN="U72900XX2024PTC123456"
VITE_COMPANY_ADDRESS="Your complete registered office address"
VITE_SUPPORT_EMAIL="support@yourdomain.com"
VITE_SUPPORT_PHONE="+91 XXXX XXXXXX"
VITE_PRIVACY_OFFICER_EMAIL="privacy@yourdomain.com"
```

#### 3. Legal Policies
Review and customize legal policy pages:
- `pages/PrivacyPolicy.tsx` - Update contact information and data handling practices
- `pages/TermsOfService.tsx` - Update jurisdiction and company details
- Legal pages automatically use environment variables for company information
- Ensure all placeholder text is customized for your business context

#### 4. Analytics & Monitoring
Configure production monitoring:

```typescript
// Update analytics configuration
const analyticsConfig = {
  googleAnalytics: 'G-XXXXXXXXXX',  // Your GA4 property
  hotjar: 'XXXXXXX',                // Your Hotjar site ID
  sentry: 'https://xxx@sentry.io/xxx' // Your Sentry DSN
};
```

### Deployment Options

#### Option 1: Static Hosting (Recommended)
Deploy to Netlify, Vercel, or AWS S3:

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
# The build outputs to 'dist/' directory
```

**Netlify:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
npm run build
vercel --prod
```

#### Option 2: Docker Deployment
Use the included Dockerfile for containerized deployment:

```bash
# Build Docker image
npm run build:docker
# or
docker build -t makrx-gateway .

# Run container
npm run docker:run
# or
docker run -p 8080:8080 makrx-gateway

# Docker Compose
npm run docker:compose
```

The Dockerfile includes:
- Multi-stage build for optimization
- Security hardening (non-root user)
- Health checks
- Nginx configuration for SPA routing

#### Option 3: CDN Integration
Configure your CDN to serve the built assets with proper caching headers.

### Performance Optimization

The Gateway is optimized for performance:
- **Code Splitting**: Automatic chunk splitting configured in Vite
- **Tree Shaking**: Dead code elimination enabled
- **Asset Optimization**: Images and assets optimized during build
- **Modern Bundle**: Targets modern browsers for optimal size

Build configuration includes:
```typescript
// vite.config.ts
rollupOptions: {
  output: {
    manualChunks: {
      vendor: ['react', 'react-dom'],
      router: ['react-router-dom'],
      utils: ['lucide-react', '@tanstack/react-query'],
    }
  }
}
```

For further optimization:
1. CDN configuration for static assets
2. Server-level compression (gzip/brotli)
3. Caching headers configuration
4. Image optimization and WebP format

## 🔐 Security

### Content Security Policy
Implement CSP headers:

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.makrx.org https://auth.makrx.org;
```

### Environment Security
- Never commit `.env.local` files to version control (already in .gitignore)
- Use secure environment variable management in production
- All external links use HTTPS
- No sensitive API keys stored (public gateway only)
- Enable HTTPS enforcement and security headers

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Error Tracking**: Sentry integration for error reporting
- **User Analytics**: Google Analytics 4 for user behavior
- **Heatmaps**: Hotjar for user interaction insights

### Health Checks
The Docker container includes health monitoring:
- HTTP health check endpoint at `/health`
- Nginx status monitoring
- Container readiness and liveness probes
- Static asset serving verification

## 🧪 Testing

### Test Suites
```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:lighthouse
```

### Testing Checklist
- [ ] All routes load correctly
- [ ] Authentication flow works
- [ ] App launcher functions properly
- [ ] Legal pages are accessible
- [ ] SEO metadata is correct
- [ ] Performance meets targets
- [ ] Accessibility compliance (WCAG 2.1 AA)

## 🐛 Troubleshooting

### Common Issues

**Build Errors**:
- Ensure Node.js version 18+
- Clear `node_modules` and reinstall dependencies
- Check TypeScript compilation errors

**External Link Issues**:
- Verify external domain URLs are correct
- Check HTTPS certificate validity for external apps
- Ensure external apps handle cross-origin requests properly

**Performance Issues**:
- Analyze bundle size with `npm run analyze`
- Check for memory leaks in React components
- Optimize images and assets

### Support Channels
- **Technical Issues**: Create issue in repository
- **Production Support**: Contact DevOps team
- **Security Issues**: security@makrx.org

## 📈 Roadmap

### Planned Features
- [ ] Progressive Web App (PWA) support
- [ ] Multi-language support (i18n)
- [ ] Enhanced SEO with dynamic sitemaps
- [ ] Performance monitoring dashboard
- [ ] Enhanced accessibility features
- [ ] Content management integration

### Contributing
See [CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for development guidelines and contribution process.

## 📄 License

Copyright © 2024 Botness Technologies Pvt Ltd. All rights reserved.
