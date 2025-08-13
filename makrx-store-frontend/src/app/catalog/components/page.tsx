"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Grid, List, Filter } from "lucide-react";
import { api, type Product } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import EnhancedCategoryFilters, { useFiltersToggle } from "@/components/EnhancedCategoryFilters";
import SortSelect from "@/components/SortSelect";
import { getAllFiltersForCategory } from "@/data/categoryFilters";

export default function ComponentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const { isFiltersOpen, toggleFilters, closeFilters } = useFiltersToggle();

  const categoryFilters = getAllFiltersForCategory('components');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await api.getProducts({
          category: "components",
          per_page: 20,
          sort: sortBy,
        });
        setProducts(productsData.products || []);
      } catch (err) {
        console.error("Failed to load components:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [sortBy]);

  const handleFilterChange = (filters: Record<string, string[]>) => {
    setActiveFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/catalog" className="hover:text-blue-600 dark:hover:text-blue-400">
            Catalog
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">Components</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Mechanical Components
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Mechanical parts, fasteners, and building components for construction, assembly, and manufacturing.
            From basic screws and bolts to specialized bearings and motors.
          </p>
        </div>

        {/* Category Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Fasteners & Hardware
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bolts, screws, nuts, washers, and specialty fasteners in various materials and sizes.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Motion Components
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bearings, linear guides, pulleys, belts, gears, and other motion transmission parts.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Structural Parts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Aluminum extrusions, brackets, plates, shafts, and structural building components.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleFilters}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <p className="text-gray-600 dark:text-gray-400">
              {loading ? "Loading..." : `${products.length} products found`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <SortSelect value={sortBy} onChange={setSortBy} />
            
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${isFiltersOpen ? "block" : "hidden"} lg:block w-full lg:w-80 flex-shrink-0`}>
            <EnhancedCategoryFilters
              category="components"
              onFiltersChange={handleFilterChange}
              isOpen={isFiltersOpen}
              onClose={closeFilters}
            />
          </div>

          {/* Products */}
          <div className="flex-1">
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <ProductGrid 
                products={products} 
                loading={loading} 
                viewMode={viewMode}
              />
            )}
          </div>
        </div>

        {/* Category Info */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Build Your Mechanical Systems
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Essential Components
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• <strong>Fasteners:</strong> Metric and imperial bolts, screws, nuts, washers</li>
                <li>• <strong>Bearings:</strong> Ball bearings, roller bearings, linear bearings</li>
                <li>• <strong>Motion:</strong> Lead screws, pulleys, belts, gears, couplings</li>
                <li>• <strong>Structure:</strong> Aluminum extrusions, brackets, plates, shafts</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Quality Standards
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• <strong>Precision:</strong> CNC machined components with tight tolerances</li>
                <li>• <strong>Materials:</strong> High-grade steel, aluminum, and engineered plastics</li>
                <li>• <strong>Standards:</strong> DIN, ISO, and ANSI compliant fasteners</li>
                <li>• <strong>Compatibility:</strong> Designed for maker and industrial applications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
