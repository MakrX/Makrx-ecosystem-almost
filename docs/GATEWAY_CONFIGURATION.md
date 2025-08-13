# MakrX Gateway Frontend - Configuration & Customization Guide

This guide provides comprehensive information about configuring and customizing the MakrX Gateway Frontend for your specific needs.

## 🎯 Overview

The Gateway Frontend is designed to be highly configurable and customizable while maintaining the core MakrX experience. This document covers:

- Environment configuration
- Feature flag management
- Theme and branding customization
- Content management
- Integration configuration
- Legal compliance customization

## 🔧 Environment Configuration

### Core Environment Variables

#### Authentication Configuration
```env
# Keycloak SSO Configuration
VITE_KEYCLOAK_URL=https://auth.yourdomain.com
VITE_KEYCLOAK_REALM=makrx
VITE_KEYCLOAK_CLIENT_ID=makrx-gateway

# Authentication behavior
VITE_AUTH_AUTO_LOGIN=false
VITE_AUTH_REMEMBER_ME=true
VITE_AUTH_SESSION_TIMEOUT=28800
```

#### Portal Integration
```env
# MakrX Ecosystem URLs
VITE_MAKRCAVE_URL=https://makrcave.yourdomain.com
VITE_STORE_URL=https://store.yourdomain.com
VITE_LEARN_URL=https://learn.yourdomain.com

# API Endpoints
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GATEWAY_API_URL=https://gateway-api.yourdomain.com
VITE_WEBSOCKET_URL=wss://ws.yourdomain.com
```

#### Feature Flags
```env
# Feature Flag Service
VITE_ENABLE_FEATURE_FLAGS=true
VITE_FEATURE_FLAG_SERVICE_URL=https://flags.yourdomain.com
VITE_FEATURE_FLAG_POLLING_INTERVAL=30000
VITE_FEATURE_FLAG_CACHE_TTL=300000

# Fallback flags (used when service unavailable)
VITE_FALLBACK_FLAGS={"org.homepage.stats":true,"org.homepage.testimonials":true}
```

#### Analytics & Monitoring
```env
# Google Analytics 4
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_GA_ENHANCED_ECOMMERCE=true
VITE_GA_ANONYMIZE_IP=true

# Error Monitoring
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_SAMPLE_RATE=0.1

# User Experience Monitoring
VITE_HOTJAR_ID=XXXXXXX
VITE_HOTJAR_VERSION=6

# Performance Monitoring
VITE_ENABLE_WEB_VITALS=true
VITE_PERFORMANCE_OBSERVER=true
```

#### Company Information
```env
# Legal Entity Information
VITE_COMPANY_NAME="Your Company Name"
VITE_COMPANY_LEGAL_NAME="Your Company Legal Name Pvt Ltd"
VITE_COMPANY_CIN="U72900XX2024PTC123456"
VITE_COMPANY_GST="29XXXXX1234X1ZX"

# Contact Information
VITE_COMPANY_ADDRESS="Your complete registered office address"
VITE_COMPANY_CITY="Your City"
VITE_COMPANY_STATE="Your State"
VITE_COMPANY_PINCODE="123456"
VITE_COMPANY_COUNTRY="India"

# Communication
VITE_SUPPORT_EMAIL="support@yourdomain.com"
VITE_SUPPORT_PHONE="+91 XXXX XXXXXX"
VITE_SALES_EMAIL="sales@yourdomain.com"
VITE_PRIVACY_OFFICER_EMAIL="privacy@yourdomain.com"
```

#### Social Media & External Links
```env
# Social Media Handles
VITE_TWITTER_HANDLE="@yourcompany"
VITE_LINKEDIN_URL="https://linkedin.com/company/yourcompany"
VITE_FACEBOOK_URL="https://facebook.com/yourcompany"
VITE_INSTAGRAM_HANDLE="@yourcompany"
VITE_YOUTUBE_CHANNEL="https://youtube.com/@yourcompany"
VITE_GITHUB_URL="https://github.com/yourcompany"

# External Links
VITE_BLOG_URL="https://blog.yourdomain.com"
VITE_HELP_CENTER_URL="https://help.yourdomain.com"
VITE_STATUS_PAGE_URL="https://status.yourdomain.com"
```

