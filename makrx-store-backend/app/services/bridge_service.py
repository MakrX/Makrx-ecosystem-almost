"""Bridge service for integrating Store with MakrCave providers"""
import os
import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field
import logging
from app.services.notification_service import notification_service, NotificationRequest, NotificationType, NotificationCategory

logger = logging.getLogger(__name__)

# Bridge models
class ServiceType(str, Enum):
    PRINTING_3D = "3d_printing"
    LASER_CUTTING = "laser_cutting"
    CNC_MACHINING = "cnc_machining"
    PCB_FABRICATION = "pcb_fabrication"
    CUSTOM_FABRICATION = "custom_fabrication"

class ProviderCapability(BaseModel):
    service_type: ServiceType
    materials: List[str]
    max_dimensions: Dict[str, float]  # length, width, height in mm
    min_dimensions: Dict[str, float]
    precision: float  # in mm
    lead_time_hours: int
    cost_per_hour: float
    available_24x7: bool = False

class Provider(BaseModel):
    provider_id: str
    makerspace_id: str
    name: str
    location: Dict[str, Any]  # address, city, coordinates
    capabilities: List[ProviderCapability]
    rating: float = 0.0
    total_orders: int = 0
    success_rate: float = 1.0
    is_active: bool = True
    contact_info: Dict[str, str]
    certification_level: str = "basic"  # basic, premium, enterprise

class ServiceRequest(BaseModel):
    request_id: str
    service_type: ServiceType
    file_analysis: Dict[str, Any]
    requirements: Dict[str, Any]  # material, quality, quantity, etc.
    budget_range: Optional[Dict[str, float]] = None  # min, max
    delivery_requirements: Dict[str, Any]
    customer_location: Dict[str, Any]
    urgency: str = "normal"  # low, normal, high, urgent

class ProviderMatch(BaseModel):
    provider: Provider
    compatibility_score: float  # 0-100
    estimated_cost: float
    estimated_delivery: datetime
    reasons: List[str]  # Why this provider was matched
    constraints: List[str] = []  # Any limitations

class BridgeResponse(BaseModel):
    matches: List[ProviderMatch]
    total_matches: int
    search_criteria: Dict[str, Any]
    alternatives: List[str] = []  # Alternative suggestions

