"use client";

import React, { useState } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import QRScannerModal from '@/components/QRScannerModal';
import { 
  QrCode, 
  Scan, 
  Package, 
  Warehouse, 
  Receipt, 
  Plus,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

function QRDemoPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleScan = (data: any) => {
    setScannedData(data);
    setShowScanner(false);
  };

  const handleAction = (action: string) => {
    setSelectedAction(action);
    // Simulate action completion
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
                href="/admin/manage" 
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  QR Code Demo
                </h1>
                <p className="text-gray-600 mt-1">
                  Test QR code scanning and integration features
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
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
                  Create QR codes for products in the admin portal with embedded data
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Scan className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">2. Scan QR Codes</h3>
                <p className="text-sm text-gray-600">
                  Staff and managers scan codes using MakrCave mobile app or web interface
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">3. Automated Actions</h3>
                <p className="text-sm text-gray-600">
                  Automatically bill, track, or add items to inventory based on QR data
                </p>
              </div>
            </div>
          </div>

          {/* Demo Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Interactive Demo</h2>
            
            {!scannedData ? (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Test QR Scanning</h3>
                <p className="text-gray-600 mb-6">
                  Click the button below to simulate scanning a MakrX product QR code
                </p>
                <button
                  onClick={() => setShowScanner(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {scannedData.warehouse && (
                      <button
                        onClick={() => handleAction('Warehouse Bill Out')}
                        disabled={selectedAction === 'Warehouse Bill Out'}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Warehouse className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Warehouse Management</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Bill out component from warehouse for shipping to customer
                        </p>
                        {selectedAction === 'Warehouse Bill Out' && (
                          <div className="mt-2 text-sm text-blue-600">Processing...</div>
                        )}
                      </button>
                    )}

                    {scannedData.billing && (
                      <button
                        onClick={() => handleAction('Billing Integration')}
                        disabled={selectedAction === 'Billing Integration'}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Receipt className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Billing Integration</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Automatically create billing entry for customer order
                        </p>
                        {selectedAction === 'Billing Integration' && (
                          <div className="mt-2 text-sm text-green-600">Processing...</div>
                        )}
                      </button>
                    )}

                    {scannedData.inventory && (
                      <button
                        onClick={() => handleAction('Add to Makerspace Inventory')}
                        disabled={selectedAction === 'Add to Makerspace Inventory'}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Plus className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">Inventory Add</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Add item to makerspace inventory by scanning QR code
                        </p>
                        {selectedAction === 'Add to Makerspace Inventory' && (
                          <div className="mt-2 text-sm text-purple-600">Processing...</div>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Reset Demo */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={resetDemo}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Reset Demo
                  </button>
                </div>
              </div>
            )}
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

          {/* Getting Started */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Getting Started</h2>
            <div className="space-y-3 text-sm text-blue-800">
              <p>1. Go to the <Link href="/admin/manage" className="underline font-medium">Admin Management</Link> page</p>
              <p>2. Click on the "QR Codes" tab</p>
              <p>3. Click "Generate QR Code" to create QR codes for your products</p>
              <p>4. Print or display the QR codes on your products</p>
              <p>5. Use the MakrCave mobile app or web interface to scan and process items</p>
            </div>
          </div>
        </div>
      </div>

      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />
    </div>
  );
}

export default withAuth(QRDemoPage, ["admin"]);
