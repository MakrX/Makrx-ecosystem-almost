"use client";

import { useState } from "react";
// Using inline SVGs instead of Heroicons

interface SearchFacet {
  name: string;
  type: string;
  values: Array<{
    id?: number;
    name: string;
    count: number;
  }>;
}

interface SearchFiltersProps {
  facets: SearchFacet[];
  activeFilters: {
    brand?: string[];
    material?: string[];
    min_price?: string;
    max_price?: string;
    [key: string]: any;
  };
  onFilterChange: (filters: any) => void;
}

export default function SearchFilters({
  facets,
  activeFilters,
  onFilterChange,
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["brands", "material", "price"]),
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

  const handleFilterChange = (
    filterType: string,
    value: string,
    checked: boolean,
  ) => {
    const currentValues = activeFilters[filterType] || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter((v: string) => v !== value);
    }

    onFilterChange({
      ...activeFilters,
      [filterType]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const handlePriceChange = (
    type: "min_price" | "max_price",
    value: string,
  ) => {
    onFilterChange({
      ...activeFilters,
      [type]: value || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filters
        </h3>

        {facets.map((facet) => (
          <div
            key={facet.name}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 py-4 last:pb-0"
          >
            <button
              onClick={() => toggleSection(facet.name)}
              className="flex items-center justify-between w-full text-left"
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
              <div className="mt-3 space-y-2">
                {facet.type === "checkbox" &&
                  facet.values.map((value) => (
                    <label key={value.name} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          activeFilters[facet.name]?.includes(value.name) ||
                          false
                        }
                        onChange={(e) =>
                          handleFilterChange(
                            facet.name,
                            value.name,
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        {value.name} ({value.count})
                      </span>
                    </label>
                  ))}

                {facet.type === "range" && facet.name === "price" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={activeFilters.min_price || ""}
                        onChange={(e) =>
                          handlePriceChange("min_price", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={activeFilters.max_price || ""}
                        onChange={(e) =>
                          handlePriceChange("max_price", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
