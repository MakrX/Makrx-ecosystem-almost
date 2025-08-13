import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Brain,
  Zap,
  Target,
  Settings,
  TrendingUp,
  Clock,
  Users,
  Wrench,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  Download,
  Eye,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';

interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  type: 'equipment' | 'scheduling' | 'layout' | 'capacity';
  current_efficiency: number;
  projected_efficiency: number;
  implementation_cost: number;
  implementation_time: string;
  roi_timeframe: string;
  benefits: string[];
  risks: string[];
  requirements: string[];
  status: 'available' | 'in_progress' | 'completed' | 'blocked';
}

interface OptimizationResult {
  scenario_id: string;
  success_probability: number;
  expected_improvement: number;
  resource_changes: Array<{
    resource: string;
    change_type: 'relocate' | 'add' | 'remove' | 'modify';
    from_zone?: string;
    to_zone?: string;
    impact: number;
  }>;
  timeline: Array<{
    phase: string;
    duration: string;
    cost: number;
    requirements: string[];
  }>;
}

interface ResourceOptimizationEngineProps {
  metrics: any;
}

const ResourceOptimizationEngine: React.FC<ResourceOptimizationEngineProps> = ({ metrics }) => {
  const [optimizationScenarios, setOptimizationScenarios] = useState<OptimizationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  useEffect(() => {
    generateOptimizationScenarios();
  }, [metrics]);

  const generateOptimizationScenarios = () => {
    const scenarios: OptimizationScenario[] = [
      {
        id: 'equipment-redistribution',
        name: 'Equipment Redistribution',
        description: 'Optimize equipment placement based on usage patterns and zone capacity',
        type: 'equipment',
        current_efficiency: 68,
        projected_efficiency: 84,
        implementation_cost: 2500,
        implementation_time: '2-3 days',
        roi_timeframe: '6 weeks',
        benefits: [
          'Reduce equipment wait times by 35%',
          'Increase zone utilization by 16%',
          'Improve member satisfaction scores',
          'Better equipment accessibility'
        ],
        risks: [
          'Temporary disruption during move',
          'Member adaptation period',
          'Potential workflow changes'
        ],
        requirements: [
          'Equipment moving crew',
          'Updated zone layouts',
          'Member communication plan'
        ],
        status: 'available'
      },
      {
        id: 'dynamic-scheduling',
        name: 'Dynamic Scheduling System',
        description: 'Implement AI-driven scheduling to balance load across peak and off-peak hours',
        type: 'scheduling',
        current_efficiency: 62,
        projected_efficiency: 78,
        implementation_cost: 5000,
        implementation_time: '3-4 weeks',
        roi_timeframe: '3 months',
        benefits: [
          'Reduce peak hour congestion by 28%',
          'Increase off-peak utilization by 45%',
          'Dynamic pricing optimization',
          'Automated conflict resolution'
        ],
        risks: [
          'System integration complexity',
          'Member resistance to dynamic pricing',
          'Learning curve for staff'
        ],
        requirements: [
          'Software development',
          'Integration with booking system',
          'Staff training',
          'Member education'
        ],
        status: 'available'
      },
      {
        id: 'zone-reconfiguration',
        name: 'Zone Layout Optimization',
        description: 'Reconfigure physical zones to maximize space efficiency and workflow',
        type: 'layout',
        current_efficiency: 71,
        projected_efficiency: 89,
        implementation_cost: 12000,
        implementation_time: '1-2 weeks',
        roi_timeframe: '4 months',
        benefits: [
          'Increase capacity by 22%',
          'Improve workflow efficiency',
          'Better noise isolation',
          'Enhanced safety protocols'
        ],
        risks: [
          'High implementation cost',
          'Extended downtime required',
          'Potential permit requirements'
        ],
        requirements: [
          'Space planning consultant',
          'Construction permits',
          'Temporary alternative space',
          'Updated safety protocols'
        ],
        status: 'available'
      },
      {
        id: 'capacity-expansion',
        name: 'Strategic Capacity Expansion',
        description: 'Add capacity in high-demand areas based on predictive analytics',
        type: 'capacity',
        current_efficiency: 72,
        projected_efficiency: 92,
        implementation_cost: 25000,
        implementation_time: '6-8 weeks',
        roi_timeframe: '8 months',
        benefits: [
          'Handle 40% more concurrent users',
          'Reduce wait lists by 60%',
          'Support growth for 2+ years',
          'Improve member retention'
        ],
        risks: [
          'Significant capital investment',
          'Extended implementation time',
          'Market demand uncertainty'
        ],
        requirements: [
          'Space availability',
          'Budget approval',
          'Permit acquisition',
          'Staff hiring and training'
        ],
        status: 'blocked'
      }
    ];

    setOptimizationScenarios(scenarios);
  };

  const runOptimization = async (scenarioId: string) => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setSelectedScenario(scenarioId);

    // Simulate optimization process
    const progressSteps = [
      { step: 'Analyzing current state', progress: 20 },
      { step: 'Running optimization algorithms', progress: 40 },
      { step: 'Evaluating scenarios', progress: 60 },
      { step: 'Calculating impact', progress: 80 },
      { step: 'Generating recommendations', progress: 100 }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setOptimizationProgress(step.progress);
    }

    // Generate mock optimization results
    const mockResult: OptimizationResult = {
      scenario_id: scenarioId,
      success_probability: Math.random() * 20 + 75, // 75-95%
      expected_improvement: Math.random() * 20 + 15, // 15-35%
      resource_changes: [
        {
          resource: '3D Printer Array',
          change_type: 'relocate',
          from_zone: 'Main Workshop',
          to_zone: '3D Printing Bay',
          impact: 25
        },
        {
          resource: 'Electronics Workstations',
          change_type: 'add',
          to_zone: 'Electronics Lab',
          impact: 18
        },
        {
          resource: 'Underutilized Laser Engraver',
          change_type: 'relocate',
          from_zone: 'Meeting Room',
          to_zone: 'Main Workshop',
          impact: 12
        }
      ],
      timeline: [
        {
          phase: 'Planning & Preparation',
          duration: '3 days',
          cost: 500,
          requirements: ['Layout planning', 'Equipment audit', 'Staff coordination']
        },
        {
          phase: 'Implementation',
          duration: '2 days',
          cost: 1500,
          requirements: ['Equipment relocation', 'Zone reconfiguration', 'Safety checks']
        },
        {
          phase: 'Testing & Validation',
          duration: '1 week',
          cost: 300,
          requirements: ['System testing', 'Member feedback', 'Performance monitoring']
        }
      ]
    };

    setOptimizationResults(mockResult);
    setIsOptimizing(false);
  };

  const getScenarioTypeIcon = (type: string) => {
    switch (type) {
      case 'equipment': return Wrench;
      case 'scheduling': return Clock;
      case 'layout': return MapPin;
      case 'capacity': return Users;
      default: return Target;
    }
  };

  const getScenarioTypeColor = (type: string) => {
    switch (type) {
      case 'equipment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduling': return 'bg-green-100 text-green-800 border-green-200';
      case 'layout': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'capacity': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement >= 20) return 'text-green-600';
    if (improvement >= 10) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Optimization Engine Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>AI-Powered Resource Optimization Engine</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Intelligent recommendations to maximize space efficiency and resource utilization
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {optimizationScenarios.filter(s => s.status === 'available').length} scenarios available
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Optimization Progress */}
      {isOptimizing && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Optimizing Resources</h3>
                <p className="text-gray-600">Running AI algorithms to find the best configuration...</p>
              </div>
              <Progress value={optimizationProgress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-gray-500">{optimizationProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {optimizationScenarios.map(scenario => {
          const TypeIcon = getScenarioTypeIcon(scenario.type);
          const improvementPotential = scenario.projected_efficiency - scenario.current_efficiency;
          
          return (
            <Card 
              key={scenario.id}
              className={`border-2 transition-all duration-200 hover:shadow-lg ${
                selectedScenario === scenario.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <TypeIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(scenario.status)}>
                    {scenario.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Type and Metrics */}
                <div className="flex items-center justify-between">
                  <Badge className={getScenarioTypeColor(scenario.type)}>
                    {scenario.type}
                  </Badge>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getImprovementColor(improvementPotential)}`}>
                      +{improvementPotential.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">efficiency gain</div>
                  </div>
                </div>

                {/* Current vs Projected Efficiency */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Efficiency</span>
                    <span className="font-medium">{scenario.current_efficiency}%</span>
                  </div>
                  <Progress value={scenario.current_efficiency} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Projected Efficiency</span>
                    <span className="font-medium text-green-600">{scenario.projected_efficiency}%</span>
                  </div>
                  <Progress value={scenario.projected_efficiency} className="h-2" />
                </div>

                {/* Implementation Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Implementation Cost</div>
                    <div className="font-medium">${scenario.implementation_cost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Timeline</div>
                    <div className="font-medium">{scenario.implementation_time}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">ROI Timeline</div>
                    <div className="font-medium">{scenario.roi_timeframe}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Benefits</div>
                    <div className="font-medium">{scenario.benefits.length} identified</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    onClick={() => runOptimization(scenario.id)}
                    disabled={scenario.status === 'blocked' || isOptimizing}
                    className="flex-1"
                  >
                    {isOptimizing && selectedScenario === scenario.id ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Analysis
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Optimization Results */}
      {optimizationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Optimization Results</span>
              <Badge className="bg-green-100 text-green-800">
                {optimizationResults.success_probability.toFixed(1)}% success probability
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="changes">Resource Changes</TabsTrigger>
                <TabsTrigger value="timeline">Implementation</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        +{optimizationResults.expected_improvement.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Expected Improvement</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {optimizationResults.resource_changes.length}
                      </div>
                      <div className="text-sm text-gray-600">Resource Changes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {optimizationResults.timeline.length}
                      </div>
                      <div className="text-sm text-gray-600">Implementation Phases</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Recommendation</h4>
                      <p className="text-green-800 text-sm">
                        This optimization scenario shows strong potential for improving overall efficiency. 
                        The {optimizationResults.success_probability.toFixed(1)}% success probability and 
                        {optimizationResults.expected_improvement.toFixed(1)}% improvement make this a valuable investment.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="changes" className="space-y-4">
                <div className="space-y-3">
                  {optimizationResults.resource_changes.map((change, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{change.resource}</h4>
                        <Badge variant="outline">{change.change_type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {change.change_type === 'relocate' && (
                          <div className="flex items-center space-x-2">
                            <span>Move from {change.from_zone}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>to {change.to_zone}</span>
                          </div>
                        )}
                        {change.change_type === 'add' && (
                          <span>Add to {change.to_zone}</span>
                        )}
                        {change.change_type === 'remove' && (
                          <span>Remove from {change.from_zone}</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Expected Impact</span>
                          <span className="font-medium text-green-600">+{change.impact}% efficiency</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  {optimizationResults.timeline.map((phase, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{phase.phase}</h4>
                        <div className="text-right">
                          <div className="font-medium">{phase.duration}</div>
                          <div className="text-sm text-gray-600">${phase.cost.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Requirements:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {phase.requirements.map((req, reqIndex) => (
                            <div key={reqIndex} className="flex items-center space-x-2 text-sm">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Implementation
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Plan
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResourceOptimizationEngine;
