"use client";

import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import QRScannerModal from '@/components/QRScannerModal';
import { 
  QrCode, 
  Scan, 
  Package, 
  Warehouse, 
  Receipt, 
  Plus,
  ArrowLeft,
  CheckCircle,
  Download,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface QRCodeData {
  id: string;
  type: 'product' | 'project' | 'category';
  title: string;
  content: string;
  data: any;
  qrCodeUrl: string;
  createdAt: string;
  expiresAt?: string;
}

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    sku: 'MKX-MCU-ARD-UNO003',
    category: 'electronics',
    price: 24.99,
    brand: 'Arduino',
    model: 'Uno R3'
  },
  {
    id: '2',
    name: 'Raspberry Pi 4',
    sku: 'MKX-SBC-RPI-PI4002',
    category: 'electronics',
    price: 75.00,
    brand: 'Raspberry Pi Foundation',
    model: 'Pi 4 Model B'
  },
  {
    id: '3',
    name: 'NEMA 17 Stepper Motor',
    sku: 'MKX-MOT-STP-N17001',
    category: 'components',
    price: 15.99,
    brand: 'StepperOnline',
    model: 'NEMA 17'
  }
];

const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', description: 'Electronic components and modules' },
  { id: '2', name: 'Mechanical Components', slug: 'components', description: 'Mechanical parts and hardware' },
  { id: '3', name: 'Tools', slug: 'tools', description: 'Hand tools and equipment' }
];

