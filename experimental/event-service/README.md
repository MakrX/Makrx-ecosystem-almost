# Event Service (Archived)

**NOT FOR PRODUCTION – no SLA**

## Purpose

Prototype FastAPI/WebSocket service for real-time event distribution between MakrX components.

## Rationale for archival

Replaced by a message broker–based architecture; preserved here solely for historical reference.

## Last known good run

```bash
cd experimental/event-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Archived: 2025-08-14  
OWNERS: @MakrX/maintainers
