# MakrX Ecosystem Documentation (Final Sections)

## 11. Security & Compliance

### Authentication Flow (Keycloak + JWT)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant K as Keycloak
    participant B as Backend
    participant D as Database
    
    U->>F: Access protected resource
    F->>K: Redirect to login
    K->>U: Show login form
    U->>K: Submit credentials
    K->>K: Validate credentials
    K->>F: Return authorization code
    F->>K: Exchange code for tokens
    K->>F: Return JWT access & refresh tokens
    F->>B: API request with JWT
    B->>B: Validate JWT signature
    B->>B: Check token expiration
    B->>D: Query user permissions
    D->>B: Return user data
    B->>F: Return authorized response
```

**Token Lifecycle**:
1. **Access Token**: 15-minute expiry, contains user roles and permissions
2. **Refresh Token**: 24-hour expiry, used to obtain new access tokens
3. **ID Token**: Contains user profile information
4. **Token Refresh**: Automatic refresh 5 minutes before expiry

### Authorization Model (RBAC + Makerspace Scope)

#### Role-Based Access Control (RBAC)

**Global Roles** (apply across entire ecosystem):
- `super_admin` - Full system access
- `admin` - Domain-specific administration
- `user` - Authenticated user access

**Domain-Specific Roles**:
- `makerspace_admin` - Full makerspace control
- `service_provider` - Provider-specific access
- `member` - Makerspace member access
- `store_customer` - E-commerce access

#### Permission System

```typescript
interface Permission {
  resource: string;        // e.g., "equipment", "orders", "users"
  action: string;          // e.g., "read", "write", "delete", "admin"
  scope?: string;          // e.g., "makerspace:uuid", "own", "global"
  conditions?: object;     // Additional conditions
}

// Example permissions
{
  resource: "equipment",
  action: "reserve",
  scope: "makerspace:550e8400-e29b-41d4-a716-446655440000"
}

{
  resource: "orders",
  action: "read",
  scope: "own"  // User can only read their own orders
}
```

#### Makerspace Scope Isolation

```sql
-- Example: Get equipment user can access
SELECT e.* FROM makrcave.equipment e
JOIN makrcave.makerspace_members mm ON e.makerspace_id = mm.makerspace_id
WHERE mm.user_id = $user_id 
  AND mm.status = 'active'
  AND e.status = 'available';
```

**Scope Enforcement**:
- Database queries filtered by user's makerspace memberships
- API endpoints validate makerspace access before operations
- Frontend components hide inaccessible resources
- Audit logs track all access attempts

### Data Protection (Hashed Passwords, Encrypted Secrets)

#### Password Security
- **Keycloak Managed**: Passwords stored and managed by Keycloak
- **Hashing Algorithm**: bcrypt with 12 rounds (minimum)
- **Password Policy**: 
  - Minimum 8 characters
  - Mix of upper/lower case, numbers, symbols
  - No common passwords or personal information
  - History: Cannot reuse last 5 passwords

#### Secret Management
```python
# Environment secrets encryption
from cryptography.fernet import Fernet

class SecretManager:
    def __init__(self, encryption_key: str):
        self.cipher = Fernet(encryption_key.encode())
    
    def encrypt_secret(self, value: str) -> str:
        return self.cipher.encrypt(value.encode()).decode()
    
    def decrypt_secret(self, encrypted_value: str) -> str:
        return self.cipher.decrypt(encrypted_value.encode()).decode()
```

**Encrypted Data Categories**:
- API keys and webhook secrets
- Payment processor credentials
- Third-party service tokens
- Database connection strings
- File storage access keys

#### Personal Data Protection (DPDP Act 2023 Compliance)

**Data Classification**:
- **Public**: Names, public project descriptions
- **Personal**: Email addresses, profile information
- **Sensitive**: Payment information, private communications
- **Critical**: Authentication credentials, financial data

**Data Processing Rights**:
```python
class DataRightsManager:
    async def export_user_data(self, user_id: str) -> dict:
        """Export all user data for portability"""
        return {
            "profile": await self.get_profile_data(user_id),
            "projects": await self.get_project_data(user_id),
            "orders": await self.get_order_data(user_id),
            "activity": await self.get_activity_data(user_id)
        }
    
    async def anonymize_user_data(self, user_id: str) -> bool:
        """Anonymize user data while preserving analytics"""
        # Replace PII with anonymized values
        # Maintain referential integrity
        # Update audit logs
        pass
    
    async def delete_user_data(self, user_id: str) -> bool:
        """Complete data deletion (right to be forgotten)"""
        # Hard delete personal data
        # Anonymize historical records
        # Update related records
        pass