#### CDN & Assets
```env
# Content Delivery
VITE_CDN_URL=https://cdn.yourdomain.com
VITE_ASSETS_VERSION=v1.0.0
VITE_IMAGE_CDN_URL=https://images.yourdomain.com

# External Assets
VITE_FONT_CDN=https://fonts.googleapis.com
VITE_ICON_CDN=https://cdn.yourdomain.com/icons
```

### Environment-Specific Configurations

#### Development Environment (.env.development)
```env
# Development-specific settings
VITE_NODE_ENV=development
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

# Development URLs
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:3000

# Development features
VITE_ENABLE_DEV_TOOLS=true
VITE_MOCK_API=true
VITE_HOT_RELOAD=true
```

#### Staging Environment (.env.staging)
```env
# Staging-specific settings
VITE_NODE_ENV=staging
VITE_DEBUG=false
VITE_LOG_LEVEL=info

# Staging URLs
VITE_KEYCLOAK_URL=https://auth-staging.yourdomain.com
VITE_API_BASE_URL=https://api-staging.yourdomain.com

# Staging features
VITE_ENABLE_STAGING_BANNER=true
VITE_GA_TRACKING_ID=G-STAGING-ID
```

#### Production Environment (.env.production)
```env
# Production settings
VITE_NODE_ENV=production
VITE_DEBUG=false
VITE_LOG_LEVEL=error

# Production URLs
VITE_KEYCLOAK_URL=https://auth.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com

# Production optimizations
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_COMPRESSION=true
VITE_ENABLE_CACHING=true
```

## 🎨 Theme & Branding Customization

### Color Scheme Configuration

#### Update Tailwind Configuration
File: `tailwind.config.ts`

```typescript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        'primary': {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',  // Your primary blue
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        
        // Secondary/Accent Colors  
        'accent': {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',  // Your accent yellow
          600: '#d97706',
          700: '#b45309',
        },
        
        // Legacy MakrX colors (can be updated)
        'makrx-blue': '#1e40af',
        'makrx-yellow': '#f59e0b',
        'makrx-dark': '#0f172a',
        
        // Custom semantic colors
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
      
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
    },
  },
  plugins: [],
}
```

#### Global CSS Variables
File: `global.css`

```css
:root {
  /* Brand Colors */
  --color-primary: #1e40af;
  --color-primary-dark: #1e3a8a;
  --color-accent: #f59e0b;
  --color-accent-dark: #d97706;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Typography */
  --font-family-primary: 'Inter', system-ui, sans-serif;
  --font-family-display: 'Inter', system-ui, sans-serif;
  
  /* Spacing */
  --spacing-unit: 0.25rem; /* 4px */
  --border-radius: 0.5rem;
  --border-radius-lg: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Dark mode variables */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0f172a;
    --color-text: #f1f5f9;
    --color-text-muted: #94a3b8;
  }
}
```

### Logo and Branding Assets

#### Logo Configuration
File: `components/EnhancedHeader.tsx`

```typescript
// Update logo configuration
const logoConfig = {
  // Main logo (light backgrounds)
  primary: "/assets/logo-primary.svg",
  
  // Dark logo (dark backgrounds)  
  dark: "/assets/logo-dark.svg",
  
  // Icon only (mobile/compact view)
  icon: "/assets/logo-icon.svg",
  
  // Alternative formats
  png: "/assets/logo.png",
  webp: "/assets/logo.webp",
};

// Logo component usage
<img 
  src={logoConfig.primary}
  alt="Your Company Name"
  className="h-8 w-auto"
/>
```

#### Favicon and App Icons
Update these files in `public/`:

```
public/
├── favicon.ico          # Main favicon
├── apple-touch-icon.png # iOS home screen icon (180x180)
├── icon-192.png         # Android icon (192x192)
├── icon-512.png         # Android icon (512x512)
├��─ og-image.jpg         # Social media preview (1200x630)
└── manifest.json        # PWA manifest
```

### Typography Customization

#### Font Loading
File: `index.html`

```html
<head>
  <!-- Custom fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Or use a different font -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
```

#### Typography Scale
File: `lib/typography.ts`

```typescript
export const typography = {
  // Heading sizes
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
  h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg md:text-xl font-medium',
  h6: 'text-base md:text-lg font-medium',
  
  // Body text
  body: 'text-base leading-relaxed',
  bodyLarge: 'text-lg leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  
  // Special text
  caption: 'text-xs text-gray-600',
  label: 'text-sm font-medium',
  button: 'text-sm font-semibold',
};
```

