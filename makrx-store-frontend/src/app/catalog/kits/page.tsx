"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Grid, List, Filter } from "lucide-react";
import { api, type Product } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import EnhancedCategoryFilters, { useFiltersToggle } from "@/components/EnhancedCategoryFilters";
import SortSelect from "@/components/SortSelect";
import { getAllFiltersForCategory } from "@/data/categoryFilters";

export default function KitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const { isFiltersOpen, toggleFilters, closeFilters } = useFiltersToggle();

  const categoryFilters = getAllFiltersForCategory('kits');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await api.getProducts({
          category: "kits",
          per_page: 20,
          sort: sortBy,
        });
        setProducts(productsData.products || []);
      } catch (err) {
        console.error("Failed to load kits:", err);
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
          <span className="text-gray-900 dark:text-gray-100 font-medium">Kits & Bundles</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Kits & Bundles
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Complete project kits, starter bundles, and curated sets for learning, prototyping, 
            and building. Everything you need in one convenient package.
          </p>
        </div>

        {/* Category Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Learning Kits
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Educational kits with tutorials, components, and guides for learning electronics, programming, and making.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Project Kits
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Complete kits for specific projects like robots, IoT devices, instruments, and gadgets.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Starter Bundles
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Curated bundles of components, tools, and materials to get started with new technologies.
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
              category="kits"
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
            Start Your Next Project Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Popular Kit Categories
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• <strong>Arduino Kits:</strong> From basic LED circuits to advanced robotics</li>
                <li>• <strong>Raspberry Pi Kits:</strong> IoT, home automation, and computing projects</li>
                <li>• <strong>Robotics Kits:</strong> Wheeled, walking, and flying robot platforms</li>
                <li>• <strong>IoT Kits:</strong> Sensor networks, smart home, and connected devices</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                What&apos;s Included
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• <strong>Components:</strong> All electronic parts and hardware</li>
                <li>• <strong>Instructions:</strong> Step-by-step guides and tutorials</li>
                <li>• <strong>Code:</strong> Sample programs and libraries</li>
                <li>• <strong>Support:</strong> Online resources and community access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
