# MakrX Backend Development Guide

## 🎯 Overview

The MakrX backend consists of multiple FastAPI services that provide REST APIs for the frontend applications. Each service is designed with domain separation, following microservices architecture principles while maintaining development simplicity.

## 🏗️ Backend Architecture

### Service Overview
```
Backend Services:
├── auth-service/          # Authentication & user management
├── makrcave-backend/      # MakrCave management API  
├── makrx-store-backend/   # E-commerce & store API
└── event-service/         # Event handling & notifications
```

### Technology Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with Keycloak integration
- **Validation**: Pydantic models
- **Documentation**: Auto-generated OpenAPI/Swagger
- **Testing**: pytest with fixtures
- **Caching**: Redis for session and data caching

## 🚀 Quick Start

### Prerequisites
```bash
python --version  # 3.11 or higher
poetry --version  # Latest version
docker --version  # For local development
```

### Development Setup
```bash
# Clone and navigate to backend
cd makrcave-backend  # or makrx-store-backend

# Install dependencies
poetry install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
poetry run uvicorn main:app --reload --port 8000

# Run with Docker (recommended)
docker-compose up -d postgres redis
poetry run uvicorn main:app --reload
```

## 🏢 MakrCave Backend

### Project Structure
```
makrcave-backend/
├── crud/                  # Database operations
│   ├── access_control.py  # Permission management
│   ├── analytics.py       # Analytics operations
│   ├── billing.py         # Billing operations
│   ├── equipment.py       # Equipment CRUD
│   ├── inventory.py       # Inventory operations
│   ├── makerspace.py      # Makerspace management
│   ├── members.py         # Member management
│   └── projects.py        # Project operations
├── models/                # SQLAlchemy models
│   ├── access_control.py  # Permission models
│   ├── analytics.py       # Analytics models
│   ├── billing.py         # Billing models
│   ├── equipment.py       # Equipment models
│   ├── inventory.py       # Inventory models
│   ├── makerspace.py      # Makerspace models
│   ├── members.py         # Member models
│   └── projects.py        # Project models
├── routes/                # API endpoints
│   ├── access_control.py  # Permission routes
│   ├── analytics.py       # Analytics endpoints
│   ├── billing.py         # Billing endpoints
│   ├── equipment.py       # Equipment endpoints
│   ├── inventory.py       # Inventory endpoints
│   ├── makerspaces.py     # Makerspace endpoints
│   ├── members.py         # Member endpoints
│   └── projects.py        # Project endpoints
├── schemas/               # Pydantic schemas
│   ├── analytics.py       # Analytics schemas
│   ├── billing.py         # Billing schemas
│   ├── equipment.py       # Equipment schemas
│   ├── inventory.py       # Inventory schemas
│   ├── makerspace.py      # Makerspace schemas
│   ├── members.py         # Member schemas
│   └── projects.py        # Project schemas
├── utils/                 # Utility functions
│   ├── analytics_mock_data.py
│   ├── email_service.py
│   ├── inventory_tools.py
│   └── report_generator.py
├── main.py                # FastAPI application
├── database.py            # Database configuration
└── dependencies.py        # Dependency injection
```

### Core Models

#### Makerspace Model
```python
# models/makerspace.py
class Makerspace(Base):
    __tablename__ = "makerspaces"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    location = Column(String)
    timezone = Column(String, default="UTC")
    currency = Column(String, default="USD")
    settings = Column(JSON)
    
    # Relationships
    members = relationship("MakerspaceMembers", back_populates="makerspace")
    equipment = relationship("Equipment", back_populates="makerspace")
    inventory = relationship("Inventory", back_populates="makerspace")
    projects = relationship("Project", back_populates="makerspace")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### Equipment Model
```python
# models/equipment.py
class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"))
    name = Column(String, nullable=False)
    type = Column(Enum(EquipmentType), nullable=False)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.AVAILABLE)
    location = Column(String)
    specifications = Column(JSON)
    skill_requirements = Column(ARRAY(String))
    hourly_rate = Column(Numeric(10, 2))
    maintenance_schedule = Column(String)
    
    # Relationships
    makerspace = relationship("Makerspace", back_populates="equipment")
    reservations = relationship("Reservation", back_populates="equipment")
    maintenance_logs = relationship("MaintenanceLog", back_populates="equipment")
