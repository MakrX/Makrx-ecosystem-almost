import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOStructuredDataProps {
  type: 'organization' | 'website' | 'article' | 'product';
  data?: any;
}

export default function SEOStructuredData({ type, data }: SEOStructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "MakrX",
          "alternateName": "Botness Technologies Pvt Ltd",
          "url": "https://makrx.org",
          "logo": "https://makrx.org/logo.png",
          "description": "India's largest maker ecosystem providing access to makerspaces, tools, and learning resources",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN",
            "addressLocality": "Bangalore",
            "addressRegion": "Karnataka"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-XXXX-XXXX",
            "contactType": "customer service",
            "availableLanguage": ["English", "Hindi"]
          },
          "sameAs": [
            "https://linkedin.com/company/makrx",
            "https://twitter.com/makrx",
            "https://instagram.com/makrx"
          ],
          "foundingDate": "2024",
          "numberOfEmployees": "50-100",
          "slogan": "Dream. Make. Share."
        };

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "MakrX",
          "url": "https://makrx.org",
          "description": "Access world-class makerspaces, shop cutting-edge tools, and learn new skills. Join India's largest maker ecosystem.",
          "publisher": {
            "@type": "Organization",
            "name": "Botness Technologies Pvt Ltd"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://makrx.org/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "inLanguage": "en-IN"
        };

      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "MakrX Ecosystem",
          "description": "Comprehensive maker ecosystem including makerspaces, tools, and learning platform",
          "brand": {
            "@type": "Brand",
            "name": "MakrX"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2025-12-31"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1000+"
          }
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
