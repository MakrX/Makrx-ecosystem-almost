# MakrX Ecosystem Documentation

Welcome to the comprehensive documentation for the MakrX ecosystem - India's premier platform for makers, innovators, and creators.

## 🎯 Quick Start

### For Developers
- **[Gateway Frontend](./GATEWAY_FRONTEND.md)** - Primary landing page and portal
- **[Frontend Development](./FRONTEND.md)** - General frontend development guide
- **[Backend Development](./BACKEND.md)** - API and backend services
- **[Architecture Overview](./ARCHITECTURE.md)** - System architecture and design

### For Deployment
- **[Gateway Production Deployment](./GATEWAY_PRODUCTION_DEPLOYMENT.md)** - Production deployment guide
- **[Gateway Server Setup](./GATEWAY_SERVER_SETUP.md)** - Server configuration and infrastructure
- **[Gateway Configuration](./GATEWAY_CONFIGURATION.md)** - Customization and configuration
- **[Deployment Guide](./DEPLOYMENT.md)** - General deployment procedures

### For Contributors
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute to the project
- **[Feature Template](./FEATURE_TEMPLATE.md)** - Template for new features
- **[Security Guidelines](./SECURITY.md)** - Security best practices

## 📚 Complete Documentation Index

### Gateway Frontend Documentation
The Gateway Frontend serves as the primary entry point to the MakrX ecosystem:

| Document | Purpose | Audience |
|----------|---------|----------|
| [Gateway Frontend](./GATEWAY_FRONTEND.md) | Complete technical documentation | Developers, DevOps |
| [Gateway Production Deployment](./GATEWAY_PRODUCTION_DEPLOYMENT.md) | Step-by-step production setup | DevOps, SysAdmins |
| [Gateway Server Setup](./GATEWAY_SERVER_SETUP.md) | Server and infrastructure setup | SysAdmins |
| [Gateway Configuration](./GATEWAY_CONFIGURATION.md) | Customization and configuration | Developers, Admins |

### Ecosystem Components
- **[Complete Ecosystem Guide](./COMPLETE_ECOSYSTEM_GUIDE.md)** - Overview of all components
- **[Directory Structure](./DIRECTORY_STRUCTURE.md)** - Project organization
- **[API Documentation](./API.md)** - API reference and usage

### Development & Operations
- **[Frontend Development](./FRONTEND.md)** - General frontend development
- **[Backend Development](./BACKEND.md)** - Backend services and APIs
- **[Security Deployment](./SECURITY_DEPLOYMENT_CONTRIBUTION.md)** - Security guidelines

## 🏗️ MakrX Ecosystem Overview

The MakrX ecosystem consists of several interconnected applications:

### 🌐 Gateway Frontend
**Location**: `frontend/gateway-frontend/`  
**Purpose**: Primary landing page and unified portal  
**Tech Stack**: React 18.3.1, TypeScript, Vite, Tailwind CSS  
**Documentation**: [Gateway Frontend Docs](./GATEWAY_FRONTEND.md)

**Key Features**:
- Unified authentication with Keycloak SSO
- App launcher for all MakrX applications
- Legal compliance (DPDP Act 2023, Consumer Protection Act 2019)
- SEO optimization and accessibility (WCAG 2.1 AA)
- Feature flag system for dynamic configuration

### 🏭 MakrCave Frontend
**Location**: `frontend/makrcave-frontend/`  
**Purpose**: Makerspace management and booking platform  
**Features**: Equipment booking, member management, analytics

### 🛒 Store Frontend
**Location**: `makrx-store-frontend/`  
**Purpose**: E-commerce platform for maker tools and components  
**Features**: Product catalog, shopping cart, payments, orders

### 🎓 Learn Platform
**Purpose**: Educational resources and skill development  
**Features**: Courses, certifications, skill assessments

### 🔧 Backend Services
**Location**: `makrcave-backend/`, `makrx-store-backend/`  
**Purpose**: API services and data management  
**Tech Stack**: Python FastAPI, PostgreSQL, Redis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Python 3.9+ (for backend services)
- PostgreSQL 14+ (for databases)
- Docker & Docker Compose (recommended)
- Git for version control

### Quick Setup (Gateway Frontend)
```bash
# Clone repository
git clone <repository-url>
cd makrx-ecosystem

# Setup Gateway Frontend
cd frontend/gateway-frontend
npm install
npm run dev
```

For complete setup instructions, see [Gateway Frontend Documentation](./GATEWAY_FRONTEND.md).

### Production Deployment
For production deployment, follow the comprehensive guides:

1. **[Gateway Production Deployment](./GATEWAY_PRODUCTION_DEPLOYMENT.md)** - Complete production setup
2. **[Gateway Server Setup](./GATEWAY_SERVER_SETUP.md)** - Infrastructure and server configuration
3. **[Gateway Configuration](./GATEWAY_CONFIGURATION.md)** - Customization and environment setup

## 🔧 Configuration Quick Reference

