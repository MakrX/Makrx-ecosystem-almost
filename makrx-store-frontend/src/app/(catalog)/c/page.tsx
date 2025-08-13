'use client';

import { useEffect, useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  product_count?: number;
  children: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/catalog/categories/tree?include_product_counts=true');
        const data = await response.json();
        setCategories(data.categories || []);
        
        // Fetch popular tags
        const tagsResponse = await fetch('/api/catalog/tags/popular');
        const tagsData = await tagsResponse.json();
        setPopularTags(tagsData.tags || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <h1 className="h-8 bg-gray-200 rounded w-64 mb-8"></h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          All Categories
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Browse all product categories and discover what you need for your next project.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Popular Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
    >
      <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-t-lg">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {category.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {category.name}
        </h3>
        
        {category.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-3">
          {category.product_count !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {category.product_count} products
            </span>
          )}
          
          {category.children.length > 0 && (
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {category.children.length} subcategories
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
