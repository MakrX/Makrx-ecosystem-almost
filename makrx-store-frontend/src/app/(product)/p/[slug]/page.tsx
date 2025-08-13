"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "@/components/ProductGallery";
import ProductSpecs from "@/components/ProductSpecs";
import ProductReviews from "@/components/ProductReviews";
import RecommendedProducts from "@/components/RecommendedProducts";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";
import AddToCartForm from "@/components/AddToCartForm";
import CompatibilityInfo from "@/components/CompatibilityInfo";
import ProductVariantSelector, { useProductVariants } from "@/components/ProductVariantSelector";
import { ProductStructuredData, OrganizationStructuredData } from "@/components/StructuredData";
import { ProductSEO } from "@/components/SEOMetaTags";
import { api } from "@/lib/api";
import { getRelatedProducts, getFrequentlyBoughtTogether } from "@/lib/recommendations";
import ProductStructuredDataClient from "@/components/ProductStructuredData";
import ProductPageErrorBoundary from "@/components/ProductPageErrorBoundary";

interface Product {
  id: number;
  slug: string;
  name: string;
  brand?: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  currency: string;
  stock_qty: number;
  in_stock: boolean;
  is_featured: boolean;
  images: string[];
  attributes: Record<string, any>;
  specifications: Record<string, any>;
  compatibility: string[];
  tags: string[];
  category: {
    id: number;
    name: string;
    slug: string;
    path: string;
  };
  rating?: {
    average: number;
    count: number;
    verified_count?: number;
  };
  variants?: Array<{
    id: number;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    sale_price?: number;
    stock_qty: number;
  }>;
  created_at: string;
  updated_at: string;
}

