import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  DollarSign,
  TrendingUp,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface BillingAnalytics {
  monthlyRevenue: number;
  totalUsers: number;
  creditUsage: number;
  refundRate: number;
}

interface BillingOverviewProps {
  analytics: BillingAnalytics;
  userRole: string;
  detailed?: boolean;
}

const BillingOverview: React.FC<BillingOverviewProps> = ({ 
  analytics, 
  userRole, 
  detailed = false 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getChangeIndicator = (value: number, isPositive: boolean = true) => {
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const icon = isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />;
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="text-xs">+{Math.abs(value)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.monthlyRevenue)}
                </p>
                {getChangeIndicator(12.5)}
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                {getChangeIndicator(8.2)}
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Credit Usage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Usage</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.creditUsage}%</p>
                {getChangeIndicator(5.1)}
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* Refund Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refund Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.refundRate}%</p>
                {getChangeIndicator(0.3, false)}
              </div>
              <RefreshCw className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {detailed && (
        <>
          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Subscriptions</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(7500)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Credit Purchases</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(3200)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Reorders</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(1500)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Services</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(300)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Payment Success Rate</span>
                    </div>
                    <span className="font-semibold">98.2%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Avg. Processing Time</span>
                    </div>
                    <span className="font-semibold">1.2s</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Customer Lifetime Value</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(485)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Monthly Growth Rate</span>
                    </div>
                    <span className="font-semibold">12.5%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Churn Rate</span>
                    </div>
                    <span className="font-semibold">3.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts and Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Revenue Target Achieved</p>
                    <p className="text-green-700">Monthly revenue target of ₹9,96,000 reached 3 days early.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">High Credit Usage</p>
                    <p className="text-yellow-700">Credit usage is 15% higher than usual this month.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Scheduled Maintenance</p>
                    <p className="text-blue-700">Payment system maintenance scheduled for next weekend.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BillingOverview;
