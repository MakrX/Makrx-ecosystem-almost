import qrcode
import io
import base64
from typing import List, Dict, Any, Optional
import csv
from datetime import datetime, timedelta
import requests
from sqlalchemy.orm import Session

def generate_qr_code(data: str) -> str:
    """Generate QR code image as base64 string"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def parse_makrx_qr(qr_code: str) -> Optional[Dict[str, str]]:
    """Parse MakrX QR code format: MKX-CATEGORY-SUBCATEGORY-PRODUCTCODE"""
    try:
        parts = qr_code.split('-')
        if len(parts) >= 4 and parts[0] == 'MKX':
            return {
                'category': parts[1],
                'subcategory': parts[2],
                'product_code': '-'.join(parts[3:]),
                'supplier_type': 'makrx'
            }
    except Exception:
        pass
    return None

def validate_csv_headers(headers: List[str]) -> Dict[str, Any]:
    """Validate CSV headers for bulk import"""
    required_headers = ['name', 'category', 'quantity', 'unit']
    optional_headers = [
        'subcategory', 'min_threshold', 'location', 'status', 
        'supplier_type', 'product_code', 'notes', 'image_url'
    ]
    
    missing_required = [h for h in required_headers if h not in headers]
    extra_headers = [h for h in headers if h not in required_headers + optional_headers]
    
    return {
        'valid': len(missing_required) == 0,
        'missing_required': missing_required,
        'extra_headers': extra_headers,
        'all_headers': required_headers + optional_headers
    }

def process_csv_row(row: Dict[str, str], row_number: int) -> Dict[str, Any]:
    """Process a single CSV row and return validation result"""
    errors = []
    warnings = []
    
    # Validate required fields
    required_fields = ['name', 'category', 'quantity', 'unit']
    for field in required_fields:
        if not row.get(field) or str(row[field]).strip() == '':
            errors.append(f"Missing required field: {field}")
    
    # Validate quantity
    try:
        quantity = float(row.get('quantity', 0))
        if quantity < 0:
            errors.append("Quantity cannot be negative")
    except ValueError:
        errors.append("Invalid quantity format")
    
    # Validate min_threshold if provided
    if row.get('min_threshold'):
        try:
            min_threshold = float(row['min_threshold'])
            if min_threshold < 0:
                errors.append("Min threshold cannot be negative")
        except ValueError:
            errors.append("Invalid min threshold format")
    
    # Validate supplier_type
    if row.get('supplier_type') and row['supplier_type'] not in ['makrx', 'external']:
        errors.append("Supplier type must be 'makrx' or 'external'")
    
    # Validate status
    valid_statuses = ['active', 'in_use', 'damaged', 'maintenance', 'retired']
    if row.get('status') and row['status'].lower() not in valid_statuses:
        warnings.append(f"Unknown status '{row['status']}', will default to 'active'")
    
    # MakrX specific validations
    if row.get('supplier_type') == 'makrx' and not row.get('product_code'):
        warnings.append("MakrX items should have a product code for reordering")
    
    return {
        'row_number': row_number,
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'data': row
    }

def calculate_inventory_value(items: List[Dict[str, Any]]) -> Dict[str, float]:
    """Calculate total inventory value by category"""
    category_values = {}
    total_value = 0
    
    for item in items:
        category = item.get('category', 'Unknown')
        quantity = float(item.get('quantity', 0))
        # Placeholder for cost calculation - would integrate with pricing data
        estimated_cost = estimate_item_cost(item)
        
        item_value = quantity * estimated_cost
        category_values[category] = category_values.get(category, 0) + item_value
        total_value += item_value
    
    return {
        'total_value': total_value,
        'category_breakdown': category_values
    }

def estimate_item_cost(item: Dict[str, Any]) -> float:
    """Estimate item cost based on category and supplier type"""
    # Placeholder cost estimation logic
    category_costs = {
        'filament': 25.0,  # per kg
        'sensor': 15.0,    # per piece
        'tool': 50.0,      # per piece
        'component': 5.0,  # per piece
        'consumable': 10.0 # per unit
    }
    
    category = item.get('category', '').lower()
    supplier_type = item.get('supplier_type', 'external')
    
    base_cost = category_costs.get(category, 20.0)
    
    # MakrX items might have premium pricing
    if supplier_type == 'makrx':
        base_cost *= 1.2
    
    return base_cost

def generate_low_stock_report(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate low stock analysis report"""
    low_stock_items = []
    critical_items = []
    
    for item in items:
        quantity = float(item.get('quantity', 0))
        min_threshold = float(item.get('min_threshold', 0))
        
        if quantity <= 0:
            critical_items.append(item)
        elif quantity <= min_threshold:
            low_stock_items.append(item)
    
    # Calculate reorder suggestions
    reorder_suggestions = []
    for item in low_stock_items + critical_items:
        if item.get('supplier_type') == 'makrx' and item.get('product_code'):
            suggested_quantity = max(
                float(item.get('min_threshold', 10)) * 2,  # 2x minimum threshold
                10  # minimum order quantity
            )
            reorder_suggestions.append({
                'item': item,
                'suggested_quantity': suggested_quantity,
                'estimated_cost': suggested_quantity * estimate_item_cost(item)
            })
    
    return {
        'low_stock_count': len(low_stock_items),
        'critical_count': len(critical_items),
        'low_stock_items': low_stock_items,
        'critical_items': critical_items,
        'reorder_suggestions': reorder_suggestions,
        'total_estimated_reorder_cost': sum(s['estimated_cost'] for s in reorder_suggestions)
    }

