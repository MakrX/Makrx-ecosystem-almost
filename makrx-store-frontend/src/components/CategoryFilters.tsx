"use client";

import { useState } from "react";

interface CategoryFiltersProps {
  facets: any[];
  activeFilters: any;
  onFilterChange: (filters: any) => void;
}

export default function CategoryFilters({
  facets,
  activeFilters,
  onFilterChange,
}: CategoryFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["categories", "brands", "price"]),
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
    onFilterChange({});
  };

  const removeFilter = (filterType: string, value?: string) => {
    const newFilters = { ...activeFilters };
    if (value) {
      if (Array.isArray(newFilters[filterType])) {
        newFilters[filterType] = newFilters[filterType].filter(
          (v: string) => v !== value,
        );
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType];
        }
      }
    } else {
      delete newFilters[filterType];
    }
    onFilterChange(newFilters);
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Active Filters
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map((v: string) => (
                  <span
                    key={`${key}-${v}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {key}: {v}
                    <button
                      onClick={() => removeFilter(key, v)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ));
              } else if (value) {
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {key}: {value}
                    <button
                      onClick={() => removeFilter(key)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>

        {facets.map((facet, index) => (
          <div
            key={facet.name}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <button
              onClick={() => toggleSection(facet.name)}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {facet.name.replace("_", " ")}
              </span>
              {expandedSections.has(facet.name) ? (
                <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>

            {expandedSections.has(facet.name) && (
              <div className="px-4 pb-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {facet.values?.map((value: any) => (
                    <label
                      key={value.name || value.id}
                      className="flex items-center"
                    >
                      <input
                        type="checkbox"
                        checked={
                          activeFilters[facet.name]?.includes(
                            value.name || value.id,
                          ) || false
                        }
                        onChange={(e) => {
                          const currentValues = activeFilters[facet.name] || [];
                          const valueToToggle = value.name || value.id;
                          let newValues;

                          if (e.target.checked) {
                            newValues = [...currentValues, valueToToggle];
                          } else {
                            newValues = currentValues.filter(
                              (v: any) => v !== valueToToggle,
                            );
                          }

                          onFilterChange({
                            ...activeFilters,
                            [facet.name]:
                              newValues.length > 0 ? newValues : undefined,
                          });
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                        {value.name}
                        {value.count !== undefined && (
                          <span className="text-gray-400 ml-1">
                            ({value.count})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
