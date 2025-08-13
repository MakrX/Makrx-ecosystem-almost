# MakrX Security & Compliance Documentation

## Overview

This document outlines the comprehensive security and compliance implementation for the MakrX ecosystem, ensuring full compliance with the Indian Digital Personal Data Protection Act (DPDP) 2023, GDPR concepts, PCI compliance, and industry security best practices.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API & Data Transport Security](#api--data-transport-security)
3. [File & Intellectual Property Protection](#file--intellectual-property-protection)
4. [Data Protection & Privacy (DPDP Act)](#data-protection--privacy-dpdp-act)
5. [Payment & Financial Security](#payment--financial-security)
6. [Inventory & Order Integrity](#inventory--order-integrity)
7. [Logging & Monitoring](#logging--monitoring)
8. [Operational Security](#operational-security)
9. [Compliance Framework](#compliance-framework)
10. [Incident Response](#incident-response)
11. [Audit Requirements](#audit-requirements)

---

## 1. Authentication & Authorization

### Implementation Status: ✅ COMPLETE

#### SSO & JWT Handling
- **Keycloak Integration**: Single identity provider for all services
- **Token Lifetimes**: 
  - Access tokens: 15 minutes maximum
  - Refresh tokens: 30 days maximum
- **Audience Enforcement**: Each client has specific audience validation
- **Immutable User IDs**: Keycloak `sub` field used as primary identifier

#### Role & Scope Enforcement
- **Defined Roles**: `user`, `provider`, `makerspace_admin`, `store_admin`, `superadmin`
- **Server-side Enforcement**: All admin and provider endpoints protected
- **Contextual Scoping**: Makerspace-specific and organization-specific access control
- **Zero Trust**: No client-side security decisions for sensitive operations

#### Implementation Files
- `makrx-store-backend/app/core/enhanced_security_auth.py`
- `services/keycloak/realm-export/makrx-realm.json`

---

## 2. API & Data Transport Security

### Implementation Status: ✅ COMPLETE

#### TLS Everywhere
- **HTTPS Enforcement**: HTTP to HTTPS redirects at gateway level
- **HSTS**: Strict Transport Security with preload
- **TLS 1.2+**: Minimum TLS version with strong cipher suites
- **Certificate Management**: Automated renewal and monitoring

#### CORS & CSRF Protection
- **Restricted Origins**: Limited to `makrx.org`, `makrcave.com`, `makrx.store`, `3d.makrx.store`
- **CSRF Tokens**: Double-submit cookie pattern for browser forms
- **SameSite Cookies**: Strict SameSite policy enforcement

#### Rate Limiting & Abuse Protection
- **Per-Endpoint Limits**:
  - File uploads: 10/5min per user
  - Quotes: 50/5min per user
  - Checkout: 20/5min per user
  - Login attempts: 5/5min per IP
  - General API: 100/5min per user
- **Redis Token Bucket**: Distributed rate limiting with sliding windows
- **Automatic Blocking**: Temporary IP blocking for severe violations

#### Implementation Files
- `makrx-store-backend/app/middleware/api_security.py`

---

## 3. File & Intellectual Property Protection

### Implementation Status: ✅ COMPLETE

#### Secure File Upload
- **Allowed Types**: `.stl`, `.3mf` (manufacturing), `.jpg/.png/.webp` (images)
- **Multi-layer Validation**:
  - MIME type verification
  - Magic bytes checking
  - File structure validation
- **Size Limits**: 100MB for STL/3MF, 10MB for images
- **Optional Scanning**: ClamAV integration for malware detection

#### Access Control
- **Private Storage**: S3/MinIO with private buckets (no public access)
- **Presigned URLs**: Short-lived (5 min) access URLs
- **Single-use Downloads**: Provider access links expire after first use
- **No Customer Downloads**: STL files not downloadable post-payment

#### IP Protection Features
- **Preview Generation**: Low-poly STL previews for display
- **Watermarking**: Automatic MakrX branding on preview images
- **Access Auditing**: Complete file access trail logging

#### Implementation Files
- `makrx-store-backend/app/core/file_security.py`

---

## 4. Data Protection & Privacy (DPDP Act)

### Implementation Status: ✅ COMPLETE

#### Data Minimization & Retention
- **Category-based Policies**:
  - Identity data: 7 years (financial compliance)
  - Financial data: 7 years (legal requirement)
  - Behavioral data: 90 days
  - Technical logs: 90 days (production)
  - Profile data: 2 years (inactive accounts)
- **Automated Cleanup**: Scheduled retention enforcement
- **Archive Before Delete**: Secure archival of expired data

#### User Rights Implementation
- **Data Export**: Complete user data in portable format (30-day response)
- **Data Deletion**: Right to erasure with legal exceptions (30-day response)
- **Consent Management**: Granular consent recording and withdrawal
- **Access Transparency**: Clear data processing notifications

#### DPDP Act Compliance
- **Consent Records**: Timestamp, method, scope, and context tracking
- **Breach Notification**: 72-hour notification procedures
- **Data Fiduciary Role**: Clear responsibilities and user rights
- **Privacy by Design**: Default privacy-protective settings

#### Implementation Files
- `makrx-store-backend/app/core/data_protection.py`

---

## 5. Payment & Financial Security

### Implementation Status: ✅ COMPLETE

#### PCI Compliance via Providers
- **No Local Card Storage**: Stripe/Razorpay Elements for card processing
- **Reference-only Storage**: Payment intent IDs and order references only
- **Secure Communications**: All payment API calls over TLS

#### Webhook Security
- **Signature Verification**: HMAC verification for all webhook events
- **Replay Protection**: Timestamp validation prevents replay attacks
- **Idempotency**: Event ID tracking prevents duplicate processing
- **Timeout Controls**: 5-minute webhook timeout window

#### Financial Controls
- **Refund Authorization**: Store admin role + MFA required
- **Audit Trail**: All financial operations logged with actor tracking
- **Rate Limiting**: Financial operation frequency controls
- **Dispute Handling**: Automated dispute event processing

#### Implementation Files
- `makrx-store-backend/app/core/payment_security.py`

---

## 6. Inventory & Order Integrity

### Implementation Status: ✅ COMPLETE

#### Access Control
- **Admin Only**: Inventory adjustments require `makerspace_admin` or `superadmin`
- **Reason Codes**: All adjustments require categorization (RECEIVE, CONSUME_JOB, ADJUST, RETURN)
- **Job Locking**: File access locked during PRINTING status

#### Audit Trail
- **Change Tracking**: Before/after state snapshots for all modifications
- **Actor Identification**: All changes traced to specific user accounts
- **Immutable Logs**: Append-only audit trail for compliance
- **Automated Logging**: Service job consumption triggers inventory updates

#### Implementation Details
- Integrated with existing bridge contracts
- Real-time inventory tracking
- Cross-service consistency validation

---

## 7. Logging & Monitoring

### Implementation Status: ✅ COMPLETE

#### Structured Logging
- **JSON Format**: Consistent structured logging across all services
- **Request Correlation**: X-Request-ID header propagation
- **Security Events**: Dedicated security event logging stream
- **Performance Metrics**: API latency and error rate tracking

#### Real-time Monitoring
- **SLO Tracking**: 99.9% uptime, 500ms response time targets
- **Threat Detection**: Real-time pattern analysis for security threats
- **Automated Alerting**:
  - Failed login patterns (brute force detection)
  - High error rates (>5%)
  - Slow database queries (>500ms)
  - Security violations

#### Alert Categories
- **Critical**: Immediate notification required
- **High**: 15-minute response window
- **Medium**: 1-hour response window
- **Low**: Daily review sufficient

#### Implementation Files
- `makrx-store-backend/app/core/security_monitoring.py`
- `makrx-store-backend/app/middleware/observability.py`

---

## 8. Operational Security

### Implementation Status: ✅ COMPLETE

#### Secrets Management
- **Vault Integration**: HashiCorp Vault for production secrets
- **Encrypted Fallback**: Local encrypted storage for development
- **Rotation Schedules**:
  - Database passwords: Quarterly
  - API keys: Quarterly  
  - JWT secrets: Quarterly
  - Encryption keys: Annually
- **Access Auditing**: All secret access operations logged

#### Multi-Factor Authentication
- **TOTP Implementation**: Time-based one-time passwords
- **Backup Codes**: 10 single-use recovery codes per user
- **Trusted Devices**: Device fingerprinting for known devices
- **Admin Enforcement**: MFA required for all admin roles

#### Access Control
- **Session Management**: 30-minute admin session timeouts
- **IP Allowlists**: Role-based IP restrictions
- **VPN Requirements**: Infrastructure access through VPN only
- **Audit Trail**: All admin actions logged with 5-year retention

#### Implementation Files
- `makrx-store-backend/app/core/operational_security.py`

---

## 9. Compliance Framework

### DPDP Act 2023 Compliance

#### Data Fiduciary Obligations
- ✅ **Lawful Processing**: Clear legal basis for all data processing
- ✅ **Purpose Limitation**: Data used only for stated purposes
- ✅ **Data Minimization**: Only necessary data collected
- ✅ **Accuracy**: Data kept accurate and up-to-date
- ✅ **Storage Limitation**: Retention policies enforced
- ✅ **Security**: Appropriate technical and organizational measures

#### User Rights Implementation
- ✅ **Right to Information**: Clear privacy notices provided
- ✅ **Right to Access**: Data export functionality implemented
- ✅ **Right to Correction**: Data update mechanisms available
- ✅ **Right to Erasure**: Data deletion procedures implemented
- ✅ **Right to Grievance**: Contact mechanisms for complaints

#### Consent Management
- ✅ **Free Consent**: No coercive consent practices
- ✅ **Informed Consent**: Clear explanation of data use
- ✅ **Specific Consent**: Granular consent for different purposes
- ✅ **Clear Consent**: Unambiguous consent mechanisms
- ✅ **Withdrawable Consent**: Easy consent withdrawal process

### International Standards

#### ISO 27001 Alignment
- ✅ **Information Security Management**: Comprehensive ISMS implementation
- ✅ **Risk Assessment**: Regular security risk evaluations
- ✅ **Access Control**: Strong authentication and authorization
- ✅ **Incident Management**: Structured incident response procedures

#### GDPR Concepts Applied
- ✅ **Privacy by Design**: Default privacy-protective settings
- ✅ **Data Protection Impact Assessment**: PIA for high-risk processing
- ✅ **Breach Notification**: 72-hour notification procedures
- ✅ **Data Protection Officer**: Designated privacy point of contact

---

## 10. Incident Response

### Data Breach Response Plan

#### Immediate Response (0-1 hours)
1. **Containment**: Isolate affected systems
2. **Assessment**: Determine scope and severity
3. **Notification**: Alert incident response team
4. **Documentation**: Begin incident timeline

#### Investigation Phase (1-24 hours)
1. **Forensic Analysis**: Determine breach vector and scope
2. **Impact Assessment**: Identify affected data and users
3. **Containment**: Implement additional security measures
4. **Evidence Preservation**: Secure logs and forensic evidence

#### Notification Phase (24-72 hours)
1. **Authority Notification**: Report to MeitY (DPDP Act requirement)
2. **User Notification**: Inform affected users
3. **Public Disclosure**: Media statements if required
4. **Customer Support**: Dedicated support for affected users

#### Recovery Phase (3-30 days)
1. **System Restoration**: Secure system restoration
2. **Monitoring**: Enhanced monitoring for recurring issues
3. **Lessons Learned**: Post-incident review and improvements
4. **Policy Updates**: Update security policies based on findings

### Security Incident Categories

#### Critical (P1)
- Data breaches affecting personal information
- Payment system compromises
- Ransomware or malware infections
- Complete service outages

#### High (P2)
- Unauthorized admin access
- Failed backup procedures
- Significant performance degradation
- Security control failures

#### Medium (P3)
- Suspicious access patterns
- Minor security misconfigurations
- Individual account compromises
- Compliance violations

#### Low (P4)
- Security tool alerts
- Policy violations
- Training requirements
- Documentation updates

---

## 11. Audit Requirements

### Internal Audits

#### Monthly Reviews
- Access control effectiveness
- Security monitoring alerts
- Compliance metric tracking
- Incident response testing

#### Quarterly Assessments
- Security control testing
- Vulnerability assessments
- Policy compliance reviews
- Training effectiveness evaluation

#### Annual Evaluations
- Comprehensive security audit
- DPDP Act compliance assessment
- Business continuity testing
- Third-party security reviews

### External Audits

#### Annual Requirements
- **Penetration Testing**: Third-party security assessment
- **Compliance Audit**: DPDP Act compliance verification
- **Financial Audit**: Payment processing controls review
- **SOC 2 Type II**: Service organization controls audit

#### Certification Maintenance
- **ISO 27001**: Annual surveillance audits
- **PCI DSS**: Quarterly vulnerability scans
- **Industry Standards**: Relevant certification renewals

### Audit Trail Requirements

#### Retention Periods
- **Security Logs**: 90 days minimum
- **Audit Logs**: 1 year minimum (admin actions)
- **Financial Records**: 7 years (regulatory requirement)
- **Compliance Records**: 5 years (DPDP Act)

#### Log Integrity
- **Immutable Storage**: Append-only audit logs
- **Digital Signatures**: Cryptographic integrity verification
- **Backup Procedures**: Secure off-site log backups
- **Access Controls**: Restricted audit log access

---

## Security Contact Information

### Data Protection Officer
- **Email**: dpo@makrx.org
- **Phone**: +91-XXX-XXX-XXXX
- **Address**: [Company Address]

### Security Team
- **Email**: security@makrx.org
- **Emergency**: +91-XXX-XXX-XXXX (24/7)
- **PGP Key**: [Public key for encrypted communications]

### Incident Reporting
- **Internal**: security-incidents@makrx.org
- **External**: Report via [secure portal URL]
- **Anonymous**: [Anonymous reporting mechanism]

---

## Document Information

- **Document Version**: 1.0
- **Last Updated**: {current_date}
- **Next Review**: {next_review_date}
- **Owner**: Chief Information Security Officer
- **Approved By**: Chief Executive Officer

**Classification**: Confidential - Internal Use Only

This document contains sensitive security information and should be handled according to the organization's information classification policy.
