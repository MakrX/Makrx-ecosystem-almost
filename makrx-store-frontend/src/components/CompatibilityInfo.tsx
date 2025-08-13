"use client";

import { useState } from "react";
// Using inline SVGs instead of Heroicons

interface CompatibilityInfoProps {
  compatibility: string[];
  productId: number;
}

export default function CompatibilityInfo({
  compatibility,
  productId,
}: CompatibilityInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!compatibility || compatibility.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Compatibility
        </h3>
        {isExpanded ? (
          <svg
            className="h-5 w-5 text-gray-500"
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
            className="h-5 w-5 text-gray-500"
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

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This product is compatible with the following:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {compatibility.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800 dark:text-green-200">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Compatibility information is provided for
              reference. Please verify specifications match your specific setup
              before ordering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
