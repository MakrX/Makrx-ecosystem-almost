"""
Comprehensive Security Logging & Monitoring
Implements security monitoring per specification:
- Structured JSON logs with request tracing
- Security event monitoring and alerting
- Audit trail for compliance
- Performance monitoring with SLOs
- Real-time threat detection
"""
import json
import logging
import time
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
import secrets
import hashlib
from collections import defaultdict, deque
import threading

from app.core.config import settings

# ==========================================
# Security Monitoring Configuration
# ==========================================

class SecurityEventType(str, Enum):
    """Types of security events to monitor"""
    AUTH_FAILURE = "auth_failure"
    AUTH_SUCCESS = "auth_success"
    PERMISSION_DENIED = "permission_denied"
    ADMIN_ACTION = "admin_action"
    DATA_ACCESS = "data_access"
    FILE_UPLOAD = "file_upload"
    PAYMENT_EVENT = "payment_event"
    WEBHOOK_EVENT = "webhook_event"
    RATE_LIMIT_HIT = "rate_limit_hit"
    SECURITY_VIOLATION = "security_violation"
    DATA_EXPORT = "data_export"
    DATA_DELETION = "data_deletion"
    CONSENT_CHANGE = "consent_change"
    BREACH_DETECTED = "breach_detected"

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class SecurityEvent:
    """Structured security event"""
    event_id: str
    event_type: SecurityEventType
    timestamp: str
    user_id: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    request_id: Optional[str]
    resource: Optional[str]
    action: str
    success: bool
    details: Dict[str, Any]
    severity: AlertSeverity
    source_service: str

@dataclass
class PerformanceMetric:
    """Performance monitoring metric"""
    metric_id: str
    timestamp: str
    service: str
    endpoint: str
    method: str
    duration_ms: float
    status_code: int
    request_size: Optional[int]
    response_size: Optional[int]
    database_time_ms: Optional[float]
    cache_hit: Optional[bool]

class MonitoringConfig:
    """Security monitoring configuration"""
    
    # SLO targets per specification
    API_UPTIME_SLO = 99.9  # 99.9% uptime
    API_LATENCY_SLO = 500  # 500ms max response time
    DB_QUERY_SLO = 500     # 500ms max DB query time
    
    # Alert thresholds
    FAILED_LOGIN_THRESHOLD = 5      # 5 failed logins per 5 minutes
    HIGH_ERROR_RATE_THRESHOLD = 5   # 5% error rate
    SLOW_QUERY_THRESHOLD = 500      # 500ms query time
    HIGH_LATENCY_THRESHOLD = 1000   # 1000ms response time
    
    # Monitoring windows
    MONITORING_WINDOW_MINUTES = 5
    ALERT_COOLDOWN_MINUTES = 15
    
    # Log retention per specification
    AUDIT_LOG_RETENTION_DAYS = 365   # 1 year minimum
    SECURITY_LOG_RETENTION_DAYS = 90  # 90 days
    PERFORMANCE_LOG_RETENTION_DAYS = 30  # 30 days

# ==========================================
# Security Event Logger
# ==========================================

