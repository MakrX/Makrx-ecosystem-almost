"""
Pricing and quote calculation engine
Heuristic pricing for 3D printing services with material and time estimates
"""

import math
from typing import Dict, Tuple, Optional
from decimal import Decimal, ROUND_HALF_UP
import logging

from app.core.config import settings, MATERIAL_RATES, MATERIAL_DENSITIES, QUALITY_MULTIPLIERS

logger = logging.getLogger(__name__)

class PricingEngine:
    """3D printing pricing calculator"""
    
    def __init__(self):
        self.setup_fee = Decimal(str(settings.PRICE_SETUP_FEE))
        self.material_rates = {k: Decimal(str(v)) for k, v in MATERIAL_RATES.items()}
        self.material_densities = MATERIAL_DENSITIES.copy()
        self.quality_multipliers = QUALITY_MULTIPLIERS.copy()
    
    def calculate_quote(
        self,
        volume_mm3: float,
        material: str,
        quality: str,
        infill_percentage: int = 20,
        supports: bool = False,
        layer_height: float = 0.2,
        rush_order: bool = False,
        quantity: int = 1
    ) -> Dict[str, any]:
        """
        Calculate comprehensive quote for 3D printing job
        
        Args:
            volume_mm3: Model volume in cubic millimeters
            material: Material type (pla, abs, petg, etc.)
            quality: Print quality (draft, standard, high, ultra)
            infill_percentage: Infill density (10-100%)
            supports: Whether supports are needed
            layer_height: Layer height in mm
            rush_order: Whether this is a rush order
            quantity: Number of parts to print
        
        Returns:
            Dictionary with pricing breakdown and estimates
        """
        try:
            # Convert volume to cm³
            volume_cm3 = Decimal(str(volume_mm3 / 1000))
            
            # Get material rate and density
            material_rate = self.material_rates.get(material.lower(), self.material_rates["pla"])
            material_density = Decimal(str(self.material_densities.get(material.lower(), 1.24)))
            
            # Calculate base material cost
            material_cost = volume_cm3 * material_rate * Decimal(str(quantity))
            
            # Adjust for infill percentage (less infill = less material)
            infill_factor = Decimal(str(infill_percentage / 100))
            material_cost = material_cost * infill_factor
            
            # Calculate estimated weight
            estimated_weight_g = float(volume_cm3 * material_density * infill_factor * quantity)
            
            # Calculate print time estimation
            print_time_minutes = self._estimate_print_time(
                volume_mm3, quality, layer_height, supports, quantity
            )
            
            # Calculate machine time cost (based on print time)
            machine_rate_per_minute = Decimal("0.50")  # ₹0.50 per minute
            machine_cost = Decimal(str(print_time_minutes)) * machine_rate_per_minute
            
            # Calculate labor cost (setup, finishing, quality check)
            labor_cost = self._calculate_labor_cost(quantity, supports, quality)
            
            # Support cost adjustment
            support_cost = Decimal("0") if not supports else material_cost * Decimal("0.15")
            
            # Quality adjustment
            quality_multiplier = Decimal(str(self.quality_multipliers.get(quality, 1.0)))
            machine_cost = machine_cost * quality_multiplier
            
            # Rush order surcharge
            rush_multiplier = Decimal("1.5") if rush_order else Decimal("1.0")
            
            # Calculate subtotal
            subtotal = (material_cost + machine_cost + labor_cost + support_cost) * rush_multiplier
            
            # Add setup fee (once per job, not per part)
            total_cost = subtotal + self.setup_fee
            
            # Round to 2 decimal places
            total_cost = total_cost.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            # Prepare breakdown
            breakdown = {
                "material_cost": float(material_cost),
                "machine_cost": float(machine_cost * rush_multiplier),
                "labor_cost": float(labor_cost * rush_multiplier),
                "support_cost": float(support_cost * rush_multiplier),
                "setup_fee": float(self.setup_fee),
                "rush_surcharge": float((subtotal * (rush_multiplier - Decimal("1.0")))),
                "subtotal": float(subtotal),
                "total": float(total_cost)
            }
            
            return {
                "price": float(total_cost),
                "currency": "INR",
                "estimated_weight_g": estimated_weight_g,
                "estimated_time_minutes": print_time_minutes,
                "breakdown": breakdown,
                "material_usage": {
                    "volume_cm3": float(volume_cm3 * quantity),
                    "weight_g": estimated_weight_g,
                    "infill_percentage": infill_percentage,
                    "material_efficiency": float(infill_factor)
                },
                "print_parameters": {
                    "layer_height": layer_height,
                    "quality": quality,
                    "supports": supports,
                    "quantity": quantity
                }
            }
            
        except Exception as e:
            logger.error(f"Pricing calculation failed: {e}")
            raise ValueError(f"Unable to calculate quote: {str(e)}")
    
    def _estimate_print_time(
        self,
        volume_mm3: float,
        quality: str,
        layer_height: float,
        supports: bool,
        quantity: int
    ) -> int:
        """Estimate print time in minutes using heuristic formula"""
        
        # Base time calculation (very rough approximation)
        # This would be replaced by actual slicer API calls in V1+
        
        volume_cm3 = volume_mm3 / 1000
        
        # Base time: approximately 1 minute per cm³ for standard quality
        base_time_per_cm3 = 60  # minutes
        
        # Quality adjustment
        quality_factor = self.quality_multipliers.get(quality, 1.0)
        
        # Layer height adjustment (thinner layers = more time)
        layer_factor = 0.2 / layer_height  # Normalized to 0.2mm
        
        # Support time overhead (20% additional time)
        support_factor = 1.2 if supports else 1.0
        
        # Calculate per-part time
        time_per_part = base_time_per_cm3 * volume_cm3 * quality_factor * layer_factor * support_factor
        
        # Multiple parts (some parallelization possible)
        if quantity > 1:
            # Assume 80% efficiency for multiple parts
            total_time = time_per_part * quantity * 0.8
        else:
            total_time = time_per_part
        
        # Add setup time (15 minutes per job)
        setup_time = 15
        
        return int(total_time + setup_time)
    
    def _calculate_labor_cost(self, quantity: int, supports: bool, quality: str) -> Decimal:
        """Calculate labor cost based on job complexity"""
        
        # Base labor cost per part
        base_labor = Decimal("10.00")  # ₹10 per part
        
        # Support removal labor
        support_labor = Decimal("5.00") if supports else Decimal("0")
        
        # Quality-based finishing work
        quality_labor_map = {
            "draft": Decimal("0"),
            "standard": Decimal("2.00"),
            "high": Decimal("5.00"),
            "ultra": Decimal("10.00")
        }
        quality_labor = quality_labor_map.get(quality, Decimal("2.00"))
        
        # Per-part labor
        per_part_labor = base_labor + support_labor + quality_labor
        
        # Quantity discount for labor (bulk processing efficiency)
        if quantity >= 10:
            labor_discount = Decimal("0.8")  # 20% discount
        elif quantity >= 5:
            labor_discount = Decimal("0.9")  # 10% discount
        else:
            labor_discount = Decimal("1.0")  # No discount
        
        total_labor = per_part_labor * Decimal(str(quantity)) * labor_discount
        
        return total_labor
    
    def calculate_shipping_cost(
        self,
        weight_g: float,
        dimensions: Dict[str, float],
        destination_pincode: str,
        shipping_method: str = "standard"
    ) -> Dict[str, any]:
        """Calculate shipping costs based on weight, dimensions, and destination"""
        
        # Convert weight to kg
        weight_kg = weight_g / 1000
        
        # Calculate volumetric weight (length * width * height / 5000)
        if all(k in dimensions for k in ['length', 'width', 'height']):
            volumetric_weight = (
                dimensions['length'] * dimensions['width'] * dimensions['height']
            ) / 5000
        else:
            volumetric_weight = weight_kg
        
        # Use higher of actual or volumetric weight
        chargeable_weight = max(weight_kg, volumetric_weight)
        
        # Base shipping rates (would be replaced by carrier API in production)
        shipping_rates = {
            "standard": {"base": 50, "per_kg": 25},
            "express": {"base": 100, "per_kg": 40},
            "overnight": {"base": 200, "per_kg": 60}
        }
        
        rate = shipping_rates.get(shipping_method, shipping_rates["standard"])
        
        # Calculate cost
        shipping_cost = rate["base"] + (chargeable_weight * rate["per_kg"])
        
        # Minimum shipping cost
        shipping_cost = max(shipping_cost, 30)
        
        return {
            "cost": round(shipping_cost, 2),
            "currency": "INR",
            "method": shipping_method,
            "chargeable_weight_kg": round(chargeable_weight, 2),
            "estimated_days": self._get_shipping_days(shipping_method)
        }
    
    def _get_shipping_days(self, shipping_method: str) -> str:
        """Get estimated delivery days for shipping method"""
        delivery_times = {
            "standard": "5-7 business days",
            "express": "2-3 business days", 
            "overnight": "1 business day"
        }
        return delivery_times.get(shipping_method, "5-7 business days")
    
    def calculate_bulk_discount(self, base_price: float, quantity: int) -> Dict[str, any]:
        """Calculate bulk order discounts"""
        
        # Bulk discount tiers
        if quantity >= 100:
            discount_percentage = 15
        elif quantity >= 50:
            discount_percentage = 10
        elif quantity >= 20:
            discount_percentage = 7
        elif quantity >= 10:
            discount_percentage = 5
        else:
            discount_percentage = 0
        
        discount_amount = base_price * (discount_percentage / 100)
        final_price = base_price - discount_amount
        
        return {
            "original_price": base_price,
            "discount_percentage": discount_percentage,
            "discount_amount": round(discount_amount, 2),
            "final_price": round(final_price, 2),
            "savings": round(discount_amount, 2)
        }

# Global pricing engine instance
pricing_engine = PricingEngine()

def validate_print_parameters(
    material: str,
    quality: str,
    layer_height: float,
    infill_percentage: int
) -> Tuple[bool, Optional[str]]:
    """Validate print parameters"""
    
    # Check material
    if material.lower() not in MATERIAL_RATES:
        return False, f"Unsupported material: {material}"
    
    # Check quality
    if quality not in QUALITY_MULTIPLIERS:
        return False, f"Invalid quality setting: {quality}"
    
    # Check layer height
    if not (0.05 <= layer_height <= 0.8):
        return False, "Layer height must be between 0.05mm and 0.8mm"
    
    # Check infill
    if not (10 <= infill_percentage <= 100):
        return False, "Infill percentage must be between 10% and 100%"
    
    return True, None
