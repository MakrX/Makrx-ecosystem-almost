"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Grid, List, Filter } from "lucide-react";
import { api, type Product } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import EnhancedCategoryFilters, { useFiltersToggle } from "@/components/EnhancedCategoryFilters";
import SortSelect from "@/components/SortSelect";
import { getAllFiltersForCategory } from "@/data/categoryFilters";

export default function ElectronicsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const { isFiltersOpen, toggleFilters, closeFilters } = useFiltersToggle();

  // Get category-specific filters
  const categoryFilters = getAllFiltersForCategory('electronics');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await api.getProducts({
          category: "electronics",
          per_page: 20,
          sort: sortBy,
        });
        setProducts(productsData.products || []);
      } catch (err) {
        console.error("Failed to load electronics:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [sortBy]);

  const handleFilterChange = (filters: Record<string, string[]>) => {
    setActiveFilters(filters);
    // Apply filters to products - in a real app this would be an API call
    // For now we'll just update the state
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
          <span className="text-gray-900 dark:text-gray-100 font-medium">Electronics</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Electronics & Components
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Complete range of electronic components, development boards, sensors, and modules for 
            prototyping, IoT projects, robotics, and electronic design.
          </p>
        </div>

        {/* Category Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Development Boards
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Arduino, Raspberry Pi, ESP32, and other microcontroller boards for rapid prototyping.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Sensors & Modules
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Temperature, humidity, motion, distance sensors and communication modules for IoT projects.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Components
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Resistors, capacitors, LEDs, transistors, ICs, and other electronic components.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <EnhancedCategoryFilters
              facets={categoryFilters.map(filter => ({
                name: filter.id,
                values: filter.options?.map(opt => ({
                  id: opt.value,
                  name: opt.label,
                  count: opt.count
                })) || []
              }))}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onToggle={toggleFilters}
              isOpen={isFiltersOpen}
              className="lg:hidden"
            />
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
          <div className="hidden lg:block w-80 flex-shrink-0">
            <EnhancedCategoryFilters
              facets={categoryFilters.map(filter => ({
                name: filter.id,
                values: filter.options?.map(opt => ({
                  id: opt.value,
                  name: opt.label,
                  count: opt.count
                })) || []
              }))}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onToggle={toggleFilters}
              isOpen={isFiltersOpen}
              className="w-full"
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
            Build Your Next Electronic Project
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Popular Categories
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>��� <strong>Arduino Ecosystem:</strong> Boards, shields, sensors, and accessories</li>
                <li>• <strong>Raspberry Pi:</strong> Single-board computers and HATs</li>
                <li>• <strong>IoT & Wireless:</strong> ESP32, WiFi, Bluetooth, LoRa modules</li>
                <li>• <strong>Displays:</strong> LCD, OLED, TFT displays and touchscreens</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Expert Support
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• <strong>Circuit Design:</strong> Custom PCB design and consultation</li>
                <li>• <strong>Prototyping:</strong> Breadboarding and testing services</li>
                <li>• <strong>Programming:</strong> Firmware development and debugging</li>
                <li>• <strong>Integration:</strong> System integration and testing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