## 🏠 Content Customization

### Homepage Content

#### Hero Section
File: `pages/HomePage.tsx` (lines 185-250)

```typescript
// Customize hero content
const heroContent = {
  title: "Your Company Name",
  subtitle: "Dream. • Make. • Share.",
  description: "Your value proposition and key message to users",
  cta: {
    primary: "Get Started Free",
    secondary: "Launch Apps"
  },
  backgroundVideo: "/assets/hero-video.mp4", // Optional
};
```

#### Statistics Section
File: `pages/HomePage.tsx` (lines 310-350)

```typescript
// Update statistics to match your business
const statistics = [
  {
    number: "100+",  // Update with your numbers
    label: "Makerspaces",
    icon: <Building2 className="w-8 h-8 text-makrx-yellow" />,
    description: "Premium makerspaces across India"
  },
  {
    number: "50K+", // Update with your numbers
    label: "Makers",
    icon: <Users className="w-8 h-8 text-makrx-yellow" />,
    description: "Active makers in our community"
  },
  {
    number: "2M+", // Update with your numbers
    label: "Projects",
    icon: <Wrench className="w-8 h-8 text-makrx-yellow" />,
    description: "Projects created and shared"
  },
  {
    number: "100+", // Update with your numbers
    label: "Cities",
    icon: <Globe className="w-8 h-8 text-makrx-yellow" />,
    description: "Cities with our presence"
  }
];
```

#### Features Section
File: `pages/HomePage.tsx` (lines 400-500)

```typescript
// Customize features to match your offerings
const features = [
  {
    title: "World-Class Makerspaces",
    description: "Access premium makerspaces with cutting-edge equipment",
    icon: <Building2 className="w-12 h-12" />,
    benefits: [
      "3D Printers & Laser Cutters",
      "Electronics Lab",
      "Woodworking Shop",
      "24/7 Access Available"
    ]
  },
  // Add more features...
];
```

### Footer Content

#### Company Information
File: `components/Footer.tsx` (lines 100-130)

```typescript
// Update company information
const companyInfo = {
  name: "Your Company Name",
  tagline: "Your company tagline or mission statement",
  description: "Brief description of what your company does",
  
  // Contact details
  address: {
    street: "Your Street Address",
    city: "Your City",
    state: "Your State",
    pincode: "123456",
    country: "India"
  },
  
  contact: {
    phone: "+91 XXXX XXXXXX",
    email: "hello@yourdomain.com",
    support: "support@yourdomain.com"
  },
  
  // Legal
  cin: "U72900XX2024PTC123456",
  gst: "29XXXXX1234X1ZX",
  entity: "Your Company Legal Name Pvt Ltd"
};
```

#### Navigation Links
File: `components/Footer.tsx` (lines 150-200)

```typescript
// Customize footer navigation
const footerNavigation = {
  ecosystem: [
    { name: 'MakrCave', href: '/makrcave', description: 'Premium makerspaces' },
    { name: 'Store', href: '/store', description: 'Maker tools & components' },
    { name: 'Learn', href: '/learn', description: 'Skills & knowledge' },
    // Add your custom apps
  ],
  
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Contact', href: '/contact' },
  ],
  
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Status', href: '/status' },
    { name: 'Community', href: '/community' },
  ],
  
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Returns Policy', href: '/returns' },
  ],
};
```

### App Launcher Configuration

#### Portal Apps
File: `components/AppLauncher.tsx` (lines 50-100)

```typescript
// Configure apps in the launcher
const portalApps = [
  {
    name: 'MakrCave',
    description: 'Book and manage makerspace access',
    icon: <Building2 className="w-6 h-6" />,
    href: process.env.VITE_MAKRCAVE_URL,
    color: 'blue',
    isExternal: true,
    isNew: false,
  },
  {
    name: 'Store', 
    description: 'Shop for maker tools and components',
    icon: <ShoppingCart className="w-6 h-6" />,
    href: process.env.VITE_STORE_URL,
    color: 'green',
    isExternal: true,
    isNew: false,
  },
  {
    name: 'Learn',
    description: 'Educational resources and courses',
    icon: <GraduationCap className="w-6 h-6" />,
    href: process.env.VITE_LEARN_URL,
    color: 'purple',
    isExternal: true,
    isNew: true, // Shows "New" badge
  },
  // Add your custom applications
  {
    name: 'Analytics',
    description: 'Business intelligence dashboard',
    icon: <BarChart3 className="w-6 h-6" />,
    href: '/analytics',
    color: 'yellow',
    isExternal: false,
    isNew: false,
    roles: ['admin'], // Only show to admins
  },
];
```

