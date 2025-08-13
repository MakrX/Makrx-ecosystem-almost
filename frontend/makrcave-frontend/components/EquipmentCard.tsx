import { useState, useEffect, useRef } from 'react';
import {
  Wrench, Calendar, Star, MapPin, Clock, Shield, Settings,
  Eye, Edit, PlayCircle, PauseCircle, CheckCircle, XCircle,
  AlertTriangle, User, DollarSign, BookOpen, Zap, BarChart3
} from 'lucide-react';
import { useSkills } from '../contexts/SkillContext';

interface Equipment {
  id: string;
  equipment_id: string;
  name: string;
  category?: string;
  sub_category?: string;
  status: 'available' | 'in_use' | 'under_maintenance' | 'offline';
  location: string;
  requires_certification: boolean;
  certification_required?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  total_usage_hours?: number;
  usage_count?: number;
  average_rating?: number;
  total_ratings?: number;
  manufacturer?: string;
  model?: string;
  hourly_rate?: number;
  description?: string;
  image_url?: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onReserve?: (equipment: Equipment) => void;
  onViewDetails?: (equipment: Equipment) => void;
  onEdit?: (equipment: Equipment) => void;
  onMaintenance?: (equipment: Equipment) => void;
  onToggleStatus?: (equipment: Equipment) => void;
  viewMode?: 'grid' | 'list';
  userRole: string;
  canReserve: boolean;
  canEdit: boolean;
  canMaintenance: boolean;
}