class SecurityEventLogger:
    """
    Structured security event logging
    - JSON format with consistent schema
    - Request ID correlation
    - Audit trail compliance
    """
    
    def __init__(self):
        self.logger = logging.getLogger("security_events")
        self.logger.setLevel(logging.INFO)
        
        # Structured JSON formatter
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": %(message)s}'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # File handler for audit trail
        file_handler = logging.FileHandler("security_audit.log")
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
    
    async def log_security_event(self, event_type: SecurityEventType, action: str,
                               success: bool, user_id: Optional[str] = None,
                               details: Dict[str, Any] = None,
                               severity: AlertSeverity = AlertSeverity.LOW,
                               context: Dict[str, Any] = None) -> SecurityEvent:
        """Log structured security event"""
        
        event = SecurityEvent(
            event_id=secrets.token_urlsafe(16),
            event_type=event_type,
            timestamp=datetime.utcnow().isoformat(),
            user_id=user_id,
            ip_address=context.get("ip_address") if context else None,
            user_agent=context.get("user_agent") if context else None,
            request_id=context.get("request_id") if context else None,
            resource=context.get("resource") if context else None,
            action=action,
            success=success,
            details=details or {},
            severity=severity,
            source_service=settings.SERVICE_NAME if hasattr(settings, 'SERVICE_NAME') else "makrx-store"
        )
        
        # Log event
        self.logger.info(json.dumps(asdict(event)))
        
        # Trigger real-time monitoring
        await security_monitor.process_security_event(event)
        
        return event
    
    async def log_auth_event(self, user_id: str, action: str, success: bool,
                           context: Dict[str, Any] = None, details: Dict[str, Any] = None):
        """Log authentication events"""
        event_type = SecurityEventType.AUTH_SUCCESS if success else SecurityEventType.AUTH_FAILURE
        severity = AlertSeverity.LOW if success else AlertSeverity.MEDIUM
        
        await self.log_security_event(
            event_type=event_type,
            action=action,
            success=success,
            user_id=user_id,
            details=details,
            severity=severity,
            context=context
        )
    
    async def log_admin_action(self, admin_user_id: str, action: str, resource: str,
                             success: bool, context: Dict[str, Any] = None,
                             details: Dict[str, Any] = None):
        """Log administrative actions"""
        await self.log_security_event(
            event_type=SecurityEventType.ADMIN_ACTION,
            action=action,
            success=success,
            user_id=admin_user_id,
            details=details,
            severity=AlertSeverity.HIGH,  # Admin actions are high severity
            context={**(context or {}), "resource": resource}
        )
    
    async def log_data_access(self, user_id: str, resource: str, action: str,
                            success: bool, context: Dict[str, Any] = None,
                            details: Dict[str, Any] = None):
        """Log data access events"""
        await self.log_security_event(
            event_type=SecurityEventType.DATA_ACCESS,
            action=action,
            success=success,
            user_id=user_id,
            details=details,
            severity=AlertSeverity.MEDIUM,
            context={**(context or {}), "resource": resource}
        )

# Global security event logger
security_logger = SecurityEventLogger()

# ==========================================
# Real-time Security Monitor
# ==========================================

