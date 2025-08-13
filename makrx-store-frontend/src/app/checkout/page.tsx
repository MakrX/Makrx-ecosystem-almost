"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  Truck,
  Shield,
  Lock,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  ArrowLeft,
  Check,
  AlertCircle,
  Gift,
} from "lucide-react";
import { api, type Cart, type Address, formatPrice } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { withAuth } from "@/contexts/AuthContext";

interface CheckoutStep {
  id: string;
  title: string;
  completed: boolean;
}

function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Form data
  const [billingAddress, setBillingAddress] = useState<Address>({
    name: user?.name || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    phone: "",
  });

  const [shippingAddress, setShippingAddress] = useState<Address>({
    name: user?.name || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    phone: "",
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderNotes, setOrderNotes] = useState("");

  const steps: CheckoutStep[] = [
    { id: "contact", title: "Contact & Shipping", completed: false },
    { id: "method", title: "Shipping Method", completed: false },
    { id: "payment", title: "Payment", completed: false },
  ];

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartData = await api.getCart();
        setCart(cartData);

        if (!cartData || cartData.items.length === 0) {
          router.push("/cart");
          return;
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        router.push("/cart");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [router]);

  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Shipping",
      description: "5-7 business days",
      price: cart && cart.subtotal >= 75 ? 0 : 5.99,
      estimated: "5-7 business days",
    },
    {
      id: "express",
      name: "Express Shipping",
      description: "2-3 business days",
      price: 12.99,
      estimated: "2-3 business days",
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      description: "Next business day",
      price: 24.99,
      estimated: "Next business day",
    },
  ];

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Contact & Shipping
        return (
          billingAddress.name.trim() !== "" &&
          billingAddress.line1.trim() !== "" &&
          billingAddress.city.trim() !== "" &&
          billingAddress.state.trim() !== "" &&
          billingAddress.postal_code.trim() !== "" &&
          billingAddress.phone.trim() !== "" &&
          (sameAsBilling ||
            (shippingAddress.name.trim() !== "" &&
              shippingAddress.line1.trim() !== "" &&
              shippingAddress.city.trim() !== "" &&
              shippingAddress.state.trim() !== "" &&
              shippingAddress.postal_code.trim() !== ""))
        );
      case 1: // Shipping Method
        return shippingMethod !== "";
      case 2: // Payment
        return paymentMethod !== "";
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      alert("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const applyCoupon = () => {
    if (!couponCode.trim() || !cart) return;

    // Simulate coupon validation
    if (couponCode.toUpperCase() === "SAVE10") {
      const discount = cart.subtotal * 0.1;
      setCouponDiscount(discount);
      alert("Coupon applied successfully!");
    } else {
      alert("Invalid coupon code");
    }
  };

  const processOrder = async () => {
    if (!cart || !validateStep(2)) {
      alert("Please complete all required fields");
      return;
    }

    setProcessing(true);
    try {
      const finalShippingAddress = sameAsBilling
        ? billingAddress
        : shippingAddress;

      const orderData = {
        shipping_address: finalShippingAddress,
        billing_address: billingAddress,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
        notes: orderNotes || undefined,
      };

      const response = await api.checkout(orderData);

      // In a real implementation, handle payment processing here
      // For now, simulate success
      setTimeout(() => {
        router.push(`/order/confirmation/${response.order_id}`);
      }, 2000);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null; // Will redirect in useEffect
  }

  const selectedShipping = shippingOptions.find(
    (option) => option.id === shippingMethod,
  );
  const shippingCost = selectedShipping?.price || 0;
  const tax = cart.subtotal * 0.08; // 8% tax
  const total = cart.subtotal - couponDiscount + shippingCost + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/cart")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index <= currentStep
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-300"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    index <= currentStep ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      index < currentStep ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              {/* Step 1: Contact & Shipping */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Contact Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={billingAddress.name}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={billingAddress.phone}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mt-8">
                    Billing Address
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={billingAddress.line1}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            line1: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        value={billingAddress.line2}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            line2: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) =>
                            setBillingAddress((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          value={billingAddress.state}
                          onChange={(e) =>
                            setBillingAddress((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={billingAddress.postal_code}
                          onChange={(e) =>
                            setBillingAddress((prev) => ({
                              ...prev,
                              postal_code: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => setSameAsBilling(e.target.checked)}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Shipping address same as billing address
                      </span>
                    </label>
                  </div>

                  {!sameAsBilling && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Shipping Address
                      </h3>
                      {/* Similar form fields for shipping address */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.name}
                            onChange={(e) =>
                              setShippingAddress((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={shippingAddress.phone}
                            onChange={(e) =>
                              setShippingAddress((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.line1}
                            onChange={(e) =>
                              setShippingAddress((prev) => ({
                                ...prev,
                                line1: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apartment, suite, etc. (optional)
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.line2}
                            onChange={(e) =>
                              setShippingAddress((prev) => ({
                                ...prev,
                                line2: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.city}
                              onChange={(e) =>
                                setShippingAddress((prev) => ({
                                  ...prev,
                                  city: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State *
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.state}
                              onChange={(e) =>
                                setShippingAddress((prev) => ({
                                  ...prev,
                                  state: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ZIP Code *
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.postal_code}
                              onChange={(e) =>
                                setShippingAddress((prev) => ({
                                  ...prev,
                                  postal_code: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Shipping Method */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Shipping Method
                  </h2>

                  <div className="space-y-4">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={shippingMethod === option.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="mr-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {option.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {option.price === 0
                                  ? "FREE"
                                  : formatPrice(option.price, cart.currency)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {option.estimated}
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {cart.subtotal < 75 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Truck className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-blue-800 text-sm">
                          Add {formatPrice(75 - cart.subtotal, cart.currency)}{" "}
                          more to qualify for free standard shipping
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4"
                      />
                      <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">
                        Credit/Debit Card
                      </span>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4"
                      />
                      <div className="w-5 h-5 bg-blue-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold">
                        P
                      </div>
                      <span className="font-medium text-gray-900">PayPal</span>
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-4">
                        Payment processing will be handled securely by our
                        payment partner.
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Lock className="h-4 w-4 mr-2" />
                        SSL encrypted and PCI compliant
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (optional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Special instructions for your order..."
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={processOrder}
                    disabled={processing}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Complete Order"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product?.images[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.product?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(item.total_price, cart.currency)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(cart.subtotal, cart.currency)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <Gift className="h-4 w-4 mr-1" />
                      Discount
                    </span>
                    <span className="font-medium">
                      -{formatPrice(couponDiscount, cart.currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0
                      ? "FREE"
                      : formatPrice(shippingCost, cart.currency)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatPrice(tax, cart.currency)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(total, cart.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Secure SSL encryption</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  <span>Safe & secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CheckoutPage);