```

### Audit Logs

#### Comprehensive Logging Strategy

**Logged Events**:
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  user_id?: string;
  session_id: string;
  ip_address: string;
  user_agent: string;
  action: string;           // "login", "create_project", "delete_equipment"
  resource_type: string;    // "user", "project", "equipment", "order"
  resource_id?: string;
  details: object;          // Action-specific details
  outcome: "success" | "failure" | "error";
  risk_level: "low" | "medium" | "high" | "critical";
}
```

**Critical Events** (always logged):
- Authentication attempts (success/failure)
- Administrative actions (user role changes, system settings)
- Data access (sensitive data views, exports)
- Financial transactions (orders, payments, refunds)
- Security events (failed access attempts, permission violations)

**Log Retention Policy**:
- Critical security events: 7 years
- Financial transactions: 5 years (compliance requirement)
- User activity: 2 years
- System events: 1 year
- Debug logs: 30 days

### API Rate Limiting

#### Rate Limiting Strategy

```python
from typing import Dict
import redis
import time

class RateLimiter:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.limits = {
            "anonymous": {"requests": 100, "window": 3600},      # 100/hour
            "authenticated": {"requests": 1000, "window": 3600}, # 1000/hour
            "premium": {"requests": 5000, "window": 3600},       # 5000/hour
            "admin": {"requests": 10000, "window": 3600}         # 10000/hour
        }
    
    async def check_rate_limit(self, identifier: str, user_type: str) -> bool:
        limit_config = self.limits.get(user_type, self.limits["anonymous"])
        
        # Sliding window counter
        now = int(time.time())
        window_start = now - limit_config["window"]
        
        # Remove old requests
        await self.redis.zremrangebyscore(
            f"rate_limit:{identifier}", 0, window_start
        )
        
        # Count requests in current window
        current_count = await self.redis.zcard(f"rate_limit:{identifier}")
        
        if current_count >= limit_config["requests"]:
            return False
        
        # Add current request
        await self.redis.zadd(f"rate_limit:{identifier}", {now: now})
        await self.redis.expire(f"rate_limit:{identifier}", limit_config["window"])
        
        return True
```

**Rate Limiting Rules**:
- **Per IP**: 100 requests/hour for anonymous users
- **Per User**: 1000 requests/hour for authenticated users
- **Per Endpoint**: Special limits for expensive operations
  - File uploads: 10/hour per user
  - Quote generation: 50/hour per user
  - Bulk operations: 5/hour per user

### File Security (STL Storage & Access Control)

#### Upload Security Pipeline

```mermaid
graph TD
    A[File Upload Request] --> B[Validate File Type]
    B --> C{Valid Type?}
    C -->|No| D[Reject Upload]
    C -->|Yes| E[Check File Size]
    E --> F{Size OK?}
    F -->|No| D
    F -->|Yes| G[Virus Scan]
    G --> H{Clean?}
    H -->|No| I[Quarantine & Alert]
    H -->|Yes| J[3D File Analysis]
    J --> K[Generate Secure Filename]
    K --> L[Store in Encrypted Bucket]
    L --> M[Create Database Record]
    M --> N[Return Upload Success]
```

**File Validation Rules**:
```python
ALLOWED_FILE_TYPES = {
    '.stl': 'application/vnd.ms-pki.stl',
    '.obj': 'application/x-wavefront-obj',
    '.3mf': 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
    '.step': 'application/step',
    '.iges': 'application/iges'
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MIN_FILE_SIZE = 1024              # 1KB

async def validate_3d_file(file_content: bytes, filename: str) -> bool:
    # Check file extension
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_FILE_TYPES:
        return False
    
    # Verify file signature/magic bytes
    if not verify_file_signature(file_content, ext):
        return False
    
    # 3D file specific validation
    if ext == '.stl':
        return validate_stl_format(file_content)
    elif ext == '.obj':
        return validate_obj_format(file_content)
    
    return True
```

