"use client";

import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({
  items,
  className = "",
}: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {/* Separator (except for first item) */}
              {!isFirst && (
                <svg
                  className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-2"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}

              {/* Breadcrumb item */}
              <div className="flex items-center">
                {isFirst && (
                  <svg
                    className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                )}

                {isLast ? (
                  <span
                    className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]"
                    aria-current="page"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors truncate max-w-[200px]"
                    title={item.name}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Mobile-friendly breadcrumbs that show only parent and current
export function MobileBreadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  // For mobile, show only the parent and current item if there are more than 2 items
  const displayItems =
    items.length > 2
      ? [items[items.length - 2], items[items.length - 1]]
      : items;

  return (
    <nav className={`flex md:hidden ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {items.length > 2 && (
          <li className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label="Go back"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <svg
              className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-2"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
        )}

        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isFirst = index === 0 && items.length <= 2;

          return (
            <li key={index} className="flex items-center">
              {/* Separator (except for first item) */}
              {!isFirst && (
                <svg
                  className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-2"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}

              {/* Breadcrumb item */}
              {isLast ? (
                <span
                  className="text-gray-900 dark:text-white font-medium truncate max-w-[150px]"
                  aria-current="page"
                  title={item.name}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors truncate max-w-[150px]"
                  title={item.name}
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Structured data for SEO
export function BreadcrumbsStructuredData({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${typeof window !== "undefined" ? window.location.origin : ""}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
