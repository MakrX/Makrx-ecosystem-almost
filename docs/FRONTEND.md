# MakrX Frontend Development Guide

## 🎯 Overview

The MakrX ecosystem consists of three distinct frontend applications, each serving specific user needs while maintaining a cohesive user experience through shared design systems and components.

## 🏗️ Frontend Architecture

### Technology Stack
- **React 18**: Gateway and MakrCave frontends
- **Next.js 14**: Store frontend (for SEO and e-commerce optimization)
- **TypeScript**: Full type safety across all applications
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality UI component library
- **Vite**: Build tool for React applications

### Shared Components System
```
packages/
├── ui/                    # Shared UI components
│   ├── components/        # Reusable components
│   ├── contexts/          # Global contexts (Theme, etc.)
│   └── utils/             # UI utilities
├── types/                 # TypeScript definitions
└── utils/                 # Shared utilities
```

## 🌐 Frontend Applications

### 1. Gateway Frontend (MakrX.org)
**Purpose**: Ecosystem entry point and user hub
**Tech**: React + Vite + React Router

```
frontend/gateway-frontend/
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── EnhancedHeader.tsx # Main navigation
│   └── PortalNavigation.tsx
├── contexts/
│   ├── AuthContext.tsx    # Authentication state
│   └── CrossPortalAuth.tsx # Cross-domain auth
├── pages/
│   ├── HomePage.tsx       # Landing page
│   ├── ProfilePage.tsx    # User profiles
│   └── Learn.tsx          # Learning hub
└── App.tsx                # Main application
```

**Key Features**:
- Ecosystem landing pages
- User authentication and profiles
- Cross-domain navigation
- Community features
- Learning resources

### 2. MakrCave Frontend (MakrCave.com)
**Purpose**: Makerspace management and collaboration
**Tech**: React + Vite + React Router

```
frontend/makrcave-frontend/
├── components/
│   ├── analytics/         # Analytics dashboards
│   ├── billing/           # Billing management
│   ├── capacity/          # Capacity planning
│   ├── collaboration/     # Project collaboration
│   ├── community/         # Community features
│   ├── equipment/         # Equipment management
│   ├── inventory/         # Inventory tracking
│   ├── maintenance/       # Equipment maintenance
│   ├── projects/          # Project management
│   └── ui/                # UI components
├── contexts/
│   ├── AuthContext.tsx    # Authentication
│   ├── MakerspaceContext.tsx # Makerspace state
│   ├── BillingContext.tsx # Billing state
│   └── FeatureFlagContext.tsx # Feature flags
├── pages/
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Equipment.tsx      # Equipment management
│   ├── Inventory.tsx      # Inventory management
│   ├── Projects.tsx       # Project listing
│   ├── Analytics.tsx      # Analytics dashboard
│   └── LandingPage.tsx    # Public landing
└── services/
    ├── apiService.ts      # API communication
    ├── authService.ts     # Authentication
    └── billingService.ts  # Billing operations
```

**Key Features**:
- Equipment reservation system
- Inventory management with auto-deduction
- Project collaboration with BOM management
- Member management with role-based access
- Service provider job management
- Advanced analytics and reporting
- Billing and subscription management

### 3. Store Frontend (MakrX.Store)
**Purpose**: E-commerce and fabrication services
**Tech**: Next.js 14 + App Router

```
makrx-store-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (routes)/          # Route groups
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   ├── ui/                # UI components
│   │   ├── ProductCard.tsx    # Product display
│   │   ├── CartSummary.tsx    # Shopping cart
│   │   └── ThemeToggle.tsx    # Theme switching
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Authentication
│   │   └── CartContext.tsx    # Shopping cart state
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Utilities
│   └── styles/
└── public/                     # Static assets
```

**Key Features**:
- Product catalog with advanced filtering
- Shopping cart and checkout flow
- STL file upload with instant quoting
- Order tracking and management
- Provider network integration
- BOM import from MakrCave projects

## 🎨 Design System

