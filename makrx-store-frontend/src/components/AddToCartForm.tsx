"use client";

import { useState } from "react";
// Using inline SVGs instead of Heroicons

interface AddToCartFormProps {
  productId: number;
  variantId?: number | null;
  maxQuantity: number;
  inStock: boolean;
  onAddToCart?: (
    productId: number,
    variantId: number | null,
    quantity: number,
  ) => void;
}

export default function AddToCartForm({
  productId,
  variantId,
  maxQuantity,
  inStock,
  onAddToCart,
}: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!inStock || isAdding) return;

    setIsAdding(true);
    try {
      if (onAddToCart) {
        await onAddToCart(productId, variantId, quantity);
      } else {
        // Default implementation - could make API call here
        console.log("Adding to cart:", { productId, variantId, quantity });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Show success feedback (could be replaced with a toast notification)
      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!inStock) return;

    // Add to cart and redirect to checkout
    await handleAddToCart();
    // Redirect to checkout page
    window.location.href = "/checkout";
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Here you would typically make an API call to update the wishlist
  };

  const maxQtyToShow = Math.min(maxQuantity, 10); // Limit dropdown to 10 for UX

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {inStock && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Quantity:
          </span>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(parseInt(e.target.value) || 1)
              }
              className="w-16 px-2 py-2 text-center border-0 bg-transparent focus:ring-0 focus:outline-none"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          {maxQuantity <= 10 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({maxQuantity} available)
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isAdding ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Adding...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
              {inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>

        {/* Buy Now */}
        {inStock && (
          <button
            onClick={handleBuyNow}
            className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Buy Now
          </button>
        )}

        {/* Secondary Actions */}
        <div className="flex gap-3">
          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {isWishlisted ? (
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
            <span className="text-sm font-medium">
              {isWishlisted ? "Saved" : "Save"}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: document.title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Stock Information */}
      {inStock && maxQuantity > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {maxQuantity <= 5 ? (
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              Only {maxQuantity} left in stock
            </span>
          ) : maxQuantity <= 20 ? (
            <span className="text-yellow-600 dark:text-yellow-400">
              {maxQuantity} in stock
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400">In stock</span>
          )}
        </div>
      )}

      {/* Delivery Information */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span>Free shipping on orders over ₹999</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
          <span>Easy returns within 30 days</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure payment & data protection</span>
        </div>
      </div>
    </div>
  );
}
