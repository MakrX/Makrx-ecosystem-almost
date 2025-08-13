# MakrX API Documentation

## 📡 API Overview

The MakrX ecosystem provides RESTful APIs across multiple services, all following consistent patterns and authentication mechanisms. All APIs use JSON for data exchange and JWT tokens for authentication.

## 🔐 Authentication

### JWT Token Structure
All API requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Token Payload
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "roles": ["member", "makerspace_admin"],
  "makerspaces": ["makerspace_uuid"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Authentication Endpoints

#### POST `/api/auth/login`
**Purpose**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["member"]
    }
  }
}
```

#### POST `/api/auth/refresh`
**Purpose**: Refresh expired access token

**Required Roles**: Authenticated user

**Request Body**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 🏢 MakrCave API Endpoints

Base URL: `https://makrcave.com/api/v1`

### Makerspaces

#### GET `/makerspaces`
**Purpose**: List all makerspaces (public info only)

**Required Roles**: None (public endpoint)

**Query Parameters**:
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20)
- `search` (string): Search by name or location
- `city` (string): Filter by city
- `country` (string): Filter by country

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "TechHub Berlin",
      "description": "A collaborative workspace for technology enthusiasts",
      "location": "Berlin, Germany",
      "image_url": "https://example.com/image.jpg",
      "member_count": 150,
      "equipment_count": 25,
      "public_info": {
        "hours": "Mon-Fri 9AM-9PM",
        "contact": "hello@techhub.berlin"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "has_next": true
  }
}
```

#### GET `/makerspaces/{id}`
**Purpose**: Get detailed makerspace information

**Required Roles**: `member` (of that makerspace) or `admin`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "TechHub Berlin",
    "description": "A collaborative workspace for technology enthusiasts",
    "location": "Berlin, Germany",
    "settings": {
      "timezone": "Europe/Berlin",
      "currency": "EUR",
      "membership_required": true
    },
    "statistics": {
      "total_members": 150,
      "active_projects": 45,
      "equipment_items": 25,
      "monthly_revenue": 15000
    }
  }
}
```

### Equipment Management

#### GET `/makerspaces/{makerspace_id}/equipment`
**Purpose**: List equipment in makerspace

**Required Roles**: `member` (of makerspace), `makerspace_admin`, or `admin`

**Query Parameters**:
- `status` (string): Filter by status (available, in_use, maintenance, offline)
- `type` (string): Filter by equipment type
- `skill_required` (string): Filter by required skill level

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ultimaker S3",
      "type": "3d_printer",
      "status": "available",
      "location": "Room A2",
      "skill_requirements": ["3d_printing_basic", "safety_certified"],
      "specifications": {
        "build_volume": "230 x 190 x 200 mm",
        "layer_height": "0.1-0.3 mm",
        "materials": ["PLA", "ABS", "PETG"]
      },
      "hourly_rate": 5.00,
      "currency": "EUR",
      "next_available": "2024-01-15T14:00:00Z"
    }
  ]
}
```

#### POST `/makerspaces/{makerspace_id}/equipment`
**Purpose**: Add new equipment

**Required Roles**: `makerspace_admin` or `admin`

**Request Body**:
```json
{
  "name": "Formlabs Form 3",
  "type": "sla_printer",
  "location": "Room B1",
  "specifications": {
    "build_volume": "145 × 145 × 185 mm",
    "layer_height": "0.025-0.3 mm"
  },
  "skill_requirements": ["sla_printing_certified"],
  "hourly_rate": 12.00,
  "maintenance_schedule": "weekly"
}
```

### Reservations

#### GET `/reservations`
**Purpose**: List user's reservations

**Required Roles**: `member` or higher

**Query Parameters**:
- `status` (string): Filter by status (upcoming, active, completed, cancelled)
- `equipment_id` (uuid): Filter by equipment
- `start_date` (ISO date): Filter from date
- `end_date` (ISO date): Filter to date

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "equipment": {
        "id": "uuid",
        "name": "Ultimaker S3",
        "type": "3d_printer"
      },
      "start_time": "2024-01-15T14:00:00Z",
      "end_time": "2024-01-15T18:00:00Z",
      "status": "confirmed",
      "total_cost": 20.00,
      "currency": "EUR",
      "project": {
        "id": "uuid",
        "name": "Prototype Housing"
      }
    }
  ]
}
```

#### POST `/reservations`
**Purpose**: Create new equipment reservation

**Required Roles**: `member` or higher

**Request Body**:
```json
{
  "equipment_id": "uuid",
  "start_time": "2024-01-15T14:00:00Z",
  "end_time": "2024-01-15T18:00:00Z",
  "project_id": "uuid",
  "notes": "Printing prototype parts"
}
```