## 📄 Legal Content Customization

### Privacy Policy

#### Key Sections to Update
File: `pages/PrivacyPolicy.tsx`

```typescript
// Company information (lines 50-80)
const companyDetails = {
  name: "Your Company Legal Name Pvt Ltd",
  address: "Complete registered office address",
  email: "privacy@yourdomain.com",
  phone: "+91 XXXX XXXXXX",
  dpo: {
    name: "Your Data Protection Officer",
    email: "dpo@yourdomain.com"
  }
};

// Data collection practices (lines 150-200)
const dataCollection = {
  personalData: [
    "Name and contact information",
    "Account credentials", 
    "Profile information",
    "Your specific data points..."
  ],
  technicalData: [
    "IP address and device information",
    "Browser and operating system details",
    "Usage analytics and behavior",
    "Your specific technical data..."
  ],
  purposes: [
    "Provide and improve our services",
    "Process transactions and payments",
    "Send important notifications",
    "Your specific purposes..."
  ]
};
```

### Terms of Service

#### Business Model Specific Terms
File: `pages/TermsOfService.tsx`

```typescript
// Service description (lines 100-150)
const serviceDescription = {
  overview: "Description of your specific services",
  features: [
    "Makerspace access and booking",
    "E-commerce marketplace", 
    "Educational resources",
    "Your specific features..."
  ],
  eligibility: {
    minAge: 18,
    geography: "Available in India",
    businessModel: "B2B/B2C/Both"
  }
};

// Payment terms (lines 200-250)
const paymentTerms = {
  currency: "INR",
  paymentMethods: ["Credit/Debit Cards", "UPI", "Net Banking", "Wallets"],
  refundPolicy: "30-day refund policy for applicable services",
  taxation: "All prices inclusive of applicable GST"
};
```

### Cookie Policy

#### Cookie Categories
File: `pages/CookiePolicy.tsx`

```typescript
// Configure cookie categories (lines 100-150)
const cookieCategories = {
  essential: {
    name: "Essential Cookies",
    description: "Required for basic site functionality",
    cookies: [
      "Session management",
      "Authentication state",
      "Shopping cart contents",
      // Your essential cookies
    ]
  },
  
  analytics: {
    name: "Analytics Cookies", 
    description: "Help us understand how you use our site",
    cookies: [
      "Google Analytics",
      "Hotjar user experience",
      "Custom analytics",
      // Your analytics cookies
    ]
  },
  
  marketing: {
    name: "Marketing Cookies",
    description: "Used to show you relevant advertisements",
    cookies: [
      "Google Ads conversion tracking",
      "Facebook Pixel",
      "Retargeting pixels",
      // Your marketing cookies
    ]
  }
};
```

## 🚀 Feature Flag Configuration

### Flag Definitions

#### Core Feature Flags
```typescript
// Feature flag definitions
const featureFlags = {
  // Homepage features
  'org.homepage.stats': {
    name: 'Homepage Statistics',
    description: 'Display statistics section on homepage',
    defaultValue: true,
    type: 'boolean'
  },
  
  'org.homepage.testimonials': {
    name: 'Homepage Testimonials',
    description: 'Show user testimonials on homepage',
    defaultValue: true,
    type: 'boolean'
  },
  
  'org.homepage.video': {
    name: 'Homepage Video',
    description: 'Display promotional video on homepage',
    defaultValue: false,
    type: 'boolean'
  },
  
  // Navigation features
  'org.header.app-launcher': {
    name: 'App Launcher Button',
    description: 'Show app launcher button in header',
    defaultValue: true,
    type: 'boolean'
  },
  
  'org.header.notifications': {
    name: 'Notification Bell',
    description: 'Show notification bell in header',
    defaultValue: false,
    type: 'boolean'
  },
  
  // Footer features
  'org.footer.newsletter': {
    name: 'Newsletter Subscription',
    description: 'Enable newsletter subscription in footer',
    defaultValue: true,
    type: 'boolean'
  },
  
  'org.footer.social-links': {
    name: 'Social Media Links',
    description: 'Show social media links in footer',
    defaultValue: true,
    type: 'boolean'
  },
  
  // Advanced features
  'org.features.dark-mode': {
    name: 'Dark Mode Toggle',
    description: 'Enable dark mode toggle',
    defaultValue: false,
    type: 'boolean'
  },
  
  'org.features.pwa': {
    name: 'Progressive Web App',
    description: 'Enable PWA features',
    defaultValue: false,
    type: 'boolean'
  },
  
  // A/B Testing flags
  'org.experiment.hero-variant': {
    name: 'Hero Section Variant',
    description: 'A/B test different hero section layouts',
    defaultValue: 'original',
    type: 'string',
    options: ['original', 'variant-a', 'variant-b']
  },
  
  // User role-based flags
  'org.admin.feature-flags': {
    name: 'Feature Flag Management',
    description: 'Access to feature flag admin panel',
    defaultValue: false,
    type: 'boolean',
    roles: ['admin', 'super-admin']
  }
};
```

