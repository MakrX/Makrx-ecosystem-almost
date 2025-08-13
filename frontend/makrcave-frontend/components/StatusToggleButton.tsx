import { useState } from 'react';
import { PlayCircle, PauseCircle, Wrench, XCircle, CheckCircle } from 'lucide-react';

interface StatusToggleButtonProps {
  currentStatus: 'available' | 'in_use' | 'under_maintenance' | 'offline';
  onStatusChange: (newStatus: string) => void;
  canChange: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusToggleButton({
  currentStatus,
  onStatusChange,
  canChange,
  size = 'md'
}: StatusToggleButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusOptions = [
    {
      value: 'available',
      label: 'Available',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 hover:bg-green-200'
    },
    {
      value: 'in_use',
      label: 'In Use',
      icon: PlayCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 hover:bg-blue-200'
    },
    {
      value: 'under_maintenance',
      label: 'Under Maintenance',
      icon: Wrench,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 hover:bg-yellow-200'
    },
    {
      value: 'offline',
      label: 'Offline',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 hover:bg-red-200'
    }
  ];

  const currentOption = statusOptions.find(option => option.value === currentStatus);
  const IconComponent = currentOption?.icon || CheckCircle;

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    setShowDropdown(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  if (!canChange) {
    return (
      <div className={`inline-flex items-center rounded-lg border ${currentOption?.bgColor} ${currentOption?.color} ${getSizeClasses()}`}>
        <IconComponent className={`${getIconSize()} mr-1`} />
        <span className="capitalize">{currentStatus.replace('_', ' ')}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`inline-flex items-center rounded-lg border border-gray-300 ${currentOption?.bgColor} ${currentOption?.color} ${getSizeClasses()} font-medium transition-colors`}
      >
        <IconComponent className={`${getIconSize()} mr-1`} />
        <span className="capitalize">{currentStatus.replace('_', ' ')}</span>
        <svg className={`${getIconSize()} ml-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            {statusOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center ${
                    option.value === currentStatus ? 'bg-gray-100' : ''
                  }`}
                >
                  <OptionIcon className={`w-4 h-4 mr-2 ${option.color}`} />
                  <span>{option.label}</span>
                  {option.value === currentStatus && (
                    <CheckCircle className="w-4 h-4 ml-auto text-green-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