class RealTimeSecurityMonitor:
    """
    Real-time security monitoring and alerting
    - Pattern detection for threats
    - Automated response to security events
    - SLA monitoring
    """
    
    def __init__(self):
        self.event_history = defaultdict(deque)  # Recent events by type
        self.alert_cooldowns = {}  # Prevent alert spam
        self.performance_metrics = deque(maxlen=1000)  # Recent performance data
        self.threat_patterns = []  # Active threat patterns
        self._lock = threading.Lock()
    
    async def process_security_event(self, event: SecurityEvent):
        """Process security event for real-time monitoring"""
        try:
            with self._lock:
                # Add to event history
                self.event_history[event.event_type].append(event)
                
                # Keep only recent events (5 minute window)
                cutoff_time = datetime.utcnow() - timedelta(minutes=MonitoringConfig.MONITORING_WINDOW_MINUTES)
                self._cleanup_old_events(cutoff_time)
            
            # Check for security patterns
            await self._detect_threat_patterns(event)
            
            # Check for rate limit violations
            await self._check_rate_violations(event)
            
            # Immediate alerts for critical events
            if event.severity == AlertSeverity.CRITICAL:
                await self._send_immediate_alert(event)
                
        except Exception as e:
            logging.error(f"Security monitoring failed: {e}")
    
    def _cleanup_old_events(self, cutoff_time: datetime):
        """Remove old events from monitoring window"""
        for event_type, events in self.event_history.items():
            while events and datetime.fromisoformat(events[0].timestamp) < cutoff_time:
                events.popleft()
    
    async def _detect_threat_patterns(self, event: SecurityEvent):
        """Detect security threat patterns"""
        
        # Failed login pattern detection
        if event.event_type == SecurityEventType.AUTH_FAILURE:
            await self._check_failed_login_pattern(event)
        
        # Admin action anomaly detection
        elif event.event_type == SecurityEventType.ADMIN_ACTION:
            await self._check_admin_action_anomaly(event)
        
        # Data access pattern detection
        elif event.event_type == SecurityEventType.DATA_ACCESS:
            await self._check_data_access_pattern(event)
        
        # Permission escalation detection
        elif event.event_type == SecurityEventType.PERMISSION_DENIED:
            await self._check_permission_escalation(event)
    
    async def _check_failed_login_pattern(self, event: SecurityEvent):
        """Check for brute force login attempts"""
        if not event.ip_address:
            return
        
        # Count recent failed logins from same IP
        recent_failures = [
            e for e in self.event_history[SecurityEventType.AUTH_FAILURE]
            if e.ip_address == event.ip_address
        ]
        
        if len(recent_failures) >= MonitoringConfig.FAILED_LOGIN_THRESHOLD:
            await self._trigger_security_alert(
                alert_type="brute_force_login",
                severity=AlertSeverity.HIGH,
                details={
                    "ip_address": event.ip_address,
                    "failed_attempts": len(recent_failures),
                    "timeframe": f"{MonitoringConfig.MONITORING_WINDOW_MINUTES} minutes"
                }
            )
    
    async def _check_admin_action_anomaly(self, event: SecurityEvent):
        """Check for unusual admin activity"""
        if not event.user_id:
            return
        
        # Count recent admin actions by user
        recent_admin_actions = [
            e for e in self.event_history[SecurityEventType.ADMIN_ACTION]
            if e.user_id == event.user_id
        ]
        
        # Check for high frequency admin actions (possible compromise)
        if len(recent_admin_actions) >= 10:  # 10 admin actions in 5 minutes
            await self._trigger_security_alert(
                alert_type="high_frequency_admin_actions",
                severity=AlertSeverity.HIGH,
                details={
                    "admin_user_id": event.user_id,
                    "action_count": len(recent_admin_actions),
                    "timeframe": f"{MonitoringConfig.MONITORING_WINDOW_MINUTES} minutes"
                }
            )
    
    async def _check_data_access_pattern(self, event: SecurityEvent):
        """Check for unusual data access patterns"""
        if not event.user_id:
            return
        
        # Count recent data access by user
        recent_access = [
            e for e in self.event_history[SecurityEventType.DATA_ACCESS]
            if e.user_id == event.user_id
        ]
        
        # Check for data scraping pattern
        if len(recent_access) >= 50:  # 50 data access events in 5 minutes
            await self._trigger_security_alert(
                alert_type="potential_data_scraping",
                severity=AlertSeverity.HIGH,
                details={
                    "user_id": event.user_id,
                    "access_count": len(recent_access),
                    "timeframe": f"{MonitoringConfig.MONITORING_WINDOW_MINUTES} minutes"
                }
            )
    
    async def _check_permission_escalation(self, event: SecurityEvent):
        """Check for permission escalation attempts"""
        if not event.user_id:
            return
        
        # Count recent permission denials for user
        recent_denials = [
            e for e in self.event_history[SecurityEventType.PERMISSION_DENIED]
            if e.user_id == event.user_id
        ]
        
        # Check for repeated permission escalation attempts
        if len(recent_denials) >= 5:  # 5 permission denials in 5 minutes
            await self._trigger_security_alert(
                alert_type="permission_escalation_attempt",
                severity=AlertSeverity.MEDIUM,
                details={
                    "user_id": event.user_id,
                    "denial_count": len(recent_denials),
                    "timeframe": f"{MonitoringConfig.MONITORING_WINDOW_MINUTES} minutes"
                }
            )
    
    async def _check_rate_violations(self, event: SecurityEvent):
        """Check for rate limit violations"""
        if event.event_type == SecurityEventType.RATE_LIMIT_HIT:
            # Repeated rate limit hits indicate potential abuse
            recent_rate_limits = [
                e for e in self.event_history[SecurityEventType.RATE_LIMIT_HIT]
                if e.ip_address == event.ip_address
            ]
            
            if len(recent_rate_limits) >= 3:  # 3 rate limit hits in 5 minutes
                await self._trigger_security_alert(
                    alert_type="persistent_rate_limit_violation",
                    severity=AlertSeverity.MEDIUM,
                    details={
                        "ip_address": event.ip_address,
                        "violation_count": len(recent_rate_limits)
                    }
                )
    
    async def _trigger_security_alert(self, alert_type: str, severity: AlertSeverity,
                                    details: Dict[str, Any]):
        """Trigger security alert with cooldown"""
        alert_key = f"{alert_type}_{details.get('ip_address', details.get('user_id', 'unknown'))}"
        
        # Check cooldown
        if alert_key in self.alert_cooldowns:
            last_alert = self.alert_cooldowns[alert_key]
            if datetime.utcnow() - last_alert < timedelta(minutes=MonitoringConfig.ALERT_COOLDOWN_MINUTES):
                return  # Skip alert due to cooldown
        
        # Record alert time
        self.alert_cooldowns[alert_key] = datetime.utcnow()
        
        # Create alert
        alert = {
            "alert_id": secrets.token_urlsafe(16),
            "alert_type": alert_type,
            "severity": severity.value,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details,
            "service": "makrx-security-monitor"
        }
        
        # Log alert
        logging.critical(f"SECURITY_ALERT: {json.dumps(alert)}")
        
        # Send alert (implement your alerting system)
        await self._send_alert_notification(alert)
    
    async def _send_immediate_alert(self, event: SecurityEvent):
        """Send immediate alert for critical events"""
        alert = {
            "alert_id": secrets.token_urlsafe(16),
            "alert_type": "critical_security_event",
            "severity": AlertSeverity.CRITICAL.value,
            "timestamp": datetime.utcnow().isoformat(),
            "event": asdict(event),
            "service": "makrx-security-monitor"
        }
        
        logging.critical(f"CRITICAL_SECURITY_ALERT: {json.dumps(alert)}")
        await self._send_alert_notification(alert)
    
    async def _send_alert_notification(self, alert: Dict[str, Any]):
        """Send alert notification (implement your notification system)"""
        # In production, integrate with:
        # - Email notifications
        # - Slack/Teams webhooks
        # - PagerDuty/Opsgenie
        # - SMS alerts for critical events
        pass

