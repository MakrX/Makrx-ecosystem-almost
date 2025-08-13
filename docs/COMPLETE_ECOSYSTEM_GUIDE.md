# MakrX Ecosystem Documentation (Continued)

## 8. Backend Documentation

### Service Structure Overview

Each backend service follows FastAPI conventions with clear separation of concerns:

```
backend-service/
├── app/
│   ├── core/           # Configuration, database, security
│   ├── models/         # SQLAlchemy database models
│   ├── schemas/        # Pydantic request/response schemas
│   ├── routes/         # API endpoint handlers
│   ├── crud/           # Database operations
│   ├── middleware/     # Custom middleware
│   └── main.py         # Application entry point
├── requirements.txt    # Python dependencies
├── Dockerfile         # Container configuration
└── .env.example       # Environment template
```

### Auth Service (Port 8001)

#### Folder Structure
```
backends/auth-service/
├── app/
│   ├── core/
│   │   ├── config.py      # JWT settings, Keycloak config
│   │   ├── security.py    # Token validation, encryption
│   │   └── database.py    # User session storage
│   ├── models/
│   │   ├── user.py        # User model and roles
│   │   └── session.py     # Active session tracking
│   ├── routes/
│   │   ├── auth.py        # Login, logout, token refresh
│   │   ├── users.py       # User management
│   │   └── admin.py       # Administrative functions
│   └── main.py
├── requirements.txt
└── Dockerfile
```

#### Main Dependencies
- `fastapi` - Web framework
- `python-keycloak` - Keycloak integration
- `pyjwt` - JWT token handling
- `asyncpg` - PostgreSQL async driver
- `redis` - Session caching

#### Environment Variables
```bash
# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=makrx
KEYCLOAK_CLIENT_ID=auth-service
KEYCLOAK_CLIENT_SECRET=your-secret

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/makrx

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Redis Cache
REDIS_URL=redis://localhost:6379/0
```

#### Setup Steps
1. Install dependencies: `pip install -r requirements.txt`
2. Configure environment variables
3. Initialize database: `python -m alembic upgrade head`
4. Start service: `uvicorn app.main:app --port 8001 --reload`

#### API Endpoints

| Method | URL | Required Role | Purpose | Response |
|--------|-----|---------------|---------|----------|
| POST | `/auth/login` | None | Authenticate user | `{access_token, refresh_token, user_info}` |
| POST | `/auth/refresh` | None | Refresh access token | `{access_token}` |
| POST | `/auth/logout` | User | Invalidate tokens | `{message: "Logged out"}` |
| GET | `/auth/me` | User | Get current user info | `{user_id, email, roles, permissions}` |
| GET | `/users` | Admin | List all users | `{users: [...], total, page}` |
| POST | `/users` | Super Admin | Create new user | `{user_id, email, created_at}` |
| PUT | `/users/{id}/roles` | Admin | Update user roles | `{user_id, roles, updated_at}` |
| DELETE | `/users/{id}` | Super Admin | Delete user account | `{message: "User deleted"}` |

### MakrCave Backend (Port 8002)

#### Folder Structure
```
makrcave-backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Makerspace settings
│   │   ├── database.py        # Database connections
│   │   └── permissions.py     # Role-based access control
│   ├── models/
│   │   ├── makerspace.py      # Makerspace entities
│   │   ├── member.py          # Member management
│   │   ├── equipment.py       # Equipment and reservations
│   │   ├── project.py         # Project management
│   │   ├── billing.py         # Billing and payments
│   │   └── inventory.py       # Material inventory
│   ├── schemas/
│   │   ├── makerspace.py      # Makerspace schemas
│   │   ├── member.py          # Member schemas
│   │   ├── equipment.py       # Equipment schemas
│   │   ├── project.py         # Project schemas
│   │   └── billing.py         # Billing schemas
│   ├── routes/
│   │   ├── makerspaces.py     # Makerspace CRUD
│   │   ├── members.py         # Member management
│   │   ├── equipment.py       # Equipment operations
│   │   ├── reservations.py    # Booking system
│   │   ├── projects.py        # Project management
│   │   ├── billing.py         # Billing operations
│   │   ├── analytics.py       # Usage analytics
│   │   └── bridge.py          # Store integration
│   ├── crud/
│   │   ├── makerspace.py      # Makerspace database ops
│   │   ├── member.py          # Member database ops
│   │   ├── equipment.py       # Equipment database ops
│   │   └── project.py         # Project database ops
│   └── main.py
```

#### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/makrx

