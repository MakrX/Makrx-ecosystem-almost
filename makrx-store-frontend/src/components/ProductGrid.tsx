"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  sale_price?: number;
  images: string[];
  in_stock: boolean;
  is_featured?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  currency?: string;
}

interface ProductGridProps {
  products: Product[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  viewMode?: "grid" | "list";
}

export default function ProductGrid({
  products,
  page,
  totalPages,
  onPageChange,
  loading = false,
  viewMode = "grid",
}: ProductGridProps) {
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  const toggleWishlist = (productId: number) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <ProductGridSkeleton viewMode={viewMode} />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No products found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function ProductCard({
  product,
  wishlist,
  onToggleWishlist,
}: {
  product: Product;
  wishlist: Set<number>;
  onToggleWishlist: (id: number) => void;
}) {
  const effectivePrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const savings = isOnSale ? originalPrice - effectivePrice : 0;
  const savingsPercentage = isOnSale
    ? Math.round((savings / originalPrice) * 100)
    : 0;
  const currency = product.currency === "INR" ? "₹" : "$";
  const isWishlisted = wishlist.has(product.id);

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
      {/* Product Image */}
      <div className="relative aspect-square rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Link href={`/p/${product.slug}`}>
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {product.is_featured && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
              Featured
            </span>
          )}
          {isOnSale && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
              -{savingsPercentage}%
            </span>
          )}
          {!product.in_stock && (
            <span className="px-2 py-1 bg-gray-600 text-white text-xs font-semibold rounded">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-1">
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {isWishlisted ? (
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>
          <Link
            href={`/p/${product.slug}`}
            className="block p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="Quick view"
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
            {product.brand}
          </p>
        )}

        {/* Name */}
        <Link href={`/p/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating!.average) ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {currency}
            {effectivePrice.toLocaleString()}
          </span>
          {isOnSale && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {currency}
              {originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          disabled={!product.in_stock}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
          {product.in_stock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}

function ProductListItem({
  product,
  wishlist,
  onToggleWishlist,
}: {
  product: Product;
  wishlist: Set<number>;
  onToggleWishlist: (id: number) => void;
}) {
  const effectivePrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const savingsPercentage = isOnSale
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;
  const currency = product.currency === "INR" ? "₹" : "$";
  const isWishlisted = wishlist.has(product.id);

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Link href={`/p/${product.slug}`}>
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            {product.brand && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                {product.brand}
              </p>
            )}
            <Link href={`/p/${product.slug}`}>
              <h3 className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {product.name}
              </h3>
            </Link>

            {product.rating && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(product.rating!.average) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({product.rating.count})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {isWishlisted ? (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {currency}
              {effectivePrice.toLocaleString()}
            </span>
            {isOnSale && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {currency}
                  {originalPrice.toLocaleString()}
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold rounded">
                  -{savingsPercentage}%
                </span>
              </>
            )}
          </div>

          <button
            disabled={!product.in_stock}
            className="py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = [];
  const showPages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            1
          </button>
          {startPage > 2 && <span className="text-gray-500">…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            page === currentPage
              ? "text-white bg-blue-600 border-blue-600"
              : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-500">…</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        Next
      </button>
    </div>
  );
}

function ProductGridSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg animate-pulse"
          >
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border animate-pulse"
        >
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
          <div className="p-4 space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
