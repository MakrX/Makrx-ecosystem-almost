"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, AlertCircle, CheckCircle, Package, Scan } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: any) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Mock QR detection for demo - replace with actual QR scanner library
      simulateQRDetection();
    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const simulateQRDetection = () => {
    // Simulate scanning a QR code after 3 seconds
    setTimeout(() => {
      if (isScanning) {
        const mockQRData = {
          id: '1704067200000',
          timestamp: '2024-01-01T00:00:00.000Z',
          type: 'product',
          makrx_verified: true,
          product: {
            id: '1',
            name: 'Arduino Uno R3',
            sku: 'MKX-MCU-ARD-UNO003',
            category: 'electronics',
            price: 24.99,
            brand: 'Arduino',
            model: 'Uno R3'
          },
          warehouse: true,
          billing: true,
          inventory: true
        };
        
        setScanResult(mockQRData);
        setIsScanning(false);
        stopScanning();
      }
    }, 3000);
  };

  const handleAcceptScan = () => {
    if (scanResult) {
      onScan(scanResult);
      setScanResult(null);
      onClose();
    }
  };

  const handleNewScan = () => {
    setScanResult(null);
    setError('');
    startScanning();
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">QR Code Scanner</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isScanning && !scanResult && !error && (
          <div className="text-center py-8">
            <Scan className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Scan MakrX QR codes to access product data
            </p>
            <button
              onClick={startScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Camera className="h-4 w-4" />
              Start Scanning
            </button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white w-48 h-48 rounded-lg opacity-50"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <Scan className="h-4 w-4 animate-pulse" />
                Scanning for QR codes...
              </div>
              <button
                onClick={stopScanning}
                className="mt-3 text-gray-600 hover:text-gray-800"
              >
                Stop Scanning
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => setError('')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {scanResult && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <p className="text-green-600 font-medium mb-2">QR Code Scanned Successfully!</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Package className="h-4 w-4" />
                Product Information
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{scanResult.product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium">{scanResult.product?.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{scanResult.product?.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">${scanResult.product?.price}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Available Features:</div>
                <div className="flex flex-wrap gap-2">
                  {scanResult.warehouse && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Warehouse Management
                    </span>
                  )}
                  {scanResult.billing && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Billing Integration
                    </span>
                  )}
                  {scanResult.inventory && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      Inventory Add
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleNewScan}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Scan Another
              </button>
              <button
                onClick={handleAcceptScan}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Use This Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;
