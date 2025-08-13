"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Bookmark, 
  Trash2, 
  Plus, 
  Calendar,
  Package,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { api, formatPrice } from "@/lib/api";

interface SavedCart {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  subtotal: number;
  currency: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      id: number;
      slug: string;
      name: string;
      brand?: string;
      price: number;
      sale_price?: number;
      images: string[];
      stock_qty: number;
      in_stock: boolean;
    };
  }>;
}

export default function SavedCartsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [restoring, setRestoring] = useState<{ [key: string]: boolean }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/account/saved-carts');
      return;
    }
    loadSavedCarts();
  }, [isAuthenticated, router]);

  const loadSavedCarts = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      const mockSavedCarts: SavedCart[] = [
        {
          id: "cart_1",
          name: "3D Printer Starter Kit",
          description: "Everything needed to get started with 3D printing",
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
          updated_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          item_count: 5,
          subtotal: 45000,
          currency: "INR",
          items: [
            {
              id: 1,
              product_id: 1,
              quantity: 1,
              unit_price: 25000,
              total_price: 25000,
              product: {
                id: 1,
                slug: "ender-3-v2",
                name: "Ender 3 V2 3D Printer",
                brand: "Creality",
                price: 25000,
                images: ["/placeholder.svg"],
                stock_qty: 5,
                in_stock: true
              }
            },
            {
              id: 2,
              product_id: 2,
              quantity: 4,
              unit_price: 2500,
              total_price: 10000,
              product: {
                id: 2,
                slug: "pla-filament-white",
                name: "PLA Filament 1kg - White",
                brand: "MakrX",
                price: 2500,
                sale_price: 2250,
                images: ["/placeholder.svg"],
                stock_qty: 20,
                in_stock: true
              }
            }
          ]
        },
        {
          id: "cart_2",
          name: "Weekend Project Supplies",
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago
          updated_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          item_count: 3,
          subtotal: 8500,
          currency: "INR",
          items: [
            {
              id: 3,
              product_id: 3,
              quantity: 2,
              unit_price: 3000,
              total_price: 6000,
              product: {
                id: 3,
                slug: "abs-filament-black",
                name: "ABS Filament 1kg - Black",
                brand: "MakrX",
                price: 3000,
                images: ["/placeholder.svg"],
                stock_qty: 0,
                in_stock: false
              }
            }
          ]
        }
      ];
      
      setTimeout(() => {
        setSavedCarts(mockSavedCarts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load saved carts:', error);
      addNotification('Failed to load saved carts', 'error');
      setLoading(false);
    }
  };

  const deleteSavedCart = async (cartId: string) => {
    if (!confirm('Are you sure you want to delete this saved cart?')) return;
    
    setDeleting(prev => ({ ...prev, [cartId]: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSavedCarts(prev => prev.filter(cart => cart.id !== cartId));
      addNotification('Saved cart deleted', 'success');
    } catch (error) {
      addNotification('Failed to delete saved cart', 'error');
    } finally {
      setDeleting(prev => ({ ...prev, [cartId]: false }));
    }
  };

  const restoreToCart = async (cartId: string) => {
    setRestoring(prev => ({ ...prev, [cartId]: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification('Cart restored successfully', 'success');
      router.push('/cart');
    } catch (error) {
      addNotification('Failed to restore cart', 'error');
    } finally {
      setRestoring(prev => ({ ...prev, [cartId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCartStatus = (cart: SavedCart) => {
    const outOfStockItems = cart.items.filter(item => !item.product.in_stock);
    const priceChanges = cart.items.filter(item => 
      item.product.sale_price && item.unit_price !== (item.product.sale_price || item.product.price)
    );
    
    if (outOfStockItems.length > 0) {
      return { type: 'warning', message: `${outOfStockItems.length} item(s) out of stock` };
    }
    if (priceChanges.length > 0) {
      return { type: 'info', message: `${priceChanges.length} item(s) have price changes` };
    }
    return { type: 'success', message: 'All items available' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
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
                <Bookmark className="h-8 w-8 text-blue-500" />
                Saved Carts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {savedCarts.length} {savedCarts.length === 1 ? 'cart' : 'carts'} saved for later
              </p>
            </div>
            
            <Link
              href="/cart"
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Save Current Cart
            </Link>
          </div>
        </div>

        {savedCarts.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No saved carts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Save your shopping carts to access them later or share with others.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {savedCarts.map((cart) => {
              const status = getCartStatus(cart);
              
              return (
                <div key={cart.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                  {/* Cart Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {cart.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status.type === 'success' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : status.type === 'warning'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}>
                            {status.message}
                          </span>
                        </div>
                        
                        {cart.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {cart.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {cart.item_count} items
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatPrice(cart.subtotal, cart.currency)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Saved {formatDate(cart.created_at)}
                          </div>
                          {cart.updated_at !== cart.created_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Updated {formatDate(cart.updated_at)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => restoreToCart(cart.id)}
                          disabled={restoring[cart.id]}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {restoring[cart.id] ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Restore to Cart
                        </button>
                        
                        <button
                          onClick={() => deleteSavedCart(cart.id)}
                          disabled={deleting[cart.id]}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {deleting[cart.id] ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {cart.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.images[0] || '/placeholder.svg'}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {item.product.name}
                                </p>
                                {item.product.brand && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.product.brand}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              
                              <div className="text-right ml-4">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatPrice(item.total_price, cart.currency)}
                                </p>
                                {!item.product.in_stock && (
                                  <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-3 w-3" />
                                    Out of stock
                                  </div>
                                )}
                                {item.product.sale_price && item.unit_price !== (item.product.sale_price || item.product.price) && (
                                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                    <DollarSign className="h-3 w-3" />
                                    Price changed
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {cart.items.length > 3 && (
                        <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                          +{cart.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
