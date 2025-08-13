"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  Phone,
  Download,
  Calendar,
  MapPin,
  CreditCard,
  Star,
  ArrowRight,
  Share2,
} from "lucide-react";
import { api, type Order, formatPrice, formatDateTime } from "@/lib/api";
import { withAuth } from "@/contexts/AuthContext";

function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderData = await api.getOrder(parseInt(orderId));
        setOrder(orderData);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Order not found");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const handleShare = async () => {
    if (navigator.share && order) {
      try {
        await navigator.share({
          title: `Order ${order.order_number}`,
          text: `My order from MakrX Store`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Order link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Order Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The order you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <Link
                href="/account/orders"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "cancelled":
        return <Package className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const orderTimeline = [
    {
      status: "Order Placed",
      date: order.created_at,
      completed: true,
      description: "Your order has been received and is being processed",
    },
    {
      status: "Processing",
      date:
        order.status === "processing" ||
        order.status === "shipped" ||
        order.status === "delivered"
          ? order.updated_at
          : null,
      completed: ["processing", "shipped", "delivered"].includes(order.status),
      description: "Your order is being prepared for shipment",
    },
    {
      status: "Shipped",
      date: order.shipped_at,
      completed: ["shipped", "delivered"].includes(order.status),
      description: "Your order has been shipped and is on its way",
    },
    {
      status: "Delivered",
      date: order.delivered_at,
      completed: order.status === "delivered",
      description: "Your order has been delivered successfully",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your order. We've received your payment and will begin
            processing your order soon.
          </p>
          <p className="text-sm text-gray-500">
            Order #{order.order_number} • Placed on{" "}
            {formatDateTime(order.created_at)}
          </p>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Status
            </h2>
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
              >
                {getStatusIcon(order.status)}
                <span className="ml-2 capitalize">{order.status}</span>
              </span>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {orderTimeline.map((item, index) => (
              <div key={index} className="flex items-start">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    item.completed
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${item.completed ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {item.status}
                    </h3>
                    {item.date && (
                      <span className="text-sm text-gray-500">
                        {formatDateTime(item.date)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {order.tracking_number && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Tracking Number: {order.tracking_number}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product?.images?.[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product_name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.total_price, order.currency)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>
                    -{formatPrice(order.discount_amount, order.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {order.shipping_amount === 0
                    ? "FREE"
                    : formatPrice(order.shipping_amount, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>{formatPrice(order.tax_amount, order.currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Contact Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {order.addresses.shipping.name}
                  </p>
                  <p className="text-gray-600">
                    {order.addresses.shipping.line1}
                  </p>
                  {order.addresses.shipping.line2 && (
                    <p className="text-gray-600">
                      {order.addresses.shipping.line2}
                    </p>
                  )}
                  <p className="text-gray-600">
                    {order.addresses.shipping.city},{" "}
                    {order.addresses.shipping.state}{" "}
                    {order.addresses.shipping.postal_code}
                  </p>
                  <p className="text-gray-600">
                    {order.addresses.shipping.country}
                  </p>
                  {order.addresses.shipping.phone && (
                    <p className="text-gray-600 mt-2 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {order.addresses.shipping.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {order.payment_method || "Credit Card"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment Status: {order.payment_status}
                    </p>
                  </div>
                </div>
                {order.payment_id && (
                  <p className="text-sm text-gray-500">
                    Payment ID: {order.payment_id}
                  </p>
                )}
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Estimated Delivery
              </h2>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {order.shipping_method === "express"
                      ? "2-3 business days"
                      : order.shipping_method === "overnight"
                        ? "Next business day"
                        : "5-7 business days"}
                  </p>
                  <p className="text-sm text-gray-600">
                    From order processing date
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <Mail className="h-6 w-6 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                Confirmation Email Sent
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                We've sent a confirmation email to{" "}
                <strong>{order.email}</strong> with your order details and
                tracking information.
              </p>
              <p className="text-blue-700 text-sm">
                Can't find the email? Check your spam folder or contact our
                support team for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            What's Next?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                We'll Process Your Order
              </h3>
              <p className="text-sm text-gray-600">
                Your order will be processed and prepared for shipment within
                1-2 business days.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                Track Your Package
              </h3>
              <p className="text-sm text-gray-600">
                Once shipped, you'll receive tracking information to monitor
                your delivery.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Leave a Review</h3>
              <p className="text-sm text-gray-600">
                After delivery, share your experience to help other customers.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Orders
          </Link>

          <Link
            href="/catalog"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OrderConfirmationPage);
