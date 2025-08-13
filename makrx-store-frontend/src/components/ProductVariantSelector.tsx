"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, AlertTriangle, Package } from "lucide-react";

interface ProductVariant {
  id: number;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  sale_price?: number;
  stock_qty: number;
}

interface VariantAttribute {
  name: string;
  values: Array<{
    value: string;
    label: string;
    available: boolean;
    count: number;
  }>;
}

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null, selectedAttributes: Record<string, string>) => void;
  basePrice: number;
  currency?: string;
  className?: string;
}

export default function ProductVariantSelector({
  variants,
  onVariantChange,
  basePrice,
  currency = "INR",
  className = "",
}: ProductVariantSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Extract available attributes and their values from variants
  const availableAttributes = useMemo(() => {
    const attributeMap = new Map<string, Set<string>>();
    
    variants.forEach((variant) => {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!attributeMap.has(key)) {
          attributeMap.set(key, new Set());
        }
        attributeMap.get(key)!.add(value);
      });
    });

    const result: VariantAttribute[] = [];
    attributeMap.forEach((values, attributeName) => {
      const attributeValues = Array.from(values).map((value) => {
        // Count how many variants have this attribute value
        const count = variants.filter(
          (v) => v.attributes[attributeName] === value
        ).length;
        
        // Check if this value is available given current selections
        const available = variants.some((variant) => {
          if (variant.attributes[attributeName] !== value) return false;
          
          // Check if this variant is compatible with current selections
          return Object.entries(selectedAttributes).every(([selectedKey, selectedValue]) => {
            if (selectedKey === attributeName) return true;
            return variant.attributes[selectedKey] === selectedValue;
          });
        });

        return {
          value,
          label: value,
          available,
          count,
        };
      });

      result.push({
        name: attributeName,
        values: attributeValues.sort((a, b) => a.label.localeCompare(b.label)),
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [variants, selectedAttributes]);

  // Find matching variant based on selected attributes
  useEffect(() => {
    const matchingVariant = variants.find((variant) => {
      return Object.entries(selectedAttributes).every(
        ([key, value]) => variant.attributes[key] === value
      );
    });

    setSelectedVariant(matchingVariant || null);
    onVariantChange(matchingVariant || null, selectedAttributes);
  }, [selectedAttributes, variants, onVariantChange]);

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const clearAttribute = (attributeName: string) => {
    setSelectedAttributes((prev) => {
      const newAttrs = { ...prev };
      delete newAttrs[attributeName];
      return newAttrs;
    });
  };

  const clearAllSelections = () => {
    setSelectedAttributes({});
  };

  const hasSelections = Object.keys(selectedAttributes).length > 0;
  const isCompleteSelection = availableAttributes.every(
    (attr) => selectedAttributes[attr.name]
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(price);
  };

  const getDisplayPrice = () => {
    if (selectedVariant) {
      return selectedVariant.sale_price || selectedVariant.price;
    }
    return basePrice;
  };

  const getOriginalPrice = () => {
    if (selectedVariant && selectedVariant.sale_price) {
      return selectedVariant.price;
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Price Display */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatPrice(getDisplayPrice())}
        </span>
        {getOriginalPrice() && (
          <span className="text-lg text-gray-500 line-through">
            {formatPrice(getOriginalPrice()!)}
          </span>
        )}
        {selectedVariant && selectedVariant.sale_price && (
          <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-sm font-medium">
            {Math.round(
              ((selectedVariant.price - selectedVariant.sale_price) /
                selectedVariant.price) *
                100
            )}% OFF
          </span>
        )}
      </div>

      {/* Variant Selection */}
      {availableAttributes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Options
            </h3>
            {hasSelections && (
              <button
                onClick={clearAllSelections}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {availableAttributes.map((attribute) => (
            <div key={attribute.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {attribute.name.replace("_", " ")}
                </label>
                {selectedAttributes[attribute.name] && (
                  <button
                    onClick={() => clearAttribute(attribute.name)}
                    className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {attribute.values.map((option) => {
                  const isSelected = selectedAttributes[attribute.name] === option.value;
                  const isDisabled = !option.available;
                  
                  return (
                    <button
                      key={option.value}
                      disabled={isDisabled}
                      onClick={() => handleAttributeChange(attribute.name, option.value)}
                      className={`
                        relative px-4 py-2 border rounded-lg text-sm font-medium transition-all
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                            : isDisabled
                            ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
                        }
                      `}
                    >
                      {isSelected && (
                        <Check className="absolute top-1 right-1 h-3 w-3 text-blue-600" />
                      )}
                      <span>{option.label}</span>
                      {!isDisabled && option.count > 1 && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({option.count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selection Status */}
      {hasSelections && (
        <div className="space-y-3">
          {/* Selected Variant Info */}
          {selectedVariant ? (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Variant Selected
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    SKU: {selectedVariant.sku}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Stock: {selectedVariant.stock_qty} units
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedVariant.stock_qty > 0
                          ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                          : "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {selectedVariant.stock_qty > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : !isCompleteSelection ? (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Please select all options
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Choose from all available options to see pricing and availability.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Combination not available
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This combination of options is not available. Please try different selections.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Variant Summary */}
      {hasSelections && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Selected Options:
          </h4>
          <div className="space-y-1">
            {Object.entries(selectedAttributes).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace("_", " ")}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for variant logic
export function useProductVariants(variants: ProductVariant[]) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const handleVariantChange = (variant: ProductVariant | null, attributes: Record<string, string>) => {
    setSelectedVariant(variant);
    setSelectedAttributes(attributes);
  };

  const canAddToCart = selectedVariant && selectedVariant.stock_qty > 0;
  const isInStock = selectedVariant ? selectedVariant.stock_qty > 0 : false;
  const currentPrice = selectedVariant ? (selectedVariant.sale_price || selectedVariant.price) : 0;

  return {
    selectedVariant,
    selectedAttributes,
    handleVariantChange,
    canAddToCart,
    isInStock,
    currentPrice,
  };
}
