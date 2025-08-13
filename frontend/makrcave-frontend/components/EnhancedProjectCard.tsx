import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Calendar,
  Users,
  Package,
  FileText,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle,
  Github,
  Heart,
  GitFork,
  MessageCircle,
  ShoppingCart,
  Award,
  Zap,
  Shield,
  BookOpen
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedProject {
  project_id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name?: string;
  owner_avatar?: string;
  visibility: 'public' | 'private' | 'team-only';
  status: 'draft' | 'in-progress' | 'complete' | 'on-hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  
  // Enhanced collaboration fields
  collaborator_count: number;
  bom_items_count: number;
  files_count: number;
  milestones_count: number;
  completed_milestones_count: number;
  
  // Public project features
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration?: string;
  required_skills: string[];
  learning_objectives: string[];
  license_type: string;
  required_equipment: string[];
  space_requirements?: string;
  safety_considerations?: string;
  
  // Engagement metrics
  view_count: number;
  fork_count: number;
  like_count: number;
  
  // Integration features
  github_repo_url?: string;
  github_branch?: string;
  enable_github_integration?: boolean;
}

interface EnhancedProjectCardProps {
  project: EnhancedProject;
  viewMode: 'grid' | 'list';
  showPublicFeatures?: boolean;
  onUpdate?: () => void;
  onLike?: (projectId: string) => void;
  onFork?: (projectId: string) => void;
  onComment?: (projectId: string) => void;
}

