"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Share2, 
  Eye, 
  Filter,
  Grid3X3,
  List,
  ArrowLeft,
  Star,
  Package,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { api, formatPrice } from "@/lib/api";

interface WishlistItem {
  id: number;
  product_id: number;
  created_at: string;
  product: {
    id: number;
    slug: string;
    name: string;
    brand?: string;
    price: number;
    sale_price?: number;
    currency: string;
    images: string[];
    stock_qty: number;
    in_stock: boolean;
    rating?: {
      average: number;
      count: number;
    };
    category?: {
      name: string;
      slug: string;
    };
  };
}

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'price'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'in_stock' | 'on_sale'>('all');
  const [removing, setRemoving] = useState<{ [key: number]: boolean }>({});
  const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/account/wishlist');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, router]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      const mockWishlist: WishlistItem[] = [
        {
          id: 1,
          product_id: 1,
          created_at: new Date().toISOString(),
          product: {
            id: 1,
            slug: "premium-pla-filament-white",
            name: "Premium PLA Filament - White",
            brand: "MakrX",
            price: 2500,
            sale_price: 2250,
            currency: "INR",
            images: ["/placeholder.svg"],
            stock_qty: 15,
            in_stock: true,
            rating: { average: 4.5, count: 23 },
            category: { name: "Filaments", slug: "filaments" }
          }
        },
        {
          id: 2,
          product_id: 2,
          created_at: new Date().toISOString(),
          product: {
            id: 2,
            slug: "ender-3-v2-3d-printer",
            name: "Ender 3 V2 3D Printer",
            brand: "Creality",
            price: 25000,
            currency: "INR",
            images: ["/placeholder.svg"],
            stock_qty: 0,
            in_stock: false,
            rating: { average: 4.7, count: 156 },
            category: { name: "3D Printers", slug: "3d-printers" }
          }
        }
      ];
      
      setTimeout(() => {
        setWishlistItems(mockWishlist);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      addNotification('Failed to load wishlist', 'error');
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: number) => {
    setRemoving(prev => ({ ...prev, [itemId]: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      addNotification('Item removed from wishlist', 'success');
    } catch (error) {
      addNotification('Failed to remove item', 'error');
    } finally {
      setRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const addToCart = async (productId: number) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      addNotification('Item added to cart', 'success');
    } catch (error) {
      addNotification('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const shareWishlist = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My MakrX Wishlist',
          text: 'Check out my wishlist on MakrX Store',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification('Wishlist link copied to clipboard', 'success');
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      if (filterBy === 'in_stock') return item.product.in_stock;
      if (filterBy === 'on_sale') return item.product.sale_price;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'price':
          const priceA = a.product.sale_price || a.product.price;
          const priceB = b.product.sale_price || b.product.price;
          return priceA - priceB;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            
            {wishlistItems.length > 0 && (
              <button
                onClick={shareWishlist}
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Wishlist
              </button>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start adding products you love to keep track of them.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package className="h-5 w-5 mr-2" />
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                {/* View Mode */}
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Filter */}
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Items</option>
                  <option value="in_stock">In Stock</option>
                  <option value="on_sale">On Sale</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                </select>
              </div>
            </div>

            {/* Items Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredAndSortedItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square mb-4'}`}>
                    <Image
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                    
                    {/* Stock Badge */}
                    {!item.product.in_stock && (
                      <div className="absolute top-2 left-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-medium">
                        Out of Stock
                      </div>
                    )}
                    
                    {/* Sale Badge */}
                    {item.product.sale_price && (
                      <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                        Sale
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className={`${viewMode === 'list' ? 'ml-4 flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {item.product.brand && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {item.product.brand}
                          </p>
                        )}
                        <Link
                          href={`/p/${item.product.slug}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        disabled={removing[item.id]}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-2"
                      >
                        {removing[item.id] ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Rating */}
                    {item.product.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(item.product.rating!.average)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ({item.product.rating.count})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        {formatPrice(item.product.sale_price || item.product.price, item.product.currency)}
                      </span>
                      {item.product.sale_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.product.price, item.product.currency)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
                      <button
                        onClick={() => addToCart(item.product.id)}
                        disabled={!item.product.in_stock || addingToCart[item.product.id]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {addingToCart[item.product.id] ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            {item.product.in_stock ? 'Add to Cart' : 'Notify Me'}
                          </>
                        )}
                      </button>
                      
                      <Link
                        href={`/p/${item.product.slug}`}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