**Access Control for Files**:
- **Pre-signed URLs**: Temporary access (15-minute expiry)
- **User Authorization**: Only file owner and authorized providers can access
- **Audit Trail**: All file access logged with user and timestamp
- **Encryption at Rest**: Files encrypted with AES-256
- **Secure Deletion**: Files securely wiped after retention period

---

## 12. Deployment Guide

### Local Development (docker-compose up)

#### Prerequisites
- Docker Engine 24.0+
- Docker Compose 2.20+
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

#### Quick Start
```bash
# Clone repository
git clone https://github.com/makrx/ecosystem.git
cd ecosystem

# Copy environment template
cp .env.production.template .env

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Service URLs (Development)
- **MakrX.org**: http://localhost:3000
- **MakrCave.com**: http://localhost:3001  
- **MakrX.Store**: http://localhost:3003
- **Keycloak Admin**: http://localhost:8080/admin
- **API Documentation**: 
  - Auth Service: http://localhost:8001/docs
  - MakrCave Backend: http://localhost:8002/docs
  - Store Backend: http://localhost:8003/docs

#### Development Workflow
```bash
# Start infrastructure only
docker-compose up -d postgres keycloak redis minio

# Run frontend locally (with hot reload)
cd frontend/makrcave-frontend
npm install
npm run dev

# Run backend locally (with auto-reload)
cd makrcave-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

### Production Deployment (VPS/K8s)

#### VPS Deployment with Docker

**Server Requirements**:
- 4+ CPU cores
- 16GB+ RAM
- 100GB+ SSD storage
- Ubuntu 22.04 LTS or similar

**Production Setup**:
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt install docker-compose-plugin

# Clone and configure
git clone https://github.com/makrx/ecosystem.git
cd ecosystem

# Configure production environment
cp .env.production.template .env.production
nano .env.production  # Edit with production values

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d makrx.org -d makrcave.com -d makrx.store
```

**Production Environment Variables**:
```bash
# Database
DATABASE_URL=postgresql://makrx:SECURE_PASSWORD@localhost:5432/makrx_prod

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=SECURE_ADMIN_PASSWORD
KC_DB_PASSWORD=SECURE_DB_PASSWORD

# Secrets
JWT_SECRET_KEY=RANDOM_64_CHAR_SECRET
ENCRYPTION_KEY=RANDOM_32_CHAR_KEY

# External Services
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...

# Domains (production URLs)
NEXT_PUBLIC_GATEWAY_URL=https://makrx.org
NEXT_PUBLIC_MAKRCAVE_URL=https://makrcave.com
NEXT_PUBLIC_STORE_URL=https://makrx.store
```

#### Kubernetes Deployment

**Cluster Requirements**:
- Kubernetes 1.28+
- 3+ nodes with 8GB RAM each
- Persistent volume support
- Ingress controller (nginx-ingress recommended)

**Deployment Manifests**:
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: makrx-ecosystem

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: makrx-config
  namespace: makrx-ecosystem
data:
  POSTGRES_DB: makrx
  KEYCLOAK_REALM: makrx
  ENVIRONMENT: production

---
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: makrx-ecosystem
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: makrx-config
              key: POSTGRES_DB
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: makrx-secrets
              key: postgres-user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: makrx-secrets
              key: postgres-password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi
```

**Deployment Commands**:
```bash
# Create namespace and secrets
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic makrx-secrets \
  --from-literal=postgres-user=makrx \
  --from-literal=postgres-password=SECURE_PASSWORD \
  --from-literal=jwt-secret=SECURE_JWT_SECRET \
  -n makrx-ecosystem

# Deploy infrastructure
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/keycloak.yaml
kubectl apply -f k8s/redis.yaml

# Deploy applications
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/makrcave-backend.yaml
kubectl apply -f k8s/store-backend.yaml
kubectl apply -f k8s/frontends.yaml

# Setup ingress
kubectl apply -f k8s/ingress.yaml
```

### Secrets Management

#### Development Secrets
```bash
# .env file for local development
DATABASE_URL=postgresql://makrx:makrx-dev@localhost:5432/makrx
JWT_SECRET_KEY=dev-secret-key-not-for-production
KEYCLOAK_CLIENT_SECRET=dev-client-secret
```

#### Production Secrets Management