```

#### Project Model
```python
# models/projects.py
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"))
    owner_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    privacy = Column(Enum(ProjectPrivacy), default=ProjectPrivacy.PRIVATE)
    tags = Column(ARRAY(String))
    
    # Relationships
    makerspace = relationship("Makerspace", back_populates="projects")
    collaborators = relationship("ProjectCollaborator", back_populates="project")
    bom = relationship("BOM", back_populates="project", uselist=False)
    reservations = relationship("Reservation", back_populates="project")
```

### API Route Examples

#### Equipment Management
```python
# routes/equipment.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

router = APIRouter(prefix="/api/v1", tags=["equipment"])

@router.get("/makerspaces/{makerspace_id}/equipment", 
           response_model=List[schemas.EquipmentResponse])
async def list_equipment(
    makerspace_id: UUID,
    status: Optional[EquipmentStatus] = None,
    equipment_type: Optional[EquipmentType] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """List equipment in makerspace with optional filtering."""
    
    # Check permissions
    if not has_makerspace_access(current_user, makerspace_id, "equipment.view"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Get equipment with filters
    equipment = crud.equipment.get_by_makerspace(
        db=db,
        makerspace_id=makerspace_id,
        status=status,
        equipment_type=equipment_type
    )
    
    return equipment

@router.post("/makerspaces/{makerspace_id}/equipment",
            response_model=schemas.EquipmentResponse)
async def create_equipment(
    makerspace_id: UUID,
    equipment_data: schemas.EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create new equipment in makerspace."""
    
    # Check permissions
    if not has_makerspace_access(current_user, makerspace_id, "equipment.create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Create equipment
    equipment = crud.equipment.create(
        db=db,
        obj_in=equipment_data,
        makerspace_id=makerspace_id
    )
    
    return equipment
```

#### Inventory Operations
```python
# routes/inventory.py
@router.post("/makerspaces/{makerspace_id}/inventory/{item_id}/deduct")
async def deduct_inventory(
    makerspace_id: UUID,
    item_id: UUID,
    deduction: schemas.InventoryDeduction,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Deduct inventory for equipment usage or project consumption."""
    
    # Get inventory item
    item = crud.inventory.get(db=db, id=item_id)
    if not item or item.makerspace_id != makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    # Check sufficient stock
    if item.current_stock < deduction.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )
    
    # Record deduction
    crud.inventory.deduct_stock(
        db=db,
        item_id=item_id,
        quantity=deduction.quantity,
        reason=deduction.reason,
        user_id=current_user.id,
        job_id=deduction.job_id
    )
    
    # Check if reorder needed
    if item.current_stock <= item.min_stock_level:
        await trigger_reorder_notification(item)
    
    return {"success": True, "new_stock": item.current_stock}
```

### CRUD Operations

#### Base CRUD Class
```python
# crud/base.py
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from pydantic import BaseModel
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_data)
        db.session.add(db_obj)
        db.session.commit()
        db.session.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
```

#### Equipment CRUD
```python
# crud/equipment.py
class CRUDEquipment(CRUDBase[Equipment, EquipmentCreate, EquipmentUpdate]):
    def get_by_makerspace(
        self,
        db: Session,
        *,
        makerspace_id: UUID,
        status: Optional[EquipmentStatus] = None,
        equipment_type: Optional[EquipmentType] = None
    ) -> List[Equipment]:
        query = db.query(Equipment).filter(Equipment.makerspace_id == makerspace_id)
        
        if status:
            query = query.filter(Equipment.status == status)
        if equipment_type:
            query = query.filter(Equipment.type == equipment_type)
            
        return query.all()
    
    def get_available_for_reservation(
        self,
        db: Session,
        *,
        makerspace_id: UUID,
        start_time: datetime,
        end_time: datetime,
        user_skills: List[str]
    ) -> List[Equipment]:
        """Get equipment available for reservation with skill checking."""
        
        # Base query for available equipment
        query = db.query(Equipment).filter(
            Equipment.makerspace_id == makerspace_id,
            Equipment.status == EquipmentStatus.AVAILABLE
        )
        
        # Filter by user skills
        if user_skills:
            query = query.filter(
                or_(
                    Equipment.skill_requirements == None,
                    Equipment.skill_requirements.op('@>')(user_skills)
                )
            )
        
        # Check for conflicting reservations
        conflicting_reservations = db.query(Reservation).filter(
            Reservation.start_time < end_time,
            Reservation.end_time > start_time,
            Reservation.status.in_([ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE])
        ).subquery()
        
        query = query.filter(
            ~Equipment.id.in_(
                db.query(conflicting_reservations.c.equipment_id)
            )
        )
        
        return query.all()

equipment = CRUDEquipment(Equipment)
```

### Pydantic Schemas

#### Equipment Schemas
```python
# schemas/equipment.py
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime
from enum import Enum

class EquipmentType(str, Enum):
    PRINTER_3D = "3d_printer"
    PRINTER_SLA = "sla_printer"
    LASER_CUTTER = "laser_cutter"
    CNC_MACHINE = "cnc_machine"
    WORKSTATION = "workstation"
    TOOL = "tool"

class EquipmentStatus(str, Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

class EquipmentBase(BaseModel):
    name: str
    type: EquipmentType
    location: Optional[str] = None
    specifications: Optional[dict] = None
    skill_requirements: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    maintenance_schedule: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    @validator('hourly_rate')
    def validate_hourly_rate(cls, v):
        if v is not None and v < 0:
            raise ValueError('Hourly rate must be non-negative')
        return v

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[EquipmentStatus] = None
    location: Optional[str] = None
    specifications: Optional[dict] = None
    skill_requirements: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    maintenance_schedule: Optional[str] = None

class EquipmentResponse(EquipmentBase):
    id: UUID
    makerspace_id: UUID
    status: EquipmentStatus
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    is_available: bool
    next_available_time: Optional[datetime] = None
    utilization_rate: Optional[float] = None

    class Config:
        orm_mode = True
```

## 🛒 Store Backend

### Project Structure
```
makrx-store-backend/
├── app/
│   ├── core/              # Core configuration
│   │   ├── config.py      # Settings and configuration
│   │   ├── security.py    # Security utilities
│   │   └── db.py          # Database setup
│   ├── crud/              # Database operations
│   │   ├── products.py    # Product operations
│   │   └── orders.py      # Order operations
│   ├── models/            # SQLAlchemy models
│   │   ├── commerce.py    # E-commerce models
│   │   ├── reviews.py     # Product reviews
│   │   └── services.py    # Fabrication services
│   ├── routes/            # API endpoints
│   │   ├── products.py    # Product endpoints
│   │   ├── cart.py        # Shopping cart
│   │   ├── orders.py      # Order management
│   │   ├── payment.py     # Payment processing
│   │   └── fabrication.py # 3D printing services
│   ├── schemas/           # Pydantic schemas
│   │   ├── commerce.py    # Commerce schemas
│   │   └── services.py    # Service schemas
│   └── main.py            # FastAPI application
├── requirements.txt
└── Dockerfile
```

### E-commerce Models

#### Product Model
```python
# models/commerce.py
class Product(Base):
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    long_description = Column(Text)
    sku = Column(String, unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    sale_price = Column(Numeric(10, 2))
    currency = Column(String, default="USD")
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    
    # Inventory
    stock_quantity = Column(Integer, default=0)
    track_inventory = Column(Boolean, default=True)
    allow_backorder = Column(Boolean, default=False)
    
    # SEO and metadata
    slug = Column(String, unique=True)
    meta_title = Column(String)
    meta_description = Column(String)
    tags = Column(ARRAY(String))
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Media
    images = Column(ARRAY(String))
    datasheet_url = Column(String)
    
    # Specifications
    specifications = Column(JSON)
    dimensions = Column(JSON)
    weight = Column(Numeric(8, 3))
    
    # Relationships
    category = relationship("Category", back_populates="products")
    reviews = relationship("ProductReview", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    
    @property
    def effective_price(self) -> Decimal:
        return self.sale_price if self.sale_price else self.price
    
    @property
    def in_stock(self) -> bool:
        if not self.track_inventory:
            return True
        return self.stock_quantity > 0 or self.allow_backorder
```

#### Order Model
```python
# models/commerce.py
class Order(Base):
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    order_number = Column(String, unique=True, nullable=False)
    customer_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Order status
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    fulfillment_status = Column(Enum(FulfillmentStatus), default=FulfillmentStatus.PENDING)
    
    # Pricing
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0)
    shipping_amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="USD")
    
    # Addresses
    shipping_address = Column(JSON)
    billing_address = Column(JSON)
    
    # Payment
    payment_method = Column(String)
    payment_intent_id = Column(String)  # Stripe payment intent
    
    # Shipping
    shipping_method = Column(String)
    tracking_number = Column(String)
    
    # Relationships
    items = relationship("OrderItem", back_populates="order")
    
    # Timestamps
    order_date = Column(DateTime, default=datetime.utcnow)
    shipped_date = Column(DateTime)
    delivered_date = Column(DateTime)
```

### Store API Routes

#### Product Catalog
```python
# routes/products.py
@router.get("/products", response_model=List[schemas.ProductResponse])
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    featured: Optional[bool] = None,
    sort: Optional[str] = "name",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List products with filtering, search, and pagination."""
    
    # Build query with filters
    query = db.query(Product).filter(Product.is_active == True)
    
    if category:
        query = query.join(Category).filter(Category.slug == category)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.tags.any(search.lower())
            )
        )
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if in_stock is not None:
        if in_stock:
            query = query.filter(
                or_(
                    Product.track_inventory == False,
                    Product.stock_quantity > 0,
                    Product.allow_backorder == True
                )
            )
    
    if featured is not None:
        query = query.filter(Product.is_featured == featured)
    
    # Apply sorting
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.name.asc())
    
    # Apply pagination
    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": products,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "has_next": (page * limit) < total
        }
    }
```

#### Shopping Cart Operations
```python
# routes/cart.py
@router.post("/cart/items")
async def add_to_cart(
    item: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Add item to shopping cart."""
    
    # Get or create cart
    cart = crud.cart.get_or_create_for_user(db=db, user_id=current_user.id)
    
    # Validate product exists and is available
    product = crud.product.get(db=db, id=item.product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check stock availability
    if product.track_inventory and not product.allow_backorder:
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock_quantity} items available"
            )
    
    # Add or update cart item
    cart_item = crud.cart.add_item(
        db=db,
        cart_id=cart.id,
        product_id=item.product_id,
        quantity=item.quantity
    )
    
    return cart_item
```

## 🔐 Authentication & Security

### JWT Authentication
```python
# dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """Extract user from JWT token."""
    
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = crud.user.get(db=db, id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user
```

### Role-Based Access Control
```python
# utils/permissions.py
def check_makerspace_permission(
    user: models.User,
    makerspace_id: UUID,
    permission: str
) -> bool:
    """Check if user has specific permission for makerspace."""
    
    # Super admins have all permissions
    if "super_admin" in user.roles:
        return True
    
    # Check makerspace membership
    membership = next(
        (m for m in user.makerspace_memberships if m.makerspace_id == makerspace_id),
        None
    )
    
    if not membership:
        return False
    
    # Check role permissions
    role_permissions = ROLE_PERMISSIONS.get(membership.role, {})
    
    # Parse permission (e.g., "equipment.view" -> ["equipment", "view"])
    module, action = permission.split(".", 1)
    module_permissions = role_permissions.get(module, {})
    
    return module_permissions.get(action, False)

def require_permission(permission: str):
    """Decorator to require specific permission for endpoint."""
    
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract user and makerspace_id from function parameters
            user = kwargs.get("current_user")
            makerspace_id = kwargs.get("makerspace_id")
            
            if not check_makerspace_permission(user, makerspace_id, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

## 🧪 Testing

### Test Configuration
```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import get_db, Base

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    return {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "name": "Test User",
        "roles": ["member"]
    }

@pytest.fixture
def auth_headers(test_user):
    token = create_test_token(test_user)
    return {"Authorization": f"Bearer {token}"}
```

### API Testing
```python
# tests/test_equipment.py
def test_list_equipment(client, auth_headers):
    """Test equipment listing endpoint."""
    
    response = client.get(
        "/api/v1/makerspaces/123/equipment",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert isinstance(data["data"], list)

def test_create_equipment(client, auth_headers):
    """Test equipment creation endpoint."""
    
    equipment_data = {
        "name": "Test Printer",
        "type": "3d_printer",
        "location": "Room A",
        "hourly_rate": 5.0
    }
    
    response = client.post(
        "/api/v1/makerspaces/123/equipment",
        json=equipment_data,
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == equipment_data["name"]
    assert data["type"] == equipment_data["type"]

def test_create_equipment_unauthorized(client):
    """Test equipment creation without authentication."""
    
    equipment_data = {
        "name": "Test Printer",
        "type": "3d_printer"
    }
    
    response = client.post(
        "/api/v1/makerspaces/123/equipment",
        json=equipment_data
    )
    
    assert response.status_code == 401
```

### Database Testing
```python
# tests/test_crud.py
from crud.equipment import equipment as equipment_crud
from schemas.equipment import EquipmentCreate

def test_create_equipment(db_session):
    """Test equipment CRUD operations."""
    
    equipment_data = EquipmentCreate(
        name="Test Printer",
        type="3d_printer",
        location="Room A"
    )
    
    equipment = equipment_crud.create(
        db=db_session,
        obj_in=equipment_data,
        makerspace_id="123e4567-e89b-12d3-a456-426614174000"
    )
    
    assert equipment.name == equipment_data.name
    assert equipment.type == equipment_data.type
    assert equipment.status == "available"

def test_get_equipment_by_makerspace(db_session):
    """Test filtering equipment by makerspace."""
    
    # Create test equipment
    equipment1 = equipment_crud.create(db=db_session, ...)
    equipment2 = equipment_crud.create(db=db_session, ...)
    
    # Get equipment for makerspace
    equipment_list = equipment_crud.get_by_makerspace(
        db=db_session,
        makerspace_id="123e4567-e89b-12d3-a456-426614174000"
    )
    
    assert len(equipment_list) == 2
    assert all(eq.makerspace_id == "123e4567-e89b-12d3-a456-426614174000" for eq in equipment_list)
```

## 🚀 Deployment

### Environment Configuration
```python
# core/config.py
from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External services
    REDIS_URL: str
    KEYCLOAK_URL: str
    STRIPE_SECRET_KEY: str
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    
    # File storage
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    
    # API configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MakrX API"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Setup
```bash
# Production deployment
docker build -t makrcave-api .
docker run -d \
  --name makrcave-api \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@db:5432/makrcave \
  -e REDIS_URL=redis://redis:6379 \
  makrcave-api

# Health check
curl http://localhost:8000/health

# API documentation
curl http://localhost:8000/docs
```

---

This backend guide provides comprehensive coverage of the FastAPI services powering the MakrX ecosystem. Each service follows consistent patterns for database operations, API design, authentication, and testing.
