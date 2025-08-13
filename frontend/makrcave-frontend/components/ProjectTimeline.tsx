import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Flag, 
  CheckCircle, 
  Circle, 
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { format, formatDistanceToNow, isBefore, isAfter } from 'date-fns';

interface Milestone {
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
}

interface ProjectTimelineProps {
  projectId: string;
  milestones: Milestone[];
  canEdit: boolean;
  onUpdate: () => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  projectId,
  milestones,
  canEdit,
  onUpdate
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    target_date: undefined as Date | undefined,
    priority: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return <Flag className="h-3 w-3" />;
      case 'medium': return <Flag className="h-3 w-3" />;
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      default: return <Flag className="h-3 w-3" />;
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) {
      setError('Please enter a milestone title');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newMilestone.title,
          description: newMilestone.description || null,
          target_date: newMilestone.target_date?.toISOString() || null,
          priority: newMilestone.priority,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add milestone');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: number) => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/milestones/${milestoneId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
    } catch (err) {
      console.error('Error completing milestone:', err);
    }
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
    } catch (err) {
      console.error('Error deleting milestone:', err);
    }
  };

  const resetForm = () => {
    setNewMilestone({
      title: '',
      description: '',
      target_date: undefined,
      priority: 'medium'
    });
    setError(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDistanceDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const isOverdue = (targetDate?: string) => {
    if (!targetDate) return false;
    try {
      return isBefore(new Date(targetDate), new Date()) && !milestones.find(m => m.target_date === targetDate)?.is_completed;
    } catch {
      return false;
    }
  };

  const getTimelineProgress = () => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.is_completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const sortedMilestones = [...milestones].sort((a, b) => {
    // Incomplete milestones first, then by target date, then by order index
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    
    if (a.target_date && b.target_date) {
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    }
    
    if (a.target_date && !b.target_date) return -1;
    if (!a.target_date && b.target_date) return 1;
    
    return a.order_index - b.order_index;
  });

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium">Project Timeline</h4>
            <p className="text-sm text-gray-600">
              {getTimelineProgress()}% complete ({milestones.filter(m => m.is_completed).length} of {milestones.length})
            </p>
          </div>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Milestone
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {milestones.length > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getTimelineProgress()}%` }}
          />
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-3">
        {sortedMilestones.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Target className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No milestones yet</p>
            <p className="text-xs">Add milestones to track project progress</p>
          </div>
        ) : (
          sortedMilestones.map((milestone, index) => (
            <div key={milestone.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${
              milestone.is_completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}>
              {/* Timeline Connector */}
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  milestone.is_completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'bg-white border-gray-300'
                }`}>
                  {milestone.is_completed ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                {index < sortedMilestones.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                )}
              </div>

              {/* Milestone Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className={`font-medium ${milestone.is_completed ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                      {milestone.title}
                    </h5>
                    
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    )}

                    <div className="flex items-center space-x-3 mt-2">
                      <Badge className={getPriorityColor(milestone.priority)}>
                        {getPriorityIcon(milestone.priority)}
                        {milestone.priority}
                      </Badge>

                      {milestone.target_date && (
                        <div className={`text-xs flex items-center gap-1 ${
                          isOverdue(milestone.target_date) ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(milestone.target_date)}
                          {!milestone.is_completed && (
                            <span className="ml-1">
                              ({formatDistanceDate(milestone.target_date)})
                            </span>
                          )}
                        </div>
                      )}

                      {milestone.is_completed && milestone.completion_date && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed {formatDistanceDate(milestone.completion_date)}
                        </div>
                      )}
                    </div>
                  </div>

                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!milestone.is_completed && (
                          <DropdownMenuItem onClick={() => handleCompleteMilestone(milestone.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setEditingMilestone(milestone)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Milestone
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMilestone(milestone.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Milestone
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Milestone Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="title">Milestone Title *</Label>
              <Input
                id="title"
                placeholder="Enter milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what needs to be accomplished..."
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Target Date (Optional)</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newMilestone.target_date ? (
                      format(newMilestone.target_date, "PPP")
                    ) : (
                      <span>Pick a target date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newMilestone.target_date}
                    onSelect={(date) => {
                      setNewMilestone({ ...newMilestone, target_date: date });
                      setShowCalendar(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={newMilestone.priority} 
                onValueChange={(value) => setNewMilestone({ ...newMilestone, priority: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-green-600" />
                      Low Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-blue-600" />
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      Critical Priority
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMilestone} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectTimeline;
