import { useState } from 'react';
import { 
  X, QrCode, Download, Upload, Edit, Trash2, Package, 
  ShoppingCart, AlertTriangle, CheckCircle, Printer, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: any[];
  onBulkUpdate: (items: any[], updates: any) => void;
  onBulkDelete: (itemIds: string[]) => void;
  onGenerateQR: (items: any[]) => void;
  onBulkReorder: (items: any[]) => void;
}

export default function BulkOperationsModal({ 
  isOpen, 
  onClose, 
  selectedItems,
  onBulkUpdate,
  onBulkDelete,
  onGenerateQR,
  onBulkReorder
}: BulkOperationsModalProps) {
  const { user } = useAuth();
  const [activeOperation, setActiveOperation] = useState<string>('');
  const [bulkUpdates, setBulkUpdates] = useState({
    status: '',
    location: '',
    restrictedAccessLevel: '',
    minThreshold: '',
    supplier: ''
  });

  const operations = [
    {
      id: 'qr_generate',
      title: 'Generate QR Codes',
      description: 'Create printable QR code labels for selected items',
      icon: QrCode,
      color: 'text-purple-600 bg-purple-100',
      permission: 'admin', // Only for super admin and admin
      available: selectedItems.length > 0
    },
    {
      id: 'bulk_update',
      title: 'Bulk Update',
      description: 'Update multiple items at once',
      icon: Edit,
      color: 'text-blue-600 bg-blue-100',
      permission: 'edit',
      available: selectedItems.length > 0
    },
    {
      id: 'bulk_reorder',
      title: 'Bulk Reorder',
      description: 'Reorder multiple MakrX items from store',
      icon: ShoppingCart,
      color: 'text-green-600 bg-green-100',
      permission: 'edit',
      available: selectedItems.filter(item => item.supplierType === 'makrx' && item.productCode).length > 0
    },
    {
      id: 'export_data',
      title: 'Export Data',
      description: 'Export selected items to CSV',
      icon: Download,
      color: 'text-orange-600 bg-orange-100',
      permission: 'view',
      available: selectedItems.length > 0
    },
    {
      id: 'print_labels',
      title: 'Print Labels',
      description: 'Generate printable inventory labels',
      icon: Printer,
      color: 'text-indigo-600 bg-indigo-100',
      permission: 'view',
      available: selectedItems.length > 0
    },
    {
      id: 'bulk_delete',
      title: 'Bulk Delete',
      description: 'Delete multiple items (use with caution)',
      icon: Trash2,
      color: 'text-red-600 bg-red-100',
      permission: 'delete',
      available: selectedItems.length > 0
    }
  ];

  const canPerformOperation = (operation: any) => {
    switch (operation.permission) {
      case 'admin':
        return user?.role === 'super_admin' || user?.role === 'admin';
      case 'edit':
        return user?.role === 'super_admin' || user?.role === 'makerspace_admin' || user?.role === 'service_provider';
      case 'delete':
        return user?.role === 'super_admin' || user?.role === 'makerspace_admin';
      case 'view':
      default:
        return true;
    }
  };

  const handleBulkUpdate = () => {
    const updates = Object.fromEntries(
      Object.entries(bulkUpdates).filter(([_, value]) => value !== '')
    );
    
    if (Object.keys(updates).length === 0) {
      alert('Please select at least one field to update');
      return;
    }

    onBulkUpdate(selectedItems, updates);
    setActiveOperation('');
    onClose();
  };

  const handleGenerateQR = () => {
    // Generate QR codes for all selected items
    const qrData = selectedItems.map(item => ({
      id: item.id,
      name: item.name,
      code: item.productCode || `INTERNAL-${item.id}`,
      location: item.location,
      category: item.category
    }));

    // In a real implementation, this would generate a PDF with QR codes
    console.log('Generating QR codes for:', qrData);
    
    // Mock QR code generation
    const qrWindow = window.open('', '_blank');
    qrWindow?.document.write(`
      <html>
        <head>
          <title>QR Code Labels - MakrCave</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .qr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .qr-item { border: 1px solid #ccc; padding: 15px; text-align: center; page-break-inside: avoid; }
            .qr-code { width: 120px; height: 120px; background: #f0f0f0; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; border: 2px solid #000; }
            .item-name { font-weight: bold; margin-bottom: 5px; }
            .item-details { font-size: 12px; color: #666; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>MakrCave Inventory QR Codes</h1>
          <p class="no-print">Generated on ${new Date().toLocaleDateString()} for ${selectedItems.length} items</p>
          <div class="qr-grid">
            ${qrData.map(item => `
              <div class="qr-item">
                <div class="qr-code">${item.code}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                  Location: ${item.location}<br>
                  Category: ${item.category}<br>
                  ID: ${item.id}
                </div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);

    onClose();
  };

  const handleExportData = () => {
    const csvHeaders = [
      'ID', 'Name', 'Category', 'Subcategory', 'Quantity', 'Unit', 
      'Min Threshold', 'Location', 'Status', 'Supplier Type', 
      'Product Code', 'Price', 'Supplier', 'Description'
    ];

    const csvData = selectedItems.map(item => [
      item.id,
      item.name,
      item.category,
      item.subcategory || '',
      item.quantity,
      item.unit,
      item.minThreshold,
      item.location,
      item.status,
      item.supplierType,
      item.productCode || '',
      item.price || '',
      item.supplier || '',
      item.description || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    onClose();
  };

  const renderOperationContent = () => {
    switch (activeOperation) {
      case 'bulk_update':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Bulk Update {selectedItems.length} Items</h3>
            <p className="text-sm text-muted-foreground">
              Only fill in the fields you want to update. Empty fields will be ignored.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={bulkUpdates.status}
                  onChange={(e) => setBulkUpdates({...bulkUpdates, status: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                >
                  <option value="">-- No Change --</option>
                  <option value="active">Active</option>
                  <option value="in_use">In Use</option>
                  <option value="damaged">Damaged</option>
                  <option value="reserved">Reserved</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Access Level</label>
                <select
                  value={bulkUpdates.restrictedAccessLevel}
                  onChange={(e) => setBulkUpdates({...bulkUpdates, restrictedAccessLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                >
                  <option value="">-- No Change --</option>
                  <option value="basic">Basic Access</option>
                  <option value="certified">Certified Users Only</option>
                  <option value="admin_only">Admin Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location Prefix</label>
                <input
                  type="text"
                  value={bulkUpdates.location}
                  onChange={(e) => setBulkUpdates({...bulkUpdates, location: e.target.value})}
                  placeholder="e.g., Shelf A-"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Supplier</label>
                <input
                  type="text"
                  value={bulkUpdates.supplier}
                  onChange={(e) => setBulkUpdates({...bulkUpdates, supplier: e.target.value})}
                  placeholder="e.g., New Supplier Name"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setActiveOperation('')}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                className="flex-1 makrcave-btn-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Items
              </button>
            </div>
          </div>
        );

      case 'bulk_reorder':
        const reorderableItems = selectedItems.filter(item => 
          item.supplierType === 'makrx' && item.productCode
        );
        
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Bulk Reorder from MakrX Store</h3>
            
            <div className="bg-makrx-teal/10 p-4 rounded-lg">
              <p className="text-sm mb-3">
                {reorderableItems.length} of {selectedItems.length} selected items can be reordered from MakrX Store.
              </p>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {reorderableItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        Current: {item.quantity} {item.unit} | Min: {item.minThreshold} {item.unit}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {item.productCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setActiveOperation('')}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onBulkReorder(reorderableItems);
                  onClose();
                }}
                disabled={reorderableItems.length === 0}
                className="flex-1 makrcave-btn-primary disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Open MakrX Store
              </button>
            </div>
          </div>
        );

      case 'bulk_delete':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Delete {selectedItems.length} Items</h3>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                <strong>Warning:</strong> This action cannot be undone. The following items will be permanently deleted:
              </p>
              
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedItems.map(item => (
                  <div key={item.id} className="text-sm">
                    • {item.name} ({item.quantity} {item.unit})
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setActiveOperation('')}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedItems.length} items? This cannot be undone.`)) {
                    onBulkDelete(selectedItems.map(item => item.id));
                    onClose();
                  }
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Items
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Bulk Operations ({selectedItems.length} items)
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeOperation ? (
          renderOperationContent()
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Choose an operation to perform on {selectedItems.length} selected items:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operations.map(operation => {
                const Icon = operation.icon;
                const canPerform = canPerformOperation(operation);
                const isAvailable = operation.available;
                
                return (
                  <button
                    key={operation.id}
                    onClick={() => {
                      if (operation.id === 'qr_generate') {
                        handleGenerateQR();
                      } else if (operation.id === 'export_data') {
                        handleExportData();
                      } else {
                        setActiveOperation(operation.id);
                      }
                    }}
                    disabled={!canPerform || !isAvailable}
                    className={`p-4 border border-border rounded-lg text-left hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      canPerform && isAvailable ? 'hover:border-makrx-teal' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${operation.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{operation.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {operation.description}
                        </p>
                        {!canPerform && (
                          <p className="text-xs text-red-600 mt-1">
                            Insufficient permissions
                          </p>
                        )}
                        {!isAvailable && canPerform && (
                          <p className="text-xs text-amber-600 mt-1">
                            No eligible items selected
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