### Inventory Management

#### GET `/makerspaces/{makerspace_id}/inventory`
**Purpose**: List inventory items

**Required Roles**: `member` (read-only), `makerspace_admin` (full access)

**Query Parameters**:
- `category` (string): Filter by category
- `low_stock` (boolean): Show only low stock items
- `search` (string): Search by name or SKU

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "PLA Filament - Red",
      "sku": "PLA-RED-1.75",
      "category": "filament",
      "current_stock": 5,
      "min_stock_level": 2,
      "unit": "kg",
      "cost_per_unit": 25.00,
      "supplier": "Ultimaker",
      "last_restock": "2024-01-10T10:00:00Z",
      "makrx_store_product_id": "uuid"
    }
  ]
}
```

#### POST `/makerspaces/{makerspace_id}/inventory/{item_id}/deduct`
**Purpose**: Deduct inventory (equipment usage)

**Required Roles**: `member` (own usage), `makerspace_admin`

**Request Body**:
```json
{
  "quantity": 0.5,
  "reason": "3D print job",
  "job_id": "uuid",
  "notes": "Prototype housing print"
}
```

### Project Management

#### GET `/projects`
**Purpose**: List user's projects

**Required Roles**: `member` or higher

**Query Parameters**:
- `status` (string): Filter by status (draft, active, completed, archived)
- `makerspace_id` (uuid): Filter by makerspace
- `collaborator` (boolean): Include projects where user is collaborator

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Smart Home Controller",
      "description": "IoT device for home automation",
      "status": "active",
      "owner": {
        "id": "uuid",
        "name": "John Doe"
      },
      "collaborators": [
        {
          "id": "uuid",
          "name": "Jane Smith",
          "role": "contributor"
        }
      ],
      "makerspace": {
        "id": "uuid",
        "name": "TechHub Berlin"
      },
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T15:30:00Z"
    }
  ]
}
```

#### POST `/projects`
**Purpose**: Create new project

**Required Roles**: `member` or higher

**Request Body**:
```json
{
  "name": "Smart Home Controller",
  "description": "IoT device for home automation",
  "makerspace_id": "uuid",
  "privacy": "private",
  "tags": ["iot", "electronics", "home-automation"]
}
```

### BOM (Bill of Materials) Management

#### GET `/projects/{project_id}/bom`
**Purpose**: Get project's bill of materials

**Required Roles**: Project owner, collaborator, or `admin`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "project_id": "uuid",
    "version": "1.2",
    "status": "approved",
    "total_cost": 125.50,
    "currency": "EUR",
    "items": [
      {
        "id": "uuid",
        "name": "Arduino Uno R3",
        "quantity": 1,
        "unit_price": 25.00,
        "total_price": 25.00,
        "supplier": "Arduino",
        "makrx_store_product_id": "uuid",
        "notes": "Main microcontroller"
      }
    ],
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T15:30:00Z"
  }
}
```

#### POST `/projects/{project_id}/bom/items`
**Purpose**: Add item to BOM

**Required Roles**: Project owner, collaborator with edit permission

**Request Body**:
```json
{
  "name": "ESP32 DevKit",
  "quantity": 2,
  "estimated_price": 12.50,
  "supplier": "Espressif",
  "makrx_store_product_id": "uuid",
  "notes": "WiFi connectivity modules"
}
```

## 🛒 Store API Endpoints

Base URL: `https://makrx.store/api/v1`

### Product Catalog

#### GET `/products`
**Purpose**: List products with filtering and search

**Required Roles**: None (public endpoint)

**Query Parameters**:
- `category` (string): Filter by category slug
- `search` (string): Search in name and description
- `min_price` (float): Minimum price filter
- `max_price` (float): Maximum price filter
- `in_stock` (boolean): Show only in-stock items
- `featured` (boolean): Show only featured products
- `sort` (string): Sort by (price_asc, price_desc, name, newest, rating)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Arduino Uno R3",
      "description": "The classic Arduino development board",
      "price": 25.00,
      "sale_price": null,
      "currency": "EUR",
      "sku": "ARD-UNO-R3",
      "category": {
        "id": "uuid",
        "name": "Microcontrollers",
        "slug": "microcontrollers"
      },
      "images": [
        "https://store.makrx.org/images/arduino-uno-1.jpg"
      ],
      "in_stock": true,
      "stock_quantity": 50,
      "rating": 4.8,
      "review_count": 124,
      "tags": ["arduino", "microcontroller", "development"]
    }
  ]
}
```

#### GET `/products/{id}`
**Purpose**: Get detailed product information

**Required Roles**: None (public endpoint)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Arduino Uno R3",
    "description": "The classic Arduino development board perfect for beginners and experts alike.",
    "long_description": "Full detailed description with specifications...",
    "price": 25.00,
    "currency": "EUR",
    "sku": "ARD-UNO-R3",
    "specifications": {
      "microcontroller": "ATmega328P",
      "operating_voltage": "5V",
      "input_voltage": "7-12V",
      "digital_io_pins": 14,
      "analog_input_pins": 6
    },
    "images": [
      "https://store.makrx.org/images/arduino-uno-1.jpg",
      "https://store.makrx.org/images/arduino-uno-2.jpg"
    ],
    "datasheet_url": "https://store.makrx.org/datasheets/arduino-uno.pdf",
    "related_products": [
      {
        "id": "uuid",
        "name": "Arduino Starter Kit",
        "price": 85.00
      }
    ]
  }
}
```

