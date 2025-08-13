"use client";

import { useEffect } from 'react';

interface ProductStructuredDataProps {
  product: {
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    brand?: string;
    images: string[];
    currency: string;
    stock_qty: number;
    rating?: {
      average: number;
      count: number;
    };
  };
  effectivePrice: number;
}

export default function ProductStructuredData({ product, effectivePrice }: ProductStructuredDataProps) {
  useEffect(() => {
    // Only create structured data on the client side
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      description: product.short_description || product.description,
      brand: product.brand ? {
        "@type": "Brand",
        name: product.brand,
      } : undefined,
      image: product.images,
      offers: {
        "@type": "Offer",
        url: `${window.location.origin}/p/${product.slug}`,
        priceCurrency: product.currency,
        price: effectivePrice,
        availability:
          product.stock_qty > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "MakrX Store",
        },
      },
      aggregateRating: product.rating
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
          }
        : undefined,
    };

    // Create script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    
    // Add to head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [product, effectivePrice]);

  return null;
}