**Docker Secrets** (Docker Swarm):
```bash
# Create secrets
echo "production-jwt-secret" | docker secret create jwt_secret -
echo "production-db-password" | docker secret create db_password -

# Reference in compose file
version: '3.8'
services:
  auth-service:
    image: makrx/auth-service:latest
    secrets:
      - jwt_secret
      - db_password
    environment:
      JWT_SECRET_KEY_FILE: /run/secrets/jwt_secret
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
```

**Kubernetes Secrets**:
```bash
# Create secrets from files
kubectl create secret generic makrx-secrets \
  --from-file=jwt-secret=./secrets/jwt-secret.txt \
  --from-file=db-password=./secrets/db-password.txt \
  --from-file=stripe-key=./secrets/stripe-key.txt \
  -n makrx-ecosystem

# Or from environment
kubectl create secret generic makrx-secrets \
  --from-literal=jwt-secret="$(openssl rand -base64 32)" \
  --from-literal=db-password="$(openssl rand -base64 24)" \
  -n makrx-ecosystem
```

### Backup & Restore Procedures

#### Database Backup Strategy

**Automated Backups**:
```bash
#!/bin/bash
# backup-database.sh

# Configuration
DB_HOST="localhost"
DB_NAME="makrx"
DB_USER="makrx"
BACKUP_DIR="/backups/postgres"
RETENTION_DAYS=30

# Create backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/makrx_backup_${TIMESTAMP}.sql"

# Perform backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --verbose --no-owner --no-privileges \
  --file=$BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3 (optional)
aws s3 cp ${BACKUP_FILE}.gz s3://makrx-backups/postgres/

# Clean old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

**Scheduled Backups** (crontab):
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-database.sh

# Weekly full backup at Sunday 1 AM  
0 1 * * 0 /usr/local/bin/backup-database-full.sh
```

#### File Storage Backup

**MinIO/S3 Backup**:
```bash
#!/bin/bash
# backup-files.sh

# Sync to backup bucket
aws s3 sync s3://makrx-uploads s3://makrx-backups/uploads \
  --storage-class GLACIER \
  --exclude "temp/*" \
  --delete

# Verify backup integrity
aws s3api head-object --bucket makrx-backups --key uploads/
```

#### Disaster Recovery Procedure

**Complete System Restore**:
```bash
# 1. Restore database
psql -h localhost -U makrx -d makrx < backup_20231201_020000.sql

# 2. Restore file storage
aws s3 sync s3://makrx-backups/uploads s3://makrx-uploads

# 3. Restart services
docker-compose down
docker-compose up -d

# 4. Verify service health
curl -f http://localhost:8001/health
curl -f http://localhost:8002/health  
curl -f http://localhost:8003/health
```

**Recovery Time Objectives (RTO)**:
- Database restore: < 1 hour
- File storage restore: < 4 hours
- Complete system restore: < 6 hours
- Service availability: 99.9% uptime target

**Recovery Point Objectives (RPO)**:
- Database: < 24 hours (daily backups)
- Critical data: < 1 hour (real-time replication)
- File storage: < 24 hours (daily sync)

---

## 13. Contribution Guidelines

### Branch Naming

**Branch Naming Convention**:
```
<type>/<scope>/<description>

Types:
- feature/    # New functionality
- bugfix/     # Bug fixes
- hotfix/     # Critical production fixes
- docs/       # Documentation updates
- refactor/   # Code restructuring
- test/       # Test additions/updates
- chore/      # Maintenance tasks

Scopes:
- auth        # Authentication system
- store       # E-commerce functionality
- cave        # Makerspace management
- gateway     # Landing and navigation
- shared      # Shared components/utilities
- infra       # Infrastructure/deployment
- security    # Security-related changes

Examples:
feature/store/add-3d-printing-service
bugfix/auth/fix-token-refresh
hotfix/store/payment-gateway-error
docs/cave/equipment-reservation-guide
refactor/shared/theme-system
```

### Commit Style

**Conventional Commits Format**:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

Types:
- feat:     # New feature
- fix:      # Bug fix
- docs:     # Documentation
- style:    # Formatting, no code change
- refactor: # Code restructuring
- test:     # Adding tests
- chore:    # Maintenance

Examples:
feat(store): add STL file upload validation
fix(auth): resolve token refresh infinite loop
docs(cave): update equipment reservation API
style(shared): format theme provider code
refactor(store): extract payment processing logic
test(auth): add unit tests for JWT validation
chore(infra): update Docker base images
```

**Commit Message Examples**:
```bash
# Good commits
git commit -m "feat(store): implement quote comparison for 3D printing

