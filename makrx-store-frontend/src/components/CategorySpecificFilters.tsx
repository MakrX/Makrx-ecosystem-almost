"use client";

import { useState, useEffect } from "react";
import { X, Filter, ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw, Bookmark, Search } from "lucide-react";
import { getAllFiltersForCategory, type CategoryFilter } from "@/data/categoryFilters";

interface CategorySpecificFiltersProps {
  category: string;
  activeFilters: Record<string, string[]>;
  onFilterChange: (filters: Record<string, string[]>) => void;
  onToggle?: () => void;
  isOpen: boolean;
  className?: string;
  showSavedFilters?: boolean;
  enableQuickSearch?: boolean;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  category: string;
}

export default function CategorySpecificFilters({
  category,
  activeFilters,
  onFilterChange,
  onToggle,
  isOpen,
  className = "",
  showSavedFilters = true,
  enableQuickSearch = true,
}: CategorySpecificFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState("");

  // Get category-specific filters
  const categoryFilters = getAllFiltersForCategory(category);

  // Filter filters based on search query
  const filteredFilters = categoryFilters.filter(filter =>
    filter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    filter.options?.some(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`savedFilters_${category}`);
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, [category]);

  // Auto-expand sections with active filters
  useEffect(() => {
    const sectionsWithActiveFilters = new Set<string>();
    Object.keys(activeFilters).forEach(filterId => {
      if (activeFilters[filterId].length > 0) {
        sectionsWithActiveFilters.add(filterId);
      }
    });
    
    // Also expand first few sections by default
    const defaultExpanded = categoryFilters.slice(0, 3).map(f => f.id);
    defaultExpanded.forEach(id => sectionsWithActiveFilters.add(id));
    
    setExpandedSections(sectionsWithActiveFilters);
  }, [activeFilters, categoryFilters]);

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const removeFilter = (filterType: string, value?: string) => {
    const newFilters = { ...activeFilters };
    if (value) {
      if (Array.isArray(newFilters[filterType])) {
        newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType];
        }
      }
    } else {
      delete newFilters[filterType];
    }
    onFilterChange(newFilters);
  };

  const addFilter = (filterType: string, value: string) => {
    const currentValues = activeFilters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onFilterChange({
      ...activeFilters,
      [filterType]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const handleRangeChange = (filterId: string, type: 'min' | 'max', value: string) => {
    const rangeKey = `${filterId}${type === 'min' ? 'Min' : 'Max'}`;
    const newFilters = { ...activeFilters };
    
    if (value) {
      newFilters[rangeKey] = [value];
    } else {
      delete newFilters[rangeKey];
    }
    
    onFilterChange(newFilters);
  };

  const saveCurrentFilters = () => {
    if (!filterName.trim()) return;
    
    const newSavedFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: activeFilters,
      category,
    };
    
    const updatedSaved = [...savedFilters, newSavedFilter];
    setSavedFilters(updatedSaved);
    localStorage.setItem(`savedFilters_${category}`, JSON.stringify(updatedSaved));
    
    setFilterName("");
    setShowSaveModal(false);
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    onFilterChange(savedFilter.filters);
  };

  const deleteSavedFilter = (filterId: string) => {
    const updatedSaved = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updatedSaved);
    localStorage.setItem(`savedFilters_${category}`, JSON.stringify(updatedSaved));
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const activeFilterCount = Object.values(activeFilters).flat().length;

  const FilterContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {category.replace('-', ' ')} Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Clear All
            </button>
          )}
          {hasActiveFilters && showSavedFilters && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Bookmark className="h-3 w-3" />
              Save
            </button>
          )}
          <button
            onClick={onToggle}
            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Search */}
      {enableQuickSearch && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search filters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {/* Saved Filters */}
      {showSavedFilters && savedFilters.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Saved Filter Sets
          </h4>
          <div className="space-y-2">
            {savedFilters.map((saved) => (
              <div key={saved.id} className="flex items-center justify-between">
                <button
                  onClick={() => loadSavedFilter(saved)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1 text-left"
                >
                  {saved.name}
                </button>
                <button
                  onClick={() => deleteSavedFilter(saved.id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline ml-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, values]) =>
              values.map((value: string) => (
                <span
                  key={`${key}-${value}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  <span className="font-medium capitalize">
                    {key.replace(/Min|Max$/, '').replace("_", " ")}:
                  </span>
                  <span>{value}</span>
                  <button
                    onClick={() => removeFilter(key, value)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto">
        {filteredFilters.map((filter) => (
          <div
            key={filter.id}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <button
              onClick={() => toggleSection(filter.id)}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {filter.name}
                </span>
                {filter.required && (
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
                {activeFilters[filter.id]?.length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
                    {activeFilters[filter.id].length}
                  </span>
                )}
              </div>
              {expandedSections.has(filter.id) ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {expandedSections.has(filter.id) && (
              <div className="px-4 pb-4">
                {filter.helpText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
                    {filter.helpText}
                  </p>
                )}

                {(filter.type === 'checkbox' || filter.type === 'multiselect') && filter.options && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filter.options.map((option) => {
                      const isChecked = activeFilters[filter.id]?.includes(option.value) || false;
                      return (
                        <label
                          key={option.value}
                          className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => addFilter(filter.id, option.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="ml-3 text-sm text-gray-600 dark:text-gray-300 flex-1">
                            {option.label}
                            {option.count !== undefined && (
                              <span className="text-gray-400 ml-1">
                                ({option.count})
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {filter.type === 'range' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Minimum{filter.unit && ` (${filter.unit})`}
                        </label>
                        <input
                          type="number"
                          min={filter.min}
                          max={filter.max}
                          value={activeFilters[`${filter.id}Min`]?.[0] || ''}
                          onChange={(e) => handleRangeChange(filter.id, 'min', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder={filter.min?.toString()}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Maximum{filter.unit && ` (${filter.unit})`}
                        </label>
                        <input
                          type="number"
                          min={filter.min}
                          max={filter.max}
                          value={activeFilters[`${filter.id}Max`]?.[0] || ''}
                          onChange={(e) => handleRangeChange(filter.id, 'max', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder={filter.max?.toString()}
                        />
                      </div>
                    </div>
                    {filter.min !== undefined && filter.max !== undefined && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Range: {filter.min}{filter.unit} - {filter.max}{filter.unit}
                      </div>
                    )}
                  </div>
                )}

                {filter.type === 'select' && filter.options && (
                  <select
                    value={activeFilters[filter.id]?.[0] || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        addFilter(filter.id, e.target.value);
                      } else {
                        removeFilter(filter.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All {filter.name}</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.count && ` (${option.count})`}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'toggle' && (
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters[filter.id]?.[0] === 'true' || false}
                      onChange={(e) => addFilter(filter.id, e.target.checked ? 'true' : 'false')}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      activeFilters[filter.id]?.[0] === 'true' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        activeFilters[filter.id]?.[0] === 'true' 
                          ? 'translate-x-6' 
                          : 'translate-x-1'
                      }`} />
                    </div>
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{filter.name}</span>
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Filter Set
            </h4>
            <input
              type="text"
              placeholder="Enter filter set name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={saveCurrentFilters}
                disabled={!filterName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={onToggle}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Desktop Left Rail */}
      <div className={`hidden lg:block ${className}`}>
        <div className="sticky top-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <FilterContent />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onToggle} />
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md">
              <div className="h-full bg-white dark:bg-gray-800 shadow-xl">
                <FilterContent />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
