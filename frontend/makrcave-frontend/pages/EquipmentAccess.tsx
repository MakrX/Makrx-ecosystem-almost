import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import MachineAccessDashboard from '../components/MachineAccessDashboard';
import BadgeSystem from '../components/BadgeSystem';
import {
  Shield, Lock, Unlock, Key, QrCode, Smartphone, Clock,
  CheckCircle, XCircle, AlertTriangle, Trophy, Award,
  Users, Settings, BarChart3, Activity, Zap, Target
} from 'lucide-react';

// Types
interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string;
  requires_certification: boolean;
  access_level_required?: string;
  current_user?: string;
  estimated_available_at?: string;
}

interface AccessRule {
  id: string;
  equipment_id: string;
  required_skill_id: string;
  minimum_skill_level: string;
  requires_supervisor: boolean;
  max_session_hours?: number;
  rule_name: string;
  is_active: boolean;
}

interface UserCertification {
  id: string;
  skill_id: string;
  equipment_id?: string;
  certification_level: string;
  status: string;
  expires_at?: string;
  total_usage_hours: number;
}

interface AccessStats {
  total_equipment: number;
  accessible_equipment: number;
  pending_certifications: number;
  active_sessions: number;
  recent_access_success_rate: number;
  safety_score: number;
}

const EquipmentAccess: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [accessRules, setAccessRules] = useState<AccessRule[]>([]);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
  const [accessStats, setAccessStats] = useState<AccessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showAccessRequest, setShowAccessRequest] = useState(false);

  // Mock data - in real implementation this would come from APIs
  const mockEquipment: Equipment[] = [
    {
      id: 'printer_1',
      name: '3D Printer (Prusa i3 MK3S+)',
      category: 'printer_3d',
      status: 'available',
      location: 'Station A1',
      requires_certification: true,
      access_level_required: 'basic'
    },
    {
      id: 'laser_1',
      name: 'Laser Cutter (Glowforge Pro)',
      category: 'laser_cutter',
      status: 'in_use',
      location: 'Station B2',
      requires_certification: true,
      access_level_required: 'intermediate',
      current_user: 'user_123',
      estimated_available_at: '2024-01-15T16:30:00Z'
    },
    {
      id: 'cnc_1',
      name: 'CNC Mill (Haas Mini Mill)',
      category: 'cnc_machine',
      status: 'maintenance',
      location: 'Station C1',
      requires_certification: true,
      access_level_required: 'advanced'
    },
    {
      id: 'solder_1',
      name: 'Soldering Station',
      category: 'soldering_station',
      status: 'available',
      location: 'Electronics Bench 1',
      requires_certification: false
    }
  ];

  const mockCertifications: UserCertification[] = [
    {
      id: 'cert_1',
      skill_id: '3d_printing_basic',
      certification_level: 'basic',
      status: 'active',
      expires_at: '2024-12-31T23:59:59Z',
      total_usage_hours: 45.5
    },
    {
      id: 'cert_2',
      skill_id: 'laser_cutting_safety',
      certification_level: 'intermediate',
      status: 'expired',
      expires_at: '2024-01-01T00:00:00Z',
      total_usage_hours: 12.0
    }
  ];

  const mockAccessStats: AccessStats = {
    total_equipment: 25,
    accessible_equipment: 18,
    pending_certifications: 2,
    active_sessions: 1,
    recent_access_success_rate: 87.5,
    safety_score: 95
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // In real implementation, these would be API calls
      setEquipment(mockEquipment);
      setUserCertifications(mockCertifications);
      setAccessStats(mockAccessStats);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load equipment access data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Request equipment access
  const requestEquipmentAccess = async (equipmentId: string) => {
    try {
      // This would be an actual API call
      const response = await fetch('/api/v1/machine-access/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          equipment_id: equipmentId,
          access_method: 'mobile_app',
          session_duration_hours: 2
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Access Granted!",
            description: `You now have access to ${selectedEquipment?.name}`,
          });
        } else {
          toast({
            title: "Access Denied",
            description: result.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Failed to request access:', error);
      toast({
        title: "Error",
        description: "Failed to request equipment access. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check if user can access equipment
  const canAccessEquipment = (equip: Equipment): boolean => {
    if (!equip.requires_certification) return true;
    
    const relevantCert = userCertifications.find(cert => 
      cert.skill_id.includes(equip.category) && cert.status === 'active'
    );
    
    return !!relevantCert;
  };

  // Get equipment status info
  const getEquipmentStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { color: 'green', icon: CheckCircle, label: 'Available' };
      case 'in_use':
        return { color: 'yellow', icon: Clock, label: 'In Use' };
      case 'maintenance':
        return { color: 'red', icon: AlertTriangle, label: 'Maintenance' };
      case 'offline':
        return { color: 'gray', icon: XCircle, label: 'Offline' };
      default:
        return { color: 'gray', icon: XCircle, label: 'Unknown' };
    }
  };

  // Get access level color
  const getAccessLevelColor = (level?: string) => {
    switch (level) {
      case 'basic': return 'green';
      case 'intermediate': return 'blue';
      case 'advanced': return 'orange';
      case 'expert': return 'purple';
      default: return 'gray';
    }
  };

  // Initialize data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading equipment access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Equipment Access</h1>
          <p className="text-muted-foreground">
            Skill-gated machine access, certifications, and badges
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAccessRequest(true)}>
            <Key className="h-4 w-4 mr-2" />
            Quick Access
          </Button>
          <Button>
            <QrCode className="h-4 w-4 mr-2" />
            Scan Badge
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {accessStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                  <p className="text-2xl font-bold">{accessStats.total_equipment}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accessible</p>
                  <p className="text-2xl font-bold">{accessStats.accessible_equipment}</p>
                </div>
                <Unlock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Certs</p>
                  <p className="text-2xl font-bold">{accessStats.pending_certifications}</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">{accessStats.active_sessions}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{accessStats.recent_access_success_rate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Safety Score</p>
                  <p className="text-2xl font-bold">{accessStats.safety_score}/100</p>
                </div>
                {accessStats.safety_score >= 90 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Equipment Overview</TabsTrigger>
          <TabsTrigger value="access-control">Access Control</TabsTrigger>
          <TabsTrigger value="badges">Badge System</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Equipment Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((equip) => {
              const statusInfo = getEquipmentStatusInfo(equip.status);
              const StatusIcon = statusInfo.icon;
              const hasAccess = canAccessEquipment(equip);
              
              return (
                <Card key={equip.id} className={`${hasAccess ? '' : 'opacity-75'} hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{equip.name}</h3>
                        <p className="text-sm text-muted-foreground">{equip.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>

                    {equip.requires_certification && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Certification Required</span>
                        </div>
                        {equip.access_level_required && (
                          <Badge variant="outline" className={`bg-${getAccessLevelColor(equip.access_level_required)}-100 text-${getAccessLevelColor(equip.access_level_required)}-800`}>
                            {equip.access_level_required} level
                          </Badge>
                        )}
                      </div>
                    )}

                    {equip.current_user && (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">Currently in use</span>
                        </div>
                        {equip.estimated_available_at && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Available at {new Date(equip.estimated_available_at).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      {hasAccess ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Unlock className="h-4 w-4" />
                          <span className="text-sm font-medium">Access Granted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm font-medium">Access Restricted</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {equip.status === 'available' && hasAccess && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedEquipment(equip);
                              requestEquipmentAccess(equip.id);
                            }}
                          >
                            <Key className="h-3 w-3 mr-1" />
                            Access
                          </Button>
                        )}
                        
                        {!hasAccess && equip.requires_certification && (
                          <Button variant="outline" size="sm">
                            <Target className="h-3 w-3 mr-1" />
                            Get Certified
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* User Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>My Certifications</CardTitle>
              <CardDescription>Your current skill certifications and access levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCertifications.map((cert) => (
                  <Card key={cert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{cert.skill_id.replace('_', ' ').toUpperCase()}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cert.equipment_id || 'General Skill'}
                          </p>
                        </div>
                        <Badge variant={cert.status === 'active' ? 'default' : 'secondary'} className={`bg-${getAccessLevelColor(cert.certification_level)}-100 text-${getAccessLevelColor(cert.certification_level)}-800`}>
                          {cert.certification_level}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                            {cert.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Usage Hours:</span>
                          <span>{cert.total_usage_hours.toFixed(1)}h</span>
                        </div>
                        
                        {cert.expires_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires:</span>
                            <span className={new Date(cert.expires_at) < new Date() ? 'text-red-600' : ''}>
                              {new Date(cert.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {cert.status === 'expired' && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full">
                            <Zap className="h-3 w-3 mr-1" />
                            Renew Certification
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {userCertifications.length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center">
                      <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No certifications yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Get certified to access equipment and improve your skills
                      </p>
                      <Button>
                        <Target className="h-4 w-4 mr-2" />
                        Browse Available Certifications
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access-control">
          <MachineAccessDashboard />
        </TabsContent>

        {/* Badge System Tab */}
        <TabsContent value="badges">
          <BadgeSystem />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and usage patterns for equipment access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Equipment usage analytics, trends, and insights will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipmentAccess;
