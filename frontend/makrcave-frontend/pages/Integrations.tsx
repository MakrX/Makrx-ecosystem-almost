import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  Zap,
  Globe,
  Code,
  Key,
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Link2,
  Shield,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Cpu,
  Wifi,
  Server,
  Terminal,
  FileText,
  Webhook,
  Lock,
  Unlock,
  ExternalLink,
  Github,
  Slack,
  MessageSquare,
  Calendar,
  Mail,
  CreditCard,
  Package,
  Wrench,
  BookOpen,
  Camera,
  Video,
  Headphones,
  Palette,
  PieChart,
  LineChart,
  Target,
  Layers,
  Box,
  Puzzle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'communication' | 'development' | 'analytics' | 'payment' | 'automation' | 'design' | 'storage';
  icon: string;
  provider: string;
  status: 'connected' | 'available' | 'pending' | 'error';
  popularity: number;
  rating: number;
  reviews: number;
  features: string[];
  pricing: 'free' | 'freemium' | 'paid';
  setupComplexity: 'easy' | 'medium' | 'hard';
  lastSync?: string;
  dataPoints?: number;
  errorCount?: number;
  apiCalls?: number;
  isOfficial: boolean;
  documentation: string;
  webhook: boolean;
  oauth: boolean;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  requests: number;
  rateLimit: number;
  status: 'active' | 'revoked' | 'expired';
  environment: 'development' | 'staging' | 'production';
  description: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  lastTriggered: string;
  totalCalls: number;
  successRate: number;
  secret: string;
  retryAttempts: number;
  timeout: number;
}

interface AnalyticsData {
  totalIntegrations: number;
  activeConnections: number;
  apiCalls: number;
  webhookDeliveries: number;
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
  topIntegrations: Array<{ name: string; usage: number }>;
}

