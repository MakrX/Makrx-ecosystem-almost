'use client';

import { useState } from 'react';
import { Upload, Settings, Zap, Shield, CheckCircle, Clock, DollarSign, Truck } from 'lucide-react';

interface Material {
  name: string;
  description: string;
  priceMultiplier: number;
  properties: string[];
}

interface Finish {
  name: string;
  description: string;
  additionalCost: number;
}

const materials: Material[] = [
  {
    name: 'Aluminum 6061',
    description: 'Lightweight, corrosion-resistant, excellent machinability',
    priceMultiplier: 1.0,
    properties: ['Lightweight', 'Corrosion resistant', 'Good strength', 'Easy to machine']
  },
  {
    name: 'Stainless Steel 304',
    description: 'High strength, excellent corrosion resistance',
    priceMultiplier: 1.8,
    properties: ['High strength', 'Corrosion resistant', 'Food safe', 'Magnetic']
  },
  {
    name: 'Brass',
    description: 'Excellent machinability, antimicrobial properties',
    priceMultiplier: 2.2,
    properties: ['Antimicrobial', 'Decorative', 'Good conductivity', 'Easy to machine']
  },
  {
    name: 'Delrin (POM)',
    description: 'Low friction plastic, high precision capabilities',
    priceMultiplier: 1.3,
    properties: ['Low friction', 'Chemical resistant', 'Precise dimensions', 'Food safe']
  },
  {
    name: 'PEEK',
    description: 'High-performance thermoplastic, chemical resistant',
    priceMultiplier: 5.0,
    properties: ['High temperature', 'Chemical resistant', 'Biocompatible', 'Low outgassing']
  }
];

const finishes: Finish[] = [
  { name: 'As Machined', description: 'Standard machined finish', additionalCost: 0 },
  { name: 'Bead Blasted', description: 'Uniform matte finish', additionalCost: 15 },
  { name: 'Anodized (Type II)', description: 'Corrosion protection for aluminum', additionalCost: 25 },
  { name: 'Hard Anodized (Type III)', description: 'Wear-resistant coating', additionalCost: 45 },
  { name: 'Powder Coating', description: 'Durable color finish', additionalCost: 30 },
  { name: 'Polished', description: 'Mirror-like surface finish', additionalCost: 50 }
];

export default function CNCMachiningPage() {
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [selectedFinish, setSelectedFinish] = useState(finishes[0]);
  const [quantity, setQuantity] = useState(1);
  const [dragActive, setDragActive] = useState(false);

  const basePrice = 85;
  const estimatedPrice = Math.round(basePrice * selectedMaterial.priceMultiplier * quantity + selectedFinish.additionalCost);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              CNC Machining Services
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Precision CNC machining for prototypes and production parts. From aluminum to aerospace-grade materials, 
              we deliver parts with tolerances as tight as ±0.005".
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
                Upload Your CAD Files
              </h2>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your CAD files here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Supported formats: STEP, IGES, STL, 3MF, Solidworks, Fusion 360
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Choose Files
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Design Guidelines for Best Results:
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Minimum wall thickness: 0.5mm for metals, 1mm for plastics</li>
                  <li>• Avoid deep pockets with high aspect ratios (&gt;5:1)</li>
                  <li>• Include draft angles where possible (1-2°)</li>
                  <li>• Standard hole diameters preferred for cost efficiency</li>
                </ul>
              </div>
            </div>

            {/* Material Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Select Material
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((material) => (
                  <div
                    key={material.name}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMaterial.name === material.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMaterial(material)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {material.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {material.priceMultiplier === 1.0 ? 'Base price' : `${material.priceMultiplier}x`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {material.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {material.properties.map((prop) => (
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
            </div>

            {/* Finish Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Surface Finish
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finishes.map((finish) => (
                  <div
                    key={finish.name}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedFinish.name === finish.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFinish(finish)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {finish.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {finish.description}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {finish.additionalCost === 0 ? 'Included' : `+$${finish.additionalCost}`}
                      </span>
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
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="border-t dark:border-gray-600 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Material:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedMaterial.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Finish:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedFinish.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Quantity:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {quantity} pcs
                    </span>
                  </div>
                </div>

                <div className="border-t dark:border-gray-600 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Estimated Total:
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${estimatedPrice}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Final price calculated after file analysis
                  </p>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Get Detailed Quote
                </button>

                <div className="space-y-3 pt-4 border-t dark:border-gray-600">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>3-7 business days production</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Shield className="w-4 h-4" />
                    <span>Quality guarantee included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping on orders over ₹8,300</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Why Choose Our CNC Machining?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Precision Tolerances
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Achieve tolerances as tight as ±0.005" with our state-of-the-art 5-axis CNC machines
                and rigorous quality control processes.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Material Expertise
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                From aluminum and steel to exotic alloys and high-performance plastics, 
                we have the expertise to machine your material of choice.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto mb-4">
                <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Equipment
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                5-axis CNC centers, Swiss-style lathes, and automated inspection equipment 
                ensure consistent quality and fast turnaround times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
