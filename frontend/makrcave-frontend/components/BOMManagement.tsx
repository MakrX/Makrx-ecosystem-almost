import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Edit, 
  Trash2,
  ExternalLink,
  DollarSign,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Zap
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface BOMItem {
  id: number;
  item_type: string;
  item_id: string;
  item_name: string;
  part_code?: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  usage_notes?: string;
  alternatives?: Array<{
    item_id: string;
    item_name: string;
    part_code?: string;
    unit_cost?: number;
    availability_status: string;
    compatibility_notes?: string;
  }>;
  is_critical: boolean;
  procurement_status: string;
  availability_status: string;
  stock_level?: number;
  reorder_point?: number;
  added_by: string;
  added_at: string;
}

interface BOMManagementProps {
  projectId: string;
  bomItems: BOMItem[];
  canEdit: boolean;
  onUpdate: () => void;
}

const BOMManagement: React.FC<BOMManagementProps> = ({
  projectId,
  bomItems,
  canEdit,
  onUpdate
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<'inventory' | 'makrx_store'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newItem, setNewItem] = useState({
    item_id: '',
    item_name: '',
    part_code: '',
    quantity: 1,
    unit_cost: 0,
    usage_notes: '',
    is_critical: false,
    alternatives: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<BOMItem | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'needed': return 'bg-red-100 text-red-800 border-red-200';
      case 'ordered': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'received': return 'bg-green-100 text-green-800 border-green-200';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'needed': return <AlertTriangle className="h-3 w-3" />;
      case 'ordered': return <Clock className="h-3 w-3" />;
      case 'received': return <CheckCircle className="h-3 w-3" />;
      case 'reserved': return <Package className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory': return <Warehouse className="h-4 w-4 text-blue-600" />;
      case 'makrx_store': return <ShoppingCart className="h-4 w-4 text-green-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const searchItems = async (query: string, type: 'inventory' | 'makrx_store') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const endpoint = type === 'inventory' ? '/api/v1/inventory' : '/api/v1/makrx-store/search';
      
      const response = await fetch(`${endpoint}?search=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.items || data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching items:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.item_id || !newItem.item_name || newItem.quantity <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/bom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_type: selectedItemType,
          item_id: newItem.item_id,
          item_name: newItem.item_name,
          part_code: newItem.part_code || null,
          quantity: newItem.quantity,
          unit_cost: newItem.unit_cost || null,
          usage_notes: newItem.usage_notes || null,
          is_critical: newItem.is_critical,
          alternatives: newItem.alternatives || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add BOM item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (itemId: number, updates: Partial<BOMItem>) => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/bom/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
    } catch (err) {
      console.error('Error updating BOM item:', err);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to remove this item from the BOM?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/bom/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
    } catch (err) {
      console.error('Error deleting BOM item:', err);
    }
  };

  const resetForm = () => {
    setNewItem({
      item_id: '',
      item_name: '',
      part_code: '',
      quantity: 1,
      unit_cost: 0,
      usage_notes: '',
      is_critical: false,
      alternatives: []
    });
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  const selectSearchResult = (item: any) => {
    setNewItem({
      ...newItem,
      item_id: item.id || item.product_id,
      item_name: item.name || item.title,
      part_code: item.part_code || item.sku || '',
      unit_cost: item.price || 0
    });
    setSearchResults([]);
    setSearchQuery(item.name || item.title);
  };

  const exportBOM = () => {
    const csvContent = [
      ['Item Name', 'Type', 'Quantity', 'Unit Cost', 'Total Cost', 'Status', 'Critical', 'Notes'],
      ...bomItems.map(item => [
        item.item_name,
        item.item_type,
        item.quantity,
        item.unit_cost || 0,
        item.total_cost || 0,
        item.procurement_status,
        item.is_critical ? 'Yes' : 'No',
        item.usage_notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectId}-bom.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTotalCost = () => {
    return bomItems.reduce((total, item) => total + (item.total_cost || 0), 0);
  };

  const getCriticalItems = () => {
    return bomItems.filter(item => item.is_critical);
  };

  const getItemsByStatus = (status: string) => {
    return bomItems.filter(item => item.procurement_status === status);
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLowStockItems = () => {
    return bomItems.filter(item =>
      item.availability_status === 'low-stock' ||
      (item.stock_level && item.reorder_point && item.stock_level <= item.reorder_point)
    );
  };

  const handleReorderItem = async (item: BOMItem) => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/bom/${item.id}/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: item.quantity,
          urgent: item.is_critical
        }),
      });

      if (response.ok) {
        onUpdate();
        alert('Reorder request submitted successfully!');
      } else {
        throw new Error('Failed to submit reorder request');
      }
    } catch (err) {
      console.error('Error creating reorder request:', err);
      alert('Failed to submit reorder request');
    }
  };

  const calculateEstimatedCost = () => {
    const totalEstimatedCost = bomItems.reduce((total, item) => {
      if (item.unit_cost && item.quantity) {
        return total + (item.unit_cost * item.quantity);
      }
      return total;
    }, 0);
    return totalEstimatedCost;
  };

  const filteredItems = filterStatus === 'all' 
    ? bomItems 
    : bomItems.filter(item => item.procurement_status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bill of Materials</h3>
          <p className="text-sm text-gray-600">
            Manage project components and procurement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportBOM}>
            <Download className="h-4 w-4 mr-2" />
            Export BOM
          </Button>
          {canEdit && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* BOM Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{bomItems.length}</p>
                <p className="text-xs text-gray-600">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{getCriticalItems().length}</p>
                <p className="text-xs text-gray-600">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getItemsByStatus('received').length}</p>
                <p className="text-xs text-gray-600">Received</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{getItemsByStatus('ordered').length}</p>
                <p className="text-xs text-gray-600">Ordered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">${getTotalCost().toFixed(2)}</p>
                <p className="text-xs text-gray-600">Total Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{getLowStockItems().length}</p>
                <p className="text-xs text-gray-600">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="filter-status">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="needed">Needed</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOM Items List */}
      <Card>
        <CardHeader>
          <CardTitle>BOM Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No BOM items found</p>
              <p className="text-sm">Add components to track project materials</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(item.item_type)}
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {item.item_name}
                            {item.is_critical && (
                              <Star className="h-4 w-4 text-red-500 fill-current" title="Critical Item" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.item_type === 'inventory' ? 'Inventory Item' : 'MakrX Store'} •
                            ID: {item.item_id}
                            {item.part_code && ` • Part: ${item.part_code}`}
                          </p>
                          {item.availability_status && (
                            <Badge className={`${getAvailabilityColor(item.availability_status)} text-xs mt-1`}>
                              {item.availability_status.replace('-', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <span className="ml-1 font-medium">{item.quantity}</span>
                          {item.stock_level && (
                            <div className="text-xs text-gray-500">
                              Stock: {item.stock_level}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-600">Unit Cost:</span>
                          <span className="ml-1 font-medium">
                            {item.unit_cost ? `$${item.unit_cost.toFixed(2)}` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <span className="ml-1 font-medium">
                            {item.total_cost ? `$${item.total_cost.toFixed(2)}` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <Badge className={getStatusColor(item.procurement_status)}>
                            {getStatusIcon(item.procurement_status)}
                            {item.procurement_status}
                          </Badge>
                        </div>
                        <div>
                          {item.alternatives && item.alternatives.length > 0 && (
                            <div className="text-xs text-blue-600">
                              {item.alternatives.length} alternative(s)
                            </div>
                          )}
                        </div>
                      </div>

                      {item.usage_notes && (
                        <div className="text-sm">
                          <span className="text-gray-600">Notes:</span>
                          <span className="ml-1">{item.usage_notes}</span>
                        </div>
                      )}

                      {item.alternatives && item.alternatives.length > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-600">Alternatives:</span>
                          <div className="ml-1 space-y-1">
                            {item.alternatives.slice(0, 2).map((alt, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                <span className="font-medium">{alt.item_name}</span>
                                {alt.part_code && <span className="text-gray-500"> • {alt.part_code}</span>}
                                {alt.unit_cost && <span className="text-green-600"> • ${alt.unit_cost.toFixed(2)}</span>}
                                <Badge className={`ml-1 ${getAvailabilityColor(alt.availability_status)} text-xs`}>
                                  {alt.availability_status}
                                </Badge>
                              </div>
                            ))}
                            {item.alternatives.length > 2 && (
                              <div className="text-xs text-gray-500">+{item.alternatives.length - 2} more alternatives</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.availability_status === 'out-of-stock' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorderItem(item)}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Reorder
                        </Button>
                      )}

                      {item.item_type === 'makrx_store' && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Store
                        </Button>
                      )}
                      
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingItem(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {item.procurement_status !== 'received' && (
                              <DropdownMenuItem onClick={() => handleUpdateItem(item.id, { procurement_status: 'received' })}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Received
                              </DropdownMenuItem>
                            )}
                            {item.procurement_status === 'needed' && (
                              <DropdownMenuItem onClick={() => handleUpdateItem(item.id, { procurement_status: 'ordered' })}>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Ordered
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Item Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add BOM Item</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Estimated Total Cost Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Project BOM Estimated Cost</p>
                  <p className="text-xs text-blue-600">Total estimated cost for all BOM items</p>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  ${calculateEstimatedCost().toFixed(2)}
                </div>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <Label>Item Source</Label>
              <Select value={selectedItemType} onValueChange={(value: 'inventory' | 'makrx_store') => setSelectedItemType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4" />
                      Inventory
                    </div>
                  </SelectItem>
                  <SelectItem value="makrx_store">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      MakrX Store
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Label htmlFor="search">Search Items</Label>
              <Input
                id="search"
                placeholder={`Search ${selectedItemType === 'inventory' ? 'inventory' : 'MakrX store'}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchItems(e.target.value, selectedItemType);
                }}
                className="mt-1"
              />
              {isSearching && (
                <div className="absolute right-3 top-9">
                  <Clock className="h-4 w-4 animate-spin" />
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectSearchResult(result)}
                    >
                      <div className="font-medium">{result.name || result.title}</div>
                      <div className="text-sm text-gray-600">
                        {result.category} • ${result.price || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="part_code">Part Code / SKU (Optional)</Label>
              <Input
                id="part_code"
                placeholder="e.g., ART-001, SKU-12345"
                value={newItem.part_code}
                onChange={(e) => setNewItem({ ...newItem, part_code: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="unit_cost">Unit Cost ($)</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.unit_cost}
                  onChange={(e) => setNewItem({ ...newItem, unit_cost: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="total_cost">Est. Total</Label>
                <Input
                  id="total_cost"
                  value={`$${(newItem.quantity * (newItem.unit_cost || 0)).toFixed(2)}`}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Usage Notes</Label>
              <Textarea
                id="notes"
                placeholder="How will this item be used in the project?"
                value={newItem.usage_notes}
                onChange={(e) => setNewItem({ ...newItem, usage_notes: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="critical"
                checked={newItem.is_critical}
                onChange={(e) => setNewItem({ ...newItem, is_critical: e.target.checked })}
              />
              <Label htmlFor="critical" className="flex items-center gap-2">
                <Star className="h-4 w-4 text-red-500" />
                Mark as critical item
              </Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BOMManagement;
