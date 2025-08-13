'use client';

import { useState } from 'react';
import { Ruler, Info, Download, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface SizeChart {
  category: string;
  description: string;
  units: string;
  headers: string[];
  rows: Array<{
    size: string;
    measurements: string[];
  }>;
}

interface ToleranceInfo {
  material: string;
  process: string;
  standardTolerance: string;
  tightTolerance: string;
  notes: string;
}

const sizeCharts: SizeChart[] = [
  {
    category: '3D Printing',
    description: 'Standard size capabilities for 3D printing services',
    units: 'mm',
    headers: ['Print Volume', 'Min Feature', 'Layer Height', 'Max Overhang'],
    rows: [
      { size: 'Small (FDM)', measurements: ['200×200×200', '0.4', '0.1-0.3', '45°'] },
      { size: 'Medium (FDM)', measurements: ['300×300×400', '0.4', '0.1-0.3', '45°'] },
      { size: 'Large (FDM)', measurements: ['400×400×500', '0.4', '0.1-0.3', '45°'] },
      { size: 'Small (SLA)', measurements: ['145×145×175', '0.1', '0.025-0.1', '90°'] },
      { size: 'Medium (SLA)', measurements: ['192×120×200', '0.1', '0.025-0.1', '90°'] },
      { size: 'Industrial (SLS)', measurements: ['300×300×300', '0.3', '0.06-0.12', '90°'] }
    ]
  },
  {
    category: 'CNC Machining',
    description: 'Machining capabilities and size limits',
    units: 'mm',
    headers: ['Work Area', 'Min Feature', 'Tolerance', 'Surface Finish'],
    rows: [
      { size: '3-Axis Mill', measurements: ['1000×500×500', '0.5', '±0.05', 'Ra 1.6μm'] },
      { size: '5-Axis Mill', measurements: ['600×400×400', '0.3', '±0.025', 'Ra 0.8μm'] },
      { size: 'Swiss Lathe', measurements: ['Ø32×300', '0.1', '±0.01', 'Ra 0.4μm'] },
      { size: 'Large Mill', measurements: ['2000×1000×800', '1.0', '±0.1', 'Ra 3.2μm'] }
    ]
  },
  {
    category: 'Laser Cutting',
    description: 'Laser cutting bed sizes and capabilities',
    units: 'mm',
    headers: ['Bed Size', 'Material Thickness', 'Kerf Width', 'Min Feature'],
    rows: [
      { size: 'Standard CO2', measurements: ['1220×610', '0.1-25', '0.1-0.3', '0.1'] },
      { size: 'Large CO2', measurements: ['1525×1220', '0.1-25', '0.1-0.3', '0.1'] },
      { size: 'Fiber Metal', measurements: ['1500×3000', '0.1-20', '0.05-0.2', '0.05'] },
      { size: 'Small Precision', measurements: ['300×300', '0.01-5', '0.02-0.1', '0.02'] }
    ]
  },
  {
    category: 'Sheet Metal',
    description: 'Sheet metal fabrication size limits',
    units: 'mm',
    headers: ['Sheet Size', 'Thickness Range', 'Bend Radius', 'Min Flange'],
    rows: [
      { size: 'Standard', measurements: ['2500×1250', '0.5-6', '0.5×T', '3×T'] },
      { size: 'Large Format', measurements: ['4000×2000', '1-12', '1×T', '4×T'] },
      { size: 'Precision', measurements: ['1000×1000', '0.1-3', '0.3×T', '2×T'] },
      { size: 'Heavy Gauge', measurements: ['3000×1500', '6-25', '2×T', '6×T'] }
    ]
  }
];

const toleranceInfo: ToleranceInfo[] = [
  {
    material: 'PLA (3D Print)',
    process: 'FDM',
    standardTolerance: '±0.3mm',
    tightTolerance: '±0.15mm',
    notes: 'Post-processing required for tight tolerances'
  },
  {
    material: 'ABS (3D Print)',
    process: 'FDM',
    standardTolerance: '±0.3mm',
    tightTolerance: '±0.2mm',
    notes: 'May warp on large parts'
  },
  {
    material: 'Resin (3D Print)',
    process: 'SLA',
    standardTolerance: '±0.1mm',
    tightTolerance: '±0.05mm',
    notes: 'Best surface finish, small parts only'
  },
  {
    material: 'Aluminum 6061',
    process: 'CNC',
    standardTolerance: '±0.05mm',
    tightTolerance: '±0.01mm',
    notes: 'Excellent machinability'
  },
  {
    material: 'Stainless Steel',
    process: 'CNC',
    standardTolerance: '±0.08mm',
    tightTolerance: '±0.02mm',
    notes: 'Work hardens during cutting'
  },
  {
    material: 'Acrylic',
    process: 'Laser Cut',
    standardTolerance: '±0.1mm',
    tightTolerance: '±0.05mm',
    notes: 'Clean flame-polished edges'
  },
  {
    material: 'Mild Steel',
    process: 'Sheet Metal',
    standardTolerance: '±0.2mm',
    tightTolerance: '±0.1mm',
    notes: 'Good for structural parts'
  }
];

const designTips = [
  {
    title: 'Wall Thickness Guidelines',
    content: 'Minimum wall thickness varies by material and process. 3D printing: 0.8mm for FDM, 0.4mm for SLA. CNC: 0.5mm for metals, 1mm for plastics.',
    category: 'Design'
  },
  {
    title: 'Hole Sizes and Threading',
    content: 'Use standard drill sizes for holes. Minimum hole diameter: 0.5mm for laser cutting, 1mm for CNC. Threading requires minimum M3 for 3D prints.',
    category: 'Features'
  },
  {
    title: 'Surface Finish Options',
    content: 'As-machined, bead blasted, anodized, powder coated. Each finish affects final dimensions - account for coating thickness.',
    category: 'Finishing'
  },
  {
    title: 'Draft Angles',
    content: 'Add 1-2° draft angles for injection molding. Not required for additive manufacturing or CNC but can improve surface quality.',
    category: 'Design'
  },
  {
    title: 'Fillet and Chamfer Radii',
    content: 'Minimum fillet radius: 0.5mm for CNC, 0.3mm for 3D printing. Sharp internal corners can cause stress concentrations.',
    category: 'Features'
  }
];

export default function SizeGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState('3D Printing');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const filteredTips = designTips.filter(tip =>
    tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tip.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChart = sizeCharts.find(chart => chart.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Ruler className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Size Guide & Design Specifications
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Complete reference for size limits, tolerances, and design guidelines across all our manufacturing services.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Manufacturing Processes
              </h3>
              <nav className="space-y-2">
                {sizeCharts.map((chart) => (
                  <button
                    key={chart.category}
                    onClick={() => setSelectedCategory(chart.category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === chart.category
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {chart.category}
                  </button>
                ))}
              </nav>

              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
                <div className="space-y-2 text-sm">
                  <a href="#tolerances" className="block text-blue-600 dark:text-blue-400 hover:underline">
                    Tolerance Chart
                  </a>
                  <a href="#design-tips" className="block text-blue-600 dark:text-blue-400 hover:underline">
                    Design Tips
                  </a>
                  <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <Download className="w-4 h-4" />
                    Download PDF Guide
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Size Chart */}
            {selectedChart && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedChart.category} Specifications
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    All measurements in {selectedChart.units}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {selectedChart.description}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Size/Type
                        </th>
                        {selectedChart.headers.map((header) => (
                          <th key={header} className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChart.rows.map((row, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                            {row.size}
                          </td>
                          {row.measurements.map((measurement, measureIndex) => (
                            <td key={measureIndex} className="py-3 px-4 text-gray-600 dark:text-gray-300">
                              {measurement}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Important Notes:</p>
                      <ul className="space-y-1">
                        <li>• Larger sizes may require special handling and longer lead times</li>
                        <li>• Tight tolerances may increase cost and manufacturing time</li>
                        <li>• Contact us for requirements outside these specifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tolerance Chart */}
            <div id="tolerances" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Tolerance Reference Chart
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Material</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Process</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Standard</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Tight</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toleranceInfo.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.material}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.process}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.standardTolerance}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.tightTolerance}</td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Design Tips */}
            <div id="design-tips" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Design Tips & Guidelines
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tips..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredTips.map((tip, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedTip(expandedTip === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                          {tip.category}
                        </span>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {tip.title}
                        </h3>
                      </div>
                      {expandedTip === index ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedTip === index && (
                      <div className="px-4 pb-4 text-gray-600 dark:text-gray-300 border-t dark:border-gray-600 pt-4">
                        {tip.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                Need Custom Specifications?
              </h3>
              <p className="text-blue-700 dark:text-blue-400 mb-4">
                If your project requires specifications outside our standard capabilities, 
                our engineering team can work with you to find a solution.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Contact Engineering
                </button>
                <button className="border border-blue-600 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                  Request Quote
                </button>
                <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  <Download className="w-4 h-4" />
                  Download Complete Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