### Gateway Frontend Environment Variables
```env
# Authentication
VITE_KEYCLOAK_URL=https://auth.yourdomain.com
VITE_KEYCLOAK_REALM=makrx
VITE_KEYCLOAK_CLIENT_ID=makrx-gateway

# Portal Integration
VITE_MAKRCAVE_URL=https://makrcave.yourdomain.com
VITE_STORE_URL=https://store.yourdomain.com
VITE_LEARN_URL=https://learn.yourdomain.com

# Company Information (MUST UPDATE FOR PRODUCTION)
VITE_COMPANY_NAME="Your Company Name"
VITE_COMPANY_CIN="YOUR_ACTUAL_CIN_NUMBER"
VITE_SUPPORT_EMAIL="support@yourdomain.com"
VITE_SUPPORT_PHONE="+91 XXXX XXXXXX"
```

### Key Files to Customize
- `components/Footer.tsx` - Company information and contact details
- `pages/PrivacyPolicy.tsx` - Data protection and privacy practices
- `pages/TermsOfService.tsx` - Legal terms and business model
- `public/sitemap.xml` - SEO sitemap with your domain
- `tailwind.config.ts` - Brand colors and design system

## 📋 Production Checklist

### Pre-Deployment Requirements
- [ ] All environment variables configured
- [ ] Company information updated (no placeholders)
- [ ] Legal policies customized for your business
- [ ] SSL certificate configured
- [ ] DNS records properly set up
- [ ] Analytics and monitoring configured

### Security Requirements
- [ ] HTTPS enforced with valid certificate
- [ ] Security headers implemented
- [ ] Content Security Policy configured
- [ ] Rate limiting enabled
- [ ] Firewall rules configured
- [ ] Regular security updates enabled

### Performance Requirements
- [ ] CDN configured for static assets
- [ ] Gzip compression enabled
- [ ] Cache headers properly set
- [ ] Bundle size optimized (<600KB warning threshold)
- [ ] Core Web Vitals targets met (90+ Lighthouse scores)

## 🔐 Security & Compliance

### Legal Compliance
The Gateway Frontend includes comprehensive legal compliance:

- **DPDP Act 2023**: Indian data protection compliance
- **Consumer Protection Act 2019**: E-commerce regulations
- **WCAG 2.1 AA**: Accessibility standards
- **GST Compliance**: Tax-related disclosures

### Security Features
- **HTTPS Enforcement**: TLS 1.2+ with HSTS
- **Security Headers**: X-Frame-Options, CSP, X-Content-Type-Options
- **Authentication**: Keycloak SSO with PKCE
- **Rate Limiting**: API and authentication endpoint protection
- **Input Validation**: XSS and injection protection

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Real User Monitoring**: Performance metrics collection
- **Error Tracking**: Sentry integration for error reporting
- **Uptime Monitoring**: Health checks and availability tracking

### Analytics Integration
- **Google Analytics 4**: User behavior and conversion tracking
- **Enhanced Ecommerce**: Transaction and product analytics
- **Custom Events**: Business-specific metrics
- **Privacy Compliant**: GDPR and DPDP Act compliance

## 🤝 Contributing

We welcome contributions to the MakrX ecosystem! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for:

- Code of conduct
- Development workflow
- Pull request process
- Testing requirements
- Documentation standards

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper tests
4. Update documentation as needed
5. Submit a pull request

## 📞 Support & Resources

### Documentation Resources
- **Technical Issues**: Create GitHub issue with reproduction steps
- **Deployment Help**: Contact DevOps team
- **Security Issues**: Email security@makrx.org
- **Feature Requests**: Submit GitHub issue with feature template

### Community Resources
- **Developer Community**: Join our Slack workspace
- **Documentation Updates**: Submit PR with improvements
- **Best Practices**: Share your implementation experiences

### Commercial Support
For commercial support, licensing, or enterprise features:
- **Email**: enterprise@makrx.org
- **Website**: https://makrx.org/enterprise
- **Documentation**: https://docs.makrx.org

## 📄 License

Copyright © 2024 Botness Technologies Pvt Ltd. All rights reserved.

For licensing information, see the LICENSE file in the repository root.

---

## Quick Navigation

| Category | Documents |
|----------|-----------|
| **Gateway Frontend** | [Docs](./GATEWAY_FRONTEND.md) • [Deployment](./GATEWAY_PRODUCTION_DEPLOYMENT.md) • [Setup](./GATEWAY_SERVER_SETUP.md) • [Config](./GATEWAY_CONFIGURATION.md) |
| **Development** | [Frontend](./FRONTEND.md) • [Backend](./BACKEND.md) • [API](./API.md) • [Architecture](./ARCHITECTURE.md) |
| **Operations** | [Deployment](./DEPLOYMENT.md) • [Security](./SECURITY.md) • [Directory](./DIRECTORY_STRUCTURE.md) |
| **Contributing** | [Guidelines](./CONTRIBUTING.md) • [Features](./FEATURE_TEMPLATE.md) • [Security](./SECURITY_DEPLOYMENT_CONTRIBUTION.md) |

**Need help?** Start with the [Gateway Frontend Documentation](./GATEWAY_FRONTEND.md) for the primary application, or [Complete Ecosystem Guide](./COMPLETE_ECOSYSTEM_GUIDE.md) for the full platform overview.
