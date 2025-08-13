import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, DollarSign } from 'lucide-react';

interface UsageData {
  name: string;
  value: number;
  color: string;
}

interface UsageByCategoryPieChartProps {
  data: UsageData[];
}

const UsageByCategoryPieChart: React.FC<UsageByCategoryPieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value}% of total revenue
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Revenue by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-600">{item.value}% of revenue</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Total Categories</span>
            <span className="font-semibold">{data.length}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-gray-600">Largest Category</span>
            <span className="font-semibold">
              {data.reduce((max, item) => item.value > max.value ? item : max, data[0])?.name} 
              ({data.reduce((max, item) => item.value > max.value ? item : max, data[0])?.value}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageByCategoryPieChart;
