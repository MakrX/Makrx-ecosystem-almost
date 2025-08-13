"use client";

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: SortOption[];
}

const defaultOptions: SortOption[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popularity", label: "Most Popular" },
];

export default function SortSelect({
  value,
  onChange,
  options = defaultOptions,
}: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
