# MakrX Store Backend - FastAPI E-commerce API

A comprehensive FastAPI backend providing e-commerce functionality, 3D printing services, and security-compliant operations for the MakrX Store frontend.

## 📁 Directory Structure

```
makrx-store-backend/
├── app/                    # Main application package
│   ├── core/              # Core system modules
│   │   ├── config.py      # Application configuration
│   │   ├── db.py          # Database connection and setup
│   │   ├── enhanced_security_auth.py  # Enhanced authentication
│   │   ├── file_security.py          # File handling security
│   │   ├── operational_security.py   # Operational security
│   │   ├── data_protection.py        # Data protection (DPDP compliance)
│   │   ├── payment_security.py       # Payment processing security
│   │   ├── security_monitoring.py    # Security monitoring and logging
│   │   └── feature_flags.py          # Feature flag system
│   ├── crud/              # Database CRUD operations
│   │   ├── categories.py  # Category operations
│   │   └── products.py    # Product operations
│   ├── middleware/        # Custom middleware
│   │   ├── api_security.py           # API security middleware
│   │   └── observability.py         # Request monitoring
│   ├── models/            # SQLAlchemy database models
│   │   ├── __init__.py    # Model exports
│   │   ├── admin.py       # Admin-related models
│   │   ├── commerce.py    # E-commerce models
│   │   ├── reviews.py     # Review and rating models
│   │   ├── services.py    # Service-related models
│   │   └── subscriptions.py  # Subscription models
│   ├── routes/            # API route handlers
│   │   ├── admin.py       # Admin endpoints
│   │   ├── auth.py        # Authentication endpoints
│   │   ├── bom_import.py  # Bill of Materials import
│   │   ├── bridge.py      # Cross-service bridge
│   │   ├── cart.py        # Shopping cart endpoints
│   │   ├── catalog.py     # Product catalog endpoints
│   │   ├── enhanced_catalog.py  # Enhanced catalog features
│   │   ├── feature_flags.py     # Feature flag endpoints
│   │   ├── health.py      # Health check endpoints
│   │   ├── orders.py      # Order management endpoints
│   │   ├── quick_reorder.py     # Quick reorder functionality
│   │   ├── security_management.py  # Security management
│   │   ├── uploads.py     # File upload endpoints
│   │   └── webhooks.py    # Webhook handlers
│   ├── schemas/           # Pydantic schemas for API
│   │   ├── __init__.py    # Schema exports
│   │   ├── admin.py       # Admin schemas
│   │   ├── commerce.py    # E-commerce schemas
│   │   └── services.py    # Service schemas
│   └── main.py           # FastAPI application entry point
├── .env.example          # Environment variables template
├── Dockerfile           # Docker container configuration
├── README.md           # Basic project documentation
└── requirements.txt    # Python dependencies
```

## 🎯 Core System (`app/core/`)

### `config.py`
**Purpose**: Centralized application configuration management

**Key Configuration Classes**:
```python
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Authentication
    KEYCLOAK_URL: str
    KEYCLOAK_REALM: str
    KEYCLOAK_CLIENT_ID: str
    KEYCLOAK_CLIENT_SECRET: str
    
    # Security
    SECRET_KEY: str
    ENCRYPTION_KEY: str
    JWT_ALGORITHM: str = "HS256"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # External Services
    AUTH_SERVICE_URL: str
    PAYMENT_GATEWAY_URL: str
    EMAIL_SERVICE_URL: str
    
    # File Storage
    MAX_FILE_SIZE: int = 50_000_000  # 50MB
    ALLOWED_FILE_TYPES: list = [".stl", ".obj", ".3mf"]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Features
    ENABLE_ANALYTICS: bool = True
    ENABLE_CACHING: bool = True
```

**Configuration Impact**:
- Database connections and pooling
- Authentication and security settings
- File upload restrictions
- Rate limiting and performance
- Feature toggles and environment behavior

### `db.py`
**Purpose**: Database connection, session management, and table creation

**Key Functions**:
```python
# Database engine creation
async def get_database_engine() -> AsyncEngine

# Session management
async def get_db_session() -> AsyncSession

# Table creation and migrations
async def create_tables() -> None

# Health checks
async def check_database_health() -> bool
```

**Configuration Parameters**:
- Connection pool size and settings
- Connection timeout configurations
- SSL certificate handling
- Database migration strategies

**Impact**: Changes affect database performance, connection handling, and data persistence

### `enhanced_security_auth.py`
**Purpose**: Advanced authentication and authorization with security monitoring

**Key Features**:
- Multi-factor authentication (MFA)
- JWT token validation and refresh
- Role-based access control (RBAC)
- Session management
- Security event logging

