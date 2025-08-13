'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import SearchFilters from '@/components/SearchFilters';
import ProductGrid from '@/components/ProductGrid';
import SearchSuggestions from '@/components/SearchSuggestions';
import SortSelect from '@/components/SortSelect';

interface SearchResult {
  products: any[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
  search_time_ms: number;
  suggestions?: string[];
  facets?: any[];
  related_categories?: any[];
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get('q') || '';
  const brand = searchParams.get('brand') || '';
  const material = searchParams.get('material') || '';
  const minPrice = searchParams.get('min') || '';
  const maxPrice = searchParams.get('max') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    if (query || brand || material || minPrice || maxPrice) {
      performSearch();
    } else {
      setSearchResults(null);
    }
  }, [searchParams]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: any = {};
      
      if (brand) filters.brands = [brand];
      if (material) filters.material_types = [material];
      if (minPrice) filters.price_min = parseFloat(minPrice);
      if (maxPrice) filters.price_max = parseFloat(maxPrice);

      const requestBody = {
        query: query || undefined,
        filters,
        sort_by: sort,
        page,
        per_page: 20,
        include_suggestions: true,
        include_facets: true,
      };

      const response = await fetch('/api/catalog/search/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParam = (key: string, value: string) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    url.searchParams.set('page', '1'); // Reset to first page
    window.history.pushState({}, '', url.toString());
  };

  const clearAllFilters = () => {
    const url = new URL(window.location.href);
    const query = url.searchParams.get('q');
    url.search = '';
    if (query) {
      url.searchParams.set('q', query);
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products, brands, materials..."
                    defaultValue={query}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateSearchParam('q', (e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                  <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  updateSearchParam('q', input.value);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={brand}
                onChange={(e) => updateSearchParam('brand', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
              >
                <option value="">All Brands</option>
                <option value="esun">eSUN</option>
                <option value="hatchbox">HATCHBOX</option>
                <option value="polymaker">Polymaker</option>
                <option value="prusa">Prusa</option>
              </select>

              <select
                value={material}
                onChange={(e) => updateSearchParam('material', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
              >
                <option value="">All Materials</option>
                <option value="pla">PLA</option>
                <option value="abs">ABS</option>
                <option value="petg">PETG</option>
                <option value="tpu">TPU</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min price"
                  value={minPrice}
                  onChange={(e) => updateSearchParam('min', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(e) => updateSearchParam('max', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
                />
              </div>

              {(brand || material || minPrice || maxPrice) && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="container mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Searching...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && !searchResults && (query || brand || material || minPrice || maxPrice) && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No search performed yet.</p>
          </div>
        )}

        {!loading && !error && !searchResults && !query && !brand && !material && !minPrice && !maxPrice && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Search Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Find exactly what you need for your next project
            </p>
            
            {/* Popular Searches */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {['PLA Filament', 'Arduino Boards', 'Stepper Motors', 'LED Strips', 'Sensors', '3D Printer Parts'].map((term) => (
                  <button
                    key={term}
                    onClick={() => updateSearchParam('q', term)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {searchResults && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Search Results
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchResults.total_count.toLocaleString()} products found
                  {query && ` for "${query}"`}
                  <span className="text-sm text-gray-500 ml-2">
                    ({searchResults.search_time_ms}ms)
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <SortSelect
                  value={sort}
                  onChange={(value) => updateSearchParam('sort', value)}
                />
              </div>
            </div>

            {/* Search Suggestions */}
            {searchResults.suggestions && searchResults.suggestions.length > 0 && (
              <SearchSuggestions
                suggestions={searchResults.suggestions}
                onSuggestionClick={(suggestion) => updateSearchParam('q', suggestion)}
              />
            )}

            {/* Related Categories */}
            {searchResults.related_categories && searchResults.related_categories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Related Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {searchResults.related_categories.map((category: any) => (
                    <Link
                      key={category.id}
                      href={`/c/${category.path}`}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              {searchResults.facets && searchResults.facets.length > 0 && (
                <div className="lg:w-64 flex-shrink-0">
                  <SearchFilters
                    facets={searchResults.facets}
                    activeFilters={{
                      brand: brand ? [brand] : [],
                      material: material ? [material] : [],
                      min_price: minPrice,
                      max_price: maxPrice,
                    }}
                    onFilterChange={(filters) => {
                      if (filters.brand) updateSearchParam('brand', filters.brand[0] || '');
                      if (filters.material) updateSearchParam('material', filters.material[0] || '');
                      if (filters.min_price) updateSearchParam('min', filters.min_price);
                      if (filters.max_price) updateSearchParam('max', filters.max_price);
                    }}
                  />
                </div>
              )}

              {/* Products */}
              <div className="flex-1">
                <ProductGrid
                  products={searchResults.products}
                  page={searchResults.page}
                  totalPages={searchResults.total_pages}
                  onPageChange={(newPage) => updateSearchParam('page', newPage.toString())}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
