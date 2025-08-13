# MakrX Deployment Guide

## 🎯 Overview

This guide covers deployment options for the MakrX ecosystem, from local development to production environments. The system is designed to be deployed using Docker containers with support for both single-server and distributed architectures.

## 🏗️ Deployment Architecture

### Development Environment
```
Local Machine:
├── Frontend Development Servers (Vite/Next.js)
├── Backend Services (FastAPI with hot reload)
├── PostgreSQL (Docker container)
├── Redis (Docker container)
├── Keycloak (Docker container)
└── MinIO (Docker container)
```

### Production Environment
```
Production Infrastructure:
├── Load Balancer (Nginx/Cloudflare)
├── Frontend Applications (Static files + CDN)
├── Backend Services (Containerized APIs)
├── Database Cluster (Managed PostgreSQL)
├── Cache Layer (Managed Redis)
├── Authentication (Keycloak cluster)
├── File Storage (S3/MinIO cluster)
└── Monitoring (Logs, metrics, alerts)
```

## 🚀 Quick Deployment

### Prerequisites
```bash
# Required tools
docker --version          # 20.10.0+
docker-compose --version  # 1.29.0+
git --version             # Any recent version

# For production
kubectl --version         # 1.20.0+ (optional)
helm --version            # 3.0+ (optional)
```

### Local Development Setup

#### 1. Clone and Configure
```bash
# Clone repository
git clone <repository-url>
cd makrx-ecosystem

# Setup environment
cp .env.production.template .env
# Edit .env with your configuration

# Generate secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For DATABASE_PASSWORD
```

#### 2. Start Infrastructure Services
```bash
# Start required services
docker-compose up -d postgres redis keycloak minio

# Wait for services to be ready (30-60 seconds)
docker-compose logs -f postgres  # Check logs

# Initialize database
docker-compose exec postgres psql -U makrx -c "CREATE DATABASE makrcave;"
docker-compose exec postgres psql -U makrx -c "CREATE DATABASE store;"
```

#### 3. Start Backend Services
```bash
# Start all backend services
cd makrcave-backend
poetry install
poetry run uvicorn main:app --reload --port 8000 &

cd ../makrx-store-backend
poetry install  
poetry run uvicorn app.main:app --reload --port 8001 &

cd ../backends/auth-service
poetry install
poetry run uvicorn main:app --reload --port 8002 &
```

#### 4. Start Frontend Applications
```bash
# Terminal 1: Gateway Frontend
cd frontend/gateway-frontend
npm install
npm run dev  # Runs on port 3000

# Terminal 2: MakrCave Frontend  
cd frontend/makrcave-frontend
npm install
npm run dev  # Runs on port 3001

# Terminal 3: Store Frontend
cd makrx-store-frontend
npm install
npm run dev  # Runs on port 3002
```

#### 5. Verify Installation
```bash
# Check all services
curl http://localhost:3000  # Gateway
curl http://localhost:3001  # MakrCave
curl http://localhost:3002  # Store
curl http://localhost:8000/health  # MakrCave API
curl http://localhost:8001/health  # Store API
curl http://localhost:8002/health  # Auth API
```

## 🐳 Docker Deployment

### Complete Docker Stack
```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Start complete stack
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Frontend Services
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - gateway-static:/usr/share/nginx/html/gateway
      - makrcave-static:/usr/share/nginx/html/makrcave
      - store-static:/usr/share/nginx/html/store
    depends_on:
      - makrcave-api
      - store-api
      - auth-service
    restart: unless-stopped

  # Backend Services
  makrcave-api:
    build:
      context: ./makrcave-backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://makrx:${DATABASE_PASSWORD}@postgres:5432/makrcave
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2

  store-api:
    build:
      context: ./makrx-store-backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://makrx:${DATABASE_PASSWORD}@postgres:5432/store
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2

  auth-service:
    build:
      context: ./backends/auth-service
      dockerfile: Dockerfile
    environment:
      - KEYCLOAK_URL=http://keycloak:8080
      - SECRET_KEY=${JWT_SECRET}
    depends_on:
      - keycloak
    restart: unless-stopped

  # Infrastructure Services
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=makrx
      - POSTGRES_USER=makrx
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-databases.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  keycloak:
    image: quay.io/keycloak/keycloak:22.0
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
      - KC_DB_USERNAME=makrx
      - KC_DB_PASSWORD=${DATABASE_PASSWORD}
    command: start-dev
    depends_on:
      - postgres
    volumes:
      - ./services/keycloak/themes:/opt/keycloak/themes
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    environment:
      - MINIO_ROOT_USER=${MINIO_ACCESS_KEY}
      - MINIO_ROOT_PASSWORD=${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
  gateway-static:
  makrcave-static:
  store-static:
```