### Shopping Cart

#### GET `/cart`
**Purpose**: Get user's shopping cart

**Required Roles**: `customer` or higher

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Arduino Uno R3",
          "price": 25.00,
          "image": "https://store.makrx.org/images/arduino-uno-1.jpg"
        },
        "quantity": 2,
        "unit_price": 25.00,
        "total_price": 50.00
      }
    ],
    "subtotal": 50.00,
    "tax": 9.50,
    "shipping": 5.99,
    "total": 65.49,
    "currency": "EUR"
  }
}
```

#### POST `/cart/items`
**Purpose**: Add item to cart

**Required Roles**: `customer` or higher

**Request Body**:
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

### Orders

#### GET `/orders`
**Purpose**: List user's orders

**Required Roles**: `customer` or higher

**Query Parameters**:
- `status` (string): Filter by status
- `start_date` (ISO date): Filter from date
- `end_date` (ISO date): Filter to date

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-2024-001234",
      "status": "shipped",
      "order_date": "2024-01-15T10:00:00Z",
      "items": [
        {
          "product_name": "Arduino Uno R3",
          "quantity": 2,
          "unit_price": 25.00,
          "total_price": 50.00
        }
      ],
      "subtotal": 50.00,
      "tax": 9.50,
      "shipping": 5.99,
      "total": 65.49,
      "currency": "EUR",
      "shipping_address": {
        "street": "123 Maker St",
        "city": "Berlin",
        "country": "Germany",
        "postal_code": "10115"
      },
      "tracking_number": "1Z999AA1234567890"
    }
  ]
}
```

#### POST `/orders`
**Purpose**: Create order from cart

**Required Roles**: `customer` or higher

**Request Body**:
```json
{
  "payment_method_id": "pm_1234567890",
  "shipping_address": {
    "street": "123 Maker St",
    "city": "Berlin",
    "country": "Germany",
    "postal_code": "10115"
  },
  "billing_address": {
    "street": "123 Maker St",
    "city": "Berlin",
    "country": "Germany",
    "postal_code": "10115"
  }
}
```

### Fabrication Services

#### POST `/fabrication/quote`
**Purpose**: Get instant quote for STL file

**Required Roles**: `customer` or higher

**Request Body** (multipart/form-data):
```
file: (STL file)
material: "PLA"
quality: "standard"
quantity: 1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quote_id": "uuid",
    "file_info": {
      "filename": "prototype.stl",
      "volume_mm3": 12500,
      "dimensions": {
        "x": 50,
        "y": 40,
        "z": 25
      }
    },
    "options": [
      {
        "material": "PLA",
        "color": "White",
        "quality": "standard",
        "estimated_time": "4 hours",
        "price": 15.50,
        "provider": {
          "id": "uuid",
          "name": "TechHub Berlin",
          "rating": 4.9
        }
      }
    ],
    "expires_at": "2024-01-16T10:00:00Z"
  }
}
```

## 🔧 Error Handling

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT"
      }
    ],
    "request_id": "req_1234567890"
  }
}
```

## 📝 API Rate Limiting

### Rate Limit Headers
All API responses include rate limiting headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limits by Endpoint Type
- **Authentication**: 5 requests per minute
- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **File uploads**: 10 requests per minute

## 🔍 API Testing

### Interactive Documentation
- **MakrCave API**: `https://makrcave.com/api/docs`
- **Store API**: `https://makrx.store/api/docs`
- **Auth API**: `https://makrx.org/auth/docs`

### Test Environment
- **Base URL**: Use `/api/test/v1` for testing
- **Test Data**: Sandbox environment with sample data
- **Test Payments**: Stripe test mode enabled

---

This API documentation provides comprehensive coverage of all MakrX ecosystem endpoints. For additional examples and advanced usage, see the interactive documentation at each service's `/docs` endpoint.
