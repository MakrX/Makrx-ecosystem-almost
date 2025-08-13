"use client";

import { useState } from "react";
import Image from "next/image";
// Using inline SVGs instead of Heroicons

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedImage: number;
  onImageChange: (index: number) => void;
}

export default function ProductGallery({
  images,
  productName,
  selectedImage,
  onImageChange,
}: ProductGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const safeImages =
    images && images.length > 0 ? images : ["/placeholder.svg"];
  const currentImage = safeImages[selectedImage] || safeImages[0];

  const handlePrevious = () => {
    const newIndex =
      selectedImage > 0 ? selectedImage - 1 : safeImages.length - 1;
    onImageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex =
      selectedImage < safeImages.length - 1 ? selectedImage + 1 : 0;
    onImageChange(newIndex);
  };

  const handleImageChange = (index: number) => {
    if (index >= 0 && index < safeImages.length) {
      onImageChange(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
        <Image
          src={currentImage}
          alt={productName}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />

        {/* Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/80 rounded-full shadow-md hover:bg-white dark:hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg
                className="h-5 w-5 text-gray-900 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/80 rounded-full shadow-md hover:bg-white dark:hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg
                className="h-5 w-5 text-gray-900 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Zoom Button */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/80 rounded-full shadow-md hover:bg-white dark:hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Zoom image"
        >
          <svg
            className="h-5 w-5 text-gray-900 dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* Image Counter */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-sm rounded">
            {selectedImage + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {safeImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                index === selectedImage
                  ? "border-blue-500"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={currentImage}
              alt={productName}
              width={800}
              height={800}
              className="object-contain max-h-[90vh] w-auto h-auto"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
