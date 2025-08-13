# MakrX Store Backend

A comprehensive FastAPI backend for the MakrX Store e-commerce platform, providing REST APIs for product catalog, 3D printing services, order management, and payment processing.

## Features

### 🛒 E-commerce Core

- **Product Catalog**: Full product and category management with advanced search and filtering
- **Shopping Cart**: Session-based and user-based cart management
- **Order Management**: Complete order lifecycle from checkout to delivery
- **Payment Processing**: Stripe and Razorpay integration with webhook support

### 🖨️ 3D Printing Services

- **File Upload**: Secure S3/MinIO integration with presigned URLs
- **Quote Engine**: Heuristic pricing based on volume, material, and quality
- **Service Orders**: Job routing and provider management
- **Progress Tracking**: Real-time status updates and milestone tracking

### 🔐 Authentication & Security

- **Keycloak Integration**: JWT-based authentication with role-based access control
- **API Security**: Rate limiting, CORS, and request validation
- **Audit Logging**: Comprehensive activity tracking and security monitoring

### 📊 Admin & Analytics

- **Admin Dashboard**: Product, order, and service management
- **Analytics**: Revenue, product, and service performance metrics
- **System Config**: Dynamic configuration management
- **Notifications**: Email and SMS notification system

## Tech Stack

- **Framework**: FastAPI 0.104+ with async/await support
- **Database**: PostgreSQL with SQLAlchemy 2.0 and Alembic migrations
- **Authentication**: Keycloak OIDC with JWT verification
- **Storage**: S3/MinIO for file uploads with presigned URLs
- **Payments**: Stripe and Razorpay integration
- **Caching**: Redis for rate limiting and session management
- **Queue**: Celery for background tasks (future)

## Project Structure

```
makrx-store-backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── core/                   # Core utilities and configuration
│   │   ├── config.py          # Pydantic settings management
│   │   ├── db.py              # Database connection and session management
│   │   ├── security.py        # JWT authentication and RBAC
│   │   ├── storage.py         # S3/MinIO file storage utilities
│   │   ├── payments.py        # Payment processing (Stripe/Razorpay)
│   │   └── pricing.py         # Quote and pricing calculation engine
│   ├── models/                 # SQLAlchemy database models
│   │   ├── commerce.py        # Products, orders, cart models
│   │   ├── services.py        # 3D printing service models
│   │   └── admin.py           # Admin and system models
│   ├── schemas/                # Pydantic request/response models
│   │   ├── commerce.py        # Commerce API schemas
│   │   ├── services.py        # Service API schemas
│   │   └── admin.py           # Admin API schemas
│   ├── routes/                 # API route handlers
│   │   ├── catalog.py         # Product and category endpoints
│   │   ├── cart.py            # Shopping cart management
│   │   ├── orders.py          # Order processing and tracking
│   │   ├── uploads.py         # File upload endpoints
│   │   ├── quotes.py          # Quote generation
│   │   ├── admin.py           # Admin management endpoints
│   │   ├── webhooks.py        # Payment and service webhooks
│   │   └── health.py          # Health check endpoints
│   ├── crud/                   # Database CRUD operations
│   │   ├── products.py        # Product data access layer
│   │   └── categories.py      # Category data access layer
│   └── utils/                  # Utility functions and helpers
├── alembic/                    # Database migrations
├── tests/                      # Test suite
├── Dockerfile                  # Container configuration
├── requirements.txt            # Python dependencies
└── .env.example               # Environment configuration template
```

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- MinIO or S3 access
- Keycloak instance (optional for development)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/makrx-store-backend.git
cd makrx-store-backend
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up database**

```bash
# Run migrations
alembic upgrade head

# Optional: Seed with sample data
python -c "from app.core.db import create_tables; import asyncio; asyncio.run(create_tables())"
```

6. **Start the server**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Docker Deployment

```bash
# Build image
docker build -t makrx-store-backend .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db \
  -e REDIS_URL=redis://redis:6379/0 \
  makrx-store-backend
```

## API Documentation

### Authentication

The API uses JWT tokens from Keycloak for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

### Role-Based Access Control

- **user**: Basic customer access (cart, orders, quotes)
- **provider**: 3D printing service provider access
- **admin**: Product and order management
- **superadmin**: Full system access

### Key Endpoints

#### Catalog

- `GET /catalog/products` - List products with filtering and search
- `GET /catalog/products/{id}` - Get product details
- `GET /catalog/categories` - List categories

#### Cart & Orders

- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `POST /orders/checkout` - Process checkout
- `GET /orders` - List user's orders

#### 3D Printing Services

- `POST /uploads/sign` - Get presigned upload URL
- `POST /quotes` - Generate price quote
- `POST /service-orders` - Create service order

#### Admin (requires admin role)

- `GET /admin/dashboard` - Admin dashboard data
- `POST /admin/products` - Create/update products
- `GET /admin/orders` - Manage all orders

### Webhook Endpoints

- `POST /webhooks/stripe` - Stripe payment webhooks
- `POST /webhooks/razorpay` - Razorpay payment webhooks

## Configuration

### Environment Variables

Key configuration options (see `.env.example` for complete list):

- `DATABASE_URL`: PostgreSQL connection string
- `KEYCLOAK_ISSUER`: Keycloak realm URL for JWT validation
- `S3_ENDPOINT`: MinIO or S3 endpoint for file storage
- `STRIPE_SECRET_KEY`: Stripe API key for payments
- `RAZORPAY_KEY_ID`: Razorpay API credentials

### Material Pricing

Configure 3D printing material rates in the environment:

```env
RATE_PLA_PER_CM3=0.15
RATE_ABS_PER_CM3=0.18
RATE_PETG_PER_CM3=0.20
RATE_RESIN_PER_CM3=0.35
```

## Development

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

### Code Quality

```bash
# Format code
black app/
isort app/

# Lint code
flake8 app/
mypy app/
```

## Production Deployment

### Security Checklist

- [ ] Use strong SECRET_KEY
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS/TLS
- [ ] Enable rate limiting
- [ ] Configure proper JWT validation
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Monitoring

The API provides health check endpoints for monitoring:

- `/health` - Basic health status
- `/health/detailed` - Detailed service health
- `/health/readiness` - Kubernetes readiness probe
- `/health/liveness` - Kubernetes liveness probe

### Performance

- Use connection pooling for database
- Enable Redis caching for frequently accessed data
- Configure proper resource limits
- Monitor query performance with DB_ECHO=true in development

## Integration

### MakrCave Service Integration

The backend integrates with MakrCave for 3D printing job routing:

```python
# Service order creation triggers MakrCave job
POST /service-orders
# -> Publishes job to MakrCave routing system
# <- Receives status updates via webhooks
```

### Frontend Integration

Compatible with the MakrX Store frontend built with Next.js. The API provides:

- OpenAPI schema at `/openapi.json`
- Interactive documentation at `/docs`
- Type-safe client generation support

## Support

For questions, issues, or contributions:

- **Issues**: GitHub Issues
- **Documentation**: `/docs` endpoint
- **API Status**: `/health` endpoint

## License

Copyright (c) 2024 MakrX. All rights reserved.
