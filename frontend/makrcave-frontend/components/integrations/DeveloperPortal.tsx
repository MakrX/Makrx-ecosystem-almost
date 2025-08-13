import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Code,
  FileText,
  Terminal,
  Book,
  Download,
  ExternalLink,
  Copy,
  Play,
  CheckCircle2,
  Globe,
  Github,
  Key,
  Shield,
  Zap,
  Users,
  Star,
  Activity,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  Webhook,
  Database,
  Server,
  Cpu,
  Cloud,
  Smartphone,
  Monitor,
  Lock,
  Unlock,
  Target,
  Lightbulb,
  Coffee,
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  Video,
  Headphones,
  Camera,
  Image as ImageIcon,
  FileCode,
  FileJson,
  Package,
  Layers,
  Puzzle,
  Wrench
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responses: Array<{
    status: number;
    description: string;
    example: string;
  }>;
  rateLimit: number;
  authentication: 'none' | 'api_key' | 'oauth' | 'bearer';
  deprecated: boolean;
}

interface SDK {
  id: string;
  name: string;
  language: string;
  version: string;
  description: string;
  installation: string;
  examples: string[];
  documentation: string;
  repository: string;
  downloads: number;
  lastUpdated: string;
  status: 'stable' | 'beta' | 'alpha' | 'deprecated';
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  prerequisites: string[];
  tags: string[];
  author: string;
  publishDate: string;
  lastUpdated: string;
  likes: number;
  steps: number;
  codeExamples: number;
}

