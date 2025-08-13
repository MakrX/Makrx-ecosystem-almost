import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    growth_rate: number;
    previous_period: number;
  };
  transactions: {
    total_count: number;
    successful_count: number;
    failed_count: number;
    pending_count: number;
    success_rate: number;
    average_amount: number;
  };
  revenue_by_type: {
    membership: number;
    credits: number;
    printing_3d: number;
    laser_cutting: number;
    workshops: number;
    materials: number;
  };
  revenue_by_month: {
    month: string;
    revenue: number;
    transactions: number;
  }[];
  top_customers: {
    customer_name: string;
    customer_email: string;
    total_spent: number;
    transaction_count: number;
  }[];
  payment_methods: {
    razorpay: number;
    stripe: number;
    credit: number;
    bank_transfer: number;
  };
}

interface BillingAnalyticsProps {
  data?: AnalyticsData;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  onExportReport?: () => void;
}

const BillingAnalytics: React.FC<BillingAnalyticsProps> = ({
  data,
  timeRange = 'month',
  onTimeRangeChange,
  onExportReport
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock data if no data provided
  const mockData: AnalyticsData = {
    revenue: {
      total: 25420.50,
      monthly: 4230.75,
      weekly: 1250.30,
      daily: 180.25,
      growth_rate: 12.5,
      previous_period: 3760.40
    },
    transactions: {
      total_count: 156,
      successful_count: 148,
      failed_count: 6,
      pending_count: 2,
      success_rate: 94.9,
      average_amount: 163.08
    },
    revenue_by_type: {
      membership: 8950.00,
      credits: 6420.50,
      printing_3d: 3840.25,
      laser_cutting: 2150.75,
      workshops: 2800.00,
      materials: 1259.00
    },
    revenue_by_month: [
      { month: 'Jan', revenue: 3760.40, transactions: 28 },
      { month: 'Feb', revenue: 4120.80, transactions: 31 },
      { month: 'Mar', revenue: 3850.25, transactions: 29 },
      { month: 'Apr', revenue: 4680.30, transactions: 35 },
      { month: 'May', revenue: 4230.75, transactions: 33 },
      { month: 'Jun', revenue: 4778.00, transactions: 38 }
    ],
    top_customers: [
      { customer_name: 'John Doe', customer_email: 'john.doe@example.com', total_spent: 1250.50, transaction_count: 12 },
      { customer_name: 'Jane Smith', customer_email: 'jane.smith@example.com', total_spent: 980.25, transaction_count: 8 },
      { customer_name: 'Mike Johnson', customer_email: 'mike.johnson@example.com', total_spent: 750.80, transaction_count: 6 },
      { customer_name: 'Sarah Wilson', customer_email: 'sarah.wilson@example.com', total_spent: 625.40, transaction_count: 5 },
      { customer_name: 'David Brown', customer_email: 'david.brown@example.com', total_spent: 520.75, transaction_count: 7 }
    ],
    payment_methods: {
      razorpay: 65.2,
      stripe: 22.8,
      credit: 8.5,
      bank_transfer: 3.5
    }
  };

  const analyticsData = data || mockData;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (rate: number) => {
    return rate >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (rate: number) => {
    return rate >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    onTimeRangeChange?.(range);
  };

  const revenueByTypeData = Object.entries(analyticsData.revenue_by_type).map(([type, amount]) => ({
    type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    amount,
    percentage: (amount / Object.values(analyticsData.revenue_by_type).reduce((a, b) => a + b, 0)) * 100
  }));

  const paymentMethodsData = Object.entries(analyticsData.payment_methods).map(([method, percentage]) => ({
    method: method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    percentage
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Billing Analytics</h2>
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.total)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(analyticsData.revenue.growth_rate)}
                  <span className={`text-sm ${getGrowthColor(analyticsData.revenue.growth_rate)}`}>
                    {formatPercentage(Math.abs(analyticsData.revenue.growth_rate))}
                  </span>
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.transactions.total_count}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Avg: {formatCurrency(analyticsData.transactions.average_amount)}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.transactions.success_rate)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analyticsData.transactions.successful_count}/{analyticsData.transactions.total_count} successful
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.monthly)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  +{formatPercentage((analyticsData.revenue.monthly - analyticsData.revenue.previous_period) / analyticsData.revenue.previous_period * 100)} from last month
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.revenue_by_month.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{month.month}</p>
                    <p className="text-sm text-gray-500">{month.transactions} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(month.revenue)}</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(month.revenue / Math.max(...analyticsData.revenue_by_month.map(m => m.revenue))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue by Service Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByTypeData
                .sort((a, b) => b.amount - a.amount)
                .map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)` 
                      }}
                    />
                    <span className="text-sm font-medium">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-gray-500">{formatPercentage(item.percentage)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.top_customers.map((customer, index) => (
                <div key={customer.customer_email} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.customer_name}</p>
                      <p className="text-xs text-gray-500">{customer.customer_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(customer.total_spent)}</p>
                    <p className="text-xs text-gray-500">{customer.transaction_count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethodsData
                .sort((a, b) => b.percentage - a.percentage)
                .map((method) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                    <span className="text-sm font-medium">{method.method}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{formatPercentage(method.percentage)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Transaction Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">Successful</p>
                <p className="text-2xl font-bold text-green-900">{analyticsData.transactions.successful_count}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-800">Failed</p>
                <p className="text-2xl font-bold text-red-900">{analyticsData.transactions.failed_count}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{analyticsData.transactions.pending_count}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800">Success Rate</p>
                <p className="text-2xl font-bold text-blue-900">{formatPercentage(analyticsData.transactions.success_rate)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingAnalytics;
