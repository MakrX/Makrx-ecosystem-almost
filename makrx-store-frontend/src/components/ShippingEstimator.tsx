"use client";

import { useState, useEffect } from "react";
import { MapPin, Truck, Package, Clock, Calculator } from "lucide-react";

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier: string;
  icon: JSX.Element;
}

interface TaxInfo {
  rate: number;
  amount: number;
  jurisdiction: string;
}

interface ShippingEstimatorProps {
  subtotal: number;
  weight?: number;
  items?: Array<{
    id: number;
    quantity: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }>;
  onShippingChange: (option: ShippingOption | null) => void;
  onTaxChange: (tax: TaxInfo | null) => void;
  className?: string;
}

export default function ShippingEstimator({
  subtotal,
  weight = 0,
  items = [],
  onShippingChange,
  onTaxChange,
  className = "",
}: ShippingEstimatorProps) {
  const [pincode, setPincode] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [taxInfo, setTaxInfo] = useState<TaxInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate shipping rates based on location and cart contents
  const calculateShipping = async (pincode: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call for shipping calculation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const totalWeight = weight || items.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0);
      const baseShippingCost = Math.max(50, totalWeight * 10);

      const options: ShippingOption[] = [
        {
          id: "standard",
          name: "Standard Shipping",
          description: "Delivered by India Post",
          price: subtotal >= 500 ? 0 : baseShippingCost,
          estimatedDays: "5-7 business days",
          carrier: "India Post",
          icon: <Package className="h-5 w-5" />,
        },
        {
          id: "express",
          name: "Express Shipping",
          description: "Delivered by BlueDart",
          price: baseShippingCost + 100,
          estimatedDays: "2-3 business days",
          carrier: "BlueDart",
          icon: <Truck className="h-5 w-5" />,
        },
        {
          id: "overnight",
          name: "Overnight Delivery",
          description: "Next business day delivery",
          price: baseShippingCost + 250,
          estimatedDays: "1 business day",
          carrier: "FedEx",
          icon: <Clock className="h-5 w-5" />,
        },
      ];

      // Calculate tax based on pincode (simplified GST calculation)
      const stateFromPincode = getStateFromPincode(pincode);
      const gstRate = stateFromPincode === "DL" ? 0.18 : 0.18; // 18% GST
      const taxAmount = subtotal * gstRate;

      const tax: TaxInfo = {
        rate: gstRate,
        amount: taxAmount,
        jurisdiction: `${stateFromPincode} - GST`,
      };

      setShippingOptions(options);
      setTaxInfo(tax);
      onTaxChange(tax);

      // Auto-select the cheapest option
      const cheapestOption = options.reduce((min, option) => 
        option.price < min.price ? option : min
      );
      setSelectedShipping(cheapestOption);
      onShippingChange(cheapestOption);

    } catch (err) {
      setError("Failed to calculate shipping rates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSelect = (option: ShippingOption) => {
    setSelectedShipping(option);
    onShippingChange(option);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      calculateShipping(pincode);
    } else {
      setError("Please enter a valid 6-digit pincode");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pincode Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delivery Location
          </h3>
        </div>
        
        <form onSubmit={handlePincodeSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g., 110001"
                maxLength={6}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || pincode.length !== 6}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Calculating..." : "Check"}
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </form>
      </div>

      {/* Shipping Options */}
      {shippingOptions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Shipping Options
          </h3>
          
          <div className="space-y-3">
            {shippingOptions.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedShipping?.id === option.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onClick={() => handleShippingSelect(option)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 dark:text-blue-400">
                      {option.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {option.name}
                        </h4>
                        {option.price === 0 && (
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded text-xs font-medium">
                            FREE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description} • {option.estimatedDays}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {option.price === 0 ? "FREE" : formatPrice(option.price)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      via {option.carrier}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Free Shipping Threshold */}
          {subtotal < 500 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Add {formatPrice(500 - subtotal)} more to qualify for free standard shipping!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tax Information */}
      {taxInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tax Calculation
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {taxInfo.jurisdiction} ({(taxInfo.rate * 100).toFixed(1)}%)
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPrice(taxInfo.amount)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Taxes are calculated based on your delivery location and may vary for different items.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to determine state from pincode (simplified)
function getStateFromPincode(pincode: string): string {
  const firstDigit = pincode.charAt(0);
  const stateMap: { [key: string]: string } = {
    "1": "DL", // Delhi
    "2": "HR", // Haryana/Punjab
    "3": "RJ", // Rajasthan
    "4": "GJ", // Gujarat
    "5": "MH", // Maharashtra
    "6": "KA", // Karnataka
    "7": "AP", // Andhra Pradesh
    "8": "WB", // West Bengal
    "9": "TN", // Tamil Nadu
  };
  return stateMap[firstDigit] || "IN";
}

// Hook for managing cart calculations
export function useCartCalculations() {
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(0);

  const handleShippingChange = (option: ShippingOption | null) => {
    setShippingCost(option?.price || 0);
  };

  const handleTaxChange = (tax: TaxInfo | null) => {
    setTaxAmount(tax?.amount || 0);
  };

  const handleDiscountChange = (discount: number) => {
    setDiscountAmount(discount);
  };

  // Recalculate total whenever any component changes
  useEffect(() => {
    const newTotal = subtotal + shippingCost + taxAmount - discountAmount;
    setTotal(Math.max(0, newTotal));
  }, [subtotal, shippingCost, taxAmount, discountAmount]);

  return {
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    total,
    setSubtotal,
    handleShippingChange,
    handleTaxChange,
    handleDiscountChange,
  };
}