- Add quote comparison table component
- Support multiple material options
- Include delivery time estimates
- Add price breakdown visualization

Closes #234"

git commit -m "fix(auth): prevent memory leak in token refresh

The token refresh timer wasn't being cleared when component unmounted,
causing memory leaks in single-page applications.

Fixes #456"

# Bad commits (avoid these)
git commit -m "update stuff"
git commit -m "fixed bug"
git commit -m "WIP"
```

### Pull Request Rules

#### PR Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if frontend)

## Feature Flags
- [ ] No feature flags needed
- [ ] New feature flag added: `FEATURE_NAME`
- [ ] Existing feature flag updated: `FEATURE_NAME`
- [ ] Feature flag removal (feature fully rolled out)

## Security Checklist
- [ ] No sensitive data exposed in logs
- [ ] Input validation implemented
- [ ] Authorization checks in place
- [ ] SQL injection prevention verified
- [ ] XSS prevention measures applied

## Deployment Notes
- [ ] No special deployment steps needed
- [ ] Database migration required
- [ ] Environment variables added/changed
- [ ] External service configuration needed

## Screenshots (if applicable)
Include before/after screenshots for UI changes.

## Related Issues
Fixes #123
Relates to #456
```

#### PR Approval Requirements
- **Minimum Reviews**: 2 approvals for production code
- **Required Reviewers**: 
  - Code owner for modified domain
  - Security team for security-related changes
  - DevOps team for infrastructure changes
- **Automated Checks**: All CI/CD checks must pass
- **Testing**: Comprehensive test coverage required

#### PR Size Guidelines
- **Small PR**: < 200 lines changed (preferred)
- **Medium PR**: 200-500 lines changed (acceptable)
- **Large PR**: > 500 lines changed (requires justification)

**Breaking Down Large PRs**:
```bash
# Example: Large feature broken into smaller PRs
1. feat(store): add database models for 3D printing services
2. feat(store): implement quote generation API endpoints  
3. feat(store): add frontend quote request form
4. feat(store): integrate quote display and comparison
5. feat(store): add order processing for 3D printing services
```

### Code Review Process

#### Review Checklist

**Functionality**:
- [ ] Code meets requirements and specifications
- [ ] Edge cases and error conditions handled
- [ ] Performance implications considered
- [ ] No obvious bugs or logical errors

**Code Quality**:
- [ ] Code is readable and well-structured
- [ ] Naming conventions followed
- [ ] No code duplication
- [ ] Appropriate abstractions used
- [ ] Comments explain "why" not "what"

**Security**:
- [ ] Input validation and sanitization
- [ ] Proper authentication/authorization
- [ ] No hardcoded secrets or credentials
- [ ] SQL injection prevention
- [ ] XSS prevention measures

**Testing**:
- [ ] Adequate test coverage (>80%)
- [ ] Tests are meaningful and comprehensive
- [ ] No flaky or unreliable tests
- [ ] Test names clearly describe scenarios

**Documentation**:
- [ ] API changes documented
- [ ] README updated if needed
- [ ] Code comments for complex logic
- [ ] Migration guides for breaking changes

#### Review Process Flow
```mermaid
graph TD
    A[Create PR] --> B[Automated CI/CD Checks]
    B --> C{All Checks Pass?}
    C -->|No| D[Fix Issues & Update PR]
    C -->|Yes| E[Request Reviews]
    D --> B
    E --> F[Code Review]
    F --> G{Reviews Approved?}
    G -->|No| H[Address Review Comments]
    G -->|Yes| I[Final Security Check]
    H --> F
    I --> J{Security Approved?}
    J -->|No| K[Fix Security Issues]
    J -->|Yes| L[Merge to Main]
    K --> F
```

### Feature Flag Usage When Committing New Features

#### When to Use Feature Flags

**Always Use Flags For**:
- New user-facing features
- Experimental functionality
- Performance optimizations
- Third-party integrations
- Database schema changes

**Optional for**:
- Bug fixes (unless high-risk)
- Internal tooling improvements
- Documentation updates
- Test code changes

#### Feature Flag Implementation

