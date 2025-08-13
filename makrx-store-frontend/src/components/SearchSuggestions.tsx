"use client";

interface SearchSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export default function SearchSuggestions({
  suggestions,
  onSuggestionClick,
}: SearchSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
        Did you mean?
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