const DeveloperPortal: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  // Mock API endpoints
  const apiEndpoints: APIEndpoint[] = [
    {
      id: 'get-equipment',
      method: 'GET',
      path: '/api/v1/equipment',
      description: 'Retrieve a list of all equipment in the makerspace',
      category: 'Equipment',
      parameters: [
        { name: 'status', type: 'string', required: false, description: 'Filter by equipment status' },
        { name: 'category', type: 'string', required: false, description: 'Filter by equipment category' },
        { name: 'limit', type: 'integer', required: false, description: 'Number of items to return (max 100)' }
      ],
      responses: [
        { status: 200, description: 'Successful response', example: '{"equipment": [...], "total": 50}' },
        { status: 400, description: 'Bad request', example: '{"error": "Invalid parameters"}' }
      ],
      rateLimit: 1000,
      authentication: 'api_key',
      deprecated: false
    },
    {
      id: 'create-reservation',
      method: 'POST',
      path: '/api/v1/reservations',
      description: 'Create a new equipment reservation',
      category: 'Reservations',
      parameters: [
        { name: 'equipment_id', type: 'string', required: true, description: 'ID of the equipment to reserve' },
        { name: 'start_time', type: 'datetime', required: true, description: 'Reservation start time (ISO 8601)' },
        { name: 'duration', type: 'integer', required: true, description: 'Duration in minutes' }
      ],
      responses: [
        { status: 201, description: 'Reservation created', example: '{"reservation_id": "res_123", "status": "confirmed"}' },
        { status: 409, description: 'Equipment unavailable', example: '{"error": "Equipment already reserved"}' }
      ],
      rateLimit: 500,
      authentication: 'bearer',
      deprecated: false
    }
  ];

  // Mock SDKs
  const sdks: SDK[] = [
    {
      id: 'javascript-sdk',
      name: 'MakrCave JavaScript SDK',
      language: 'JavaScript',
      version: '2.1.0',
      description: 'Official JavaScript/Node.js SDK for the MakrCave API',
      installation: 'npm install @makrcave/sdk',
      examples: [
        'const makrCave = new MakrCave(apiKey);',
        'const equipment = await makrCave.equipment.list();'
      ],
      documentation: 'https://docs.makrcave.com/sdks/javascript',
      repository: 'https://github.com/makrcave/javascript-sdk',
      downloads: 15420,
      lastUpdated: '2024-12-15',
      status: 'stable'
    },
    {
      id: 'python-sdk',
      name: 'MakrCave Python SDK',
      language: 'Python',
      version: '1.8.2',
      description: 'Official Python SDK for the MakrCave API',
      installation: 'pip install makrcave',
      examples: [
        'from makrcave import MakrCave',
        'client = MakrCave(api_key=api_key)',
        'equipment = client.equipment.list()'
      ],
      documentation: 'https://docs.makrcave.com/sdks/python',
      repository: 'https://github.com/makrcave/python-sdk',
      downloads: 8932,
      lastUpdated: '2024-12-10',
      status: 'stable'
    },
    {
      id: 'react-sdk',
      name: 'MakrCave React Components',
      language: 'React',
      version: '0.9.1',
      description: 'React components and hooks for MakrCave integration',
      installation: 'npm install @makrcave/react',
      examples: [
        'import { useEquipment } from "@makrcave/react";',
        'const { equipment, loading } = useEquipment();'
      ],
      documentation: 'https://docs.makrcave.com/sdks/react',
      repository: 'https://github.com/makrcave/react-sdk',
      downloads: 3245,
      lastUpdated: '2024-12-08',
      status: 'beta'
    }
  ];

  // Mock tutorials
  const tutorials: Tutorial[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with MakrCave API',
      description: 'Learn the basics of authenticating and making your first API calls',
      category: 'Getting Started',
      difficulty: 'beginner',
      duration: 15,
      prerequisites: ['Basic programming knowledge'],
      tags: ['API', 'Authentication', 'Basics'],
      author: 'MakrCave Team',
      publishDate: '2024-11-01',
      lastUpdated: '2024-12-01',
      likes: 89,
      steps: 5,
      codeExamples: 8
    },
    {
      id: 'webhooks-guide',
      title: 'Setting Up Real-time Webhooks',
      description: 'Configure webhooks to receive real-time notifications about equipment status changes',
      category: 'Webhooks',
      difficulty: 'intermediate',
      duration: 30,
      prerequisites: ['Basic API knowledge', 'Web server setup'],
      tags: ['Webhooks', 'Real-time', 'Events'],
      author: 'Alex Developer',
      publishDate: '2024-10-15',
      lastUpdated: '2024-11-20',
      likes: 67,
      steps: 8,
      codeExamples: 12
    },
    {
      id: 'reservation-system',
      title: 'Building a Custom Reservation System',
      description: 'Create a full-featured equipment reservation system using the MakrCave API',
      category: 'Integration',
      difficulty: 'advanced',
      duration: 120,
      prerequisites: ['JavaScript/React', 'API integration experience'],
      tags: ['Reservations', 'Full-stack', 'React'],
      author: 'Sarah Engineer',
      publishDate: '2024-09-20',
      lastUpdated: '2024-11-15',
      likes: 134,
      steps: 15,
      codeExamples: 25
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      case 'alpha': return 'bg-orange-100 text-orange-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const codeExamples = {
    javascript: `// Initialize the MakrCave client
const MakrCave = require('@makrcave/sdk');
const client = new MakrCave({
  apiKey: 'your_api_key_here'
});

// Get all equipment
async function getEquipment() {
  try {
    const equipment = await client.equipment.list({
      status: 'available',
      limit: 10
    });
    console.log(equipment);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Create a reservation
async function createReservation() {
  const reservation = await client.reservations.create({
    equipment_id: 'eq_123',
    start_time: '2024-12-20T10:00:00Z',
    duration: 120
  });
  return reservation;
}`,
    python: `# Install: pip install makrcave
from makrcave import MakrCave

# Initialize client
client = MakrCave(api_key='your_api_key_here')

# Get all equipment
equipment = client.equipment.list(
    status='available',
    limit=10
)

# Create a reservation
reservation = client.reservations.create(
    equipment_id='eq_123',
    start_time='2024-12-20T10:00:00Z',
    duration=120
)

print(f"Reservation created: {reservation.id}")`,
    curl: `# Get equipment list
curl -X GET "https://api.makrcave.com/v1/equipment" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"

# Create a reservation
curl -X POST "https://api.makrcave.com/v1/reservations" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "equipment_id": "eq_123",
    "start_time": "2024-12-20T10:00:00Z",
    "duration": 120
  }'`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Developer Portal</h2>
          <p className="text-gray-600">Build powerful integrations with the MakrCave platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
          <Button>
            <Key className="h-4 w-4 mr-2" />
            Get API Key
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{apiEndpoints.length}</p>
                <p className="text-sm text-gray-600">API Endpoints</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sdks.length}</p>
                <p className="text-sm text-gray-600">SDKs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Book className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tutorials.length}</p>
                <p className="text-sm text-gray-600">Tutorials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.5K</p>
                <p className="text-sm text-gray-600">Developers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Start</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <div className="font-medium">Get an API Key</div>
                      <div className="text-sm text-gray-600">Sign up and generate your API key</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">2</span>
                    </div>
                    <div>
                      <div className="font-medium">Install an SDK</div>
                      <div className="text-sm text-gray-600">Choose from our official SDKs</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">3</span>
                    </div>
                    <div>
                      <div className="font-medium">Make Your First Call</div>
                      <div className="text-sm text-gray-600">Start building your integration</div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Code className="h-4 w-4 mr-2" />
                  View Quick Start Guide
                </Button>
              </CardContent>
            </Card>

            {/* Popular Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Popular Endpoints</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiEndpoints.slice(0, 4).map((endpoint) => (
                    <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">{endpoint.path}</div>
                          <div className="text-xs text-gray-600">{endpoint.description}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5" />
                  <span>Example Code</span>
                </div>
                <div className="flex space-x-2">
                  {Object.keys(codeExamples).map((lang) => (
                    <Button
                      key={lang}
                      size="sm"
                      variant={selectedLanguage === lang ? "default" : "outline"}
                      onClick={() => setSelectedLanguage(lang)}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples[selectedLanguage as keyof typeof codeExamples]}</code>
                </pre>
                <Button size="sm" variant="outline" className="absolute top-2 right-2">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api-reference" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Endpoint List */}
            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search endpoints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {apiEndpoints.map((endpoint) => (
                      <button
                        key={endpoint.id}
                        onClick={() => setSelectedEndpoint(endpoint.id)}
                        className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                          selectedEndpoint === endpoint.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <span className="font-mono text-sm">{endpoint.path}</span>
                        </div>
                        <div className="text-xs text-gray-600">{endpoint.description}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Endpoint Details */}
            <div className="lg:w-2/3">
              {selectedEndpoint ? (
                (() => {
                  const endpoint = apiEndpoints.find(e => e.id === selectedEndpoint);
                  if (!endpoint) return null;
                  
                  return (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getMethodColor(endpoint.method)}>
                                {endpoint.method}
                              </Badge>
                              <span className="font-mono text-lg">{endpoint.path}</span>
                            </div>
                            <p className="text-gray-600">{endpoint.description}</p>
                          </div>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Try It
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Parameters */}
                        <div>
                          <h4 className="font-semibold mb-3">Parameters</h4>
                          <div className="space-y-2">
                            {endpoint.parameters.map((param, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium">{param.name}</span>
                                  <Badge variant="outline">{param.type}</Badge>
                                  {param.required && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700">
                                      required
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Responses */}
                        <div>
                          <h4 className="font-semibold mb-3">Responses</h4>
                          <div className="space-y-2">
                            {endpoint.responses.map((response, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className={response.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {response.status}
                                  </Badge>
                                  <span className="font-medium">{response.description}</span>
                                </div>
                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                                  <code>{response.example}</code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Authentication */}
                        <div>
                          <h4 className="font-semibold mb-3">Authentication</h4>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="capitalize">{endpoint.authentication.replace('_', ' ')}</span>
                            <Badge variant="outline">
                              {endpoint.rateLimit} requests/hour
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an endpoint</h3>
                    <p className="text-gray-600">Choose an endpoint from the list to view its documentation</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* SDKs Tab */}
        <TabsContent value="sdks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sdks.map((sdk) => (
              <Card key={sdk.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Code className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{sdk.name}</h3>
                        <Badge className={getStatusColor(sdk.status)}>
                          {sdk.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">v{sdk.version}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4">{sdk.description}</p>

                  {/* Installation */}
                  <div className="mb-4">
                    <h5 className="font-medium text-sm mb-2">Installation</h5>
                    <div className="bg-gray-100 p-2 rounded font-mono text-sm flex items-center justify-between">
                      <code>{sdk.installation}</code>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Downloads:</span>
                      <div className="font-medium">{sdk.downloads.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated:</span>
                      <div className="font-medium">{sdk.lastUpdated}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <FileText className="h-3 w-3 mr-2" />
                      Docs
                    </Button>
                    <Button size="sm" variant="outline">
                      <Github className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{tutorial.title}</h3>
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{tutorial.description}</p>
                  </div>

                  {/* Tutorial Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{tutorial.duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <FileCode className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{tutorial.codeExamples} examples</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tutorial.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Author and Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>by {tutorial.author}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        <span>{tutorial.likes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Tutorial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Playground Tab */}
        <TabsContent value="playground" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>API Playground</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Terminal className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive API Testing</h3>
                <p className="text-gray-600 mb-6">Test API endpoints directly in your browser with real data</p>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Launch Playground
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperPortal;