### Theme System
All frontends use a unified theme system with support for light, dark, and system themes.

```typescript
// packages/ui/contexts/ThemeContext.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  // ... theme logic
}

// Usage in any component
import { useTheme } from '@makrx/ui';

function MyComponent() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  // ... component logic
}
```

### Color Palette
```css
:root {
  /* MakrX Brand Colors */
  --makrx-blue: #2563eb;
  --makrx-yellow: #f59e0b;
  --makrx-teal: #0d9488;
  
  /* Semantic Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  
  /* State Colors */
  --success: 142.1 76.2% 36.3%;
  --warning: 32.2 95% 44.1%;
  --error: 0 84.2% 60.2%;
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme overrides */
}
```

### Typography Scale
```css
/* Font Families */
--font-display: 'Inter', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Type Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Component Guidelines

#### Button Variants
```tsx
// Primary actions
<Button variant="default">Primary Action</Button>

// Secondary actions  
<Button variant="secondary">Secondary Action</Button>

// Destructive actions
<Button variant="destructive">Delete</Button>

// Ghost buttons for minimal actions
<Button variant="ghost">Cancel</Button>

// Outline buttons for less emphasis
<Button variant="outline">Learn More</Button>
```

#### Card Components
```tsx
// Standard card layout
<Card>
  <CardHeader>
    <CardTitle>Equipment Status</CardTitle>
    <CardDescription>Real-time equipment monitoring</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-center space-x-4">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span>3 of 5 machines available</span>
    </div>
    <div className="mt-4">
      <div className="text-2xl font-bold">12</div>
      <div className="text-sm text-muted-foreground">Active reservations</div>
    </div>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

## 🔧 Development Setup

### Prerequisites
```bash
# Required tools
node --version  # v18.0.0 or higher
npm --version   # v8.0.0 or higher
git --version   # Any recent version
```

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd makrx-ecosystem

# Install dependencies
npm install

# Setup environment
cp .env.production.template .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### Development Commands
```bash
# Start all frontends in development mode
npm run dev

# Start individual frontends
npm run dev:gateway    # Gateway on port 3000
npm run dev:makrcave   # MakrCave on port 3001  
npm run dev:store      # Store on port 3002

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:watch
```

## 🧩 Shared Components

### Theme Toggle
```tsx
import { ThemeToggle } from '@makrx/ui';

// Icon-only toggle
<ThemeToggle variant="icon-only" />

// Compact inline toggle
<ThemeToggle variant="compact" />

// Full dropdown with labels
<ThemeToggle variant="default" />
```

### Loading States
```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Content loading
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />

// Card loading
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-[100px]" />
    <Skeleton className="h-4 w-[200px]" />
  </CardHeader>
</Card>
```

### Error Boundaries
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary
  componentName="Dashboard"
  showDetails={process.env.NODE_ENV === 'development'}
>
  <Dashboard />
</ErrorBoundary>
```

## 🔐 Authentication Integration

### Auth Context Usage
```tsx
import { useAuth } from '@/contexts/AuthContext';

function ProtectedComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Role-Based Access
```tsx
import { useAuth } from '@/contexts/AuthContext';

function AdminPanel() {
  const { user, hasRole } = useAuth();
  
  if (!hasRole(['admin', 'super_admin'])) {
    return <AccessDenied />;
  }
  
  return <AdminDashboard />;
}
```

### Cross-Domain Authentication
```tsx
// Automatic SSO across domains
import { PortalAuthContext } from '@/contexts/PortalAuthContext';

function CrossDomainAuth() {
  const { syncAuthStatus } = useContext(PortalAuthContext);
  
  useEffect(() => {
    syncAuthStatus(); // Sync auth state across domains
  }, []);
}
```

## 🚀 Performance Optimization

### Code Splitting
```tsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const Analytics = lazy(() => import('./pages/Analytics'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Optimization
```tsx
// Next.js Image optimization (Store frontend)
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// React frontends
<img
  src={product.image}
  alt={product.name}
  loading="lazy"
  className="aspect-square object-cover"
