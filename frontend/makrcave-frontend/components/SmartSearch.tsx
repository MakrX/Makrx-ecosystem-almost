import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Search,
  X,
  Filter,
  Clock,
  TrendingUp,
  User,
  Package,
  Wrench,
  Calendar,
  DollarSign,
  Star,
  Tag,
  MapPin,
  Hash,
  AlignLeft,
  Zap
} from 'lucide-react';

interface SearchSuggestion {
  id: string;
  type: 'keyword' | 'entity' | 'action' | 'filter' | 'recent';
  value: string;
  label: string;
  description?: string;
  icon: any;
  category: string;
  metadata?: any;
}

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'date' | 'number' | 'select';
  options?: Array<{ label: string; value: string }>;
}

interface SmartSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: SearchFilter[], suggestions: SearchSuggestion[]) => void;
  onFilterChange?: (filters: SearchFilter[]) => void;
  className?: string;
  showFilters?: boolean;
  categories?: string[];
  recentSearches?: string[];
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = "Search anything...",
  onSearch,
  onFilterChange,
  className = "",
  showFilters = true,
  categories = ['all'],
  recentSearches = []
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample data for demonstration
  const sampleSuggestions: SearchSuggestion[] = [
    // Keywords
    { id: 'k1', type: 'keyword', value: 'maintenance', label: 'Maintenance', icon: Wrench, category: 'operations', description: 'Equipment maintenance and repairs' },
    { id: 'k2', type: 'keyword', value: 'inventory', label: 'Inventory', icon: Package, category: 'operations', description: 'Stock and supplies management' },
    { id: 'k3', type: 'keyword', value: 'reservations', label: 'Reservations', icon: Calendar, category: 'bookings', description: 'Equipment bookings and schedules' },
    { id: 'k4', type: 'keyword', value: 'members', label: 'Members', icon: User, category: 'people', description: 'Member management and profiles' },
    { id: 'k5', type: 'keyword', value: 'billing', label: 'Billing', icon: DollarSign, category: 'financial', description: 'Invoices and payments' },
    
    // Entities
    { id: 'e1', type: 'entity', value: 'prusa i3', label: 'Prusa i3 MK3S', icon: Wrench, category: 'equipment', description: '3D Printer' },
    { id: 'e2', type: 'entity', value: 'laser cutter', label: 'Epilog Helix', icon: Wrench, category: 'equipment', description: 'CO2 Laser Cutter' },
    { id: 'e3', type: 'entity', value: 'john smith', label: 'John Smith', icon: User, category: 'members', description: 'Active member' },
    { id: 'e4', type: 'entity', value: 'arduino', label: 'Arduino Uno', icon: Package, category: 'inventory', description: 'Development board' },
    
    // Actions
    { id: 'a1', type: 'action', value: 'create reservation', label: 'Create Reservation', icon: Calendar, category: 'actions', description: 'Book equipment' },
    { id: 'a2', type: 'action', value: 'add inventory', label: 'Add Inventory', icon: Package, category: 'actions', description: 'Add new items' },
    { id: 'a3', type: 'action', value: 'schedule maintenance', label: 'Schedule Maintenance', icon: Wrench, category: 'actions', description: 'Plan maintenance' },
    { id: 'a4', type: 'action', value: 'generate report', label: 'Generate Report', icon: TrendingUp, category: 'actions', description: 'Create analytics report' },
    
    // Filters
    { id: 'f1', type: 'filter', value: 'status:available', label: 'Available Equipment', icon: Filter, category: 'filters', description: 'Show only available items' },
    { id: 'f2', type: 'filter', value: 'category:3d-printing', label: '3D Printing', icon: Tag, category: 'filters', description: 'Filter by category' },
    { id: 'f3', type: 'filter', value: 'location:main-floor', label: 'Main Floor', icon: MapPin, category: 'filters', description: 'Filter by location' },
    { id: 'f4', type: 'filter', value: 'date:today', label: 'Today', icon: Clock, category: 'filters', description: 'Show today\'s items' },
  ];

  const availableFilters: SearchFilter[] = [
    {
      id: 'status',
      label: 'Status',
      value: '',
      type: 'select',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'In Use', value: 'in_use' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Offline', value: 'offline' }
      ]
    },
    {
      id: 'category',
      label: 'Category',
      value: '',
      type: 'select',
      options: [
        { label: '3D Printing', value: '3d_printing' },
        { label: 'Laser Cutting', value: 'laser_cutting' },
        { label: 'Electronics', value: 'electronics' },
        { label: 'Woodworking', value: 'woodworking' }
      ]
    },
    {
      id: 'location',
      label: 'Location',
      value: '',
      type: 'text'
    },
    {
      id: 'date_from',
      label: 'From Date',
      value: '',
      type: 'date'
    },
    {
      id: 'date_to',
      label: 'To Date',
      value: '',
      type: 'date'
    }
  ];

  // Smart search algorithm
  const getSmartSuggestions = useCallback((searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery.trim()) {
      // Show recent searches and popular actions when empty
      const recentSuggestions = recentSearches.slice(0, 3).map((search, index) => ({
        id: `recent-${index}`,
        type: 'recent' as const,
        value: search,
        label: search,
        icon: Clock,
        category: 'recent',
        description: 'Recent search'
      }));
      
      const popularActions = sampleSuggestions.filter(s => s.type === 'action').slice(0, 4);
      return [...recentSuggestions, ...popularActions];
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const suggestions: SearchSuggestion[] = [];

    // 1. Exact keyword matches (highest priority)
    const exactMatches = sampleSuggestions.filter(s => 
      s.value.toLowerCase() === normalizedQuery ||
      s.label.toLowerCase() === normalizedQuery
    );
    suggestions.push(...exactMatches);

    // 2. Partial keyword matches
    const partialMatches = sampleSuggestions.filter(s => 
      !exactMatches.find(em => em.id === s.id) &&
      (s.value.toLowerCase().includes(normalizedQuery) ||
       s.label.toLowerCase().includes(normalizedQuery))
    );
    suggestions.push(...partialMatches);

    // 3. Description matches
    const descriptionMatches = sampleSuggestions.filter(s => 
      !suggestions.find(existing => existing.id === s.id) &&
      s.description?.toLowerCase().includes(normalizedQuery)
    );
    suggestions.push(...descriptionMatches);

    // 4. Smart pattern detection
    const patterns = detectSearchPatterns(normalizedQuery);
    patterns.forEach(pattern => {
      if (!suggestions.find(s => s.id === pattern.id)) {
        suggestions.push(pattern);
      }
    });

    // 5. Category-based suggestions
    if (categories.length > 1 || categories[0] !== 'all') {
      const categoryFiltered = suggestions.filter(s => 
        categories.includes('all') || categories.includes(s.category)
      );
      return categoryFiltered.slice(0, 8);
    }

    return suggestions.slice(0, 8);
  }, [recentSearches, categories]);

  const detectSearchPatterns = (query: string): SearchSuggestion[] => {
    const patterns: SearchSuggestion[] = [];

    // Detect filter patterns (field:value)
    const filterMatch = query.match(/(\w+):(\w+)/);
    if (filterMatch) {
      const [, field, value] = filterMatch;
      patterns.push({
        id: `pattern-filter-${field}-${value}`,
        type: 'filter',
        value: query,
        label: `Filter by ${field}: ${value}`,
        icon: Filter,
        category: 'filters',
        description: `Apply ${field} filter`
      });
    }

    // Detect ID patterns (#ID or SKU patterns)
    if (query.match(/^#?\w{2,}-\w{2,}/) || query.match(/^#\w+/)) {
      patterns.push({
        id: `pattern-id-${query}`,
        type: 'entity',
        value: query,
        label: `Search by ID: ${query}`,
        icon: Hash,
        category: 'search',
        description: 'Find specific item by ID'
      });
    }

    // Detect action patterns (verb + noun)
    const actionWords = ['create', 'add', 'schedule', 'generate', 'update', 'delete', 'view', 'edit'];
    const nounWords = ['reservation', 'inventory', 'maintenance', 'report', 'member', 'equipment'];
    
    actionWords.forEach(verb => {
      nounWords.forEach(noun => {
        if (query.includes(verb) && query.includes(noun)) {
          patterns.push({
            id: `pattern-action-${verb}-${noun}`,
            type: 'action',
            value: `${verb} ${noun}`,
            label: `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${noun}`,
            icon: Zap,
            category: 'actions',
            description: `Quick action: ${verb} ${noun}`
          });
        }
      });
    });

    return patterns;
  };

  useEffect(() => {
    const newSuggestions = getSmartSuggestions(query);
    setSuggestions(newSuggestions);
    setSelectedSuggestion(-1);
  }, [query, getSmartSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          selectSuggestion(suggestions[selectedSuggestion]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'filter') {
      // Add as filter
      const [field, value] = suggestion.value.split(':');
      const newFilter: SearchFilter = {
        id: field,
        label: field.charAt(0).toUpperCase() + field.slice(1),
        value: value,
        type: 'text'
      };
      
      const updatedFilters = [...activeFilters.filter(f => f.id !== field), newFilter];
      setActiveFilters(updatedFilters);
      onFilterChange?.(updatedFilters);
      setQuery('');
    } else {
      setQuery(suggestion.value);
    }
    setIsOpen(false);
    setTimeout(() => handleSearch(suggestion.value), 100);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    onSearch(finalQuery, activeFilters, suggestions);
    setIsOpen(false);
  };

  const removeFilter = (filterId: string) => {
    const updatedFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const addFilter = (filter: SearchFilter) => {
    const updatedFilters = [...activeFilters.filter(f => f.id !== filter.id), filter];
    setActiveFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    const Icon = suggestion.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'keyword': return 'text-blue-600';
      case 'entity': return 'text-green-600';
      case 'action': return 'text-purple-600';
      case 'filter': return 'text-orange-600';
      case 'recent': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`h-6 w-6 p-0 ${activeFilters.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <Filter className="h-3 w-3" />
            </Button>
          )}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="h-6 w-6 p-0 text-gray-400"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span className="text-xs">{filter.label}: {filter.value}</span>
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedSuggestion ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={getSuggestionTypeColor(suggestion.type)}>
                  {getSuggestionIcon(suggestion)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {suggestion.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                  {suggestion.description && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {suggestion.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableFilters.map((filter) => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={activeFilters.find(f => f.id === filter.id)?.value || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        addFilter({ ...filter, value: e.target.value });
                      } else {
                        removeFilter(filter.id);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={filter.type}
                    value={activeFilters.find(f => f.id === filter.id)?.value || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        addFilter({ ...filter, value: e.target.value });
                      } else {
                        removeFilter(filter.id);
                      }
                    }}
                    className="text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
