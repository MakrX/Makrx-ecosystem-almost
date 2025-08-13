import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import {
  DollarSign, TrendingUp, CreditCard, Users, Store, Wallet,
  RefreshCw, Calendar, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface RevenueAnalytics {
  total_revenue: number;
  revenue_by_source: Record<string, number>;
  monthly_trends: Array<{
    year: number;
    month: number;
    total: number;
  }>;
  payment_methods: Record<string, number>;
  subscription_revenue: number;
  credit_sales: number;
  store_revenue: number;
}

const RevenueCharts: React.FC = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('6m');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, []);

  const fetchRevenueAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/revenue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        processChartData(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load revenue analytics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load revenue analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: RevenueAnalytics) => {
    // Monthly trend data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const trendChart = data.monthly_trends.map(trend => ({
      month: `${monthNames[trend.month - 1]} ${trend.year}`,
      revenue: trend.total,
      year: trend.year,
      monthNum: trend.month
    }));
    setTrendData(trendChart);

    // Revenue by source
    const sourceChart = Object.entries(data.revenue_by_source).map(([source, amount]) => ({
      name: source.charAt(0).toUpperCase() + source.slice(1),
      value: amount,
      color: getSourceColor(source)
    })).filter(item => item.value > 0);
    setSourceData(sourceChart);

    // Payment methods
    const paymentChart = Object.entries(data.payment_methods).map(([method, amount]) => ({
      name: method ? method.charAt(0).toUpperCase() + method.slice(1) : 'Unknown',
      value: amount,
      color: getPaymentColor(method)
    })).filter(item => item.value > 0);
    setPaymentData(paymentChart);

    // Growth calculation
    const growthChart = trendChart.map((item, index) => {
      const previousRevenue = index > 0 ? trendChart[index - 1].revenue : item.revenue;
      const growth = previousRevenue > 0 ? ((item.revenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      return {
        ...item,
        growth: growth,
        cumulative: trendChart.slice(0, index + 1).reduce((sum, t) => sum + t.revenue, 0)
      };
    });
    setGrowthData(growthChart);
  };

  const getSourceColor = (source: string) => {
    const colors = {
      membership: '#3B82F6',
      credits: '#10B981',
      store: '#F59E0B',
      service: '#8B5CF6',
      equipment_rental: '#EF4444',
      training: '#06B6D4'
    };
    return colors[source as keyof typeof colors] || '#6B7280';
  };

  const getPaymentColor = (method: string) => {
    const colors = {
      razorpay: '#528DD4',
      stripe: '#635BFF',
      cash: '#10B981',
      bank: '#F59E0B'
    };
    return colors[method as keyof typeof colors] || '#6B7280';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentMonthRevenue = () => {
    if (!analytics || analytics.monthly_trends.length === 0) return 0;
    return analytics.monthly_trends[analytics.monthly_trends.length - 1]?.total || 0;
  };

  const getPreviousMonthRevenue = () => {
    if (!analytics || analytics.monthly_trends.length < 2) return 0;
    return analytics.monthly_trends[analytics.monthly_trends.length - 2]?.total || 0;
  };

  const getGrowthRate = () => {
    const current = getCurrentMonthRevenue();
    const previous = getPreviousMonthRevenue();
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading revenue analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          No revenue data available. Revenue analytics will appear once transactions are recorded.
        </AlertDescription>
      </Alert>
    );
  }

  const growthRate = getGrowthRate();
  const isPositiveGrowth = growthRate >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Revenue Analytics</h2>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isPositiveGrowth ? "default" : "destructive"} 
            className="text-sm"
          >
            {isPositiveGrowth ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(growthRate).toFixed(1)}% MoM
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.total_revenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analytics.subscription_revenue)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Sales</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analytics.credit_sales)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Store Revenue</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(analytics.store_revenue)}
                </p>
              </div>
              <Store className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Alert className={`${isPositiveGrowth ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <TrendingUp className={`h-4 w-4 ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`} />
        <AlertDescription className={isPositiveGrowth ? 'text-green-800' : 'text-red-800'}>
          <span className="font-medium">Revenue Trend:</span> 
          {` ${Math.abs(growthRate).toFixed(1)}% ${isPositiveGrowth ? 'increase' : 'decrease'} from last month. `}
          Current month revenue: {formatCurrency(getCurrentMonthRevenue())}
        </AlertDescription>
      </Alert>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Trends</CardTitle>
            <div className="flex gap-2">
              {(['3m', '6m', '1y'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === '3m' ? '3 Months' : period === '6m' ? '6 Months' : '1 Year'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData.slice(-parseInt(selectedPeriod))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : `${Number(value).toFixed(1)}%`,
                    name === 'revenue' ? 'Revenue' : 'Growth %'
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="growth"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      percent > 5 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Bar dataKey="value">
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources Details */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sourceData.map((source, index) => {
                const percentage = (source.value / analytics.total_revenue) * 100;
                return (
                  <div key={source.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{source.name}</p>
                        <p className="text-sm text-gray-500">{percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(source.value)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthly_trends.slice(-6).reverse().map((month, index) => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthName = `${monthNames[month.month - 1]} ${month.year}`;
                const isCurrentMonth = index === 0;
                
                return (
                  <div key={`${month.year}-${month.month}`} 
                       className={`flex items-center justify-between p-3 rounded-lg ${
                         isCurrentMonth ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                       }`}>
                    <div className="flex items-center gap-3">
                      <Calendar className={`h-5 w-5 ${isCurrentMonth ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div>
                        <p className={`font-medium ${isCurrentMonth ? 'text-blue-900' : 'text-gray-900'}`}>
                          {monthName}
                        </p>
                        {isCurrentMonth && (
                          <p className="text-sm text-blue-600">Current month</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isCurrentMonth ? 'text-blue-900' : 'text-gray-900'}`}>
                        {formatCurrency(month.total)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Optimize Sources</h4>
              </div>
              <p className="text-sm text-green-800">
                Focus on high-margin revenue streams like subscriptions and credit sales for sustainable growth.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Payment Methods</h4>
              </div>
              <p className="text-sm text-blue-800">
                Analyze payment method performance and optimize checkout flow for preferred methods.
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Growth Strategy</h4>
              </div>
              <p className="text-sm text-purple-800">
                {isPositiveGrowth ? 
                  'Maintain current growth trajectory and identify scalable revenue opportunities.' :
                  'Review pricing strategy and explore new revenue streams to reverse the decline.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueCharts;
