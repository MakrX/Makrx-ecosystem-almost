# MakrX Ecosystem - Root Directory Structure

This document provides a comprehensive overview of every file and folder in the MakrX ecosystem root directory.

## 📁 Directory Structure Overview

The MakrX ecosystem is organized into several main sections:
- **Frontend Applications** (`frontend/`, `makrx-store-frontend/`)
- **Backend Services** (`backends/`, `makrcave-backend/`, `makrx-store-backend/`)
- **Shared Packages** (`packages/`)
- **Infrastructure** (`nginx/`, `services/`, `netlify/`)
- **Documentation** (`docs/`, various `.md` files)
- **Configuration** (Docker, environment, build configs)

## 📄 Root Level Files

### Configuration Files

#### `package.json`
- **Purpose**: Root workspace configuration for the entire monorepo
- **Key Parameters**:
  - `workspaces`: Defines which directories are part of the workspace
  - `scripts`: Build, test, and deployment commands
  - `dependencies`: Shared dependencies across all projects
- **Impact**: Changes affect the entire project's dependency management and build process
- **Usage**: Used by npm/yarn for workspace management

#### `tsconfig.json`
- **Purpose**: TypeScript configuration for the entire workspace
- **Key Parameters**:
  - `compilerOptions`: TypeScript compilation settings
  - `include`/`exclude`: Which files to process
  - `references`: Project references for multi-project setup
- **Impact**: Changes affect TypeScript compilation across all sub-projects
- **Usage**: Used by TypeScript compiler and IDEs

#### `tailwind.config.ts`
- **Purpose**: Global Tailwind CSS configuration
- **Key Parameters**:
  - `content`: Paths to scan for class names
  - `theme`: Custom design tokens (colors, fonts, spacing)
  - `plugins`: Additional Tailwind functionality
- **Impact**: Changes affect styling across all frontend applications
- **Usage**: Used by Tailwind CSS compiler and PostCSS

#### `postcss.config.js`
- **Purpose**: PostCSS configuration for CSS processing
- **Key Parameters**:
  - `plugins`: CSS processing plugins (Tailwind, autoprefixer)
- **Impact**: Changes affect CSS compilation pipeline
- **Usage**: Used during build process for CSS optimization

#### `vite.config.ts` & `vite.config.server.ts`
- **Purpose**: Vite build tool configuration
- **Key Parameters**:
  - `server`: Development server settings
  - `build`: Production build settings
  - `plugins`: Vite plugins for additional functionality
- **Impact**: Changes affect development experience and build output
- **Usage**: Used by Vite for bundling and serving applications

#### `.prettierrc`
- **Purpose**: Code formatting configuration
- **Key Parameters**:
  - `semi`: Semicolon preferences
  - `singleQuote`: Quote style
  - `tabWidth`: Indentation settings
- **Impact**: Changes affect code formatting across the entire codebase
- **Usage**: Used by Prettier formatter and IDE integrations

#### `.npmrc`
- **Purpose**: npm configuration
- **Key Parameters**:
  - Registry settings
  - Authentication tokens
  - Package resolution rules
- **Impact**: Changes affect package installation and registry access
- **Usage**: Used by npm during package operations

### Environment & Deployment

#### `.env.production.template`
- **Purpose**: Template for production environment variables
- **Key Parameters**:
  - Database connection strings
  - API endpoints
  - Authentication keys
- **Impact**: Changes define what environment variables are needed in production
- **Usage**: Template for creating actual `.env.production` files

#### `docker-compose.yml` & `docker-compose.prod.yml`
- **Purpose**: Docker orchestration for development and production
- **Key Parameters**:
  - `services`: Application containers
  - `networks`: Container networking
  - `volumes`: Data persistence
- **Impact**: Changes affect how the entire application stack is deployed
- **Usage**: Used by Docker Compose for container orchestration

#### `deploy.sh`
- **Purpose**: Deployment automation script
- **Key Parameters**:
  - Build commands
  - Environment setup
  - Service deployment order
- **Impact**: Changes affect deployment process and automation
- **Usage**: Executed during CI/CD pipeline or manual deployments

#### `netlify.toml`
- **Purpose**: Netlify deployment configuration
- **Key Parameters**:
  - Build commands
  - Redirect rules
  - Environment variables
- **Impact**: Changes affect Netlify deployment behavior
- **Usage**: Used by Netlify for static site deployment