class BridgeService:
    """Service to bridge Store orders with MakrCave providers"""
    
    def __init__(self):
        self.makrcave_api_base = os.getenv("MAKRCAVE_API_URL", "http://localhost:8001")
        self.api_key = os.getenv("BRIDGE_API_KEY", "")
        self.timeout = 30  # seconds
        
        # Provider cache
        self._provider_cache = {}
        self._cache_expiry = None
        
        # Service type mapping
        self.service_mapping = {
            "3d_printing": {
                "materials": ["PLA", "ABS", "PETG", "TPU", "WOOD_PLA", "CARBON_FIBER"],
                "typical_precision": 0.2,
                "cost_factors": ["volume", "complexity", "material", "infill"]
            },
            "laser_cutting": {
                "materials": ["ACRYLIC", "WOOD", "CARDBOARD", "LEATHER", "FABRIC"],
                "typical_precision": 0.1,
                "cost_factors": ["cutting_length", "material", "thickness"]
            },
            "cnc_machining": {
                "materials": ["ALUMINUM", "STEEL", "BRASS", "WOOD", "PLASTIC"],
                "typical_precision": 0.05,
                "cost_factors": ["machining_time", "material", "complexity"]
            }
        }
    
    async def find_providers(self, service_request: ServiceRequest) -> BridgeResponse:
        """Find suitable providers for a service request"""
        try:
            # Get available providers
            providers = await self._get_providers(service_request.service_type)
            
            if not providers:
                return BridgeResponse(
                    matches=[],
                    total_matches=0,
                    search_criteria=service_request.dict(),
                    alternatives=["No providers available for this service type"]
                )
            
            # Score and match providers
            matches = []
            for provider in providers:
                match = await self._evaluate_provider_match(provider, service_request)
                if match and match.compatibility_score > 50:  # Minimum threshold
                    matches.append(match)
            
            # Sort by compatibility score
            matches.sort(key=lambda x: x.compatibility_score, reverse=True)
            
            # Generate alternatives if no good matches
            alternatives = []
            if not matches:
                alternatives = await self._generate_alternatives(service_request)
            
            return BridgeResponse(
                matches=matches[:10],  # Top 10 matches
                total_matches=len(matches),
                search_criteria=service_request.dict(),
                alternatives=alternatives
            )
            
        except Exception as e:
            logger.error(f"Provider search failed: {e}")
            raise
    
    async def _get_providers(self, service_type: ServiceType) -> List[Provider]:
        """Get providers from MakrCave API with caching"""
        try:
            # Check cache
            if (self._cache_expiry and 
                datetime.now() < self._cache_expiry and 
                service_type in self._provider_cache):
                return self._provider_cache[service_type]
            
            # Fetch from MakrCave API
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                async with session.get(
                    f"{self.makrcave_api_base}/api/v1/providers",
                    headers=headers,
                    params={"service_type": service_type, "active_only": True}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        providers = [Provider(**provider) for provider in data.get("providers", [])]
                        
                        # Cache results
                        self._provider_cache[service_type] = providers
                        self._cache_expiry = datetime.now() + timedelta(minutes=15)
                        
                        return providers
                    else:
                        logger.warning(f"Failed to fetch providers: {response.status}")
                        return []
                        
        except asyncio.TimeoutError:
            logger.warning("Provider API timeout - using fallback")
            return await self._get_fallback_providers(service_type)
        except Exception as e:
            logger.error(f"Provider fetch error: {e}")
            return await self._get_fallback_providers(service_type)
    
    async def _get_fallback_providers(self, service_type: ServiceType) -> List[Provider]:
        """Get fallback/mock providers when API is unavailable"""
        # Mock providers for development/fallback
        mock_providers = [
            Provider(
                provider_id="mock_provider_1",
                makerspace_id="ms_bangalore_01",
                name="TechHub Bangalore",
                location={
                    "address": "123 Tech Park, Bangalore",
                    "city": "Bangalore",
                    "coordinates": {"lat": 12.9716, "lng": 77.5946}
                },
                capabilities=[
                    ProviderCapability(
                        service_type=ServiceType.PRINTING_3D,
                        materials=["PLA", "ABS", "PETG"],
                        max_dimensions={"length": 200, "width": 200, "height": 200},
                        min_dimensions={"length": 5, "width": 5, "height": 1},
                        precision=0.2,
                        lead_time_hours=24,
                        cost_per_hour=150.0
                    )
                ],
                rating=4.8,
                total_orders=250,
                success_rate=0.96,
                contact_info={"email": "orders@techhub.bangalore", "phone": "+91-9876543210"},
                certification_level="premium"
            ),
            Provider(
                provider_id="mock_provider_2",
                makerspace_id="ms_mumbai_01",
                name="MakerSpace Mumbai",
                location={
                    "address": "456 Innovation Street, Mumbai",
                    "city": "Mumbai",
                    "coordinates": {"lat": 19.0760, "lng": 72.8777}
                },
                capabilities=[
                    ProviderCapability(
                        service_type=ServiceType.LASER_CUTTING,
                        materials=["ACRYLIC", "WOOD", "CARDBOARD"],
                        max_dimensions={"length": 600, "width": 400, "height": 10},
                        min_dimensions={"length": 10, "width": 10, "height": 0.5},
                        precision=0.1,
                        lead_time_hours=12,
                        cost_per_hour=200.0
                    )
                ],
                rating=4.6,
                total_orders=180,
                success_rate=0.94,
                contact_info={"email": "laser@makerspace.mumbai", "phone": "+91-9876543211"}
            )
        ]
        
        # Filter by service type
        return [p for p in mock_providers 
                if any(cap.service_type == service_type for cap in p.capabilities)]
    
    async def _evaluate_provider_match(self, provider: Provider, request: ServiceRequest) -> Optional[ProviderMatch]:
        """Evaluate how well a provider matches the request"""
        try:
            # Find matching capabilities
            matching_capabilities = [
                cap for cap in provider.capabilities 
                if cap.service_type == request.service_type
            ]
            
            if not matching_capabilities:
                return None
            
            # Use best matching capability
            capability = max(matching_capabilities, key=lambda x: self._score_capability(x, request))
            
            # Calculate compatibility score
            score = await self._calculate_compatibility_score(provider, capability, request)
            
            if score < 50:  # Minimum threshold
                return None
            
            # Estimate cost and delivery
            estimated_cost = await self._estimate_cost(capability, request)
            estimated_delivery = await self._estimate_delivery_time(provider, capability, request)
            
            # Generate reasons and constraints
            reasons = self._generate_match_reasons(provider, capability, request, score)
            constraints = self._identify_constraints(capability, request)
            
            return ProviderMatch(
                provider=provider,
                compatibility_score=score,
                estimated_cost=estimated_cost,
                estimated_delivery=estimated_delivery,
                reasons=reasons,
                constraints=constraints
            )
            
        except Exception as e:
            logger.error(f"Provider evaluation failed: {e}")
            return None
    
    def _score_capability(self, capability: ProviderCapability, request: ServiceRequest) -> float:
        """Score a capability against request requirements"""
        score = 0.0
        
        # Material compatibility
        required_material = request.requirements.get("material", "").upper()
        if required_material in capability.materials:
            score += 30
        
        # Dimension compatibility
        file_analysis = request.file_analysis
        dimensions = file_analysis.get("dimensions", {})
        
        if dimensions:
            length = dimensions.get("length_mm", 0)
            width = dimensions.get("width_mm", 0)
            height = dimensions.get("height_mm", 0)
            
            # Check if dimensions fit
            if (length <= capability.max_dimensions.get("length", float('inf')) and
                width <= capability.max_dimensions.get("width", float('inf')) and
                height <= capability.max_dimensions.get("height", float('inf'))):
                score += 25
            
            # Check minimum dimensions
            if (length >= capability.min_dimensions.get("length", 0) and
                width >= capability.min_dimensions.get("width", 0) and
                height >= capability.min_dimensions.get("height", 0)):
                score += 15
        
        # Precision requirements
        required_precision = request.requirements.get("precision", 0.5)
        if capability.precision <= required_precision:
            score += 20
        
        # Lead time compatibility
        urgency_hours = {"low": 168, "normal": 72, "high": 24, "urgent": 12}
        required_hours = urgency_hours.get(request.urgency, 72)
        if capability.lead_time_hours <= required_hours:
            score += 10
        
        return score
    
    async def _calculate_compatibility_score(self, provider: Provider, capability: ProviderCapability, request: ServiceRequest) -> float:
        """Calculate overall compatibility score"""
        score = 0.0
        
        # Base capability score
        capability_score = self._score_capability(capability, request)
        score += capability_score * 0.4  # 40% weight
        
        # Provider reputation
        reputation_score = (provider.rating / 5.0) * 100
        score += reputation_score * 0.2  # 20% weight
        
        # Experience score
        experience_score = min(100, provider.total_orders / 10)  # 1 point per 10 orders, max 100
        score += experience_score * 0.15  # 15% weight
        
        # Success rate
        success_score = provider.success_rate * 100
        score += success_score * 0.15  # 15% weight
        
        # Location proximity (if customer location provided)
        if request.customer_location:
            proximity_score = await self._calculate_proximity_score(provider, request.customer_location)
            score += proximity_score * 0.1  # 10% weight
        
        return min(100, score)
    
    async def _calculate_proximity_score(self, provider: Provider, customer_location: Dict[str, Any]) -> float:
        """Calculate proximity score based on distance"""
        try:
            # Get coordinates
            provider_coords = provider.location.get("coordinates", {})
            customer_coords = customer_location.get("coordinates", {})
            
            if not (provider_coords and customer_coords):
                return 50  # Neutral score if coordinates missing
            
            # Calculate approximate distance (simplified)
            lat_diff = abs(provider_coords["lat"] - customer_coords["lat"])
            lng_diff = abs(provider_coords["lng"] - customer_coords["lng"])
            
            # Rough distance calculation (not accurate, but good enough for scoring)
            distance_km = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111  # 111 km per degree
            
            # Score based on distance (closer = higher score)
            if distance_km < 10:
                return 100
            elif distance_km < 50:
                return 80
            elif distance_km < 200:
                return 60
            elif distance_km < 500:
                return 40
            else:
                return 20
                
        except Exception:
            return 50  # Neutral score on error
    
    async def _estimate_cost(self, capability: ProviderCapability, request: ServiceRequest) -> float:
        """Estimate cost based on capability and request"""
        try:
            base_cost = 100.0  # Base service cost
            
            # Get service type specific factors
            service_info = self.service_mapping.get(capability.service_type, {})
            cost_factors = service_info.get("cost_factors", [])
            
            file_analysis = request.file_analysis
            
            if "volume" in cost_factors:
                volume_mm3 = file_analysis.get("volume_mm3", 1000)
                volume_cost = (volume_mm3 / 1000) * 50  # ₹50 per cm³
                base_cost += volume_cost
            
            if "complexity" in cost_factors:
                complexity = file_analysis.get("complexity_score", 5)
                complexity_multiplier = 1 + (complexity - 5) * 0.1
                base_cost *= complexity_multiplier
            
            if "material" in cost_factors:
                material = request.requirements.get("material", "PLA")
                material_multipliers = {
                    "PLA": 1.0, "ABS": 1.2, "PETG": 1.5, "TPU": 2.5,
                    "WOOD": 1.3, "ACRYLIC": 1.4, "ALUMINUM": 3.0
                }
                material_multiplier = material_multipliers.get(material.upper(), 1.0)
                base_cost *= material_multiplier
            
            # Quality multiplier
            quality = request.requirements.get("quality", "standard")
            quality_multipliers = {"draft": 0.8, "standard": 1.0, "high": 1.4, "ultra": 2.0}
            base_cost *= quality_multipliers.get(quality, 1.0)
            
            # Quantity
            quantity = request.requirements.get("quantity", 1)
            total_cost = base_cost * quantity
            
            # Quantity discount
            if quantity > 10:
                total_cost *= 0.9  # 10% discount for bulk orders
            
            # Urgency premium
            urgency_multipliers = {"low": 0.9, "normal": 1.0, "high": 1.3, "urgent": 1.8}
            total_cost *= urgency_multipliers.get(request.urgency, 1.0)
            
            return round(total_cost, 2)
            
        except Exception as e:
            logger.error(f"Cost estimation failed: {e}")
            return 500.0  # Fallback cost
    
    async def _estimate_delivery_time(self, provider: Provider, capability: ProviderCapability, request: ServiceRequest) -> datetime:
        """Estimate delivery time"""
        try:
            base_hours = capability.lead_time_hours
            
            # Adjust for complexity
            complexity = request.file_analysis.get("complexity_score", 5)
            if complexity > 7:
                base_hours *= 1.3
            elif complexity < 3:
                base_hours *= 0.8
            
            # Adjust for quantity
            quantity = request.requirements.get("quantity", 1)
            if quantity > 5:
                base_hours += quantity * 2  # 2 hours per additional item
            
            # Provider workload (mock - in reality would check actual queue)
            workload_multiplier = 1.0 + (provider.total_orders % 10) * 0.05  # Mock workload
            base_hours *= workload_multiplier
            
            return datetime.now() + timedelta(hours=base_hours)
            
        except Exception:
            return datetime.now() + timedelta(days=3)  # Fallback
    
    def _generate_match_reasons(self, provider: Provider, capability: ProviderCapability, request: ServiceRequest, score: float) -> List[str]:
        """Generate reasons why this provider was matched"""
        reasons = []
        
        if score > 90:
            reasons.append("Excellent match for your requirements")
        elif score > 80:
            reasons.append("Very good match with minor compromises")
        elif score > 70:
            reasons.append("Good match for most requirements")
        else:
            reasons.append("Acceptable match with some limitations")
        
        if provider.rating > 4.5:
            reasons.append(f"Highly rated provider ({provider.rating}/5.0)")
        
        if provider.success_rate > 0.95:
            reasons.append(f"Excellent success rate ({provider.success_rate*100:.1f}%)")
        
        if provider.certification_level == "premium":
            reasons.append("Premium certified provider")
        
        if capability.lead_time_hours <= 24:
            reasons.append("Fast turnaround time")
        
        required_material = request.requirements.get("material", "").upper()
        if required_material in capability.materials:
            reasons.append(f"Supports {required_material} material")
        
        return reasons
    
    def _identify_constraints(self, capability: ProviderCapability, request: ServiceRequest) -> List[str]:
        """Identify any constraints or limitations"""
        constraints = []
        
        # Check dimensions
        file_analysis = request.file_analysis
        dimensions = file_analysis.get("dimensions", {})
        
        if dimensions:
            max_dim = max(
                dimensions.get("length_mm", 0),
                dimensions.get("width_mm", 0),
                dimensions.get("height_mm", 0)
            )
            
            capability_max = max(
                capability.max_dimensions.get("length", 0),
                capability.max_dimensions.get("width", 0),
                capability.max_dimensions.get("height", 0)
            )
            
            if max_dim > capability_max * 0.9:  # Close to maximum
                constraints.append("Near maximum size limits")
        
        # Check precision
        required_precision = request.requirements.get("precision", 0.5)
        if capability.precision > required_precision:
            constraints.append(f"Lower precision than requested ({capability.precision}mm vs {required_precision}mm)")
        
        # Check availability
        if not capability.available_24x7:
            constraints.append("Limited operating hours")
        
        return constraints
    
    async def _generate_alternatives(self, request: ServiceRequest) -> List[str]:
        """Generate alternative suggestions when no providers match"""
        alternatives = []
        
        if request.service_type == ServiceType.PRINTING_3D:
            alternatives.extend([
                "Consider using PLA material instead of specialty materials",
                "Reduce print quality for faster delivery",
                "Split large models into smaller parts",
                "Use standard dimensions if possible"
            ])
        elif request.service_type == ServiceType.LASER_CUTTING:
            alternatives.extend([
                "Consider thinner materials",
                "Simplify design to reduce cutting time",
                "Use standard sheet sizes"
            ])
        
        # Generic alternatives
        alternatives.extend([
            "Increase budget range for more options",
            "Extend delivery timeline",
            "Contact our support team for custom solutions"
        ])
        
        return alternatives
    
    async def create_service_order(self, provider_id: str, quote_data: Dict[str, Any], customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a service order with selected provider"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                order_data = {
                    "provider_id": provider_id,
                    "quote_data": quote_data,
                    "customer_data": customer_data,
                    "created_via": "store_bridge",
                    "priority": quote_data.get("urgency", "normal")
                }
                
                async with session.post(
                    f"{self.makrcave_api_base}/api/v1/service-orders",
                    headers=headers,
                    json=order_data
                ) as response:
                    if response.status == 201:
                        order = await response.json()
                        
                        # Send notifications
                        await self._notify_order_created(order, customer_data)
                        
                        return order
                    else:
                        error = await response.text()
                        raise Exception(f"Service order creation failed: {error}")
                        
        except Exception as e:
            logger.error(f"Service order creation failed: {e}")
            raise
    
    async def _notify_order_created(self, order: Dict[str, Any], customer_data: Dict[str, Any]):
        """Send notifications when service order is created"""
        try:
            # Notify customer
            customer_request = NotificationRequest(
                recipient=customer_data.get("email"),
                notification_type=NotificationType.EMAIL,
                category=NotificationCategory.ORDER_CONFIRMATION,
                subject=f"Service Order Confirmation - {order['order_number']}",
                message="Your service order has been created and assigned to a provider",
                template_name="service_order_confirmation",
                template_data={
                    "order_number": order["order_number"],
                    "provider_name": order.get("provider_name", "Provider"),
                    "estimated_delivery": order.get("estimated_completion"),
                    "total_cost": order.get("total_cost", 0)
                }
            )
            
            await notification_service.send_notification(customer_request)
            
            # Notify provider (webhook)
            provider_request = NotificationRequest(
                recipient=order.get("provider_webhook_url", ""),
                notification_type=NotificationType.WEBHOOK,
                category=NotificationCategory.ORDER_CONFIRMATION,
                subject="New Service Order",
                message="You have received a new service order",
                metadata={
                    "webhook_url": order.get("provider_webhook_url"),
                    "order_id": order["id"],
                    "order_data": order
                }
            )
            
            if order.get("provider_webhook_url"):
                await notification_service.send_notification(provider_request)
                
        except Exception as e:
            logger.error(f"Order notification failed: {e}")
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get status of a service order"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                async with session.get(
                    f"{self.makrcave_api_base}/api/v1/service-orders/{order_id}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Order not found: {order_id}")
                        
        except Exception as e:
            logger.error(f"Order status check failed: {e}")
            raise

# Global bridge service instance
bridge_service = BridgeService()
