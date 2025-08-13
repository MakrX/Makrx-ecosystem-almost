import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Wrench,
  DollarSign,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface MaintenanceStatsWidgetProps {
  logs: any[];
}

const MaintenanceStatsWidget: React.FC<MaintenanceStatsWidgetProps> = ({ logs }) => {
  // Calculate statistics
  const totalLogs = logs.length;
  const resolvedLogs = logs.filter(log => log.status === 'resolved').length;
  const inProgressLogs = logs.filter(log => log.status === 'in_progress').length;
  const overdueLog = logs.filter(log => log.status === 'overdue').length;
  const scheduledLogs = logs.filter(log => log.status === 'scheduled').length;

  const resolutionRate = totalLogs > 0 ? Math.round((resolvedLogs / totalLogs) * 100) : 0;
  
  const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const avgCost = totalLogs > 0 ? Math.round(totalCost / totalLogs) : 0;

  const avgDuration = logs
    .filter(log => log.actual_duration)
    .reduce((sum, log, _, arr) => sum + log.actual_duration / arr.length, 0);

  // Data for charts
  const statusData = [
    { name: 'Resolved', value: resolvedLogs, color: '#10B981' },
    { name: 'In Progress', value: inProgressLogs, color: '#F59E0B' },
    { name: 'Scheduled', value: scheduledLogs, color: '#3B82F6' },
    { name: 'Overdue', value: overdueLog, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const typeData = logs.reduce((acc, log) => {
    const existing = acc.find(item => item.name === log.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: log.type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const priorityData = logs.reduce((acc, log) => {
    const existing = acc.find(item => item.name === log.priority);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: log.priority, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const monthlyData = logs.reduce((acc, log) => {
    const month = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.completed += log.status === 'resolved' ? 1 : 0;
      existing.total += 1;
    } else {
      acc.push({
        month,
        completed: log.status === 'resolved' ? 1 : 0,
        total: 1
      });
    }
    return acc;
  }, [] as { month: string; completed: number; total: number }[]);

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Resolution Rate</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{resolutionRate}%</div>
              <div className="text-xs text-green-600">{resolvedLogs} of {totalLogs} resolved</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Avg Duration</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{Math.round(avgDuration)}m</div>
              <div className="text-xs text-blue-600">Per maintenance task</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Total Cost</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">${totalCost}</div>
              <div className="text-xs text-purple-600">Avg: ${avgCost} per task</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Overdue</span>
              </div>
              <div className="text-2xl font-bold text-red-700">{overdueLog}</div>
              <div className="text-xs text-red-600">Requires attention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {statusData.map((status, index) => (
              <Badge key={status.name} variant="outline" className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: status.color }}
                />
                {status.name} ({status.value})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Types */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Completion Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="total" fill="#E5E7EB" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Priority Breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {priorityData.map((priority, index) => {
              const colors = {
                'critical': 'bg-red-100 text-red-800 border-red-200',
                'high': 'bg-orange-100 text-orange-800 border-orange-200',
                'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                'low': 'bg-green-100 text-green-800 border-green-200'
              };
              
              const colorClass = colors[priority.name as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
              
              return (
                <div key={priority.name} className={`p-4 rounded-lg border ${colorClass}`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{priority.value}</div>
                    <div className="text-sm font-medium capitalize">{priority.name}</div>
                    <div className="text-xs opacity-75">
                      {Math.round((priority.value / totalLogs) * 100)}% of total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceStatsWidget;