# Authentication
AUTH_SERVICE_URL=http://localhost:8001
KEYCLOAK_URL=http://localhost:8080

# External Integrations
STORE_API_URL=http://localhost:8003
PAYMENT_GATEWAY_URL=https://api.stripe.com
EMAIL_SERVICE_URL=https://api.sendgrid.com

# File Storage
MINIO_URL=http://localhost:9000
MINIO_ACCESS_KEY=makrx-access
MINIO_SECRET_KEY=makrx-secret

# Features
ENABLE_BILLING=true
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

#### Key API Endpoints

**Makerspace Management**:
| Method | URL | Role | Purpose |
|--------|-----|------|---------|
| GET | `/makerspaces` | Any | List accessible makerspaces |
| POST | `/makerspaces` | Super Admin | Create new makerspace |
| GET | `/makerspaces/{id}` | Member+ | Get makerspace details |
| PUT | `/makerspaces/{id}` | Makerspace Admin | Update makerspace |

**Member Management**:
| Method | URL | Role | Purpose |
|--------|-----|------|---------|
| GET | `/makerspaces/{id}/members` | Admin | List members |
| POST | `/makerspaces/{id}/invites` | Admin | Send invite |
| DELETE | `/makerspaces/{id}/members/{user_id}` | Admin | Remove member |

**Equipment & Reservations**:
| Method | URL | Role | Purpose |
|--------|-----|------|---------|
| GET | `/makerspaces/{id}/equipment` | Member | List equipment |
| POST | `/equipment/{id}/reserve` | Member | Make reservation |
| GET | `/reservations/my` | Member | Get user's reservations |

### Store Backend (Port 8003)

#### Folder Structure
```
makrx-store-backend/
├── app/
│   ├── core/
│   │   ├── config.py          # E-commerce settings
│   │   ├── security.py        # Payment & file security
│   │   ├── storage.py         # File upload handling
│   │   └── pricing.py         # Dynamic pricing engine
│   ├── models/
│   │   ├── commerce.py        # Products, orders, cart
│   │   ├── services.py        # Fabrication services
│   │   ├── reviews.py         # Product reviews
│   │   └── subscriptions.py   # Service subscriptions
│   ├── routes/
│   │   ├── catalog.py         # Product catalog
│   │   ├── cart.py            # Shopping cart
│   │   ├── orders.py          # Order management
│   │   ├── uploads.py         # File uploads
│   │   ├���─ quotes.py          # Service quotes
│   │   ├── payments.py        # Payment processing
│   │   └── bridge.py          # Cave integration
│   └── main.py
```

#### Key API Endpoints

**Product Catalog**:
| Method | URL | Purpose | Response Example |
|--------|-----|---------|------------------|
| GET | `/catalog/products` | List products with filters | `{products: [...], total: 150, page: 1}` |
| GET | `/catalog/products/{id}` | Get product details | `{id: 1, name: "PLA Filament", price: 25.99, ...}` |
| GET | `/catalog/categories` | List product categories | `{categories: [{id: 1, name: "3D Printing", ...}]}` |
| GET | `/catalog/search?q=filament` | Search products | `{results: [...], suggestions: [...]}` |

**Shopping Cart**:
| Method | URL | Purpose | Request Body |
|--------|-----|---------|--------------|
| GET | `/cart` | Get current cart | N/A |
| POST | `/cart/items` | Add item to cart | `{product_id: 1, quantity: 2}` |
| PUT | `/cart/items/{id}` | Update cart item | `{quantity: 3}` |
| DELETE | `/cart/items/{id}` | Remove from cart | N/A |

**File Upload & Services**:
| Method | URL | Purpose | Request Body |
|--------|-----|---------|--------------|
| POST | `/uploads/sign` | Get upload URL | `{filename: "model.stl", content_type: "application/octet-stream"}` |
| POST | `/uploads/complete` | Complete upload | `{upload_id: "uuid", file_key: "path/to/file"}` |
| POST | `/quotes` | Request quote | `{upload_id: "uuid", material: "PLA", quality: "high"}` |

---

## 9. Frontend Documentation

### Domain Structure Overview

Each frontend follows modern React patterns with TypeScript and Tailwind CSS:

```
frontend-app/
├── src/
│   ├── app/              # Next.js pages OR
│   ├── pages/            # React Router pages
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API clients
│   ├── types/            # TypeScript type definitions
│   └── styles/           # Global styles and themes
├── public/               # Static assets
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Build configuration
```

### MakrX.org (Gateway Frontend)

