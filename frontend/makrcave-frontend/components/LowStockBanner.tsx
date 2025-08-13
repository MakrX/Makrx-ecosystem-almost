import { AlertTriangle, ShoppingCart, Eye, X } from 'lucide-react';
import { useState } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  supplierType: 'makrx' | 'external';
  productCode?: string;
  location: string;
}

interface LowStockBannerProps {
  lowStockItems: InventoryItem[];
  onReorderItem?: (item: InventoryItem) => void;
  onViewItem?: (item: InventoryItem) => void;
  onDismiss?: () => void;
}

export default function LowStockBanner({ 
  lowStockItems, 
  onReorderItem, 
  onViewItem, 
  onDismiss 
}: LowStockBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || lowStockItems.length === 0) {
    return null;
  }

  const criticalItems = lowStockItems.filter(item => item.quantity === 0);
  const lowItems = lowStockItems.filter(item => item.quantity > 0);
  const reorderableItems = lowStockItems.filter(item => 
    item.supplierType === 'makrx' && item.productCode
  );

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="makrcave-card border-red-200 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-red-800 dark:text-red-200">
              Low Stock Alert
            </h3>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded transition-colors"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>

          <div className="space-y-3">
            {criticalItems.length > 0 && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Out of Stock ({criticalItems.length} items)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {criticalItems.slice(0, 4).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <div>
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="text-xs text-muted-foreground block">{item.location}</span>
                      </div>
                      <div className="flex gap-1">
                        {item.supplierType === 'makrx' && item.productCode && (
                          <button
                            onClick={() => onReorderItem?.(item)}
                            className="p-1 hover:bg-makrx-teal hover:text-white rounded transition-colors"
                            title="Reorder from MakrX Store"
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onViewItem?.(item)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {criticalItems.length > 4 && (
                  <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                    +{criticalItems.length - 4} more items out of stock
                  </p>
                )}
              </div>
            )}

            {lowItems.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Low Stock ({lowItems.length} items)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {lowItems.slice(0, 8).map(item => (
                    <div key={item.id} className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-gray-800 rounded text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-amber-600 dark:text-amber-400">
                        ({item.quantity} {item.unit})
                      </span>
                      {item.supplierType === 'makrx' && item.productCode && (
                        <button
                          onClick={() => onReorderItem?.(item)}
                          className="p-0.5 hover:bg-makrx-teal hover:text-white rounded transition-colors"
                          title="Reorder"
                        >
                          <ShoppingCart className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {lowItems.length > 8 && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                    +{lowItems.length - 8} more items running low
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            {reorderableItems.length > 0 && (
              <button className="makrcave-btn-primary text-sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Bulk Reorder from MakrX Store ({reorderableItems.length} items)
              </button>
            )}
            
            <button className="makrcave-btn-secondary text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Generate Low Stock Report
            </button>
          </div>

          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> Set up automatic reorder points to prevent stockouts. 
            Items marked with "MakrX" can be automatically reordered from the store.
          </div>
        </div>
      </div>
    </div>
  );
}