### Flag Usage Examples

#### Boolean Flags
```typescript
import { useBooleanFlag } from '../lib/feature-flags';

function HomePage() {
  const showStats = useBooleanFlag('org.homepage.stats', true);
  const showVideo = useBooleanFlag('org.homepage.video', false);
  
  return (
    <div>
      {showVideo && <VideoSection />}
      {showStats && <StatsSection />}
    </div>
  );
}
```

#### String/Variant Flags
```typescript
import { useStringFlag } from '../lib/feature-flags';

function HeroSection() {
  const heroVariant = useStringFlag('org.experiment.hero-variant', 'original');
  
  switch (heroVariant) {
    case 'variant-a':
      return <HeroVariantA />;
    case 'variant-b':
      return <HeroVariantB />;
    default:
      return <HeroOriginal />;
  }
}
```

#### Role-based Flags
```typescript
import { useBooleanFlag } from '../lib/feature-flags';
import { useAuth } from '../contexts/AuthContext';

function AdminPanel() {
  const { user } = useAuth();
  const canManageFlags = useBooleanFlag('org.admin.feature-flags', false, {
    userId: user?.id,
    roles: user?.roles || []
  });
  
  if (!canManageFlags) {
    return <AccessDenied />;
  }
  
  return <FeatureFlagAdmin />;
}
```

## 🔌 Integration Configuration

### Keycloak SSO Setup

#### Realm Configuration
```json
{
  "realm": "makrx",
  "displayName": "Your Company SSO",
  "loginTheme": "your-custom-theme",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": true,
  "rememberMe": true,
  "verifyEmail": true,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 30,
  "accessTokenLifespan": 300,
  "accessCodeLifespan": 60,
  "accessCodeLifespanUserAction": 300,
  "accessCodeLifespanLogin": 1800,
  "actionTokenGeneratedByAdminLifespan": 43200,
  "actionTokenGeneratedByUserLifespan": 300,
  "ssoSessionIdleTimeout": 1800,
  "ssoSessionMaxLifespan": 28800,
  "offlineSessionIdleTimeout": 2592000,
  "offlineSessionMaxLifespanEnabled": false,
  "clientSessionIdleTimeout": 0,
  "clientSessionMaxLifespan": 0,
  "refreshTokenMaxReuse": 0,
  "attributes": {
    "frontendUrl": "https://auth.yourdomain.com"
  }
}
```

#### Client Configuration
```json
{
  "clientId": "makrx-gateway",
  "name": "MakrX Gateway Frontend",
  "description": "Gateway frontend application",
  "enabled": true,
  "alwaysDisplayInConsole": false,
  "clientAuthenticatorType": "client-secret",
  "secret": "your-client-secret",
  "redirectUris": [
    "https://yourdomain.com/*",
    "http://localhost:5173/*"
  ],
  "webOrigins": [
    "https://yourdomain.com",
    "http://localhost:5173"
  ],
  "notBefore": 0,
  "bearerOnly": false,
  "consentRequired": false,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "serviceAccountsEnabled": false,
  "publicClient": true,
  "frontchannelLogout": false,
  "protocol": "openid-connect",
  "attributes": {
    "pkce.code.challenge.method": "S256",
    "oauth2.device.authorization.grant.enabled": false,
    "oidc.ciba.grant.enabled": false
  }
}
```

### Analytics Integration

