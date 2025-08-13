"use client";

import { useState, useEffect } from "react";
import { Product, formatPrice } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { ShoppingCart, Plus, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FrequentlyBoughtTogetherProps {
  baseProduct: Product;
  recommendations: Product[];
}

export default function FrequentlyBoughtTogether({ 
  baseProduct, 
  recommendations 
}: FrequentlyBoughtTogetherProps) {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set([baseProduct.id]));
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Calculate total price
  const totalPrice = [...selectedProducts].reduce((sum, productId) => {
    const product = productId === baseProduct.id 
      ? baseProduct 
      : recommendations.find(p => p.id === productId);
    return sum + (product?.price || 0);
  }, 0);

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      // Don't allow deselecting the base product
      if (productId !== baseProduct.id) {
        newSelected.delete(productId);
      }
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const addAllToCart = async () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to add items to cart'
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      const selectedProductList = [...selectedProducts]
        .map(id => id === baseProduct.id ? baseProduct : recommendations.find(p => p.id === id))
        .filter(Boolean) as Product[];

      // Add each selected product to cart
      for (const product of selectedProductList) {
        // Mock cart addition - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      addNotification({
        type: 'success',
        title: 'Added to Cart',
        message: `${selectedProducts.size} items added to your cart`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add items to cart'
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Frequently Bought Together
      </h3>

      <div className="space-y-4">
        {/* Product List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Base Product */}
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="w-4 h-4 text-blue-600"
            />
            <div className="flex-shrink-0">
              <Image
                src={baseProduct.images?.[0] || '/placeholder.svg'}
                alt={baseProduct.name}
                width={60}
                height={60}
                className="rounded-md object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {baseProduct.name}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                {formatPrice(baseProduct.price)}
              </p>
              <span className="text-xs text-blue-600 dark:text-blue-400">This item</span>
            </div>
          </div>

          {/* Recommended Products */}
          {recommendations.slice(0, 3).map((product, index) => (
            <div key={product.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={selectedProducts.has(product.id)}
                onChange={() => toggleProduct(product.id)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-shrink-0">
                <Image
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/p/${product.slug}`}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {formatPrice(product.price)}
                </p>
                {product.rating && (
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-yellow-500">★</span>
                    <span className="text-xs text-gray-500 ml-1">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Plus icons between products on larger screens */}
        <div className="hidden md:flex items-center justify-center space-x-8 -mt-2 mb-2">
          <Plus className="w-5 h-5 text-gray-400" />
          <Plus className="w-5 h-5 text-gray-400" />
        </div>

        {/* Summary and Add to Cart */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total for {selectedProducts.size} items:
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(totalPrice)}
              </p>
              {selectedProducts.size > 1 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Save on shipping when buying together
                </p>
              )}
            </div>
            <button
              onClick={addAllToCart}
              disabled={isAddingToCart || selectedProducts.size === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add Selected to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Individual product actions */}
          <div className="flex flex-wrap gap-2">
            {recommendations.slice(0, 3).map((product) => (
              <Link
                key={product.id}
                href={`/p/${product.slug}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View {product.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
