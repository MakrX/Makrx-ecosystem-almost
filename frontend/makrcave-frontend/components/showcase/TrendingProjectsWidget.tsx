import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  TrendingUp,
  Zap,
  Eye,
  Heart,
  GitFork,
  ArrowRight,
  Flame,
  Clock,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TrendingProject {
  project_id: string;
  name: string;
  owner_name: string;
  owner_avatar?: string;
  category: string;
  view_count: number;
  like_count: number;
  fork_count: number;
  difficulty_level: string;
  thumbnail_url?: string;
  created_at: string;
  is_featured?: boolean;
}

interface TrendingProjectsWidgetProps {
  projects: TrendingProject[];
}

const TrendingProjectsWidget: React.FC<TrendingProjectsWidgetProps> = ({ projects }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
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

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <span>Trending Now</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Flame className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No trending projects yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <Flame className="h-3 w-3 text-white" />
            </div>
            <span>Trending Now</span>
          </div>
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            Hot
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {projects.slice(0, 5).map((project, index) => (
          <div 
            key={project.project_id}
            className="group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
            onClick={() => window.location.href = `/portal/projects/${project.project_id}`}
          >
            <div className="flex items-start space-x-3">
              {/* Ranking */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {index === 0 ? (
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                ) : index === 1 ? (
                  <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                ) : index === 2 ? (
                  <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-bold">{index + 1}</span>
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                {project.thumbnail_url ? (
                  <img 
                    src={project.thumbnail_url} 
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                
                {/* Special indicators */}
                {project.is_featured && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="h-2 w-2 text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h4>
                  <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100" />
                </div>

                {/* Creator */}
                <div className="flex items-center space-x-2 mt-1 mb-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={project.owner_avatar} />
                    <AvatarFallback>{project.owner_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 truncate">{project.owner_name}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{project.view_count > 1000 ? `${(project.view_count / 1000).toFixed(1)}k` : project.view_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{project.like_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitFork className="h-3 w-3" />
                      <span>{project.fork_count}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {project.category}
                    </Badge>
                    <span 
                      className={`text-xs ${getDifficultyColor(project.difficulty_level)}`}
                      title={project.difficulty_level}
                    >
                      {getDifficultyIcon(project.difficulty_level)}
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* View All Button */}
        <div className="pt-3 border-t">
          <button 
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            onClick={() => window.location.href = '/portal/projects/showcase?sort=trending'}
          >
            <span>View All Trending</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingProjectsWidget;