/>
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check for unused code
npm run build:stats
```

## 🧪 Testing Strategy

### Unit Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@makrx/ui';
import { Button } from '@/components/ui/button';

test('button renders correctly', () => {
  render(
    <ThemeProvider>
      <Button>Click me</Button>
    </ThemeProvider>
  );
  
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Integration Testing
```tsx
import { renderWithProviders } from '@/test-utils';
import { Dashboard } from '@/pages/Dashboard';

test('dashboard loads equipment data', async () => {
  renderWithProviders(<Dashboard />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Ultimaker S3')).toBeInTheDocument();
  });
});
```

### E2E Testing
```typescript
// Playwright test example
import { test, expect } from '@playwright/test';

test('complete equipment reservation flow', async ({ page }) => {
  await page.goto('/equipment');
  await page.click('[data-testid="equipment-item-1"]');
  await page.click('[data-testid="reserve-button"]');
  await page.fill('[data-testid="start-time"]', '2024-01-15T14:00');
  await page.click('[data-testid="confirm-reservation"]');
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## 📱 Responsive Design

### Breakpoint System
```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile-First Components
```tsx
function ResponsiveCard() {
  return (
    <Card className="
      w-full
      sm:w-auto sm:min-w-[300px]
      md:max-w-md
      lg:max-w-lg
    ">
      <CardContent className="
        p-4
        sm:p-6
        lg:p-8
      ">
        <h3 className="text-lg font-semibold mb-2">Equipment Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Available</span>
            <span className="font-medium">8</span>
          </div>
          <div className="flex justify-between">
            <span>In Use</span>
            <span className="font-medium">3</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Mobile Navigation
```tsx
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="bg-background p-6">
            <nav className="space-y-4">
              <Link to="/dashboard" className="block py-2 text-lg">Dashboard</Link>
              <Link to="/equipment" className="block py-2 text-lg">Equipment</Link>
              <Link to="/projects" className="block py-2 text-lg">Projects</Link>
              <Link to="/inventory" className="block py-2 text-lg">Inventory</Link>
            </nav>
            <div className="mt-8 pt-4 border-t">
              <button onClick={logout} className="text-red-600">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## 🔍 Debugging and Development Tools

### Browser DevTools
- **React DevTools**: Component tree inspection
- **Redux DevTools**: State management debugging (if using Redux)
- **Network Tab**: API request monitoring
- **Performance Tab**: Runtime performance analysis

### Custom DevTools
```tsx
// Development-only debugging panel
{process.env.NODE_ENV === 'development' && (
  <DevPanel>
    <FeatureFlagToggle />
    <APIRequestLogger />
    <ComponentBoundaries />
  </DevPanel>
)}
```

### Error Tracking
```tsx
// Sentry integration for error tracking
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error boundary with Sentry
export const SentryErrorBoundary = Sentry.withErrorBoundary(
  MyComponent,
  { fallback: ErrorFallback }
);
```

## 📦 Build and Deployment

### Environment Configuration
```typescript
// Environment variables
interface Config {
  API_BASE_URL: string;
  KEYCLOAK_URL: string;
  STRIPE_PUBLIC_KEY: string;
  SENTRY_DSN: string;
  FEATURE_FLAGS_URL: string;
}

export const config: Config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL!,
  KEYCLOAK_URL: process.env.REACT_APP_KEYCLOAK_URL!,
  // ... other config
};
```

### Build Optimization
```javascript
// Vite configuration for React apps
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@makrx/ui': path.resolve(__dirname, '../../packages/ui'),
    },
  },
});

// Next.js configuration for Store
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['makrx.store', 'cdn.makrx.org'],
  },
  webpack: (config) => {
    config.resolve.alias['@makrx/ui'] = path.resolve(__dirname, '../packages/ui');
    return config;
  },
};
```

---

This frontend guide provides comprehensive coverage of development practices, patterns, and tools used across the MakrX ecosystem. For specific implementation details, refer to the component documentation in each frontend application.
