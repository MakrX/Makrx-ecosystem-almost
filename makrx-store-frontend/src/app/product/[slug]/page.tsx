"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  X,
  Info,
} from "lucide-react";
import { api, type Product, formatPrice } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProductReviews from "@/components/ProductReviews";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setSelectedImageIndex(0); // Reset image index when loading new product
        const productData = await api.getProductBySlug(slug);
        setProduct(productData);

        // Ensure selectedImageIndex is valid for the loaded product
        if (productData.images && productData.images.length > 0) {
          setSelectedImageIndex(0);
        }

        // Load related products from the same category
        if (productData.category_id) {
          const relatedData = await api.getProductsByCategory(
            productData.category_id,
            {
              per_page: 4,
            },
          );
          const filtered = relatedData.products.filter(
            (p) => p.id !== productData.id,
          );
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  // Ensure selectedImageIndex is valid when product changes
  useEffect(() => {
    if (product?.images && selectedImageIndex >= product.images.length) {
      setSelectedImageIndex(0);
    }
  }, [product, selectedImageIndex]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await api.addToCart(product.id, quantity);
      alert("Product added to cart!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      if (!isAuthenticated) {
        alert("Please sign in to add items to your cart");
      } else {
        alert("Failed to add product to cart");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_qty || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleImageChange = (index: number) => {
    if (product?.images && index >= 0 && index < product.images.length) {
      setSelectedImageIndex(index);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/catalog"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  const savingsAmount = product.sale_price
    ? product.price - product.sale_price
    : 0;
  const savingsPercentage = product.sale_price
    ? Math.round((savingsAmount / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/catalog" className="hover:text-blue-600">
            Catalog
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/catalog/${product.category.slug}`}
                className="hover:text-blue-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex] || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span>No image available</span>
                </div>
              )}

              {product.sale_price && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm font-bold rounded">
                  {savingsPercentage}% OFF
                </div>
              )}

              {/* Image Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      handleImageChange(Math.max(0, selectedImageIndex - 1))
                    }
                    disabled={selectedImageIndex === 0}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleImageChange(
                        Math.min(
                          product.images.length - 1,
                          selectedImageIndex + 1,
                        ),
                      )
                    }
                    disabled={selectedImageIndex === product.images.length - 1}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === selectedImageIndex
                        ? "border-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image || '/placeholder.svg'}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {product.brand && (
                <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  (4.8) • 124 reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.effective_price, product.currency)}
                </span>
                {product.sale_price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    <span className="text-lg text-green-600 font-semibold">
                      Save {formatPrice(savingsAmount, product.currency)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2 mb-6">
                {product.in_stock ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">In Stock</span>
                    {product.track_inventory && (
                      <span className="text-sm text-gray-600">
                        ({product.stock_qty} available)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <div>
                <p className="text-gray-700 leading-relaxed">
                  {product.short_description}
                </p>
              </div>
            )}

            {/* Quick Specifications */}
            {product.attributes && Object.keys(product.attributes || {}).length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(product.attributes || {})
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-gray-100"
                      >
                        <span className="text-sm text-gray-600 capitalize">
                          {key}:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
                {Object.keys(product.attributes || {}).length > 4 && (
                  <button
                    onClick={() => setShowSpecifications(!showSpecifications)}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    {showSpecifications
                      ? "Show Less"
                      : "Show All Specifications"}
                  </button>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              {product.in_stock && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product.stock_qty || 1)}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || addingToCart}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {product.in_stock ? "Add to Cart" : "Out of Stock"}
                    </>
                  )}
                </button>

                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Heart className="h-5 w-5" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Shipping & Returns */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Free shipping
                    </p>
                    <p className="text-xs text-gray-600">On orders over ₹6,225</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      30-day returns
                    </p>
                    <p className="text-xs text-gray-600">
                      Easy returns and exchanges
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Quality guarantee
                    </p>
                    <p className="text-xs text-gray-600">
                      100% authentic products
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description || "No description available."}
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                {Object.keys(product.specifications || {}).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Technical Specifications
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(product.specifications || {}).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between py-2 border-b border-gray-100"
                            >
                              <span className="text-gray-600 capitalize">
                                {key}:
                              </span>
                              <span className="font-medium text-gray-900">
                                {value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {Object.keys(product.attributes || {}).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Product Attributes
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(product.attributes || {}).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between py-2 border-b border-gray-100"
                              >
                                <span className="text-gray-600 capitalize">
                                  {key}:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {value}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && product && (
              <ProductReviews
                productId={product.id.toString()}
                userId={user?.id}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {relatedProduct.images[0] && (
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">
                        {formatPrice(
                          relatedProduct.effective_price,
                          relatedProduct.currency,
                        )}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
