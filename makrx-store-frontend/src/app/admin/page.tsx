"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { withAuth } from "@/contexts/AuthContext";
import { api, type Product, type Category, type AdminStats, formatPrice } from "@/lib/api";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  Settings,
  AlertTriangle,
} from "lucide-react";

function AdminPortal() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAdminData();
  }, [currentPage, searchQuery, selectedCategory]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Load admin stats
      const adminStats = await api.getAdminStats();
      setStats(adminStats);

      // Load categories
      const categoriesData = await api.getCategories();
      setCategories(categoriesData);

      // Load products with filters
      const filters: any = {
        page: currentPage,
        per_page: 20,
      };

      if (searchQuery) {
        filters.search = searchQuery;
      }

      if (selectedCategory !== "all") {
        filters.category = selectedCategory;
      }

      const productsData = await api.getProducts(filters);
      setProducts(productsData.products);
      setTotalPages(Math.ceil(productsData.total / 20));
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product");
    }
  };

  if (loading && !products.length) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Admin Dashboard
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadAdminData}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
  ];

  const getProductStatus = (product: Product) => {
    if (!product.in_stock)
      return {
        status: "out-of-stock",
        text: "Out of Stock",
        color: "text-red-800 bg-red-100",
      };
    if (product.track_inventory && product.stock_qty <= 5)
      return {
        status: "low-stock",
        text: "Low Stock",
        color: "text-yellow-800 bg-yellow-100",
      };
    return {
      status: "active",
      text: "Active",
      color: "text-green-800 bg-green-100",
    };
  };

  const statsData = stats
    ? [
        {
          title: "Total Products",
          value: stats.total_products.toString(),
          icon: Package,
          color: "bg-blue-500",
        },
        {
          title: "Total Revenue",
          value: formatPrice(stats.total_revenue, "USD"),
          icon: DollarSign,
          color: "bg-green-500",
        },
        {
          title: "Active Orders",
          value: stats.active_orders.toString(),
          icon: ShoppingCart,
          color: "bg-orange-500",
        },
        {
          title: "Total Customers",
          value: stats.total_customers.toString(),
          icon: Users,
          color: "bg-purple-500",
        },
      ]
    : [];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Portal
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your MakrX.Store catalog and orders
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/admin/manage">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Store
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Orders
                  </Button>
                </Link>
                <Link href="/admin/services">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Services
                  </Button>
                </Link>
                <Link href="/admin/products/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Product Catalog
                </h2>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const status = getProductStatus(product);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                SKU: {product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {product.category?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {formatPrice(
                                product.effective_price,
                                product.currency,
                              )}
                            </span>
                            {product.sale_price &&
                              product.sale_price < product.price && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatPrice(product.price, product.currency)}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {product.track_inventory
                              ? `${product.stock_qty} units`
                              : "Not tracked"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/product/${product.slug}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-green-600"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-red-600"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by adding your first product."}
                </p>
                <Link href="/admin/products/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Product
                  </Button>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AdminPortal, ["admin"]);
