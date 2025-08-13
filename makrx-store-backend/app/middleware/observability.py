"""
Observability Middleware - Request ID, Audit Logs, Metrics
Exact implementation as specified in architecture
"""
import time
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import uuid

# Configure JSON logging as specified
logging.basicConfig(
    format='%(message)s',  # Pure JSON, no extra formatting
    level=logging.INFO
)

logger = logging.getLogger(__name__)

# ==========================================
# 5) Observability handshakes
# Request-ID header propagated across services; logged in JSON
# ==========================================

class ObservabilityMiddleware(BaseHTTPMiddleware):
    """
    Request-ID propagation and structured logging
    Implements exact observability requirements
    """
    
    async def dispatch(self, request: Request, call_next):
        # Generate or extract request ID
        request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timing
        start_time = time.time()
        
        # Log request start
        self._log_request_start(request, request_id)
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Add request ID to response headers for client tracking
            response.headers['X-Request-ID'] = request_id
            response.headers['X-Process-Time'] = f"{process_time:.4f}"
            
            # Log successful request
            self._log_request_success(request, response, request_id, process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log error with structured format
            self._log_request_error(request, e, request_id, process_time)
            
            # Re-raise for FastAPI error handlers
            raise e
    
    def _log_request_start(self, request: Request, request_id: str):
        """Log request start with structured JSON"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": "INFO",
            "event": "request_start",
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "headers": {
                "user-agent": request.headers.get("user-agent"),
                "authorization": "Bearer ***" if request.headers.get("authorization") else None,
                "content-type": request.headers.get("content-type"),
                "x-forwarded-for": request.headers.get("x-forwarded-for"),
            },
            "client_ip": self._get_client_ip(request)
        }
        
        logger.info(json.dumps(log_data))
    
    def _log_request_success(self, request: Request, response: Response, request_id: str, process_time: float):
        """Log successful request completion"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": "INFO", 
            "event": "request_complete",
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time_seconds": round(process_time, 4),
            "response_size": response.headers.get("content-length"),
        }
        
        logger.info(json.dumps(log_data))
    
    def _log_request_error(self, request: Request, error: Exception, request_id: str, process_time: float):
        """Log request errors with structured format"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": "ERROR",
            "event": "request_error", 
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "error_type": type(error).__name__,
            "error_message": str(error),
            "process_time_seconds": round(process_time, 4),
        }
        
        logger.error(json.dumps(log_data))
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract real client IP considering proxies"""
        # Check for forwarded headers in order of preference
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"

# ==========================================
# Audit Logging System
# ==========================================

class AuditLogger:
    """
    Audit logs as specified:
    Store: admin price/product changes; service order lifecycle
    Cave: inventory transactions, job state changes, reservation approvals
    """
    
    def __init__(self):
        self.audit_logger = logging.getLogger("audit")
    
    def log_admin_action(
        self,
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        changes: Dict[str, Any],
        request_id: str
    ):
        """Log admin actions for compliance"""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "admin_action",
            "user_id": user_id,
            "action": action,  # CREATE, UPDATE, DELETE
            "resource_type": resource_type,  # product, price, order, etc.
            "resource_id": resource_id,
            "changes": changes,
            "request_id": request_id,
            "service": "makrx_store"
        }
        
        self.audit_logger.info(json.dumps(audit_data))
    
    def log_service_order_lifecycle(
        self,
        service_order_id: str,
        status: str,
        user_id: Optional[str] = None,
        provider_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None
    ):
        """Log service order state changes"""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "service_order_lifecycle",
            "service_order_id": service_order_id,
            "status": status,
            "user_id": user_id,
            "provider_id": provider_id,
            "metadata": metadata or {},
            "request_id": request_id,
            "service": "makrx_store"
        }
        
        self.audit_logger.info(json.dumps(audit_data))
    
    def log_payment_event(
        self,
        payment_id: str,
        order_id: str,
        amount: float,
        currency: str,
        status: str,
        provider: str,  # stripe, razorpay
        request_id: str
    ):
        """Log payment events for financial audit"""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "payment_event",
            "payment_id": payment_id,
            "order_id": order_id,
            "amount": amount,
            "currency": currency,
            "status": status,
            "payment_provider": provider,
            "request_id": request_id,
            "service": "makrx_store"
        }
        
        self.audit_logger.info(json.dumps(audit_data))

