'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Brand {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  product_count: number;
  featured_products: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string;
  }>;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/catalog/brands?include_products=true');
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <h1 className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8"></h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Shop by Brand
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Discover products from your favorite brands and explore new ones.
          </p>

          {/* Search */}
          <div className="max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? `No brands found matching "${searchTerm}"` : 'No brands available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.slug} brand={brand} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BrandCardProps {
  brand: Brand;
}

function BrandCard({ brand }: BrandCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {brand.logo ? (
            <div className="w-16 h-16 relative flex-shrink-0">
              <Image
                src={brand.logo}
                alt={`${brand.name} logo`}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {brand.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {brand.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {brand.product_count} products
            </p>
          </div>
        </div>
        
        {brand.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 line-clamp-2">
            {brand.description}
          </p>
        )}
      </div>

      {/* Featured Products */}
      {brand.featured_products && brand.featured_products.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Featured Products
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {brand.featured_products.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                href={`/p/${product.slug}`}
                className="group block"
              >
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  <Image
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="mt-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* View All Button */}
      <div className="p-4 pt-0">
        <Link
          href={`/search?brand=${encodeURIComponent(brand.name)}`}
          className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View All {brand.name} Products
        </Link>
      </div>
    </div>
  );
}