**Security Classes**:
```python
class EnhancedAuth:
    async def validate_token(self, token: str) -> UserInfo
    async def refresh_token(self, refresh_token: str) -> TokenPair
    async def check_permissions(self, user: User, resource: str, action: str) -> bool
    async def log_security_event(self, event: SecurityEvent) -> None
```

### `file_security.py`
**Purpose**: Secure file handling for uploads and storage

**Security Features**:
- File type validation
- Virus scanning integration
- Size limit enforcement
- Secure filename generation
- Content sanitization

**Configuration**:
```python
FILE_SECURITY_CONFIG = {
    "max_file_size": 50_000_000,  # 50MB
    "allowed_extensions": [".stl", ".obj", ".3mf", ".step"],
    "scan_for_viruses": True,
    "quarantine_suspicious": True,
    "enable_content_analysis": True
}
```

### `data_protection.py`
**Purpose**: DPDP Act 2023 compliance and data protection

**Compliance Features**:
- Data consent management
- Personal data identification
- Data retention policies
- Right to deletion
- Data anonymization
- Audit logging

**Key Classes**:
```python
class ConsentManager:
    async def record_consent(self, user_id: str, purpose: str) -> None
    async def revoke_consent(self, user_id: str, purpose: str) -> None
    async def check_consent(self, user_id: str, purpose: str) -> bool

class RetentionManager:
    async def enforce_retention_policies() -> None
    async def anonymize_expired_data() -> None
    async def generate_retention_report() -> Report
```

### `security_monitoring.py`
**Purpose**: Comprehensive security monitoring and logging

**Monitoring Features**:
- Real-time threat detection
- API usage analytics
- Security event correlation
- Performance monitoring
- Alerting system

**Key Components**:
```python
class SecurityLogger:
    async def log_security_event(self, event_type: str, details: dict) -> None
    async def generate_security_report(self, timeframe: str) -> Report

class PerformanceMonitor:
    async def record_api_metric(self, endpoint: str, duration: float) -> None
    async def detect_anomalies() -> List[Anomaly]
```

## 📊 Database Models (`app/models/`)

### `commerce.py`
**Purpose**: Core e-commerce data models

**Key Models**:
```python
class Product(Base):
    id: int
    name: str
    description: str
    category_id: int
    price: Decimal
    sale_price: Optional[Decimal]
    stock_qty: int
    images: List[str]
    specifications: JSON
    is_active: bool
    created_at: datetime
    updated_at: datetime

class Category(Base):
    id: int
    name: str
    slug: str
    description: str
    parent_id: Optional[int]
    sort_order: int
    is_active: bool

class Cart(Base):
    id: str
    user_id: Optional[str]
    session_id: str
    items: relationship("CartItem")
    created_at: datetime

class Order(Base):
    id: int
    order_number: str
    user_id: Optional[str]
    status: OrderStatus
    subtotal: Decimal
    tax_amount: Decimal
    total: Decimal
    shipping_address: JSON
    billing_address: JSON
```

**Configuration Impact**:
- Database schema structure
- Relationship definitions
- Index optimization
- Data validation rules

### `services.py`
**Purpose**: 3D printing and fabrication service models

**Key Models**:
```python
class Upload(Base):
    id: str
    user_id: Optional[str]
    file_key: str
    file_name: str
    file_size: int
    status: UploadStatus
    processing_results: JSON

class Quote(Base):
    id: str
    upload_id: str
    material: str
    quality: str
    estimated_price: Decimal
    estimated_time: int
    expires_at: datetime

class ServiceOrder(Base):
    id: str
    quote_id: str
    order_id: Optional[int]
    status: ServiceStatus
    provider_id: Optional[int]
    tracking_info: JSON
```

## 🔀 API Routes (`app/routes/`)

### `catalog.py`
**Purpose**: Product catalog and search functionality

**Key Endpoints**:
```python
# Product operations
GET /catalog/products              # List products with filtering
GET /catalog/products/{id}         # Get product by ID
GET /catalog/products/slug/{slug}  # Get product by slug
GET /catalog/products/featured     # Get featured products

# Category operations
GET /catalog/categories            # List categories
GET /catalog/categories/{id}       # Get category by ID
GET /catalog/categories/slug/{slug} # Get category by slug

# Search and filtering
GET /catalog/search                # Search products
GET /catalog/brands               # Get available brands
GET /catalog/search/suggestions    # Get search suggestions
```

**Query Parameters**:
- `q`: Search query
- `category_id`: Filter by category
- `price_min`/`price_max`: Price range
- `brand`: Filter by brand
- `in_stock`: Only in-stock items
- `sort`: Sort order
- `page`/`per_page`: Pagination

### `cart.py`
**Purpose**: Shopping cart management

