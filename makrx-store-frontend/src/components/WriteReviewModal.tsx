"use client";

import React, { useState } from "react";
import { X, Star, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  sku?: string;
}

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem;
  orderId: string;
  onSubmit: (review: ReviewData) => void;
}

export interface ReviewData {
  itemId: string;
  orderId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  wouldRecommend: boolean;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  item,
  orderId,
  onSubmit,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    
    if (content.trim().length < 10) {
      alert("Please write at least 10 characters in your review");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reviewData: ReviewData = {
        itemId: item.id,
        orderId,
        rating,
        title: title.trim() || `Review for ${item.name}`,
        content: content.trim(),
        wouldRecommend,
      };
      
      await onSubmit(reviewData);
      setSubmitted(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setTitle("");
    setContent("");
    setWouldRecommend(true);
    setSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {submitted ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Review Submitted!
            </h2>
            <p className="text-gray-600">
              Thank you for your feedback. Your review will be published after a brief review.
            </p>
          </div>
        ) : (
          // Review Form
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.sku && (
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  )}
                  <p className="text-xs text-green-600 font-medium">
                    ✓ Verified Purchase
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {rating > 0 && (
                        <>
                          {rating === 1 && "Poor"}
                          {rating === 2 && "Fair"}
                          {rating === 3 && "Good"}
                          {rating === 4 && "Very Good"}
                          {rating === 5 && "Excellent"}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Review Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Review Content */}
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Review *
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your experience with this product. What did you like or dislike? How did it perform? Would you recommend it to others?"
                    rows={6}
                    minLength={10}
                    maxLength={2000}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {content.length}/2000 characters (minimum 10)
                  </p>
                </div>

                {/* Recommendation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Would you recommend this product?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recommend"
                        checked={wouldRecommend === true}
                        onChange={() => setWouldRecommend(true)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Yes, I would recommend
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recommend"
                        checked={wouldRecommend === false}
                        onChange={() => setWouldRecommend(false)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        No, I would not recommend
                      </span>
                    </label>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Review Guidelines
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be honest and helpful to other customers</li>
                    <li>• Focus on product features and your experience</li>
                    <li>• Avoid inappropriate language or personal information</li>
                    <li>• Only verified purchasers can submit reviews</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || rating === 0 || content.trim().length < 10}
                    className="flex-1"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
