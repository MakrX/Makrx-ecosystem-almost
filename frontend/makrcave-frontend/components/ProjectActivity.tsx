import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Activity, 
  User, 
  UserPlus, 
  UserMinus, 
  Edit, 
  Plus, 
  Minus, 
  Upload, 
  Download, 
  Calendar, 
  CheckCircle, 
  Settings, 
  Flag,
  Package,
  Wrench,
  FileText,
  Clock,
  Filter,
  Search,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ActivityLog {
  id: number;
  activity_type: string;
  title: string;
  description?: string;
  metadata?: any;
  user_id: string;
  user_name: string;
  created_at: string;
}

interface ProjectActivityProps {
  activities: ActivityLog[];
  showAll?: boolean;
}

const ProjectActivity: React.FC<ProjectActivityProps> = ({ 
  activities, 
  showAll = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created': return <Plus className="h-4 w-4 text-green-600" />;
      case 'project_updated': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'member_added': return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'member_removed': return <UserMinus className="h-4 w-4 text-red-600" />;
      case 'member_role_changed': return <User className="h-4 w-4 text-orange-600" />;
      case 'bom_item_added': return <Plus className="h-4 w-4 text-blue-600" />;
      case 'bom_item_removed': return <Minus className="h-4 w-4 text-red-600" />;
      case 'bom_item_updated': return <Package className="h-4 w-4 text-blue-600" />;
      case 'equipment_reserved': return <Wrench className="h-4 w-4 text-green-600" />;
      case 'equipment_unreserved': return <Wrench className="h-4 w-4 text-red-600" />;
      case 'file_uploaded': return <Upload className="h-4 w-4 text-blue-600" />;
      case 'file_removed': return <Download className="h-4 w-4 text-red-600" />;
      case 'milestone_added': return <Flag className="h-4 w-4 text-purple-600" />;
      case 'milestone_completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'status_changed': return <Settings className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project_created':
      case 'member_added':
      case 'bom_item_added':
      case 'equipment_reserved':
      case 'milestone_completed':
        return 'bg-green-50 border-green-200';
      case 'member_removed':
      case 'bom_item_removed':
      case 'equipment_unreserved':
      case 'file_removed':
        return 'bg-red-50 border-red-200';
      case 'project_updated':
      case 'bom_item_updated':
      case 'file_uploaded':
        return 'bg-blue-50 border-blue-200';
      case 'member_role_changed':
      case 'status_changed':
        return 'bg-orange-50 border-orange-200';
      case 'milestone_added':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'project_created': 'Project',
      'project_updated': 'Project',
      'member_added': 'Team',
      'member_removed': 'Team',
      'member_role_changed': 'Team',
      'bom_item_added': 'BOM',
      'bom_item_removed': 'BOM',
      'bom_item_updated': 'BOM',
      'equipment_reserved': 'Equipment',
      'equipment_unreserved': 'Equipment',
      'file_uploaded': 'Files',
      'file_removed': 'Files',
      'milestone_added': 'Timeline',
      'milestone_completed': 'Timeline',
      'status_changed': 'Project',
    };
    return typeMap[type] || 'General';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'MMM d, yyyy h:mm a');
      }
    } catch {
      return 'Unknown time';
    }
  };

  const toggleExpanded = (activityId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedItems(newExpanded);
  };

  const getActivityTypes = () => {
    const types = Array.from(new Set(activities.map(a => getActivityTypeLabel(a.activity_type))));
    return types.sort();
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (activity.description && activity.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || getActivityTypeLabel(activity.activity_type) === filterType;
    
    return matchesSearch && matchesType;
  });

  const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      {showAll && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Project Activity</h3>
              <p className="text-sm text-gray-600">
                Complete history of project changes and updates
              </p>
            </div>
            <Badge variant="outline">
              {activities.length} Activities
            </Badge>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {getActivityTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="space-y-3">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Activity className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity found</p>
            {searchQuery || filterType !== 'all' ? (
              <p className="text-xs">Try adjusting your search or filters</p>
            ) : (
              <p className="text-xs">Project activities will appear here</p>
            )}
          </div>
        ) : (
          displayedActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className={`border rounded-lg p-4 ${getActivityColor(activity.activity_type)}`}
            >
              <div className="flex items-start space-x-3">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  {index < displayedActivities.length - 1 && showAll && (
                    <div className="w-0.5 h-4 bg-gray-300 mt-2" />
                  )}
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getActivityTypeLabel(activity.activity_type)}
                        </Badge>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {expandedItems.has(activity.id) 
                            ? activity.description 
                            : activity.description.length > 100 
                              ? `${activity.description.substring(0, 100)}...`
                              : activity.description
                          }
                          {activity.description.length > 100 && (
                            <button
                              onClick={() => toggleExpanded(activity.id)}
                              className="text-blue-600 hover:text-blue-700 ml-1"
                            >
                              {expandedItems.has(activity.id) ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </p>
                      )}

                      {/* Metadata display */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          {expandedItems.has(activity.id) && (
                            <div className="bg-white bg-opacity-50 rounded p-2 mt-2">
                              <strong>Details:</strong>
                              <pre className="text-xs mt-1 whitespace-pre-wrap">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{activity.user_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {showAll && activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleExpanded(activity.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show more button */}
      {!showAll && activities.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            View All Activity ({activities.length} total)
          </Button>
        </div>
      )}

      {/* Activity Summary */}
      {showAll && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {getActivityTypes().map((type) => {
                const count = activities.filter(a => getActivityTypeLabel(a.activity_type) === type).length;
                return (
                  <div key={type} className="text-center">
                    <div className="font-medium text-lg">{count}</div>
                    <div className="text-gray-600 text-xs">{type} Changes</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectActivity;