export default function EquipmentCard({
  equipment,
  onReserve,
  onViewDetails,
  onEdit,
  onMaintenance,
  onToggleStatus,
  viewMode = 'grid',
  userRole,
  canReserve,
  canEdit,
  canMaintenance
}: EquipmentCardProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const { canAccessEquipment } = useSkills();

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showQuickActions]);

  // Check if user has required skills for this equipment
  const accessCheck = canAccessEquipment(equipment.equipment_id);
  const hasRequiredSkills = accessCheck.canAccess;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_use':
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'under_maintenance':
        return <Wrench className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_use':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return '🛠️';
    switch (category) {
      case 'printer_3d':
        return '🖨️';
      case 'laser_cutter':
        return '🔥';
      case 'cnc_machine':
        return '⚙️';
      case 'testing_tool':
        return '🔬';
      case 'soldering_station':
        return '🔌';
      case 'workstation':
        return '💻';
      case 'hand_tool':
        return '🔧';
      case 'measuring_tool':
        return '📏';
      default:
        return '🛠️';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatCategoryName = (category?: string) => {
    if (!category) return 'Unknown';
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isMaintenanceDue = () => {
    if (!equipment.next_maintenance_date) return false;
    const nextDate = new Date(equipment.next_maintenance_date);
    const now = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Due within 7 days
  };

  const getUtilizationColor = (hours: number) => {
    if (hours < 50) return 'text-green-600';
    if (hours < 200) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-6">
          {/* Equipment Image */}
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {equipment.image_url ? (
              <img src={equipment.image_url} alt={equipment.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{getCategoryIcon(equipment.category)}</span>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">{equipment.name}</h3>
                <p className="text-sm text-gray-600">{equipment.equipment_id} • {formatCategoryName(equipment.category)}</p>
                <p className="text-sm text-gray-500">{equipment.manufacturer} {equipment.model}</p>
              </div>
              
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(equipment.status)}`}>
                {getStatusIcon(equipment.status)}
                <span className="ml-1 capitalize">{equipment.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {equipment.location}
            </div>
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {(equipment.total_usage_hours || 0).toFixed(0)}h
            </div>

            <div className="flex items-center">
              {renderStars(equipment.average_rating || 0)}
              <span className="ml-1">{(equipment.average_rating || 0).toFixed(1)}</span>
            </div>

            {equipment.hourly_rate && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                ${(equipment.hourly_rate || 0).toFixed(2)}/h
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onViewDetails?.(equipment)}
              className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">View</span>
            </button>

            {canReserve && equipment.status === 'available' && (
              <button
                onClick={() => onReserve?.(equipment)}
                disabled={!hasRequiredSkills}
                className={`inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg whitespace-nowrap ${
                  hasRequiredSkills
                    ? 'bg-makrx-blue text-white hover:bg-makrx-blue/90'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                title={!hasRequiredSkills ? `Missing skills: ${accessCheck.missingSkills.join(', ')}` : ''}
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">{hasRequiredSkills ? 'Reserve' : 'Skills Required'}</span>
                <span className="sm:hidden">{hasRequiredSkills ? 'Book' : 'Locked'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Equipment Image */}
      <div className="relative w-full h-48 bg-gray-100">
        {equipment.image_url ? (
          <img src={equipment.image_url} alt={equipment.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{getCategoryIcon(equipment.category)}</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(equipment.status)}`}>
          {getStatusIcon(equipment.status)}
          <span className="ml-1 capitalize">{equipment.status.replace('_', ' ')}</span>
        </div>

        {/* Skill/Certification Badge */}
        {(equipment.requires_certification || !hasRequiredSkills) && (
          <div className={`absolute top-3 left-3 inline-flex items-center px-2 py-1 border rounded-full text-xs font-medium ${
            hasRequiredSkills
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-red-100 text-red-800 border-red-200'
          }`}>
            <Shield className="w-3 h-3 mr-1" />
            {hasRequiredSkills ? 'Certified' : 'Skills Required'}
          </div>
        )}

        {/* Maintenance Due Warning */}
        {isMaintenanceDue() && (
          <div className="absolute bottom-3 left-3 inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Maintenance Due
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{equipment.name}</h3>
            <p className="text-sm text-gray-600">{equipment.equipment_id}</p>
            <p className="text-sm text-gray-500">{formatCategoryName(equipment.category)}</p>
            {equipment.manufacturer && equipment.model && (
              <p className="text-sm text-gray-500">{equipment.manufacturer} {equipment.model}</p>
            )}
          </div>
          
          <div className="relative" ref={quickActionsRef}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>

            {showQuickActions && (
              <div className="absolute right-0 top-8 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button
                  onClick={() => {
                    onViewDetails?.(equipment);
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                
                {canEdit && (
                  <button
                    onClick={() => {
                      onEdit?.(equipment);
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Equipment
                  </button>
                )}
                
                {canMaintenance && (
                  <button
                    onClick={() => {
                      onMaintenance?.(equipment);
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Maintenance Log
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Location and Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {equipment.location}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span className={getUtilizationColor(equipment.total_usage_hours || 0)}>
              {(equipment.total_usage_hours || 0).toFixed(1)}h used
            </span>
            <span className="text-gray-400 ml-1">({equipment.usage_count || 0} sessions)</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <div className="flex items-center mr-4">
              {renderStars(equipment.average_rating || 0)}
              <span className="ml-1">{(equipment.average_rating || 0).toFixed(1)}</span>
              <span className="text-gray-400 ml-1">({equipment.total_ratings || 0})</span>
            </div>
          </div>

          {equipment.requires_certification && equipment.certification_required && (
            <div className="flex items-center text-sm text-amber-600">
              <Shield className="w-4 h-4 mr-2" />
              <span className="truncate">{equipment.certification_required}</span>
            </div>
          )}

          {equipment.hourly_rate && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              ${(equipment.hourly_rate || 0).toFixed(2)}/hour
            </div>
          )}
        </div>

        {/* Description */}
        {equipment.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{equipment.description}</p>
        )}

        {/* Maintenance Info */}
        {equipment.next_maintenance_date && (
          <div className="mb-4 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center text-xs text-gray-600">
              <Wrench className="w-3 h-3 mr-1" />
              Next maintenance: {new Date(equipment.next_maintenance_date).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex flex-1 gap-2">
            <button
              onClick={() => onViewDetails?.(equipment)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="truncate">Details</span>
            </button>

            {canReserve && equipment.status === 'available' && (
              <button
                onClick={() => onReserve?.(equipment)}
                disabled={!hasRequiredSkills}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm rounded-lg ${
                  hasRequiredSkills
                    ? 'bg-makrx-blue text-white hover:bg-makrx-blue/90'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                title={!hasRequiredSkills ? `Missing skills: ${accessCheck.missingSkills.join(', ')}` : ''}
              >
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {hasRequiredSkills ? (
                    <><span className="hidden sm:inline">Reserve</span><span className="sm:hidden">Book</span></>
                  ) : (
                    <><span className="hidden sm:inline">Skills Required</span><span className="sm:hidden">Locked</span></>
                  )}
                </span>
              </button>
            )}
          </div>

          {canMaintenance && (
            <button
              onClick={() => onMaintenance?.(equipment)}
              className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 sm:w-auto w-full"
              title="Maintenance"
            >
              <Wrench className="w-4 h-4 sm:mr-0 mr-1" />
              <span className="sm:hidden">Maintenance</span>
            </button>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Utilization</span>
            <span>Last Used</span>
            <span>Rating</span>
          </div>
          <div className="flex items-center justify-between text-sm font-medium text-gray-900 mt-1">
            <span className={getUtilizationColor(equipment.total_usage_hours || 0)}>
              {(equipment.usage_count || 0) > 0 ? 'Active' : 'New'}
            </span>
            <span>
              {(equipment.usage_count || 0) > 0 ? 'Recently' : 'Never'}
            </span>
            <span>{(equipment.average_rating || 0).toFixed(1)}★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
