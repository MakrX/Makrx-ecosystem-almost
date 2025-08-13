import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Star,
  MapPin,
  Award,
  Users,
  Sparkles,
  ExternalLink,
  Heart,
  Eye,
  GitFork,
  Calendar,
  ChevronRight,
  Trophy,
  Zap,
  Crown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedMaker {
  user_id: string;
  name: string;
  avatar?: string;
  title?: string;
  bio?: string;
  location?: string;
  makerspace_name?: string;
  
  // Stats
  project_count: number;
  total_likes: number;
  total_views: number;
  total_forks: number;
  follower_count: number;
  
  // Featured project
  featured_project: {
    project_id: string;
    name: string;
    thumbnail_url?: string;
    like_count: number;
    view_count: number;
  };
  
  // Skills and badges
  top_skills: string[];
  achievements: Array<{
    type: string;
    name: string;
    icon: string;
    description: string;
  }>;
  
  // Social
  is_verified: boolean;
  is_staff_pick: boolean;
  member_since: string;
}

const MakerSpotlight: React.FC = () => {
  const [featuredMaker, setFeaturedMaker] = useState<FeaturedMaker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedMaker();
  }, []);

  const loadFeaturedMaker = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch('/api/v1/showcase/featured-maker', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeaturedMaker(data);
      } else {
        // Mock data for development
        setFeaturedMaker(generateMockFeaturedMaker());
      }
    } catch (error) {
      console.error('Error loading featured maker:', error);
      setFeaturedMaker(generateMockFeaturedMaker());
    } finally {
      setLoading(false);
    }
  };

  const generateMockFeaturedMaker = (): FeaturedMaker => ({
    user_id: 'maker1',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    title: 'Hardware Engineer & Maker',
    bio: 'Passionate about IoT devices and sustainable technology. Building the future one circuit at a time.',
    location: 'San Francisco, CA',
    makerspace_name: 'TechShop SF',
    project_count: 23,
    total_likes: 1247,
    total_views: 15620,
    total_forks: 89,
    follower_count: 456,
    featured_project: {
      project_id: 'proj1',
      name: 'Smart Garden Monitor',
      thumbnail_url: '/projects/garden-monitor.jpg',
      like_count: 142,
      view_count: 2340
    },
    top_skills: ['Arduino', 'IoT', 'PCB Design', '3D Printing', 'Sustainability'],
    achievements: [
      {
        type: 'featured',
        name: 'Featured Maker',
        icon: '⭐',
        description: 'Selected as featured maker of the month'
      },
      {
        type: 'innovator',
        name: 'Innovation Award',
        icon: '💡',
        description: 'Recognized for innovative IoT solutions'
      },
      {
        type: 'mentor',
        name: 'Community Mentor',
        icon: '🏆',
        description: 'Mentored 50+ new makers'
      }
    ],
    is_verified: true,
    is_staff_pick: true,
    member_since: '2023-01-15T00:00:00Z'
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>Maker Spotlight</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!featuredMaker) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>Maker Spotlight</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No featured maker available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Sparkles className="h-3 w-3" />
            </div>
            <span>Maker Spotlight</span>
          </div>
          <div className="flex items-center space-x-1">
            {featuredMaker.is_staff_pick && (
              <Crown className="h-4 w-4" />
            )}
            {featuredMaker.is_verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="h-2 w-2 fill-current" />
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Maker Profile */}
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src={featuredMaker.avatar} />
                <AvatarFallback>{featuredMaker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {featuredMaker.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Star className="h-3 w-3 text-white fill-current" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <span>{featuredMaker.name}</span>
                {featuredMaker.is_staff_pick && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    <Crown className="h-3 w-3 mr-1" />
                    Staff Pick
                  </Badge>
                )}
              </h3>
              {featuredMaker.title && (
                <p className="text-sm text-gray-600 font-medium">{featuredMaker.title}</p>
              )}
              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                {featuredMaker.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{featuredMaker.location}</span>
                  </div>
                )}
                {featuredMaker.makerspace_name && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{featuredMaker.makerspace_name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(featuredMaker.member_since), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {featuredMaker.bio && (
            <p className="text-sm text-gray-600 leading-relaxed">{featuredMaker.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-900">{featuredMaker.project_count}</div>
              <div className="text-xs text-blue-600">Projects</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-900">{featuredMaker.total_likes.toLocaleString()}</div>
              <div className="text-xs text-red-600">Likes</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-900">{featuredMaker.total_views.toLocaleString()}</div>
              <div className="text-xs text-green-600">Views</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-900">{featuredMaker.follower_count}</div>
              <div className="text-xs text-purple-600">Followers</div>
            </div>
          </div>

          {/* Top Skills */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Skills</h4>
            <div className="flex flex-wrap gap-1">
              {featuredMaker.top_skills.slice(0, 4).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {featuredMaker.top_skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{featuredMaker.top_skills.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Achievements</h4>
            <div className="space-y-2">
              {featuredMaker.achievements.slice(0, 2).map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-lg">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{achievement.name}</div>
                    <div className="text-xs text-gray-600 truncate">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Project */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Featured Project</h4>
            <div 
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              onClick={() => window.location.href = `/portal/projects/${featuredMaker.featured_project.project_id}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden flex-shrink-0">
                  {featuredMaker.featured_project.thumbnail_url ? (
                    <img 
                      src={featuredMaker.featured_project.thumbnail_url} 
                      alt={featuredMaker.featured_project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {featuredMaker.featured_project.name}
                  </h5>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{featuredMaker.featured_project.like_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{featuredMaker.featured_project.view_count}</span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => window.location.href = `/portal/makers/${featuredMaker.user_id}`}
            >
              View Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = `/portal/makers/${featuredMaker.user_id}/projects`}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MakerSpotlight;
