import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import {
  Package, ShoppingCart, Truck, DollarSign, AlertTriangle, CheckCircle,
  Plus, Search, Filter, Eye, Edit3, Trash2, Upload, Download,
  TrendingUp, BarChart3, Factory, Users, Clock, Target,
  ArrowUp, ArrowDown, RefreshCw, ExternalLink, Zap, Award
} from 'lucide-react';

// Types
interface BOMItem {
  id: string;
  project_id?: string;
  item_name: string;
  part_code?: string;
  manufacturer_part_number?: string;
  category: string;
  quantity: number;
  unit_of_measure: string;
  unit_cost?: number;
  total_cost?: number;
  currency: string;
  primary_supplier?: string;
  supplier_rating: string;
  procurement_status: string;
  availability_status: string;
  current_stock_level: number;
  available_quantity: number;
  reorder_point: number;
  auto_reorder_enabled: boolean;
  is_critical_path: boolean;
  is_long_lead_item: boolean;
  makrx_product_code?: string;
  makrx_store_url?: string;
  alternatives?: string[];
  added_at: string;
}

interface BOMTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  version: string;
  is_public: boolean;
  is_verified: boolean;
  usage_count: number;
  estimated_cost?: number;
  complexity_level: string;
  created_by: string;
  created_at: string;
}

interface PurchaseOrder {
  id: string;
  bom_item_id: string;
  po_number?: string;
  supplier_name: string;
  quantity_ordered: number;
  unit_price?: number;
  total_amount?: number;
  status: string;
  order_date: string;
  expected_delivery?: string;
  tracking_number?: string;
}

interface DashboardStats {
  total_items: number;
  total_value: number;
  items_by_status: Record<string, number>;
  items_by_category: Record<string, number>;
  critical_path_items: number;
  items_needing_procurement: number;
  auto_reorder_items: number;
  average_lead_time?: number;
  top_suppliers: Array<{name: string; orders: number; value: number}>;
  recent_orders: Array<{po_number: string; supplier: string; value: number; date: string}>;
}

