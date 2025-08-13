import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, User, 
  Check, X, AlertTriangle, Lock, Plus
} from 'lucide-react';

interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  available: boolean;
  reserved?: boolean;
  user_name?: string;
  reservation_id?: string;
  status?: 'pending' | 'approved' | 'active';
}

interface DayAvailability {
  date: string; // YYYY-MM-DD format
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  slots: TimeSlot[];
  isToday: boolean;
  isPast: boolean;
}

interface AvailabilityCalendarProps {
  equipmentId: string;
  equipmentName: string;
  startDate?: Date;
  onSlotSelect?: (date: string, slot: TimeSlot) => void;
  onReservationClick?: (reservationId: string) => void;
  userRole: string;
  canReserve: boolean;
  selectedSlots?: { date: string; slot: TimeSlot }[];
}

export default function AvailabilityCalendar({
  equipmentId,
  equipmentName,
  startDate = new Date(),
  onSlotSelect,
  onReservationClick,
  userRole,
  canReserve,
  selectedSlots = []
}: AvailabilityCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(startDate);
  const [availabilityData, setAvailabilityData] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Generate week dates
  const weekDates = useMemo(() => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeek]);

  // Load availability data
  useEffect(() => {
    loadAvailability();
  }, [equipmentId, currentWeek]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the API for each day
      const mockData = generateMockAvailability();
      setAvailabilityData(mockData);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAvailability = (): DayAvailability[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return weekDates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();

      // Generate time slots (9 AM - 6 PM in 1-hour slots)
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        const start = `${hour.toString().padStart(2, '0')}:00`;
        const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        // Mock some reservations and availability
        const isReserved = Math.random() < 0.3; // 30% chance of being reserved
        const isAvailable = !isPast && !isReserved && (dayOfWeek !== 0 && dayOfWeek !== 6); // No weekends
        
        slots.push({
          start,
          end,
          available: isAvailable,
          reserved: isReserved,
          user_name: isReserved ? 'John Doe' : undefined,
          reservation_id: isReserved ? `res-${Math.random().toString(36).substr(2, 9)}` : undefined,
          status: isReserved ? (Math.random() < 0.8 ? 'approved' : 'pending') : undefined
        });
      }

      return {
        date: dateStr,
        dayOfWeek,
        slots,
        isToday,
        isPast
      };
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const handleSlotClick = (date: string, slot: TimeSlot) => {
    if (slot.reserved && slot.reservation_id) {
      onReservationClick?.(slot.reservation_id);
    } else if (slot.available && canReserve) {
      onSlotSelect?.(date, slot);
    }
  };

  const isSlotSelected = (date: string, slot: TimeSlot) => {
    return selectedSlots.some(selected => 
      selected.date === date && 
      selected.slot.start === slot.start && 
      selected.slot.end === slot.end
    );
  };

  const getSlotClassName = (slot: TimeSlot, isSelected: boolean, isPastDay: boolean) => {
    const baseClasses = "p-2 text-xs rounded border cursor-pointer transition-colors min-h-[2.5rem] flex flex-col justify-center";
    
    if (isPastDay) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    
    if (slot.reserved) {
      const statusColor = slot.status === 'pending' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                         slot.status === 'active' ? 'bg-blue-100 border-blue-300 text-blue-800' :
                         'bg-red-100 border-red-300 text-red-800';
      return `${baseClasses} ${statusColor}`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-makrx-blue text-white border-makrx-blue`;
    }
    
    if (slot.available) {
      return `${baseClasses} bg-green-50 border-green-200 text-green-800 hover:bg-green-100`;
    }
    
    return `${baseClasses} bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed`;
  };

  const getStatusIcon = (slot: TimeSlot) => {
    if (slot.reserved) {
      switch (slot.status) {
        case 'pending':
          return <Clock className="w-3 h-3" />;
        case 'active':
          return <User className="w-3 h-3" />;
        default:
          return <Check className="w-3 h-3" />;
      }
    }
    if (slot.available) {
      return <Plus className="w-3 h-3" />;
    }
    return <Lock className="w-3 h-3" />;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  if (viewMode === 'day' && selectedDay) {
    const dayData = availabilityData.find(d => d.date === selectedDay);
    if (!dayData) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {equipmentName} - {new Date(selectedDay).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>
          <button
            onClick={() => setViewMode('week')}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back to Week View
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dayData.slots.map((slot, index) => (
            <button
              key={index}
              onClick={() => handleSlotClick(selectedDay, slot)}
              className={getSlotClassName(slot, isSlotSelected(selectedDay, slot), dayData.isPast)}
              disabled={dayData.isPast || (!slot.available && !slot.reserved)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{slot.start} - {slot.end}</span>
                {getStatusIcon(slot)}
              </div>
              
              {slot.reserved && slot.user_name && (
                <div className="text-xs truncate">
                  Reserved by {slot.user_name}
                </div>
              )}
              
              {slot.available && !slot.reserved && (
                <div className="text-xs">
                  Available
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{equipmentName} Availability</h3>
          <p className="text-sm text-gray-600">{formatDateRange()}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>
          
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 mb-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-1"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-1"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-1"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-makrx-blue mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading availability...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {weekDates.map((date, index) => (
            <div key={index} className="text-center p-3 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">
                {dayNames[date.getDay()]}
              </div>
              <div className={`text-lg font-semibold ${
                availabilityData[index]?.isToday 
                  ? 'text-makrx-blue' 
                  : availabilityData[index]?.isPast 
                    ? 'text-gray-400' 
                    : 'text-gray-900'
              }`}>
                {date.getDate()}
              </div>
            </div>
          ))}

          {/* Time Slots */}
          {availabilityData.map((dayData, dayIndex) => (
            <div key={dayIndex} className="space-y-1">
              {dayData.slots.map((slot, slotIndex) => (
                <button
                  key={slotIndex}
                  onClick={() => handleSlotClick(dayData.date, slot)}
                  className={getSlotClassName(slot, isSlotSelected(dayData.date, slot), dayData.isPast)}
                  disabled={dayData.isPast || (!slot.available && !slot.reserved)}
                  title={`${slot.start} - ${slot.end}${slot.reserved ? ` (${slot.user_name})` : ''}`}
                >
                  <div className="flex items-center justify-center">
                    {getStatusIcon(slot)}
                  </div>
                  <div className="text-center">
                    {slot.start}
                  </div>
                </button>
              ))}
              
              {/* View Day Button */}
              <button
                onClick={() => {
                  setSelectedDay(dayData.date);
                  setViewMode('day');
                }}
                className="w-full p-1 text-xs text-makrx-blue hover:bg-makrx-blue/10 rounded border border-makrx-blue/20"
              >
                View Day
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {selectedSlots.length > 0 && `${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''} selected`}
          </span>
          <span>
            Click available slots to reserve or view reservations
          </span>
        </div>
      </div>
    </div>
  );
}