const EnhancedProjectCard: React.FC<EnhancedProjectCardProps> = ({ 
  project, 
  viewMode, 
  showPublicFeatures = false,
  onUpdate,
  onLike,
  onFork,
  onComment
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <BookOpen className="h-3 w-3" />;
      case 'intermediate': return <Zap className="h-3 w-3" />;
      case 'advanced': return <Award className="h-3 w-3" />;
      case 'expert': return <Shield className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-3 w-3" />;
      case 'in-progress': return <Clock className="h-3 w-3" />;
      case 'complete': return <CheckCircle className="h-3 w-3" />;
      case 'on-hold': return <PauseCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return '🌐';
      case 'private': return '🔒';
      case 'team-only': return '👥';
      default: return '❓';
    }
  };

  const getProgressPercentage = () => {
    if (project.milestones_count === 0) return 0;
    return Math.round((project.completed_milestones_count / project.milestones_count) * 100);
  };

  const isOwner = user?.user_id === project.owner_id;
  const canEdit = isOwner; // In a real app, this would check collaborator permissions too

  const handleViewProject = () => {
    window.location.href = `/portal/projects/${project.project_id}`;
  };

  const handleEditProject = () => {
    window.location.href = `/portal/projects/${project.project_id}/edit`;
  };

  const handleLikeProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(project.project_id);
  };

  const handleForkProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFork?.(project.project_id);
  };

  const handleCommentProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.(project.project_id);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('auth_token') || 'mock-token';
      
      const response = await fetch(`/api/v1/projects/${project.project_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate?.();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(project.project_id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const handleOrderFromStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/portal/projects/${project.project_id}/bom/order`;
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  {project.is_featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  <span className="text-sm text-gray-500">
                    {getVisibilityIcon(project.visibility)}
                  </span>
                  {showPublicFeatures && (
                    <Badge className={`${getDifficultyColor(project.difficulty_level)} flex items-center gap-1 text-xs`}>
                      {getDifficultyIcon(project.difficulty_level)}
                      {project.difficulty_level}
                    </Badge>
                  )}
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {project.description}
                  </p>
                )}

                {/* Owner info for public projects */}
                {showPublicFeatures && project.owner_name && (
                  <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                    <span>by</span>
                    <span className="font-medium">{project.owner_name}</span>
                  </div>
                )}
                
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Skills and Equipment for public projects */}
                {showPublicFeatures && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.required_skills.slice(0, 2).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        🧠 {skill}
                      </Badge>
                    ))}
                    {project.required_equipment.slice(0, 2).map((equipment, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        🔧 {equipment}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and Progress */}
              <div className="flex items-center space-x-4">
                <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                  {getStatusIcon(project.status)}
                  {project.status}
                </Badge>
                
                {project.milestones_count > 0 && (
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={getProgressPercentage()} 
                      className="w-20"
                    />
                    <span className="text-xs text-gray-500">
                      {getProgressPercentage()}%
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{project.collaborator_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{project.bom_items_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{project.files_count}</span>
                </div>
                {showPublicFeatures && (
                  <>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{project.like_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      <span>{project.fork_count}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Updated Time */}
              <div className="text-xs text-gray-500">
                Updated {formatDate(project.updated_at)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {showPublicFeatures && (
                <>
                  <Button variant="outline" size="sm" onClick={handleLikeProject}>
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleForkProject}>
                    <GitFork className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCommentProject}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {project.bom_items_count > 0 && (
                <Button variant="outline" size="sm" onClick={handleOrderFromStore}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={handleViewProject}>
                <Eye className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleViewProject}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {canEdit && (
                    <>
                      <DropdownMenuItem onClick={handleEditProject}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleCopyProjectId}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Project ID
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`/portal/projects/${project.project_id}`, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </DropdownMenuItem>
                  {project.enable_github_integration && project.github_repo_url && (
                    <DropdownMenuItem onClick={() => window.open(project.github_repo_url, '_blank')}>
                      <Github className="h-4 w-4 mr-2" />
                      View on GitHub
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleDeleteProject}
                        className="text-red-600"
                        disabled={isDeleting}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleViewProject}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                {project.name}
              </CardTitle>
              {project.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>{getVisibilityIcon(project.visibility)}</span>
              <span className="capitalize">{project.visibility}</span>
              {project.enable_github_integration && project.github_repo_url && (
                <>
                  <span>•</span>
                  <Github className="h-3 w-3" />
                </>
              )}
              {showPublicFeatures && (
                <>
                  <span>•</span>
                  <Badge className={`${getDifficultyColor(project.difficulty_level)} flex items-center gap-1 text-xs`}>
                    {getDifficultyIcon(project.difficulty_level)}
                    {project.difficulty_level}
                  </Badge>
                </>
              )}
            </div>

            {/* Owner info for public projects */}
            {showPublicFeatures && project.owner_name && (
              <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                <span>by</span>
                <span className="font-medium text-blue-600">{project.owner_name}</span>
                <span>•</span>
                <span>Updated {formatDate(project.updated_at)}</span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewProject(); }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditProject(); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyProjectId(); }}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Project ID
              </DropdownMenuItem>
              {project.enable_github_integration && project.github_repo_url && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(project.github_repo_url, '_blank'); }}>
                  <Github className="h-4 w-4 mr-2" />
                  View on GitHub
                </DropdownMenuItem>
              )}
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(); }}
                    className="text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Project'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Skills and Equipment for public projects */}
        {showPublicFeatures && (
          <div className="mb-4">
            {project.required_skills.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Skills needed:</p>
                <div className="flex flex-wrap gap-1">
                  {project.required_skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      🧠 {skill}
                    </Badge>
                  ))}
                  {project.required_skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.required_skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {project.required_equipment.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Equipment needed:</p>
                <div className="flex flex-wrap gap-1">
                  {project.required_equipment.slice(0, 2).map((equipment, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      🔧 {equipment}
                    </Badge>
                  ))}
                  {project.required_equipment.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.required_equipment.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {project.estimated_duration && (
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {project.estimated_duration}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Status and Progress */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
            {getStatusIcon(project.status)}
            {project.status}
          </Badge>
          
          {project.milestones_count > 0 && (
            <div className="flex items-center space-x-2">
              <Progress 
                value={getProgressPercentage()} 
                className="w-16 h-2"
              />
              <span className="text-xs text-gray-500">
                {getProgressPercentage()}%
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div className="flex flex-col items-center space-y-1">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{project.collaborator_count}</span>
            <span className="text-xs text-gray-500">Team</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{project.bom_items_count}</span>
            <span className="text-xs text-gray-500">BOM Items</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{project.files_count}</span>
            <span className="text-xs text-gray-500">Files</span>
          </div>
        </div>

        {/* Public Project Engagement */}
        {showPublicFeatures && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{project.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{project.like_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                <span>{project.fork_count}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={handleLikeProject}>
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleForkProject}>
                <GitFork className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCommentProject}>
                <MessageCircle className="h-4 w-4" />
              </Button>
              {project.bom_items_count > 0 && (
                <Button variant="ghost" size="sm" onClick={handleOrderFromStore}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        {(project.start_date || project.end_date) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              {project.start_date && (
                <span>
                  Started {formatDate(project.start_date)}
                </span>
              )}
              {project.start_date && project.end_date && <span className="mx-1">•</span>}
              {project.end_date && (
                <span>
                  Due {formatDate(project.end_date)}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedProjectCard;
