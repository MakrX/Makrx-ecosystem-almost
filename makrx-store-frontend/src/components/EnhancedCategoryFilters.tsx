"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Filter, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { getAllFiltersForCategory, type CategoryFilter } from "@/data/categoryFilters";

interface FilterFacet {
  name: string;
  values: Array<{
    id: string;
    name: string;
    count?: number;
  }>;
}

interface EnhancedCategoryFiltersProps {
  // New interface for facet-based filtering
  facets?: FilterFacet[];
  activeFilters?: Record<string, string[]>;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onToggle?: () => void;

  // Legacy interface for category-based filtering
  category?: string;
  onFiltersChange?: (filters: any) => void;
  onClose?: () => void;

  // Common props
  isOpen: boolean;
  className?: string;
}

// Legacy category-based filters component
function CategoryBasedFilters({
  category,
  onFiltersChange,
  onClose,
  className = "",
}: {
  category: string;
  onFiltersChange: (filters: any) => void;
  onClose?: () => void;
  className?: string;
}) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Memoize filters for the category to prevent infinite loops
  const categoryFilters = useMemo(() => getAllFiltersForCategory(category), [category]);

  // Initialize expanded sections only once when filters are loaded
  useEffect(() => {
    if (categoryFilters.length > 0 && expandedSections.size === 0) {
      // Expand first 3 filters by default
      const defaultExpanded = new Set(
        categoryFilters.slice(0, 3).map(filter => filter.id)
      );
      setExpandedSections(defaultExpanded);
    }
  }, [categoryFilters, expandedSections.size]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleFilterChange = (filterId: string, value: string, checked: boolean) => {
    const newFilters = { ...activeFilters };
    if (!newFilters[filterId]) {
      newFilters[filterId] = [];
    }

    if (checked) {
      if (!newFilters[filterId].includes(value)) {
        newFilters[filterId] = [...newFilters[filterId], value];
      }
    } else {
      newFilters[filterId] = newFilters[filterId].filter(v => v !== value);
      if (newFilters[filterId].length === 0) {
        delete newFilters[filterId];
      }
    }

    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
  };

  const removeFilter = (filterId: string, value?: string) => {
    const newFilters = { ...activeFilters };
    if (value) {
      if (newFilters[filterId]) {
        newFilters[filterId] = newFilters[filterId].filter(v => v !== value);
        if (newFilters[filterId].length === 0) {
          delete newFilters[filterId];
        }
      }
    } else {
      delete newFilters[filterId];
    }
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const activeFilterCount = Object.values(activeFilters).flat().length;

  if (categoryFilters.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            No filters available for {category}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
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
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([filterId, values]) => {
              const filter = categoryFilters.find(f => f.id === filterId);
              const filterName = filter?.name || filterId;

              return values.map((value: string) => {
                const option = filter?.options?.find(opt => opt.value === value);
                const displayValue = option?.label || value;

                return (
                  <span
                    key={`${filterId}-${value}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    <span className="font-medium">
                      {filterName}:
                    </span>
                    <span>{displayValue}</span>
                    <button
                      onClick={() => removeFilter(filterId, value)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              });
            })}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="max-h-96 overflow-y-auto">
        {categoryFilters.map((filter) => (
          <div
            key={filter.id}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <button
              onClick={() => toggleSection(filter.id)}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {filter.name}
                {filter.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
                {activeFilters[filter.id]?.length > 0 && (
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
                    {activeFilters[filter.id].length}
                  </span>
                )}
              </span>
              {expandedSections.has(filter.id) ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {expandedSections.has(filter.id) && (
              <div className="px-4 pb-4">
                {filter.helpText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {filter.helpText}
                  </p>
                )}

                {filter.type === 'checkbox' && filter.options && (
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
                            onChange={(e) => handleFilterChange(filter.id, option.value, e.target.checked)}
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

                {filter.type === 'select' && filter.options && (
                  <select
                    value={activeFilters[filter.id]?.[0] || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleFilterChange(filter.id, e.target.value, true);
                      } else {
                        removeFilter(filter.id);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select {filter.name}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} {option.count !== undefined && `(${option.count})`}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'range' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={`Min ${filter.unit || ''}`}
                        min={filter.min}
                        max={filter.max}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        placeholder={`Max ${filter.unit || ''}`}
                        min={filter.min}
                        max={filter.max}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {filter.type === 'toggle' && (
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters[filter.id]?.includes('true') || false}
                      onChange={(e) => handleFilterChange(filter.id, 'true', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      Enable {filter.name}
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EnhancedCategoryFilters({
  facets,
  activeFilters,
  onFilterChange,
  onToggle,
  category,
  onFiltersChange,
  onClose,
  isOpen,
  className = "",
}: EnhancedCategoryFiltersProps) {
  // Handle legacy category-based interface by loading actual filters
  if (category && onFiltersChange) {
    return <CategoryBasedFilters
      category={category}
      onFiltersChange={onFiltersChange}
      onClose={onClose}
      className={className}
    />;
  }
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["categories", "brands", "price", "material"])
  );

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
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const removeFilter = (filterType: string, value?: string) => {
    const newFilters = { ...(activeFilters || {}) };
    if (value) {
      if (Array.isArray(newFilters[filterType])) {
        newFilters[filterType] = newFilters[filterType].filter(
          (v: string) => v !== value
        );
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType];
        }
      }
    } else {
      delete newFilters[filterType];
    }
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const addFilter = (filterType: string, value: string) => {
    const safeActiveFilters = activeFilters || {};
    const currentValues = safeActiveFilters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    if (onFilterChange) {
      onFilterChange({
        ...safeActiveFilters,
        [filterType]: newValues.length > 0 ? newValues : undefined,
      });
    }
  };

  const hasActiveFilters = Object.keys(activeFilters || {}).length > 0;
  const activeFilterCount = Object.values(activeFilters || {}).flat().length;

  // Close drawer on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen && onToggle) {
        onToggle();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onToggle]);

  const FilterContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
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
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Clear All
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
                    {key.replace("_", " ")}:
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
        {facets.map((facet) => (
          <div
            key={facet.name}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <button
              onClick={() => toggleSection(facet.name)}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {facet.name.replace("_", " ")}
                {activeFilters[facet.name]?.length > 0 && (
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
                    {activeFilters[facet.name].length}
                  </span>
                )}
              </span>
              {expandedSections.has(facet.name) ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {expandedSections.has(facet.name) && (
              <div className="px-4 pb-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {facet.values?.map((value) => {
                    const isChecked = activeFilters[facet.name]?.includes(value.id) || false;
                    return (
                      <label
                        key={value.id}
                        className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => addFilter(facet.name, value.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-300 flex-1">
                          {value.name}
                          {value.count !== undefined && (
                            <span className="text-gray-400 ml-1">
                              ({value.count})
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
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

// Mobile Filter Toggle Hook
export function useFiltersToggle() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);
  const closeFilters = () => setIsFiltersOpen(false);

  // Show filters by default on desktop, hide on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      setIsFiltersOpen(isDesktop);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFiltersOpen) {
        closeFilters();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFiltersOpen]);

  return {
    isFiltersOpen,
    toggleFilters,
    closeFilters,
  };
}