interface RelatedProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  sale_price?: number;
  images: string[];
  rating?: {
    average: number;
    count: number;
  };
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [complementaryProducts, setComplementaryProducts] = useState<
    RelatedProduct[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{ name: string; href: string }>
  >([]);

  // Reviews pagination state
  const [displayedReviewsCount, setDisplayedReviewsCount] = useState(6);
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState(false);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Generate mock reviews based on product with pagination support
  const generateAllMockReviews = (product: Product) => {
    const reviewTemplates = [
      {
        rating: 5,
        title: "Excellent product, exactly as described",
        content: "This product exceeded my expectations. Great build quality and works perfectly out of the box. Highly recommended for both beginners and experienced users.",
        author: "Alex Chen",
        date: "2024-01-15",
        verified: true,
        helpful: 12
      },
      {
        rating: 4,
        title: "Great value for money",
        content: "Really solid product for the price point. Setup was straightforward and documentation is comprehensive. Only minor issue is the shipping took a bit longer than expected.",
        author: "Sarah Johnson",
        date: "2024-01-10",
        verified: true,
        helpful: 8
      },
      {
        rating: 5,
        title: "Perfect for my project needs",
        content: "Been using this for my IoT project and it's been rock solid. The built-in features work great and the community support is fantastic. Would definitely buy again.",
        author: "Mike Rodriguez",
        date: "2024-01-05",
        verified: true,
        helpful: 15
      },
      {
        rating: 4,
        title: "Good product with room for improvement",
        content: "Overall a solid choice. The performance is good and it does what it promises. Could use better documentation for advanced features, but the basics are well covered.",
        author: "Emma Davis",
        date: "2023-12-28",
        verified: true,
        helpful: 6
      },
      {
        rating: 5,
        title: "Fantastic upgrade from the previous version",
        content: "The improvements in this version are noticeable. Better connectivity, more reliable, and the new features are actually useful. Worth the investment.",
        author: "David Kim",
        date: "2023-12-20",
        verified: true,
        helpful: 20
      },
      {
        rating: 3,
        title: "Decent but had some issues",
        content: "Product works as advertised but I had some compatibility issues with my setup. Customer support was helpful in resolving them. Average experience overall.",
        author: "Lisa Wang",
        date: "2023-12-15",
        verified: true,
        helpful: 3
      },
      {
        rating: 5,
        title: "Outstanding performance for the price",
        content: "I've been using this for 3 months now and it's been absolutely reliable. The documentation is clear and the community is very helpful. Delivery was fast too.",
        author: "James Thompson",
        date: "2023-12-10",
        verified: true,
        helpful: 18
      },
      {
        rating: 4,
        title: "Solid choice for beginners",
        content: "As someone new to this, I found it very beginner-friendly. The setup process was smooth and there are lots of tutorials available online. Definitely recommend for starting out.",
        author: "Maria Garcia",
        date: "2023-12-05",
        verified: true,
        helpful: 11
      },
      {
        rating: 5,
        title: "Best purchase I've made this year",
        content: "This product has completely transformed my workflow. The build quality is exceptional and it handles everything I throw at it. Customer service is also top-notch.",
        author: "Robert Wilson",
        date: "2023-11-28",
        verified: true,
        helpful: 25
      },
      {
        rating: 4,
        title: "Good but could be better",
        content: "It does what it's supposed to do and the price is reasonable. The only complaint is that some features could be more intuitive. Overall, happy with the purchase.",
        author: "Jennifer Lee",
        date: "2023-11-20",
        verified: true,
        helpful: 7
      },
      {
        rating: 5,
        title: "Exceeded expectations in every way",
        content: "I was skeptical at first but this product has blown me away. The performance is incredible and it's so easy to use. I've already recommended it to several friends.",
        author: "Michael Brown",
        date: "2023-11-15",
        verified: true,
        helpful: 22
      },
      {
        rating: 4,
        title: "Reliable and well-built",
        content: "Been using this daily for work and it's never let me down. The construction feels premium and it's clear a lot of thought went into the design. Worth every penny.",
        author: "Amanda Taylor",
        date: "2023-11-08",
        verified: true,
        helpful: 14
      }
    ];

    // Return all available reviews up to the actual rating count
    const maxReviews = Math.min(product.rating?.count || 0, reviewTemplates.length);
    return reviewTemplates.slice(0, maxReviews);
  };

  const loadMoreReviews = async () => {
    if (isLoadingMoreReviews || !isMountedRef.current) return;

    if (isMountedRef.current) {
      setIsLoadingMoreReviews(true);
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, 1500);
        // Store timeout ID for potential cleanup
        return timeoutId;
      });

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        const newCount = Math.min(
          displayedReviewsCount + 6,
          product?.rating?.count || 0
        );

        setDisplayedReviewsCount(newCount);
      }
    } catch (error) {
      // Silently handle any errors (including abort errors)
      console.warn('Error loading more reviews:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMoreReviews(false);
      }
    }
  };

  const displayedReviews = product ? generateAllMockReviews(product).slice(0, displayedReviewsCount) : [];

  // Enhanced variant handling
  const {
    selectedVariant,
    selectedAttributes,
    handleVariantChange,
    canAddToCart,
    isInStock,
    currentPrice,
  } = useProductVariants(product?.variants || []);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!isMountedRef.current) return;

      setLoading(true);
      try {
        // Fetch product details using API client
        const productData = await api.getProductBySlug(slug);

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setProduct(productData);

          // Build breadcrumbs
          const crumbs = [{ name: "Home", href: "/" }];
          if (productData.category?.slug) {
            // Use category slug to build breadcrumb
            const categoryName = productData.category.name;
            crumbs.push({ name: categoryName, href: `/catalog/${productData.category.slug}` });
          }
          crumbs.push({ name: productData.name, href: `/p/${productData.slug}` });
          setBreadcrumbs(crumbs);

          // Use recommendation system to get related and complementary products
          const allProducts = await api.getProducts();
          const recommendations = getRelatedProducts(product, allProducts, 6);
          const complementary = getFrequentlyBoughtTogether(product, allProducts, 4);
          setRelatedProducts(recommendations);
          setComplementaryProducts(complementary);
        }
      } catch (error) {
        // Only log if not an abort error and component is still mounted
        if (isMountedRef.current && !error.toString().includes('abort')) {
          console.error("Failed to fetch product data:", error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProductData();
  }, [slug]);

  // Cleanup effect to prevent state updates on unmounted component
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const effectivePrice = currentPrice || product.sale_price || product.price;
  const originalPrice = selectedVariant?.price || product.price;

  const isOnSale = product.sale_price && product.sale_price < product.price;
  const stockStatus = product.stock_qty > 0 ? "In Stock" : "Out of Stock";
  const estimatedDelivery =
    product.stock_qty > 0 ? "2-3 business days" : "Backordered - 1-2 weeks";

  return (
    <ProductPageErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Product Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Gallery */}
          <div className="space-y-4">
            <ProductGallery
              images={product.images || ["/placeholder.svg"]}
              productName={product.name}
              selectedImage={selectedImage}
              onImageChange={setSelectedImage}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  by{" "}
                  <Link
                    href={`/brands/${product.brand.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {product.brand}
                  </Link>
                </p>
              )}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating!.average) ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating.average.toFixed(1)} ({product.rating.count}{" "}
                    reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {product.short_description}
              </p>
            )}


            {/* Stock Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${product.stock_qty > 0 ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span
                  className={`text-sm font-medium ${product.stock_qty > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {stockStatus}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Delivery: {estimatedDelivery}
              </span>
            </div>

            {/* Enhanced Variant Selection */}
            {product.variants && product.variants.length > 0 ? (
              <ProductVariantSelector
                variants={product.variants}
                onVariantChange={handleVariantChange}
                basePrice={product.price}
                currency={product.currency}
              />
            ) : (
              /* Price Display for Non-Variant Products */
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {product.currency === "INR" ? "₹" : "$"}
                  {effectivePrice.toLocaleString()}
                </span>
                {isOnSale && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {product.currency === "INR" ? "₹" : "$"}
                      {originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-sm font-medium">
                      {Math.round(
                        ((originalPrice - effectivePrice) / originalPrice) * 100
                      )}% OFF
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartForm
              productId={product.id}
              variantId={selectedVariant?.id || null}
              maxQuantity={selectedVariant?.stock_qty || product.stock_qty}
              inStock={product.variants?.length > 0 ? canAddToCart : product.stock_qty > 0}
            />

            {/* Key Features */}
            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(product.attributes)
                      .slice(0, 6)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Compatibility */}
            {product.compatibility && product.compatibility.length > 0 && (
              <CompatibilityInfo
                compatibility={product.compatibility}
                productId={product.id}
              />
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("description")}
                className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === "description"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === "specifications"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Reviews ({product.rating?.count || 0})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === "description" && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-900 dark:text-white text-right max-w-[60%]">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    No specifications available for this product.
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {product.rating && product.rating.count > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(product.rating!.average) ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {product.rating.average.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Based on {product.rating.count} reviews
                      </span>
                    </div>
                    {/* Individual Reviews */}
                    <div className="space-y-6">
                      {displayedReviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {review.author.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {review.author}
                                  {review.verified && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Verified Purchase
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(review.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                              {review.title}
                            </h5>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {review.content}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9.5 7M7 20s-2-1-2-3V8a2 2 0 012-2h.326c.253 0 .503.058.735.17L11 7M7 20l-3-3v-7" />
                              </svg>
                              Helpful ({review.helpful})
                            </button>
                            <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                              Reply
                            </button>
                            <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                              Report
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Load More Reviews Button */}
                      {product.rating && displayedReviewsCount < product.rating.count && (
                        <div className="text-center pt-6">
                          <button
                            onClick={loadMoreReviews}
                            disabled={isLoadingMoreReviews}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                          >
                            {isLoadingMoreReviews ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading More Reviews...
                              </>
                            ) : (
                              <>
                                Load More Reviews ({product.rating.count - displayedReviewsCount} remaining)
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* All Reviews Loaded Message */}
                      {product.rating && displayedReviewsCount >= product.rating.count && product.rating.count > 6 && (
                        <div className="text-center pt-6 text-gray-500 dark:text-gray-400">
                          <p className="text-sm">All {product.rating.count} reviews loaded</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No reviews yet for this product.</p>
                    <p className="text-sm mt-2">Be the first to leave a review!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar Products
            </h2>
            <RecommendedProducts products={relatedProducts} />
          </div>
        )}

        {/* Frequently Bought Together */}
        {complementaryProducts.length > 0 && (
          <div className="mb-12">
            <FrequentlyBoughtTogether
              baseProduct={product}
              recommendations={complementaryProducts}
            />
          </div>
        )}
      </div>

        {/* Structured Data for SEO */}
        <ProductStructuredDataClient product={product} effectivePrice={effectivePrice} />
      </div>
    </ProductPageErrorBoundary>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Product Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/c"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
