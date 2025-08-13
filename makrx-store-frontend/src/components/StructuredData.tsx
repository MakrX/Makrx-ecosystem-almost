"use client";

import { useEffect } from "react";

// Product Structured Data
interface ProductStructuredDataProps {
  product: {
    id: number;
    name: string;
    description: string;
    images: string[];
    price: number;
    sale_price?: number;
    currency: string;
    brand?: string;
    sku?: string;
    stock_qty: number;
    category?: {
      name: string;
      path: string;
    };
    rating?: {
      average: number;
      count: number;
    };
    variants?: Array<{
      id: number;
      sku: string;
      price: number;
      sale_price?: number;
      attributes: Record<string, string>;
    }>;
  };
  url: string;
}

export function ProductStructuredData({ product, url }: ProductStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": url,
      name: product.name,
      description: product.description,
      image: product.images.map(img => 
        img.startsWith('http') ? img : `${window.location.origin}${img}`
      ),
      brand: product.brand ? {
        "@type": "Brand",
        name: product.brand
      } : undefined,
      sku: product.sku,
      category: product.category?.name,
      offers: {
        "@type": "Offer",
        "@id": `${url}#offer`,
        url: url,
        priceCurrency: product.currency,
        price: product.sale_price || product.price,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        availability: product.stock_qty > 0 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "MakrX Store",
          url: window.location.origin
        }
      },
      aggregateRating: product.rating ? {
        "@type": "AggregateRating",
        ratingValue: product.rating.average,
        reviewCount: product.rating.count
      } : undefined,
      // Add product variants as additional offers
      hasVariant: product.variants?.map(variant => ({
        "@type": "ProductModel",
        name: `${product.name} - ${Object.values(variant.attributes).join(', ')}`,
        sku: variant.sku,
        offers: {
          "@type": "Offer",
          price: variant.sale_price || variant.price,
          priceCurrency: product.currency,
          availability: "https://schema.org/InStock"
        }
      }))
    };

    // Remove undefined properties
    const cleanedData = JSON.parse(JSON.stringify(structuredData));

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(cleanedData);
    script.id = 'product-structured-data';
    
    // Remove existing script if present
    const existing = document.getElementById('product-structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('product-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [product, url]);

  return null;
}

// Category/Collection Structured Data
interface CategoryStructuredDataProps {
  category: {
    name: string;
    description?: string;
    path: string;
  };
  products: Array<{
    id: number;
    name: string;
    price: number;
    sale_price?: number;
    currency: string;
    images: string[];
  }>;
  url: string;
}

export function CategoryStructuredData({ category, products, url }: CategoryStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": url,
      name: category.name,
      description: category.description,
      url: url,
      mainEntity: {
        "@type": "ItemList",
        name: category.name,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 20).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            image: product.images[0],
            offers: {
              "@type": "Offer",
              price: product.sale_price || product.price,
              priceCurrency: product.currency
            }
          }
        }))
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'category-structured-data';
    
    const existing = document.getElementById('category-structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('category-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [category, products, url]);

  return null;
}

// Organization Structured Data
export function OrganizationStructuredData() {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${window.location.origin}#organization`,
      name: "MakrX Store",
      url: window.location.origin,
      logo: `${window.location.origin}/logo.png`,
      description: "Premium 3D printing materials, equipment, and professional printing services for makers and professionals.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-XXX-XXX-XXXX",
        contactType: "Customer Service",
        availableLanguage: ["English", "Hindi"]
      },
      sameAs: [
        "https://twitter.com/makrxstore",
        "https://facebook.com/makrxstore",
        "https://instagram.com/makrxstore"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'organization-structured-data';
    
    const existing = document.getElementById('organization-structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('organization-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}

// Search Action Structured Data
export function SearchActionStructuredData() {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${window.location.origin}#website`,
      url: window.location.origin,
      name: "MakrX Store",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${window.location.origin}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'search-action-structured-data';
    
    const existing = document.getElementById('search-action-structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('search-action-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}

// FAQ Structured Data
interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  useEffect(() => {
    if (!faqs || faqs.length === 0) return;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'faq-structured-data';
    
    const existing = document.getElementById('faq-structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('faq-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [faqs]);

  return null;
}
