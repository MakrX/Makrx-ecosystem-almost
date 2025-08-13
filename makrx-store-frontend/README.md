# MakrX Store Frontend - E-commerce Application

A Next.js-based e-commerce platform for the MakrX ecosystem, providing materials, tools, and fabrication services for makers and professionals.

## 📁 Directory Structure

```
makrx-store-frontend/src/
├── app/                     # Next.js App Router pages and layouts
│   ├── 3d-printing/        # 3D printing services pages
│   ├── about/              # About us page
│   ├── account/            # User account management
│   ├── admin/              # Admin dashboard pages
│   ├── auth/               # Authentication pages
│   ├── blog/               # Blog and content pages
│   ├── careers/            # Careers page
│   ├── cart/               # Shopping cart page
│   ├── catalog/            # Product catalog pages
│   ├── checkout/           # Checkout flow
│   ├── contact/            # Contact page
│   ├── help/               # Help and support
│   ├── order/              # Order tracking pages
│   ├── policies/           # Legal pages (privacy, terms)
│   ├── product/            # Individual product pages
│   ├── sample-projects/    # Sample project showcase
│   ├── services/           # Service offering pages
│   ├── track/              # Order tracking
│   ├── upload/             # File upload for services
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Homepage
├── components/             # Reusable React components
│   ├── admin/              # Admin-specific components
│   ├── layout/             # Layout components (Header, Footer)
│   ├── ui/                 # Base UI components
│   └── [various].tsx       # Feature-specific components
├── contexts/               # React context providers
│   ├── AuthContext.tsx     # Authentication state
│   ├── NotificationContext.tsx # Notifications
│   ├── PortalAuthContext.tsx   # Cross-portal auth
│   ├── SharedThemeProvider.tsx # Theme provider wrapper
│   └── ThemeContext.tsx    # Local theme context
├── data/                   # Static data and mock data
│   └── products.ts         # Product catalog data
├── hooks/                  # Custom React hooks
│   └── useRealTimeUpdates.ts # Real-time data hooks
├── lib/                    # Utility libraries
│   ├── api.ts              # API client and types
│   ├── auth.ts             # Authentication utilities
│   └── utils.ts            # General utilities
└── styles/                 # Additional stylesheets
    └── globals.css         # Global CSS styles
```

## 🏠 App Directory (Next.js Pages)

### Root Files

#### `layout.tsx`
**Purpose**: Root layout component that wraps all pages

**Key Features**:
- Global theme provider setup
- Authentication context
- Notification system
- Error suppression for development
- SEO metadata configuration

**Configuration Parameters**:
```typescript
export const metadata: Metadata = {
  title: "MakrX Store - 3D Printing Materials & Services",
  description: "Premium 3D printing materials, equipment, and professional printing services",
  keywords: "3D printing, filament, PLA, ABS, PETG, 3D printer, maker, prototyping",
  // ... additional SEO config
};
```

**Impact**: Changes affect the entire application's structure, SEO, and global providers

#### `page.tsx`
**Purpose**: Homepage showcasing featured products, categories, and services

**Key Sections**:
- Hero section with ecosystem messaging
- Product categories grid
- Featured products carousel
- Services showcase
- Statistics section
- Dark mode demo
- Call-to-action sections

**Configuration Parameters**:
- `featuredProducts`: Number of products to display (default: 8)
- `categories`: Number of categories to show (default: 8)
- Hero messaging and CTAs
- Service offerings and pricing

**API Integrations**:
```typescript
const [productsData, categoriesData] = await Promise.all([
  api.getFeaturedProducts(8),
  api.getCategories(),
]);
```

### Product & Commerce Pages

#### `catalog/page.tsx`
**Purpose**: Main product catalog with filtering and search

**Features**:
- Product grid with pagination
- Category filtering
- Search functionality
- Sort options
- Brand filtering

**Configuration Parameters**:
- `perPage`: Products per page (default: 20)
- `sortOptions`: Available sorting methods
- `filterOptions`: Available filters

#### `product/[slug]/page.tsx`
**Purpose**: Individual product detail pages

**Features**:
- Product image gallery
- Detailed specifications
- Add to cart functionality
- Related products
- Reviews and ratings

**Parameters**:
- `slug`: Product URL slug for routing
- Image carousel settings
- Related products count

#### `cart/page.tsx`
**Purpose**: Shopping cart management

**Features**:
- Cart item listing
- Quantity updates
- Remove items
- Price calculations
- Checkout navigation