### Documentation Files

#### `README.md`
- **Purpose**: Main project documentation and getting started guide
- **Content**: Project overview, setup instructions, architecture
- **Impact**: Primary entry point for new developers
- **Usage**: Displayed on repository homepage

#### `AGENTS.md`
- **Purpose**: AI agent integration guidelines and configuration
- **Content**: Agent behavior rules, coding standards, project context
- **Impact**: Guides AI-assisted development and code generation
- **Usage**: Reference for AI tools and assistants

#### `DEPLOYMENT_GUIDE.md`
- **Purpose**: Comprehensive deployment instructions
- **Content**: Step-by-step deployment procedures for different environments
- **Impact**: Ensures consistent and reliable deployments
- **Usage**: Reference during deployment processes

#### `IMPLEMENTATION_GUIDE.md` & `IMPLEMENTATION_READY_GUIDE.md`
- **Purpose**: Development implementation guidelines
- **Content**: Best practices, architecture decisions, implementation patterns
- **Impact**: Ensures consistent development practices
- **Usage**: Reference during feature development

#### `SECURITY_COMPLIANCE_DOCUMENTATION.md`
- **Purpose**: Security guidelines and compliance requirements
- **Content**: Security protocols, data protection, compliance measures
- **Impact**: Ensures security standards are maintained
- **Usage**: Reference for security implementations and audits

#### `SERVER_MAINTENANCE_GUIDE.md`
- **Purpose**: Server maintenance procedures and troubleshooting
- **Content**: Maintenance tasks, monitoring, troubleshooting steps
- **Impact**: Ensures system reliability and uptime
- **Usage**: Reference for operations and DevOps teams

#### `GITHUB_INTEGRATION_README.md`
- **Purpose**: GitHub integration setup and workflow documentation
- **Content**: CI/CD setup, GitHub Actions, integration procedures
- **Impact**: Defines development workflow and automation
- **Usage**: Reference for setting up development environment

### Build & Development Files

#### `components.json`
- **Purpose**: Component library configuration (likely for shadcn/ui)
- **Key Parameters**:
  - Component paths
  - Styling configuration
  - Import aliases
- **Impact**: Changes affect component generation and imports
- **Usage**: Used by component CLI tools

#### `.gitignore`
- **Purpose**: Git ignore patterns
- **Key Parameters**:
  - Node modules
  - Build artifacts
  - Environment files
- **Impact**: Changes affect what files are tracked by Git
- **Usage**: Used by Git for version control

#### `.dockerignore`
- **Purpose**: Docker ignore patterns
- **Key Parameters**:
  - Files to exclude from Docker context
  - Development files
  - Documentation
- **Impact**: Changes affect Docker build context size and speed
- **Usage**: Used by Docker during image builds

## 📁 Main Directory Structure

### `frontend/`
Contains the main frontend applications:
- Gateway frontend (React + Vite)
- MakrCave frontend (React + Vite)

### `makrx-store-frontend/`
Next.js-based e-commerce frontend application

### `backends/`
Shared backend services (auth, events)

### `makrcave-backend/`
FastAPI backend for MakrCave functionality

### `makrx-store-backend/`
FastAPI backend for e-commerce functionality

### `packages/`
Shared packages and utilities used across applications

### `docs/`
Comprehensive project documentation

### `nginx/`
Reverse proxy configuration

### `services/`
Additional services (Keycloak, etc.)

### `netlify/`
Netlify-specific functions and configuration

### `shared/`
Shared utilities and types

### `server/`
Development server configuration

### `public/`
Static assets

## 🔧 Key Configuration Impact Areas

### Development Experience
- `vite.config.ts`: Hot reload, dev server, build optimization
- `tsconfig.json`: Type checking, IDE support
- `.prettierrc`: Code formatting consistency

### Build & Deployment
- `docker-compose.yml`: Local development environment
- `docker-compose.prod.yml`: Production deployment
- `deploy.sh`: Automated deployment process

### Styling & UI
- `tailwind.config.ts`: Design system tokens and utilities
- `postcss.config.js`: CSS processing pipeline

### Package Management
- `package.json`: Dependencies and workspace configuration
- `.npmrc`: Package registry and installation settings

### Security & Compliance
- Environment templates: Secure configuration management
- Documentation: Security guidelines and procedures

This structure supports a scalable, maintainable ecosystem with clear separation of concerns and comprehensive documentation.
