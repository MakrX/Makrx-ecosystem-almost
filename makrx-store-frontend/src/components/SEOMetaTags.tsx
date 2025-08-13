"use client";

import Head from 'next/head';
import { useEffect } from 'react';

interface SEOMetaTagsProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  keywords?: string[];
  robots?: string;
  structuredData?: object;
  alternateLanguages?: Array<{
    hreflang: string;
    href: string;
  }>;
  prevPage?: string;
  nextPage?: string;
}

export default function SEOMetaTags({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  keywords = [],
  robots = 'index, follow',
  structuredData,
  alternateLanguages = [],
  prevPage,
  nextPage,
}: SEOMetaTagsProps) {
  const siteName = "MakrX Store";
  const defaultImage = "/og-image.jpg";
  
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const ogImageUrl = ogImage || defaultImage;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    // Set document title
    document.title = fullTitle;

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Set canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonicalLink) {
        canonicalLink.href = canonical;
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        canonicalLink.href = canonical;
        document.head.appendChild(canonicalLink);
      }
    }

    // Set meta keywords
    if (keywords.length > 0) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (keywordsMeta) {
        keywordsMeta.setAttribute('content', keywords.join(', '));
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywords.join(', ');
        document.head.appendChild(meta);
      }
    }

    // Set robots meta
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', robots);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = robots;
      document.head.appendChild(meta);
    }

    // Set Open Graph tags
    const ogTags = [
      { property: 'og:title', content: ogTitle || title },
      { property: 'og:description', content: ogDescription || description },
      { property: 'og:image', content: ogImageUrl },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: ogType },
      { property: 'og:site_name', content: siteName },
    ];

    ogTags.forEach(({ property, content }) => {
      let ogMeta = document.querySelector(`meta[property="${property}"]`);
      if (ogMeta) {
        ogMeta.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    });

    // Set Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: ogTitle || title },
      { name: 'twitter:description', content: ogDescription || description },
      { name: 'twitter:image', content: ogImageUrl },
      { name: 'twitter:site', content: '@makrxstore' },
    ];

    twitterTags.forEach(({ name, content }) => {
      let twitterMeta = document.querySelector(`meta[name="${name}"]`);
      if (twitterMeta) {
        twitterMeta.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });

    // Set alternate language links
    alternateLanguages.forEach(({ hreflang, href }) => {
      let altLink = document.querySelector(`link[hreflang="${hreflang}"]`) as HTMLLinkElement;
      if (altLink) {
        altLink.href = href;
      } else {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hreflang;
        link.href = href;
        document.head.appendChild(link);
      }
    });

    // Set prev/next pagination links
    if (prevPage) {
      let prevLink = document.querySelector('link[rel="prev"]') as HTMLLinkElement;
      if (prevLink) {
        prevLink.href = prevPage;
      } else {
        const link = document.createElement('link');
        link.rel = 'prev';
        link.href = prevPage;
        document.head.appendChild(link);
      }
    }

    if (nextPage) {
      let nextLink = document.querySelector('link[rel="next"]') as HTMLLinkElement;
      if (nextLink) {
        nextLink.href = nextPage;
      } else {
        const link = document.createElement('link');
        link.rel = 'next';
        link.href = nextPage;
        document.head.appendChild(link);
      }
    }

  }, [
    fullTitle,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImageUrl,
    ogType,
    twitterCard,
    keywords,
    robots,
    alternateLanguages,
    prevPage,
    nextPage,
    canonicalUrl,
  ]);

  return null;
}

// Product-specific SEO component
interface ProductSEOProps {
  product: {
    name: string;
    description: string;
    images: string[];
    price: number;
    sale_price?: number;
    currency: string;
    brand?: string;
    category?: {
      name: string;
      path: string;
    };
    tags: string[];
  };
  slug: string;
}

export function ProductSEO({ product, slug }: ProductSEOProps) {
  const price = product.sale_price || product.price;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: product.currency,
  }).format(price);

  const title = `${product.name} - ${formattedPrice}`;
  const description = `${product.description.slice(0, 150)}... | ${product.brand ? `${product.brand} | ` : ''}${formattedPrice} | Free shipping available | MakrX Store`;
  const canonical = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${slug}`;
  
  const keywords = [
    product.name,
    ...(product.brand ? [product.brand] : []),
    ...(product.category ? [product.category.name] : []),
    ...product.tags,
    '3D printing',
    'maker supplies',
    'MakrX'
  ];

  return (
    <SEOMetaTags
      title={title}
      description={description}
      canonical={canonical}
      ogTitle={title}
      ogDescription={description}
      ogImage={product.images[0]}
      ogType="product"
      keywords={keywords}
      robots="index, follow"
    />
  );
}

// Category-specific SEO component
interface CategorySEOProps {
  category: {
    name: string;
    description?: string;
    path: string;
  };
  productCount: number;
  currentPage?: number;
  totalPages?: number;
}

export function CategorySEO({ category, productCount, currentPage = 1, totalPages = 1 }: CategorySEOProps) {
  const pageTitle = currentPage > 1 
    ? `${category.name} - Page ${currentPage}`
    : category.name;
  
  const title = `${pageTitle} | ${productCount} Products | MakrX Store`;
  const description = category.description 
    ? `${category.description} | Browse ${productCount} products in ${category.name}. Free shipping available.`
    : `Shop ${category.name} at MakrX Store. Browse ${productCount} high-quality products with free shipping available.`;
  
  const canonical = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${category.path}${currentPage > 1 ? `?page=${currentPage}` : ''}`;
  
  const keywords = [
    category.name,
    '3D printing',
    'maker supplies',
    'MakrX Store',
    'buy online',
    'free shipping'
  ];

  const prevPage = currentPage > 1 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${category.path}${currentPage > 2 ? `?page=${currentPage - 1}` : ''}`
    : undefined;
  
  const nextPage = currentPage < totalPages 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${category.path}?page=${currentPage + 1}`
    : undefined;

  return (
    <SEOMetaTags
      title={title}
      description={description}
      canonical={canonical}
      keywords={keywords}
      robots="index, follow"
      prevPage={prevPage}
      nextPage={nextPage}
    />
  );
}

// Search page SEO component
interface SearchSEOProps {
  query: string;
  resultCount: number;
  currentPage?: number;
}

export function SearchSEO({ query, resultCount, currentPage = 1 }: SearchSEOProps) {
  const title = `Search results for "${query}" | ${resultCount} results | MakrX Store`;
  const description = `Found ${resultCount} products for "${query}". Shop high-quality 3D printing supplies and maker tools at MakrX Store.`;
  const canonical = `${typeof window !== 'undefined' ? window.location.origin : ''}/search?q=${encodeURIComponent(query)}${currentPage > 1 ? `&page=${currentPage}` : ''}`;
  
  const robots = resultCount === 0 ? 'noindex, follow' : 'index, follow';

  return (
    <SEOMetaTags
      title={title}
      description={description}
      canonical={canonical}
      robots={robots}
      keywords={[query, '3D printing', 'search', 'MakrX Store']}
    />
  );
}