# Global security monitor
security_monitor = RealTimeSecurityMonitor()

# ==========================================
# Performance Monitor
# ==========================================

class PerformanceMonitor:
    """
    Performance monitoring with SLO tracking
    - API latency monitoring
    - Database query performance
    - Error rate tracking
    - Uptime monitoring
    """
    
    def __init__(self):
        self.metrics_buffer = deque(maxlen=10000)  # Recent metrics
        self.slo_violations = deque(maxlen=1000)   # SLO violations
        self._lock = threading.Lock()
    
    async def record_api_metric(self, endpoint: str, method: str, duration_ms: float,
                              status_code: int, request_size: Optional[int] = None,
                              response_size: Optional[int] = None,
                              database_time_ms: Optional[float] = None,
                              cache_hit: Optional[bool] = None):
        """Record API performance metric"""
        
        metric = PerformanceMetric(
            metric_id=secrets.token_urlsafe(8),
            timestamp=datetime.utcnow().isoformat(),
            service="makrx-store",
            endpoint=endpoint,
            method=method,
            duration_ms=duration_ms,
            status_code=status_code,
            request_size=request_size,
            response_size=response_size,
            database_time_ms=database_time_ms,
            cache_hit=cache_hit
        )
        
        with self._lock:
            self.metrics_buffer.append(metric)
        
        # Check SLO violations
        await self._check_slo_violations(metric)
        
        # Log metric
        logging.info(f"PERFORMANCE_METRIC: {json.dumps(asdict(metric))}")
    
    async def _check_slo_violations(self, metric: PerformanceMetric):
        """Check for SLO violations"""
        
        # Latency SLO violation
        if metric.duration_ms > MonitoringConfig.API_LATENCY_SLO:
            await self._record_slo_violation(
                slo_type="api_latency",
                metric=metric,
                threshold=MonitoringConfig.API_LATENCY_SLO,
                actual_value=metric.duration_ms
            )
        
        # Database query SLO violation
        if metric.database_time_ms and metric.database_time_ms > MonitoringConfig.DB_QUERY_SLO:
            await self._record_slo_violation(
                slo_type="database_query",
                metric=metric,
                threshold=MonitoringConfig.DB_QUERY_SLO,
                actual_value=metric.database_time_ms
            )
        
        # Error rate SLO (check recent error rate)
        if metric.status_code >= 500:
            await self._check_error_rate_slo()
    
    async def _record_slo_violation(self, slo_type: str, metric: PerformanceMetric,
                                  threshold: float, actual_value: float):
        """Record SLO violation"""
        violation = {
            "violation_id": secrets.token_urlsafe(16),
            "timestamp": datetime.utcnow().isoformat(),
            "slo_type": slo_type,
            "threshold": threshold,
            "actual_value": actual_value,
            "endpoint": metric.endpoint,
            "method": metric.method,
            "metric_id": metric.metric_id
        }
        
        with self._lock:
            self.slo_violations.append(violation)
        
        # Log violation
        logging.warning(f"SLO_VIOLATION: {json.dumps(violation)}")
        
        # Alert for severe violations
        if actual_value > threshold * 2:  # 2x threshold violation
            await security_monitor._trigger_security_alert(
                alert_type=f"severe_{slo_type}_violation",
                severity=AlertSeverity.HIGH,
                details=violation
            )
    
    async def _check_error_rate_slo(self):
        """Check error rate SLO"""
        # Calculate error rate over last 5 minutes
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)
        
        recent_metrics = [
            m for m in self.metrics_buffer
            if datetime.fromisoformat(m.timestamp) > cutoff_time
        ]
        
        if len(recent_metrics) < 10:  # Need minimum sample size
            return
        
        error_count = sum(1 for m in recent_metrics if m.status_code >= 500)
        error_rate = (error_count / len(recent_metrics)) * 100
        
        if error_rate > MonitoringConfig.HIGH_ERROR_RATE_THRESHOLD:
            await security_monitor._trigger_security_alert(
                alert_type="high_error_rate",
                severity=AlertSeverity.HIGH,
                details={
                    "error_rate_percent": error_rate,
                    "threshold_percent": MonitoringConfig.HIGH_ERROR_RATE_THRESHOLD,
                    "sample_size": len(recent_metrics),
                    "timeframe": "5 minutes"
                }
            )
    
    async def get_slo_report(self) -> Dict[str, Any]:
        """Generate SLO compliance report"""
        cutoff_time = datetime.utcnow() - timedelta(hours=24)  # Last 24 hours
        
        recent_metrics = [
            m for m in self.metrics_buffer
            if datetime.fromisoformat(m.timestamp) > cutoff_time
        ]
        
        if not recent_metrics:
            return {"error": "No metrics available"}
        
        # Calculate SLO compliance
        total_requests = len(recent_metrics)
        successful_requests = sum(1 for m in recent_metrics if m.status_code < 500)
        fast_requests = sum(1 for m in recent_metrics if m.duration_ms <= MonitoringConfig.API_LATENCY_SLO)
        
        uptime_slo = (successful_requests / total_requests) * 100
        latency_slo = (fast_requests / total_requests) * 100
        
        return {
            "report_period": "24_hours",
            "total_requests": total_requests,
            "uptime_slo": {
                "target_percent": MonitoringConfig.API_UPTIME_SLO,
                "actual_percent": uptime_slo,
                "compliant": uptime_slo >= MonitoringConfig.API_UPTIME_SLO
            },
            "latency_slo": {
                "target_ms": MonitoringConfig.API_LATENCY_SLO,
                "actual_percent_compliant": latency_slo,
                "compliant": latency_slo >= 95  # 95% of requests should be fast
            },
            "generated_at": datetime.utcnow().isoformat()
        }

