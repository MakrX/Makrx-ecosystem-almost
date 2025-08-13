# INDIAN LAW COMPLIANCE - MANDATORY REQUIREMENTS

## 🇮🇳 IMMEDIATE COMPLIANCE ACTIONS REQUIRED

### 1. GST COMPLIANCE (CRITICAL - 30 days)

#### Missing HSN/SAC Codes Implementation
```python
# Add to makrx-store-backend/app/models/commerce.py

HSN_SAC_CODES = {
    "3d_printing_services": "9988",      # Manufacturing services
    "digital_platform": "998314",        # Online platform services  
    "filament_pla": "39071000",          # Plastic filaments
    "electronics": "85",                  # Electronic components
    "tools": "8207",                      # Hand tools
    "consultation": "998313"              # Technical consulting
}

class GSTCompliantInvoice(Base):
    __tablename__ = "gst_invoices"
    
    id = Column(Integer, primary_key=True)
    invoice_number = Column(String(50), unique=True)
    gstin_seller = Column(String(15), nullable=False)  # MakrX GSTIN
    gstin_buyer = Column(String(15), nullable=True)
    hsn_sac_code = Column(String(10), nullable=False)
    place_of_supply = Column(String(50), nullable=False)
    
    # GST Breakdown
    taxable_amount = Column(Numeric(10, 2))
    igst_rate = Column(Numeric(5, 2), default=0)
    igst_amount = Column(Numeric(10, 2), default=0)
    cgst_rate = Column(Numeric(5, 2), default=0)
    cgst_amount = Column(Numeric(10, 2), default=0)
    sgst_rate = Column(Numeric(5, 2), default=0)
    sgst_amount = Column(Numeric(10, 2), default=0)
    
    total_amount = Column(Numeric(10, 2))
    invoice_date = Column(DateTime, default=datetime.utcnow)
```

#### GST Calculation Logic
```python
def calculate_gst(amount: float, buyer_state: str, seller_state: str = "Karnataka"):
    """Calculate GST based on buyer location"""
    gst_rate = 0.18  # 18% for most services
    
    if buyer_state == seller_state:
        # Intra-state: CGST + SGST
        cgst = amount * (gst_rate / 2)
        sgst = amount * (gst_rate / 2)
        igst = 0
    else:
        # Inter-state: IGST
        igst = amount * gst_rate
        cgst = sgst = 0
    
    return {
        "taxable_amount": amount,
        "cgst_amount": cgst,
        "sgst_amount": sgst,
        "igst_amount": igst,
        "total_amount": amount + cgst + sgst + igst
    }
```

### 2. IT RULES 2021 COMPLIANCE

#### Mandatory Grievance Officer Details
```typescript
// Add to all frontend apps footer/contact pages
export const GRIEVANCE_OFFICER = {
  title: "Grievance Officer & Data Protection Officer",
  name: "[Name Required]",
  email: "grievance@makrx.org",
  phone: "+91-XXXX-XXXX-XXX",
  address: `MakrX Technologies Private Limited
            [Complete Indian Address Required]
            [City], [State] - [PIN]
            India`,
  response_time: "24 hours acknowledgment, 15 days resolution",
  working_hours: "Monday to Friday, 9:00 AM to 6:00 PM IST"
};
```

#### Content Moderation System
```python
# Add to makrcave-backend/routes/content_moderation.py
from datetime import datetime, timedelta

class ContentModerationService:
    @staticmethod
    async def flag_content(content_id: str, reason: str, reporter_id: str):
        """Flag content for review within 24 hours as per IT Rules"""
        await ContentFlag.create({
            "content_id": content_id,
            "reason": reason,
            "reporter_id": reporter_id,
            "status": "pending",
            "flagged_at": datetime.utcnow(),
            "review_due": datetime.utcnow() + timedelta(hours=24)
        })
        
    @staticmethod
    async def automated_content_scan(content: str):
        """Scan for prohibited content"""
        prohibited_keywords = [
            # Add relevant keywords for your industry
        ]
        # Implement automated scanning logic
```

### 3. CONSUMER PROTECTION ACT 2019

