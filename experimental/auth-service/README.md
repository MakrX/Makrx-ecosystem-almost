# Auth Service (Archived)

⚠️ **NO SUPPORT – NO SLA – NOT FOR PRODUCTION** ⚠️

## Purpose

FastAPI microservice for centralized authentication and user profile management across the MakrX ecosystem.

## Rationale for archival

Superseded by the consolidated gateway and Keycloak-based SSO; retained only for reference and experimentation.

## Last known good run

```bash
cd experimental/auth-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export KEYCLOAK_CLIENT_SECRET=your_client_secret
export JWT_SECRET=dev_secret
uvicorn main:app --reload
```

Archived: 2025-08-14  
OWNERS: @MakrX/maintainers
