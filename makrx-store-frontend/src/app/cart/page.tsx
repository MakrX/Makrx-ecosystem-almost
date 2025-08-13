'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Plus, Minus, Trash2, ArrowLeft, ShoppingBag, 
  Truck, Tag, Gift, CreditCard, ShieldCheck 
} from 'lucide-react';
import { api, type Cart, type CartItem, formatPrice } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import ShippingEstimator, { useCartCalculations } from '@/components/ShippingEstimator';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const { addNotification } = useNotifications();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{ [key: number]: boolean }>({});
  const [couponCode, setCouponCode] = useState('');

  // Enhanced cart calculations
  const {
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    total,
    setSubtotal,
    handleShippingChange,
    handleTaxChange,
    handleDiscountChange,
  } = useCartCalculations();

  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const cartData = await api.getCart();
        setCart(cartData);
        setSubtotal(cartData.subtotal);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated]);

  const updateCartItem = async (itemId: number, newQuantity: number) => {
    if (!cart) return;

    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      if (newQuantity === 0) {
        await api.removeFromCart(itemId);
        const removedItem = cart.items.find(item => item.id === itemId);
        setCart(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId),
          item_count: prev.item_count - 1,
          subtotal: prev.subtotal - (prev.items.find(item => item.id === itemId)?.total_price || 0)
        } : null);
        addNotification({
          type: 'success',
          title: 'Item Removed',
          message: `${removedItem?.product.name} removed from cart`
        });
      } else {
        await api.updateCartItem(itemId, newQuantity);
        const updatedCart = await api.getCart();
        setCart(updatedCart);
        addNotification({
          type: 'success',
          title: 'Cart Updated',
          message: 'Quantity updated successfully'
        });
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update cart item. Please try again.'
      });
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeCartItem = async (itemId: number) => {
    if (!cart) return;
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await api.removeFromCart(itemId);
      setCart(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        item_count: prev.item_count - 1,
        subtotal: prev.subtotal - (prev.items.find(item => item.id === itemId)?.total_price || 0)
      } : null);
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      alert('Failed to remove cart item');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;

    try {
      // In a real implementation, this would validate the coupon via API
      // For now, we'll simulate a 10% discount
      const discount = cartSubtotal * 0.1;
      setCouponDiscount(discount);
      alert('Coupon applied successfully!');
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      alert('Invalid coupon code');
    }
  };

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Sign In to View Cart</h2>
              <p className="mt-2 text-gray-600">
                Please sign in to see your shopping cart and continue with your purchase.
              </p>
              <button
                onClick={login}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </button>
              <Link
                href="/catalog"
                className="mt-4 block text-sm text-blue-600 hover:text-blue-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-4 text-lg text-gray-600">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/catalog"
              className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartSubtotal = cart?.subtotal || 0;
  const freeShippingThreshold = 75;
  const qualifiesForFreeShipping = cartSubtotal >= freeShippingThreshold;
  const finalShippingCost = qualifiesForFreeShipping ? 0 : shippingCost;
  const tax = cartSubtotal * 0.08; // 8% tax
  const cartTotal = cartSubtotal - couponDiscount + finalShippingCost + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{cart.item_count} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product?.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="ml-6 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link 
                              href={`/product/${item.product?.slug}`}
                              className="text-lg font-medium text-gray-900 hover:text-blue-600"
                            >
                              {item.product?.name}
                            </Link>
                            {item.product?.brand && (
                              <p className="text-sm text-gray-600 mt-1">{item.product.brand}</p>
                            )}
                            {item.product?.short_description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.product.short_description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeCartItem(item.id)}
                            disabled={updating[item.id]}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Quantity and Price */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <button
                              onClick={() => updateCartItem(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating[item.id]}
                              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="mx-4 text-gray-900 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItem(item.id, item.quantity + 1)}
                              disabled={updating[item.id]}
                              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.total_price, cart.currency)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.unit_price, cart.currency)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Estimator */}
            <ShippingEstimator
              subtotal={subtotal}
              items={cart.items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                weight: 0.5, // Default weight in kg
              }))}
              onShippingChange={handleShippingChange}
              onTaxChange={handleTaxChange}
            />

            {/* Order Summary */}
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      // Simulate coupon application
                      if (couponCode.toLowerCase() === 'save10') {
                        handleDiscountChange(cartSubtotal * 0.1);
                      } else {
                        handleDiscountChange(0);
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
                {couponCode.toLowerCase() === 'save10' && discountAmount > 0 && (
                  <p className="text-sm text-green-600 mt-1">Coupon applied successfully!</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartSubtotal, cart.currency)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Coupon Discount
                    </span>
                    <span className="font-medium">-{formatPrice(discountAmount, cart.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    Shipping
                  </span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shippingCost, cart.currency)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(taxAmount, cart.currency)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(cartTotal, cart.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </button>
              
              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <ShieldCheck className="h-4 w-4 mr-1" />
                Secure checkout with SSL encryption
              </div>

              {/* Payment Methods */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">We accept</p>
                <div className="flex justify-center space-x-2">
                  <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                    VISA
                  </div>
                  <div className="w-8 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                    MC
                  </div>
                  <div className="w-8 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                    AMEX
                  </div>
                  <div className="w-8 h-6 bg-orange-500 rounded text-white text-xs flex items-center justify-center">
                    PP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <Truck className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over ₹6,225</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-600">SSL encrypted checkout</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <Gift className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Easy Returns</h3>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
