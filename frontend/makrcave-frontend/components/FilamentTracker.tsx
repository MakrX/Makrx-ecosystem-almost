import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from './ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from './ui/dropdown-menu';
import {
  Palette, Package, ShoppingCart, AlertTriangle, TrendingDown, Clock,
  Thermometer, Scale, Printer, Upload, Download, MoreVertical, Plus,
  RefreshCw, ExternalLink, Droplets, Target, Activity, CheckCircle,
  XCircle, Eye, Edit, QrCode, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface FilamentRoll {
  id: string;
  brand: string;
  material: string;
  color_name: string;
  color_hex?: string;
  diameter: number;
  original_weight_g: number;
  current_weight_g: number;
  spool_weight_g: number;
  used_weight_g: number;
  remaining_weight_g: number;
  cost_per_kg?: number;
  total_cost?: number;
  makrx_product_code?: string;
  makrx_product_url?: string;
  status: string;
  location: string;
  moisture_level?: number;
  auto_deduction_enabled: boolean;
  deduction_method: string;
  low_weight_threshold_g: number;
  reorder_threshold_g: number;
  auto_reorder_enabled: boolean;
  assigned_printer_id?: string;
  assigned_project_id?: string;
  quality_notes?: string;
  is_low_stock: boolean;
  needs_reorder: boolean;
  usage_percentage: number;
  estimated_remaining_prints: number;
  created_at: string;
  updated_at: string;
}

interface FilamentUsageLog {
  id: string;
  timestamp: string;
  weight_used_g: number;
  length_used_m?: number;
  weight_before_g: number;
  weight_after_g: number;
  deduction_method: string;
  confidence_level?: number;
  print_name?: string;
  user_name: string;
  printer_id?: string;
  print_success?: boolean;
  notes?: string;
}

interface FilamentTrackerProps {
  showHeader?: boolean;
  maxItems?: number;
  compactView?: boolean;
}

const FilamentTracker: React.FC<FilamentTrackerProps> = ({
  showHeader = true,
  maxItems,
  compactView = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rolls, setRolls] = useState<FilamentRoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoll, setSelectedRoll] = useState<FilamentRoll | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [usageHistory, setUsageHistory] = useState<FilamentUsageLog[]>([]);
  const [filters, setFilters] = useState({
    material: 'all',
    status: 'all',
    lowStockOnly: false
  });

  useEffect(() => {
    fetchFilamentRolls();
  }, [filters]);

  const fetchFilamentRolls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.material !== 'all') {
        params.append('material', filters.material);
      }
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.lowStockOnly) {
        params.append('low_stock_only', 'true');
      }
      if (maxItems) {
        params.append('limit', maxItems.toString());
      }

      const response = await fetch(`/api/v1/filament/rolls?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRolls(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load filament rolls",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching filament rolls:', error);
      toast({
        title: "Error",
        description: "Failed to load filament rolls",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recordUsage = async (rollId: string, weightUsed: number, printName?: string) => {
    try {
      const response = await fetch(`/api/v1/filament/rolls/${rollId}/usage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight_used_g: weightUsed,
          deduction_method: 'manual',
          print_name: printName,
          is_manual_entry: true,
          manual_reason: 'Manual usage entry'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Recorded ${weightUsed}g usage. ${result.remaining_weight_g}g remaining.`,
        });
        fetchFilamentRolls();
        setShowUsageModal(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to record usage",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error recording usage:', error);
      toast({
        title: "Error",
        description: "Failed to record usage",
        variant: "destructive",
      });
    }
  };

  const triggerReorder = async (rollId: string) => {
    try {
      const response = await fetch(`/api/v1/filament/rolls/${rollId}/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: 1,
          urgent: false,
          notes: 'Manual reorder request'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Reorder request created successfully",
        });
        
        // Open MakrX Store if URL is available
        if (result.makrx_order_url) {
          window.open(result.makrx_order_url, '_blank');
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to create reorder request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating reorder:', error);
      toast({
        title: "Error",
        description: "Failed to create reorder request",
        variant: "destructive",
      });
    }
  };

  const fetchRollDetails = async (rollId: string) => {
    try {
      const response = await fetch(`/api/v1/filament/rolls/${rollId}?include_usage_history=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const rollData = await response.json();
        setSelectedRoll(rollData);
        setUsageHistory(rollData.usage_history || []);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching roll details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-green-100 text-green-800',
      in_use: 'bg-blue-100 text-blue-800',
      low: 'bg-yellow-100 text-yellow-800',
      empty: 'bg-gray-100 text-gray-800',
      damaged: 'bg-red-100 text-red-800',
      reserved: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMaterialIcon = (material: string) => {
    const icons = {
      pla: '🔹',
      abs: '🔶',
      petg: '🔷',
      tpu: '🟡',
      wood_pla: '🟤',
      carbon_fiber: '⚫'
    };
    return icons[material as keyof typeof icons] || '🔘';
  };

  const formatWeight = (weight: number) => {
    return weight >= 1000 ? `${(weight / 1000).toFixed(1)}kg` : `${weight.toFixed(0)}g`;
  };

  const UsageModal = () => {
    const [weightUsed, setWeightUsed] = useState('');
    const [printName, setPrintName] = useState('');

    if (!showUsageModal || !selectedRoll) return null;

    return (
      <Dialog open={showUsageModal} onOpenChange={setShowUsageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Filament Usage</DialogTitle>
            <DialogDescription>
              Record manual filament usage for {selectedRoll.color_name} {selectedRoll.material.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight">Weight Used (g) *</Label>
              <Input
                id="weight"
                type="number"
                min="0.1"
                step="0.1"
                value={weightUsed}
                onChange={(e) => setWeightUsed(e.target.value)}
                placeholder="Enter weight in grams"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {formatWeight(selectedRoll.remaining_weight_g)}
              </p>
            </div>
            <div>
              <Label htmlFor="printName">Print Name (optional)</Label>
              <Input
                id="printName"
                value={printName}
                onChange={(e) => setPrintName(e.target.value)}
                placeholder="Enter print/project name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsageModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const weight = parseFloat(weightUsed);
                if (weight > 0) {
                  recordUsage(selectedRoll.id, weight, printName || undefined);
                }
              }}
              disabled={!weightUsed || parseFloat(weightUsed) <= 0}
            >
              Record Usage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const RollDetailModal = () => {
    if (!showDetailModal || !selectedRoll) return null;

    return (
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border" 
                style={{ backgroundColor: selectedRoll.color_hex || '#gray' }}
              />
              {selectedRoll.brand} {selectedRoll.material.toUpperCase()} - {selectedRoll.color_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh]">
            {/* Roll Information */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Weight Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Original Weight:</span>
                      <span className="font-medium">{formatWeight(selectedRoll.original_weight_g)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Weight:</span>
                      <span className="font-medium">{formatWeight(selectedRoll.current_weight_g)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className={`font-medium ${selectedRoll.is_low_stock ? 'text-red-600' : 'text-green-600'}`}>
                        {formatWeight(selectedRoll.remaining_weight_g)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span className="font-medium">{formatWeight(selectedRoll.used_weight_g)}</span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Usage Progress</span>
                        <span>{selectedRoll.usage_percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedRoll.usage_percentage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Status & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedRoll.status)}>
                        {selectedRoll.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{selectedRoll.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Auto Deduction:</span>
                      <Badge variant={selectedRoll.auto_deduction_enabled ? 'default' : 'outline'}>
                        {selectedRoll.auto_deduction_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    {selectedRoll.moisture_level && (
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <Droplets className="h-4 w-4" />
                          Moisture:
                        </span>
                        <span className="font-medium">{selectedRoll.moisture_level}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estimated Prints:</span>
                      <span className="font-medium">{selectedRoll.estimated_remaining_prints}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedRoll.makrx_product_code && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      MakrX Store Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Product Code:</span>
                        <span className="font-mono text-sm">{selectedRoll.makrx_product_code}</span>
                      </div>
                      {selectedRoll.cost_per_kg && (
                        <div className="flex justify-between">
                          <span>Cost per kg:</span>
                          <span className="font-medium">${selectedRoll.cost_per_kg.toFixed(2)}</span>
                        </div>
                      )}
                      <Button
                        onClick={() => triggerReorder(selectedRoll.id)}
                        className="w-full"
                        disabled={!selectedRoll.makrx_product_code}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Reorder from MakrX Store
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Usage History */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usageHistory.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {usageHistory.map((log) => (
                        <div key={log.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {formatWeight(log.weight_used_g)} used
                              </div>
                              {log.print_name && (
                                <div className="text-xs text-muted-foreground">
                                  Print: {log.print_name}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                By {log.user_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            {log.print_success !== undefined && (
                              <div className="flex-shrink-0">
                                {log.print_success ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No usage history available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowDetailModal(false);
                setShowUsageModal(true);
              }}
            >
              Record Usage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const lowStockRolls = rolls.filter(roll => roll.is_low_stock);
  const displayRolls = maxItems ? rolls.slice(0, maxItems) : rolls;

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="h-6 w-6" />
              Filament Tracking
            </h2>
            <p className="text-muted-foreground">
              Track filament usage with auto-deduction and MakrX Store integration
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchFilamentRolls}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Roll
            </Button>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockRolls.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                {lowStockRolls.length} filament roll(s) running low
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Filters */}
      {!compactView && (
        <div className="flex gap-4 items-center">
          <select
            value={filters.material}
            onChange={(e) => setFilters(prev => ({ ...prev, material: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Materials</option>
            <option value="pla">PLA</option>
            <option value="abs">ABS</option>
            <option value="petg">PETG</option>
            <option value="tpu">TPU</option>
            <option value="wood_pla">Wood PLA</option>
            <option value="carbon_fiber">Carbon Fiber</option>
          </select>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.lowStockOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, lowStockOnly: e.target.checked }))}
            />
            <span className="text-sm">Low stock only</span>
          </label>
        </div>
      )}

      {/* Filament Rolls Grid */}
      <div className={`grid gap-4 ${compactView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {displayRolls.map((roll) => (
          <Card key={roll.id} className={`${roll.is_low_stock ? 'border-orange-300' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: roll.color_hex || '#gray' }}
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {getMaterialIcon(roll.material)} {roll.material.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {roll.brand} • {roll.color_name}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => fetchRollDetails(roll.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedRoll(roll);
                        setShowUsageModal(true);
                      }}
                    >
                      <Scale className="h-4 w-4 mr-2" />
                      Record Usage
                    </DropdownMenuItem>
                    {roll.makrx_product_code && (
                      <DropdownMenuItem onClick={() => triggerReorder(roll.id)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Reorder
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span className={`font-medium ${roll.is_low_stock ? 'text-red-600' : 'text-green-600'}`}>
                    {formatWeight(roll.remaining_weight_g)}
                  </span>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Used: {roll.usage_percentage.toFixed(0)}%</span>
                    <span>{formatWeight(roll.original_weight_g)} total</span>
                  </div>
                  <Progress 
                    value={roll.usage_percentage} 
                    className={`h-2 ${roll.is_low_stock ? 'bg-red-100' : ''}`}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(roll.status)} variant="outline">
                    {roll.status.replace('_', ' ')}
                  </Badge>
                  {roll.is_low_stock && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Low Stock
                    </Badge>
                  )}
                  {roll.auto_reorder_enabled && (
                    <Badge variant="outline" className="text-blue-600">
                      Auto-Reorder
                    </Badge>
                  )}
                </div>
                
                {roll.assigned_printer_id && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Printer className="h-3 w-3" />
                    Assigned to printer
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Est. {roll.estimated_remaining_prints} prints remaining
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rolls.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Filament Rolls</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first filament roll to track usage and inventory.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Roll
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <UsageModal />
      <RollDetailModal />
    </div>
  );
};

export default FilamentTracker;
