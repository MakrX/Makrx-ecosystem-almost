"use client";

interface ProductSpecsProps {
  specifications: Record<string, any>;
  attributes: Record<string, any>;
}

export default function ProductSpecs({
  specifications,
  attributes,
}: ProductSpecsProps) {
  const allSpecs = { ...attributes, ...specifications };

  if (!allSpecs || Object.keys(allSpecs).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No specifications available
      </div>
    );
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Specifications
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Object.entries(allSpecs).map(([key, value], index) => (
          <div
            key={key}
            className={`px-6 py-4 ${
              index % 2 === 0
                ? "bg-gray-50 dark:bg-gray-900/50"
                : "bg-white dark:bg-gray-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <dt className="text-sm font-medium text-gray-900 dark:text-white">
                {formatKey(key)}
              </dt>
              <dd className="text-sm text-gray-600 dark:text-gray-300 sm:text-right max-w-xs">
                {formatValue(value)}
              </dd>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
