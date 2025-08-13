"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Users, Package, Truck, Clock, QrCode } from "lucide-react";
import { api, type Product, type Category, formatPrice } from "@/lib/api";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.getFeaturedProducts(8),
          api.getCategories(),
        ]);

        setFeaturedProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        // Silently handle errors in development when using mock data
        if (process.env.NODE_ENV === "development") {
          console.warn("Using fallback data due to backend unavailability");
        } else {
          console.error("Failed to load homepage data:", error);
        }

        // Set empty arrays as fallback
        setFeaturedProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCategoryClick = (category: Category) => {
    window.location.href = `/catalog/${category.slug}`;
  };

  const handleProductClick = (product: Product) => {
    window.location.href = `/p/${product.slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Development Mode Notice */}
      {process.env.NODE_ENV === "development" && typeof window !== "undefined" && sessionStorage.getItem("mock-data-notice-shown") && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <p className="text-center text-yellow-800 dark:text-yellow-200 text-sm">
            🔧 Development Mode: Using demo data - Backend service not connected
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-blue-200">MakrX</span> Marketplace
              <span className="block text-white">Tools, Materials & Fabrication</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              The e-commerce hub of the MakrX ecosystem: seamlessly integrated with MakrCave for instant BOM ordering, material procurement, and professional fabrication services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalog"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Shop Products
              </Link>
              <Link
                href="/3d-printing"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Upload & Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              <span className="text-blue-600">Maker-First</span> Categories
            </h2>
            <p className="text-lg text-muted-foreground">
              Tools, materials, and equipment optimized for the global maker community — with direct integration to MakrCave BOMs and project workflows
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category, index) => (
              <div
                key={`category-${category.id}-${index}`}
                onClick={() => handleCategoryClick(category)}
                className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 text-center"
              >
                {category.image_url && (
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-card-foreground mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/catalog"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View All Categories <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-muted-foreground">
                Our most popular and highly-rated products
              </p>
            </div>
            <Link
              href="/catalog?is_featured=true"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View All Featured
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuredProducts || []).map((product, index) => (
              <div
                key={`product-${product.id}-${index}`}
                onClick={() => handleProductClick(product)}
                className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <div className="aspect-square bg-muted relative">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  {product.sale_price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                      SALE
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.short_description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-card-foreground">
                        {formatPrice(product.effective_price, product.currency)}
                      </span>
                      {product.sale_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-muted-foreground ml-1">
                        4.8
                      </span>
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
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              <span className="text-blue-600">Connected</span> Fabrication Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional manufacturing integrated with the MakrX ecosystem — orders flow directly to network makerspaces and service providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Instant Fabrication Quotes
              </h3>
              <p className="text-muted-foreground mb-6">
                Upload your files and get instant quotes from MakrX network fabricators. Orders integrate directly with MakrCave project management.
              </p>
              <Link
                href="/upload"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Get Quote
              </Link>
            </div>

            <div className="bg-card border border-border p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Network-Powered Speed
              </h3>
              <p className="text-muted-foreground mb-6">
                Leveraging our global MakrX makerspace network for rapid production. Jobs automatically routed to the best available facility.
              </p>
              <Link
                href="/3d-printing"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Learn More
              </Link>
            </div>

            <div className="bg-card border border-border p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Ecosystem Quality Standards
              </h3>
              <p className="text-muted-foreground mb-6">
                All MakrX network providers meet rigorous quality standards. Skill-verified operators and tracked material usage ensure consistent results.
              </p>
              <Link
                href="/sample-projects"
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                View Samples
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-blue-200 dark:text-blue-300">
                Makers Connected
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50k+</div>
              <div className="text-blue-200 dark:text-blue-300">
                Projects Fabricated
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-200 dark:text-blue-300">
                Network Makerspaces
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-blue-200 dark:text-blue-300">
                Ecosystem Integration
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Join the <span className="text-blue-600">MakrX</span> Ecosystem?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            From materials and tools to professional fabrication — everything you need is connected through the unified MakrX platform. Start building with the global maker community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Shop Materials
            </Link>
            <Link
              href="/upload"
              className="bg-transparent border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-colors"
            >
              Upload File
            </Link>
          </div>
        </div>
      </section>

      {/* QR Code Demo Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full mb-6">
              <QrCode className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              QR Code Integration Demo
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience our revolutionary QR code system for warehouse management, billing automation, and makerspace inventory integration.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Warehouse Automation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Scan QR codes to automatically bill components in/out of warehouse
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Integration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Streamline shipping processes with automated data capture
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Makerspace Inventory</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Allow makerspace managers to add items by scanning QR codes
                </p>
              </div>
            </div>
            <Link
              href="/demo/qr-generator"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <QrCode className="h-5 w-5" />
              Try QR Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
