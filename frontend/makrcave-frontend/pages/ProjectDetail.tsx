import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  Star, 
  Calendar, 
  Users, 
  Package, 
  Wrench, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle,
  Globe,
  Lock,
  Eye,
  MoreHorizontal,
  Settings,
  Archive,
  Copy
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useProjectPermissions } from '../hooks/useProjectPermissions';
import TeamManagement from '../components/TeamManagement';
import BOMManagement from '../components/BOMManagement';
import EquipmentReservations from '../components/EquipmentReservations';
import ProjectTimeline from '../components/ProjectTimeline';
import ProjectFiles from '../components/ProjectFiles';
import ProjectActivity from '../components/ProjectActivity';
import ProjectCollaborationHub from '../components/collaboration/ProjectCollaborationHub';
import RealTimeEditingIndicators from '../components/collaboration/RealTimeEditingIndicators';
import CollaborativeWhiteboard from '../components/collaboration/CollaborativeWhiteboard';
import SharedDocumentEditor from '../components/collaboration/SharedDocumentEditor';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  project_id: string;
  name: string;
  description?: string;
  owner_id: string;
  makerspace_id?: string;
  visibility: 'public' | 'private' | 'team-only';
  status: 'draft' | 'in-progress' | 'complete' | 'on-hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  tags: string[];
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  // GitHub Integration
  github_repo_url?: string;
  github_repo_name?: string;
  github_integration_enabled: boolean;
  github_default_branch: string;
  collaborators: Array<{
    id: number;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    invited_by: string;
    invited_at: string;
    accepted_at?: string;
  }>;
  bom_items: Array<{
    id: number;
    item_type: string;
    item_id: string;
    item_name: string;
    quantity: number;
    unit_cost?: number;
    total_cost?: number;
    usage_notes?: string;
    is_critical: boolean;
    procurement_status: string;
    added_by: string;
    added_at: string;
  }>;
  equipment_reservations: Array<{
    id: number;
    equipment_id: string;
    reservation_id?: string;
    requested_start: string;
    requested_end: string;
    actual_start?: string;
    actual_end?: string;
    status: string;
    usage_notes?: string;
    requested_by: string;
    requested_at: string;
  }>;
  files: Array<{
    id: number;
    filename: string;
    original_filename: string;
    file_type: string;
    file_size: number;
    file_url: string;
    description?: string;
    is_public: boolean;
    version: string;
    uploaded_by: string;
    uploaded_at: string;
  }>;
  milestones: Array<{
    id: number;
    title: string;
    description?: string;
    target_date?: string;
    completion_date?: string;
    is_completed: boolean;
    priority: string;
    order_index: number;
    created_by: string;
    created_at: string;
    completed_by?: string;
  }>;
  activity_logs: Array<{
    id: number;
    activity_type: string;
    title: string;
    description?: string;
    metadata?: any;
    user_id: string;
    user_name: string;
    created_at: string;
  }>;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCollaborationHub, setShowCollaborationHub] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  
  const permissions = useProjectPermissions(project || undefined);

  // Fetch project details
  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

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
      case 'public': return <Globe className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      case 'team-only': return <Users className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = () => {
    if (!project || project.milestones.length === 0) return 0;
    const completed = project.milestones.filter(m => m.is_completed).length;
    return Math.round((completed / project.milestones.length) * 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const handleEdit = () => {
    navigate(`/portal/projects/${projectId}/edit`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this project?')) return;
    // Implement archive functionality
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>Error loading project: {error || 'Project not found'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/portal/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          {permissions.canEdit && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.project_id)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Project ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/portal/projects/${projectId}`, '_blank')}>
                <Eye className="h-4 w-4 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
              {permissions.canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                {project.is_featured && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
                <div className="flex items-center gap-1">
                  {getVisibilityIcon(project.visibility)}
                  <span className="text-sm text-gray-500 capitalize">
                    {project.visibility.replace('-', ' ')}
                  </span>
                </div>
              </div>
              
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Status and Progress */}
              <div className="flex items-center space-x-4">
                <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                  {getStatusIcon(project.status)}
                  {project.status.replace('-', ' ')}
                </Badge>
                
                {project.milestones.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <Progress value={getProgressPercentage()} className="w-24" />
                    <span className="text-sm text-gray-600">{getProgressPercentage()}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center space-y-1">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-lg font-semibold">{project.collaborators.length}</span>
                <span className="text-xs text-gray-500">Team</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Package className="h-5 w-5 text-gray-400" />
                <span className="text-lg font-semibold">{project.bom_items.length}</span>
                <span className="text-xs text-gray-500">BOM Items</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Wrench className="h-5 w-5 text-gray-400" />
                <span className="text-lg font-semibold">{project.equipment_reservations.length}</span>
                <span className="text-xs text-gray-500">Equipment</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-lg font-semibold">{project.files.length}</span>
                <span className="text-xs text-gray-500">Files</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Project Timeline Info */}
        {(project.start_date || project.end_date) && (
          <CardContent className="pt-0">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {project.start_date && (
                <span>Started {formatDate(project.start_date)}</span>
              )}
              {project.start_date && project.end_date && (
                <span className="mx-2">•</span>
              )}
              {project.end_date && (
                <span>Due {formatDate(project.end_date)}</span>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Project Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="bom">BOM</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline and Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline & Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectTimeline 
                  projectId={project.project_id}
                  milestones={project.milestones}
                  canEdit={permissions.canEdit}
                  onUpdate={fetchProject}
                />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectActivity 
                  activities={project.activity_logs.slice(0, 5)}
                  showAll={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Team Overview</h4>
                  <p className="text-sm">
                    {project.collaborators.length} members including 
                    {' ' + project.collaborators.filter(c => c.role === 'owner').length} owner(s),
                    {' ' + project.collaborators.filter(c => c.role === 'editor').length} editor(s), and
                    {' ' + project.collaborators.filter(c => c.role === 'viewer').length} viewer(s)
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">BOM Status</h4>
                  <p className="text-sm">
                    {project.bom_items.length} items total,
                    {' ' + project.bom_items.filter(b => b.is_critical).length} critical items,
                    {' ' + project.bom_items.filter(b => b.procurement_status === 'received').length} received
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Equipment Usage</h4>
                  <p className="text-sm">
                    {project.equipment_reservations.length} reservations,
                    {' ' + project.equipment_reservations.filter(e => e.status === 'confirmed').length} confirmed,
                    {' ' + project.equipment_reservations.filter(e => e.status === 'completed').length} completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <TeamManagement 
            projectId={project.project_id}
            collaborators={project.collaborators}
            canEdit={permissions.canAddMembers}
            onUpdate={fetchProject}
          />
        </TabsContent>

        {/* BOM Tab */}
        <TabsContent value="bom">
          <BOMManagement 
            projectId={project.project_id}
            bomItems={project.bom_items}
            canEdit={permissions.canManageBOM}
            onUpdate={fetchProject}
          />
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment">
          <EquipmentReservations 
            projectId={project.project_id}
            reservations={project.equipment_reservations}
            canEdit={permissions.canReserveEquipment}
            onUpdate={fetchProject}
          />
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <ProjectFiles
            projectId={project.project_id}
            files={project.files}
            canEdit={permissions.canManageFiles}
            onUpdate={fetchProject}
            githubIntegrationEnabled={project.github_integration_enabled}
            githubRepoUrl={project.github_repo_url}
            githubRepoName={project.github_repo_name}
            githubDefaultBranch={project.github_default_branch}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ProjectActivity
            activities={project.activity_logs}
            showAll={true}
          />
        </TabsContent>

        {/* Whiteboard Tab */}
        <TabsContent value="whiteboard">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Collaborative Whiteboard</h3>
                <p className="text-sm text-gray-600">
                  Brainstorm and sketch ideas together in real-time
                </p>
              </div>
              <RealTimeEditingIndicators
                projectId={project.project_id}
                elementId="whiteboard"
                showViewers={true}
              />
            </div>

            <CollaborativeWhiteboard
              projectId={project.project_id}
              isReadOnly={!permissions.canEdit}
            />
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Shared Documents</h3>
                <p className="text-sm text-gray-600">
                  Collaborate on project documentation in real-time
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <RealTimeEditingIndicators
                  projectId={project.project_id}
                  elementId="documents"
                  showViewers={true}
                />
                <Button onClick={() => setShowDocumentEditor(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SharedDocumentEditor
                projectId={project.project_id}
                documentId="project-notes"
                title="Project Notes"
                initialContent="# Project Notes\n\nAdd your project notes here..."
                isReadOnly={!permissions.canEdit}
              />

              <SharedDocumentEditor
                projectId={project.project_id}
                documentId="meeting-minutes"
                title="Meeting Minutes"
                initialContent="# Meeting Minutes\n\nRecord your team meetings here..."
                isReadOnly={!permissions.canEdit}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Real-time Collaboration Hub */}
      <ProjectCollaborationHub
        projectId={project.project_id}
        isVisible={showCollaborationHub}
        onToggle={() => setShowCollaborationHub(!showCollaborationHub)}
      />
    </div>
  );
};

export default ProjectDetail;
