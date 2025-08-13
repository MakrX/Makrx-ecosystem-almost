import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueGraphProps {
  data: RevenueData[];
  type?: 'line' | 'bar';
}

const RevenueGraph: React.FC<RevenueGraphProps> = ({ data, type = 'line' }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTooltip = (value: number, name: string) => {
    return [formatCurrency(value), 'Revenue'];
  };

  const currentMonth = data[data.length - 1]?.revenue || 0;
  const previousMonth = data[data.length - 2]?.revenue || 0;
  const growthRate = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Revenue Trend
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold">{formatCurrency(currentMonth)}</span>
            <span className={`text-xs ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%)
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#888"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#888"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '6px'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg. Monthly</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0) / data.length)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Growth Rate</p>
            <p className={`text-lg font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueGraph;