**Configuration**:
- Tax calculation settings
- Shipping cost rules
- Discount code validation

#### `checkout/page.tsx`
**Purpose**: Multi-step checkout process

**Steps**:
1. Shipping information
2. Payment method
3. Order review
4. Order confirmation

**Configuration Parameters**:
- Payment gateway settings
- Shipping method options
- Tax calculation rules

### Service Pages

#### `3d-printing/page.tsx`
**Purpose**: 3D printing service offerings and file upload

**Features**:
- Service descriptions
- File upload interface
- Quote generation
- Material selection
- Quality options

**Configuration**:
- Supported file formats: STL, OBJ, 3MF
- Maximum file size limits
- Material options and pricing
- Quality levels and descriptions

#### `services/[service]/page.tsx`
**Purpose**: Individual service pages (CNC, Laser, PCB, Custom)

**Services Available**:
- `cnc/`: CNC machining services
- `laser/`: Laser cutting services  
- `pcb/`: PCB fabrication
- `custom/`: Custom fabrication

**Configuration**:
- Service-specific parameters
- Pricing models
- Turnaround times
- Material compatibility

### User Account Pages

#### `account/page.tsx`
**Purpose**: User account dashboard

**Features**:
- Profile information
- Order history
- Account settings
- Membership tier display

#### `account/orders/page.tsx`
**Purpose**: Order history and tracking

**Features**:
- Order listing with status
- Order details view
- Tracking information
- Reorder functionality

#### `account/orders/[id]/page.tsx`
**Purpose**: Individual order details

**Features**:
- Detailed order information
- Item listing
- Shipping tracking
- Invoice download

### Content Pages

#### `about/page.tsx`
**Purpose**: Company information and team

**Sections**:
- Company mission and vision
- Team member profiles
- Company values
- Contact information

**Configuration**:
- Team member data
- Company metrics
- Mission statement
- Contact details

#### `blog/page.tsx`
**Purpose**: Blog and content marketing

**Features**:
- Article listings
- Category filtering
- Featured articles
- Author profiles

### Support & Legal Pages

#### `help/page.tsx`
**Purpose**: Help center and FAQ

**Sections**:
- Frequently asked questions
- Contact support
- Knowledge base
- Video tutorials

#### `policies/privacy/page.tsx`
**Purpose**: Privacy policy

#### `policies/terms/page.tsx`
**Purpose**: Terms of service

#### `policies/shipping/page.tsx`
**Purpose**: Shipping policies

#### `policies/returns/page.tsx`
**Purpose**: Return and refund policies

## 🧩 Components Directory

### Layout Components

#### `layout/Header.tsx`
**Purpose**: Site header with navigation and user controls

**Features**:
- Logo and branding
- Main navigation menu
- User account dropdown
- Shopping cart icon with count
- Theme toggle
- Search functionality

**Configuration Parameters**:
```typescript
interface HeaderProps {
  showSearch?: boolean;      // Show/hide search bar
  showCart?: boolean;        // Show/hide cart icon
  showThemeToggle?: boolean; // Show/hide theme toggle
  navigationItems?: NavItem[]; // Custom navigation items
}
```

#### `layout/Footer.tsx`
**Purpose**: Site footer with links and information

**Sections**:
- Company links
- Product categories
- Legal links
- Social media
- Newsletter signup

**Configuration**:
- Footer link sections
- Social media profiles
- Contact information
- Newsletter integration

### UI Components

#### `ui/Button.tsx`
**Purpose**: Standardized button component

**Variants**:
- `primary`: Main action buttons
- `secondary`: Secondary actions
- `outline`: Outlined buttons
- `ghost`: Minimal buttons

**Sizes**: `sm`, `md`, `lg`

### Feature Components

#### `ProductReviews.tsx`
**Purpose**: Product review display and submission

**Features**:
- Review listing
- Star ratings
- Review submission form
- Image attachments
- Helpful votes

#### `RealTimeOrderStatus.tsx`
**Purpose**: Live order status updates

**Features**:
- WebSocket integration
- Status animations
- Progress indicators
- Estimated delivery

#### `FileProcessingStatus.tsx`
**Purpose**: File upload and processing status

**Features**:
- Upload progress
- Processing status
- Error handling
- File validation

## 🔧 Contexts Directory

### `AuthContext.tsx`
**Purpose**: Authentication state management

**Features**:
- User login/logout
- Session management
- Role-based permissions
- Token refresh

