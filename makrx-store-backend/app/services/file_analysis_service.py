"""Advanced 3D file analysis service with real mesh processing"""
import os
import asyncio
import tempfile
import trimesh
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import logging
from pathlib import Path
import zipfile
import magic
from PIL import Image
import io

logger = logging.getLogger(__name__)

class FileAnalysisService:
    """Advanced 3D file analysis with real mesh processing"""
    
    def __init__(self):
        # Supported file formats
        self.supported_formats = {
            '.stl': self._analyze_stl,
            '.obj': self._analyze_obj,
            '.ply': self._analyze_ply,
            '.3mf': self._analyze_3mf,
            '.amf': self._analyze_amf,
            '.off': self._analyze_off,
            '.x3d': self._analyze_x3d
        }
        
        # Material property database for analysis
        self.material_properties = {
            'PLA': {'shrinkage': 0.003, 'density': 1.24, 'temp_range': (190, 220)},
            'ABS': {'shrinkage': 0.008, 'density': 1.04, 'temp_range': (220, 250)},
            'PETG': {'shrinkage': 0.002, 'density': 1.27, 'temp_range': (220, 250)},
            'TPU': {'shrinkage': 0.015, 'density': 1.20, 'temp_range': (200, 230)},
            'WOOD_PLA': {'shrinkage': 0.005, 'density': 1.28, 'temp_range': (180, 200)},
            'CARBON_FIBER': {'shrinkage': 0.001, 'density': 1.30, 'temp_range': (250, 270)}
        }
        
        # Print settings for analysis
        self.print_profiles = {
            'draft': {'layer_height': 0.3, 'speed_mm_s': 60, 'infill': 15},
            'standard': {'layer_height': 0.2, 'speed_mm_s': 50, 'infill': 20},
            'high': {'layer_height': 0.15, 'speed_mm_s': 40, 'infill': 20},
            'ultra': {'layer_height': 0.1, 'speed_mm_s': 30, 'infill': 25}
        }
    
    async def analyze_file(self, file_path: str, analysis_options: Optional[Dict] = None) -> Dict[str, Any]:
        """Comprehensive 3D file analysis"""
        start_time = datetime.now()
        
        try:
            # Basic file validation
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            file_ext = Path(file_path).suffix.lower()
            if file_ext not in self.supported_formats:
                raise ValueError(f"Unsupported file format: {file_ext}")
            
            # Get file info
            file_info = self._get_file_info(file_path)
            
            # Load and analyze mesh
            mesh_analysis = await self._analyze_mesh(file_path, file_ext)
            
            # Geometric analysis
            geometric_analysis = self._analyze_geometry(mesh_analysis['mesh'])
            
            # Printability analysis
            printability_analysis = self._analyze_printability(mesh_analysis['mesh'])
            
            # Cost estimation
            cost_analysis = self._analyze_cost_factors(mesh_analysis['mesh'], analysis_options or {})
            
            # Time estimation
            time_analysis = self._estimate_print_time(mesh_analysis['mesh'], analysis_options or {})
            
            # Quality recommendations
            quality_analysis = self._analyze_quality_requirements(mesh_analysis['mesh'])
            
            # Material recommendations
            material_analysis = self._recommend_materials(mesh_analysis['mesh'], printability_analysis)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "analysis_id": f"analysis_{int(datetime.now().timestamp())}",
                "file_info": file_info,
                "mesh_analysis": mesh_analysis,
                "geometric_analysis": geometric_analysis,
                "printability_analysis": printability_analysis,
                "cost_analysis": cost_analysis,
                "time_analysis": time_analysis,
                "quality_analysis": quality_analysis,
                "material_analysis": material_analysis,
                "processing_time_seconds": round(processing_time, 3),
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"File analysis failed: {e}")
            return {
                "error": str(e),
                "file_path": file_path,
                "processing_time_seconds": (datetime.now() - start_time).total_seconds()
            }
    
    def _get_file_info(self, file_path: str) -> Dict[str, Any]:
        """Get basic file information"""
        stat = os.stat(file_path)
        
        # Detect MIME type
        mime_type = magic.from_file(file_path, mime=True)
        
        return {
            "filename": os.path.basename(file_path),
            "file_size_bytes": stat.st_size,
            "file_size_mb": round(stat.st_size / (1024 * 1024), 2),
            "mime_type": mime_type,
            "extension": Path(file_path).suffix.lower(),
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
        }
    
    async def _analyze_mesh(self, file_path: str, file_ext: str) -> Dict[str, Any]:
        """Load and perform basic mesh analysis"""
        try:
            # Load mesh using appropriate method
            analysis_func = self.supported_formats[file_ext]
            mesh = await analysis_func(file_path)
            
            if mesh is None:
                raise ValueError("Failed to load mesh from file")
            
            # Basic mesh properties
            vertex_count = len(mesh.vertices)
            face_count = len(mesh.faces)
            edge_count = len(mesh.edges_unique)
            
            # Volume and surface area
            volume_mm3 = abs(mesh.volume) if mesh.is_watertight else 0
            surface_area_mm2 = mesh.area
            
            # Bounding box
            bounds = mesh.bounds
            dimensions = bounds[1] - bounds[0]
            
            # Mesh quality checks
            is_watertight = mesh.is_watertight
            is_winding_consistent = mesh.is_winding_consistent
            
            # Find holes and non-manifold edges
            holes = []
            if not is_watertight:
                holes = self._find_holes(mesh)
            
            # Center of mass
            center_of_mass = mesh.center_mass.tolist()
            
            return {
                "mesh": mesh,  # Keep for further analysis
                "vertex_count": vertex_count,
                "face_count": face_count,
                "edge_count": edge_count,
                "volume_mm3": float(volume_mm3),
                "surface_area_mm2": float(surface_area_mm2),
                "dimensions": {
                    "length_mm": float(dimensions[0]),
                    "width_mm": float(dimensions[1]),
                    "height_mm": float(dimensions[2]),
                    "bounding_box_min": bounds[0].tolist(),
                    "bounding_box_max": bounds[1].tolist()
                },
                "center_of_mass": center_of_mass,
                "mesh_quality": {
                    "is_watertight": is_watertight,
                    "is_winding_consistent": is_winding_consistent,
                    "has_holes": len(holes) > 0,
                    "hole_count": len(holes),
                    "holes": holes
                }
            }
            
        except Exception as e:
            logger.error(f"Mesh analysis failed: {e}")
            raise ValueError(f"Mesh analysis failed: {str(e)}")
    
    async def _analyze_stl(self, file_path: str) -> trimesh.Trimesh:
        """Analyze STL file"""
        return trimesh.load_mesh(file_path)
    
    async def _analyze_obj(self, file_path: str) -> trimesh.Trimesh:
        """Analyze OBJ file"""
        return trimesh.load_mesh(file_path)
    
    async def _analyze_ply(self, file_path: str) -> trimesh.Trimesh:
        """Analyze PLY file"""
        return trimesh.load_mesh(file_path)
    
    async def _analyze_3mf(self, file_path: str) -> trimesh.Trimesh:
        """Analyze 3MF file (Microsoft 3D Manufacturing Format)"""
        # 3MF files are ZIP archives containing XML and mesh data
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_file:
                # Look for 3D model files in the archive
                for filename in zip_file.namelist():
                    if filename.endswith('.model'):
                        # Extract and parse 3MF model file
                        # This is a simplified implementation
                        # Full 3MF support would require XML parsing
                        with tempfile.NamedTemporaryFile(suffix='.stl') as temp_file:
                            # Convert 3MF to STL (simplified)
                            return trimesh.load_mesh(file_path)
                            
            raise ValueError("No valid 3D model found in 3MF file")
        except Exception as e:
            logger.warning(f"3MF parsing failed, trying as mesh: {e}")
            return trimesh.load_mesh(file_path)
    
    async def _analyze_amf(self, file_path: str) -> trimesh.Trimesh:
        """Analyze AMF file (Additive Manufacturing Format)"""
        # AMF files are XML-based
        return trimesh.load_mesh(file_path)
    
    async def _analyze_off(self, file_path: str) -> trimesh.Trimesh:
        """Analyze OFF file (Object File Format)"""
        return trimesh.load_mesh(file_path)
    
    async def _analyze_x3d(self, file_path: str) -> trimesh.Trimesh:
        """Analyze X3D file"""
        return trimesh.load_mesh(file_path)
    
    def _find_holes(self, mesh: trimesh.Trimesh) -> List[Dict[str, Any]]:
        """Find holes in the mesh"""
        holes = []
        try:
            # Find boundary loops (holes)
            if hasattr(mesh, 'outline'):
                outlines = mesh.outline()
                if hasattr(outlines, 'entities'):
                    for i, entity in enumerate(outlines.entities):
                        if hasattr(entity, 'points'):
                            hole_perimeter = np.linalg.norm(np.diff(entity.points, axis=0), axis=1).sum()
                            holes.append({
                                "hole_id": i,
                                "perimeter_mm": float(hole_perimeter),
                                "point_count": len(entity.points)
                            })
        except Exception as e:
            logger.warning(f"Hole detection failed: {e}")
        
        return holes
    
    def _analyze_geometry(self, mesh: trimesh.Trimesh) -> Dict[str, Any]:
        """Analyze geometric properties"""
        try:
            # Calculate complexity metrics
            vertex_density = len(mesh.vertices) / mesh.area if mesh.area > 0 else 0
            face_density = len(mesh.faces) / mesh.area if mesh.area > 0 else 0
            
            # Surface roughness estimation
            surface_roughness = self._estimate_surface_roughness(mesh)
            
            # Symmetry analysis
            symmetry_analysis = self._analyze_symmetry(mesh)
            
            # Feature detection
            features = self._detect_features(mesh)
            
            return {
                "complexity_metrics": {
                    "vertex_density_per_mm2": float(vertex_density),
                    "face_density_per_mm2": float(face_density),
                    "surface_roughness_score": surface_roughness,
                    "geometric_complexity": min(10, vertex_density / 100)  # Scale to 1-10
                },
                "symmetry": symmetry_analysis,
                "features": features
            }
            
        except Exception as e:
            logger.error(f"Geometry analysis failed: {e}")
            return {"error": str(e)}
    
    def _estimate_surface_roughness(self, mesh: trimesh.Trimesh) -> float:
        """Estimate surface roughness from mesh properties"""
        try:
            # Calculate face normal variation as roughness indicator
            if len(mesh.face_normals) > 1:
                normal_variations = np.std(mesh.face_normals, axis=0)
                roughness_score = np.mean(normal_variations) * 10  # Scale to 0-10
                return float(min(10, max(0, roughness_score)))
            return 0.0
        except:
            return 0.0
    
    def _analyze_symmetry(self, mesh: trimesh.Trimesh) -> Dict[str, Any]:
        """Analyze mesh symmetry"""
        try:
            bounds = mesh.bounds
            center = (bounds[0] + bounds[1]) / 2
            
            # Check for approximate symmetry along each axis
            symmetry_scores = {}
            for axis, name in enumerate(['x', 'y', 'z']):
                # Simple symmetry check by comparing vertices on either side of center
                vertices_positive = mesh.vertices[mesh.vertices[:, axis] > center[axis]]
                vertices_negative = mesh.vertices[mesh.vertices[:, axis] < center[axis]]
                
                if len(vertices_positive) > 0 and len(vertices_negative) > 0:
                    ratio = min(len(vertices_positive), len(vertices_negative)) / max(len(vertices_positive), len(vertices_negative))
                    symmetry_scores[f"{name}_axis"] = float(ratio)
                else:
                    symmetry_scores[f"{name}_axis"] = 0.0
            
            return {
                "symmetry_scores": symmetry_scores,
                "most_symmetric_axis": max(symmetry_scores, key=symmetry_scores.get) if symmetry_scores else None
            }
            
        except Exception as e:
            logger.warning(f"Symmetry analysis failed: {e}")
            return {"error": str(e)}
    
    def _detect_features(self, mesh: trimesh.Trimesh) -> Dict[str, Any]:
        """Detect geometric features that affect printing"""
        features = {
            "thin_walls": False,
            "overhangs": False,
            "bridges": False,
            "small_details": False,
            "hollow_sections": False
        }
        
        try:
            # Detect thin walls by analyzing edge lengths
            if hasattr(mesh, 'edges_unique_length'):
                min_edge_length = np.min(mesh.edges_unique_length)
                if min_edge_length < 0.8:  # Less than 0.8mm
                    features["thin_walls"] = True
            
            # Detect overhangs by analyzing face normals
            if len(mesh.face_normals) > 0:
                # Faces with normal Z component < -0.5 are potential overhangs
                overhang_faces = mesh.face_normals[:, 2] < -0.5
                if np.any(overhang_faces):
                    features["overhangs"] = True
            
            # Detect small details by analyzing feature size relative to bounding box
            bounds = mesh.bounds
            max_dimension = np.max(bounds[1] - bounds[0])
            if hasattr(mesh, 'edges_unique_length'):
                smallest_feature = np.min(mesh.edges_unique_length)
                if smallest_feature < max_dimension * 0.001:  # Less than 0.1% of max dimension
                    features["small_details"] = True
            
            # Detect potential bridges (simplified)
            # This would require more sophisticated analysis in practice
            if features["overhangs"]:
                features["bridges"] = True
            
            # Detect hollow sections (simplified check)
            if mesh.is_watertight and mesh.volume > 0:
                # Calculate approximate wall thickness
                surface_to_volume_ratio = mesh.area / mesh.volume
                if surface_to_volume_ratio > 10:  # High ratio suggests hollow
                    features["hollow_sections"] = True
                    
        except Exception as e:
            logger.warning(f"Feature detection failed: {e}")
        
        return features
    
    def _analyze_printability(self, mesh: trimesh.Trimesh) -> Dict[str, Any]:
        """Analyze how printable the mesh is"""
        try:
            printability_score = 100  # Start with perfect score
            issues = []
            warnings = []
            
            # Check mesh quality
            if not mesh.is_watertight:
                printability_score -= 30
                issues.append("Mesh is not watertight - may cause slicing issues")
            
            if not mesh.is_winding_consistent:
                printability_score -= 20
                issues.append("Inconsistent face winding detected")
            
            # Check dimensions
            bounds = mesh.bounds
            dimensions = bounds[1] - bounds[0]
            
            # Check if model fits in typical print bed (200x200x200mm)
            print_bed_size = [200, 200, 200]
            for i, (dim, limit) in enumerate(zip(dimensions, print_bed_size)):
                if dim > limit:
                    printability_score -= 15
                    axis_name = ['X', 'Y', 'Z'][i]
                    issues.append(f"Model exceeds typical printer {axis_name} limit ({dim:.1f}mm > {limit}mm)")
            
            # Check minimum feature size
            if hasattr(mesh, 'edges_unique_length'):
                min_feature = np.min(mesh.edges_unique_length)
                if min_feature < 0.4:  # 0.4mm minimum for most printers
                    printability_score -= 25
                    issues.append(f"Features smaller than 0.4mm detected (min: {min_feature:.2f}mm)")
                elif min_feature < 0.8:
                    printability_score -= 10
                    warnings.append(f"Small features detected (min: {min_feature:.2f}mm) - may not print clearly")
            
            # Check for overhangs
            features = self._detect_features(mesh)
            if features.get("overhangs"):
                printability_score -= 15
                warnings.append("Overhangs detected - supports may be required")
            
            if features.get("thin_walls"):
                printability_score -= 10
                warnings.append("Thin walls detected - may be fragile")
            
            if features.get("small_details"):
                printability_score -= 10
                warnings.append("Very small details may not print clearly")
            
            # Volume check
            if mesh.volume < 100:  # Less than 0.1 cm³
                printability_score -= 5
                warnings.append("Very small object - consider scaling up")
            
            printability_score = max(0, printability_score)
            
            # Determine printability level
            if printability_score >= 90:
                level = "excellent"
            elif printability_score >= 70:
                level = "good"
            elif printability_score >= 50:
                level = "fair"
            elif printability_score >= 30:
                level = "poor"
            else:
                level = "very_poor"
            
            return {
                "printability_score": printability_score,
                "printability_level": level,
                "issues": issues,
                "warnings": warnings,
                "supports_recommended": features.get("overhangs", False),
                "brim_recommended": features.get("small_details", False) or min(dimensions) < 10,
                "scaling_recommended": mesh.volume < 100
            }
            
        except Exception as e:
            logger.error(f"Printability analysis failed: {e}")
            return {"error": str(e)}
    
    def _analyze_cost_factors(self, mesh: trimesh.Trimesh, options: Dict) -> Dict[str, Any]:
        """Analyze factors that affect printing cost"""
        try:
            material = options.get('material', 'PLA')
            infill = options.get('infill', 20)
            quality = options.get('quality', 'standard')
            
            # Material volume calculation
            solid_volume = mesh.volume if mesh.volume > 0 else 0
            infill_volume = solid_volume * (infill / 100)
            
            # Support material estimate
            features = self._detect_features(mesh)
            support_volume = 0
            if features.get('overhangs'):
                support_volume = solid_volume * 0.15  # 15% of model volume
            
            # Material cost calculation
            material_props = self.material_properties.get(material, self.material_properties['PLA'])
            material_density = material_props['density']  # g/cm³
            
            total_volume_cm3 = (infill_volume + support_volume) / 1000  # Convert mm³ to cm³
            material_weight_g = total_volume_cm3 * material_density
            
            # Base material costs (INR per kg)
            material_costs = {
                'PLA': 800, 'ABS': 900, 'PETG': 1200, 
                'TPU': 2500, 'WOOD_PLA': 1500, 'CARBON_FIBER': 3500
            }
            
            material_cost_per_kg = material_costs.get(material, 800)
            material_cost = (material_weight_g / 1000) * material_cost_per_kg
            
            # Quality multiplier
            quality_multipliers = {'draft': 0.8, 'standard': 1.0, 'high': 1.3, 'ultra': 1.8}
            quality_multiplier = quality_multipliers.get(quality, 1.0)
            
            return {
                "material_analysis": {
                    "material": material,
                    "solid_volume_mm3": float(solid_volume),
                    "infill_volume_mm3": float(infill_volume),
                    "support_volume_mm3": float(support_volume),
                    "total_volume_cm3": float(total_volume_cm3),
                    "material_weight_g": float(material_weight_g),
                    "material_cost_inr": round(material_cost, 2)
                },
                "cost_factors": {
                    "quality_multiplier": quality_multiplier,
                    "complexity_multiplier": 1.0 + (len(mesh.vertices) / 50000),  # More vertices = more complex
                    "support_required": features.get('overhangs', False),
                    "estimated_waste_factor": 1.1  # 10% waste
                }
            }
            
        except Exception as e:
            logger.error(f"Cost analysis failed: {e}")
            return {"error": str(e)}
    
    def _estimate_print_time(self, mesh: trimesh.Trimesh, options: Dict) -> Dict[str, Any]:
        """Estimate printing time based on geometry and settings"""
        try:
            quality = options.get('quality', 'standard')
            material = options.get('material', 'PLA')
            
            profile = self.print_profiles.get(quality, self.print_profiles['standard'])
            layer_height = profile['layer_height']
            print_speed = profile['speed_mm_s']
            
            # Calculate number of layers
            bounds = mesh.bounds
            height = bounds[1][2] - bounds[0][2]  # Z dimension
            layer_count = max(1, int(height / layer_height))
            
            # Estimate print path length
            perimeter_length = self._estimate_perimeter_length(mesh)
            infill_length = self._estimate_infill_length(mesh, options.get('infill', 20))
            
            total_extrusion_length = (perimeter_length + infill_length) * layer_count
            
            # Base print time
            print_time_seconds = total_extrusion_length / print_speed
            
            # Add setup and finishing time
            setup_time = 300  # 5 minutes setup
            finishing_time = 600  # 10 minutes for cooling and removal
            
            # Material-specific adjustments
            material_props = self.material_properties.get(material, self.material_properties['PLA'])
            temp_range = material_props['temp_range']
            if temp_range[0] > 220:  # High-temp materials print slower
                print_time_seconds *= 1.2
            
            total_time_seconds = print_time_seconds + setup_time + finishing_time
            
            return {
                "time_breakdown": {
                    "setup_time_minutes": setup_time / 60,
                    "print_time_minutes": print_time_seconds / 60,
                    "finishing_time_minutes": finishing_time / 60,
                    "total_time_minutes": total_time_seconds / 60,
                    "total_time_hours": total_time_seconds / 3600
                },
                "print_parameters": {
                    "layer_count": layer_count,
                    "layer_height_mm": layer_height,
                    "estimated_perimeter_length_mm": float(perimeter_length),
                    "estimated_infill_length_mm": float(infill_length),
                    "print_speed_mm_s": print_speed
                }
            }
            
        except Exception as e:
            logger.error(f"Time estimation failed: {e}")
            return {"error": str(e)}
    
    def _estimate_perimeter_length(self, mesh: trimesh.Trimesh) -> float:
        """Estimate perimeter length per layer"""
        try:
            # Simplified: use mesh outline
            if hasattr(mesh, 'outline'):
                outline = mesh.outline()
                if hasattr(outline, 'length'):
                    return float(outline.length)
            
            # Fallback: estimate from surface area
            return float(np.sqrt(mesh.area) * 4)  # Rough approximation
            
        except:
            return float(np.sqrt(mesh.area) * 4)
    
    def _estimate_infill_length(self, mesh: trimesh.Trimesh, infill_percentage: float) -> float:
        """Estimate infill extrusion length per layer"""
        try:
            bounds = mesh.bounds
            layer_area = (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1])
            
            # Infill pattern affects length - using rectangular pattern estimate
            infill_density = infill_percentage / 100
            infill_spacing = 2.0  # 2mm spacing typical
            
            lines_per_direction = int(np.sqrt(layer_area) / infill_spacing)
            total_infill_length = lines_per_direction * np.sqrt(layer_area) * 2 * infill_density
            
            return float(total_infill_length)
            
        except:
            return 0.0
    
    def _analyze_quality_requirements(self, mesh: trimesh.Trimesh) -> Dict[str, Any]:
        """Analyze what quality settings are needed"""
        try:
            features = self._detect_features(mesh)
            
            recommended_quality = "standard"
            recommendations = []
            
            if features.get("small_details"):
                recommended_quality = "high"
                recommendations.append("High quality recommended for small details")
            
            if features.get("thin_walls"):
                if recommended_quality == "standard":
                    recommended_quality = "high"
                recommendations.append("High quality recommended for thin walls")
            
            # Check surface complexity
            if len(mesh.vertices) > 100000:
                recommended_quality = "high"
                recommendations.append("High quality recommended for complex geometry")
            
            # Layer height recommendations
            bounds = mesh.bounds
            min_dimension = np.min(bounds[1] - bounds[0])
            
            if min_dimension < 5:  # Very small objects
                layer_height = 0.1
                recommended_quality = "ultra"
            elif features.get("small_details"):
                layer_height = 0.15
            else:
                layer_height = 0.2
            
            return {
                "recommended_quality": recommended_quality,
                "recommended_layer_height": layer_height,
                "recommendations": recommendations,
                "supports_needed": features.get("overhangs", False),
                "brim_needed": features.get("small_details", False) or min_dimension < 10
            }
            
        except Exception as e:
            logger.error(f"Quality analysis failed: {e}")
            return {"error": str(e)}
    
    def _recommend_materials(self, mesh: trimesh.Trimesh, printability: Dict) -> Dict[str, Any]:
        """Recommend suitable materials based on geometry"""
        try:
            features = self._detect_features(mesh)
            bounds = mesh.bounds
            dimensions = bounds[1] - bounds[0]
            
            material_scores = {}
            
            # Score each material
            for material, props in self.material_properties.items():
                score = 100
                reasons = []
                
                # Flexibility requirements
                if features.get("thin_walls"):
                    if material == "TPU":
                        score += 20
                        reasons.append("Flexible material good for thin walls")
                    elif material in ["PLA", "PETG"]:
                        score += 10
                        reasons.append("Good balance of flexibility and rigidity")
                
                # Detail requirements
                if features.get("small_details"):
                    if material in ["PLA", "PETG"]:
                        score += 15
                        reasons.append("Good for fine details")
                    elif material == "ABS":
                        score -= 10
                        reasons.append("May not capture fine details as well")
                
                # Size considerations
                max_dimension = np.max(dimensions)
                if max_dimension > 100:  # Large objects
                    if material == "ABS":
                        score += 10
                        reasons.append("Good for large objects (less warping)")
                    elif material == "PLA":
                        score -= 5
                        reasons.append("May warp on large prints")
                
                # Strength requirements (based on volume/wall thickness)
                if mesh.volume > 50000 or features.get("thin_walls"):
                    strength_materials = ["ABS", "PETG", "CARBON_FIBER"]
                    if material in strength_materials:
                        score += 15
                        reasons.append("Good mechanical properties")
                
                # Ease of printing
                if printability.get("printability_score", 0) < 70:
                    if material == "PLA":
                        score += 20
                        reasons.append("Easiest material to print")
                    elif material == "PETG":
                        score += 10
                        reasons.append("Good balance of ease and strength")
                
                material_scores[material] = {
                    "score": max(0, min(100, score)),
                    "reasons": reasons
                }
            
            # Sort by score
            sorted_materials = sorted(material_scores.items(), key=lambda x: x[1]["score"], reverse=True)
            
            return {
                "recommended_materials": [
                    {
                        "material": material,
                        "score": data["score"],
                        "reasons": data["reasons"],
                        "properties": self.material_properties[material]
                    }
                    for material, data in sorted_materials[:3]  # Top 3
                ],
                "primary_recommendation": sorted_materials[0][0] if sorted_materials else "PLA"
            }
            
        except Exception as e:
            logger.error(f"Material analysis failed: {e}")
            return {"error": str(e)}

# Global file analysis service instance
file_analysis_service = FileAnalysisService()