#### Google Analytics 4 Setup
```typescript
// Configure GA4 tracking
const ga4Config = {
  measurementId: process.env.VITE_GA_TRACKING_ID,
  config: {
    // Basic configuration
    send_page_view: true,
    allow_google_signals: true,
    allow_ad_personalization_signals: true,
    
    // Enhanced ecommerce
    enhanced_ecommerce: true,
    
    // Custom dimensions
    custom_map: {
      custom_dimension_1: 'user_role',
      custom_dimension_2: 'portal_source',
      custom_dimension_3: 'makerspace_location'
    },
    
    // Content grouping
    content_group1: 'Page Category',
    content_group2: 'User Journey Stage',
    
    // Site speed
    site_speed_sample_rate: 10
  }
};
```

#### Event Tracking Configuration
```typescript
// Define custom events
const analyticsEvents = {
  // User engagement
  'sign_up_started': {
    category: 'engagement',
    action: 'sign_up_started',
    label: 'User started registration process'
  },
  
  'app_launched': {
    category: 'navigation',
    action: 'app_launched',
    label: 'User launched app from launcher'
  },
  
  // Business metrics
  'makerspace_viewed': {
    category: 'business',
    action: 'makerspace_viewed',
    label: 'User viewed makerspace details'
  },
  
  'newsletter_subscribed': {
    category: 'marketing',
    action: 'newsletter_subscribed',
    label: 'User subscribed to newsletter'
  }
};
```

### Error Monitoring Setup

#### Sentry Configuration
```typescript
// Enhanced Sentry configuration
const sentryConfig = {
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.VITE_APP_VERSION,
  
  // Custom integrations
  integrations: [
    new Sentry.BrowserTracing({
      // Custom route handling
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    new Sentry.Replay(),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out known issues
    if (event.exception) {
      const error = hint.originalException;
      
      // Filter out network errors
      if (error?.name === 'NetworkError') {
        return null;
      }
      
      // Filter out cancelled requests
      if (error?.message?.includes('AbortError')) {
        return null;
      }
    }
    
    return event;
  },
  
  // User context
  initialScope: {
    tags: {
      component: 'gateway-frontend',
    },
  },
};
```

## 📱 Mobile & PWA Configuration

### Progressive Web App Setup

#### Manifest Configuration
File: `public/manifest.json`

```json
{
  "name": "Your Company - Creative Ecosystem",
  "short_name": "YourCompany",
  "description": "Access makerspaces, shop tools, and learn new skills",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e40af",
  "theme_color": "#1e40af",
  "orientation": "portrait-primary",
  "categories": ["education", "productivity", "business"],
  "lang": "en-IN",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Book Makerspace",
      "short_name": "Book",
      "description": "Quick access to makerspace booking",
      "url": "/makrcave",
      "icons": [
        {
          "src": "/shortcut-book.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Shop Tools",
      "short_name": "Shop", 
      "description": "Browse and buy maker tools",
      "url": "/store",
      "icons": [
        {
          "src": "/shortcut-shop.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

#### Service Worker Configuration
File: `public/sw.js`

```javascript
const CACHE_NAME = 'makrx-gateway-v1.0.0';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
```

### Responsive Breakpoints

#### Tailwind Breakpoint Configuration
```typescript
// Custom breakpoints for better mobile experience
const breakpoints = {
  'xs': '475px',   // Extra small devices
  'sm': '640px',   // Small devices
  'md': '768px',   // Medium devices  
  'lg': '1024px',  // Large devices
  'xl': '1280px',  // Extra large devices
  '2xl': '1536px', // 2X large devices
  
  // Custom breakpoints
  'mobile': '640px',
  'tablet': '768px',
  'laptop': '1024px',
  'desktop': '1280px',
};
```

#### Responsive Design Utilities
```css
/* Custom responsive utilities */
@responsive {
  .text-responsive {
    @apply text-sm;
  }
  
  @screen md {
    .text-responsive {
      @apply text-base;
    }
  }
  
  @screen lg {
    .text-responsive {
      @apply text-lg;
    }
  }
}

/* Touch-friendly interactive elements */
.touch-target {
  @apply min-w-11 min-h-11 flex items-center justify-center;
}

/* Safe area handling for mobile */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

This configuration guide provides comprehensive customization options for the MakrX Gateway Frontend. Use these configurations to adapt the platform to your specific business needs while maintaining a professional, user-friendly experience.
