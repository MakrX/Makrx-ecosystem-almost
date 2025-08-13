import { useState, useRef } from 'react';
import { 
  X, Save, QrCode, Camera, Upload, AlertTriangle, 
  Package, MapPin, DollarSign, Tag, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMakerspace } from '../contexts/MakerspaceContext';

interface InventoryUsageLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'add' | 'issue' | 'restock' | 'adjust' | 'damage' | 'transfer';
  quantityBefore: number;
  quantityAfter: number;
  reason?: string;
  linkedProjectId?: string;
  linkedJobId?: string;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: any; // For editing existing items
  onSubmit: (item: any) => void;
}

export default function AddItemModal({ isOpen, onClose, editItem, onSubmit }: AddItemModalProps) {
  const { user } = useAuth();
  const { addInventoryItem, inventoryItems } = useMakerspace();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isScannedItem, setIsScannedItem] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  
  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    category: editItem?.category || 'filament',
    subcategory: editItem?.subcategory || '',
    quantity: editItem?.quantity?.toString() || '',
    unit: editItem?.unit || 'kg',
    minThreshold: editItem?.minThreshold?.toString() || editItem?.lowStockThreshold?.toString() || '',
    location: editItem?.location || '',
    status: editItem?.status || 'active',
    supplierType: editItem?.supplierType || 'external',
    productCode: editItem?.productCode || '',
    price: editItem?.price?.toString() || '',
    supplier: editItem?.supplier || '',
    description: editItem?.description || '',
    notes: editItem?.notes || '',
    restrictedAccessLevel: editItem?.restrictedAccessLevel || 'basic',
    imageUrl: editItem?.imageUrl || ''
  });

  const categories = [
    { value: 'filament', label: 'Filament', subcategories: ['PLA', 'ABS', 'PETG', 'TPU', 'Wood Fill', 'Metal Fill'] },
    { value: 'resin', label: 'Resin', subcategories: ['Standard', 'Tough', 'Flexible', 'Castable', 'Ceramic'] },
    { value: 'tools', label: 'Tools', subcategories: ['Hand Tools', 'Power Tools', 'Measuring', 'Safety'] },
    { value: 'electronics', label: 'Electronics', subcategories: ['Microcontroller', 'Sensors', 'Actuators', 'Components'] },
    { value: 'materials', label: 'Materials', subcategories: ['Wood', 'Metal', 'Plastic', 'Acrylic', 'Fabric'] },
    { value: 'machines', label: 'Machines', subcategories: ['3D Printer', 'CNC', 'Laser Cutter', 'Mill'] },
    { value: 'sensors', label: 'Sensors', subcategories: ['Temperature', 'Pressure', 'Motion', 'Light'] },
    { value: 'components', label: 'Components', subcategories: ['Fasteners', 'Bearings', 'Springs', 'Gaskets'] },
    { value: 'consumables', label: 'Consumables', subcategories: ['Adhesives', 'Lubricants', 'Cleaning', 'Safety'] }
  ];

  const units = ['kg', 'g', 'pcs', 'sheets', 'rolls', 'meters', 'liters', 'ml', 'boxes', 'sets'];
  const accessLevels = [
    { value: 'basic', label: 'Basic Access' },
    { value: 'certified', label: 'Certified Users Only' },
    { value: 'admin_only', label: 'Admin Only' }
  ];

  const getCurrentCategory = () => categories.find(cat => cat.value === formData.category);

  const handleQRScan = (qrCode: string) => {
    // Parse MakrX QR codes: MKX-{CATEGORY}-{BRAND}-{ITEM}-{VARIANTS}
    const parts = qrCode.split('-');
    if (parts.length >= 4 && parts[0] === 'MKX') {
      const categoryMap: Record<string, string> = {
        'FIL': 'filament',
        'RES': 'resin',
        'TOL': 'tools',
        'ELE': 'electronics',
        'MAT': 'materials'
      };

      const category = categoryMap[parts[1]] || 'materials';
      const brand = parts[2];
      const item = parts[3];
      const variant = parts.slice(4).join(' ');

      setFormData(prev => ({
        ...prev,
        name: `${brand} ${item} ${variant}`.trim(),
        category,
        supplierType: 'makrx',
        productCode: qrCode,
        isScanned: true
      }));
      setIsScannedItem(true);
      setShowQRScanner(false);
    } else {
      alert('Invalid MakrX QR code format. Expected: MKX-CATEGORY-BRAND-ITEM-VARIANT');
    }
  };

  const checkForDuplicates = async (name: string, sku: string) => {
    if (!name.trim()) {
      setDuplicateWarning('');
      return;
    }

    try {
      // Check against existing inventory items from context

      // Check for exact name match
      const nameMatch = inventoryItems.find(item =>
        item.name.toLowerCase() === name.toLowerCase() &&
        (!editItem || item.id !== editItem.id)
      );

      // Check for SKU match if SKU is provided
      const skuMatch = sku && inventoryItems.find(item =>
        item.sku && item.sku.toLowerCase() === sku.toLowerCase() &&
        (!editItem || item.id !== editItem.id)
      );

      if (nameMatch && skuMatch) {
        setDuplicateWarning('Both name and SKU already exist in inventory');
      } else if (nameMatch) {
        setDuplicateWarning('An item with this name already exists');
      } else if (skuMatch) {
        setDuplicateWarning('An item with this SKU already exists');
      } else {
        // Check for similar names (fuzzy matching)
        const similarItems = inventoryItems.filter(item => {
          if (editItem && item.id === editItem.id) return false;

          const similarity = calculateSimilarity(name.toLowerCase(), item.name.toLowerCase());
          return similarity > 0.7; // 70% similarity threshold
        });

        if (similarItems.length > 0) {
          setDuplicateWarning(`Similar items found: ${similarItems.map(item => item.name).join(', ')}`);
        } else {
          setDuplicateWarning('');
        }
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      setDuplicateWarning('');
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    // Simple Levenshtein distance based similarity
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;

    const distance = levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (duplicateWarning) {
      if (!confirm('This item name already exists. Continue adding anyway?')) {
        return;
      }
    }

    const newItem = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      minThreshold: parseInt(formData.minThreshold),
      price: formData.price ? parseFloat(formData.price) : undefined,
      makerspaceId: user?.assignedMakerspaces?.[0] || 'ms-1',
      history: [] as InventoryUsageLog[]
    };

    try {
      if (editItem) {
        // Call onSubmit for edit mode (handled by parent component)
        onSubmit(newItem);
      } else {
        // Use context API function for adding new item
        await addInventoryItem(newItem);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  const QRScannerModal = () => {
    if (!showQRScanner) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Scan MakrX QR Code</h3>
            <button onClick={() => setShowQRScanner(false)} className="p-1 hover:bg-accent rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="aspect-square bg-black rounded-lg mb-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-makrx-teal rounded-lg">
                <div className="w-full h-full border border-makrx-teal/50 rounded-lg m-2"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-makrx-teal animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Position the MakrX QR code within the frame
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => handleQRScan('MKX-FIL-HAT-PLA001-1.75-BLU')}
                className="w-full makrcave-btn-primary text-sm"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Demo: Scan PLA Filament
              </button>
              <button 
                onClick={() => handleQRScan('MKX-TOL-MIT-CAL001-DIG')}
                className="w-full makrcave-btn-secondary text-sm"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Demo: Scan Digital Calipers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {editItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          {!editItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <QrCode className="w-5 h-5 text-makrx-teal" />
                  <span className="font-medium text-makrx-teal">Add via QR Code</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Scan MakrX verified items for instant data population
                </p>
                <button 
                  type="button"
                  onClick={() => setShowQRScanner(true)}
                  className="makrcave-btn-primary w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </button>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-600">Bulk Import</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload multiple items via CSV file
                </p>
                <button 
                  type="button"
                  className="makrcave-btn-secondary w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Item Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData({...formData, name: newName});
                    // Check for duplicates
                    checkForDuplicates(newName, formData.sku);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal ${
                    duplicateWarning ? 'border-red-300 bg-red-50' : 'border-border'
                  }`}
                  placeholder="e.g., PLA Filament - Blue"
                />
                {duplicateWarning && (
                  <p className="text-sm text-red-600 mt-1">{duplicateWarning}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategory and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subcategory</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                >
                  <option value="">Select subcategory...</option>
                  {getCurrentCategory()?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                  placeholder="e.g., Shelf A-1, Drawer B-3"
                />
              </div>
            </div>

            {/* Quantity and Threshold */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit *</label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Min Threshold *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData({...formData, minThreshold: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                  placeholder="3"
                />
              </div>
            </div>

            {/* Supplier Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Supplier Type *</label>
                <select
                  required
                  value={formData.supplierType}
                  onChange={(e) => setFormData({...formData, supplierType: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                >
                  <option value="external">External Supplier</option>
                  <option value="makrx">MakrX Store</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Supplier Name</label>
                <input 
                  type="text" 
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                  placeholder="e.g., Hatchbox, Local Hardware"
                />
              </div>
            </div>

            {/* Product Code and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.supplierType === 'makrx' && (
                <div>
                  <label className="block text-sm font-medium mb-2">MakrX Product Code</label>
                  <input
                    type="text"
                    value={formData.productCode}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setFormData({...formData, productCode: newCode});
                      // Check for duplicates when SKU changes
                      checkForDuplicates(formData.name, newCode);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal bg-gray-50"
                    placeholder="MKX-FIL-HAT-PLA001"
                    readOnly={isScannedItem}
                  />
                  {isScannedItem && (
                    <p className="text-xs text-muted-foreground mt-1">Auto-generated from QR scan</p>
                  )}
                </div>
              )}

              <div className={formData.supplierType === 'makrx' ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium mb-2">Unit Price</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                  placeholder="25.99"
                />
              </div>
            </div>

            {/* Status and Access Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                >
                  <option value="active">Active</option>
                  <option value="in_use">In Use</option>
                  <option value="reserved">Reserved</option>
                  <option value="damaged">Damaged</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Access Level</label>
                <select
                  value={formData.restrictedAccessLevel}
                  onChange={(e) => setFormData({...formData, restrictedAccessLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                >
                  {accessLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description and Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                placeholder="Additional details about the item..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                placeholder="Internal notes, special handling instructions..."
              />
            </div>

            {/* External Item Warning */}
            {formData.supplierType === 'external' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">External Item Notice</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This item will be marked as external. A quality disclaimer will be shown: 
                      "MakrX cannot verify the quality of external items."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 makrcave-btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {editItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <QRScannerModal />
    </>
  );
}
