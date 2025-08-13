import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line
} from 'recharts';
import {
  FolderOpen, Users, ShoppingCart, DollarSign, CheckCircle,
  RefreshCw, TrendingUp, Package, Clock, Target
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ProjectAnalytics {
  total_projects: number;
  completed_projects: number;
  average_completion_time: number;
  most_active_projects: Array<{
    project_id: string;
    collaboration_count: number;
    total_cost: number;
  }>;
  largest_boms: Array<{
    project_id: string;
    bom_items_count: number;
    total_cost: number;
  }>;
  costliest_projects: Array<{
    project_id: string;
    total_cost: number;
    bom_items_count: number;
  }>;
  makrx_store_percentage: number;
}

const ProjectAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [costDistributionData, setCostDistributionData] = useState<any[]>([]);
  const [bomSizeData, setBomSizeData] = useState<any[]>([]);
  const [collaborationData, setCollaborationData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);

  useEffect(() => {
    fetchProjectAnalytics();
  }, []);

  const fetchProjectAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/projects', {
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
          description: "Failed to load project analytics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load project analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: ProjectAnalytics) => {
    // Cost distribution for top projects
    const costChart = data.costliest_projects.slice(0, 8).map((project, index) => ({
      name: `Project ${index + 1}`,
      cost: project.total_cost,
      bom_size: project.bom_items_count,
      project_id: project.project_id
    }));
    setCostDistributionData(costChart);

    // BOM size distribution
    const bomChart = data.largest_boms.slice(0, 8).map((project, index) => ({
      name: `Project ${index + 1}`,
      items: project.bom_items_count,
      cost: project.total_cost,
      project_id: project.project_id
    }));
    setBomSizeData(bomChart);

    // Collaboration analysis
    const collabChart = data.most_active_projects.slice(0, 8).map((project, index) => ({
      name: `Project ${index + 1}`,
      collaborators: project.collaboration_count,
      cost: project.total_cost,
      project_id: project.project_id
    }));
    setCollaborationData(collabChart);

    // Source breakdown (MakrX Store vs External)
    const makrxPercentage = data.makrx_store_percentage;
    const sourceChart = [
      {
        name: 'MakrX Store',
        value: makrxPercentage,
        fill: '#3B82F6'
      },
      {
        name: 'External Sources',
        value: 100 - makrxPercentage,
        fill: '#F59E0B'
      }
    ];
    setSourceData(sourceChart);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCompletionRate = () => {
    if (!analytics || analytics.total_projects === 0) return 0;
    return (analytics.completed_projects / analytics.total_projects) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading project analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Alert>
        <FolderOpen className="h-4 w-4" />
        <AlertDescription>
          No project data available. Analytics will appear once projects are created.
        </AlertDescription>
      </Alert>
    );
  }

  const completionRate = getCompletionRate();
  const averageCost = analytics.costliest_projects.length > 0 
    ? analytics.costliest_projects.reduce((sum, p) => sum + p.total_cost, 0) / analytics.costliest_projects.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Project & BOM Analytics</h2>
        <Badge variant="default" className="text-sm">
          <Target className="h-3 w-3 mr-1" />
          Completion Rate: {completionRate.toFixed(1)}%
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.total_projects}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{analytics.completed_projects}</p>
                <p className="text-xs text-green-600">{completionRate.toFixed(1)}% completion rate</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Cost</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(averageCost)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MakrX Store %</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.makrx_store_percentage.toFixed(1)}%</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <span className="font-medium">Project Insights:</span> 
          {` ${analytics.makrx_store_percentage.toFixed(0)}% of BOM items are sourced from MakrX Store. `}
          {analytics.average_completion_time > 0 && 
            `Average completion time is ${analytics.average_completion_time.toFixed(1)} days.`
          }
        </AlertDescription>
      </Alert>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Cost Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'cost' ? formatCurrency(Number(value)) : `${value} items`,
                      name === 'cost' ? 'Total Cost' : 'BOM Items'
                    ]}
                  />
                  <Bar dataKey="cost" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* BOM Size Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>BOM Size Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={bomChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="items" name="BOM Items" />
                  <YAxis dataKey="cost" name="Cost" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'cost' ? formatCurrency(Number(value)) : `${value} items`,
                      name === 'cost' ? 'Total Cost' : 'BOM Items'
                    ]}
                  />
                  <Scatter fill="#10B981" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collaboration Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collaborationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'collaborators' ? `${value} collaborators` : formatCurrency(Number(value)),
                      name === 'collaborators' ? 'Collaborators' : 'Project Cost'
                    ]}
                  />
                  <Bar dataKey="collaborators" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>BOM Source Distribution</CardTitle>
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.most_active_projects.slice(0, 5).map((project, index) => (
                <div key={project.project_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Project {index + 1}</p>
                      <p className="text-sm text-gray-500">
                        <Users className="h-3 w-3 inline mr-1" />
                        {project.collaboration_count} collaborators
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(project.total_cost)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Largest BOMs */}
        <Card>
          <CardHeader>
            <CardTitle>Largest BOMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.largest_boms.slice(0, 5).map((project, index) => (
                <div key={project.project_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Project {index + 1}</p>
                      <p className="text-sm text-gray-500">
                        <Package className="h-3 w-3 inline mr-1" />
                        {project.bom_items_count} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(project.total_cost)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Costliest Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Costliest Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.costliest_projects.slice(0, 5).map((project, index) => (
                <div key={project.project_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Project {index + 1}</p>
                      <p className="text-sm text-gray-500">
                        <Package className="h-3 w-3 inline mr-1" />
                        {project.bom_items_count} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(project.total_cost)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Project Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Optimize Sourcing</h4>
              </div>
              <p className="text-sm text-blue-800">
                Increase MakrX Store usage to {analytics.makrx_store_percentage < 80 ? '80%+' : '90%+'} for better inventory integration and cost optimization.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Encourage Collaboration</h4>
              </div>
              <p className="text-sm text-green-800">
                Promote team projects and knowledge sharing to improve completion rates and reduce individual project costs.
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">Track Progress</h4>
              </div>
              <p className="text-sm text-orange-800">
                Implement project milestones and regular check-ins to improve completion rates and reduce time-to-completion.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAnalytics;
