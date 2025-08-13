import { useState } from 'react';
import { 
  Package, AlertTriangle, Edit, Trash2, Clock, MapPin, 
  ExternalLink, CheckCircle, XCircle, Eye, Minus, Plus,
  ShoppingCart, History, Shield, User
} from 'lucide-react';

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

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  status: 'active' | 'in_use' | 'damaged' | 'reserved' | 'discontinued';
  supplierType: 'makrx' | 'external';
  productCode?: string;
  makerspaceId: string;
  history: InventoryUsageLog[];
  imageUrl?: string;
  notes?: string;
  ownerUserId?: string;
  restrictedAccessLevel?: 'basic' | 'certified' | 'admin_only';
  price?: number;
  supplier?: string;
  description?: string;
}

interface InventoryCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  onIssue?: (id: string, quantity: number, reason: string) => void;
  onReorder?: (item: InventoryItem) => void;
  onViewDetails?: (item: InventoryItem) => void;
  userRole: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canIssue?: boolean;
  canReorder?: boolean;
}

export default function InventoryCard({ 
  item, 
  onEdit, 
  onDelete, 
  onIssue, 
  onReorder, 
  onViewDetails,
  userRole,
  canEdit = false,
  canDelete = false,
  canIssue = false,
  canReorder = false
}: InventoryCardProps) {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueQuantity, setIssueQuantity] = useState(1);
  const [issueReason, setIssueReason] = useState('');

  const isLowStock = item.quantity <= item.minThreshold;
  const stockPercentage = Math.min(100, (item.quantity / (item.minThreshold * 3)) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_use': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'damaged': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'reserved': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'discontinued': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'filament': return 'bg-blue-100 text-blue-800';
      case 'resin': return 'bg-purple-100 text-purple-800';
      case 'tools': return 'bg-orange-100 text-orange-800';
      case 'electronics': return 'bg-yellow-100 text-yellow-800';
      case 'materials': return 'bg-green-100 text-green-800';
      case 'machines': return 'bg-red-100 text-red-800';
      case 'components': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleIssueSubmit = () => {
    if (onIssue && issueQuantity > 0 && issueQuantity <= item.quantity) {
      onIssue(item.id, issueQuantity, issueReason);
      setShowIssueModal(false);
      setIssueQuantity(1);
      setIssueReason('');
    }
  };

  return (
    <>
      <div
        className={`makrcave-card group hover:shadow-lg transition-all duration-200 cursor-pointer ${
          isLowStock ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : ''
        }`}
        onClick={() => onViewDetails?.(item)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground group-hover:text-makrx-teal transition-colors cursor-pointer truncate"
                  onClick={() => onViewDetails?.(item)}>
                {item.name}
              </h3>
              {item.supplierType === 'makrx' && (
                <span className="px-2 py-0.5 bg-makrx-teal text-white text-xs rounded-full font-medium">
                  MakrX
                </span>
              )}
              {item.supplierType === 'external' && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  External
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
              {item.subcategory && (
                <span className="text-xs text-muted-foreground">
                  {item.subcategory}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{item.location}</span>
              {getStatusIcon(item.status)}
              <span className="capitalize">{item.status.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLowStock && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {item.restrictedAccessLevel && (
              <Shield className="w-4 h-4 text-amber-500" title="Restricted Access" />
            )}
            {item.ownerUserId && (
              <User className="w-4 h-4 text-blue-500" title="Personal Item" />
            )}
          </div>
        </div>

        {/* Quantity and Stock Level */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Stock:</span>
            <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-makrx-teal'}`}>
              {item.quantity} {item.unit}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Min Threshold:</span>
            <span className="text-muted-foreground">{item.minThreshold} {item.unit}</span>
          </div>

          {item.price && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Unit Price:</span>
              <span className="text-muted-foreground">${item.price}</span>
            </div>
          )}

          {/* Stock Level Bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Stock Level</span>
              <span>{Math.round(stockPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  isLowStock ? 'bg-red-500' : stockPercentage > 70 ? 'bg-makrx-teal' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.max(5, stockPercentage)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* External Item Warning */}
        {item.supplierType === 'external' && (
          <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
            <span className="font-medium text-amber-800 dark:text-amber-200">Quality Disclaimer:</span>
            <span className="text-amber-700 dark:text-amber-300"> MakrX cannot verify the quality of external items.</span>
          </div>
        )}

        {/* Recent Activity */}
        {item.history.length > 0 && (
          <div className="mb-4 p-2 bg-muted/50 rounded">
            <div className="text-xs text-muted-foreground mb-1">Recent Activity:</div>
            <div className="text-xs">
              {item.history[0].action === 'issue' ? '📤' : 
               item.history[0].action === 'add' ? '📥' : 
               item.history[0].action === 'restock' ? '🔄' : '📝'} 
              <span className="ml-1 capitalize">{item.history[0].action}</span>
              <span className="ml-1 text-muted-foreground">
                by {item.history[0].userName}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {canIssue && item.quantity > 0 && item.status === 'active' && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="flex-1 makrcave-btn-secondary text-sm py-2 px-3"
            >
              <Minus className="w-4 h-4 mr-2" />
              Issue
            </button>
          )}

          {canReorder && item.supplierType === 'makrx' && item.productCode && (
            <button
              onClick={() => onReorder?.(item)}
              className="flex-1 makrcave-btn-primary text-sm py-2 px-3"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Reorder
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onEdit?.(item)}
              className="makrcave-btn-secondary text-sm py-2 px-3"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Issue Item Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Issue Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={item.quantity}
                  value={issueQuantity}
                  onChange={(e) => setIssueQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {item.quantity} {item.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason/Purpose</label>
                <input
                  type="text"
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  placeholder="e.g., Project XYZ, Machine maintenance"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowIssueModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueSubmit}
                disabled={issueQuantity > item.quantity || issueQuantity < 1}
                className="flex-1 makrcave-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Issue Items
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