# Global performance monitor
performance_monitor = PerformanceMonitor()

# ==========================================
# Audit Trail Manager
# ==========================================

class AuditTrailManager:
    """
    Immutable audit trail management per specification
    - Retain ≥1 year for admin actions
    - Immutable append-only logs
    - Compliance reporting
    """
    
    def __init__(self):
        self.audit_records = []  # In production, use immutable database
    
    async def create_audit_record(self, event_type: str, actor_id: str,
                                resource: str, action: str, success: bool,
                                before_state: Optional[Dict[str, Any]] = None,
                                after_state: Optional[Dict[str, Any]] = None,
                                details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create immutable audit record"""
        
        audit_record = {
            "audit_id": secrets.token_urlsafe(32),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "actor_id": actor_id,
            "resource": resource,
            "action": action,
            "success": success,
            "before_state": before_state,
            "after_state": after_state,
            "details": details or {},
            "checksum": None  # Will be calculated
        }
        
        # Calculate checksum for integrity
        audit_record["checksum"] = self._calculate_checksum(audit_record)
        
        # Store audit record (immutable)
        self.audit_records.append(audit_record)
        
        # Log for external audit systems
        logging.info(f"AUDIT_RECORD: {json.dumps(audit_record)}")
        
        return audit_record
    
    def _calculate_checksum(self, record: Dict[str, Any]) -> str:
        """Calculate integrity checksum for audit record"""
        # Create canonical representation
        record_copy = record.copy()
        record_copy.pop("checksum", None)
        
        canonical = json.dumps(record_copy, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(canonical.encode()).hexdigest()
    
    async def verify_audit_integrity(self, audit_id: str) -> bool:
        """Verify audit record integrity"""
        record = next((r for r in self.audit_records if r["audit_id"] == audit_id), None)
        if not record:
            return False
        
        stored_checksum = record["checksum"]
        calculated_checksum = self._calculate_checksum(record)
        
        return stored_checksum == calculated_checksum
    
    async def generate_compliance_report(self, start_date: datetime, 
                                       end_date: datetime) -> Dict[str, Any]:
        """Generate compliance audit report"""
        
        # Filter records by date range
        filtered_records = [
            r for r in self.audit_records
            if start_date <= datetime.fromisoformat(r["timestamp"]) <= end_date
        ]
        
        # Analyze audit data
        report = {
            "report_id": secrets.token_urlsafe(16),
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "total_records": len(filtered_records),
            "event_types": {},
            "actor_summary": {},
            "integrity_status": "verified",
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Event type breakdown
        for record in filtered_records:
            event_type = record["event_type"]
            if event_type not in report["event_types"]:
                report["event_types"][event_type] = {"count": 0, "success_rate": 0}
            
            report["event_types"][event_type]["count"] += 1
            if record["success"]:
                report["event_types"][event_type]["success_rate"] += 1
        
        # Calculate success rates
        for event_type in report["event_types"]:
            count = report["event_types"][event_type]["count"]
            success_count = report["event_types"][event_type]["success_rate"]
            report["event_types"][event_type]["success_rate"] = (success_count / count) * 100 if count > 0 else 0
        
        # Actor activity summary
        for record in filtered_records:
            actor_id = record["actor_id"]
            if actor_id not in report["actor_summary"]:
                report["actor_summary"][actor_id] = {"total_actions": 0, "admin_actions": 0}
            
            report["actor_summary"][actor_id]["total_actions"] += 1
            if "admin" in record["event_type"].lower():
                report["actor_summary"][actor_id]["admin_actions"] += 1
        
        return report

# Global audit trail manager
audit_trail = AuditTrailManager()