## ☸️ Kubernetes Deployment

### Namespace Setup
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: makrx
  labels:
    name: makrx
```

### ConfigMap for Environment Variables
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: makrx-config
  namespace: makrx
data:
  POSTGRES_HOST: "postgres-service"
  POSTGRES_PORT: "5432"
  POSTGRES_DB: "makrx"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  KEYCLOAK_URL: "http://keycloak-service:8080"
  MINIO_ENDPOINT: "minio-service:9000"
```

### Secrets
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: makrx-secrets
  namespace: makrx
type: Opaque
data:
  database-password: <base64-encoded-password>
  jwt-secret: <base64-encoded-secret>
  stripe-secret-key: <base64-encoded-key>
  minio-access-key: <base64-encoded-key>
  minio-secret-key: <base64-encoded-key>
```

### PostgreSQL Deployment
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: makrx
spec:
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
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: "makrx"
        - name: POSTGRES_USER
          value: "makrx"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: makrx-secrets
              key: database-password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        ports:
        - containerPort: 5432
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: makrx
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

### Backend API Deployment
```yaml
# k8s/makrcave-api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: makrcave-api
  namespace: makrx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: makrcave-api
  template:
    metadata:
      labels:
        app: makrcave-api
    spec:
      containers:
      - name: makrcave-api
        image: makrx/makrcave-api:latest
        env:
        - name: DATABASE_URL
          value: "postgresql://makrx:$(DATABASE_PASSWORD)@postgres-service:5432/makrcave"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: makrx-secrets
              key: jwt-secret
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: makrx-secrets
              key: database-password
        ports:
        - containerPort: 8000
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: makrcave-api-service
  namespace: makrx
spec:
  selector:
    app: makrcave-api
  ports:
  - port: 8000
    targetPort: 8000
```

### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: makrx-ingress
  namespace: makrx
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - makrx.org
    - makrcave.com
    - makrx.store
    secretName: makrx-tls
  rules:
  - host: makrx.org
    http:
      paths:
      - path: /api/
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway-frontend-service
            port:
              number: 80
  - host: makrcave.com
    http:
      paths:
      - path: /api/
        pathType: Prefix
        backend:
          service:
            name: makrcave-api-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: makrcave-frontend-service
            port:
              number: 80
  - host: makrx.store
    http:
      paths:
      - path: /api/
        pathType: Prefix
        backend:
          service:
            name: store-api-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: store-frontend-service
            port:
              number: 80
```

### Deploy to Kubernetes
```bash
# Apply all configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/makrcave-api.yaml
kubectl apply -f k8s/store-api.yaml
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get pods -n makrx
kubectl get services -n makrx
kubectl get ingress -n makrx

# View logs
kubectl logs -f deployment/makrcave-api -n makrx
```

## 🌐 Cloud Provider Deployment

### AWS Deployment

