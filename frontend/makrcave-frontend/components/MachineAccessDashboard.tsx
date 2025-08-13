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
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import {
  Shield, Award, AlertTriangle, Clock, CheckCircle, XCircle,
  Users, Wrench, BookOpen, Star, TrendingUp, BarChart3,
  Plus, Eye, Edit3, Trash2, QrCode, Smartphone, Key,
  Target, Trophy, Zap, Lock, Unlock, Activity
} from 'lucide-react';

// Types
interface Certification {
  id: string;
  user_id: string;
  skill_id: string;
  equipment_id?: string;
  certification_level: string;
  status: string;
  issued_at: string;
  expires_at?: string;
  total_usage_hours: number;
  successful_sessions: number;
  safety_incidents: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  awarded_at: string;
  progress_value: number;
  is_featured: boolean;
  badge: {
    name: string;
    description: string;
    badge_type: string;
    rarity: string;
    category: string;
    color_hex: string;
    icon_url?: string;
    points_value: number;
  };
}

interface AccessAttempt {
  id: string;
  equipment_id: string;
  attempted_at: string;
  result: string;
  access_method: string;
  session_duration_minutes?: number;
  denial_reason?: string;
}

interface AccessRule {
  id: string;
  equipment_id: string;
  required_skill_id: string;
  minimum_skill_level: string;
  requires_supervisor: boolean;
  max_session_hours?: number;
  safety_briefing_required: boolean;
  rule_name: string;
  description?: string;
  is_active: boolean;
}

interface UserAccessProfile {
  user_id: string;
  certifications: Certification[];
  badges: UserBadge[];
  recent_access_attempts: AccessAttempt[];
  safety_record: {
    total_incidents: number;
    safety_score: number;
  };
  total_equipment_hours: number;
  certification_progress: Record<string, number>;
}

const MachineAccessDashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserAccessProfile | null>(null);
  const [accessRules, setAccessRules] = useState<AccessRule[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAccessRequest, setShowAccessRequest] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const { toast } = useToast();

  // Constants
  const accessLevels = [
    { value: 'basic', label: 'Basic', color: 'gray' },
    { value: 'intermediate', label: 'Intermediate', color: 'blue' },
    { value: 'advanced', label: 'Advanced', color: 'orange' },
    { value: 'expert', label: 'Expert', color: 'purple' },
    { value: 'maintenance', label: 'Maintenance', color: 'red' }
  ];

  const badgeRarities = [
    { value: 'common', label: 'Common', color: 'gray' },
    { value: 'uncommon', label: 'Uncommon', color: 'green' },
    { value: 'rare', label: 'Rare', color: 'blue' },
    { value: 'epic', label: 'Epic', color: 'purple' },
    { value: 'legendary', label: 'Legendary', color: 'yellow' }
  ];

  const accessResults = [
    { value: 'granted', label: 'Granted', color: 'green', icon: CheckCircle },
    { value: 'denied_no_skill', label: 'No Certification', color: 'red', icon: XCircle },
    { value: 'denied_expired', label: 'Expired', color: 'orange', icon: Clock },
    { value: 'denied_suspended', label: 'Suspended', color: 'red', icon: AlertTriangle },
    { value: 'denied_equipment_offline', label: 'Equipment Offline', color: 'gray', icon: Wrench },
    { value: 'denied_maintenance', label: 'Maintenance', color: 'yellow', icon: Wrench },
    { value: 'denied_reservation_required', label: 'Reservation Required', color: 'blue', icon: Clock },
    { value: 'denied_time_limit', label: 'Time Restricted', color: 'orange', icon: Clock }
  ];

  // Fetch user access profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/machine-access/dashboard/user-profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load access profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch access rules
  const fetchAccessRules = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/machine-access/rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const rules = await response.json();
        setAccessRules(rules);
      }
    } catch (error) {
      console.error('Failed to fetch access rules:', error);
    }
  }, []);

  // Request machine access
  const requestMachineAccess = async (equipmentId: string) => {
    try {
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

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Access Granted!",
          description: `You now have access to the equipment. Session ID: ${result.session_id}`,
        });
        setShowAccessRequest(false);
        await fetchUserProfile(); // Refresh profile
      } else {
        toast({
          title: "Access Denied",
          description: result.message || result.denial_reason,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to request access:', error);
      toast({
        title: "Error",
        description: "Failed to request machine access. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchAccessRules()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchUserProfile, fetchAccessRules]);

  // Get level color
  const getLevelColor = (level: string) => {
    const levelInfo = accessLevels.find(l => l.value === level);
    return levelInfo?.color || 'gray';
  };

  // Get badge rarity color
  const getBadgeRarityColor = (rarity: string) => {
    const rarityInfo = badgeRarities.find(r => r.value === rarity);
    return rarityInfo?.color || 'gray';
  };

  // Get access result info
  const getAccessResultInfo = (result: string) => {
    return accessResults.find(r => r.value === result) || accessResults[0];
  };

  // Format hours
  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading access dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Machine Access</h1>
          <p className="text-muted-foreground">Manage certifications, badges, and equipment access</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAccessRequest(true)}>
            <Key className="h-4 w-4 mr-2" />
            Request Access
          </Button>
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Scan Badge
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {userProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Certifications</p>
                  <p className="text-2xl font-bold">
                    {userProfile.certifications.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Badges Earned</p>
                  <p className="text-2xl font-bold">{userProfile.badges.length}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipment Hours</p>
                  <p className="text-2xl font-bold">{formatHours(userProfile.total_equipment_hours)}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Safety Score</p>
                  <p className="text-2xl font-bold">{userProfile.safety_record.safety_score}/100</p>
                </div>
                {userProfile.safety_record.safety_score >= 80 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="access-log">Access Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {userProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Access Attempts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Access Attempts</CardTitle>
                  <CardDescription>Your latest equipment access requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userProfile.recent_access_attempts.slice(0, 5).map((attempt) => {
                      const resultInfo = getAccessResultInfo(attempt.result);
                      const IconComponent = resultInfo.icon;
                      
                      return (
                        <div key={attempt.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <IconComponent className={`h-5 w-5 text-${resultInfo.color}-500`} />
                            <div>
                              <p className="font-medium">{attempt.equipment_id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(attempt.attempted_at).toLocaleDateString()} at{' '}
                                {new Date(attempt.attempted_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={attempt.result === 'granted' ? 'default' : 'secondary'} className={`bg-${resultInfo.color}-100 text-${resultInfo.color}-800`}>
                              {resultInfo.label}
                            </Badge>
                            {attempt.session_duration_minutes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {Math.round(attempt.session_duration_minutes)}m
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {userProfile.recent_access_attempts.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2" />
                        <p>No recent access attempts</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certification Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Certification Progress</CardTitle>
                  <CardDescription>Your skill development and certification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(userProfile.certification_progress).map(([skillId, progress]) => (
                      <div key={skillId}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{skillId}</span>
                          <span className="text-sm">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ))}
                    
                    {Object.keys(userProfile.certification_progress).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <Target className="h-8 w-8 mx-auto mb-2" />
                        <p>No certifications in progress</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Safety Record */}
          {userProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Safety Record</CardTitle>
                <CardDescription>Your safety performance and incident history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {userProfile.safety_record.safety_score >= 80 ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-orange-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold">{userProfile.safety_record.safety_score}/100</p>
                    <p className="text-sm text-muted-foreground">Safety Score</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{userProfile.safety_record.total_incidents}</p>
                    <p className="text-sm text-muted-foreground">Total Incidents</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {userProfile.certifications.reduce((sum, cert) => sum + cert.successful_sessions, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Successful Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Certifications</h2>
            <Button onClick={() => setShowCertificationModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Certification
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProfile?.certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{cert.skill_id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cert.equipment_id || 'General Skill'}
                      </p>
                    </div>
                    <Badge variant={cert.status === 'active' ? 'default' : 'secondary'} className={`bg-${getLevelColor(cert.certification_level)}-100 text-${getLevelColor(cert.certification_level)}-800`}>
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
                      <span>{formatHours(cert.total_usage_hours)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sessions:</span>
                      <span>{cert.successful_sessions}</span>
                    </div>
                    
                    {cert.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <span>{new Date(cert.expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {cert.safety_incidents > 0 && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                      <div className="flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{cert.safety_incidents} Safety Incidents</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {(!userProfile?.certifications || userProfile.certifications.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No certifications yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get certified to access equipment and earn badges
                  </p>
                  <Button onClick={() => setShowCertificationModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Your First Certification
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Badges</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Browse All Badges
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProfile?.badges.map((userBadge) => (
              <Card key={userBadge.id} className={userBadge.is_featured ? 'ring-2 ring-yellow-400' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {userBadge.badge.icon_url ? (
                        <img src={userBadge.badge.icon_url} alt={userBadge.badge.name} className="h-8 w-8" />
                      ) : (
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: userBadge.badge.color_hex }}
                        >
                          <Award className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{userBadge.badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{userBadge.badge.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className={`bg-${getBadgeRarityColor(userBadge.badge.rarity)}-100 text-${getBadgeRarityColor(userBadge.badge.rarity)}-800`}>
                        {userBadge.badge.rarity}
                      </Badge>
                      {userBadge.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current mt-1" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {userBadge.badge.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points:</span>
                      <span className="font-medium">{userBadge.badge.points_value}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Earned:</span>
                      <span>{new Date(userBadge.awarded_at).toLocaleDateString()}</span>
                    </div>
                    
                    {userBadge.progress_value < 100 && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-muted-foreground">Progress:</span>
                          <span>{Math.round(userBadge.progress_value)}%</span>
                        </div>
                        <Progress value={userBadge.progress_value} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!userProfile?.badges || userProfile.badges.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No badges earned yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete projects, use equipment, and contribute to earn badges
                  </p>
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    View Available Badges
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Access Log Tab */}
        <TabsContent value="access-log" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Access History</h2>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Statistics
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {userProfile?.recent_access_attempts.map((attempt) => {
                  const resultInfo = getAccessResultInfo(attempt.result);
                  const IconComponent = resultInfo.icon;
                  
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <IconComponent className={`h-6 w-6 text-${resultInfo.color}-500`} />
                        <div>
                          <p className="font-medium">{attempt.equipment_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attempt.attempted_at).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Method: {attempt.access_method}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={attempt.result === 'granted' ? 'default' : 'secondary'} className={`bg-${resultInfo.color}-100 text-${resultInfo.color}-800`}>
                          {resultInfo.label}
                        </Badge>
                        {attempt.session_duration_minutes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Duration: {Math.round(attempt.session_duration_minutes)}m
                          </p>
                        )}
                        {attempt.denial_reason && (
                          <p className="text-sm text-red-600 mt-1">
                            {attempt.denial_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {(!userProfile?.recent_access_attempts || userProfile.recent_access_attempts.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No access history</h3>
                    <p>Your equipment access attempts will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Access Request Dialog */}
      <Dialog open={showAccessRequest} onOpenChange={setShowAccessRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Machine Access</DialogTitle>
            <DialogDescription>
              Select equipment to request access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {/* This would be populated with actual equipment data */}
                  <SelectItem value="printer_1">3D Printer #1</SelectItem>
                  <SelectItem value="laser_1">Laser Cutter #1</SelectItem>
                  <SelectItem value="cnc_1">CNC Machine #1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAccessRequest(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => requestMachineAccess(selectedEquipment)}
                disabled={!selectedEquipment}
              >
                Request Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MachineAccessDashboard;
