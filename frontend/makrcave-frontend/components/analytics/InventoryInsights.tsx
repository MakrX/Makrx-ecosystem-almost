import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Package, TrendingDown, AlertTriangle, Zap, DollarSign,
  RefreshCw, ShoppingCart, Warehouse, Target
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface InventoryInsights {
  top_consumed_items: Array<{
    item_id: string;
    total_consumed: number;
    total_cost: number;
  }>;
  fastest_depleting: Array<{
    item_id: string;
    consumption_rate: number;
  }>;
  reorder_alerts: Array<{
    item_id: string;
    date: string;
    ending_quantity: number;
  }>;
  consumption_trends: Array<{
    date: string;
    total_consumed: number;
    total_cost: number;
  }>;
  efficiency_score: number;
}

const InventoryInsights: React.FC = () => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<InventoryInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [alertData, setAlertData] = useState<any[]>([]);

  useEffect(() => {
    fetchInventoryInsights();
  }, []);

  const fetchInventoryInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/inventory', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data);
        processChartData(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load inventory insights",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching inventory insights:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: InventoryInsights) => {
    // Process top consumed items for chart
    const consumptionChart = data.top_consumed_items.slice(0, 10).map((item, index) => ({
      name: `Item ${index + 1}`,
      consumed: item.total_consumed,
      cost: item.total_cost,
      item_id: item.item_id
    }));
    setConsumptionData(consumptionChart);

    // Process cost breakdown
    const costChart = data.top_consumed_items.slice(0, 8).map((item, index) => ({
      name: `Item ${index + 1}`,
      value: item.total_cost,
      color: `hsl(${index * 45}, 70%, 60%)`
    }));
    setCostData(costChart);

    // Process depletion alerts
    const alertChart = data.fastest_depleting.slice(0, 10).map((item, index) => ({
      name: `Item ${index + 1}`,
      rate: item.consumption_rate,
      status: item.consumption_rate > 5 ? 'critical' : item.consumption_rate > 2 ? 'warning' : 'normal'
    }));
    setAlertData(alertChart);
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 60) return { label: 'Good', variant: 'secondary' as const };
    return { label: 'Needs Improvement', variant: 'destructive' as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading inventory insights...</span>
      </div>
    );
  }

  if (!insights) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load inventory insights. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const efficiencyBadge = getEfficiencyBadge(insights.efficiency_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Inventory Insights</h2>
        <Badge variant={efficiencyBadge.variant} className="text-sm">
          <Target className="h-3 w-3 mr-1" />
          Efficiency: {efficiencyBadge.label}
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Consumed Items</p>
                <p className="text-2xl font-bold text-blue-600">{insights.top_consumed_items.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fast Depleting</p>
                <p className="text-2xl font-bold text-red-600">{insights.fastest_depleting.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reorder Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{insights.reorder_alerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className={`text-2xl font-bold ${getEfficiencyColor(insights.efficiency_score)}`}>
                  {insights.efficiency_score.toFixed(1)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Alerts */}
      {insights.reorder_alerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <span className="font-medium">{insights.reorder_alerts.length} items</span> need restocking. 
            Review your inventory levels to avoid stockouts.
          </AlertDescription>
        </Alert>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consumed Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Consumed Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      name === 'consumed' ? 'Quantity Consumed' : 'Total Cost ($)'
                    ]}
                  />
                  <Bar dataKey="consumed" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Depletion Rate Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Depletion Rate Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} units/day`, 'Consumption Rate']} />
                  <Bar 
                    dataKey="rate" 
                    fill={(entry) => {
                      const rate = entry.rate;
                      return rate > 5 ? '#EF4444' : rate > 2 ? '#F59E0B' : '#10B981';
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Consumption Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {insights.consumption_trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={insights.consumption_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="total_consumed" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Warehouse className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No trend data available</p>
                    <p className="text-sm">Trends will appear as data accumulates</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consumed Items Details */}
        <Card>
          <CardHeader>
            <CardTitle>Consumption Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.top_consumed_items.slice(0, 8).map((item, index) => (
                <div key={item.item_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Item {index + 1}</p>
                      <p className="text-sm text-gray-500">{item.total_consumed.toFixed(2)} units consumed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${item.total_cost.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Total cost</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reorder Alerts Details */}
        <Card>
          <CardHeader>
            <CardTitle>Reorder Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.reorder_alerts.length > 0 ? (
                insights.reorder_alerts.slice(0, 8).map((alert, index) => (
                  <div key={alert.item_id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Item Alert {index + 1}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(alert.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600">{alert.ending_quantity} units</p>
                      <p className="text-sm text-gray-500">Remaining</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No reorder alerts</p>
                  <p className="text-sm">All inventory levels are healthy</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Optimize Stock Levels</h4>
              </div>
              <p className="text-sm text-blue-800">
                Review consumption patterns to adjust minimum stock thresholds for frequently used items.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Cost Optimization</h4>
              </div>
              <p className="text-sm text-green-800">
                Consider bulk purchasing for high-consumption items to reduce per-unit costs.
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">Alert Management</h4>
              </div>
              <p className="text-sm text-orange-800">
                Set up automated reorder notifications for critical inventory items.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryInsights;
