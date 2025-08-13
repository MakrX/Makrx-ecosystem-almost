'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGrid from '@/components/ProductGrid';
import SortSelect from '@/components/SortSelect';

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  banner_image?: string;
  seo_title?: string;
  seo_description?: string;
  curator_name?: string;
  curator_bio?: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  product_count: number;
  tags: string[];
  featured_categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

interface ProductList {
  products: any[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<ProductList | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('featured');

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/collections' },
    { name: collection?.name || 'Collection', href: `/collections/${slug}` },
  ];

  useEffect(() => {
    const fetchCollectionData = async () => {
      setLoading(true);
      try {
        // Fetch collection details
        const collectionResponse = await fetch(`/api/catalog/collections/${slug}`);
        if (!collectionResponse.ok) {
          throw new Error('Collection not found');
        }
        const collectionData = await collectionResponse.json();
        setCollection(collectionData);

        // Fetch collection products
        const productsResponse = await fetch(`/api/catalog/collections/${slug}/products?page=${page}&sort=${sort}&per_page=20`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Failed to fetch collection data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, [slug, page, sort]);

  if (loading) {
    return <CollectionPageSkeleton />;
  }

  if (!collection) {
    return <CollectionNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Collection Header */}
      <div className="bg-white dark:bg-gray-800">
        {collection.banner_image && (
          <div className="relative h-64 md:h-96">
            <Image
              src={collection.banner_image}
              alt={collection.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="container mx-auto">
                  <div className="max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {collection.name}
                    </h1>
                    <p className="text-xl text-gray-200 mb-4">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span>{collection.product_count} products</span>
                      {collection.curator_name && (
                        <span>Curated by {collection.curator_name}</span>
                      )}
                      <span>Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!collection.banner_image && (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                  Collection
                </span>
                {collection.is_featured && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {collection.name}
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {collection.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{collection.product_count} products</span>
                {collection.curator_name && (
                  <span>Curated by {collection.curator_name}</span>
                )}
                <span>Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Curator Info */}
        {collection.curator_name && collection.curator_bio && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  About the Curator
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{collection.curator_name}:</span> {collection.curator_bio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collection Tags & Categories */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Tags */}
              {collection.tags && collection.tags.length > 0 && (
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Related Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {collection.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Categories */}
              {collection.featured_categories && collection.featured_categories.length > 0 && (
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Featured Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {collection.featured_categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/c/${category.slug}`}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
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
              Collection Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {products?.total_count || 0} carefully selected products
            </p>
          </div>

          <div className="flex items-center gap-4">
            <SortSelect
              value={sort}
              onChange={setSort}
              options={[
                { value: 'featured', label: 'Featured First' },
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'popularity', label: 'Most Popular' },
              ]}
            />
          </div>
        </div>

        {/* Curated Description */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-1">
                Curated Collection
              </h3>
              <p className="text-purple-700 dark:text-purple-200 text-sm">
                This collection has been carefully curated to bring you the best products for your specific needs. 
                Each item is hand-picked based on quality, compatibility, and value.
              </p>
            </div>
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
              No products in this collection yet.
            </p>
          </div>
        )}
      </div>

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "CollectionPage",
            "name": collection.seo_title || collection.name,
            "description": collection.seo_description || collection.description,
            "url": `${window.location.origin}/collections/${collection.slug}`,
            "creator": collection.curator_name ? {
              "@type": "Person",
              "name": collection.curator_name
            } : undefined,
            "dateCreated": collection.created_at,
            "dateModified": collection.updated_at,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": collection.product_count,
              "itemListElement": products?.products.map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": product.name,
                  "url": `${window.location.origin}/p/${product.slug}`
                }
              })) || []
            }
          })
        }}
      />
    </div>
  );
}

function CollectionPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800">
        <div className="h-96 bg-gray-200 dark:bg-gray-700"></div>
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

function CollectionNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Collection Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The collection you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/collections"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse All Collections
        </Link>
      </div>
    </div>
  );
}