#### Page Map
| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/` | `HomePage` | Landing and ecosystem overview | No |
| `/profile` | `ProfilePage` | User profile management | Yes |
| `/learn` | `LearnPage` | Educational content | No |
| `/community` | `CommunityPage` | Maker community features | Yes |
| `/makerspaces` | `MakerspacesPage` | Find and join makerspaces | Yes |
| `/login` | `LoginPage` | Authentication portal | No |
| `/signup` | `SignupPage` | User registration | No |

#### Key Components

**Shared Components**:
- `Header` - Navigation with portal links
- `PortalNavigation` - Cross-domain navigation
- `AuthProvider` - Authentication context
- `ThemeProvider` - Dark/light mode

**Domain-Specific Components**:
- `MakerProfile` - User profile display
- `MakerspaceCard` - Makerspace listing item
- `CommunityFeed` - Activity feed
- `SkillBadges` - User achievements

#### Environment Variables
```bash
# Authentication
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=makrx
VITE_KEYCLOAK_CLIENT_ID=makrx-org-frontend

# API Endpoints
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_MAKRCAVE_API_URL=http://localhost:8002
VITE_STORE_API_URL=http://localhost:8003

# Cross-Domain URLs
VITE_MAKRCAVE_URL=http://localhost:3001
VITE_STORE_URL=http://localhost:3003
```

### MakrCave.com (Management Frontend)

#### Page Map
| Route | Component | Purpose | Required Role |
|-------|-----------|---------|---------------|
| `/` | `LandingPage` | Public makerspace showcase | None |
| `/dashboard` | `Dashboard` | Main user dashboard | Member+ |
| `/equipment` | `EquipmentPage` | Equipment management | Member+ |
| `/reservations` | `ReservationsPage` | Booking management | Member+ |
| `/projects` | `ProjectsPage` | Project management | Member+ |
| `/members` | `MembersPage` | Member management | Admin+ |
| `/billing` | `BillingPage` | Billing and payments | Admin+ |
| `/analytics` | `AnalyticsPage` | Usage analytics | Admin+ |
| `/settings` | `SettingsPage` | Makerspace settings | Makerspace Admin |

#### UI Components

**Core Components**:
- `EquipmentCard` - Equipment display and booking
- `ReservationCalendar` - Booking interface
- `ProjectTimeline` - Project progress tracking
- `MemberManagement` - User role management
- `BillingDashboard` - Financial overview
- `AnalyticsCharts` - Usage visualization

**Shared UI Library** (`@makrx/ui`):
- `ThemeToggle` - Theme switching
- `MakrXButton` - Branded buttons
- `MakrXCard` - Consistent cards

#### Theme Guidelines

**Colors**:
```css
/* Primary Brand Colors */
--makrx-blue: #3B82F6;
--makrx-purple: #8B5CF6;
--makrx-gray: #6B7280;

/* Status Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Equipment Status */
--available: #10B981;
--in-use: #F59E0B;
--maintenance: #EF4444;
--reserved: #8B5CF6;
```

**Typography**:
```css
/* Font Family */
font-family: 'Inter', system-ui, sans-serif;

