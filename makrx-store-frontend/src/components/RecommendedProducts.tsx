"use client";

import Link from "next/link";
import Image from "next/image";
// Using inline SVGs instead of Heroicons

interface RecommendedProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  sale_price?: number;
  images: string[];
  rating?: {
    average: number;
    count: number;
  };
}

interface RecommendedProductsProps {
  products: RecommendedProduct[];
  title?: string;
}

export default function RecommendedProducts({
  products,
  title = "Recommended Products",
}: RecommendedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <RecommendedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function RecommendedProductCard({ product }: { product: RecommendedProduct }) {
  const effectivePrice = product.sale_price || product.price;
  const isOnSale = product.sale_price && product.sale_price < product.price;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden">
        <Link href={`/p/${product.slug}`}>
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </Link>

        {isOnSale && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
              Sale
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <Link href={`/p/${product.slug}`}>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h4>
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
        <div className="flex items-center gap-1 mb-3">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            ₹{effectivePrice.toLocaleString()}
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <button className="w-full py-2 px-3 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
          Add
        </button>
      </div>
    </div>
  );
}