**Key Endpoints**:
```python
GET /cart                    # Get current cart
POST /cart/items            # Add item to cart
PATCH /cart/items/{item_id} # Update cart item
DELETE /cart/items/{item_id} # Remove from cart
DELETE /cart                # Clear cart
POST /cart/merge            # Merge session cart with user cart
```

**Request/Response Examples**:
```python
# Add to cart
POST /cart/items
{
    "product_id": 123,
    "quantity": 2,
    "meta": {"color": "red", "size": "large"}
}

# Update quantity
PATCH /cart/items/456
{
    "quantity": 3
}
```

### `orders.py`
**Purpose**: Order management and checkout

**Key Endpoints**:
```python
GET /orders                 # List user orders
GET /orders/{id}           # Get order details
POST /orders/checkout      # Create order from cart
POST /orders/{id}/cancel   # Cancel order
GET /orders/{id}/status    # Get order status
```

**Checkout Flow**:
```python
POST /orders/checkout
{
    "shipping_address": {...},
    "billing_address": {...},
    "payment_method": "stripe",
    "shipping_method": "standard",
    "coupon_code": "SAVE10"
}
```

### `uploads.py`
**Purpose**: File upload handling for 3D printing services

**Key Endpoints**:
```python
POST /uploads/sign         # Get signed upload URL
POST /uploads/complete     # Mark upload as complete
GET /uploads/{id}          # Get upload status
DELETE /uploads/{id}       # Delete upload
```

**Upload Process**:
1. Request signed URL: `POST /uploads/sign`
2. Upload file to signed URL
3. Complete upload: `POST /uploads/complete`
4. Process file and generate quote

### `auth.py`
**Purpose**: Authentication and user management

**Key Endpoints**:
```python
GET /auth/me               # Get current user info
POST /auth/refresh         # Refresh authentication token
POST /auth/logout          # Logout user
GET /auth/permissions      # Get user permissions
```

## 🛡️ Security & Middleware (`app/middleware/`)

### `api_security.py`
**Purpose**: Comprehensive API security middleware

**Security Features**:
- Rate limiting per IP and user
- Input validation and sanitization
- CORS policy enforcement
- Security headers (HSTS, CSP, etc.)
- Request/response logging
- DDoS protection

**Configuration**:
```python
SECURITY_CONFIG = {
    "rate_limit_per_minute": 60,
    "max_request_size": "10MB",
    "enable_cors": True,
    "allowed_origins": ["https://makrx.store"],
    "security_headers": {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block"
    }
}
```

### `observability.py`
**Purpose**: Request monitoring and performance tracking

**Features**:
- Request/response timing
- Error rate monitoring
- Performance metrics collection
- Distributed tracing
- Health check automation

## 📋 Database Operations (`app/crud/`)

### `products.py`
**Purpose**: Product database operations

**Key Functions**:
```python
async def get_products(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    filters: ProductFilters = None
) -> List[Product]

async def get_product_by_id(db: AsyncSession, product_id: int) -> Product

async def search_products(
    db: AsyncSession,
    query: str,
    filters: ProductFilters = None
) -> List[Product]

async def get_featured_products(
    db: AsyncSession,
    limit: int = 10
) -> List[Product]
```

### `categories.py`
**Purpose**: Category database operations

**Key Functions**:
```python
async def get_categories(
    db: AsyncSession,
    include_inactive: bool = False
) -> List[Category]

async def get_category_tree(db: AsyncSession) -> List[Category]

async def get_products_by_category(
    db: AsyncSession,
    category_id: int,
    filters: ProductFilters = None
) -> List[Product]
```

## 🚀 Application Entry Point

### `main.py`
**Purpose**: FastAPI application configuration and startup

**Key Features**:
- Application instance creation
- Middleware setup
- Route registration
- CORS configuration
- Database initialization
- Security system startup
- Health check endpoints

**Startup Sequence**:
1. Load configuration
2. Initialize database connections
3. Set up security middleware
4. Register API routes
5. Start background tasks
6. Enable monitoring systems

**Configuration Impact**:
- Application performance settings
- Security policy enforcement
- Database connection management
- Background task scheduling

## 🔧 Development & Deployment

### Environment Configuration
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/makrx_store

# Authentication
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=makrx
KEYCLOAK_CLIENT_ID=makrx-store-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Security
SECRET_KEY=your-secret-key
ENCRYPTION_KEY=your-encryption-key

# External Services
AUTH_SERVICE_URL=http://localhost:8001
PAYMENT_GATEWAY_URL=https://api.stripe.com

# Features
ENVIRONMENT=development
DEBUG=true
ENABLE_ANALYTICS=true
```

### Docker Configuration
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Development Commands
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Database migrations
alembic upgrade head

# Security scan
bandit -r app/

# Type checking
mypy app/
```

This backend provides a robust, secure, and scalable foundation for the MakrX Store e-commerce platform with comprehensive security compliance and monitoring capabilities.