const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('marketplace');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadIntegrationsData();
  }, []);

  const loadIntegrationsData = () => {
    // Mock integrations data
    const mockIntegrations: Integration[] = [
      {
        id: 'slack-001',
        name: 'Slack',
        description: 'Get instant notifications about equipment status, maintenance alerts, and project updates in your Slack channels.',
        category: 'communication',
        icon: 'slack',
        provider: 'Slack Technologies',
        status: 'connected',
        popularity: 95,
        rating: 4.8,
        reviews: 12450,
        features: ['Real-time notifications', 'Custom channels', 'Equipment alerts', 'Project updates'],
        pricing: 'freemium',
        setupComplexity: 'easy',
        lastSync: '2024-12-18 14:30:00',
        dataPoints: 1250,
        errorCount: 2,
        apiCalls: 8945,
        isOfficial: true,
        documentation: 'https://docs.makrcave.com/integrations/slack',
        webhook: true,
        oauth: true
      },
      {
        id: 'github-001',
        name: 'GitHub',
        description: 'Sync project repositories, track issues, and manage code for your maker projects directly from MakrCave.',
        category: 'development',
        icon: 'github',
        provider: 'GitHub Inc.',
        status: 'connected',
        popularity: 88,
        rating: 4.9,
        reviews: 8932,
        features: ['Repository sync', 'Issue tracking', 'Code management', 'Release automation'],
        pricing: 'free',
        setupComplexity: 'medium',
        lastSync: '2024-12-18 12:15:00',
        dataPoints: 456,
        errorCount: 0,
        apiCalls: 2341,
        isOfficial: true,
        documentation: 'https://docs.makrcave.com/integrations/github',
        webhook: true,
        oauth: true
      },
      {
        id: 'stripe-001',
        name: 'Stripe',
        description: 'Accept payments for maker services, equipment rentals, and course fees with secure payment processing.',
        category: 'payment',
        icon: 'credit-card',
        provider: 'Stripe Inc.',
        status: 'available',
        popularity: 92,
        rating: 4.7,
        reviews: 15623,
        features: ['Payment processing', 'Subscription billing', 'Invoice management', 'Analytics'],
        pricing: 'paid',
        setupComplexity: 'medium',
        isOfficial: true,
        documentation: 'https://docs.makrcave.com/integrations/stripe',
        webhook: true,
        oauth: true
      },
      {
        id: 'zapier-001',
        name: 'Zapier',
        description: 'Automate workflows between MakrCave and 5000+ apps. Create powerful automations without coding.',
        category: 'automation',
        icon: 'zap',
        provider: 'Zapier Inc.',
        status: 'available',
        popularity: 85,
        rating: 4.6,
        reviews: 7834,
        features: ['Workflow automation', '5000+ app connections', 'Trigger actions', 'No-code setup'],
        pricing: 'freemium',
        setupComplexity: 'easy',
        isOfficial: true,
        documentation: 'https://docs.makrcave.com/integrations/zapier',
        webhook: true,
        oauth: false
      },
      {
        id: 'google-analytics-001',
        name: 'Google Analytics',
        description: 'Track user engagement, equipment usage patterns, and optimize your makerspace operations.',
        category: 'analytics',
        icon: 'bar-chart',
        provider: 'Google LLC',
        status: 'connected',
        popularity: 78,
        rating: 4.5,
        reviews: 9876,
        features: ['Usage analytics', 'Custom events', 'Conversion tracking', 'Real-time data'],
        pricing: 'free',
        setupComplexity: 'medium',
        lastSync: '2024-12-18 13:45:00',
        dataPoints: 15678,
        errorCount: 1,
        apiCalls: 4532,
        isOfficial: true,
        documentation: 'https://docs.makrcave.com/integrations/google-analytics',
        webhook: false,
        oauth: true
      },
      {
        id: 'figma-001',
        name: 'Figma',
        description: 'Import design files and prototypes directly into your maker projects for seamless design-to-build workflows.',
        category: 'design',
        icon: 'palette',
        provider: 'Figma Inc.',
        status: 'available',
        popularity: 73,
        rating: 4.8,
        reviews: 4521,
        features: ['Design import', 'Prototype sync', 'Asset management', 'Version control'],
        pricing: 'freemium',
        setupComplexity: 'easy',
        isOfficial: true,
        documentation: 'https://docs.makrcave.com/integrations/figma',
        webhook: true,
        oauth: true
      },
      {
        id: 'aws-001',
        name: 'Amazon Web Services',
        description: 'Store project files, backup data, and leverage cloud computing power for complex simulations.',
        category: 'storage',
        icon: 'cloud',
        provider: 'Amazon Web Services',
        status: 'pending',
        popularity: 82,
        rating: 4.4,
        reviews: 11234,
        features: ['Cloud storage', 'Backup solutions', 'Compute power', 'IoT integration'],
        pricing: 'paid',
        setupComplexity: 'hard',
        isOfficial: true,
        documentation: 'https://docs.makrcave.com/integrations/aws',
        webhook: true,
        oauth: true
      },
      {
        id: 'discord-001',
        name: 'Discord',
        description: 'Create maker communities, host virtual events, and collaborate in real-time with voice and text chat.',
        category: 'communication',
        icon: 'message-square',
        provider: 'Discord Inc.',
        status: 'available',
        popularity: 69,
        rating: 4.7,
        reviews: 3456,
        features: ['Community chat', 'Voice channels', 'Screen sharing', 'Bot integration'],
        pricing: 'free',
        setupComplexity: 'easy',
        isOfficial: false,
        documentation: 'https://docs.makrcave.com/integrations/discord',
        webhook: true,
        oauth: true
      }
    ];

    // Mock API keys
    const mockApiKeys: APIKey[] = [
      {
        id: 'key-001',
        name: 'Production API',
        key: 'mk_live_****************************',
        permissions: ['read', 'write', 'admin'],
        createdAt: '2024-01-15',
        lastUsed: '2024-12-18 14:25:00',
        requests: 45632,
        rateLimit: 1000,
        status: 'active',
        environment: 'production',
        description: 'Main production API key for web application'
      },
      {
        id: 'key-002',
        name: 'Mobile App API',
        key: 'mk_test_****************************',
        permissions: ['read', 'write'],
        createdAt: '2024-03-22',
        lastUsed: '2024-12-18 13:45:00',
        requests: 12543,
        rateLimit: 500,
        status: 'active',
        environment: 'production',
        description: 'API key for mobile application access'
      },
      {
        id: 'key-003',
        name: 'Development Key',
        key: 'mk_dev_****************************',
        permissions: ['read'],
        createdAt: '2024-11-10',
        lastUsed: '2024-12-17 16:20:00',
        requests: 2341,
        rateLimit: 100,
        status: 'active',
        environment: 'development',
        description: 'Development and testing environment key'
      }
    ];

    // Mock webhooks
    const mockWebhooks: Webhook[] = [
      {
        id: 'webhook-001',
        name: 'Equipment Status Updates',
        url: 'https://api.example.com/webhooks/equipment',
        events: ['equipment.status_change', 'equipment.maintenance_due'],
        status: 'active',
        lastTriggered: '2024-12-18 14:30:00',
        totalCalls: 1245,
        successRate: 98.5,
        secret: 'whsec_****************************',
        retryAttempts: 3,
        timeout: 30
      },
      {
        id: 'webhook-002',
        name: 'User Registration',
        url: 'https://crm.example.com/webhooks/users',
        events: ['user.created', 'user.updated'],
        status: 'active',
        lastTriggered: '2024-12-18 12:15:00',
        totalCalls: 567,
        successRate: 99.2,
        secret: 'whsec_****************************',
        retryAttempts: 3,
        timeout: 30
      },
      {
        id: 'webhook-003',
        name: 'Payment Notifications',
        url: 'https://accounting.example.com/webhooks/payments',
        events: ['payment.succeeded', 'payment.failed'],
        status: 'failed',
        lastTriggered: '2024-12-17 09:30:00',
        totalCalls: 234,
        successRate: 85.2,
        secret: 'whsec_****************************',
        retryAttempts: 5,
        timeout: 30
      }
    ];

    // Mock analytics
    const mockAnalytics: AnalyticsData = {
      totalIntegrations: mockIntegrations.length,
      activeConnections: mockIntegrations.filter(i => i.status === 'connected').length,
      apiCalls: 125456,
      webhookDeliveries: 8932,
      uptime: 99.8,
      avgResponseTime: 145,
      errorRate: 0.2,
      topIntegrations: [
        { name: 'Slack', usage: 45 },
        { name: 'GitHub', usage: 32 },
        { name: 'Google Analytics', usage: 28 },
        { name: 'Stripe', usage: 18 }
      ]
    };

    setIntegrations(mockIntegrations);
    setApiKeys(mockApiKeys);
    setWebhooks(mockWebhooks);
    setAnalytics(mockAnalytics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'available': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': case 'failed': case 'revoked': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'slack': return <MessageSquare className="h-6 w-6" />;
      case 'github': return <Github className="h-6 w-6" />;
      case 'credit-card': return <CreditCard className="h-6 w-6" />;
      case 'zap': return <Zap className="h-6 w-6" />;
      case 'bar-chart': return <BarChart3 className="h-6 w-6" />;
      case 'palette': return <Palette className="h-6 w-6" />;
      case 'cloud': return <Cloud className="h-6 w-6" />;
      case 'message-square': return <MessageSquare className="h-6 w-6" />;
      default: return <Box className="h-6 w-6" />;
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect MakrCave with your favorite tools and services</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            API Docs
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Custom Integration
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Puzzle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.activeConnections}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.apiCalls.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">API Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Webhook className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.webhookDeliveries.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Webhooks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.uptime}%</p>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getIcon(integration.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{integration.provider}</p>
                      {integration.isOfficial && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Official
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{integration.description}</p>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Metrics for connected integrations */}
                  {integration.status === 'connected' && (
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">API Calls:</span>
                        <div className="font-medium">{integration.apiCalls?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Sync:</span>
                        <div className="font-medium">{integration.lastSync}</div>
                      </div>
                    </div>
                  )}

                  {/* Rating and Setup Info */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{integration.rating} ({integration.reviews})</span>
                      </div>
                      <Badge className={getComplexityColor(integration.setupComplexity)} variant="outline">
                        {integration.setupComplexity}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{integration.pricing}</div>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="flex items-center space-x-3 mb-4 text-xs text-gray-600">
                    {integration.oauth && (
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        OAuth
                      </div>
                    )}
                    {integration.webhook && (
                      <div className="flex items-center">
                        <Webhook className="h-3 w-3 mr-1" />
                        Webhooks
                      </div>
                    )}
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      API
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-3 w-3 mr-2" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </>
                    ) : integration.status === 'available' ? (
                      <>
                        <Button size="sm" className="flex-1">
                          <Plus className="h-3 w-3 mr-2" />
                          Connect
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </>
                    ) : integration.status === 'pending' ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1" disabled>
                          <Clock className="h-3 w-3 mr-2" />
                          Pending
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <AlertTriangle className="h-3 w-3 mr-2" />
                          Fix Issue
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">API Keys</h3>
              <p className="text-gray-600">Manage your API keys for external integrations</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{key.name}</h3>
                        <Badge className={getStatusColor(key.status)}>
                          {key.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {key.environment}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{key.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">{key.createdAt}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Used:</span>
                          <div className="font-medium">{key.lastUsed}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Requests:</span>
                          <div className="font-medium">{key.requests.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Rate Limit:</span>
                          <div className="font-medium">{key.rateLimit}/min</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center space-x-2">
                          <Input 
                            value={key.key} 
                            readOnly 
                            className="font-mono text-sm"
                          />
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Permissions: </span>
                        {key.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Webhooks</h3>
              <p className="text-gray-600">Configure real-time event notifications</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{webhook.name}</h3>
                        <Badge className={getStatusColor(webhook.status)}>
                          {webhook.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">URL:</span>
                          <div className="font-medium font-mono text-xs">{webhook.url}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Triggered:</span>
                          <div className="font-medium">{webhook.lastTriggered}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Calls:</span>
                          <div className="font-medium">{webhook.totalCalls.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Success Rate:</span>
                          <div className="font-medium">{webhook.successRate}%</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Events: </span>
                        {webhook.events.map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Success Rate</span>
                          <span className="font-medium">{webhook.successRate}%</span>
                        </div>
                        <Progress value={webhook.successRate} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>API Usage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>API Usage Chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Top Integrations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topIntegrations.map((integration, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{integration.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${integration.usage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{integration.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Uptime</span>
                      <span className="font-medium">{analytics.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-medium">{analytics.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate</span>
                      <span className="font-medium">{analytics.errorRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { event: 'Slack integration connected', time: '2 minutes ago', type: 'success' },
                      { event: 'API key created', time: '1 hour ago', type: 'info' },
                      { event: 'Webhook delivery failed', time: '3 hours ago', type: 'error' },
                      { event: 'GitHub sync completed', time: '6 hours ago', type: 'success' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <span className="flex-1">{activity.event}</span>
                        <span className="text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integrations;
