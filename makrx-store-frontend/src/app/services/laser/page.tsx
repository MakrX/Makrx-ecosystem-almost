"use client";

import { useState } from "react";
import {
  Upload,
  Zap,
  Layers,
  Shield,
  CheckCircle,
  Clock,
  DollarSign,
  Truck,
  Palette,
} from "lucide-react";

interface Material {
  name: string;
  description: string;
  maxThickness: string;
  pricePerSqIn: number;
  colors: string[];
  properties: string[];
}

interface ServiceType {
  name: string;
  description: string;
  icon: any;
  priceMultiplier: number;
  capabilities: string[];
}

const materials: Material[] = [
  {
    name: "Acrylic (PMMA)",
    description: "Crystal clear, colorful options, excellent edge finish",
    maxThickness: "25mm",
    pricePerSqIn: 0.15,
    colors: [
      "Clear",
      "Black",
      "White",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Orange",
    ],
    properties: [
      "Optical clarity",
      "UV resistant",
      "Easy to clean",
      "Flame polished edges",
    ],
  },
  {
    name: "Wood (Plywood)",
    description: "Natural material, great for decorative items",
    maxThickness: "20mm",
    pricePerSqIn: 0.12,
    colors: ["Natural Birch", "Natural Oak", "Natural Walnut", "Cherry"],
    properties: [
      "Eco-friendly",
      "Easy to finish",
      "Laser burns beautifully",
      "Natural grain",
    ],
  },
  {
    name: "MDF",
    description: "Smooth surface, cost-effective, paint ready",
    maxThickness: "15mm",
    pricePerSqIn: 0.08,
    colors: ["Natural", "White primer"],
    properties: [
      "Smooth surface",
      "Cost effective",
      "Paint ready",
      "Consistent density",
    ],
  },
  {
    name: "Stainless Steel",
    description: "Durable, corrosion resistant, industrial applications",
    maxThickness: "3mm",
    pricePerSqIn: 0.45,
    colors: ["Natural", "Brushed"],
    properties: [
      "Corrosion resistant",
      "High strength",
      "Food safe",
      "Heat resistant",
    ],
  },
  {
    name: "Aluminum",
    description: "Lightweight, excellent for signage and parts",
    maxThickness: "6mm",
    pricePerSqIn: 0.35,
    colors: ["Natural", "Anodized Black", "Anodized Silver"],
    properties: [
      "Lightweight",
      "Corrosion resistant",
      "Recyclable",
      "Good conductivity",
    ],
  },
  {
    name: "Cardboard/Paper",
    description: "Perfect for prototyping and packaging",
    maxThickness: "5mm",
    pricePerSqIn: 0.05,
    colors: ["Natural", "White", "Black", "Kraft"],
    properties: [
      "Eco-friendly",
      "Cost effective",
      "Easy to fold",
      "Recyclable",
    ],
  },
];

const serviceTypes: ServiceType[] = [
  {
    name: "Cutting Only",
    description: "Precise cutting without engraving",
    icon: Zap,
    priceMultiplier: 1.0,
    capabilities: [
      "Clean cuts",
      "Complex shapes",
      "Tight tolerances",
      "Smooth edges",
    ],
  },
  {
    name: "Engraving Only",
    description: "Surface engraving and marking",
    icon: Palette,
    priceMultiplier: 0.8,
    capabilities: [
      "Text engraving",
      "Logo marking",
      "Photo engraving",
      "Serial numbers",
    ],
  },
  {
    name: "Cut + Engrave",
    description: "Combined cutting and engraving service",
    icon: Layers,
    priceMultiplier: 1.4,
    capabilities: [
      "Complete projects",
      "Multiple operations",
      "Complex designs",
      "Batch processing",
    ],
  },
];

