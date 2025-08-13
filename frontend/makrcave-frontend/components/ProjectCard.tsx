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
  Github
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  project_id: string;
  name: string;
  description?: string;
  owner_id: string;
  visibility: 'public' | 'private' | 'team-only';
  status: 'draft' | 'in-progress' | 'complete' | 'on-hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  collaborator_count: number;
  bom_items_count: number;
  files_count: number;
  milestones_count: number;
  completed_milestones_count: number;
  github_repo_url?: string;
  github_branch?: string;
  enable_github_integration?: boolean;
}

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onUpdate?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode, onUpdate }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

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
    // Navigate to project detail page
    window.location.href = `/portal/projects/${project.project_id}`;
  };

  const handleEditProject = () => {
    // Navigate to project edit page
    window.location.href = `/portal/projects/${project.project_id}/edit`;
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
    // You might want to show a toast notification here
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
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
                </div>
                {project.description && (
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {project.description}
                  </p>
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
              </div>

              {/* Updated Time */}
              <div className="text-xs text-gray-500">
                Updated {formatDate(project.updated_at)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
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
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{getVisibilityIcon(project.visibility)}</span>
              <span className="capitalize">{project.visibility}</span>
              {project.enable_github_integration && project.github_repo_url && (
                <>
                  <span>•</span>
                  <Github className="h-3 w-3" />
                </>
              )}
              <span>•</span>
              <span>Updated {formatDate(project.updated_at)}</span>
            </div>
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/portal/projects/${project.project_id}`, '_blank'); }}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
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
        <div className="grid grid-cols-3 gap-4 text-center">
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

export default ProjectCard;
