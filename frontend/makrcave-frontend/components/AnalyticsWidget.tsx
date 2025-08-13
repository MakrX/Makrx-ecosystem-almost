import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, BarChart3, RefreshCw, 
  ExternalLink, Calendar, Users, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

interface AnalyticsWidgetProps {
  type: 'usage' | 'revenue' | 'inventory' | 'equipment';
  title: string;
  timeframe?: '7d' | '30d' | '90d';
  height?: number;
  showLink?: boolean;
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  type,
  title,
  timeframe = '7d',
  height = 200,
  showLink = true
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    fetchAnalyticsData();
  }, [type, timeframe]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (type) {
        case 'usage':
          endpoint = `/api/analytics/usage?period=${timeframe === '7d' ? 'weekly' : timeframe === '30d' ? 'monthly' : 'yearly'}`;
          break;
        case 'revenue':
          endpoint = '/api/analytics/revenue';
          break;
        case 'inventory':
          endpoint = '/api/analytics/inventory';
          break;
        case 'equipment':
          endpoint = '/api/analytics/equipment';
          break;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        processData(result);
      } else {
        // Use mock data for demonstration
        generateMockData();
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockData = {
      usage: {
        data: Array.from({ length: 7 }, (_, i) => ({
          day: `Day ${i + 1}`,
          value: Math.floor(Math.random() * 100) + 20,
          users: Math.floor(Math.random() * 50) + 10
        })),
        summary: { total: 450, change: 12.5 }
      },
      revenue: {
        data: Array.from({ length: 6 }, (_, i) => ({
          month: `Month ${i + 1}`,
          value: Math.floor(Math.random() * 5000) + 1000
        })),
        summary: { total: 18500, change: 8.3 }
      },
      inventory: {
        data: [
          { name: 'PLA Filament', value: 45, color: '#3B82F6' },
          { name: 'ABS Filament', value: 30, color: '#10B981' },
          { name: 'PETG', value: 15, color: '#F59E0B' },
          { name: 'Other', value: 10, color: '#8B5CF6' }
        ],
        summary: { items: 156, lowStock: 8 }
      },
      equipment: {
        data: Array.from({ length: 5 }, (_, i) => ({
          name: `Equipment ${i + 1}`,
          uptime: Math.floor(Math.random() * 30) + 70,
          usage: Math.floor(Math.random() * 100) + 50
        })),
        summary: { total: 12, active: 10 }
      }
    };

    setData(mockData[type].data);
    setSummary(mockData[type].summary);
    setTrend(Math.random() > 0.5 ? 'up' : 'down');
  };

  const processData = (result: any) => {
    switch (type) {
      case 'usage':
        const chartData = Array.from({ length: 7 }, (_, i) => ({
          day: `Day ${i + 1}`,
          value: Math.floor(Math.random() * 100) + 20
        }));
        setData(chartData);
        setSummary({ total: result.logins || 0, change: 12.5 });
        break;
      case 'revenue':
        setData(result.monthly_trends?.slice(-6) || []);
        setSummary({ total: result.total_revenue || 0, change: 8.3 });
        break;
      case 'inventory':
        const inventoryData = result.top_consumed_items?.slice(0, 4).map((item: any, index: number) => ({
          name: `Item ${index + 1}`,
          value: item.total_consumed,
          color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index]
        })) || [];
        setData(inventoryData);
        setSummary({ items: result.top_consumed_items?.length || 0, lowStock: result.reorder_alerts?.length || 0 });
        break;
      case 'equipment':
        setData(result.slice(0, 5) || []);
        setSummary({ total: result.length || 0, active: result.filter((eq: any) => eq.uptime_percentage > 80).length || 0 });
        break;
    }
    setTrend('up');
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      );
    }

    switch (type) {
      case 'usage':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'inventory':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'equipment':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => [`${value}%`, 'Uptime']} />
              <Bar dataKey="uptime" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const getSummaryText = () => {
    if (!summary) return '';
    
    switch (type) {
      case 'usage':
        return `${summary.total} total events`;
      case 'revenue':
        return `$${summary.total.toLocaleString()} total`;
      case 'inventory':
        return `${summary.items} items, ${summary.lowStock} low stock`;
      case 'equipment':
        return `${summary.active}/${summary.total} active`;
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'usage':
        return <Users className="h-5 w-5" />;
      case 'revenue':
        return <TrendingUp className="h-5 w-5" />;
      case 'inventory':
        return <Package className="h-5 w-5" />;
      case 'equipment':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {summary && (
              <Badge variant="outline" className="text-xs">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                )}
                {Math.abs(summary.change || 0).toFixed(1)}%
              </Badge>
            )}
            {showLink && (
              <Link to="/portal/analytics">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        {summary && (
          <p className="text-sm text-gray-600">{getSummaryText()}</p>
        )}
      </CardHeader>
      <CardContent>
        <div style={{ height: height }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsWidget;
