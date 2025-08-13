import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Plus, 
  Wrench, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Edit, 
  Trash2,
  MoreHorizontal,
  Filter,
  Search,
  Zap,
  Shield,
  Settings,
  Eye,
  MapPin
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Input } from './ui/input';
import { format, addHours, isBefore, isAfter } from 'date-fns';

interface EquipmentReservation {
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
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string;
  requires_certification: boolean;
  is_available: boolean;
}

interface EquipmentReservationsProps {
  projectId: string;
  reservations: EquipmentReservation[];
  canEdit: boolean;
  onUpdate: () => void;
}

const EquipmentReservations: React.FC<EquipmentReservationsProps> = ({
  projectId,
  reservations,
  canEdit,
  onUpdate
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addHours(new Date(), 2));
  const [usageNotes, setUsageNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch('/api/v1/equipment', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEquipment(data.equipment || []);
      }
    } catch (err) {
      console.error('Error fetching equipment:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_use': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return <Clock className="h-3 w-3" />;
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'in_use': return <Zap className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getEquipmentInfo = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId) || {
      id: equipmentId,
      name: 'Unknown Equipment',
      category: 'Unknown',
      status: 'unknown',
      location: 'Unknown',
      requires_certification: false,
      is_available: false
    };
  };

  const handleAddReservation = async () => {
    if (!selectedEquipment || !startDate || !endDate) {
      setError('Please select equipment and dates');
      return;
    }

    if (isAfter(startDate, endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/equipment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_id: selectedEquipment.id,
          requested_start: startDate.toISOString(),
          requested_end: endDate.toISOString(),
          usage_notes: usageNotes || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (reservationId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/equipment/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
    } catch (err) {
      console.error('Error updating reservation:', err);
    }
  };

  const handleDeleteReservation = async (reservationId: number) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/equipment/${reservationId}`, {
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
      console.error('Error deleting reservation:', err);
    }
  };

  const resetForm = () => {
    setSelectedEquipment(null);
    setStartDate(new Date());
    setEndDate(addHours(new Date(), 2));
    setUsageNotes('');
    setSearchQuery('');
    setError(null);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const getDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const hours = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      if (hours < 1) {
        return `${Math.round(hours * 60)}m`;
      }
      return `${hours.toFixed(1)}h`;
    } catch {
      return 'Unknown';
    }
  };

  const isReservationActive = (reservation: EquipmentReservation) => {
    const now = new Date();
    const start = new Date(reservation.requested_start);
    const end = new Date(reservation.requested_end);
    return reservation.status === 'in_use' || (isAfter(now, start) && isBefore(now, end));
  };

  const filteredReservations = filterStatus === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filterStatus);

  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Equipment Reservations</h3>
          <p className="text-sm text-gray-600">
            Manage equipment bookings for this project
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Reserve Equipment
          </Button>
        )}
      </div>

      {/* Reservation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{reservations.length}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{reservations.filter(r => r.status === 'requested').length}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{reservations.filter(r => r.status === 'confirmed').length}</p>
                <p className="text-xs text-gray-600">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{reservations.filter(r => isReservationActive(r)).length}</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{reservations.filter(r => r.status === 'completed').length}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="filter-status">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reservations</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No equipment reservations found</p>
              <p className="text-sm">Reserve equipment to support your project</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => {
                const equipmentInfo = getEquipmentInfo(reservation.equipment_id);
                return (
                  <div key={reservation.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Equipment Info */}
                        <div className="flex items-center space-x-3">
                          <Wrench className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {equipmentInfo.name}
                              {equipmentInfo.requires_certification && (
                                <Shield className="h-4 w-4 text-orange-500" title="Requires Certification" />
                              )}
                              {isReservationActive(reservation) && (
                                <Zap className="h-4 w-4 text-green-500 animate-pulse" title="Currently Active" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {equipmentInfo.category} • {equipmentInfo.location}
                            </p>
                          </div>
                        </div>

                        {/* Reservation Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Start:</span>
                            <div className="font-medium">{formatDateTime(reservation.requested_start)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">End:</span>
                            <div className="font-medium">{formatDateTime(reservation.requested_end)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <div className="font-medium">{getDuration(reservation.requested_start, reservation.requested_end)}</div>
                          </div>
                        </div>

                        {/* Status and Notes */}
                        <div className="flex items-start justify-between">
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusIcon(reservation.status)}
                            {reservation.status.replace('_', ' ')}
                          </Badge>
                          
                          {reservation.usage_notes && (
                            <div className="text-sm max-w-md">
                              <span className="text-gray-600">Notes:</span>
                              <span className="ml-1">{reservation.usage_notes}</span>
                            </div>
                          )}
                        </div>

                        {/* Requested Info */}
                        <div className="text-xs text-gray-500">
                          Requested by {reservation.requested_by} • {formatDateTime(reservation.requested_at)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {reservation.status === 'requested' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Reservation
                                </DropdownMenuItem>
                              )}
                              {reservation.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'in_use')}>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Start Usage
                                </DropdownMenuItem>
                              )}
                              {reservation.status === 'in_use' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'completed')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete Usage
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReservation(reservation.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Reservation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Reservation Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reserve Equipment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Equipment Search */}
            <div>
              <Label htmlFor="equipment-search">Search Equipment</Label>
              <Input
                id="equipment-search"
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Equipment Selection */}
            <div className="max-h-60 overflow-auto space-y-2">
              {filteredEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEquipment?.id === eq.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEquipment(eq)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {eq.name}
                          {eq.requires_certification && (
                            <Shield className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {eq.category} • {eq.location}
                        </div>
                      </div>
                    </div>
                    <Badge className={eq.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {eq.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP p") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setShowStartCalendar(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>End Date & Time</Label>
                <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP p") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setShowEndCalendar(false);
                      }}
                      initialFocus
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Usage Notes */}
            <div>
              <Label htmlFor="usage-notes">Usage Notes</Label>
              <Textarea
                id="usage-notes"
                placeholder="Describe how you'll use this equipment..."
                value={usageNotes}
                onChange={(e) => setUsageNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Selected Equipment Info */}
            {selectedEquipment && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{selectedEquipment.name}</span>
                  {selectedEquipment.requires_certification && (
                    <Badge variant="outline" className="text-orange-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Certification Required
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedEquipment.category} • Located at {selectedEquipment.location}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddReservation} 
                disabled={isLoading || !selectedEquipment}
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Reservation
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

export default EquipmentReservations;