export default function LaserCuttingPage() {
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [selectedService, setSelectedService] = useState(serviceTypes[0]);
  const [selectedColor, setSelectedColor] = useState(materials[0].colors[0]);
  const [thickness, setThickness] = useState("3mm");
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
  const [quantity, setQuantity] = useState(1);
  const [dragActive, setDragActive] = useState(false);

  const area = (dimensions.width * dimensions.height) / 645.16; // Convert mm² to sq in
  const materialCost =
    area * selectedMaterial.pricePerSqIn * selectedService.priceMultiplier;
  const totalPrice = Math.round(materialCost * quantity * 100) / 100;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    console.log("Files dropped:", files);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Laser Cutting & Engraving
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              High-precision laser cutting and engraving services for a wide
              range of materials. From prototypes to production runs with
              same-day turnaround available.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Area */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Upload Your Design Files
              </h2>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your vector files here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Supported: AI, EPS, SVG, DXF, PDF, CDR (Max file size: 50MB)
                </p>
                <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Choose Files
                </button>
              </div>

              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                  Design Requirements:
                </h3>
                <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                  <li>
                    • Vector files preferred for best quality (AI, EPS, SVG,
                    DXF)
                  </li>
                  <li>
                    • Minimum feature size: 0.1mm for cutting, 0.5mm for
                    engraving
                  </li>
                  <li>
                    • Use RGB colors: Red for cutting, Black for engraving
                  </li>
                  <li>• Convert text to curves/outlines before uploading</li>
                </ul>
              </div>
            </div>

            {/* Service Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Service Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {serviceTypes.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.name}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedService.name === service.name
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="text-center">
                        <Icon className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {service.description}
                        </p>
                        <div className="space-y-1">
                          {service.capabilities
                            .slice(0, 2)
                            .map((capability) => (
                              <div
                                key={capability}
                                className="text-xs text-gray-500 dark:text-gray-400"
                              >
                                • {capability}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Material Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Material & Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {materials.map((material) => (
                  <div
                    key={material.name}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMaterial.name === material.name
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedMaterial(material);
                      setSelectedColor(material.colors[0]);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {material.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ${material.pricePerSqIn}/sq in
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {material.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Max thickness: {material.maxThickness}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {material.properties.slice(0, 2).map((prop) => (
                        <span
                          key={prop}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded"
                        >
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Color and Thickness Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color/Finish
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    {selectedMaterial.colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thickness
                  </label>
                  <select
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="1mm">1mm</option>
                    <option value="3mm">3mm</option>
                    <option value="5mm">5mm</option>
                    <option value="6mm">6mm</option>
                    <option value="10mm">10mm</option>
                    <option value="15mm">15mm</option>
                    <option value="20mm">20mm</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Instant Quote
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1220"
                      value={dimensions.width}
                      onChange={(e) =>
                        setDimensions((prev) => ({
                          ...prev,
                          width: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Height (mm)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="610"
                      value={dimensions.height}
                      onChange={(e) =>
                        setDimensions((prev) => ({
                          ...prev,
                          height: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="border-t dark:border-gray-600 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Material:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedMaterial.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Service:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedService.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Size:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {dimensions.width}×{dimensions.height}mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Thickness:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {thickness}
                    </span>
                  </div>
                </div>

                <div className="border-t dark:border-gray-600 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total Price:
                    </span>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ${totalPrice}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Based on material area, final price after file review
                  </p>
                </div>

                <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold">
                  Get Detailed Quote
                </button>

                <div className="space-y-3 pt-4 border-t dark:border-gray-600">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>Same day - 3 business days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Shield className="w-4 h-4" />
                    <span>Quality guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Rush orders available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Professional Laser Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                High Precision
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Achieve cutting tolerances of ±0.1mm with smooth, flame-polished
                edges on a wide range of materials up to 25mm thick.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-4">
                <Layers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Material Variety
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Cut and engrave wood, acrylic, metals, leather, textiles, and
                more with specialized settings for optimal results on each
                material.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Fast Turnaround
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Same-day service available for simple cuts, with most projects
                completed within 1-3 business days including complex engraving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
