# MakrX Ecosystem

**Dream, Make, Share** - A unified ecosystem for makers worldwide.

## 🚀 Overview

MakrX is a comprehensive ecosystem designed to connect makers, inventors, and creative communities with the tools, spaces, and resources they need to design, prototype, and manufacture anything — efficiently, collaboratively, and at scale.

### Vision Statement
To democratize making by providing an integrated platform that bridges the gap between digital design and physical creation, fostering global maker communities through shared knowledge, resources, and collaboration.

## 🏗️ Ecosystem Architecture

The MakrX ecosystem consists of a **public gateway** connecting to external ecosystem applications:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────��───────────┐
│   MakrX.org     │    │   MakrCave      │    │  MakrX.Store    │
│   (Gateway)     │◄──►│ (Management)    │◄──►│ (E-commerce)    │
│                 │    │                 │    │                 │
│ • Landing       │    │ • Makerspaces   │    │ • Products      │
│ • Profiles      │    │ • Inventory     │    │ • Fabrication   ��
│ • Navigation    │    │ • Equipment     │    │ • Orders        │
│ • Community     │    │ • Projects      │    │ • BOM Import    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Shared Services │
                    │                 │
                    │ • Keycloak SSO  │
                    │ • PostgreSQL    │
                    │ • MinIO Storage │
                    │ • API Gateway   │
                    └─────────────────┘
```

## 🌐 Domain Breakdown

| Domain | URL | Purpose | Target Users |
|--------|-----|---------|--------------|
| **MakrX.org** | `https://makrx.org` | **Public Gateway** - Ecosystem overview, service information, external app links | All visitors |
| **MakrCave** | `https://makrcave.com` | Makerspace management, booking, community features | Makerspace admins, members |
| **MakrX.Store** | `https://makrx.store` | E-commerce marketplace, tools and components | Customers, makers |
| **3D.MakrX.Store** | `https://3d.makrx.store` | Custom fabrication services, upload & quote | Designers, makers |
| **Provider Panel** | `https://providers.makrx.org` | Service provider portal, job management | Service providers |

## 🔧 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd makrx-ecosystem
   ```

2. **Environment Setup**
   ```bash
   cp .env.production.template .env
   # Edit .env with your local configuration
   ```

3. **Start the ecosystem**
   ```bash
   docker-compose up -d
   npm install
   npm run dev
   ```

4. **Access the applications**
   - Gateway: `http://localhost:3000`
   - MakrCave: `http://localhost:3001` 
   - Store: `http://localhost:3002`
   - API Documentation: `http://localhost:8000/docs`

## 👥 User Roles & Permissions

| Role | Global Access | Domain Access | Key Permissions |
|------|---------------|---------------|----------------|
| **Super Admin** | Full ecosystem | All domains | System configuration, user management |
| **Admin** | Organization-wide | Assigned domains | Feature flags, analytics, billing |
| **Makerspace Admin** | Makerspace-scoped | MakrCave primary | Member management, inventory, equipment |
| **Service Provider** | Provider-scoped | MakrCave, Store | Job management, order fulfillment |
| **Member** | Community access | All domains | Equipment booking, project collaboration |
| **Store Customer** | Public + purchases | Store primary | Product ordering, account management |
| **Guest** | Public content | Landing pages | Browse, register, explore |

## 🏃‍♂️ Key User Flows

### 1. New User Onboarding
```
Register → Email Verification → Profile Setup → Domain Selection → Feature Access
```

### 2. Makerspace Workflow
```
Browse Makerspaces → Join/Apply → Equipment Training → Skill Certification → Book Equipment → Create Projects
```

### 3. E-commerce Flow
```
Browse Products → Add to Cart → Checkout → Payment → Order Fulfillment → Delivery
```

### 4. Fabrication Service
```
Upload STL → Auto-quote → Select Provider → Payment → Production → Quality Check → Shipping
```

## 🚀 Features

### Core Platform Features
- **Single Sign-On (SSO)** - Unified authentication across all domains
- **Role-Based Access Control** - Granular permissions system
- **Feature Flags** - Dynamic feature management
- **Real-time Notifications** - Cross-platform messaging
- **API-First Architecture** - Extensible and integrable

### MakrCave Features
- **Smart Inventory Management** - Auto-tracking with Store integration
- **Equipment Reservations** - Skill-gated booking system
- **Project Management** - BOM collaboration and version control
- **Service Provider Portal** - Job management and fulfillment
- **Analytics Dashboard** - Usage metrics and insights

### Store Features
- **Product Catalog** - Maker-focused inventory
- **Instant Fabrication Quotes** - STL upload with auto-pricing
- **BOM Integration** - Direct ordering from MakrCave projects
- **Provider Network** - Global fabrication capabilities

## 📁 Repository Structure

```
makrx-ecosystem/
├── docs/                          # Documentation
├── frontend/
│   ├── gateway-frontend/          # MakrX.org (React)
│   ├── makrcave-frontend/         # MakrCave (React)
│   └── makrx-store-frontend/      # Store (Next.js)
├── backends/
│   ├── auth-service/              # Authentication service
│   └── event-service/             # Event handling
├── makrcave-backend/              # MakrCave API (FastAPI)
├── makrx-store-backend/           # Store API (FastAPI)
├── packages/
│   ├── ui/                        # Shared UI components
│   ├── types/                     # TypeScript definitions
│   └── utils/                     # Shared utilities
├��─ services/
│   └── keycloak/                  # SSO configuration
├── docker-compose.yml             # Local development
├── docker-compose.prod.yml        # Production setup
└── deploy.sh                      # Deployment script
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Gateway, MakrCave), Next.js 14 (Store)
- **Styling**: Tailwind CSS, shadcn/ui components
- **State**: React Context, TanStack Query
- **Routing**: React Router, Next.js App Router

### Backend
- **API**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: Keycloak
- **Storage**: MinIO (S3-compatible)
- **Queue**: Redis
- **Search**: Elasticsearch (optional)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose / Kubernetes
- **Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: Custom health checks

## 📚 Documentation

- [**System Architecture**](docs/ARCHITECTURE.md) - Detailed technical architecture
- [**API Documentation**](docs/API.md) - Complete API reference
- [**Frontend Guide**](docs/FRONTEND.md) - Frontend development guide
- [**Backend Guide**](docs/BACKEND.md) - Backend development guide
- [**Deployment Guide**](docs/DEPLOYMENT.md) - Production deployment
- [**Security Guide**](docs/SECURITY.md) - Security implementation
- [**Contributing**](docs/CONTRIBUTING.md) - Contribution guidelines

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:
- Code style and standards
- Pull request process
- Feature flag usage
- Testing requirements

## 📄 License

This project is proprietary software. All rights reserved.

## 🏢 About

**MakrX** is an initiative by **Botness Technologies Pvt. Ltd.**

For support, contact: [support@makrx.org](mailto:support@makrx.org)

---

**Ready to start making?** [Join the MakrX ecosystem](https://makrx.org) today!
