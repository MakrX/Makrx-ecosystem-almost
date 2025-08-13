import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Heart,
  Eye,
  GitFork,
  Download,
  MessageCircle,
  Star,
  Clock,
  Users,
  Calendar,
  ArrowRight,
  Bookmark,
  Share2,
  Play,
  Award,
  Zap,
  Shield,
  ExternalLink,
  Package,
  Wrench,
  Gauge,
  Target,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface ShowcaseProject {
  project_id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name: string;
  owner_avatar?: string;
  makerspace_name?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_time: string;
  category: string;
  tags: string[];
  skills_required: string[];
  view_count: number;
  like_count: number;
  fork_count: number;
  comment_count: number;
  download_count: number;
  completion_rate: number;
  thumbnail_url?: string;
  demo_video_url?: string;
  total_estimated_cost: number;
  is_featured: boolean;
  is_staff_pick: boolean;
  is_trending: boolean;
  awards: Array<{
    type: string;
    name: string;
    icon: string;
  }>;
  created_at: string;
  updated_at: string;
  is_liked: boolean;
  is_bookmarked: boolean;
  status: string;
}

interface ProjectShowcaseCardProps {
  project: ShowcaseProject;
  viewMode: 'grid' | 'list';
  onProjectClick?: (projectId: string) => void;
}

const ProjectShowcaseCard: React.FC<ProjectShowcaseCardProps> = ({
  project,
  viewMode,
  onProjectClick
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(project.is_liked);
  const [isBookmarked, setIsBookmarked] = useState(project.is_bookmarked);
  const [likeCount, setLikeCount] = useState(project.like_count);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🟠';
      case 'expert': return '🔴';
      default: return '⚪';
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${project.project_id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${project.project_id}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.name,
          text: project.description,
          url: window.location.origin + `/projects/${project.project_id}`
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + `/projects/${project.project_id}`);
    }
  };

  const handleCardClick = () => {
    if (onProjectClick) {
      onProjectClick(project.project_id);
    } else {
      window.location.href = `/portal/projects/${project.project_id}`;
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={handleCardClick}>
        <CardContent className="p-6">
          <div className="flex space-x-6">
            {/* Thumbnail */}
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                {project.thumbnail_url ? (
                  <img 
                    src={project.thumbnail_url} 
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {project.demo_video_url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <Play className="h-4 w-4 text-gray-800 ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Special badges */}
              <div className="absolute -top-2 -right-2 flex flex-col space-y-1">
                {project.is_featured && (
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
                {project.is_trending && (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <Badge className={getDifficultyColor(project.difficulty_level)}>
                      <span className="mr-1">{getDifficultyIcon(project.difficulty_level)}</span>
                      {project.difficulty_level}
                    </Badge>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {project.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={project.owner_avatar} />
                        <AvatarFallback>{project.owner_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{project.owner_name}</span>
                    </div>
                    {project.makerspace_name && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{project.makerspace_name}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{project.estimated_time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4" />
                      <span>${project.total_estimated_cost}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="secondary" className="text-xs">{project.category}</Badge>
                    {project.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{project.tags.length - 3}</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={isLiked ? 'text-red-500' : 'text-gray-500'}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="ml-1 text-xs">{likeCount}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className={isBookmarked ? 'text-blue-500' : 'text-gray-500'}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{project.view_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="h-4 w-4" />
                  <span>{project.fork_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{project.comment_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{project.completion_rate}% completion</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden" onClick={handleCardClick}>
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
        {project.thumbnail_url ? (
          <img 
            src={project.thumbnail_url} 
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Video overlay */}
        {project.demo_video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Play className="h-6 w-6 text-gray-800 ml-1" />
            </div>
          </div>
        )}

        {/* Special badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {project.is_featured && (
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Star className="h-4 w-4 text-white" />
            </div>
          )}
          {project.is_trending && (
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
          )}
          {project.is_staff_pick && (
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-3 left-3">
          <Badge className={getDifficultyColor(project.difficulty_level)}>
            <span className="mr-1">{getDifficultyIcon(project.difficulty_level)}</span>
            {project.difficulty_level}
          </Badge>
        </div>

        {/* Action buttons overlay */}
        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLike}
            className={`shadow-lg ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBookmark}
            className={`shadow-lg ${isBookmarked ? 'text-blue-500' : ''}`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
          </div>

          <p className="text-gray-600 text-sm line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Creator info */}
        <div className="flex items-center space-x-3 mt-4 pb-4 border-b">
          <Avatar className="h-8 w-8">
            <AvatarImage src={project.owner_avatar} />
            <AvatarFallback>{project.owner_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{project.owner_name}</div>
            {project.makerspace_name && (
              <div className="text-xs text-gray-500 truncate">{project.makerspace_name}</div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-4 mb-4">
          <Badge variant="secondary" className="text-xs">{project.category}</Badge>
          {project.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
          {project.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">+{project.tags.length - 2}</Badge>
          )}
        </div>

        {/* Project details */}
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{project.estimated_time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Package className="h-3 w-3" />
            <span>${project.total_estimated_cost}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="h-3 w-3" />
            <span>{project.completion_rate}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="h-3 w-3" />
            <span className="capitalize">{project.status}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{project.view_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <GitFork className="h-4 w-4" />
              <span>{project.fork_count}</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleShare(e); }}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Awards */}
        {project.awards.length > 0 && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
            <Award className="h-4 w-4 text-yellow-500" />
            <div className="flex space-x-1">
              {project.awards.slice(0, 3).map((award, index) => (
                <span key={index} className="text-xs" title={award.name}>
                  {award.icon}
                </span>
              ))}
              {project.awards.length > 3 && (
                <span className="text-xs text-gray-500">+{project.awards.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectShowcaseCard;
