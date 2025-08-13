"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  CreditCard,
  Download,
  RefreshCw,
  MessageCircle,
  Star,
  ExternalLink,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  AlertTriangle,
  Copy,
  Home,
  ArrowRight,
  User,
} from "lucide-react";
import { products } from "@/data/products";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // Mock order data - in real app this would come from API
  const order = {
    id: orderId,
    number: `ORD-2024-${orderId.padStart(3, "0")}`,
    type: "product" as const,
    status: "shipped" as const,
    date: "2024-01-15T10:30:00Z",
    estimatedDelivery: "2024-01-18T00:00:00Z",
    actualDelivery: null,
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
    },
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      apartment: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "United States",
    },
    billingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      apartment: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "United States",
    },
    items: [
      {
        id: "1",
        product: products[0],
        quantity: 1,
        price: products[0].price,
        status: "shipped",
      },
      {
        id: "2",
        product: products[3],
        quantity: 2,
        price: products[3].price,
        status: "shipped",
      },
    ],
    payment: {
      method: "Credit Card",
      last4: "4242",
      brand: "Visa",
      amount: 1165.97,
    },
    shipping: {
      method: "Standard Shipping",
      cost: 0,
      carrier: "FedEx",
      trackingNumber: "TRK123456789",
      trackingUrl: "https://fedex.com/track?number=TRK123456789",
    },
    timeline: [
      {
        status: "Order Placed",
        date: "2024-01-15T10:30:00Z",
        description: "Your order has been received and is being processed",
        completed: true,
      },
      {
        status: "Payment Confirmed",
        date: "2024-01-15T10:32:00Z",
        description: "Payment has been successfully processed",
        completed: true,
      },
      {
        status: "Order Processing",
        date: "2024-01-15T14:20:00Z",
        description: "Items are being prepared for shipment",
        completed: true,
      },
      {
        status: "Shipped",
        date: "2024-01-16T09:15:00Z",
        description: "Package has been shipped via FedEx",
        completed: true,
      },
      {
        status: "Out for Delivery",
        date: null,
        description: "Package is out for delivery",
        completed: false,
      },
      {
        status: "Delivered",
        date: null,
        description: "Package has been delivered",
        completed: false,
      },
    ],
    subtotal: 1131.97,
    tax: 90.56,
    shippingCost: 0,
    discountAmount: 56.56,
    total: 1165.97,
    notes: "Please leave package at front door if no one is available.",
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-800 bg-green-100";
      case "shipped":
        return "text-blue-800 bg-blue-100";
      case "processing":
        return "text-yellow-800 bg-yellow-100";
      case "pending":
        return "text-gray-800 bg-gray-100";
      case "cancelled":
        return "text-red-800 bg-red-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(order.shipping.trackingNumber);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-store-text-muted mb-4">
            <Link href="/" className="hover:text-store-primary">
              <Home className="h-4 w-4" />
            </Link>
            <ArrowRight className="h-3 w-3" />
            <Link href="/account" className="hover:text-store-primary">
              Account
            </Link>
            <ArrowRight className="h-3 w-3" />
            <Link href="/account/orders" className="hover:text-store-primary">
              Orders
            </Link>
            <ArrowRight className="h-3 w-3" />
            <span>{order.number}</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link href="/account/orders">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-store-text">
                Order {order.number}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="text-store-text-muted">
                  Placed {formatDate(order.date)}
                </span>
                <span className="text-store-text-muted">
                  ${order.total.toFixed(2)} total
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Invoice
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reorder
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-store-text mb-6">
                  Order Timeline
                </h2>
                <div className="space-y-6">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          event.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-gray-100 border-gray-300 text-gray-400"
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <div className="w-2 h-2 bg-current rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`font-medium ${event.completed ? "text-store-text" : "text-gray-400"}`}
                          >
                            {event.status}
                          </h3>
                          <span
                            className={`text-sm ${event.completed ? "text-store-text-muted" : "text-gray-400"}`}
                          >
                            {formatDate(event.date)}
                          </span>
                        </div>
                        <p
                          className={`text-sm mt-1 ${event.completed ? "text-store-text-muted" : "text-gray-400"}`}
                        >
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Information */}
              {order.shipping.trackingNumber && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-store-text mb-4 flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-store-text mb-2">
                        Tracking Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-store-text-muted">
                            Carrier:
                          </span>
                          <span className="text-store-text">
                            {order.shipping.carrier}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-store-text-muted">Method:</span>
                          <span className="text-store-text">
                            {order.shipping.method}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-store-text-muted">
                            Tracking Number:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-store-text font-mono">
                              {order.shipping.trackingNumber}
                            </span>
                            <button
                              onClick={copyTrackingNumber}
                              className="text-store-primary hover:text-store-primary-dark"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-store-text mb-2">
                        Delivery Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-store-text-muted">
                            Estimated Delivery:
                          </span>
                          <span className="text-store-text">
                            {formatDate(order.estimatedDelivery)}
                          </span>
                        </div>
                        {order.actualDelivery && (
                          <div className="flex justify-between">
                            <span className="text-store-text-muted">
                              Actual Delivery:
                            </span>
                            <span className="text-store-text">
                              {formatDate(order.actualDelivery)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Track Package with {order.shipping.carrier}
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-store-text mb-6">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-store-text mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-store-text-muted mb-2">
                          SKU: {item.product.sku}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-store-text-muted">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-store-text-muted">
                            Price: ${item.price.toFixed(2)} each
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-store-text">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Link href={`/product/${item.product.id}`}>
                            <Button variant="outline" size="sm">
                              View Product
                            </Button>
                          </Link>
                          {order.status === "delivered" && (
                            <Button variant="outline" size="sm">
                              <Star className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {order.notes && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-store-text mb-4">
                    Special Instructions
                  </h2>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <p className="text-yellow-800">{order.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-store-text mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-store-text-muted">Subtotal</span>
                    <span className="text-store-text">
                      ${order.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-store-text-muted">Shipping</span>
                    <span className="text-store-text">
                      {order.shippingCost === 0
                        ? "FREE"
                        : `$${order.shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-store-text-muted">Tax</span>
                    <span className="text-store-text">
                      ${order.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-store-text">
                        Total
                      </span>
                      <span className="font-bold text-store-text">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-store-text mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="text-sm text-store-text-muted space-y-1">
                  <p className="font-medium text-store-text">
                    {order.shippingAddress.name}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  {order.shippingAddress.apartment && (
                    <p>{order.shippingAddress.apartment}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-store-text mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium text-store-text">
                      {order.payment.brand} •••• {order.payment.last4}
                    </p>
                    <p className="text-sm text-store-text-muted">
                      Charged ${order.payment.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-store-text mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-store-text-muted" />
                    <span className="text-store-text">
                      {order.customer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-store-text-muted" />
                    <span className="text-store-text">
                      {order.customer.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-store-text mb-4">
                  Need Help?
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Return or Exchange
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report an Issue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