**Adding a New Feature Flag**:
```typescript
// 1. Define flag in feature-flags package
export const NEW_FEATURE_FLAGS = {
  ADVANCED_SEARCH: {
    name: 'ADVANCED_SEARCH',
    enabled: false,
    environments: ['development'],
    description: 'Enable advanced search functionality with filters'
  }
};

// 2. Use flag in component
import { useFeatureFlags } from '@makrx/feature-flags';

function SearchComponent() {
  const { isEnabled } = useFeatureFlags();
  
  return (
    <div>
      {isEnabled('ADVANCED_SEARCH') ? (
        <AdvancedSearchForm />
      ) : (
        <BasicSearchForm />
      )}
    </div>
  );
}

// 3. Backend feature flag check
from app.core.feature_flags import is_feature_enabled

@router.get("/search/advanced")
async def advanced_search(query: str):
    if not is_feature_enabled("ADVANCED_SEARCH"):
        raise HTTPException(403, "Feature not available")
    
    return await perform_advanced_search(query)
```

**Feature Flag Lifecycle**:
```mermaid
graph LR
    A[Development] --> B[Staging]
    B --> C[Limited Production]
    C --> D[Full Rollout]
    D --> E[Flag Removal]
    
    A -->|0% users| A
    B -->|Internal users| B
    C -->|5-25% users| C
    D -->|100% users| D
    E -->|Code cleanup| E
```

**Flag Rollout Strategy**:
1. **Development**: Flag enabled for testing
2. **Staging**: Flag enabled for QA validation
3. **Production Pilot**: 5% of users (or specific user groups)
4. **Gradual Rollout**: Increase to 25%, 50%, 75%
5. **Full Rollout**: 100% of users
6. **Flag Removal**: Remove flag code after 2 weeks of stable operation

#### Commit Guidelines for Feature Flags

**Include in Commit Message**:
```bash
feat(store): add advanced product search functionality

- Implement multi-faceted search with filters
- Add search suggestions and autocomplete
- Support price range and category filtering
- Feature controlled by ADVANCED_SEARCH flag

Flag: ADVANCED_SEARCH (disabled by default)
Testing: Enable flag in development for testing
Rollout: Gradual rollout planned over 2 weeks

Closes #789
```

**Flag Documentation Requirements**:
- Flag purpose and expected behavior
- Rollout timeline and strategy
- Rollback plan if issues occur
- Success metrics and monitoring
- Dependencies on other features/services

---

## 14. Appendix

### Glossary (Maker-Specific Terms)

**BOM (Bill of Materials)**: A comprehensive list of components, parts, materials, and tools required to complete a project. In MakrX, BOMs can be automatically converted to Store orders.

**Cave**: Short for MakrCave - refers to the makerspace management platform where makers collaborate, manage projects, and access equipment.

**Equipment Access Control**: A system that restricts equipment usage based on user skills, certifications, and safety training. Ensures only qualified members can operate specific tools.

**Fabrication Services**: Professional manufacturing services offered through MakrX.Store, including 3D printing, CNC machining, laser cutting, and PCB production.

**Job Routing**: The automated process of directing fabrication orders from MakrX.Store to appropriate service providers in the MakrCave network based on capabilities, capacity, and location.

**Maker**: An individual who creates, builds, invents, or modifies physical objects, often using digital fabrication tools and traditional manufacturing techniques.

**Makerspace**: A collaborative workspace where makers can access tools, equipment, and community resources to work on projects. Can be physical locations or virtual communities.

**Provider**: A service provider (individual or organization) that offers fabrication services through the MakrX ecosystem. Usually operates within or partners with makerspaces.

**Quick Reorder**: Feature allowing MakrCave users to instantly order materials from their project BOMs through MakrX.Store integration.

**Service Order**: A work order for fabrication services, containing specifications, timeline, and requirements for manufacturing a part or product.

**Skill Gate**: A requirement system that prevents access to equipment or features until users demonstrate necessary skills or complete required training.

**STL Upload**: The process of uploading 3D model files (typically STL format) to receive manufacturing quotes and place fabrication orders.

### API Reference Quick Access

#### Authentication Endpoints
```
POST /auth/login
POST /auth/refresh  
POST /auth/logout
GET  /auth/me
```