#### Mandatory Policy Display
```typescript
// Add to makrx-store-frontend header/footer
export const CONSUMER_RIGHTS = {
  refund_policy: {
    title: "30-Day No-Questions-Asked Refund",
    details: "Full refund within 30 days of purchase",
    process: "Email refund@makrx.store with order details"
  },
  cancellation_policy: {
    title: "Free Cancellation Before Shipping",
    details: "No cancellation charges if order not shipped",
    timeline: "Cancel within 24 hours for instant refund"
  },
  grievance_redressal: {
    officer: GRIEVANCE_OFFICER,
    escalation: "National Consumer Helpline: 1915",
    resolution_time: "Maximum 30 days"
  },
  country_of_origin: {
    display_required: true,
    default_text: "Country of Origin: India (unless specified)"
  }
};
```

### 4. DPDP ACT 2023 ENHANCEMENTS

#### India-Specific Consent Forms
```typescript
// Update consent management
export const DPDP_INDIA_CONSENT = {
  data_fiduciary: "MakrX Technologies Private Limited",
  consent_language: `
    We are collecting your personal data for the following purposes:
    1. To provide MakrX ecosystem services
    2. To process orders and payments
    3. To improve our services
    
    You have the right to:
    - Access your data
    - Correct your data  
    - Delete your data
    - Data portability
    - Withdraw consent
    
    Data retention: 7 years for financial records, 90 days for behavioral data
    
    For grievances: dpo@makrx.org
  `,
  breach_notification: {
    timeline: "72 hours to MeitY",
    user_notification: "Without undue delay if high risk"
  }
};
```

## 📋 COMPLIANCE CHECKLIST

### GST Compliance ❌
- [ ] Register for GST (if turnover > ₹20 lakh)
- [ ] Implement HSN/SAC codes for all products/services
- [ ] Generate GST-compliant invoices
- [ ] Set up GSTR filing system
- [ ] Implement reverse charge mechanism for B2B

### IT Rules 2021 ❌  
- [ ] Appoint and publish Grievance Officer details
- [ ] Implement 24-hour content response system
- [ ] Set up automated content moderation
- [ ] Maintain 180-day user records
- [ ] Display India address prominently

### Consumer Protection ❌
- [ ] Create and display mandatory refund policy
- [ ] Implement grievance redressal system
- [ ] Add country of origin labels
- [ ] Set up 30-day complaint resolution
- [ ] Display total price including all charges

### DPDP Act 2023 ✅ (85% done)
- [x] Consent management system
- [x] User rights implementation  
- [x] Data retention policies
- [x] Breach notification procedures
- [ ] India-specific consent language
- [ ] MeitY breach notification integration

## 🚨 LEGAL RISKS

### High Risk (Immediate Action Required)
- **GST Penalties**: ₹10,000 per day for non-compliance
- **Consumer Protection Fines**: Up to ₹20 lakh for violations
- **IT Rules**: Platform blocking for non-compliance

### Medium Risk
- **DPDP Act Penalties**: Up to ₹250 crore maximum
- **Labor Law Issues**: State-specific violations

## 📅 IMPLEMENTATION TIMELINE

**Phase 1 (30 days) - Critical:**
1. GST registration and implementation
2. Grievance Officer appointment and display
3. Consumer protection policies

**Phase 2 (60 days) - Important:**
1. Content moderation system
2. Enhanced DPDP compliance
3. Automated compliance reporting

**Phase 3 (90 days) - Comprehensive:**
1. Full audit trail implementation
2. Advanced security monitoring
3. International compliance framework

## 💰 ESTIMATED COMPLIANCE COSTS

- GST Registration & Setup: ₹50,000
- Legal Consultation: ₹2,00,000
- Compliance Software: ₹1,00,000/year
- Grievance Officer: ₹6,00,000/year
- **Total Year 1**: ₹10,50,000

## 📞 IMMEDIATE ACTIONS

1. **Hire Indian Legal Counsel** - Compliance expertise required
2. **GST Registration** - If not already done
3. **Appoint Grievance Officer** - Mandatory under IT Rules
4. **Update Privacy Policies** - India-specific language
5. **Implement Tax System** - GST calculation and invoicing
