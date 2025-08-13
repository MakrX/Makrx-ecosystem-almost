import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Package, Palette, AlertTriangle, TrendingUp, ShoppingCart, 
  RefreshCw, Plus, Download, Upload, BarChart3, Scale,
  Zap, Target, Activity, Clock, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import FilamentTracker from '../components/FilamentTracker';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface InventorySummary {
  total_items: number;
  low_stock_items: number;
  makrx_verified_items: number;
  total_categories: number;
  total_value: number;
  recent_activities: number;
}

interface FilamentSummary {
  total_rolls: number;
  active_rolls: number;
  low_stock_rolls: number;
  empty_rolls: number;
  total_weight_remaining_g: number;
  auto_reorder_enabled_count: number;
  materials_breakdown: Record<string, number>;
  brands_breakdown: Record<string, number>;
}

const EnhancedInventory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [filamentSummary, setFilamentSummary] = useState<FilamentSummary | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Fetch inventory summary
      const inventoryResponse = await fetch('/api/v1/inventory/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch filament summary
      const filamentResponse = await fetch('/api/v1/filament/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setInventorySummary(inventoryData);
      }

      if (filamentResponse.ok) {
        const filamentData = await filamentResponse.json();
        setFilamentSummary(filamentData);
      }
    } catch (error) {
      console.error('Error fetching summary data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatWeight = (weight: number) => {
    return weight >= 1000 ? `${(weight / 1000).toFixed(1)}kg` : `${weight.toFixed(0)}g`;
  };

  const getFilamentMaterialData = () => {
    if (!filamentSummary?.materials_breakdown) return [];
    
    const colors = {
      pla: '#3B82F6',
      abs: '#10B981',
      petg: '#F59E0B',
      tpu: '#8B5CF6',
      wood_pla: '#92400E',
      carbon_fiber: '#1F2937'
    };

    return Object.entries(filamentSummary.materials_breakdown).map(([material, count]) => ({
      name: material.toUpperCase(),
      value: count,
      color: colors[material as keyof typeof colors] || '#6B7280'
    }));
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">
                  {inventorySummary?.total_items || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Filament Rolls</p>
                <p className="text-2xl font-bold">
                  {filamentSummary?.total_rolls || 0}
                </p>
              </div>
              <Palette className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {(inventorySummary?.low_stock_items || 0) + (filamentSummary?.low_stock_rolls || 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto-Reorder Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {filamentSummary?.auto_reorder_enabled_count || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Filament by Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {filamentSummary ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFilamentMaterialData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getFilamentMaterialData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Well Stocked</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {(inventorySummary?.total_items || 0) - (inventorySummary?.low_stock_items || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Low Stock</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {inventorySummary?.low_stock_items || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">MakrX Verified</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {inventorySummary?.makrx_verified_items || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filament Summary Card */}
      {filamentSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Filament Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{filamentSummary.active_rolls}</p>
                <p className="text-sm text-muted-foreground">Active Rolls</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatWeight(filamentSummary.total_weight_remaining_g)}
                </p>
                <p className="text-sm text-muted-foreground">Total Weight</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{filamentSummary.low_stock_rolls}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{filamentSummary.empty_rolls}</p>
                <p className="text-sm text-muted-foreground">Empty Rolls</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Recent activity will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8" />
            Enhanced Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete inventory management with filament tracking and auto-deduction
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchSummaryData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Quick Actions Banner */}
      {(inventorySummary?.low_stock_items || 0) + (filamentSummary?.low_stock_rolls || 0) > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">
                  {(inventorySummary?.low_stock_items || 0) + (filamentSummary?.low_stock_rolls || 0)} items need attention
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Review Low Stock
                </Button>
                <Button size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Auto-Reorder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="filament" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Filament Tracking
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            General Inventory
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="filament" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Filament Tracking</h2>
              <p className="text-muted-foreground">
                Advanced filament management with auto-deduction and reorder integration
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              Auto-Deduction Enabled
            </Badge>
          </div>
          <FilamentTracker showHeader={false} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">General Inventory</h2>
              <p className="text-muted-foreground">
                Manage tools, materials, and equipment inventory
              </p>
            </div>
          </div>
          
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">General Inventory Management</h3>
              <p className="text-muted-foreground mb-4">
                This section will contain the existing inventory management functionality
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Inventory Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Inventory Settings</h2>
              <p className="text-muted-foreground">
                Configure auto-deduction, reorder settings, and integrations
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Deduction Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable Auto-Deduction</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Default Method</span>
                  <span className="text-sm">Slicer Estimate</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Safety Buffer</span>
                  <span className="text-sm">5%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MakrX Store Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Store Sync</span>
                  <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-Reorder</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <Button className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Configure Store Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedInventory;
