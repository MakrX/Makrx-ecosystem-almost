import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  MapPin,
  Users,
  Wrench,
  Plus,
  Edit,
  Trash2,
  Settings,
  Eye,
  Move,
  Maximize2,
  Clock,
  Target,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ZoneManagementPanelProps {
  metrics: any;
}

const ZoneManagementPanel: React.FC<ZoneManagementPanelProps> = ({ metrics }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const getZoneStatusColor = (utilization: number) => {
    if (utilization >= 90) return 'border-red-500 bg-red-50';
    if (utilization >= 75) return 'border-orange-500 bg-orange-50';
    if (utilization >= 50) return 'border-green-500 bg-green-50';
    return 'border-blue-500 bg-blue-50';
  };

  const getZoneStatusIcon = (utilization: number) => {
    if (utilization >= 90) return AlertTriangle;
    if (utilization >= 75) return Activity;
    return CheckCircle2;
  };

  const getZoneEfficiency = (zone: any) => {
    const utilizationRate = (zone.current_occupancy / zone.max_capacity) * 100;
    const equipmentEfficiency = (zone.equipment_count / zone.max_capacity) * 100;
    const sessionEfficiency = Math.min(100, (zone.avg_session_time / 4) * 100);
    
    return {
      overall: (utilizationRate * 0.4 + equipmentEfficiency * 0.3 + sessionEfficiency * 0.3),
      utilization: utilizationRate,
      equipment: equipmentEfficiency,
      session: sessionEfficiency
    };
  };

  return (
    <div className="space-y-6">
      {/* Zone Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zone Management</h2>
          <p className="text-gray-600">Configure and optimize individual zones for maximum efficiency</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
          <Button variant="outline" onClick={() => setEditMode(!editMode)}>
            <Edit className="h-4 w-4 mr-2" />
            {editMode ? 'Exit Edit' : 'Edit Layout'}
          </Button>
        </div>
      </div>

      {/* Zone Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {metrics.zones.map((zone: any) => {
          const efficiency = getZoneEfficiency(zone);
          const StatusIcon = getZoneStatusIcon(efficiency.utilization);
          
          return (
            <Card 
              key={zone.id}
              className={`border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                selectedZone === zone.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : getZoneStatusColor(efficiency.utilization)
              }`}
              onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <p className="text-sm text-gray-600">{zone.id}</p>
                    </div>
                  </div>
                  <StatusIcon className={`h-5 w-5 ${
                    efficiency.utilization >= 90 ? 'text-red-500' :
                    efficiency.utilization >= 75 ? 'text-orange-500' :
                    'text-green-500'
                  }`} />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Zone Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {zone.current_occupancy}/{zone.max_capacity}
                    </div>
                    <div className="text-xs text-gray-600">Occupancy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {efficiency.overall.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {zone.equipment_count}
                    </div>
                    <div className="text-xs text-gray-600">Equipment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {zone.avg_session_time}h
                    </div>
                    <div className="text-xs text-gray-600">Avg Session</div>
                  </div>
                </div>

                {/* Efficiency Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Space Utilization</span>
                    <span className="font-medium">{efficiency.utilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, efficiency.utilization)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>Equipment Density</span>
                    <span className="font-medium">{efficiency.equipment.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, efficiency.equipment)}%` }}
                    />
                  </div>
                </div>

                {/* Zone Status */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge className={
                    efficiency.utilization >= 90 ? 'bg-red-100 text-red-800 border-red-200' :
                    efficiency.utilization >= 75 ? 'bg-orange-100 text-orange-800 border-orange-200' :
                    efficiency.utilization >= 50 ? 'bg-green-100 text-green-800 border-green-200' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }>
                    {efficiency.utilization >= 90 ? 'Critical' :
                     efficiency.utilization >= 75 ? 'High' :
                     efficiency.utilization >= 50 ? 'Optimal' : 'Low'}
                  </Badge>
                  
                  {editMode && (
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Move className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {selectedZone === zone.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <h4 className="font-semibold text-gray-900">Zone Details</h4>
                    
                    {/* Configuration */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-600">Max Capacity</label>
                        <Input 
                          value={zone.max_capacity} 
                          disabled={!editMode}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600">Equipment Slots</label>
                        <Input 
                          value={zone.equipment_count} 
                          disabled={!editMode}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">Peak Hours</div>
                        <div className="text-gray-600">2-4 PM</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">Turnover</div>
                        <div className="text-gray-600">8.5/day</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">Revenue</div>
                        <div className="text-gray-600">$145/day</div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Maximize2 className="h-3 w-3 mr-2" />
                        Optimize
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Zone Layout Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Floor Plan Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 rounded-lg p-4 relative">
            {/* Simplified floor plan representation */}
            <div className="grid grid-cols-2 gap-4 h-full">
              {metrics.zones.map((zone: any, index: number) => {
                const efficiency = getZoneEfficiency(zone);
                
                return (
                  <div 
                    key={zone.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedZone === zone.id 
                        ? 'border-blue-500 bg-blue-100' 
                        : getZoneStatusColor(efficiency.utilization)
                    }`}
                    onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  >
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">{zone.name}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{zone.current_occupancy}/{zone.max_capacity}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Wrench className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{zone.equipment_count} items</span>
                        </div>
                        <Badge className={
                          efficiency.utilization >= 90 ? 'bg-red-100 text-red-800' :
                          efficiency.utilization >= 75 ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {efficiency.utilization.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
              <h5 className="font-medium text-sm mb-2">Utilization Levels</h5>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-200 border border-red-500 rounded"></div>
                  <span>Critical (&gt;90%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-200 border border-orange-500 rounded"></div>
                  <span>High (75-90%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-200 border border-green-500 rounded"></div>
                  <span>Optimal (&lt;75%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Zone Optimization Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.zones.map((zone: any) => {
              const efficiency = getZoneEfficiency(zone);
              
              // Generate recommendations based on zone efficiency
              const recommendations = [];
              
              if (efficiency.utilization > 85) {
                recommendations.push({
                  type: 'capacity',
                  title: 'Increase Capacity',
                  description: `${zone.name} is operating at ${efficiency.utilization.toFixed(1)}% capacity. Consider expanding or redistributing load.`,
                  priority: 'high'
                });
              }
              
              if (efficiency.equipment < 50) {
                recommendations.push({
                  type: 'equipment',
                  title: 'Optimize Equipment Layout',
                  description: `${zone.name} has low equipment density. Consider relocating underutilized equipment here.`,
                  priority: 'medium'
                });
              }
              
              if (zone.avg_session_time > 4) {
                recommendations.push({
                  type: 'workflow',
                  title: 'Improve Workflow Efficiency',
                  description: `Average session time in ${zone.name} is ${zone.avg_session_time}h. Consider workflow optimization.`,
                  priority: 'low'
                });
              }
              
              return recommendations.map((rec, index) => (
                <div key={`${zone.id}-${index}`} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      rec.priority === 'high' ? 'bg-red-100' :
                      rec.priority === 'medium' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      <Target className={`h-4 w-4 ${
                        rec.priority === 'high' ? 'text-red-600' :
                        rec.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge className={
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">{rec.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ));
            }).flat()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZoneManagementPanel;
