import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  Heart,
  GitFork,
  Clock,
  Users,
  Package,
  Play,
  ArrowRight,
  Award,
  Zap,
  Shield,
  Sparkles
} from 'lucide-react';

interface FeaturedProject {
  project_id: string;
  name: string;
  description?: string;
  owner_name: string;
  owner_avatar?: string;
  makerspace_name?: string;
  difficulty_level: string;
  estimated_time: string;
  category: string;
  tags: string[];
  view_count: number;
  like_count: number;
  fork_count: number;
  total_estimated_cost: number;
  thumbnail_url?: string;
  demo_video_url?: string;
  is_trending: boolean;
  is_staff_pick: boolean;
  awards: Array<{
    name: string;
    icon: string;
  }>;
  created_at: string;
}

interface FeaturedProjectCarouselProps {
  projects: FeaturedProject[];
}

const FeaturedProjectCarousel: React.FC<FeaturedProjectCarouselProps> = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || projects.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % projects.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, projects.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

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

  if (projects.length === 0) {
    return null;
  }

  const currentProject = projects[currentIndex];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Featured Projects</h2>
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
            {projects.length} Featured
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={isAutoPlaying ? 'bg-blue-50 border-blue-200' : ''}
          >
            {isAutoPlaying ? 'Pause' : 'Play'}
          </Button>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={prevSlide}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextSlide}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Carousel */}
      <div className="relative">
        <Card className="overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-100">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
              {/* Image/Video Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                {currentProject.thumbnail_url ? (
                  <img 
                    src={currentProject.thumbnail_url} 
                    alt={currentProject.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}
                
                {/* Video overlay */}
                {currentProject.demo_video_url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-gray-800 ml-1" />
                    </div>
                  </div>
                )}

                {/* Special badges */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="h-5 w-5 text-white fill-current" />
                  </div>
                  {currentProject.is_trending && (
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {currentProject.is_staff_pick && (
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Difficulty badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={getDifficultyColor(currentProject.difficulty_level)}>
                    <span className="mr-1">{getDifficultyIcon(currentProject.difficulty_level)}</span>
                    {currentProject.difficulty_level}
                  </Badge>
                </div>

                {/* Carousel navigation dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {projects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">{currentProject.category}</Badge>
                      {currentProject.awards.slice(0, 2).map((award, index) => (
                        <span key={index} className="text-lg" title={award.name}>
                          {award.icon}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                      {currentProject.name}
                    </h3>
                    
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {currentProject.description}
                    </p>
                  </div>

                  {/* Creator info */}
                  <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={currentProject.owner_avatar} />
                      <AvatarFallback>{currentProject.owner_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{currentProject.owner_name}</div>
                      {currentProject.makerspace_name && (
                        <div className="text-sm text-gray-600 flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{currentProject.makerspace_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {currentProject.tags.slice(0, 4).map(tag => (
                      <Badge key={tag} variant="outline" className="text-sm">{tag}</Badge>
                    ))}
                    {currentProject.tags.length > 4 && (
                      <Badge variant="outline" className="text-sm">+{currentProject.tags.length - 4} more</Badge>
                    )}
                  </div>

                  {/* Project details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="h-5 w-5" />
                        <div>
                          <div className="text-sm text-gray-500">Time to build</div>
                          <div className="font-medium">{currentProject.estimated_time}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Package className="h-5 w-5" />
                        <div>
                          <div className="text-sm text-gray-500">Est. cost</div>
                          <div className="font-medium">${currentProject.total_estimated_cost}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Eye className="h-5 w-5" />
                        <div>
                          <div className="text-sm text-gray-500">Views</div>
                          <div className="font-medium">{currentProject.view_count.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Heart className="h-5 w-5" />
                        <div>
                          <div className="text-sm text-gray-500">Likes</div>
                          <div className="font-medium">{currentProject.like_count}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-4 pt-6">
                  <Button 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => window.location.href = `/portal/projects/${currentProject.project_id}`}
                  >
                    View Project
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" size="lg">
                    <GitFork className="h-4 w-4 mr-2" />
                    Fork ({currentProject.fork_count})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation arrows */}
        <Button
          variant="outline"
          size="sm"
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white shadow-lg hover:shadow-xl"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white shadow-lg hover:shadow-xl"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Thumbnails */}
      {projects.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {projects.map((project, index) => (
            <div
              key={project.project_id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                index === currentIndex
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              }`}
            >
              <Card className="w-32 h-20 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 relative">
                  {project.thumbnail_url ? (
                    <img 
                      src={project.thumbnail_url} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Featured indicator */}
                  <div className="absolute top-1 right-1">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="h-2 w-2 text-white fill-current" />
                    </div>
                  </div>
                  
                  {/* Project name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1">
                    <div className="text-xs font-medium truncate">{project.name}</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedProjectCarousel;