#### MakrCave API (Port 8002)
```
# Makerspaces
GET    /makerspaces
POST   /makerspaces
GET    /makerspaces/{id}
PUT    /makerspaces/{id}

# Members
GET    /makerspaces/{id}/members
POST   /makerspaces/{id}/invites
DELETE /makerspaces/{id}/members/{user_id}

# Equipment
GET    /makerspaces/{id}/equipment
POST   /equipment
GET    /equipment/{id}
PUT    /equipment/{id}
DELETE /equipment/{id}

# Reservations
GET    /reservations
POST   /reservations
GET    /reservations/{id}
PUT    /reservations/{id}
DELETE /reservations/{id}

# Projects
GET    /projects
POST   /projects
GET    /projects/{id}
PUT    /projects/{id}
DELETE /projects/{id}
```

#### Store API (Port 8003)
```
# Catalog
GET    /catalog/products
GET    /catalog/products/{id}
GET    /catalog/categories
GET    /catalog/search

# Cart
GET    /cart
POST   /cart/items
PUT    /cart/items/{id}
DELETE /cart/items/{id}

# Orders
GET    /orders
POST   /orders/checkout
GET    /orders/{id}
PUT    /orders/{id}

# File Upload
POST   /uploads/sign
POST   /uploads/complete
GET    /uploads/{id}

# Quotes
POST   /quotes
GET    /quotes/{id}
POST   /quotes/{id}/accept
```

### Test User Accounts

#### Development Environment Users

**Super Admin**:
- Email: `admin@makrx.dev`
- Password: `MakrX2024!`
- Access: All domains, all features
- Makerspaces: All makerspaces

**Makerspace Admin**:
- Email: `admin@techshop.dev`
- Password: `TechShop2024!`
- Access: MakrCave admin for TechShop makerspace
- Makerspaces: TechShop (admin)

**Service Provider**:
- Email: `provider@fabricorp.dev`  
- Password: `Fabricorp2024!`
- Access: Store service provider dashboard
- Services: 3D printing, CNC machining

**Member**:
- Email: `member@makrx.dev`
- Password: `Member2024!`
- Access: Standard member access
- Makerspaces: TechShop (member), Community Workshop (member)

**Store Customer**:
- Email: `customer@makrx.dev`
- Password: `Customer2024!`
- Access: Store browsing and purchasing
- Makerspaces: None

#### Test Data

**Sample Makerspaces**:
- **TechShop San Francisco**: Full-featured makerspace with all equipment types
- **Community Workshop**: Basic makerspace for testing member features
- **Fabricorp Services**: Service provider makerspace for testing job routing

**Sample Products**:
- **PLA Filament**: Basic 3D printing material ($25.99)
- **Arduino Uno R4**: Electronics prototyping board ($35.00)
- **Custom 3D Print**: Service product for STL uploads (variable pricing)
- **CNC Machining Service**: Custom machining service (quote-based)

**Sample Projects**:
- **Phone Stand**: Simple 3D printing project with BOM
- **LED Matrix Display**: Electronics project requiring multiple components
- **Custom Enclosure**: Multi-process project requiring 3D printing and machining

### Development Quick Reference

#### Starting Local Development
```bash
# Full stack
docker-compose up -d

# Frontend only (with backend services)
docker-compose up -d postgres keycloak redis auth-service makrcave-backend store-backend
cd frontend/makrcave-frontend && npm run dev

# Backend only (with database)
docker-compose up -d postgres keycloak redis
cd makrcave-backend && uvicorn app.main:app --reload --port 8002
```

#### Common Development Tasks
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
# Run migrations

# View logs
docker-compose logs -f [service-name]

# Access database
docker-compose exec postgres psql -U makrx -d makrx

# Access Redis
docker-compose exec redis redis-cli

# Build and test
npm run build
npm run test
npm run lint
```

#### Environment Variables Quick Reference
```bash
# Development URLs
VITE_GATEWAY_URL=http://localhost:3000
VITE_MAKRCAVE_URL=http://localhost:3001
VITE_STORE_URL=http://localhost:3003

# API Endpoints
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_MAKRCAVE_API_URL=http://localhost:8002
VITE_STORE_API_URL=http://localhost:8003

# Keycloak
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=makrx
```

---

**Documentation Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Authors**: MakrX Development Team  

For questions or contributions to this documentation, please create an issue in the main repository or contact the development team.

**Dream. Make. Share.**
