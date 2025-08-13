import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import EnhancedJobManagement from '../components/EnhancedJobManagement';
import ServiceProviderDashboard from '../components/ServiceProviderDashboard';
import {
  Briefcase, Package, Clock, Users, Settings, TrendingUp,
  FileText, Star, AlertCircle, CheckCircle, Plus, Eye
} from 'lucide-react';

// Types
interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  role: string;
  makerspace_id?: string;
  is_service_provider?: boolean;
  provider_status?: string;
}

interface JobOverview {
  total_jobs: number;
  my_jobs: number;
  provider_jobs: number;
  pending_assignments: number;
  active_jobs: number;
  completed_jobs: number;
  revenue_this_month: number;
  customer_rating?: number;
}

const EnhancedJobs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [jobOverview, setJobOverview] = useState<JobOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBecomeProvider, setShowBecomeProvider] = useState(false);

  // Fetch user profile and job overview
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user profile
        const profileResponse = await fetch('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setUserProfile(profile);
          
          // Determine initial tab based on user role
          if (profile.is_service_provider) {
            setActiveTab('provider');
          } else if (profile.role === 'makerspace_admin' || profile.role === 'super_admin') {
            setActiveTab('management');
          } else {
            setActiveTab('overview');
          }
        }

        // Get job overview
        const overviewResponse = await fetch('/api/v1/jobs/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (overviewResponse.ok) {
          const overview = await overviewResponse.json();
          setJobOverview(overview);
        }
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "Error",
          description: "Failed to load job data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle becoming a service provider
  const handleBecomeProvider = async () => {
    try {
      const response = await fetch('/api/v1/users/become-provider', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "You can now create a service provider profile!"
        });
        
        setUserProfile(prev => prev ? { ...prev, is_service_provider: true } : null);
        setActiveTab('provider');
      } else {
        throw new Error('Failed to become provider');
      }
    } catch (error) {
      console.error('Failed to become provider:', error);
      toast({
        title: "Error",
        description: "Failed to enable service provider status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jobs & Services</h1>
          <p className="text-muted-foreground">
            Manage jobs, service orders, and provider operations
          </p>
        </div>
        
        {userProfile && !userProfile.is_service_provider && (
          <Button onClick={handleBecomeProvider}>
            <Briefcase className="h-4 w-4 mr-2" />
            Become a Service Provider
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      {jobOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{jobOverview.total_jobs}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">My Jobs</p>
                  <p className="text-2xl font-bold">{jobOverview.my_jobs}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{jobOverview.active_jobs}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(jobOverview.revenue_this_month)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {userProfile?.is_service_provider && (
            <TabsTrigger value="provider">Provider Dashboard</TabsTrigger>
          )}
          {(userProfile?.role === 'makerspace_admin' || userProfile?.role === 'super_admin') && (
            <TabsTrigger value="management">Job Management</TabsTrigger>
          )}
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest job updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Job #J123 completed</p>
                      <p className="text-xs text-muted-foreground">3D printing job finished successfully</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New job assignment</p>
                      <p className="text-xs text-muted-foreground">Laser cutting job assigned to your queue</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-muted-foreground">$150.00 payment processed for Job #J121</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Job
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Jobs
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Provider Settings
                </Button>

                {!userProfile?.is_service_provider && (
                  <Button 
                    className="w-full justify-start" 
                    variant="default"
                    onClick={handleBecomeProvider}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Become a Service Provider
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          {userProfile?.is_service_provider && jobOverview && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Your service provider performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="ml-1 text-lg font-semibold">
                        {jobOverview.customer_rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Customer Rating</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{jobOverview.completed_jobs}</p>
                    <p className="text-sm text-muted-foreground">Jobs Completed</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(jobOverview.revenue_this_month)}
                    </p>
                    <p className="text-sm text-muted-foreground">This Month Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Getting Started - For new users */}
          {(!userProfile?.is_service_provider && jobOverview?.total_jobs === 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Welcome to the MakrCave job system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">As a Customer</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Submit jobs to service providers</li>
                      <li>• Track job progress in real-time</li>
                      <li>• Rate and review completed work</li>
                      <li>• Manage your order history</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">As a Service Provider</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Accept and manage incoming jobs</li>
                      <li>• Set your pricing and capabilities</li>
                      <li>• Track equipment utilization</li>
                      <li>• Build your reputation and ratings</li>
                    </ul>
                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      onClick={handleBecomeProvider}
                    >
                      Start Providing Services
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Service Provider Dashboard Tab */}
        {userProfile?.is_service_provider && (
          <TabsContent value="provider">
            <ServiceProviderDashboard />
          </TabsContent>
        )}

        {/* Job Management Tab (Admin/Manager) */}
        {(userProfile?.role === 'makerspace_admin' || userProfile?.role === 'super_admin') && (
          <TabsContent value="management">
            <EnhancedJobManagement />
          </TabsContent>
        )}

        {/* My Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>
                Jobs and orders you've submitted or are working on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any jobs or orders yet
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedJobs;