# Global audit logger instance
audit = AuditLogger()

# ==========================================
# Metrics Collection (Prometheus-ready)
# ==========================================

class MetricsCollector:
    """
    Metrics (names you'll chart):
    store.quote_to_order_rate
    cave.job_accept_time_seconds  
    cave.material_variance_g (logged vs estimated)
    store.webhook_retry_total
    """
    
    def __init__(self):
        self.metrics = {}
    
    def increment_counter(self, name: str, labels: Optional[Dict[str, str]] = None):
        """Increment counter metric"""
        key = f"{name}:{json.dumps(labels or {}, sort_keys=True)}"
        self.metrics[key] = self.metrics.get(key, 0) + 1
    
    def record_gauge(self, name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Record gauge value"""
        key = f"{name}:{json.dumps(labels or {}, sort_keys=True)}"
        self.metrics[key] = value
    
    def record_histogram(self, name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Record histogram value (timing, sizes, etc.)"""
        # In production, this would update histogram buckets
        # For now, just track average
        key = f"{name}_avg:{json.dumps(labels or {}, sort_keys=True)}"
        current = self.metrics.get(key, {"sum": 0, "count": 0})
        current["sum"] += value
        current["count"] += 1
        self.metrics[key] = current
    
    def log_metric(self, name: str, value: Any, metric_type: str = "counter", labels: Optional[Dict[str, str]] = None):
        """Log metric in structured format"""
        metric_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "metric_name": name,
            "metric_type": metric_type,
            "value": value,
            "labels": labels or {},
            "service": "makrx_store"
        }
        
        # Use separate metrics logger
        metrics_logger = logging.getLogger("metrics")
        metrics_logger.info(json.dumps(metric_data))

# Global metrics collector
metrics = MetricsCollector()

# ==========================================
# Specific Store Metrics Implementation
# ==========================================

def track_quote_to_order_conversion(quote_id: str, converted: bool, request_id: str):
    """Track quote → order conversion rate"""
    metrics.increment_counter(
        "store_quote_to_order_total",
        {"converted": str(converted).lower()}
    )
    
    metrics.log_metric(
        "store.quote_to_order_rate",
        1 if converted else 0,
        "counter",
        {"quote_id": quote_id, "request_id": request_id}
    )

def track_webhook_retry(provider: str, event_type: str, attempt: int, success: bool, request_id: str):
    """Track webhook retry attempts"""
    metrics.increment_counter(
        "store_webhook_retry_total",
        {
            "provider": provider,
            "event_type": event_type,
            "attempt": str(attempt),
            "success": str(success).lower()
        }
    )

def track_service_order_sla(order_id: str, created_at: datetime, completed_at: datetime, request_id: str):
    """Track service order completion time"""
    duration_seconds = (completed_at - created_at).total_seconds()
    
    metrics.record_histogram(
        "store_service_order_duration_seconds",
        duration_seconds,
        {"order_id": order_id}
    )

# ==========================================
# Error Tracking with Request Context  
# ==========================================

class ErrorTracker:
    """Track errors with request context for debugging"""
    
    def __init__(self):
        self.error_logger = logging.getLogger("errors")
    
    def track_error(
        self,
        error: Exception,
        context: str,
        request_id: str,
        user_id: Optional[str] = None,
        additional_context: Optional[Dict[str, Any]] = None
    ):
        """Track errors with full context"""
        error_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "application_error",
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context,
            "request_id": request_id,
            "user_id": user_id,
            "additional_context": additional_context or {},
            "service": "makrx_store"
        }
        
        self.error_logger.error(json.dumps(error_data))

# Global error tracker
error_tracker = ErrorTracker()

# ==========================================
# Health Check with Observability
# ==========================================

def get_service_health() -> Dict[str, Any]:
    """Return service health status for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "makrx_store",
        "version": "1.0.0",
        "request_count": len(metrics.metrics),
        "uptime_seconds": time.time() - start_time
    }

# Track service start time
start_time = time.time()
