"use client";

import React, { useState, useEffect } from 'react';
import { 
  Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Star, 
  FileText, Settings, BarChart3, PieChart, Calendar, Filter,
  Download, RefreshCw, Eye, Edit, Trash2, Plus, Search,
  DollarSign, Clock, CheckCircle, XCircle, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertContent } from '@/components/ui/alert';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  avgOrderValue: number;
  conversionRate: number;
  topProducts: Product[];
  recentOrders: Order[];
  lowStockProducts: Product[];
  pendingServiceOrders: ServiceOrder[];
}

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  status: string;
  category: string;
  sales: number;
  revenue: number;
  lastOrdered: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

interface ServiceOrder {
  id: string;
  customerEmail: string;
  fileName: string;
  material: string;
  status: string;
  estimatedValue: number;
  createdAt: string;
  dueDate: string;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  lifetimeValue: number;
}

const ComprehensiveStoreDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Chart data
  const revenueData = [
    { date: '2024-01-01', revenue: 12000, orders: 45 },
    { date: '2024-01-02', revenue: 15000, orders: 52 },
    { date: '2024-01-03', revenue: 18000, orders: 61 },
    { date: '2024-01-04', revenue: 14000, orders: 48 },
    { date: '2024-01-05', revenue: 22000, orders: 73 },
    { date: '2024-01-06', revenue: 19000, orders: 65 },
    { date: '2024-01-07', revenue: 25000, orders: 81 }
  ];

  const categoryData = [
    { name: '3D Printing Materials', value: 35, revenue: 45000 },
    { name: 'Tools & Equipment', value: 25, revenue: 32000 },
    { name: 'Electronics', value: 20, revenue: 28000 },
    { name: '3D Printing Services', value: 15, revenue: 22000 },
    { name: 'Accessories', value: 5, revenue: 8000 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: DashboardMetrics = {
        totalRevenue: 135000,
        totalOrders: 482,
        totalProducts: 1247,
        totalCustomers: 398,
        avgOrderValue: 280.12,
        conversionRate: 3.45,
        topProducts: [
          {
            id: 1,
            name: "Premium PLA Filament - White",
            sku: "PLA-WHT-1KG",
            price: 25.99,
            stockQty: 145,
            status: "active",
            category: "3D Printing Materials",
            sales: 89,
            revenue: 2312.11,
            lastOrdered: "2024-01-07"
          },
          {
            id: 2,
            name: "Ender 3 V2 3D Printer",
            sku: "END3V2-BLK",
            price: 199.99,
            stockQty: 12,
            status: "active",
            category: "3D Printers",
            sales: 23,
            revenue: 4599.77,
            lastOrdered: "2024-01-06"
          }
        ],
        recentOrders: [
          {
            id: "ord_123",
            orderNumber: "ORD-2024-001",
            customerEmail: "customer@example.com",
            total: 89.97,
            status: "shipped",
            createdAt: "2024-01-07T10:30:00Z",
            itemCount: 3
          }
        ],
        lowStockProducts: [
          {
            id: 3,
            name: "Carbon Fiber PETG",
            sku: "CF-PETG-1KG",
            price: 45.99,
            stockQty: 3,
            status: "active",
            category: "3D Printing Materials",
            sales: 15,
            revenue: 689.85,
            lastOrdered: "2024-01-05"
          }
        ],
        pendingServiceOrders: [
          {
            id: "svc_456",
            customerEmail: "maker@example.com",
            fileName: "phone_case.stl",
            material: "PLA",
            status: "pending_quote",
            estimatedValue: 15.50,
            createdAt: "2024-01-07T14:20:00Z",
            dueDate: "2024-01-10T00:00:00Z"
          }
        ]
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      shipped: { variant: 'default' as const, label: 'Shipped' },
      delivered: { variant: 'default' as const, label: 'Delivered' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
      pending_quote: { variant: 'secondary' as const, label: 'Pending Quote' },
      in_production: { variant: 'default' as const, label: 'In Production' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
            <p className="text-gray-600">Comprehensive store management and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{metrics?.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">+12.5% from last period</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalOrders}</p>
                  <p className="text-sm text-green-600">+8.2% from last period</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalProducts}</p>
                  <p className="text-sm text-blue-600">Active listings</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalCustomers}</p>
                  <p className="text-sm text-purple-600">Registered users</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Orders
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics?.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.total}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics?.lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-orange-600">{product.stockQty} left</p>
                          <Button size="sm" variant="outline">Restock</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Service Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Service Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics?.pendingServiceOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">{order.fileName}</p>
                          <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.estimatedValue}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Product Management Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="materials">3D Printing Materials</SelectItem>
                    <SelectItem value="printers">3D Printers</SelectItem>
                    <SelectItem value="tools">Tools & Equipment</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {/* Products Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {metrics?.topProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                product.stockQty < 10 ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {product.stockQty}
                              </span>
                              {product.stockQty < 10 && (
                                <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.sales}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(product.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management</h3>
                  <p className="text-gray-500">Comprehensive order tracking and management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>3D Printing Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Service Order Management</h3>
                  <p className="text-gray-500">Manage 3D printing service orders and provider network...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Analytics</h3>
                  <p className="text-gray-500">Customer insights and relationship management tools...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8884d8" />
                      <Bar dataKey="orders" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Conversion Rate</span>
                        <span className="text-sm text-gray-600">{metrics?.conversionRate}%</span>
                      </div>
                      <Progress value={metrics?.conversionRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Average Order Value</span>
                        <span className="text-sm text-gray-600">₹{metrics?.avgOrderValue}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Customer Satisfaction</span>
                        <span className="text-sm text-gray-600">4.8/5.0</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Inventory Turnover</span>
                        <span className="text-sm text-gray-600">8.2x</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveStoreDashboard;
