"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  ShoppingCart,
  ChevronDown,
  X,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { api, type Product, type Category, formatPrice } from "@/lib/api";
import CategoryCarousel from "@/components/CategoryCarousel";

const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest First" },
  { value: "created_asc", label: "Oldest First" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "price_asc", label: "Price Low to High" },
  { value: "price_desc", label: "Price High to Low" },
];

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Show filters by default on desktop, hide on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      setShowFilters(isDesktop);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category_id: searchParams.get("category_id")
      ? parseInt(searchParams.get("category_id")!)
      : undefined,
    brand: searchParams.get("brand") || undefined,
    price_min: searchParams.get("price_min")
      ? parseFloat(searchParams.get("price_min")!)
      : undefined,
    price_max: searchParams.get("price_max")
      ? parseFloat(searchParams.get("price_max")!)
      : undefined,
    in_stock: searchParams.get("in_stock") === "true" ? true : undefined,
    is_featured: searchParams.get("is_featured") === "true" ? true : undefined,
    sort: searchParams.get("sort") || "created_desc",
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          api.getCategories(),
          api.getBrands(),
        ]);

        setCategories(categoriesData);
        setBrands(brandsData.brands);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Load products when filters change
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page,
      };

      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key as keyof typeof params] === undefined) {
          delete params[key as keyof typeof params];
        }
      });

      const response = await api.getProducts(params);

      setProducts(response.products);
      setPagination({
        page: response.page,
        per_page: response.per_page,
        total: response.total,
        pages: response.pages,
      });
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.per_page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, value.toString());
      }
    });

    if (pagination.page > 1) {
      params.set("page", pagination.page.toString());
    }

    const newUrl = `/catalog${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [filters, pagination.page]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      category_id: undefined,
      brand: undefined,
      price_min: undefined,
      price_max: undefined,
      in_stock: undefined,
      is_featured: undefined,
      sort: "created_desc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await api.addToCart(product.id, 1);
      // Show success message or update cart count
      alert("Product added to cart!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    // If categoryId is 0, it means "All Categories" - clear the filter
    handleFilterChange("category_id", categoryId === 0 ? undefined : categoryId);
  };

  const getCategoryName = (categoryId?: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "All Categories";
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== "" && value !== "created_desc",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Catalog
          </h1>
          <p className="text-gray-600">
            Discover our complete range of maker products and tools
          </p>
        </div>

        {/* Category Carousel */}
        <CategoryCarousel
          categories={categories}
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={filters.category_id}
        />

        {/* Search and Sort */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange("q", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-300">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Toggle - Mobile Only */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category_id || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "category_id",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={filters.brand || ""}
                    onChange={(e) =>
                      handleFilterChange("brand", e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.price_min || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "price_min",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.price_max || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "price_max",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.in_stock === true}
                      onChange={(e) =>
                        handleFilterChange(
                          "in_stock",
                          e.target.checked ? true : undefined,
                        )
                      }
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>

                {/* Featured Filter */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.is_featured === true}
                      onChange={(e) =>
                        handleFilterChange(
                          "is_featured",
                          e.target.checked ? true : undefined,
                        )
                      }
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Showing {products.length} of {pagination.total} products
                {filters.category_id &&
                  ` in ${getCategoryName(filters.category_id)}`}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                      viewMode === "list"
                        ? "flex items-center p-4"
                        : "overflow-hidden"
                    }`}
                  >
                    <Link
                      href={`/p/${product.slug}`}
                      className={
                        viewMode === "list" ? "flex-shrink-0" : "block"
                      }
                    >
                      <div
                        className={`bg-gray-100 relative ${
                          viewMode === "list"
                            ? "w-24 h-24 rounded-lg"
                            : "aspect-square"
                        }`}
                      >
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        )}
                        {product.sale_price && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                            SALE
                          </div>
                        )}
                      </div>
                    </Link>

                    <div
                      className={viewMode === "list" ? "ml-4 flex-1" : "p-4"}
                    >
                      <Link href={`/p/${product.slug}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>

                      {product.brand && (
                        <p className="text-sm text-gray-500 mb-2">
                          {product.brand}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.short_description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            {formatPrice(
                              product.effective_price,
                              product.currency,
                            )}
                          </span>
                          {product.sale_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price, product.currency)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              4.8
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.in_stock}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {!product.in_stock && (
                        <div className="mt-2">
                          <span className="text-xs text-red-600 font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    const page = Math.max(1, pagination.page - 2) + i;
                    if (page > pagination.pages) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm rounded-lg ${
                          page === pagination.page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
            <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-white shadow-xl">
              <div className="h-full overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    <div className="flex items-center gap-2">
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={filters.category_id || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "category_id",
                            e.target.value ? parseInt(e.target.value) : undefined,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <select
                        value={filters.brand || ""}
                        onChange={(e) =>
                          handleFilterChange("brand", e.target.value || undefined)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Brands</option>
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.price_min || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "price_min",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.price_max || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "price_max",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Stock Filter */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.in_stock === true}
                          onChange={(e) =>
                            handleFilterChange(
                              "in_stock",
                              e.target.checked ? true : undefined,
                            )
                          }
                          className="rounded border-gray-300 mr-2"
                        />
                        <span className="text-sm text-gray-700">In Stock Only</span>
                      </label>
                    </div>

                    {/* Featured Filter */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.is_featured === true}
                          onChange={(e) =>
                            handleFilterChange(
                              "is_featured",
                              e.target.checked ? true : undefined,
                            )
                          }
                          className="rounded border-gray-300 mr-2"
                        />
                        <span className="text-sm text-gray-700">Featured Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
