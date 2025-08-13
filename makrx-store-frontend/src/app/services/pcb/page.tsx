"use client";

import { useState } from "react";
import {
  Upload,
  Cpu,
  Zap,
  Shield,
  CheckCircle,
  Clock,
  DollarSign,
  Truck,
  FileText,
} from "lucide-react";

interface PCBSpec {
  layers: number;
  thickness: string;
  material: string;
  finishOptions: string[];
  priceMultiplier: number;
}

interface AssemblyOption {
  name: string;
  description: string;
  capabilities: string[];
  pricePerComponent: number;
}

const pcbSpecs: PCBSpec[] = [
  {
    layers: 2,
    thickness: "1.6mm",
    material: "FR4",
    finishOptions: ["HASL", "ENIG", "OSP"],
    priceMultiplier: 1.0,
  },
  {
    layers: 4,
    thickness: "1.6mm",
    material: "FR4",
    finishOptions: ["HASL", "ENIG", "OSP", "Hard Gold"],
    priceMultiplier: 1.8,
  },
  {
    layers: 6,
    thickness: "1.6mm",
    material: "FR4",
    finishOptions: ["ENIG", "OSP", "Hard Gold"],
    priceMultiplier: 2.5,
  },
  {
    layers: 8,
    thickness: "2.0mm",
    material: "FR4",
    finishOptions: ["ENIG", "Hard Gold"],
    priceMultiplier: 3.2,
  },
];

const assemblyOptions: AssemblyOption[] = [
  {
    name: "SMT Assembly",
    description: "Surface mount technology for compact designs",
    capabilities: [
      "0201 package size",
      "BGA, QFN, LGA",
      "Fine pitch connectors",
      "Double-sided assembly",
    ],
    pricePerComponent: 0.15,
  },
  {
    name: "Through-Hole Assembly",
    description: "Traditional through-hole component insertion",
    capabilities: [
      "Wave soldering",
      "Selective soldering",
      "Hand soldering",
      "Mixed technology",
    ],
    pricePerComponent: 0.25,
  },
  {
    name: "Mixed Assembly",
    description: "Combination of SMT and through-hole",
    capabilities: [
      "Complex boards",
      "High reliability",
      "Automotive grade",
      "Medical compliance",
    ],
    pricePerComponent: 0.2,
  },
];

export default function PCBAssemblyPage() {
  const [selectedSpec, setSelectedSpec] = useState(pcbSpecs[0]);
  const [selectedAssembly, setSelectedAssembly] = useState(assemblyOptions[0]);
  const [quantity, setQuantity] = useState(10);
  const [componentCount, setComponentCount] = useState(25);
  const [dragActive, setDragActive] = useState(false);

  const basePCBPrice = 12;
  const assemblyPrice =
    componentCount * selectedAssembly.pricePerComponent * quantity;
  const pcbPrice = basePCBPrice * selectedSpec.priceMultiplier * quantity;
  const totalPrice = Math.round(pcbPrice + assemblyPrice);

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
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Cpu className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              PCB Manufacturing & Assembly
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional PCB fabrication and assembly services. From
              prototypes to production runs, we deliver high-quality circuit
              boards with full testing and certification.
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
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your Gerber files and BOM here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Required: Gerber files, Drill files, Pick & Place, BOM
                  (Excel/CSV)
                </p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Choose Files
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-green-900 dark:text-green-300">
                      Required Files:
                    </h3>
                  </div>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• Gerber files (RS-274X format)</li>
                    <li>• Excellon drill files</li>
                    <li>• Pick and place file</li>
                    <li>• Bill of Materials (BOM)</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                      Optional Files:
                    </h3>
                  </div>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Assembly drawings</li>
                    <li>• Test procedures</li>
                    <li>• Component substitutions</li>
                    <li>• Special requirements</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* PCB Specifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                PCB Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pcbSpecs.map((spec) => (
                  <div
                    key={spec.layers}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSpec.layers === spec.layers
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedSpec(spec)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {spec.layers} Layer PCB
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {spec.priceMultiplier === 1.0
                          ? "Base price"
                          : `${spec.priceMultiplier}x`}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p>Thickness: {spec.thickness}</p>
                      <p>Material: {spec.material}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {spec.finishOptions.map((finish) => (
                          <span
                            key={finish}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                          >
                            {finish}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assembly Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Assembly Service
              </h2>
              <div className="space-y-4">
                {assemblyOptions.map((option) => (
                  <div
                    key={option.name}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAssembly.name === option.name
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedAssembly(option)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {option.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {option.description}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${option.pricePerComponent}/component
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {option.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PCB Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Components per PCB
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={componentCount}
                    onChange={(e) =>
                      setComponentCount(parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="border-t dark:border-gray-600 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      PCB Type:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedSpec.layers} Layer
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Assembly:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedAssembly.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Quantity:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {quantity} pcs
                    </span>
                  </div>
                </div>

                <div className="border-t dark:border-gray-600 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      PCB Fabrication:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${Math.round(pcbPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Assembly:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${Math.round(assemblyPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t dark:border-gray-600">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${totalPrice}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Components sourcing quoted separately
                  </p>
                </div>

                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  Request Full Quote
                </button>

                <div className="space-y-3 pt-4 border-t dark:border-gray-600">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>5-10 business days total</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Shield className="w-4 h-4" />
                    <span>IPC-A-610 Class 2/3 standards</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Functional testing included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Professional PCB Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto mb-4">
                <Cpu className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Advanced SMT Lines
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                State-of-the-art SMT assembly lines capable of 0201 components,
                BGA packages, and complex multi-layer boards.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Quality Assurance
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive testing including AOI, ICT, functional testing,
                and compliance with IPC standards and certifications.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Component Sourcing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Global component sourcing network with authorized distributors,
                ensuring genuine parts and competitive pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
