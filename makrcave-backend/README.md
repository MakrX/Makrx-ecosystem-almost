# MakrCave Backend API

Backend API for the MakrCave Inventory Management System built with FastAPI, SQLAlchemy, and Pydantic.

## 🚀 Features

- **RESTful API** for inventory management
- **Role-based Access Control (RBAC)** with 5 user types
- **Comprehensive Inventory Management** with usage tracking
- **MakrX Store Integration** for automated reordering
- **QR Code Support** for inventory scanning
- **Bulk Operations** (import, export, update, delete)
- **Real-time Low Stock Alerts**
- **Makerspace Isolation** (multi-tenant support)

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## 🛠️ Installation

1. **Create virtual environment** (recommended):
   ```bash
   python -m venv makrcave-env
   source makrcave-env/bin/activate  # On Windows: makrcave-env\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🗄️ Database Setup

1. **Initialize database**:
   ```bash
   python init_db.py
   ```

2. **Reset database** (if needed):
   ```bash
   python init_db.py --reset
   ```

3. **Add sample data** for testing:
   ```bash
   python init_db.py --reset --sample
   ```

## 🏃‍♂️ Running the Server

### Development Mode
```bash
python start.py
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📚 API Endpoints

### Inventory Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/v1/inventory/` | List inventory items | All roles |
| POST | `/api/v1/inventory/` | Add new item | Admin+ |
| GET | `/api/v1/inventory/{id}` | Get single item | All roles |
| PUT | `/api/v1/inventory/{id}` | Update item | Admin+ |
| DELETE | `/api/v1/inventory/{id}` | Delete item | Admin+ |

### Inventory Operations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/v1/inventory/{id}/issue` | Issue/deduct quantity | Admin+, Service Provider |
| POST | `/api/v1/inventory/{id}/restock` | Add quantity | Admin+ |
| POST | `/api/v1/inventory/{id}/reorder` | Reorder from MakrX | Admin+ |

### Usage & Analytics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/v1/inventory/{id}/usage` | Get item usage history | Admin+ |
| GET | `/api/v1/inventory/usage/logs` | Get all usage logs | Admin+ |
| GET | `/api/v1/inventory/alerts/low-stock` | Get low stock alerts | All roles |
| GET | `/api/v1/inventory/stats` | Get inventory statistics | All roles |

### Bulk Operations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/v1/inventory/bulk/import` | Import from CSV | Admin+ |
| GET | `/api/v1/inventory/bulk/import/{job_id}` | Get import status | Admin+ |
| GET | `/api/v1/inventory/export/csv` | Export to CSV | All roles |
| POST | `/api/v1/inventory/bulk/delete` | Bulk delete items | Admin+ |
| POST | `/api/v1/inventory/qr/generate` | Generate QR codes | Admin+ |

## 👥 User Roles & Permissions

| Role | View | Add/Edit | Issue | Reorder | Usage Logs | Delete |
|------|------|----------|-------|---------|------------|--------|
| **Super Admin** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| **Makerspace Admin** | ✅ Own Cave | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Admin (Global)** | ✅ Read-only | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| **User (Maker)** | ✅ Read-only | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| **Service Provider** | ✅ Own Items | ✅ Own Only | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Own Only |

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=sqlite:///./makrcave.db

# Authentication
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# MakrX Store Integration
MAKRX_STORE_API_URL=https://api.makrx.com/v1
MAKRX_STORE_API_KEY=your-api-key

# Server
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

## 🗂️ Project Structure

```
makrcave-backend/
├── main.py                 # FastAPI application
├── start.py               # Server startup script
├── init_db.py             # Database initialization
├── database.py            # Database configuration
├── dependencies.py        # Auth & permissions
├── requirements.txt       # Python dependencies
├── models/
│   └── inventory.py       # SQLAlchemy models
├── schemas/
│   └── inventory.py       # Pydantic schemas
├── crud/
│   └── inventory.py       # Database operations
├── routes/
│   └── inventory.py       # API endpoints
└── utils/
    └── inventory_tools.py # Utility functions
```

## 🧪 Testing

Run tests with pytest:
```bash
pytest
```

## 🔗 Integration

### Frontend Integration
The backend is designed to work with the MakrCave frontend React application. Ensure the frontend is configured to use the correct backend URL.

### MakrX Store Integration
For reordering functionality, configure the MakrX Store API credentials in your environment variables.

## 📖 Development

### Adding New Features
1. Create/update models in `models/`
2. Define schemas in `schemas/`
3. Implement CRUD operations in `crud/`
4. Add API routes in `routes/`
5. Update dependencies if needed

### Database Migrations
For production deployments, use Alembic for database migrations:
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env
   - Ensure database exists and is accessible

2. **Permission Denied Errors**
   - Verify JWT token is valid
   - Check user role permissions

3. **Import/Export Issues**
   - Validate CSV format
   - Check file permissions

### Logs
Server logs are available in the console when running in development mode. For production, configure proper logging in the environment variables.

## 📄 License

MIT License - see LICENSE file for details.
