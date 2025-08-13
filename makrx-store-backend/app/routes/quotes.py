"""Quote API routes for 3D printing services"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import math
import json
import uuid
from app.schemas import MessageResponse
from app.core.db import get_db
from app.core.security import get_current_user
from app.models.services import Quote, Material, ServiceOrder
from sqlalchemy.orm import Session

router = APIRouter()

# Quote calculation models
class MaterialProperties(BaseModel):
    density_g_cm3: float = Field(..., description="Material density in g/cm³")
    cost_per_kg: float = Field(..., description="Material cost per kg in INR")
    print_temperature: int = Field(..., description="Print temperature in °C")
    bed_temperature: int = Field(0, description="Bed temperature in °C")
    supports_required: bool = Field(False, description="Whether supports are typically needed")
    difficulty_multiplier: float = Field(1.0, description="Printing difficulty multiplier")

class PrintSettings(BaseModel):
    material: str = Field(..., description="Material type (PLA, ABS, PETG, etc.)")
    quality: str = Field(..., description="Print quality (draft, standard, high)")
    infill_percentage: int = Field(20, ge=0, le=100, description="Infill percentage")
    layer_height: float = Field(0.2, ge=0.1, le=0.4, description="Layer height in mm")
    supports: bool = Field(False, description="Enable supports")
    brim: bool = Field(False, description="Enable brim")
    quantity: int = Field(1, ge=1, le=100, description="Number of copies")
    rush_order: bool = Field(False, description="Rush order (faster delivery)")

class FileAnalysis(BaseModel):
    volume_mm3: float = Field(..., description="Volume in mm³")
    surface_area_mm2: float = Field(..., description="Surface area in mm²")
    bounding_box: Dict[str, float] = Field(..., description="Bounding box dimensions")
    estimated_print_time_hours: float = Field(..., description="Estimated print time")
    complexity_score: float = Field(..., description="Complexity score 1-10")
    overhangs_detected: bool = Field(False, description="Whether overhangs are detected")
    thin_walls_detected: bool = Field(False, description="Whether thin walls are detected")

class QuoteRequest(BaseModel):
    upload_id: str = Field(..., description="File upload ID")
    print_settings: PrintSettings
    delivery_address: Optional[Dict[str, Any]] = None
    pickup_location: Optional[str] = None
    customer_notes: Optional[str] = None

class QuoteResponse(BaseModel):
    quote_id: str
    total_price: float
    currency: str = "INR"
    breakdown: Dict[str, Any]
    estimated_delivery: str
    valid_until: str
    print_parameters: PrintSettings
    file_analysis: FileAnalysis

# Material database
MATERIALS = {
    "PLA": MaterialProperties(
        density_g_cm3=1.24,
        cost_per_kg=800.0,
        print_temperature=210,
        bed_temperature=60,
        supports_required=False,
        difficulty_multiplier=1.0
    ),
    "ABS": MaterialProperties(
        density_g_cm3=1.04,
        cost_per_kg=900.0,
        print_temperature=250,
        bed_temperature=100,
        supports_required=False,
        difficulty_multiplier=1.2
    ),
    "PETG": MaterialProperties(
        density_g_cm3=1.27,
        cost_per_kg=1200.0,
        print_temperature=235,
        bed_temperature=80,
        supports_required=False,
        difficulty_multiplier=1.1
    ),
    "TPU": MaterialProperties(
        density_g_cm3=1.20,
        cost_per_kg=2500.0,
        print_temperature=225,
        bed_temperature=50,
        supports_required=True,
        difficulty_multiplier=2.0
    ),
    "WOOD_PLA": MaterialProperties(
        density_g_cm3=1.28,
        cost_per_kg=1500.0,
        print_temperature=200,
        bed_temperature=60,
        supports_required=False,
        difficulty_multiplier=1.3
    ),
    "CARBON_FIBER": MaterialProperties(
        density_g_cm3=1.30,
        cost_per_kg=3500.0,
        print_temperature=260,
        bed_temperature=80,
        supports_required=False,
        difficulty_multiplier=1.8
    )
}

# Quality settings
QUALITY_SETTINGS = {
    "draft": {
        "layer_height": 0.3,
        "speed_multiplier": 1.5,
        "quality_multiplier": 0.8,
        "description": "Fast print, lower detail"
    },
    "standard": {
        "layer_height": 0.2,
        "speed_multiplier": 1.0,
        "quality_multiplier": 1.0,
        "description": "Balanced speed and quality"
    },
    "high": {
        "layer_height": 0.15,
        "speed_multiplier": 0.7,
        "quality_multiplier": 1.4,
        "description": "High detail, slower print"
    },
    "ultra": {
        "layer_height": 0.1,
        "speed_multiplier": 0.5,
        "quality_multiplier": 2.0,
        "description": "Maximum detail, very slow"
    }
}

class QuoteCalculator:
    """Advanced 3D printing quote calculator"""
    
    @staticmethod
    def calculate_material_cost(file_analysis: FileAnalysis, settings: PrintSettings) -> Dict[str, float]:
        """Calculate material costs including waste"""
        material_props = MATERIALS.get(settings.material)
        if not material_props:
            raise ValueError(f"Unknown material: {settings.material}")
        
        # Calculate volume with infill
        infill_factor = settings.infill_percentage / 100.0
        solid_volume_mm3 = file_analysis.volume_mm3 * infill_factor
        
        # Add support material if needed
        support_volume_mm3 = 0
        if settings.supports or material_props.supports_required:
            # Estimate 15% additional volume for supports
            support_volume_mm3 = file_analysis.volume_mm3 * 0.15
        
        # Add brim/raft material
        brim_volume_mm3 = 0
        if settings.brim:
            # Estimate brim based on perimeter
            estimated_perimeter = math.sqrt(file_analysis.surface_area_mm2) * 4
            brim_volume_mm3 = estimated_perimeter * 5 * 0.2  # 5mm brim, 0.2mm height
        
        # Total volume including waste (10% waste factor)
        total_volume_mm3 = (solid_volume_mm3 + support_volume_mm3 + brim_volume_mm3) * 1.1
        
        # Convert to mass
        total_mass_g = total_volume_mm3 * material_props.density_g_cm3 / 1000
        
        # Calculate cost
        cost_per_g = material_props.cost_per_kg / 1000
        material_cost = total_mass_g * cost_per_g * settings.quantity
        
        return {
            "total_mass_g": total_mass_g * settings.quantity,
            "solid_volume_mm3": solid_volume_mm3 * settings.quantity,
            "support_volume_mm3": support_volume_mm3 * settings.quantity,
            "brim_volume_mm3": brim_volume_mm3 * settings.quantity,
            "waste_volume_mm3": total_volume_mm3 * 0.1 * settings.quantity,
            "material_cost": material_cost,
            "cost_per_g": cost_per_g
        }
    
    @staticmethod
    def calculate_print_time(file_analysis: FileAnalysis, settings: PrintSettings) -> Dict[str, float]:
        """Calculate printing time with quality and complexity adjustments"""
        base_time_hours = file_analysis.estimated_print_time_hours
        
        # Quality adjustment
        quality_info = QUALITY_SETTINGS.get(settings.quality, QUALITY_SETTINGS["standard"])
        speed_multiplier = quality_info["speed_multiplier"]
        
        # Layer height adjustment
        layer_adjustment = (0.2 / settings.layer_height) ** 0.7  # Non-linear adjustment
        
        # Infill adjustment
        infill_adjustment = 0.5 + (settings.infill_percentage / 100.0) * 0.5
        
        # Complexity adjustment
        complexity_adjustment = 1.0 + (file_analysis.complexity_score - 5) * 0.1
        
        # Support adjustment
        support_adjustment = 1.3 if settings.supports else 1.0
        
        # Material difficulty adjustment
        material_props = MATERIALS.get(settings.material, MATERIALS["PLA"])
        material_adjustment = material_props.difficulty_multiplier
        
        adjusted_time_hours = (
            base_time_hours * 
            layer_adjustment * 
            infill_adjustment * 
            complexity_adjustment * 
            support_adjustment * 
            material_adjustment / 
            speed_multiplier
        )
        
        # Total time for all quantities
        total_time_hours = adjusted_time_hours * settings.quantity
        
        return {
            "base_time_hours": base_time_hours,
            "adjusted_time_per_piece": adjusted_time_hours,
            "total_time_hours": total_time_hours,
            "adjustments": {
                "layer_height": layer_adjustment,
                "infill": infill_adjustment,
                "complexity": complexity_adjustment,
                "supports": support_adjustment,
                "material": material_adjustment,
                "speed": speed_multiplier
            }
        }
    
    @staticmethod
    def calculate_labor_cost(time_info: Dict[str, float], settings: PrintSettings) -> Dict[str, float]:
        """Calculate labor and machine costs"""
        # Base rates (INR per hour)
        machine_rate_per_hour = 120.0  # Machine depreciation and electricity
        labor_rate_per_hour = 200.0    # Operator time for setup, monitoring, post-processing
        
        # Setup time (fixed per job)
        setup_time_hours = 0.5 + (0.2 * settings.quantity)  # Setup scales with quantity
        
        # Active monitoring time (percentage of print time)
        monitoring_rate = 0.1  # 10% of print time requires active monitoring
        monitoring_time_hours = time_info["total_time_hours"] * monitoring_rate
        
        # Post-processing time
        post_processing_time_hours = 0.3 * settings.quantity  # 20 minutes per piece
        
        # Quality multiplier
        quality_info = QUALITY_SETTINGS.get(settings.quality, QUALITY_SETTINGS["standard"])
        quality_multiplier = quality_info["quality_multiplier"]
        
        # Rush order multiplier
        rush_multiplier = 1.8 if settings.rush_order else 1.0
        
        total_labor_time = (setup_time_hours + monitoring_time_hours + post_processing_time_hours) * quality_multiplier
        machine_cost = time_info["total_time_hours"] * machine_rate_per_hour * rush_multiplier
        labor_cost = total_labor_time * labor_rate_per_hour * rush_multiplier
        
        return {
            "setup_time_hours": setup_time_hours,
            "monitoring_time_hours": monitoring_time_hours,
            "post_processing_time_hours": post_processing_time_hours,
            "total_labor_time_hours": total_labor_time,
            "machine_cost": machine_cost,
            "labor_cost": labor_cost,
            "rush_multiplier": rush_multiplier,
            "quality_multiplier": quality_multiplier
        }
    
    @staticmethod
    def calculate_delivery_cost(delivery_address: Optional[Dict], pickup_location: Optional[str]) -> Dict[str, float]:
        """Calculate delivery/shipping costs"""
        if pickup_location:
            return {"delivery_cost": 0.0, "delivery_method": "pickup"}
        
        if not delivery_address:
            return {"delivery_cost": 0.0, "delivery_method": "pickup"}
        
        # Simple zone-based delivery (could be enhanced with actual shipping APIs)
        city = delivery_address.get("city", "").lower()
        
        if city in ["bangalore", "bengaluru"]:
            base_cost = 80.0  # Local delivery
        elif city in ["mumbai", "delhi", "hyderabad", "chennai", "pune", "kolkata"]:
            base_cost = 150.0  # Metro cities
        else:
            base_cost = 200.0  # Other cities
        
        return {
            "delivery_cost": base_cost,
            "delivery_method": "courier",
            "estimated_days": 2 if city in ["bangalore", "bengaluru"] else 4
        }

def mock_file_analysis(upload_id: str) -> FileAnalysis:
    """Mock file analysis - replace with actual 3D file processing"""
    # In production, this would analyze the actual STL/OBJ file
    return FileAnalysis(
        volume_mm3=15000.0,  # 15 cm³
        surface_area_mm2=8500.0,
        bounding_box={"length": 50.0, "width": 40.0, "height": 30.0},
        estimated_print_time_hours=3.5,
        complexity_score=6.2,
        overhangs_detected=True,
        thin_walls_detected=False
    )

@router.post("/", response_model=QuoteResponse)
async def create_quote(
    quote_request: QuoteRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate comprehensive 3D printing quote"""
    try:
        # Validate material
        if quote_request.print_settings.material not in MATERIALS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported material: {quote_request.print_settings.material}"
            )
        
        # Validate quality
        if quote_request.print_settings.quality not in QUALITY_SETTINGS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported quality: {quote_request.print_settings.quality}"
            )
        
        # Get file analysis (mock for now)
        file_analysis = mock_file_analysis(quote_request.upload_id)
        
        # Calculate costs
        material_breakdown = QuoteCalculator.calculate_material_cost(
            file_analysis, quote_request.print_settings
        )
        
        time_breakdown = QuoteCalculator.calculate_print_time(
            file_analysis, quote_request.print_settings
        )
        
        labor_breakdown = QuoteCalculator.calculate_labor_cost(
            time_breakdown, quote_request.print_settings
        )
        
        delivery_breakdown = QuoteCalculator.calculate_delivery_cost(
            quote_request.delivery_address, quote_request.pickup_location
        )
        
        # Calculate total cost
        subtotal = (
            material_breakdown["material_cost"] +
            labor_breakdown["machine_cost"] +
            labor_breakdown["labor_cost"]
        )
        
        # Apply taxes (18% GST for India)
        tax_rate = 0.18
        tax_amount = subtotal * tax_rate
        
        # Total cost
        total_before_delivery = subtotal + tax_amount
        total_cost = total_before_delivery + delivery_breakdown["delivery_cost"]
        
        # Generate quote ID
        quote_id = f"QT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Calculate delivery estimate
        base_delivery_days = delivery_breakdown.get("estimated_days", 3)
        if quote_request.print_settings.rush_order:
            delivery_days = max(1, base_delivery_days - 1)
        else:
            delivery_days = base_delivery_days + math.ceil(time_breakdown["total_time_hours"] / 24)
        
        estimated_delivery = (datetime.now() + timedelta(days=delivery_days)).isoformat()
        valid_until = (datetime.now() + timedelta(days=7)).isoformat()
        
        # Create comprehensive breakdown
        breakdown = {
            "subtotal": subtotal,
            "tax_rate": tax_rate,
            "tax_amount": tax_amount,
            "delivery_cost": delivery_breakdown["delivery_cost"],
            "total_cost": total_cost,
            "material": material_breakdown,
            "time": time_breakdown,
            "labor": labor_breakdown,
            "delivery": delivery_breakdown,
            "pricing_details": {
                "material_cost_per_g": material_breakdown["cost_per_g"],
                "machine_rate_per_hour": 120.0,
                "labor_rate_per_hour": 200.0,
                "tax_rate": tax_rate
            }
        }
        
        # Store quote in database (simplified)
        # In production, save to Quote model
        
        return QuoteResponse(
            quote_id=quote_id,
            total_price=total_cost,
            currency="INR",
            breakdown=breakdown,
            estimated_delivery=estimated_delivery,
            valid_until=valid_until,
            print_parameters=quote_request.print_settings,
            file_analysis=file_analysis
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quote calculation failed: {str(e)}")

@router.get("/{quote_id}")
async def get_quote(
    quote_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieve existing quote by ID"""
    # In production, fetch from database
    raise HTTPException(status_code=404, detail="Quote not found")

@router.post("/{quote_id}/accept")
async def accept_quote(
    quote_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Accept a quote and create service order"""
    # In production, create ServiceOrder from Quote
    return MessageResponse(message=f"Quote {quote_id} accepted - service order created")

@router.get("/materials/")
async def get_available_materials():
    """Get list of available materials with properties"""
    materials_list = []
    for name, props in MATERIALS.items():
        materials_list.append({
            "name": name,
            "display_name": name.replace("_", " ").title(),
            "properties": props.dict(),
            "description": f"Cost: ₹{props.cost_per_kg}/kg, Print temp: {props.print_temperature}°C"
        })
    
    return {"materials": materials_list}

@router.get("/quality-settings/")
async def get_quality_settings():
    """Get available quality settings"""
    return {"quality_settings": QUALITY_SETTINGS}
