/**
 * Product Recommendation System
 * Generates intelligent product recommendations based on user behavior, 
 * product relationships, and purchase patterns
 */

import { Product } from "./api";

export interface RecommendationOptions {
  baseProduct?: Product;
  category?: string;
  userPreferences?: string[];
  priceRange?: { min: number; max: number };
  maxResults?: number;
  excludeIds?: string[];
}

export interface RecommendationScore {
  productId: string;
  score: number;
  reasons: string[];
  type: 'similar' | 'complementary' | 'popular' | 'trending' | 'frequently_bought_together';
}

export interface RecommendationEngine {
  generateRecommendations(products: Product[], options: RecommendationOptions): Product[];
  getRelatedProducts(baseProduct: Product, allProducts: Product[]): Product[];
  getFrequentlyBoughtTogether(baseProduct: Product, allProducts: Product[]): Product[];
  getTrendingProducts(products: Product[]): Product[];
  getPopularInCategory(products: Product[], category: string): Product[];
}

export class SmartRecommendationEngine implements RecommendationEngine {
  
  generateRecommendations(products: Product[], options: RecommendationOptions): Product[] {
    let recommendations: Product[] = [];
    const maxResults = options.maxResults || 8;
    const excludeIds = new Set(options.excludeIds || []);

    // Filter out excluded products
    const availableProducts = products.filter(p => !excludeIds.has(p.id));

    if (options.baseProduct) {
      // Get product-based recommendations
      const similar = this.getRelatedProducts(options.baseProduct, availableProducts);
      const complementary = this.getFrequentlyBoughtTogether(options.baseProduct, availableProducts);
      
      recommendations = [...similar.slice(0, 4), ...complementary.slice(0, 4)];
    } else if (options.category) {
      // Get category-based recommendations
      const popular = this.getPopularInCategory(availableProducts, options.category);
      const trending = this.getTrendingProducts(availableProducts.filter(p => p.category === options.category));
      
      recommendations = [...popular.slice(0, 4), ...trending.slice(0, 4)];
    } else {
      // Get general recommendations
      const trending = this.getTrendingProducts(availableProducts);
      const popular = this.getPopularProducts(availableProducts);
      
      recommendations = [...trending.slice(0, 4), ...popular.slice(0, 4)];
    }

    // Apply price filtering if specified
    if (options.priceRange) {
      recommendations = recommendations.filter(p => 
        p.price >= options.priceRange!.min && p.price <= options.priceRange!.max
      );
    }

    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations
      .filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      )
      .slice(0, maxResults);

