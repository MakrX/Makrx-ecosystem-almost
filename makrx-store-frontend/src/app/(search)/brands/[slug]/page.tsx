'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGrid from '@/components/ProductGrid';
import SortSelect from '@/components/SortSelect';

interface Brand {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  founded?: number;
  headquarters?: string;
  specialties: string[];
  product_count: number;
  banner_image?: string;
}

interface ProductList {
  products: any[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<ProductList | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('popularity');

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Brands', href: '/brands' },
    { name: brand?.name || 'Brand', href: `/brands/${slug}` },
  ];

  useEffect(() => {
    const fetchBrandData = async () => {
      setLoading(true);
      try {
        // Fetch brand details
        const brandResponse = await fetch(`/api/catalog/brands/${slug}`);
        if (!brandResponse.ok) {
          throw new Error('Brand not found');
        }
        const brandData = await brandResponse.json();
        setBrand(brandData);

        // Fetch brand products
        const productsResponse = await fetch('/api/catalog/search/advanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filters: {
              brands: [brandData.name],
            },
            sort_by: sort,
            page,
            per_page: 20,
          }),
        });

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Failed to fetch brand data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [slug, page, sort]);

  if (loading) {
    return <BrandPageSkeleton />;
  }

  if (!brand) {
    return <BrandNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Brand Header */}
      <div className="bg-white dark:bg-gray-800">
        {brand.banner_image && (
          <div className="relative h-64 md:h-80">
            <Image
              src={brand.banner_image}
              alt={`${brand.name} banner`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Brand Logo */}
            <div className="flex-shrink-0">
              {brand.logo ? (
                <div className="w-24 h-24 relative">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {brand.name}
              </h1>
              
              {brand.description && (
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                  {brand.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {brand.founded && (
                  <span>Founded: {brand.founded}</span>
                )}
                {brand.headquarters && (
                  <span>Headquarters: {brand.headquarters}</span>
                )}
                <span>{brand.product_count} products</span>
              </div>

              {brand.specialties && brand.specialties.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {brand.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {brand.website && (
                <div className="mt-4">
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Visit Website
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Products Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {brand.name} Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {products?.total_count || 0} products available
            </p>
          </div>

          <div className="flex items-center gap-4">
            <SortSelect
              value={sort}
              onChange={setSort}
            />
          </div>
        </div>

        {/* Products Grid */}
        {products && (
          <ProductGrid
            products={products.products}
            page={products.page}
            totalPages={products.total_pages}
            onPageChange={setPage}
          />
        )}

        {products && products.products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No products found for this brand.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BrandPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Brand Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The brand you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/brands"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse All Brands
        </Link>
      </div>
    </div>
  );
}