def create_makrx_reorder_url(product_code: str, quantity: float, makerspace_id: str) -> str:
    """Create MakrX Store reorder URL"""
    base_url = "https://store.makrx.com/reorder"
    params = {
        'product': product_code,
        'quantity': int(quantity),
        'makerspace': makerspace_id,
        'source': 'inventory_management'
    }
    
    param_string = '&'.join([f"{k}={v}" for k, v in params.items()])
    return f"{base_url}?{param_string}"

def validate_item_access_level(user_role: str, item_access_level: Optional[str]) -> bool:
    """Check if user can access item based on restricted access level"""
    if not item_access_level:
        return True
    
    access_hierarchy = {
        'super_admin': 5,
        'makerspace_admin': 4,
        'admin': 3,
        'service_provider': 2,
        'user': 1
    }
    
    required_level = access_hierarchy.get(item_access_level, 1)
    user_level = access_hierarchy.get(user_role, 1)
    
    return user_level >= required_level

def calculate_usage_analytics(usage_logs: List[Dict[str, Any]], days: int = 30) -> Dict[str, Any]:
    """Calculate usage analytics for the specified time period"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    recent_logs = [
        log for log in usage_logs 
        if datetime.fromisoformat(log['timestamp']) >= cutoff_date
    ]
    
    # Group by action
    actions = {}
    for log in recent_logs:
        action = log.get('action', 'unknown')
        actions[action] = actions.get(action, 0) + 1
    
    # Group by user
    users = {}
    for log in recent_logs:
        user = log.get('user_name', 'Unknown')
        users[user] = users.get(user, 0) + 1
    
    # Group by item
    items = {}
    for log in recent_logs:
        item_name = log.get('item_name', 'Unknown')
        items[item_name] = items.get(item_name, 0) + 1
    
    # Calculate daily activity
    daily_activity = {}
    for log in recent_logs:
        date = datetime.fromisoformat(log['timestamp']).date().isoformat()
        daily_activity[date] = daily_activity.get(date, 0) + 1
    
    return {
        'period_days': days,
        'total_activities': len(recent_logs),
        'actions_breakdown': actions,
        'top_users': sorted(users.items(), key=lambda x: x[1], reverse=True)[:10],
        'most_used_items': sorted(items.items(), key=lambda x: x[1], reverse=True)[:10],
        'daily_activity': daily_activity
    }

async def sync_with_makrx_catalog(product_codes: List[str]) -> Dict[str, Any]:
    """Sync item details with MakrX catalog (placeholder for actual API integration)"""
    # This would make actual API calls to MakrX Store
    synced_items = {}
    failed_items = []
    
    for code in product_codes:
        try:
            # Placeholder for actual API call
            # response = requests.get(f"https://api.makrx.com/catalog/{code}")
            # if response.status_code == 200:
            #     synced_items[code] = response.json()
            
            # Mock response for now
            synced_items[code] = {
                'name': f"MakrX Item {code}",
                'category': 'Component',
                'current_price': 25.99,
                'availability': 'in_stock',
                'description': f"Official MakrX component {code}"
            }
        except Exception as e:
            failed_items.append({'code': code, 'error': str(e)})
    
    return {
        'synced_count': len(synced_items),
        'failed_count': len(failed_items),
        'synced_items': synced_items,
        'failed_items': failed_items
    }