const EnhancedBOMManagement: React.FC = () => {
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [bomTemplates, setBomTemplates] = useState<BOMTemplate[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showMakrXOrder, setShowMakrXOrder] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const { toast } = useToast();

  // Form states
  const [itemForm, setItemForm] = useState({
    item_name: '',
    part_code: '',
    manufacturer_part_number: '',
    category: 'electronics',
    quantity: 1,
    unit_of_measure: 'each',
    unit_cost: '',
    primary_supplier: '',
    makrx_product_code: '',
    current_stock_level: 0,
    reorder_point: 5,
    is_critical_path: false,
    auto_reorder_enabled: false,
    usage_notes: ''
  });

  // Constants
  const componentCategories = [
    { value: 'electronics', label: 'Electronics', icon: Zap },
    { value: 'hardware', label: 'Hardware', icon: Package },
    { value: 'materials', label: 'Materials', icon: Factory },
    { value: 'fasteners', label: 'Fasteners', icon: Target },
    { value: 'connectors', label: 'Connectors', icon: Target },
    { value: 'sensors', label: 'Sensors', icon: Target },
    { value: 'tools', label: 'Tools', icon: Target },
    { value: 'consumables', label: 'Consumables', icon: Package }
  ];

  const procurementStatuses = [
    { value: 'needed', label: 'Needed', color: 'red' },
    { value: 'researching', label: 'Researching', color: 'yellow' },
    { value: 'quote_requested', label: 'Quote Requested', color: 'blue' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'ordered', label: 'Ordered', color: 'purple' },
    { value: 'received', label: 'Received', color: 'green' },
    { value: 'allocated', label: 'Allocated', color: 'orange' }
  ];

  const availabilityStatuses = [
    { value: 'in_stock', label: 'In Stock', color: 'green' },
    { value: 'low_stock', label: 'Low Stock', color: 'yellow' },
    { value: 'out_of_stock', label: 'Out of Stock', color: 'red' },
    { value: 'backordered', label: 'Backordered', color: 'orange' },
    { value: 'unknown', label: 'Unknown', color: 'gray' }
  ];

  // Fetch BOM items
  const fetchBOMItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProject) params.append('project_id', selectedProject);
      if (searchQuery) params.append('search_query', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('procurement_status', statusFilter);

      const response = await fetch(`/api/v1/enhanced-bom/items?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBomItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch BOM items:', error);
    }
  }, [selectedProject, searchQuery, categoryFilter, statusFilter]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProject) params.append('project_id', selectedProject);

      const response = await fetch(`/api/v1/enhanced-bom/dashboard/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }, [selectedProject]);

  // Create BOM item
  const createBOMItem = async () => {
    try {
      const response = await fetch('/api/v1/enhanced-bom/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...itemForm,
          project_id: selectedProject || undefined,
          quantity: parseFloat(itemForm.quantity.toString()) || 1,
          unit_cost: itemForm.unit_cost ? parseFloat(itemForm.unit_cost) : undefined,
          current_stock_level: parseInt(itemForm.current_stock_level.toString()) || 0,
          reorder_point: parseInt(itemForm.reorder_point.toString()) || 5
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "BOM item created successfully"
        });
        
        setShowAddItem(false);
        setItemForm({
          item_name: '',
          part_code: '',
          manufacturer_part_number: '',
          category: 'electronics',
          quantity: 1,
          unit_of_measure: 'each',
          unit_cost: '',
          primary_supplier: '',
          makrx_product_code: '',
          current_stock_level: 0,
          reorder_point: 5,
          is_critical_path: false,
          auto_reorder_enabled: false,
          usage_notes: ''
        });
        await fetchBOMItems();
        await fetchDashboardStats();
      } else {
        throw new Error('Failed to create BOM item');
      }
    } catch (error) {
      console.error('Failed to create BOM item:', error);
      toast({
        title: "Error",
        description: "Failed to create BOM item. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Create MakrX Store order
  const createMakrXOrder = async () => {
    try {
      const selectedBOMItems = bomItems.filter(item => selectedItems.includes(item.id));
      const items = selectedBOMItems.map(item => ({
        bom_item_id: item.id,
        makrx_product_code: item.makrx_product_code,
        quantity: item.quantity
      }));

      const response = await fetch('/api/v1/enhanced-bom/makrx-store/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items,
          project_id: selectedProject,
          priority: 'normal'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `MakrX Store order created: ${result.makrx_order_id}`,
        });
        
        setShowMakrXOrder(false);
        setSelectedItems([]);
        await fetchBOMItems();
      } else {
        throw new Error('Failed to create MakrX Store order');
      }
    } catch (error) {
      console.error('Failed to create MakrX Store order:', error);
      toast({
        title: "Error",
        description: "Failed to create MakrX Store order. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBOMItems(),
        fetchDashboardStats()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchBOMItems, fetchDashboardStats]);

  // Get status color
  const getStatusColor = (status: string, type: 'procurement' | 'availability') => {
    const statuses = type === 'procurement' ? procurementStatuses : availabilityStatuses;
    const statusInfo = statuses.find(s => s.value === status);
    return statusInfo?.color || 'gray';
  };

  // Get category info
  const getCategoryInfo = (category: string) => {
    return componentCategories.find(c => c.value === category) || componentCategories[0];
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading BOM management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">BOM Management</h1>
          <p className="text-muted-foreground">Bill of Materials with store integration and inventory tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMakrXOrder(true)} disabled={selectedItems.length === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Order from MakrX Store ({selectedItems.length})
          </Button>
          <Button onClick={() => setShowAddItem(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Project Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="project">Project:</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a project or view all items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Items</SelectItem>
                <SelectItem value="project_1">Sample Project 1</SelectItem>
                <SelectItem value="project_2">Sample Project 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{dashboardStats.total_items}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardStats.total_value)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Need Procurement</p>
                  <p className="text-2xl font-bold">{dashboardStats.items_needing_procurement}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Path</p>
                  <p className="text-2xl font-bold">{dashboardStats.critical_path_items}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">BOM Items</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* BOM Items Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items, part numbers, suppliers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {componentCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {procurementStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* BOM Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Bill of Materials</CardTitle>
              <CardDescription>Manage components, suppliers, and inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bomItems.map((item) => {
                  const categoryInfo = getCategoryInfo(item.category);
                  const CategoryIcon = categoryInfo.icon;
                  const isSelected = selectedItems.includes(item.id);
                  
                  return (
                    <Card key={item.id} className={`${isSelected ? 'ring-2 ring-blue-500' : ''} hover:shadow-md transition-shadow`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems(prev => [...prev, item.id]);
                                } else {
                                  setSelectedItems(prev => prev.filter(id => id !== item.id));
                                }
                              }}
                              className="mt-1"
                            />
                            
                            <div className="flex items-center gap-3">
                              <CategoryIcon className="h-6 w-6 text-blue-500" />
                              <div>
                                <h3 className="font-medium">{item.item_name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {item.part_code && <span>P/N: {item.part_code}</span>}
                                  {item.manufacturer_part_number && <span>MPN: {item.manufacturer_part_number}</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Quantity:</span>
                                <p className="font-medium">{item.quantity} {item.unit_of_measure}</p>
                              </div>
                              
                              <div>
                                <span className="text-muted-foreground">Unit Cost:</span>
                                <p className="font-medium">{formatCurrency(item.unit_cost)}</p>
                              </div>
                              
                              <div>
                                <span className="text-muted-foreground">Stock:</span>
                                <p className="font-medium">
                                  {item.current_stock_level}
                                  {item.current_stock_level <= item.reorder_point && (
                                    <AlertTriangle className="h-3 w-3 text-orange-500 inline ml-1" />
                                  )}
                                </p>
                              </div>
                              
                              <div>
                                <span className="text-muted-foreground">Supplier:</span>
                                <p className="font-medium">{item.primary_supplier || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className={`bg-${getStatusColor(item.procurement_status, 'procurement')}-100 text-${getStatusColor(item.procurement_status, 'procurement')}-800`}>
                                {procurementStatuses.find(s => s.value === item.procurement_status)?.label || item.procurement_status}
                              </Badge>
                              <Badge variant="outline" className={`bg-${getStatusColor(item.availability_status, 'availability')}-100 text-${getStatusColor(item.availability_status, 'availability')}-800`}>
                                {availabilityStatuses.find(s => s.value === item.availability_status)?.label || item.availability_status}
                              </Badge>
                            </div>
                            
                            {item.is_critical_path && (
                              <Badge variant="destructive">Critical</Badge>
                            )}
                            
                            {item.makrx_product_code && (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                MakrX
                              </Badge>
                            )}
                            
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              {item.makrx_store_url && (
                                <Button variant="outline" size="sm" onClick={() => window.open(item.makrx_store_url, '_blank')}>
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {(item.is_long_lead_item || item.auto_reorder_enabled) && (
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                            {item.is_long_lead_item && (
                              <div className="flex items-center gap-1 text-sm text-orange-600">
                                <Clock className="h-3 w-3" />
                                <span>Long Lead Time</span>
                              </div>
                            )}
                            {item.auto_reorder_enabled && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <RefreshCw className="h-3 w-3" />
                                <span>Auto Reorder</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                
                {bomItems.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No BOM items found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' 
                        ? 'Try adjusting your filters'
                        : 'Start by adding your first BOM item'
                      }
                    </p>
                    <Button onClick={() => setShowAddItem(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add BOM Item
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BOM Templates</CardTitle>
              <CardDescription>Reusable BOM templates for common projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">BOM Templates Coming Soon</h3>
                <p className="text-muted-foreground">
                  Create and share reusable BOM templates for faster project setup
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Track orders and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Purchase Orders</h3>
                <p className="text-muted-foreground">
                  Purchase orders will appear here when you order items
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {dashboardStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Items by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dashboardStats.items_by_category).map(([category, count]) => {
                      const categoryInfo = getCategoryInfo(category);
                      const percentage = (count / dashboardStats.total_items) * 100;
                      
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {categoryInfo.label}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{count}</span>
                            <span className="text-sm text-muted-foreground ml-2">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Procurement Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dashboardStats.items_by_status).map(([status, count]) => {
                      const statusInfo = procurementStatuses.find(s => s.value === status);
                      const percentage = (count / dashboardStats.total_items) * 100;
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`bg-${statusInfo?.color || 'gray'}-100 text-${statusInfo?.color || 'gray'}-800`}>
                              {statusInfo?.label || status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{count}</span>
                            <span className="text-sm text-muted-foreground ml-2">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Suppliers */}
          {dashboardStats && dashboardStats.top_suppliers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats.top_suppliers.map((supplier, index) => (
                    <div key={supplier.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{supplier.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(supplier.value)}</p>
                        <p className="text-sm text-muted-foreground">{supplier.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add BOM Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add BOM Item</DialogTitle>
            <DialogDescription>
              Add a new component to the bill of materials
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={itemForm.item_name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, item_name: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={itemForm.category}
                  onValueChange={(value) => setItemForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {componentCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="part_code">Part Code</Label>
                <Input
                  id="part_code"
                  value={itemForm.part_code}
                  onChange={(e) => setItemForm(prev => ({ ...prev, part_code: e.target.value }))}
                  placeholder="Internal part number"
                />
              </div>

              <div>
                <Label htmlFor="mpn">Manufacturer P/N</Label>
                <Input
                  id="mpn"
                  value={itemForm.manufacturer_part_number}
                  onChange={(e) => setItemForm(prev => ({ ...prev, manufacturer_part_number: e.target.value }))}
                  placeholder="Manufacturer part number"
                />
              </div>

              <div>
                <Label htmlFor="makrx_code">MakrX Product Code</Label>
                <Input
                  id="makrx_code"
                  value={itemForm.makrx_product_code}
                  onChange={(e) => setItemForm(prev => ({ ...prev, makrx_product_code: e.target.value }))}
                  placeholder="MakrX Store product code"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="unit_measure">Unit of Measure</Label>
                <Select
                  value={itemForm.unit_of_measure}
                  onValueChange={(value) => setItemForm(prev => ({ ...prev, unit_of_measure: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="grams">Grams</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="feet">Feet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unit_cost">Unit Cost ($)</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  value={itemForm.unit_cost}
                  onChange={(e) => setItemForm(prev => ({ ...prev, unit_cost: e.target.value }))}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Primary Supplier</Label>
                <Input
                  id="supplier"
                  value={itemForm.primary_supplier}
                  onChange={(e) => setItemForm(prev => ({ ...prev, primary_supplier: e.target.value }))}
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <Label htmlFor="stock_level">Current Stock</Label>
                <Input
                  id="stock_level"
                  type="number"
                  value={itemForm.current_stock_level}
                  onChange={(e) => setItemForm(prev => ({ ...prev, current_stock_level: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="usage_notes">Usage Notes</Label>
              <Textarea
                id="usage_notes"
                value={itemForm.usage_notes}
                onChange={(e) => setItemForm(prev => ({ ...prev, usage_notes: e.target.value }))}
                placeholder="Special instructions, compatibility notes, etc."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="critical_path"
                    checked={itemForm.is_critical_path}
                    onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, is_critical_path: checked }))}
                  />
                  <Label htmlFor="critical_path">Critical Path</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_reorder"
                    checked={itemForm.auto_reorder_enabled}
                    onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, auto_reorder_enabled: checked }))}
                  />
                  <Label htmlFor="auto_reorder">Auto Reorder</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowAddItem(false)}>
                  Cancel
                </Button>
                <Button onClick={createBOMItem} disabled={!itemForm.item_name}>
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MakrX Store Order Dialog */}
      <Dialog open={showMakrXOrder} onOpenChange={setShowMakrXOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order from MakrX Store</DialogTitle>
            <DialogDescription>
              Create an order for selected items that have MakrX Store product codes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto">
              {bomItems.filter(item => selectedItems.includes(item.id)).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} × {formatCurrency(item.unit_cost)}</p>
                    {item.makrx_product_code ? (
                      <Badge variant="default" className="bg-blue-100 text-blue-800 mt-1">
                        {item.makrx_product_code}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="mt-1">
                        No MakrX Code
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency((item.unit_cost || 0) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowMakrXOrder(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createMakrXOrder}
                disabled={!bomItems.filter(item => selectedItems.includes(item.id)).every(item => item.makrx_product_code)}
              >
                Create Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedBOMManagement;