**Configuration**:
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}
```

### `NotificationContext.tsx`
**Purpose**: Toast notifications and alerts

**Features**:
- Success/error messages
- Auto-dismiss timers
- Action buttons
- Queue management

### `SharedThemeProvider.tsx`
**Purpose**: Next.js-compatible theme provider wrapper

**Features**:
- SSR-safe theme initialization
- Integration with @makrx/ui theme system
- Client-side hydration handling

## 📚 Lib Directory

### `api.ts`
**Purpose**: Comprehensive API client for backend integration

**Key Classes**:
```typescript
class ApiClient {
  // Authentication
  async getCurrentUser(): Promise<User>;
  
  // Products
  async getProducts(params: ProductSearchParams): Promise<ProductResponse>;
  async getProduct(id: number): Promise<Product>;
  async getFeaturedProducts(limit: number): Promise<Product[]>;
  
  // Categories
  async getCategories(): Promise<Category[]>;
  async getCategory(id: number): Promise<Category>;
  
  // Cart
  async getCart(): Promise<Cart>;
  async addToCart(productId: number, quantity: number): Promise<void>;
  
  // Orders
  async getOrders(): Promise<Order[]>;
  async checkout(data: CheckoutData): Promise<OrderResponse>;
  
  // File Uploads
  async createUploadUrl(filename: string): Promise<UploadResponse>;
  async completeUpload(uploadId: string): Promise<void>;
  
  // Mock data fallback for development
  private getMockData<T>(endpoint: string): T;
}
```

**Configuration Parameters**:
- `API_BASE_URL`: Backend API endpoint
- Request timeout settings
- Authentication headers
- Error handling strategies

**Mock Data System**:
- Automatic fallback when backend unavailable
- Comprehensive mock responses
- Development-friendly error handling

### `auth.ts`
**Purpose**: Authentication utilities and Keycloak integration

**Key Functions**:
```typescript
// Authentication flow
export const login = (): void;
export const logout = (): Promise<void>;
export const handleAuthCallback = (code: string, state: string): Promise<boolean>;

// Token management
export const getToken = (): Promise<string | null>;
export const refreshToken = (): Promise<boolean>;
export const isTokenExpired = (token: string): boolean;

// User information
export const getUserInfo = (): Promise<User | null>;
```

**Configuration**:
- Keycloak server URL
- Realm configuration
- Client ID settings
- Token storage strategies

### `utils.ts`
**Purpose**: General utility functions

**Key Functions**:
```typescript
// Styling utilities
export function cn(...inputs: ClassValue[]): string;

// Data formatting
export function formatPrice(amount: number, currency?: string): string;
export function formatDate(date: string | Date): string;

// Validation
export function validateEmail(email: string): boolean;
export function validatePhone(phone: string): boolean;

// URL handling
export function createSlug(text: string): string;
export function parseSlug(slug: string): string;
```

## 📊 Data Directory

### `products.ts`
**Purpose**: Product catalog data and mock data for development

**Data Structures**:
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  specifications: Record<string, any>;
  // ... additional fields
}

interface Category {
  name: string;
  slug: string;
  description: string;
  image: string;
  // ... additional fields
}
```

**Configuration**:
- Product listings with full details
- Category hierarchies
- Featured product flags
- Pricing and inventory data

## 🎨 Styling System

### Global Styles (`globals.css`)
**Purpose**: Global CSS styles and Tailwind customizations

**Key Features**:
- CSS custom properties for themes
- Component base styles
- Utility class extensions
- Print styles

### Tailwind Configuration
**Integration**: Configured via root `tailwind.config.ts`

**Custom Tokens**:
- MakrX brand colors
- Typography scale
- Spacing system
- Animation utilities

## 🔧 Configuration & Environment

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8003
NEXT_PUBLIC_APP_NAME="MakrX Store"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Authentication
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.makrx.org
NEXT_PUBLIC_KEYCLOAK_REALM=makrx
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrx-store-frontend

# Other Services
NEXT_PUBLIC_EVENT_SERVICE_URL=ws://localhost:8004
NEXT_PUBLIC_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_MAKRCAVE_URL=http://localhost:3001
NEXT_PUBLIC_STORE_URL=http://localhost:3003
```

### Build Configuration (`next.config.js`)
**Key Settings**:
- Package resolution for monorepo
- Image optimization
- Webpack aliases
- Environment-specific builds

## 🚀 Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

This comprehensive structure supports a scalable, maintainable e-commerce application with clear separation of concerns, robust error handling, and extensive customization options.