/* Font Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### MakrX.Store (E-commerce Frontend)

#### Page Map
| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/` | `HomePage` | Store homepage | No |
| `/catalog` | `CatalogPage` | Product browsing | No |
| `/catalog/[category]` | `CategoryPage` | Category-specific products | No |
| `/product/[slug]` | `ProductPage` | Product details | No |
| `/cart` | `CartPage` | Shopping cart | No |
| `/checkout` | `CheckoutPage` | Order completion | Yes |
| `/3d-printing` | `PrintingPage` | 3D printing services | No |
| `/upload` | `UploadPage` | File upload for quotes | Yes |
| `/account` | `AccountPage` | User account dashboard | Yes |
| `/account/orders` | `OrdersPage` | Order history | Yes |
| `/track/[id]` | `TrackingPage` | Order tracking | Optional |

#### Key Features per Page

**Homepage** (`/`):
- Hero section with value proposition
- Featured product carousel
- Service offerings showcase
- Category navigation
- Dark mode demo

**Product Catalog** (`/catalog`):
- Product grid with filtering
- Search functionality
- Category sidebar
- Sort options (price, popularity, rating)
- Pagination

**Product Details** (`/product/[slug]`):
- Image gallery with zoom
- Detailed specifications
- Add to cart functionality
- Related products
- Customer reviews and ratings

**3D Printing Services** (`/3d-printing`):
- File upload interface (STL, OBJ, 3MF)
- Material selection
- Quality options
- Real-time pricing
- Quote comparison

#### Environment Variables
```bash
# Authentication
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=makrx
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrx-store-frontend

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8003
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8001

# Cross-Domain Integration
NEXT_PUBLIC_MAKRCAVE_URL=http://localhost:3001
NEXT_PUBLIC_GATEWAY_URL=http://localhost:3000

# Payment Processing
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=50000000
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.stl,.obj,.3mf
```

---

## 10. Database Schema

### ER Diagram Overview

```mermaid
erDiagram
    USERS ||--o{ MAKERSPACE_MEMBERS : "belongs to"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ PROJECTS : "creates"
    
    MAKERSPACES ||--o{ MAKERSPACE_MEMBERS : "contains"
    MAKERSPACES ||--o{ EQUIPMENT : "owns"
    MAKERSPACES ||--o{ PROJECTS : "hosts"
    
    EQUIPMENT ||--o{ RESERVATIONS : "reserved"
    EQUIPMENT ||--o{ MAINTENANCE_LOGS : "maintenance"
    
    PROJECTS ||--o{ PROJECT_FILES : "contains"
    PROJECTS ||--o{ BOM_ITEMS : "requires"
    
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered"
    PRODUCTS ||--o{ BOM_ITEMS : "referenced"
    PRODUCTS ||--o{ CART_ITEMS : "added to cart"
    
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ SERVICE_ORDERS : "spawns"
    
    CARTS ||--o{ CART_ITEMS : "contains"
    
    UPLOADS ||--o{ QUOTES : "generates"
    QUOTES ||--o{ SERVICE_ORDERS : "creates"
```

### Global Tables (Shared across domains)

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    bio TEXT,
    skills JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);
```

#### feature_flags
```sql
CREATE TABLE feature_flags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    conditions JSONB DEFAULT '{}',
    environments TEXT[] DEFAULT ARRAY['development'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Domain Tables

#### MakrCave Schema (makrcave.*)

**makerspaces**:
```sql
CREATE TABLE makrcave.makerspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    address JSONB,
    contact_info JSONB,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

**makerspace_members**:
```sql
CREATE TABLE makrcave.makerspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    makerspace_id UUID REFERENCES makrcave.makerspaces(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(makerspace_id, user_id)
);
```

**equipment**:
```sql
CREATE TABLE makrcave.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    makerspace_id UUID REFERENCES makrcave.makerspaces(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    specifications JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'available',
    location VARCHAR(255),
    hourly_rate DECIMAL(10,2),
    skill_requirements JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**projects**:
```sql
CREATE TABLE makrcave.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    makerspace_id UUID REFERENCES makrcave.makerspaces(id),
    creator_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning',
    visibility VARCHAR(20) DEFAULT 'private',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

#### Store Schema (store.*)

**products**:
```sql
CREATE TABLE store.products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id INTEGER REFERENCES store.categories(id),
    brand VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    stock_quantity INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT true,
    images JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**orders**:
```sql
CREATE TABLE store.orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**service_orders**:
```sql
CREATE TABLE store.service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id INTEGER REFERENCES store.orders(id),
    quote_id UUID REFERENCES store.quotes(id),
    service_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    provider_id UUID REFERENCES makrcave.makerspaces(id),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    tracking_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relations & Foreign Keys

**Key Relationships**:

1. **Users ↔ Makerspaces**: Many-to-many through `makerspace_members`
2. **Projects ↔ BOM Items**: One-to-many for material requirements
3. **BOM Items ↔ Products**: Many-to-one for product references
4. **Orders ↔ Service Orders**: One-to-many for fabrication services
5. **Uploads ↔ Quotes**: One-to-many for pricing options

**Cascade Rules**:
- User deletion: Anonymize audit logs, transfer ownership
- Makerspace deletion: Archive projects, transfer equipment
- Order deletion: Restricted if payment processed
- Project deletion: Archive files, maintain BOM history

**Indexes for Performance**:
```sql
-- User lookups
CREATE INDEX idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX idx_users_email ON users(email);

-- Makerspace queries
CREATE INDEX idx_makerspace_members_lookup ON makrcave.makerspace_members(makerspace_id, user_id);
CREATE INDEX idx_equipment_makerspace ON makrcave.equipment(makerspace_id, status);

-- Store queries
CREATE INDEX idx_products_category ON store.products(category_id, is_active);
CREATE INDEX idx_products_search ON store.products USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_orders_user ON store.orders(user_id, created_at DESC);
```

---

*Continue with sections 11-14 in next response...*
