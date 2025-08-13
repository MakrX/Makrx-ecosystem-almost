import { useState, useMemo, useEffect } from 'react';
import {
  Package, Plus, Search, Filter, Download, Upload, ShoppingCart,
  AlertTriangle, BarChart3, Grid, List, Calendar, Eye, Edit,
  X, Save, FileText, MapPin, Shield, ExternalLink, QrCode, Trash2
} from 'lucide-react';
import { useMakerspace } from '../contexts/MakerspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { FeatureGate } from '../components/FeatureGate';
import InventoryCard from '../components/InventoryCard';
import LowStockBanner from '../components/LowStockBanner';
import UsageTimeline from '../components/UsageTimeline';
import AddItemModal from '../components/AddItemModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
  category: 'filament' | 'resin' | 'tools' | 'electronics' | 'materials' | 'consumables' | 'machines' | 'sensors' | 'components';
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
  isScanned?: boolean;
}

export default function Inventory() {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    issueInventoryItem,
    restockInventoryItem,
    deleteInventoryItem,
    loadInventoryItems
  } = useMakerspace();
  const { user, hasPermission } = useAuth();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSupplierType, setSelectedSupplierType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Load inventory items on component mount
  useEffect(() => {
    loadInventoryItems();
  }, [loadInventoryItems]);

  // Role-based permissions based on the access matrix
  const canAddEdit = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || 
                    (user?.role === 'service_provider' && selectedItem?.ownerUserId === user?.id);
  const canIssue = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || user?.role === 'service_provider';
  const canDelete = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || 
                   (user?.role === 'service_provider' && selectedItem?.ownerUserId === user?.id);
  const canReorder = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || user?.role === 'service_provider';
  const canViewUsage = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || user?.role === 'service_provider';
  const canLinkToBOM = user?.role !== 'admin'; // All except global admin

  // Export functionality
  const exportToCSV = () => {
    const csvHeaders = [
      'Name', 'Category', 'Subcategory', 'Quantity', 'Unit', 'Min Threshold',
      'Location', 'Status', 'Supplier Type', 'Product Code', 'Price', 'Supplier', 'Description'
    ];

    const csvData = filteredInventory.map(item => [
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

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(field =>
        typeof field === 'string' && field.includes(',') ? `"${field}"` : field
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter inventory based on user role and makerspace
  const filteredInventory = useMemo(() => {
    let items = inventory as InventoryItem[];

    // Apply role-based filtering per access matrix
    if (user?.role === 'makerspace_admin' && user.assignedMakerspaces) {
      // Makerspace Admin: View own cave only
      items = items.filter(item => user.assignedMakerspaces?.includes(item.makerspaceId));
    } else if (user?.role === 'service_provider') {
      // Service Provider: View own inventory only
      items = items.filter(item => item.ownerUserId === user?.id);
    } else if (user?.role === 'maker') {
      // Maker: Read-only access to all items in their makerspace
      if (user.assignedMakerspaces) {
        items = items.filter(item => user.assignedMakerspaces?.includes(item.makerspaceId));
      }
    }
    // Super Admin sees all, Admin (Global) sees all but read-only

    // Search filtering
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filtering
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Status filtering
    if (selectedStatus !== 'all') {
      items = items.filter(item => item.status === selectedStatus);
    }

    // Supplier type filtering
    if (selectedSupplierType !== 'all') {
      items = items.filter(item => item.supplierType === selectedSupplierType);
    }

    return items;
  }, [inventory, searchTerm, selectedCategory, selectedStatus, selectedSupplierType, user]);

  // Low stock items
  const lowStockItems = filteredInventory.filter(item => 
    item.quantity <= item.minThreshold && item.status === 'active'
  );

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'filament', label: 'Filament' },
    { value: 'resin', label: 'Resin' },
    { value: 'tools', label: 'Tools' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'materials', label: 'Materials' },
    { value: 'machines', label: 'Machines' },
    { value: 'sensors', label: 'Sensors' },
    { value: 'components', label: 'Components' },
    { value: 'consumables', label: 'Consumables' },
  ];

  const handleIssueItem = async (id: string, quantity: number, reason: string) => {
    try {
      await issueInventoryItem(id, quantity, reason);
    } catch (error) {
      console.error('Failed to issue item:', error);
      // Could show a toast notification here
    }
  };

  const handleRestockItem = async (id: string, quantity: number, reason: string) => {
    try {
      await restockInventoryItem(id, quantity, reason);
    } catch (error) {
      console.error('Failed to restock item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleReorderItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowReorderModal(true);
    // In real implementation, this would open MakrX Store with the product pre-selected
    console.log('Opening MakrX Store for reorder:', item.productCode);
  };

  const ItemDetailModal = () => {
    if (!showDetailModal || !selectedItem) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground capitalize">
                    {selectedItem.category}
                  </span>
                  {selectedItem.subcategory && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{selectedItem.subcategory}</span>
                    </>
                  )}
                  {selectedItem.supplierType === 'makrx' && (
                    <span className="px-2 py-0.5 bg-makrx-teal text-white text-xs rounded-full font-medium ml-2">
                      MakrX Verified
                    </span>
                  )}
                  {selectedItem.supplierType === 'external' && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium ml-2">
                      External Item
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canDelete && (!selectedItem.ownerUserId || selectedItem.ownerUserId === user?.id) && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`)) {
                      handleDeleteItem(selectedItem.id);
                      setShowDetailModal(false);
                    }
                  }}
                  className="p-2 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Item Details */}
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Item Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Stock:</span>
                      <span className={`font-medium ${
                        selectedItem.quantity <= selectedItem.minThreshold ? 'text-red-600' : 'text-makrx-teal'
                      }`}>
                        {selectedItem.quantity} {selectedItem.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Threshold:</span>
                      <span>{selectedItem.minThreshold} {selectedItem.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedItem.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize">{selectedItem.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supplier Type:</span>
                      <span className="capitalize">{selectedItem.supplierType}</span>
                    </div>
                    {selectedItem.productCode && (
                      <div className="flex justify-between">
                        <span>Product Code:</span>
                        <span className="font-mono text-sm">{selectedItem.productCode}</span>
                      </div>
                    )}
                    {selectedItem.price && (
                      <div className="flex justify-between">
                        <span>Unit Price:</span>
                        <span>${selectedItem.price}</span>
                      </div>
                    )}
                    {selectedItem.restrictedAccessLevel && (
                      <div className="flex justify-between">
                        <span>Access Level:</span>
                        <span className="flex items-center gap-1 capitalize">
                          <Shield className="w-3 h-3 text-amber-500" />
                          {selectedItem.restrictedAccessLevel.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedItem.description && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  </div>
                )}

                {selectedItem.notes && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.notes}</p>
                  </div>
                )}

                {/* External Item Warning */}
                {selectedItem.supplierType === 'external' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-medium text-amber-800 dark:text-amber-200">Quality Disclaimer:</span>
                        <span className="text-amber-700 dark:text-amber-300"> MakrX cannot verify the quality of external items.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Timeline */}
              <div>
                {canViewUsage && selectedItem.history && selectedItem.history.length > 0 ? (
                  <UsageTimeline 
                    logs={selectedItem.history} 
                    itemName={selectedItem.name}
                    unit={selectedItem.unit}
                    maxItems={5}
                  />
                ) : (
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      {canViewUsage ? 'No usage history available' : 'Usage history restricted'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border flex gap-3 justify-end">
            {canIssue && selectedItem.quantity > 0 && selectedItem.status === 'active' && (
              <button className="makrcave-btn-secondary">
                Issue Items
              </button>
            )}
            
            {canReorder && selectedItem.supplierType === 'makrx' && selectedItem.productCode && (
              <button 
                onClick={() => handleReorderItem(selectedItem)}
                className="makrcave-btn-primary"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Reorder from MakrX Store
              </button>
            )}
            
            {canLinkToBOM && (
              <button className="makrcave-btn-secondary">
                <FileText className="w-4 h-4 mr-2" />
                Link to BOM
              </button>
            )}
            
            {canAddEdit && (
              <button className="makrcave-btn-secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </button>
            )}

            <button 
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8" />
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track materials, components, and equipment with MakrX integration
          </p>
        </div>

        <div className="flex gap-3">
          <FeatureGate featureKey="inventory.qr_scanning" fallback={null}>
            <button className="makrcave-btn-outline">
              <QrCode className="w-4 h-4" />
              Scan QR
            </button>
          </FeatureGate>

          <FeatureGate featureKey="inventory.makerspace_management" fallback={null}>
            <button className="makrcave-btn-outline">
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="makrcave-btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </FeatureGate>
        </div>
      </div>


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{filteredInventory.length}</p>
            </div>
            <Package className="w-8 h-8 text-makrx-blue" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">MakrX Verified</p>
              <p className="text-2xl font-bold text-makrx-teal">
                {filteredInventory.filter(item => item.supplierType === 'makrx').length}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-makrx-teal" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Items</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredInventory.filter(item => item.status === 'active').length}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Low Stock Banner */}
      {lowStockItems.length > 0 && (
        <LowStockBanner 
          lowStockItems={lowStockItems}
          onReorderItem={handleReorderItem}
          onViewItem={(item) => {
            setSelectedItem(item);
            setShowDetailModal(true);
          }}
        />
      )}

      {/* Inventory Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    'filament', 'resin', 'tools', 'electronics', 'materials', 'consumables'
                  ].map(category => ({
                    name: category.charAt(0).toUpperCase() + category.slice(1),
                    value: filteredInventory.filter(item => item.category === category).length,
                    color: {
                      filament: '#3B82F6',
                      resin: '#10B981',
                      tools: '#F59E0B',
                      electronics: '#8B5CF6',
                      materials: '#EF4444',
                      consumables: '#06B6D4'
                    }[category] || '#6B7280'
                  })).filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    'filament', 'resin', 'tools', 'electronics', 'materials', 'consumables'
                  ].map((category, index) => (
                    <Cell key={`cell-${index}`} fill={({
                      filament: '#3B82F6',
                      resin: '#10B981',
                      tools: '#F59E0B',
                      electronics: '#8B5CF6',
                      materials: '#EF4444',
                      consumables: '#06B6D4'
                    })[category] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Stock Status Overview
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {filteredInventory.filter(item => item.quantity > item.minThreshold).length}
                </p>
                <p className="text-sm text-green-700">Well Stocked</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {filteredInventory.filter(item => item.quantity <= item.minThreshold).length}
                </p>
                <p className="text-sm text-red-700">Low Stock</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-blue-600">
                  {filteredInventory.filter(item => item.supplierType === 'makrx').length}
                </p>
                <p className="text-xs text-gray-600">MakrX Items</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">
                  {filteredInventory.filter(item => item.supplierType === 'external').length}
                </p>
                <p className="text-xs text-gray-600">External Items</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-600">
                  {filteredInventory.filter(item => item.status === 'active').length}
                </p>
                <p className="text-xs text-gray-600">Active Items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="makrcave-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items, locations, codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border border-border rounded-lg transition-colors flex items-center gap-2 ${
              showFilters ? 'bg-makrx-teal text-white' : 'hover:bg-accent'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <div className="flex items-center gap-2 border-l border-border pl-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-makrx-teal text-white' : 'hover:bg-accent'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-makrx-teal text-white' : 'hover:bg-accent'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button className="makrcave-btn-secondary" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="in_use">In Use</option>
                <option value="damaged">Damaged</option>
                <option value="reserved">Reserved</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Supplier Type</label>
              <select
                value={selectedSupplierType}
                onChange={(e) => setSelectedSupplierType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal"
              >
                <option value="all">All Suppliers</option>
                <option value="makrx">MakrX Store</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredInventory.map((item) => (
          <InventoryCard
            key={item.id}
            item={item}
            onEdit={canAddEdit ? () => {
              setSelectedItem(item);
              setShowEditModal(true);
            } : undefined}
            onDelete={canDelete ? handleDeleteItem : undefined}
            onIssue={canIssue ? handleIssueItem : undefined}
            onReorder={canReorder ? handleReorderItem : undefined}
            onViewDetails={(item) => {
              setSelectedItem(item);
              setShowDetailModal(true);
            }}
            userRole={user?.role || 'maker'}
            canEdit={canAddEdit}
            canDelete={canDelete && (!item.ownerUserId || item.ownerUserId === user?.id)}
            canIssue={canIssue}
            canReorder={canReorder}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <div className="makrcave-card text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedSupplierType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : user?.role === 'maker' 
                ? 'No inventory items available in your makerspace'
                : 'Start by adding your first inventory item'
            }
          </p>
          <FeatureGate featureKey="inventory.makerspace_management" fallback={null}>
            <button 
              onClick={() => setShowAddModal(true)}
              className="makrcave-btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </button>
          </FeatureGate>
        </div>
      )}

      {/* Modals */}
      <ItemDetailModal />

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={(itemData) => {
            addInventoryItem(itemData);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <AddItemModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          editItem={selectedItem}
          onSubmit={(itemData) => {
            updateInventoryItem(selectedItem.id, itemData);
            setShowEditModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* MakrX Store Integration Notice */}
      {showReorderModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Reorder from MakrX Store
            </h3>
            
            <div className="space-y-4">
              <div className="bg-makrx-teal/10 p-4 rounded-lg">
                <h4 className="font-medium">{selectedItem.name}</h4>
                <p className="text-sm text-muted-foreground">Product Code: {selectedItem.productCode}</p>
                <p className="text-sm text-muted-foreground">Current Stock: {selectedItem.quantity} {selectedItem.unit}</p>
                <p className="text-sm text-muted-foreground">Min Threshold: {selectedItem.minThreshold} {selectedItem.unit}</p>
              </div>

              <p className="text-sm text-muted-foreground">
                This will open the MakrX Store with the product pre-selected. You can adjust quantities and complete the order there.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReorderModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In real implementation, this would open MakrX Store
                  window.open(`https://store.makrx.org/product/${selectedItem.productCode}`, '_blank');
                  setShowReorderModal(false);
                }}
                className="flex-1 makrcave-btn-primary"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open MakrX Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
