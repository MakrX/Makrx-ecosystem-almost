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
  Trophy, Award, Star, Target, Zap, Crown, Medal, Shield,
  Plus, Edit3, Eye, Users, TrendingUp, BarChart3, Filter,
  Search, Upload, Download, Share2, Clock, CheckCircle,
  ArrowUp, ArrowDown, Calendar, Gift
} from 'lucide-react';

// Types
interface BadgeData {
  id: string;
  name: string;
  description: string;
  badge_type: string;
  rarity: string;
  category: string;
  icon_url?: string;
  color_hex: string;
  criteria: Record<string, any>;
  points_value: number;
  skill_requirements?: string[];
  prerequisite_badges?: string[];
  equipment_usage_required: number;
  project_completions_required: number;
  total_awarded: number;
  auto_award: boolean;
  is_active: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  progress_value: number;
  is_featured: boolean;
  badge: BadgeData;
}

interface BadgeProgress {
  badge_id: string;
  badge_name: string;
  progress_percentage: number;
  requirements_met: string[];
  requirements_pending: string[];
  estimated_completion_date?: string;
}

const BadgeSystem: React.FC = () => {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [activeTab, setActiveTab] = useState('gallery');
  const [loading, setLoading] = useState(true);
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const { toast } = useToast();

  // Form state for creating badges
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    badge_type: 'skill_certification',
    rarity: 'common',
    category: '',
    color_hex: '#4F46E5',
    criteria: {},
    points_value: 10,
    equipment_usage_required: 0,
    project_completions_required: 0,
    auto_award: false,
    is_public: true
  });

  // Constants
  const badgeTypes = [
    { value: 'skill_certification', label: 'Skill Certification', icon: Shield },
    { value: 'safety_training', label: 'Safety Training', icon: Shield },
    { value: 'equipment_mastery', label: 'Equipment Mastery', icon: Trophy },
    { value: 'project_completion', label: 'Project Completion', icon: CheckCircle },
    { value: 'community_contribution', label: 'Community Contribution', icon: Users },
    { value: 'time_milestone', label: 'Time Milestone', icon: Clock },
    { value: 'quality_achievement', label: 'Quality Achievement', icon: Star },
    { value: 'innovation_award', label: 'Innovation Award', icon: Zap }
  ];

  const badgeRarities = [
    { value: 'common', label: 'Common', color: 'gray', emoji: '🥉' },
    { value: 'uncommon', label: 'Uncommon', color: 'green', emoji: '🥈' },
    { value: 'rare', label: 'Rare', color: 'blue', emoji: '🥇' },
    { value: 'epic', label: 'Epic', color: 'purple', emoji: '💎' },
    { value: 'legendary', label: 'Legendary', color: 'yellow', emoji: '👑' }
  ];

  const categories = [
    '3d_printing', 'laser_cutting', 'cnc_machining', 'electronics',
    'woodworking', 'metalworking', 'safety', 'collaboration',
    'teaching', 'innovation', 'quality', 'efficiency'
  ];

  // Fetch badges
  const fetchBadges = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (rarityFilter !== 'all') params.append('rarity', rarityFilter);

      const response = await fetch(`/api/v1/machine-access/badges?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const badgesData = await response.json();
        setBadges(badgesData);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    }
  }, [categoryFilter, rarityFilter]);

  // Fetch user badges
  const fetchUserBadges = useCallback(async () => {
    try {
      const userId = 'current_user'; // This would come from auth context
      const response = await fetch(`/api/v1/machine-access/users/${userId}/badges`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userBadgesData = await response.json();
        setUserBadges(userBadgesData);
      }
    } catch (error) {
      console.error('Failed to fetch user badges:', error);
    }
  }, []);

  // Create badge
  const createBadge = async () => {
    try {
      const response = await fetch('/api/v1/machine-access/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...badgeForm,
          criteria: {
            type: badgeForm.badge_type,
            requirements: {
              equipment_usage_hours: badgeForm.equipment_usage_required,
              project_completions: badgeForm.project_completions_required
            }
          }
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Badge created successfully"
        });
        
        setShowCreateBadge(false);
        setBadgeForm({
          name: '',
          description: '',
          badge_type: 'skill_certification',
          rarity: 'common',
          category: '',
          color_hex: '#4F46E5',
          criteria: {},
          points_value: 10,
          equipment_usage_required: 0,
          project_completions_required: 0,
          auto_award: false,
          is_public: true
        });
        await fetchBadges();
      } else {
        throw new Error('Failed to create badge');
      }
    } catch (error) {
      console.error('Failed to create badge:', error);
      toast({
        title: "Error",
        description: "Failed to create badge. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Award badge to user
  const awardBadge = async (badgeId: string, userId: string) => {
    try {
      const response = await fetch(`/api/v1/machine-access/badges/${badgeId}/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: userId,
          earned_through: 'manual_award',
          achievement_notes: 'Manually awarded by administrator'
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Badge awarded successfully"
        });
        
        setShowAwardModal(false);
        await fetchUserBadges();
      } else {
        throw new Error('Failed to award badge');
      }
    } catch (error) {
      console.error('Failed to award badge:', error);
      toast({
        title: "Error",
        description: "Failed to award badge. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBadges(),
        fetchUserBadges()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchBadges, fetchUserBadges]);

  // Filter badges
  const filteredBadges = badges.filter(badge => {
    if (searchQuery && !badge.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !badge.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Get rarity info
  const getRarityInfo = (rarity: string) => {
    return badgeRarities.find(r => r.value === rarity) || badgeRarities[0];
  };

  // Get badge type info
  const getBadgeTypeInfo = (type: string) => {
    return badgeTypes.find(t => t.value === type) || badgeTypes[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading badge system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Badge System</h1>
          <p className="text-muted-foreground">Achievements, certifications, and recognition</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAwardModal(true)}>
            <Gift className="h-4 w-4 mr-2" />
            Award Badge
          </Button>
          <Button onClick={() => setShowCreateBadge(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Badge
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Badges</p>
                <p className="text-2xl font-bold">{badges.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Badges</p>
                <p className="text-2xl font-bold">{userBadges.length}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">
                  {userBadges.reduce((sum, ub) => sum + ub.badge.points_value, 0)}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured Badges</p>
                <p className="text-2xl font-bold">
                  {userBadges.filter(ub => ub.is_featured).length}
                </p>
              </div>
              <Crown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gallery">Badge Gallery</TabsTrigger>
          <TabsTrigger value="my-badges">My Badges</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Badge Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search badges..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    {badgeRarities.map(rarity => (
                      <SelectItem key={rarity.value} value={rarity.value}>
                        {rarity.emoji} {rarity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => {
              const rarityInfo = getRarityInfo(badge.rarity);
              const typeInfo = getBadgeTypeInfo(badge.badge_type);
              const IconComponent = typeInfo.icon;
              const userHasBadge = userBadges.some(ub => ub.badge_id === badge.id);
              
              return (
                <Card key={badge.id} className={`${userHasBadge ? 'ring-2 ring-green-400 bg-green-50' : ''} hover:shadow-lg transition-shadow cursor-pointer`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {badge.icon_url ? (
                          <img src={badge.icon_url} alt={badge.name} className="h-10 w-10" />
                        ) : (
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: badge.color_hex }}
                          >
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">{badge.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-lg">{rarityInfo.emoji}</span>
                          <Badge variant="secondary" className={`bg-${rarityInfo.color}-100 text-${rarityInfo.color}-800`}>
                            {rarityInfo.label}
                          </Badge>
                        </div>
                        {userHasBadge && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {badge.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Points:</span>
                        <span className="font-medium">{badge.points_value}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{typeInfo.label}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Awarded:</span>
                        <span>{badge.total_awarded} times</span>
                      </div>

                      {badge.equipment_usage_required > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Equipment Hours:</span>
                          <span>{badge.equipment_usage_required}h</span>
                        </div>
                      )}

                      {badge.project_completions_required > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Projects:</span>
                          <span>{badge.project_completions_required}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => setSelectedBadge(badge)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      {!userHasBadge && (
                        <Button variant="outline" size="sm">
                          <Target className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No badges found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Badges Tab */}
        <TabsContent value="my-badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBadges.map((userBadge) => {
              const rarityInfo = getRarityInfo(userBadge.badge.rarity);
              const typeInfo = getBadgeTypeInfo(userBadge.badge.badge_type);
              const IconComponent = typeInfo.icon;
              
              return (
                <Card key={userBadge.id} className={userBadge.is_featured ? 'ring-2 ring-yellow-400' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {userBadge.badge.icon_url ? (
                          <img src={userBadge.badge.icon_url} alt={userBadge.badge.name} className="h-10 w-10" />
                        ) : (
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: userBadge.badge.color_hex }}
                          >
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{userBadge.badge.name}</h3>
                          <p className="text-sm text-muted-foreground">{userBadge.badge.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-lg">{rarityInfo.emoji}</span>
                          <Badge variant="secondary" className={`bg-${rarityInfo.color}-100 text-${rarityInfo.color}-800`}>
                            {rarityInfo.label}
                          </Badge>
                        </div>
                        {userBadge.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {userBadge.badge.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Points Earned:</span>
                        <span className="font-medium">{userBadge.badge.points_value}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Earned On:</span>
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

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {userBadges.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No badges earned yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete projects, use equipment, and contribute to earn your first badge
                  </p>
                  <Button onClick={() => setActiveTab('gallery')}>
                    <Target className="h-4 w-4 mr-2" />
                    Explore Available Badges
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badge Progress</CardTitle>
              <CardDescription>Track your progress towards earning new badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Progress Tracking Coming Soon</h3>
                <p>Detailed progress tracking for available badges will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badge Leaderboard</CardTitle>
              <CardDescription>See who has earned the most badges and points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Leaderboard Coming Soon</h3>
                <p>Community rankings and achievements will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Badge Dialog */}
      <Dialog open={showCreateBadge} onOpenChange={setShowCreateBadge}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Badge</DialogTitle>
            <DialogDescription>
              Design a new achievement badge for the community
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge_name">Badge Name</Label>
                <Input
                  id="badge_name"
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter badge name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={badgeForm.category}
                  onValueChange={(value) => setBadgeForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={badgeForm.description}
                onChange={(e) => setBadgeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this badge represents"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="badge_type">Badge Type</Label>
                <Select
                  value={badgeForm.badge_type}
                  onValueChange={(value) => setBadgeForm(prev => ({ ...prev, badge_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {badgeTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rarity">Rarity</Label>
                <Select
                  value={badgeForm.rarity}
                  onValueChange={(value) => setBadgeForm(prev => ({ ...prev, rarity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {badgeRarities.map(rarity => (
                      <SelectItem key={rarity.value} value={rarity.value}>
                        {rarity.emoji} {rarity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="points">Points Value</Label>
                <Input
                  id="points"
                  type="number"
                  value={badgeForm.points_value}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, points_value: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipment_hours">Equipment Hours Required</Label>
                <Input
                  id="equipment_hours"
                  type="number"
                  value={badgeForm.equipment_usage_required}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, equipment_usage_required: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="projects">Projects Required</Label>
                <Input
                  id="projects"
                  type="number"
                  value={badgeForm.project_completions_required}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, project_completions_required: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_award"
                    checked={badgeForm.auto_award}
                    onCheckedChange={(checked) => setBadgeForm(prev => ({ ...prev, auto_award: checked }))}
                  />
                  <Label htmlFor="auto_award">Auto Award</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={badgeForm.is_public}
                    onCheckedChange={(checked) => setBadgeForm(prev => ({ ...prev, is_public: checked }))}
                  />
                  <Label htmlFor="is_public">Public</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowCreateBadge(false)}>
                  Cancel
                </Button>
                <Button onClick={createBadge} disabled={!badgeForm.name || !badgeForm.description || !badgeForm.category}>
                  Create Badge
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BadgeSystem;
