import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import {
  CalendarIcon,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Github,
  GitBranch,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useMakerspace } from '../contexts/MakerspaceContext';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

interface ProjectMilestone {
  title: string;
  description?: string;
  target_date?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ProjectCollaborator {
  user_id: string;
  email?: string;
  role: 'viewer' | 'editor' | 'owner';
}

interface ProjectData {
  name: string;
  description: string;
  project_type: 'internal' | 'open-collab' | 'sponsored';
  visibility: 'public' | 'private' | 'team-only';
  start_date?: Date;
  end_date?: Date;
  tags: string[];
  makerspace_id?: string;
  initial_milestones: ProjectMilestone[];
  initial_collaborators: ProjectCollaborator[];
  github_repo_url?: string;
  github_branch?: string;
  enable_github_integration: boolean;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const { user } = useAuth();
  const { currentMakerspace } = useMakerspace();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    project_type: 'internal',
    visibility: 'private',
    tags: [],
    initial_milestones: [],
    initial_collaborators: [],
    github_repo_url: '',
    github_branch: 'main',
    enable_github_integration: false,
  });
  const [newTag, setNewTag] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // New state for step 3
  const [newMilestone, setNewMilestone] = useState<Partial<ProjectMilestone>>({ priority: 'medium' });
  const [newCollaborator, setNewCollaborator] = useState<Partial<ProjectCollaborator>>({ role: 'viewer' });
  const [showMilestoneTargetCalendar, setShowMilestoneTargetCalendar] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Project name, type and description' },
    { id: 2, title: 'Settings', description: 'Visibility and timeline' },
    { id: 3, title: 'Team Setup', description: 'Add collaborators and milestones' },
    { id: 4, title: 'Tags & Review', description: 'Add tags and review' }
  ];

  const resetForm = () => {
    setProjectData({
      name: '',
      description: '',
      project_type: 'internal',
      visibility: 'private',
      tags: [],
      initial_milestones: [],
      initial_collaborators: [],
      github_repo_url: '',
      github_branch: 'main',
      enable_github_integration: false,
    });
    setCurrentStep(1);
    setError(null);
    setNewTag('');
    setNewMilestone({ priority: 'medium' });
    setNewCollaborator({ role: 'viewer' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return projectData.name.trim().length > 0;
      case 2:
        // Timeline validation - end date must be after start date
        if (projectData.start_date && projectData.end_date) {
          return projectData.end_date > projectData.start_date;
        }
        return true;
      case 3:
        return true; // Team setup is optional
      case 4:
        return true; // All validations passed in previous steps
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !projectData.tags.includes(newTag.trim())) {
      setProjectData({
        ...projectData,
        tags: [...projectData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProjectData({
      ...projectData,
      tags: projectData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const generateProjectId = () => {
    // Generate a project ID based on name and timestamp
    const timestamp = Date.now().toString(36);
    const nameSlug = projectData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 20);
    return `${nameSlug}-${timestamp}`;
  };

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.title.trim()) {
      setProjectData({
        ...projectData,
        initial_milestones: [...projectData.initial_milestones, {
          title: newMilestone.title.trim(),
          description: newMilestone.description?.trim() || undefined,
          target_date: newMilestone.target_date,
          priority: newMilestone.priority || 'medium'
        }]
      });
      setNewMilestone({ priority: 'medium' });
    }
  };

  const removeMilestone = (index: number) => {
    setProjectData({
      ...projectData,
      initial_milestones: projectData.initial_milestones.filter((_, i) => i !== index)
    });
  };

  const addCollaborator = () => {
    if (newCollaborator.user_id && newCollaborator.user_id.trim()) {
      // Check if collaborator already exists
      const exists = projectData.initial_collaborators.some(
        collab => collab.user_id === newCollaborator.user_id?.trim() ||
                  collab.email === newCollaborator.email?.trim()
      );

      if (!exists) {
        setProjectData({
          ...projectData,
          initial_collaborators: [...projectData.initial_collaborators, {
            user_id: newCollaborator.user_id.trim(),
            email: newCollaborator.email?.trim(),
            role: newCollaborator.role || 'viewer'
          }]
        });
        setNewCollaborator({ role: 'viewer' });
      }
    }
  };

  const removeCollaborator = (index: number) => {
    setProjectData({
      ...projectData,
      initial_collaborators: projectData.initial_collaborators.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError('Please check all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token') || 'mock-token';
      const projectId = generateProjectId();

      const submissionData = {
        project_id: projectId,
        name: projectData.name.trim(),
        description: projectData.description.trim() || null,
        project_type: projectData.project_type,
        visibility: projectData.visibility,
        start_date: projectData.start_date?.toISOString() || null,
        end_date: projectData.end_date?.toISOString() || null,
        tags: projectData.tags,
        makerspace_id: currentMakerspace?.id || null,
        initial_milestones: projectData.initial_milestones.map(m => ({
          ...m,
          target_date: m.target_date?.toISOString() || null
        })),
        initial_collaborators: projectData.initial_collaborators
      };

      const response = await fetch('/api/v1/projects/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create project';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const createdProject = await response.json();
      console.log('Project created successfully:', createdProject);
      
      onProjectCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectTypeDescription = (type: string) => {
    switch (type) {
      case 'internal':
        return 'Personal or team project within the makerspace';
      case 'open-collab':
        return 'Open for collaboration from community members';
      case 'sponsored':
        return 'Sponsored project with external funding';
      default:
        return '';
    }
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Anyone can view this project';
      case 'private':
        return 'Only you can view this project';
      case 'team-only':
        return 'Only team members can view this project';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'team-only':
        return <Users className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block min-w-0">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 min-w-[20px] ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Project Name *
                </Label>
                <Input
                  id="name"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  placeholder="Enter project name"
                  className="mt-1"
                  onKeyPress={(e) => handleKeyPress(e, nextStep)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose a descriptive name for your project
                </p>
              </div>

              {/* Project Type */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Project Type *
                </Label>
                <div className="space-y-3">
                  {(['internal', 'open-collab', 'sponsored'] as const).map((type) => (
                    <div
                      key={type}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        projectData.project_type === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setProjectData({ ...projectData, project_type: type })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="font-medium text-sm capitalize">
                            {type.replace('-', ' ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getProjectTypeDescription(type)}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          projectData.project_type === type
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {projectData.project_type === type && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  placeholder="Describe your project goals, scope, and objectives..."
                  className="mt-1 min-h-[100px]"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide details about what you're building and why
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Visibility */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Project Visibility
                </Label>
                <div className="space-y-3">
                  {(['public', 'team-only', 'private'] as const).map((visibility) => (
                    <div
                      key={visibility}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        projectData.visibility === visibility
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setProjectData({ ...projectData, visibility })}
                    >
                      <div className="flex items-center space-x-3">
                        {getVisibilityIcon(visibility)}
                        <div className="flex-1">
                          <div className="font-medium text-sm capitalize">
                            {visibility.replace('-', ' ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getVisibilityDescription(visibility)}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          projectData.visibility === visibility
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {projectData.visibility === visibility && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Project Timeline (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <Label className="text-xs text-gray-600">Start Date</Label>
                    <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {projectData.start_date ? (
                            format(projectData.start_date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={projectData.start_date}
                          onSelect={(date) => {
                            setProjectData({ ...projectData, start_date: date });
                            setShowStartCalendar(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div>
                    <Label className="text-xs text-gray-600">Target End Date</Label>
                    <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {projectData.end_date ? (
                            format(projectData.end_date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={projectData.end_date}
                          onSelect={(date) => {
                            setProjectData({ ...projectData, end_date: date });
                            setShowEndCalendar(false);
                          }}
                          initialFocus
                          disabled={(date) => 
                            projectData.start_date ? date < projectData.start_date : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {projectData.start_date && projectData.end_date && projectData.end_date <= projectData.start_date && (
                  <p className="text-xs text-red-600 mt-1">
                    End date must be after start date
                  </p>
                )}
              </div>

              {/* GitHub Integration */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  GitHub Integration (Optional)
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={projectData.enable_github_integration}
                      onCheckedChange={(checked) =>
                        setProjectData({ ...projectData, enable_github_integration: checked })
                      }
                    />
                    <Label className="text-sm">Enable GitHub integration</Label>
                  </div>

                  {projectData.enable_github_integration && (
                    <div className="space-y-3 pl-6 border-l-2 border-blue-100">
                      <div>
                        <Label htmlFor="github_repo_url" className="text-sm font-medium">
                          Repository URL
                        </Label>
                        <div className="relative mt-1">
                          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="github_repo_url"
                            value={projectData.github_repo_url || ''}
                            onChange={(e) => setProjectData({ ...projectData, github_repo_url: e.target.value })}
                            placeholder="https://github.com/username/repository"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Link your project to a GitHub repository for version control
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="github_branch" className="text-sm font-medium">
                          Default Branch
                        </Label>
                        <div className="relative mt-1">
                          <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="github_branch"
                            value={projectData.github_branch || 'main'}
                            onChange={(e) => setProjectData({ ...projectData, github_branch: e.target.value })}
                            placeholder="main"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Specify which branch to track for commits and files
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex items-start">
                          <Github className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-800">GitHub Features</p>
                            <p className="text-blue-700 mt-1">
                              • View latest commits and repository activity<br/>
                              • Browse and download project files<br/>
                              • Track development progress<br/>
                              • Link issues and pull requests
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team Setup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Initial Milestones */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Initial Milestones (Optional)
                </Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-4">
                      <Input
                        value={newMilestone.title || ''}
                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        placeholder="Milestone title"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Select
                        value={newMilestone.priority || 'medium'}
                        onValueChange={(value: any) => setNewMilestone({ ...newMilestone, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3">
                      <Popover open={showMilestoneTargetCalendar} onOpenChange={setShowMilestoneTargetCalendar}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newMilestone.target_date ? (
                              format(newMilestone.target_date, "MMM d")
                            ) : (
                              <span className="text-gray-400">Target</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newMilestone.target_date}
                            onSelect={(date) => {
                              setNewMilestone({ ...newMilestone, target_date: date });
                              setShowMilestoneTargetCalendar(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="md:col-span-2">
                      <Button type="button" onClick={addMilestone} disabled={!newMilestone.title?.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {projectData.initial_milestones.length > 0 && (
                    <div className="space-y-2">
                      {projectData.initial_milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{milestone.title}</span>
                              <Badge className={getPriorityColor(milestone.priority)}>
                                {milestone.priority}
                              </Badge>
                              {milestone.target_date && (
                                <span className="text-sm text-gray-500">
                                  Due {format(milestone.target_date, "MMM d, yyyy")}
                                </span>
                              )}
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Initial Collaborators */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Initial Collaborators (Optional)
                </Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-4">
                      <Input
                        value={newCollaborator.user_id || ''}
                        onChange={(e) => setNewCollaborator({ ...newCollaborator, user_id: e.target.value })}
                        placeholder="Username or ID"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Input
                        value={newCollaborator.email || ''}
                        onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
                        placeholder="Email (optional)"
                        type="email"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Select
                        value={newCollaborator.role || 'viewer'}
                        onValueChange={(value: any) => setNewCollaborator({ ...newCollaborator, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Button type="button" onClick={addCollaborator} disabled={!newCollaborator.user_id?.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {projectData.initial_collaborators.length > 0 && (
                    <div className="space-y-2">
                      {projectData.initial_collaborators.map((collaborator, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{collaborator.user_id}</span>
                            {collaborator.email && (
                              <span className="text-sm text-gray-500">({collaborator.email})</span>
                            )}
                            <Badge className={getRoleColor(collaborator.role)}>
                              {collaborator.role}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCollaborator(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Tags & Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Project Tags (Optional)
                </Label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => handleKeyPress(e, addTag)}
                    />
                    <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {projectData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {projectData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Review */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-3">Project Summary</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {projectData.name}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {projectData.project_type.replace('-', ' ')}
                  </div>
                  {projectData.description && (
                    <div>
                      <span className="font-medium">Description:</span> {projectData.description}
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Visibility:</span>
                    {getVisibilityIcon(projectData.visibility)}
                    <span className="ml-1 capitalize">{projectData.visibility.replace('-', ' ')}</span>
                  </div>
                  {(projectData.start_date || projectData.end_date) && (
                    <div>
                      <span className="font-medium">Timeline:</span>
                      {projectData.start_date && ` ${format(projectData.start_date, "MMM d, yyyy")}`}
                      {projectData.start_date && projectData.end_date && " - "}
                      {projectData.end_date && ` ${format(projectData.end_date, "MMM d, yyyy")}`}
                    </div>
                  )}
                  {projectData.tags.length > 0 && (
                    <div>
                      <span className="font-medium">Tags:</span> {projectData.tags.join(', ')}
                    </div>
                  )}
                  {projectData.initial_milestones.length > 0 && (
                    <div>
                      <span className="font-medium">Milestones:</span> {projectData.initial_milestones.length} planned
                    </div>
                  )}
                  {projectData.initial_collaborators.length > 0 && (
                    <div>
                      <span className="font-medium">Team:</span> {projectData.initial_collaborators.length + 1} members
                    </div>
                  )}
                  {projectData.enable_github_integration && projectData.github_repo_url && (
                    <div>
                      <span className="font-medium">GitHub:</span>
                      <a
                        href={projectData.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center"
                      >
                        {projectData.github_repo_url.replace('https://github.com/', '')}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep) || isLoading}
                className="flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(4) || isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
