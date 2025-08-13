'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGrid from '@/components/ProductGrid';
import SortSelect from '@/components/SortSelect';

interface TagInfo {
  name: string;
  slug: string;
  description?: string;
  product_count: number;
  related_tags: string[];
  category_distribution: Array<{
    category: string;
    count: number;
  }>;
}

interface ProductList {
  products: any[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export default function TagPage() {
  const params = useParams();
  const slug = params.slug as string;
  const tagName = decodeURIComponent(slug);

  const [tagInfo, setTagInfo] = useState<TagInfo | null>(null);
  const [products, setProducts] = useState<ProductList | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('popularity');

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Tags', href: '/tags' },
    { name: tagName, href: `/tags/${slug}` },
  ];

  useEffect(() => {
    const fetchTagData = async () => {
      setLoading(true);
      try {
        // Fetch tag info
        const tagResponse = await fetch(`/api/catalog/tags/${encodeURIComponent(tagName)}`);
        if (tagResponse.ok) {
          const tagData = await tagResponse.json();
          setTagInfo(tagData);
        } else {
          // Create basic tag info if not found
          setTagInfo({
            name: tagName,
            slug,
            product_count: 0,
            related_tags: [],
            category_distribution: [],
          });
        }

        // Fetch products with this tag
        const productsResponse = await fetch('/api/catalog/search/advanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: tagName,
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
        console.error('Failed to fetch tag data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTagData();
  }, [tagName, slug, page, sort]);

  if (loading) {
    return <TagPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Tag Header */}
      <div className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                #{tagName}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {tagInfo?.product_count || products?.total_count || 0} products
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Products tagged with "{tagName}"
            </h1>

            {tagInfo?.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                {tagInfo.description}
              </p>
            )}

            {/* Category Distribution */}
            {tagInfo?.category_distribution && tagInfo.category_distribution.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Found in Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tagInfo.category_distribution.map((item) => (
                    <Link
                      key={item.category}
                      href={`/search?q=${encodeURIComponent(tagName)}&category=${encodeURIComponent(item.category)}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {item.category} ({item.count})
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Tags */}
            {tagInfo?.related_tags && tagInfo.related_tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Related Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tagInfo.related_tags.map((relatedTag) => (
                    <Link
                      key={relatedTag}
                      href={`/tags/${encodeURIComponent(relatedTag)}`}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      #{relatedTag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Products Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tagged Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {products?.total_count || 0} products found
            </p>
          </div>

          <div className="flex items-center gap-4">
            <SortSelect
              value={sort}
              onChange={setSort}
            />
          </div>
        </div>

        {/* Search Refinement */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <span className="font-medium">Looking for something more specific?</span> Try combining with other terms:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {['PLA', 'PETG', 'Arduino', 'Raspberry Pi', 'LED'].filter(term => term.toLowerCase() !== tagName.toLowerCase()).map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(`${tagName} ${term}`)}`}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              >
                {tagName} + {term}
              </Link>
            ))}
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
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.785-6.172-2.109l-.755.423A8.935 8.935 0 0112 16.5a8.935 8.935 0 017.927-2.186l-.755-.423A7.962 7.962 0 0117 13.291V12a5 5 0 10-10 0v1.291z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No products found with tag "{tagName}"
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This tag might be new or no products are currently tagged with it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/search"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try a Search
              </Link>
              <Link
                href="/c"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TagPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
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
