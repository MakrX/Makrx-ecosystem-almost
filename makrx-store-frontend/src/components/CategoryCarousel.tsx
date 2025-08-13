"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Category } from "@/lib/api";

interface CategoryCarouselProps {
  categories: Category[];
  onCategorySelect?: (categoryId: number) => void;
  selectedCategoryId?: number;
}

export default function CategoryCarousel({
  categories,
  onCategorySelect,
  selectedCategoryId,
}: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Number of visible categories based on screen size
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 6;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 768) return 3;
    if (window.innerWidth < 1024) return 4;
    if (window.innerWidth < 1280) return 5;
    return 6;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  // Add "All Categories" option at the beginning
  const allCategoriesOption = {
    id: 0,
    name: "All Categories",
    description: "Browse all products",
    image_url: undefined,
    product_count: 0
  };

  const displayCategories = [allCategoriesOption, ...categories] as any[];

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < displayCategories.length - visibleCount;

  const scrollLeft = () => {
    if (canScrollLeft && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(Math.max(0, currentIndex - 1));
      setTimeout(() => setIsScrolling(false), 300);
    }
  };

  const scrollRight = () => {
    if (canScrollRight && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(Math.min(displayCategories.length - visibleCount, currentIndex + 1));
      setTimeout(() => setIsScrolling(false), 300);
    }
  };

  const handleCategoryClick = (category: Category | { id: number; name: string; description: string; image?: string }) => {
    if (onCategorySelect) {
      onCategorySelect(category.id);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
        <Link
          href="/catalog"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Categories
        </Link>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft || isScrolling}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-200 ${
            canScrollLeft && !isScrolling
              ? "hover:bg-gray-50 hover:shadow-xl"
              : "opacity-50 cursor-not-allowed"
          }`}
          style={{ marginLeft: "-12px" }}
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          disabled={!canScrollRight || isScrolling}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-200 ${
            canScrollRight && !isScrolling
              ? "hover:bg-gray-50 hover:shadow-xl"
              : "opacity-50 cursor-not-allowed"
          }`}
          style={{ marginRight: "-12px" }}
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>

        {/* Categories Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-hidden"
          style={{ 
            paddingLeft: "12px",
            paddingRight: "12px"
          }}
        >
          <div
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              width: `${(displayCategories.length / visibleCount) * 100}%`,
            }}
          >
            {displayCategories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0"
                style={{ width: `${100 / displayCategories.length}%` }}
              >
                <div
                  className={`group cursor-pointer transition-all duration-200 ${
                    (selectedCategoryId === category.id) || (selectedCategoryId === undefined && category.id === 0)
                      ? "transform scale-105"
                      : "hover:transform hover:scale-105"
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div
                    className={`relative rounded-lg overflow-hidden mb-3 ${
                      (selectedCategoryId === category.id) || (selectedCategoryId === undefined && category.id === 0)
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "group-hover:shadow-md"
                    }`}
                  >
                    <div className={`aspect-square relative ${
                      category.id === 0
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}>
                      {(category.image_url || (category as any).image) ? (
                        <Image
                          src={category.image_url || (category as any).image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {category.id === 0 ? (
                            <div className="text-white">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-lg">
                                {category.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                      
                      {/* Product Count Badge */}
                      {category.id !== 0 && (category.product_count || (category as any).productCount) > 0 && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {category.product_count || (category as any).productCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center px-1">
                    <h3
                      className={`font-medium text-xs mb-1 transition-colors duration-200 ${
                      (selectedCategoryId === category.id) || (selectedCategoryId === undefined && category.id === 0)
                        ? "text-blue-600"
                        : "text-gray-900 group-hover:text-blue-600"
                    }`}
                    >
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {category.description || `Explore ${category.name.toLowerCase()}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicators */}
        {displayCategories.length > visibleCount && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from(
              { length: Math.ceil(displayCategories.length / visibleCount) },
              (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isScrolling) {
                      setIsScrolling(true);
                      setCurrentIndex(index * visibleCount);
                      setTimeout(() => setIsScrolling(false), 300);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    Math.floor(currentIndex / visibleCount) === index
                      ? "bg-blue-600 w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Featured Categories Quick Access */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 justify-center">
          {displayCategories.slice(0, 9).map((category) => (
            <button
              key={`quick-${category.id}`}
              onClick={() => handleCategoryClick(category)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                (selectedCategoryId === category.id) || (selectedCategoryId === undefined && category.id === 0)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