    return uniqueRecommendations;
  }

  getRelatedProducts(baseProduct: Product, allProducts: Product[]): Product[] {
    const scores: RecommendationScore[] = [];

    allProducts.forEach(product => {
      if (product.id === baseProduct.id) return;

      let score = 0;
      const reasons: string[] = [];

      // Same category bonus
      if (product.category === baseProduct.category) {
        score += 30;
        reasons.push('Same category');
      }

      // Same brand bonus
      if (product.brand === baseProduct.brand) {
        score += 25;
        reasons.push('Same brand');
      }

      // Price similarity (within 50% range)
      const priceDiff = Math.abs(product.price - baseProduct.price) / baseProduct.price;
      if (priceDiff <= 0.5) {
        score += 20 * (1 - priceDiff);
        reasons.push('Similar price range');
      }

      // Tag/keyword matching
      const baseTags = this.extractTags(baseProduct);
      const productTags = this.extractTags(product);
      const commonTags = baseTags.filter(tag => productTags.includes(tag));
      
      if (commonTags.length > 0) {
        score += commonTags.length * 10;
        reasons.push(`${commonTags.length} matching features`);
      }

      // Compatibility check
      if (this.areCompatible(baseProduct, product)) {
        score += 40;
        reasons.push('Compatible products');
      }

      if (score > 10) {
        scores.push({
          productId: product.id,
          score,
          reasons,
          type: 'similar'
        });
      }
    });

    // Sort by score and return top products
    return scores
      .sort((a, b) => b.score - a.score)
      .map(score => allProducts.find(p => p.id === score.productId)!)
      .filter(Boolean);
  }

  getFrequentlyBoughtTogether(baseProduct: Product, allProducts: Product[]): Product[] {
    const complementaryScores: RecommendationScore[] = [];

    allProducts.forEach(product => {
      if (product.id === baseProduct.id) return;

      let score = 0;
      const reasons: string[] = [];

      // Complementary categories
      const complementaryCategories = this.getComplementaryCategories(baseProduct.category);
      if (complementaryCategories.includes(product.category)) {
        score += 50;
        reasons.push('Complementary category');
      }

      // Accessory detection
      if (this.isAccessory(product, baseProduct)) {
        score += 60;
        reasons.push('Compatible accessory');
      }

      // Project completion logic
      if (this.completesProject(baseProduct, product)) {
        score += 70;
        reasons.push('Completes project');
      }

      // Price complementarity (accessories typically cheaper)
      if (product.price < baseProduct.price * 0.3) {
        score += 15;
        reasons.push('Affordable add-on');
      }

      if (score > 30) {
        complementaryScores.push({
          productId: product.id,
          score,
          reasons,
          type: 'complementary'
        });
      }
    });

    return complementaryScores
      .sort((a, b) => b.score - a.score)
      .map(score => allProducts.find(p => p.id === score.productId)!)
      .filter(Boolean);
  }

  getTrendingProducts(products: Product[]): Product[] {
    // Mock trending algorithm - in real implementation this would use analytics data
    return products
      .filter(p => p.featured || p.newArrival)
      .sort((a, b) => {
        // Prioritize new arrivals and featured products
        const aScore = (a.newArrival ? 2 : 0) + (a.featured ? 1 : 0);
        const bScore = (b.newArrival ? 2 : 0) + (b.featured ? 1 : 0);
        return bScore - aScore;
      });
  }

  getPopularInCategory(products: Product[], category: string): Product[] {
    return products
      .filter(p => p.category === category)
      .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
  }

  private getPopularProducts(products: Product[]): Product[] {
    return products
      .filter(p => p.popular)
      .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
  }

  private extractTags(product: Product): string[] {
    const tags: string[] = [];
    
    // Extract from name
    const nameWords = product.name.toLowerCase().split(/\s+/);
    tags.push(...nameWords);
    
    // Extract from tags if available
    if (product.tags) {
      tags.push(...product.tags.map(tag => tag.toLowerCase()));
    }

    // Extract from specifications
    if (product.specifications) {
      Object.values(product.specifications).forEach(spec => {
        if (typeof spec === 'string') {
          tags.push(spec.toLowerCase());
        }
      });
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private areCompatible(product1: Product, product2: Product): boolean {
    // Check if products are listed as compatible
    if (product1.compatibility?.includes(product2.name) || 
        product2.compatibility?.includes(product1.name)) {
      return true;
    }

    // Check for standard compatibility patterns
    const compatibilityMap: { [key: string]: string[] } = {
      'arduino': ['sensors', 'modules', 'shields', 'jumper'],
      'raspberry-pi': ['camera', 'sensor', 'hat', 'case'],
      '3d-printer': ['filament', 'nozzle', 'bed', 'extruder'],
      'breadboard': ['jumper', 'resistor', 'led', 'sensor']
    };

    const product1Keys = this.extractTags(product1);
    const product2Keys = this.extractTags(product2);

    for (const [base, compatible] of Object.entries(compatibilityMap)) {
      if (product1Keys.includes(base)) {
        return compatible.some(comp => product2Keys.includes(comp));
      }
      if (product2Keys.includes(base)) {
        return compatible.some(comp => product1Keys.includes(comp));
      }
    }

    return false;
  }

  private getComplementaryCategories(category: string): string[] {
    const complementaryMap: { [key: string]: string[] } = {
      'electronics': ['components', 'tools', 'kits'],
      'components': ['electronics', 'tools'],
      '3d-printers': ['materials', 'tools'],
      'materials': ['3d-printers', 'tools'],
      'tools': ['electronics', 'components', 'materials'],
      'kits': ['tools', 'components']
    };

    return complementaryMap[category] || [];
  }

  private isAccessory(product: Product, baseProduct: Product): boolean {
    const accessoryKeywords = [
      'cable', 'wire', 'connector', 'adapter', 'case', 'cover',
      'mount', 'bracket', 'holder', 'stand', 'screw', 'bolt'
    ];

    const productTags = this.extractTags(product);
    return accessoryKeywords.some(keyword => 
      productTags.some(tag => tag.includes(keyword))
    );
  }

  private completesProject(baseProduct: Product, complementProduct: Product): boolean {
    // Define project completion patterns
    const projectPatterns = [
      { base: ['arduino', 'microcontroller'], complements: ['sensor', 'display', 'motor'] },
      { base: ['3d-printer'], complements: ['filament', 'bed-adhesion', 'nozzle'] },
      { base: ['breadboard'], complements: ['jumper-wires', 'resistor', 'led'] }
    ];

    const baseTags = this.extractTags(baseProduct);
    const complementTags = this.extractTags(complementProduct);

    return projectPatterns.some(pattern => {
      const hasBase = pattern.base.some(base => 
        baseTags.some(tag => tag.includes(base))
      );
      const hasComplement = pattern.complements.some(comp => 
        complementTags.some(tag => tag.includes(comp))
      );
      return hasBase && hasComplement;
    });
  }
}

// Export singleton instance
export const recommendationEngine = new SmartRecommendationEngine();

// Helper functions for easier usage
export const getRecommendations = (
  products: Product[], 
  options: RecommendationOptions
): Product[] => {
  return recommendationEngine.generateRecommendations(products, options);
};

export const getRelatedProducts = (
  baseProduct: Product, 
  allProducts: Product[], 
  maxResults: number = 6
): Product[] => {
  return recommendationEngine.getRelatedProducts(baseProduct, allProducts).slice(0, maxResults);
};

export const getFrequentlyBoughtTogether = (
  baseProduct: Product, 
  allProducts: Product[], 
  maxResults: number = 4
): Product[] => {
  return recommendationEngine.getFrequentlyBoughtTogether(baseProduct, allProducts).slice(0, maxResults);
};
