import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import {
  Upload, FileText, Clock, DollarSign, User, AlertCircle, CheckCircle,
  Eye, Edit3, Download, MessageSquare, Calendar, Package, Truck,
  Star, TrendingUp, BarChart3, Filter, Search, Plus, RefreshCw
} from 'lucide-react';

// Types
interface ServiceJob {
  job_id: string;
  external_order_id?: string;
  source: string;
  title: string;
  description?: string;
  job_type: string;
  status: string;
  priority: string;
  customer_name?: string;
  customer_email?: string;
  assigned_provider_id?: string;
  assigned_makerspace_id?: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
  estimated_completion?: string;
  actual_completion?: string;
  quantity: number;
  material_type?: string;
  material_color?: string;
  quality_level?: string;
  estimated_cost?: number;
  quoted_price?: number;
  final_price?: number;
  completion_percentage: number;
}

interface JobFile {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  is_primary: boolean;
  is_gcode: boolean;
  layer_count?: number;
  estimated_print_time_gcode?: number;
  model_volume?: number;
  requires_supports?: boolean;
  uploaded_at: string;
  processing_status: string;
}

interface StatusUpdate {
  id: number;
  previous_status?: string;
  new_status: string;
  update_message?: string;
  completion_percentage: number;
  milestone_reached?: string;
  estimated_time_remaining?: number;
  updated_by: string;
  updated_at: string;
  is_customer_visible: boolean;
  customer_notified: boolean;
}

interface DashboardStats {
  total_jobs: number;
  jobs_by_status: Record<string, number>;
  jobs_by_priority: Record<string, number>;
  jobs_by_type: Record<string, number>;
  pending_jobs: number;
  active_jobs: number;
  completed_today: number;
  average_completion_time?: number;
  material_usage_today: Record<string, number>;
  revenue_today: number;
  revenue_this_month: number;
}

const EnhancedJobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [jobFiles, setJobFiles] = useState<JobFile[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  // Constants
  const jobStatuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'accepted', label: 'Accepted', color: 'blue' },
    { value: 'in_progress', label: 'In Progress', color: 'orange' },
    { value: 'printing', label: 'Printing', color: 'purple' },
    { value: 'post_processing', label: 'Post Processing', color: 'indigo' },
    { value: 'quality_check', label: 'Quality Check', color: 'cyan' },
    { value: 'ready', label: 'Ready', color: 'green' },
    { value: 'shipped', label: 'Shipped', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
    { value: 'failed', label: 'Failed', color: 'red' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'normal', label: 'Normal', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const materialTypes = [
    'pla', 'abs', 'petg', 'tpu', 'asa', 'pc', 'nylon', 'pva', 'hips',
    'wood_fill', 'metal_fill', 'carbon_fiber', 'custom'
  ];

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/jobs/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }, []);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '20'
      });

      if (searchQuery) params.append('search_query', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`/api/v1/jobs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, priorityFilter, toast]);

  // Fetch job files
  const fetchJobFiles = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/files`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const files = await response.json();
        setJobFiles(files);
      }
    } catch (error) {
      console.error('Failed to fetch job files:', error);
    }
  }, []);

  // Fetch status updates
  const fetchStatusUpdates = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const updates = await response.json();
        setStatusUpdates(updates);
      }
    } catch (error) {
      console.error('Failed to fetch status updates:', error);
    }
  }, []);

  // Update job status
  const updateJobStatus = async (jobId: string, newStatus: string, message?: string) => {
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          new_status: newStatus,
          update_message: message || `Status updated to ${newStatus}`,
          is_customer_visible: true
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Job status updated successfully"
        });
        
        // Refresh data
        await fetchJobs();
        if (selectedJob) {
          await fetchStatusUpdates(selectedJob.job_id);
        }
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // File upload handler
  const handleFileUpload = async (jobId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Uploaded ${file.name}`);

      const response = await fetch(`/api/v1/jobs/${jobId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "File uploaded successfully"
        });
        
        await fetchJobFiles(jobId);
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize data
  useEffect(() => {
    fetchDashboardStats();
    fetchJobs();
  }, [fetchDashboardStats, fetchJobs]);

  // Handle job selection
  const handleJobSelect = async (job: ServiceJob) => {
    setSelectedJob(job);
    setShowJobDetails(true);
    await fetchJobFiles(job.job_id);
    await fetchStatusUpdates(job.job_id);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusInfo = jobStatuses.find(s => s.value === status);
    return statusInfo?.color || 'gray';
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    const priorityInfo = priorities.find(p => p.value === priority);
    return priorityInfo?.color || 'gray';
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">Manage service provider jobs and orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateJob(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
          <Button variant="outline" onClick={fetchJobs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardStats && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                        <p className="text-2xl font-bold">{dashboardStats.total_jobs}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                        <p className="text-2xl font-bold">{dashboardStats.active_jobs}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                        <p className="text-2xl font-bold">{dashboardStats.completed_today}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revenue Today</p>
                        <p className="text-2xl font-bold">{formatCurrency(dashboardStats.revenue_today)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Jobs by Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(dashboardStats.jobs_by_status).map(([status, count]) => {
                      const statusInfo = jobStatuses.find(s => s.value === status);
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`bg-${statusInfo?.color}-100 text-${statusInfo?.color}-800`}>
                              {statusInfo?.label || status}
                            </Badge>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Jobs by Priority</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(dashboardStats.jobs_by_priority).map(([priority, count]) => {
                      const priorityInfo = priorities.find(p => p.value === priority);
                      return (
                        <div key={priority} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`bg-${priorityInfo?.color}-100 text-${priorityInfo?.color}-800`}>
                              {priorityInfo?.label || priority}
                            </Badge>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {jobStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="text-center py-8">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                      ? 'Try adjusting your filters or search query'
                      : 'Create your first job to get started'
                    }
                  </p>
                  <Button onClick={() => setShowCreateJob(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.job_id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6" onClick={() => handleJobSelect(job)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant="secondary" className={`bg-${getStatusColor(job.status)}-100 text-${getStatusColor(job.status)}-800`}>
                            {jobStatuses.find(s => s.value === job.status)?.label || job.status}
                          </Badge>
                          <Badge variant="outline" className={`bg-${getPriorityColor(job.priority)}-100 text-${getPriorityColor(job.priority)}-800`}>
                            {priorities.find(p => p.value === job.priority)?.label || job.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3">{job.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Customer:</span>
                            <p className="font-medium">{job.customer_name || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Material:</span>
                            <p className="font-medium">{job.material_type || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <p className="font-medium">{job.quantity}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <p className="font-medium">{formatCurrency(job.quoted_price || job.estimated_cost)}</p>
                          </div>
                        </div>
                        
                        {job.completion_percentage > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{job.completion_percentage}%</span>
                            </div>
                            <Progress value={job.completion_percentage} className="h-2" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleJobSelect(job);
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Comprehensive analytics for job performance and business insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced analytics and reporting features will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              {selectedJob?.title} - {selectedJob?.job_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="status">Status Updates</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`bg-${getStatusColor(selectedJob.status)}-100 text-${getStatusColor(selectedJob.status)}-800`}>
                        {jobStatuses.find(s => s.value === selectedJob.status)?.label || selectedJob.status}
                      </Badge>
                      <Select
                        value={selectedJob.status}
                        onValueChange={(newStatus) => updateJobStatus(selectedJob.job_id, newStatus)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {jobStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Progress</Label>
                    <div className="mt-1">
                      <Progress value={selectedJob.completion_percentage} className="h-3" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedJob.completion_percentage}% complete
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Customer</Label>
                    <p className="mt-1">{selectedJob.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedJob.customer_email}</p>
                  </div>
                  <div>
                    <Label>Material</Label>
                    <p className="mt-1">{selectedJob.material_type || 'Not specified'}</p>
                    <p className="text-sm text-muted-foreground">{selectedJob.material_color}</p>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <p className="mt-1">{selectedJob.quantity}</p>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge variant="outline" className={`bg-${getPriorityColor(selectedJob.priority)}-100 text-${getPriorityColor(selectedJob.priority)}-800`}>
                      {priorities.find(p => p.value === selectedJob.priority)?.label || selectedJob.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>Quoted Price</Label>
                    <p className="mt-1">{formatCurrency(selectedJob.quoted_price)}</p>
                  </div>
                  <div>
                    <Label>Final Price</Label>
                    <p className="mt-1">{formatCurrency(selectedJob.final_price)}</p>
                  </div>
                </div>

                {selectedJob.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="mt-1 text-sm">{selectedJob.description}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Job Files</h4>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '.stl,.obj,.gcode,.step,.dwg,.3mf';
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) {
                          Array.from(files).forEach(file => {
                            handleFileUpload(selectedJob.job_id, file);
                          });
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {jobFiles.map((file) => (
                    <Card key={file.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="font-medium">{file.original_filename}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatFileSize(file.file_size)}</span>
                                <span>{file.file_type.toUpperCase()}</span>
                                {file.is_primary && <Badge variant="secondary">Primary</Badge>}
                                {file.is_gcode && <Badge variant="secondary">G-code</Badge>}
                              </div>
                              {file.layer_count && (
                                <p className="text-sm text-muted-foreground">
                                  {file.layer_count} layers
                                  {file.estimated_print_time_gcode && ` • ${Math.round(file.estimated_print_time_gcode / 60)}h ${file.estimated_print_time_gcode % 60}m`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={file.processing_status === 'completed' ? 'default' : 'secondary'}>
                              {file.processing_status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {jobFiles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>No files uploaded yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div className="space-y-3">
                  {statusUpdates.map((update) => (
                    <Card key={update.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`bg-${getStatusColor(update.new_status)}-100 text-${getStatusColor(update.new_status)}-800`}>
                                {jobStatuses.find(s => s.value === update.new_status)?.label || update.new_status}
                              </Badge>
                              {update.completion_percentage > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  {update.completion_percentage}% complete
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm mb-2">{update.update_message}</p>
                            
                            {update.milestone_reached && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <CheckCircle className="h-3 w-3" />
                                Milestone: {update.milestone_reached}
                              </div>
                            )}
                            
                            {update.estimated_time_remaining && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Est. {Math.round(update.estimated_time_remaining / 60)}h remaining
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{new Date(update.updated_at).toLocaleDateString()}</p>
                            <p>{new Date(update.updated_at).toLocaleTimeString()}</p>
                            {update.customer_notified && (
                              <Badge variant="secondary" className="mt-1">
                                Notified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {statusUpdates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>No status updates yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p>Material usage tracking coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedJobManagement;