export default function QRGeneratorDemo() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [showQRForm, setShowQRForm] = useState(false);
  
  const [qrForm, setQrForm] = useState({
    type: 'product' as const,
    title: '',
    productId: '',
    categoryId: '',
    customData: '',
    includeWarehouse: false,
    includeBilling: false,
    includeInventory: false,
    expirationDays: 0
  });

  const generateQRCode = async (data: any): Promise<string> => {
    try {
      const qrData = JSON.stringify(data);
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handleSaveQRCode = async () => {
    try {
      let qrData: any = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: qrForm.type,
        makrx_verified: true
      };

      if (qrForm.type === 'product' && qrForm.productId) {
        const product = mockProducts.find(p => p.id === qrForm.productId);
        if (product) {
          qrData = {
            ...qrData,
            product: {
              id: product.id,
              name: product.name,
              sku: product.sku,
              category: product.category,
              price: product.price,
              brand: product.brand,
              model: product.model
            },
            warehouse: qrForm.includeWarehouse,
            billing: qrForm.includeBilling,
            inventory: qrForm.includeInventory
          };
        }
      } else if (qrForm.type === 'category' && qrForm.categoryId) {
        const category = mockCategories.find(c => c.id === qrForm.categoryId);
        if (category) {
          qrData = {
            ...qrData,
            category: {
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description
            }
          };
        }
      } else if (qrForm.type === 'project') {
        qrData = {
          ...qrData,
          project: JSON.parse(qrForm.customData || '{}')
        };
      }

      const qrCodeUrl = await generateQRCode(qrData);
      
      const newQRCode: QRCodeData = {
        id: Date.now().toString(),
        type: qrForm.type,
        title: qrForm.title || `${qrForm.type.charAt(0).toUpperCase()}${qrForm.type.slice(1)} QR Code`,
        content: JSON.stringify(qrData, null, 2),
        data: qrData,
        qrCodeUrl,
        createdAt: new Date().toISOString(),
        expiresAt: qrForm.expirationDays > 0 
          ? new Date(Date.now() + qrForm.expirationDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined
      };

      setQrCodes([...qrCodes, newQRCode]);
      resetQRForm();
    } catch (error) {
      alert('Error generating QR code. Please check your data.');
    }
  };

  const resetQRForm = () => {
    setQrForm({
      type: 'product',
      title: '',
      productId: '',
      categoryId: '',
      customData: '',
      includeWarehouse: false,
      includeBilling: false,
      includeInventory: false,
      expirationDays: 0
    });
    setShowQRForm(false);
  };

  const handleDeleteQRCode = (qrId: string) => {
    if (confirm('Are you sure you want to delete this QR code?')) {
      setQrCodes(qrCodes.filter(qr => qr.id !== qrId));
    }
  };

  const downloadQRCode = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.download = `qr-${qrCode.type}-${qrCode.id}.png`;
    link.href = qrCode.qrCodeUrl;
    link.click();
  };

  const copyQRData = (qrCode: QRCodeData) => {
    navigator.clipboard.writeText(qrCode.content);
    alert('QR code data copied to clipboard!');
  };

  const handleScan = (data: any) => {
    setScannedData(data);
    setShowScanner(false);
  };

  const handleAction = (action: string) => {
    setSelectedAction(action);
    setTimeout(() => {
      alert(`${action} completed successfully!`);
      setSelectedAction('');
    }, 1500);
  };

  const resetDemo = () => {
    setScannedData(null);
    setSelectedAction('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  QR Code Generator & Scanner Demo
                </h1>
                <p className="text-gray-600 mt-1">
                  Generate and test QR codes for MakrX products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* How it Works */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How QR Code Integration Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">1. Generate QR Codes</h3>
                <p className="text-sm text-gray-600">
                  Create QR codes for products with embedded data for various use cases
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Scan className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">2. Scan QR Codes</h3>
                <p className="text-sm text-gray-600">
                  Staff scan codes using mobile devices or web interface for instant access
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">3. Automated Actions</h3>
                <p className="text-sm text-gray-600">
                  Automatically execute warehouse, billing, or inventory operations
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* QR Code Generator */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">QR Code Generator</h2>
                <button
                  onClick={() => setShowQRForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Generate QR Code
                </button>
              </div>

              {/* Generated QR Codes */}
              <div className="space-y-4">
                {qrCodes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No QR codes generated yet</p>
                    <p className="text-sm">Click "Generate QR Code" to create your first code</p>
                  </div>
                ) : (
                  qrCodes.map((qrCode) => (
                    <div key={qrCode.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <img
                            src={qrCode.qrCodeUrl}
                            alt="QR Code"
                            className="h-16 w-16 rounded border"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{qrCode.title}</h3>
                            <p className="text-sm text-gray-600">
                              Type: <span className="capitalize">{qrCode.type}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Created: {new Date(qrCode.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => downloadQRCode(qrCode)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Download QR Code"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => copyQRData(qrCode)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Copy QR Data"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQRCode(qrCode.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete QR Code"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* QR Code Scanner & Demo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">QR Code Scanner Demo</h2>
              
              {!scannedData ? (
                <div className="text-center py-8">
                  <Scan className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Test QR Scanning</h3>
                  <p className="text-gray-600 mb-6">
                    Simulate scanning a MakrX product QR code
                  </p>
                  <button
                    onClick={() => setShowScanner(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
                  >
                    <Scan className="h-5 w-5" />
                    Start QR Scanner Demo
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Scanned Product Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Scanned Product Data
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Product:</span>
                        <div className="font-medium">{scannedData.product?.name}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">SKU:</span>
                        <div className="font-medium">{scannedData.product?.sku}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Brand:</span>
                        <div className="font-medium">{scannedData.product?.brand}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Price:</span>
                        <div className="font-medium">${scannedData.product?.price}</div>
                      </div>
                    </div>
                  </div>

                  {/* Available Actions */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Available Actions</h3>
                    <div className="space-y-3">
                      
                      {scannedData.warehouse && (
                        <button
                          onClick={() => handleAction('Warehouse Bill Out')}
                          disabled={selectedAction === 'Warehouse Bill Out'}
                          className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <Warehouse className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">Warehouse Management</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Bill out component from warehouse for shipping
                          </p>
                          {selectedAction === 'Warehouse Bill Out' && (
                            <div className="mt-1 text-xs text-blue-600">Processing...</div>
                          )}
                        </button>
                      )}

                      {scannedData.billing && (
                        <button
                          onClick={() => handleAction('Billing Integration')}
                          disabled={selectedAction === 'Billing Integration'}
                          className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <Receipt className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">Billing Integration</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Create billing entry for customer order
                          </p>
                          {selectedAction === 'Billing Integration' && (
                            <div className="mt-1 text-xs text-green-600">Processing...</div>
                          )}
                        </button>
                      )}

                      {scannedData.inventory && (
                        <button
                          onClick={() => handleAction('Add to Makerspace Inventory')}
                          disabled={selectedAction === 'Add to Makerspace Inventory'}
                          className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <Plus className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-sm">Inventory Add</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Add item to makerspace inventory
                          </p>
                          {selectedAction === 'Add to Makerspace Inventory' && (
                            <div className="mt-1 text-xs text-purple-600">Processing...</div>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reset Demo */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={resetDemo}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm"
                    >
                      Reset Demo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Warehouse Operations</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bill components in/out of warehouse</li>
                  <li>• Track shipping and receiving</li>
                  <li>• Automatic inventory updates</li>
                  <li>• Real-time stock levels</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Makerspace Management</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Quick inventory additions</li>
                  <li>• Equipment checkout/check-in</li>
                  <li>• Material usage tracking</li>
                  <li>• Simplified restocking process</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Form Modal */}
      {showQRForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate QR Code</h3>
              <button onClick={resetQRForm} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={qrForm.title}
                  onChange={(e) => setQrForm({...qrForm, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="QR Code title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Type</label>
                <select
                  value={qrForm.type}
                  onChange={(e) => setQrForm({...qrForm, type: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="product">Product QR Code</option>
                  <option value="category">Category QR Code</option>
                  <option value="project">Custom Project QR Code</option>
                </select>
              </div>

              {qrForm.type === 'product' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                    <select
                      value={qrForm.productId}
                      onChange={(e) => setQrForm({...qrForm, productId: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Choose a product</option>
                      {mockProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Include Features</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={qrForm.includeWarehouse}
                          onChange={(e) => setQrForm({...qrForm, includeWarehouse: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm">Warehouse Management (Billing In/Out)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={qrForm.includeBilling}
                          onChange={(e) => setQrForm({...qrForm, includeBilling: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm">Billing Integration</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={qrForm.includeInventory}
                          onChange={(e) => setQrForm({...qrForm, includeInventory: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm">Makerspace Inventory Add</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {qrForm.type === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
                  <select
                    value={qrForm.categoryId}
                    onChange={(e) => setQrForm({...qrForm, categoryId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Choose a category</option>
                    {mockCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {qrForm.type === 'project' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Project Data (JSON format)
                  </label>
                  <textarea
                    value={qrForm.customData}
                    onChange={(e) => setQrForm({...qrForm, customData: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={6}
                    placeholder='{"project_name": "My Project", "description": "Project description", "components": []}'
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration (days, 0 = never expires)
                </label>
                <input
                  type="number"
                  min="0"
                  value={qrForm.expirationDays}
                  onChange={(e) => setQrForm({...qrForm, expirationDays: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={resetQRForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQRCode}
                disabled={
                  (qrForm.type === 'product' && !qrForm.productId) ||
                  (qrForm.type === 'category' && !qrForm.categoryId) ||
                  (qrForm.type === 'project' && !qrForm.customData)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />
    </div>
  );
}
