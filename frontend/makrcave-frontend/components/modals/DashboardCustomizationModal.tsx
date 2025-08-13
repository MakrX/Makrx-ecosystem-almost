import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { 
  LayoutDashboard,
  Plus,
  Minus,
  Eye,
  EyeOff,
  GripVertical,
  Search,
  Filter,
  BarChart3,
  Users,
  Wrench,
  Package,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Settings,
  CheckCircle,
  Star,
  Activity
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'operations' | 'financial' | 'member' | 'system';
  icon: any;
  color: string;
  size: 'small' | 'medium' | 'large';
  isVisible: boolean;
  order: number;
  isDefault: boolean;
}

interface DashboardCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWidgets?: DashboardWidget[];
  onSave?: (widgets: DashboardWidget[]) => void;
}

const DashboardCustomizationModal: React.FC<DashboardCustomizationModalProps> = ({
  open,
  onOpenChange,
  currentWidgets = [],
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  // Available widgets
  const availableWidgets: DashboardWidget[] = [
    {
      id: 'equipment-status',
      name: 'Equipment Status Overview',
      description: 'Real-time status of all equipment in your makerspace',
      category: 'operations',
      icon: Wrench,
      color: 'text-orange-600',
      size: 'large',
      isVisible: true,
      order: 1,
      isDefault: true
    },
    {
      id: 'reservations-today',
      name: 'Today\'s Reservations',
      description: 'Upcoming reservations and bookings for today',
      category: 'operations',
      icon: Calendar,
      color: 'text-blue-600',
      size: 'medium',
      isVisible: true,
      order: 2,
      isDefault: true
    },
    {
      id: 'member-activity',
      name: 'Member Activity',
      description: 'Recent member check-ins and activity metrics',
      category: 'member',
      icon: Users,
      color: 'text-green-600',
      size: 'medium',
      isVisible: true,
      order: 3,
      isDefault: true
    },
    {
      id: 'revenue-chart',
      name: 'Revenue Analytics',
      description: 'Monthly revenue trends and financial metrics',
      category: 'financial',
      icon: DollarSign,
      color: 'text-purple-600',
      size: 'large',
      isVisible: false,
      order: 4,
      isDefault: false
    },
    {
      id: 'inventory-alerts',
      name: 'Inventory Alerts',
      description: 'Low stock warnings and reorder notifications',
      category: 'operations',
      icon: Package,
      color: 'text-red-600',
      size: 'small',
      isVisible: true,
      order: 5,
      isDefault: true
    },
    {
      id: 'usage-statistics',
      name: 'Usage Statistics',
      description: 'Equipment utilization and performance metrics',
      category: 'analytics',
      icon: BarChart3,
      color: 'text-indigo-600',
      size: 'medium',
      isVisible: false,
      order: 6,
      isDefault: false
    },
    {
      id: 'maintenance-schedule',
      name: 'Maintenance Schedule',
      description: 'Upcoming maintenance tasks and schedules',
      category: 'operations',
      icon: Clock,
      color: 'text-yellow-600',
      size: 'small',
      isVisible: true,
      order: 7,
      isDefault: true
    },
    {
      id: 'project-progress',
      name: 'Project Progress',
      description: 'Active projects and completion status',
      category: 'member',
      icon: TrendingUp,
      color: 'text-teal-600',
      size: 'medium',
      isVisible: false,
      order: 8,
      isDefault: false
    },
    {
      id: 'safety-incidents',
      name: 'Safety Incidents',
      description: 'Recent safety incidents and alerts',
      category: 'system',
      icon: AlertTriangle,
      color: 'text-red-500',
      size: 'small',
      isVisible: false,
      order: 9,
      isDefault: false
    },
    {
      id: 'member-certifications',
      name: 'Pending Certifications',
      description: 'Members awaiting skill certifications',
      category: 'member',
      icon: Star,
      color: 'text-amber-600',
      size: 'small',
      isVisible: false,
      order: 10,
      isDefault: false
    },
    {
      id: 'system-health',
      name: 'System Health',
      description: 'Platform performance and system status',
      category: 'system',
      icon: Activity,
      color: 'text-blue-500',
      size: 'small',
      isVisible: false,
      order: 11,
      isDefault: false
    },
    {
      id: 'quick-actions',
      name: 'Quick Actions',
      description: 'Shortcuts to common tasks and operations',
      category: 'system',
      icon: Settings,
      color: 'text-gray-600',
      size: 'medium',
      isVisible: true,
      order: 12,
      isDefault: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Widgets', count: availableWidgets.length },
    { id: 'operations', name: 'Operations', count: availableWidgets.filter(w => w.category === 'operations').length },
    { id: 'analytics', name: 'Analytics', count: availableWidgets.filter(w => w.category === 'analytics').length },
    { id: 'financial', name: 'Financial', count: availableWidgets.filter(w => w.category === 'financial').length },
    { id: 'member', name: 'Member', count: availableWidgets.filter(w => w.category === 'member').length },
    { id: 'system', name: 'System', count: availableWidgets.filter(w => w.category === 'system').length }
  ];

  useEffect(() => {
    if (currentWidgets.length > 0) {
      setWidgets(currentWidgets);
    } else {
      setWidgets(availableWidgets);
    }
  }, [currentWidgets]);

  const filteredWidgets = widgets.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const visibleWidgets = widgets.filter(w => w.isVisible).sort((a, b) => a.order - b.order);
  const hiddenWidgets = widgets.filter(w => !w.isVisible);

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isVisible: !widget.isVisible }
        : widget
    ));
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const visibleWidgetsList = visibleWidgets;
    const currentIndex = visibleWidgetsList.findIndex(w => w.id === widgetId);
    
    if (direction === 'up' && currentIndex > 0) {
      const newOrder = visibleWidgetsList[currentIndex - 1].order;
      setWidgets(prev => prev.map(widget => {
        if (widget.id === widgetId) {
          return { ...widget, order: newOrder };
        }
        if (widget.id === visibleWidgetsList[currentIndex - 1].id) {
          return { ...widget, order: widget.order + 1 };
        }
        return widget;
      }));
    } else if (direction === 'down' && currentIndex < visibleWidgetsList.length - 1) {
      const newOrder = visibleWidgetsList[currentIndex + 1].order;
      setWidgets(prev => prev.map(widget => {
        if (widget.id === widgetId) {
          return { ...widget, order: newOrder };
        }
        if (widget.id === visibleWidgetsList[currentIndex + 1].id) {
          return { ...widget, order: widget.order - 1 };
        }
        return widget;
      }));
    }
  };

  const resetToDefault = () => {
    setWidgets(availableWidgets.map(widget => ({
      ...widget,
      isVisible: widget.isDefault,
      order: widget.order
    })));
    toast({
      title: "Dashboard Reset",
      description: "Dashboard has been reset to default layout.",
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.(widgets);
      
      toast({
        title: "Dashboard Updated",
        description: "Your dashboard customization has been saved successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save dashboard settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'S';
      case 'medium': return 'M';
      case 'large': return 'L';
      default: return 'M';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'large': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel - Available Widgets */}
            <div className="lg:col-span-2 space-y-4 overflow-y-auto">
              {/* Search and Filter */}
              <div className="sticky top-0 bg-white z-10 pb-4 border-b">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search widgets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={resetToDefault}>
                    Reset to Default
                  </Button>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWidgets.map((widget) => {
                  const Icon = widget.icon;
                  return (
                    <div
                      key={widget.id}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        widget.isVisible
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${widget.color}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{widget.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{widget.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={widget.isVisible}
                          onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {widget.category}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getSizeColor(widget.size)}`}>
                            {getSizeLabel(widget.size)}
                          </Badge>
                          {widget.isDefault && (
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                              Default
                            </Badge>
                          )}
                        </div>
                        {widget.isVisible && (
                          <span className="text-xs text-green-600 font-medium">
                            #{visibleWidgets.findIndex(w => w.id === widget.id) + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Dashboard Preview */}
            <div className="space-y-4 overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 pb-4 border-b">
                <h3 className="font-medium text-gray-900">Dashboard Preview</h3>
                <p className="text-sm text-gray-600">
                  {visibleWidgets.length} widgets visible
                </p>
              </div>

              {/* Visible Widgets */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Active Widgets</h4>
                {visibleWidgets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <LayoutDashboard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No widgets selected</p>
                    <p className="text-sm">Enable widgets to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleWidgets.map((widget, index) => {
                      const Icon = widget.icon;
                      return (
                        <div
                          key={widget.id}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveWidget(widget.id, 'up')}
                                disabled={index === 0}
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                              >
                                <GripVertical className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => moveWidget(widget.id, 'down')}
                                disabled={index === visibleWidgets.length - 1}
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                              >
                                <GripVertical className="h-3 w-3" />
                              </button>
                            </div>
                            <Icon className={`h-4 w-4 ${widget.color} flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{widget.name}</p>
                              <div className="flex gap-1 mt-1">
                                <Badge variant="outline" className={`text-xs ${getSizeColor(widget.size)}`}>
                                  {getSizeLabel(widget.size)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleWidgetVisibility(widget.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Hide widget"
                          >
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hidden Widgets */}
              {hiddenWidgets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Hidden Widgets</h4>
                  <div className="space-y-2">
                    {hiddenWidgets.slice(0, 5).map((widget) => {
                      const Icon = widget.icon;
                      return (
                        <div
                          key={widget.id}
                          className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Icon className={`h-4 w-4 ${widget.color}`} />
                            <span className="text-sm truncate">{widget.name}</span>
                          </div>
                          <button
                            onClick={() => toggleWidgetVisibility(widget.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Show widget"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      );
                    })}
                    {hiddenWidgets.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{hiddenWidgets.length - 5} more hidden
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Layout
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCustomizationModal;