#### ECS with Fargate
```yaml
# aws/ecs-task-definition.json
{
  "family": "makrcave-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "makrcave-api",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/makrcave-api:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://makrx:password@rds-endpoint:5432/makrcave"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/makrcave-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### RDS Database Setup
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier makrx-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --allocated-storage 20 \
  --master-username makrx \
  --master-user-password ${DATABASE_PASSWORD} \
  --vpc-security-group-ids sg-12345678 \
  --db-subnet-group-name makrx-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted

# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id makrx-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### Google Cloud Platform

#### Cloud Run Deployment
```yaml
# gcp/cloud-run-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: makrcave-api
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cloudsql-instances: PROJECT:REGION:makrx-postgres
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 100
      containers:
      - image: gcr.io/PROJECT/makrcave-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "postgresql://makrx:password@/makrcave?host=/cloudsql/PROJECT:REGION:makrx-postgres"
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
```

#### Deploy to Cloud Run
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT/makrcave-api .

# Deploy service
gcloud run deploy makrcave-api \
  --image gcr.io/PROJECT/makrcave-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT:REGION:makrx-postgres \
  --set-env-vars DATABASE_URL="postgresql://..." \
  --memory 512Mi \
  --cpu 1
```

## 🔧 Environment Configuration

### Environment Variables
```bash
# .env.production
# Database
DATABASE_URL=postgresql://makrx:password@localhost:5432/makrx
POSTGRES_DB=makrx
POSTGRES_USER=makrx
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_ADMIN_PASSWORD=admin_password

# External Services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=makrx-files

# Frontend URLs
GATEWAY_URL=https://makrx.org
MAKRCAVE_URL=https://makrcave.com
STORE_URL=https://makrx.store

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=MakrX API
CORS_ORIGINS=["https://makrx.org","https://makrcave.com","https://makrx.store"]

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=INFO
```

### Production Security
```bash
# Generate secure secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # DATABASE_PASSWORD
openssl rand -base64 32  # MINIO_SECRET_KEY

# SSL Certificate (Let's Encrypt)
certbot --nginx -d makrx.org -d makrcave.com -d makrx.store

# Database backup
pg_dump -h localhost -U makrx makrx > backup.sql

# Restore database
psql -h localhost -U makrx makrx < backup.sql
```

## 📊 Monitoring and Logging

### Health Checks
```python
# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": await check_database_connection(),
        "redis": await check_redis_connection()
    }
```

### Nginx Configuration
```nginx
# nginx/nginx.conf
upstream makrcave_api {
    server makrcave-api:8000;
}

upstream store_api {
    server store-api:8000;
}

server {
    listen 80;
    server_name makrcave.com;
    
    location /api/ {
        proxy_pass http://makrcave_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        root /usr/share/nginx/html/makrcave;
        try_files $uri $uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Docker Healthchecks
```dockerfile
# Add to Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd makrcave-backend
        pip install poetry
        poetry install
    
    - name: Run tests
      run: |
        cd makrcave-backend
        poetry run pytest

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: |
        docker build -t makrx/makrcave-api:${{ github.sha }} ./makrcave-backend
        docker build -t makrx/store-api:${{ github.sha }} ./makrx-store-backend
    
    - name: Deploy to production
      run: |
        # Deploy logic here
        echo "Deploying to production..."
```

## 🔒 Security Considerations

### SSL/TLS Configuration
```nginx
# SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;

# Security headers
add_header Strict-Transport-Security "max-age=63072000" always;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### Database Security
```sql
-- Create limited user for application
CREATE USER makrx_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE makrx TO makrx_app;
GRANT USAGE ON SCHEMA public TO makrx_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO makrx_app;

-- Enable row level security
ALTER TABLE sensitive_table ENABLE ROW LEVEL SECURITY;
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
docker-compose exec postgres psql -U makrx -c "SELECT 1;"

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down
docker volume rm makrx_postgres_data
docker-compose up -d postgres
```

#### Frontend Build Issues
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run typecheck

# Build with verbose output
npm run build -- --verbose
```

#### API Issues
```bash
# Check API health
curl http://localhost:8000/health

# Check API logs
docker-compose logs makrcave-api

# Debug with Python
poetry run python -c "import requests; print(requests.get('http://localhost:8000/health').json())"
```

### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# Check database performance
docker-compose exec postgres psql -U makrx -c "SELECT * FROM pg_stat_activity;"

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/api/v1/health
```

---

This deployment guide provides comprehensive coverage of deployment scenarios from local development to production cloud environments. Choose the deployment method that best fits your infrastructure requirements and operational expertise.
