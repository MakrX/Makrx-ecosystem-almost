import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { 
  Upload,
  FileText,
  QrCode,
  Download,
  CheckCircle,
  AlertTriangle,
  X,
  Camera,
  RefreshCw,
  Package,
  Scan,
  FileSpreadsheet,
  Eye,
  AlertCircle
} from 'lucide-react';

interface InventoryItem {
  id?: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  cost: number;
  supplier?: string;
  description?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string; data?: any }>;
}

interface ImportInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (items: InventoryItem[]) => void;
}

const ImportInventoryModal: React.FC<ImportInventoryModalProps> = ({
  open,
  onOpenChange,
  onImport
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<InventoryItem[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [qrScanning, setQrScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<InventoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // CSV Template columns
  const csvTemplate = [
    'name',
    'sku',
    'category', 
    'quantity',
    'unit',
    'location',
    'cost',
    'supplier',
    'description'
  ];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      parseCsvFile(file);
    }
  }, []);

  const parseCsvFile = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const items: InventoryItem[] = [];
        const errors: Array<{ row: number; message: string; data?: any }> = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',');
          
          try {
            const item: InventoryItem = {
              name: getValue(values, headers, 'name') || '',
              sku: getValue(values, headers, 'sku') || '',
              category: getValue(values, headers, 'category') || '',
              quantity: parseInt(getValue(values, headers, 'quantity') || '0'),
              unit: getValue(values, headers, 'unit') || 'pcs',
              location: getValue(values, headers, 'location') || '',
              cost: parseFloat(getValue(values, headers, 'cost') || '0'),
              supplier: getValue(values, headers, 'supplier') || '',
              description: getValue(values, headers, 'description') || ''
            };
            
            // Validate required fields
            if (!item.name || !item.sku) {
              errors.push({
                row: i + 1,
                message: 'Missing required fields (name, sku)',
                data: item
              });
            } else {
              items.push(item);
            }
          } catch (error) {
            errors.push({
              row: i + 1,
              message: 'Invalid data format',
              data: values
            });
          }
        }
        
        setCsvData(items);
        if (errors.length > 0) {
          toast({
            title: "Import Warnings",
            description: `${errors.length} rows had issues. Check the preview for details.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "File Parse Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const getValue = (values: string[], headers: string[], field: string): string => {
    const index = headers.findIndex(h => h.includes(field));
    return index >= 0 ? values[index]?.trim().replace(/"/g, '') || '' : '';
  };

  const downloadTemplate = () => {
    const csvContent = [
      csvTemplate.join(','),
      'Sample Widget,WID-001,Electronics,50,pcs,Shelf A-1,2.50,ACME Corp,Basic electronic component',
      'Arduino Uno,ARD-UNO,Microcontrollers,25,pcs,Cabinet B-3,15.99,Arduino LLC,Development board',
      'Resistor Pack,RES-PACK,Electronics,100,pack,Drawer C-2,5.00,DigiKey,Assorted resistor values'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const startQrScanning = async () => {
    try {
      setQrScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Start QR detection
      detectQrCode();
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
      setQrScanning(false);
    }
  };

  const stopQrScanning = () => {
    setQrScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const detectQrCode = () => {
    // Simulate QR code detection
    // In a real implementation, you would use a library like jsQR
    setTimeout(() => {
      if (qrScanning && Math.random() > 0.7) {
        const mockItem: InventoryItem = {
          name: `Scanned Item ${scannedItems.length + 1}`,
          sku: `QR-${Date.now()}`,
          category: 'Scanned',
          quantity: 1,
          unit: 'pcs',
          location: 'Unknown',
          cost: 0,
          description: 'Item added via QR scan'
        };
        
        setScannedItems(prev => [...prev, mockItem]);
        toast({
          title: "QR Code Detected",
          description: `Added: ${mockItem.name}`,
        });
      }
      
      if (qrScanning) {
        detectQrCode();
      }
    }, 2000);
  };

  const handleImport = async () => {
    const itemsToImport = activeTab === 'csv' ? csvData : scannedItems;
    
    if (itemsToImport.length === 0) {
      toast({
        title: "No Items",
        description: "No items to import. Please add items first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: ImportResult = {
        success: true,
        imported: itemsToImport.length,
        skipped: 0,
        errors: []
      };
      
      setImportResult(result);
      onImport?.(itemsToImport);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${result.imported} items.`,
      });
      
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setCsvFile(null);
    setCsvData([]);
    setScannedItems([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeScannedItem = (index: number) => {
    setScannedItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Import Inventory
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                CSV Import
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Scanner
              </TabsTrigger>
            </TabsList>

            {/* CSV Import Tab */}
            <TabsContent value="csv" className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
                  <p className="text-gray-600 mb-4">
                    Upload a CSV file containing your inventory data
                  </p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={downloadTemplate}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {csvFile && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-900">{csvFile.name}</span>
                      <button onClick={clearData} className="text-blue-600 hover:text-blue-800">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CSV Preview */}
              {csvData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-medium text-gray-900">Preview ({csvData.length} items)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">SKU</th>
                          <th className="text-left p-3 font-medium">Category</th>
                          <th className="text-left p-3 font-medium">Quantity</th>
                          <th className="text-left p-3 font-medium">Location</th>
                          <th className="text-left p-3 font-medium">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvData.slice(0, 10).map((item, index) => (
                          <tr key={index}>
                            <td className="p-3">{item.name}</td>
                            <td className="p-3">{item.sku}</td>
                            <td className="p-3">{item.category}</td>
                            <td className="p-3">{item.quantity} {item.unit}</td>
                            <td className="p-3">{item.location}</td>
                            <td className="p-3">${item.cost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.length > 10 && (
                      <div className="p-3 text-center text-gray-500 text-sm border-t">
                        +{csvData.length - 10} more items...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* QR Scanner Tab */}
            <TabsContent value="qr" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scanner */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">QR Code Scanner</h3>
                    
                    {!qrScanning ? (
                      <div className="text-center py-8">
                        <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">
                          Scan QR codes on your inventory items to add them automatically
                        </p>
                        <Button onClick={startQrScanning} className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Start Scanning
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            className="w-full h-64 object-cover"
                            autoPlay
                            playsInline
                            muted
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="absolute inset-0 border-2 border-white border-dashed opacity-50"></div>
                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={stopQrScanning}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <Scan className="h-4 w-4 animate-pulse" />
                          Scanning for QR codes...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scanned Items */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-medium text-gray-900">Scanned Items ({scannedItems.length})</h3>
                    </div>
                    <div className="p-4">
                      {scannedItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No items scanned yet</p>
                          <p className="text-sm">Start scanning to see items here</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {scannedItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs text-gray-600">{item.sku} • {item.category}</p>
                              </div>
                              <button
                                onClick={() => removeScannedItem(index)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Import Result */}
          {importResult && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-900">Import Completed</h3>
              </div>
              <p className="text-green-800">
                Successfully imported {importResult.imported} items
                {importResult.skipped > 0 && `, skipped ${importResult.skipped} items`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {activeTab === 'csv' && csvData.length > 0 && (
              <>
                <FileText className="h-4 w-4" />
                {csvData.length} items ready
              </>
            )}
            {activeTab === 'qr' && scannedItems.length > 0 && (
              <>
                <QrCode className="h-4 w-4" />
                {scannedItems.length} items scanned
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={loading || (activeTab === 'csv' ? csvData.length === 0 : scannedItems.length === 0)}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Items
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportInventoryModal;
