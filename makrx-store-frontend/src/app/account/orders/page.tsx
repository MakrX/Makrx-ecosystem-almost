"use client";

import React, { useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import WriteReviewModal, { ReviewData } from "@/components/WriteReviewModal";
import {
  Package,
  Truck,
  Eye,
  Download,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Home,
  User,
  ShoppingCart,
  Star,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { products } from "@/data/products";

interface Order {
  id: string;
  number: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  type: "product" | "service";
  total: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    sku?: string;
    hasReview?: boolean; // Track if user has reviewed this item
  }>;
  trackingNumber?: string;
  serviceProvider?: string;
  estimatedDelivery?: string;
}

export default function AccountOrdersPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    item: Order['items'][0];
    orderId: string;
  } | null>(null);

  // Track submitted reviews (in real app, this would be stored in database)
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());

  // Handle review submission
  const handleReviewSubmit = async (reviewData: ReviewData) => {
    // In real app, this would submit to API
    console.log("Submitting review:", reviewData);

    // Add to submitted reviews set
    const reviewKey = `${reviewData.orderId}-${reviewData.itemId}`;
    setSubmittedReviews(prev => new Set([...prev, reviewKey]));

    // Close modal
    setIsReviewModalOpen(false);
    setSelectedReviewItem(null);

    // Here you would typically make an API call to submit the review
    // await api.submitReview(reviewData);
  };

  const openReviewModal = (item: Order['items'][0], orderId: string) => {
    setSelectedReviewItem({ item, orderId });
    setIsReviewModalOpen(true);
  };

  const hasUserReviewed = (orderId: string, itemId: string) => {
    return submittedReviews.has(`${orderId}-${itemId}`);
  };

  // Mock orders data - mix of product and service orders
  const allOrders: Order[] = [
    {
      id: "1",
      number: "ORD-2024-001",
      date: "2024-01-15T10:30:00Z",
      status: "delivered",
      type: "product",
      total: 1299.99,
      items: [
        {
          id: "1",
          name: products[0].name,
          image: products[0].images[0],
          quantity: 1,
          price: products[0].price,
          sku: products[0].sku,
        },
      ],
      trackingNumber: "TRK123456789",
      estimatedDelivery: "2024-01-18",
    },
    {
      id: "2",
      number: "SRV-2024-002",
      date: "2024-01-12T14:20:00Z",
      status: "processing",
      type: "service",
      total: 45.99,
      items: [
        {
          id: "2",
          name: "3D Printing Service - custom-bracket.stl",
          image: "https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=Service",
          quantity: 1,
          price: 45.99,
        },
      ],
      serviceProvider: "MakerLab SF",
      estimatedDelivery: "2024-01-16",
    },
    {
      id: "3",
      number: "ORD-2024-003",
      date: "2024-01-10T09:15:00Z",
      status: "shipped",
      type: "product",
      total: 187.48,
      items: [
        {
          id: "3",
          name: products[3].name,
          image: products[3].images[0],
          quantity: 3,
          price: products[3].price,
          sku: products[3].sku,
        },
        {
          id: "4",
          name: products[4].name,
          image: products[4].images[0],
          quantity: 2,
          price: products[4].price,
          sku: products[4].sku,
        },
      ],
      trackingNumber: "TRK987654321",
      estimatedDelivery: "2024-01-14",
    },
    {
      id: "4",
      number: "ORD-2024-004",
      date: "2024-01-08T16:45:00Z",
      status: "delivered",
      type: "product",
      total: 89.99,
      items: [
        {
          id: "5",
          name: products[4].name,
          image: products[4].images[0],
          quantity: 1,
          price: products[4].price,
          sku: products[4].sku,
        },
      ],
      trackingNumber: "TRK456789123",
    },
    {
      id: "5",
      number: "SRV-2024-005",
      date: "2024-01-05T11:30:00Z",
      status: "delivered",
      type: "service",
      total: 125.0,
      items: [
        {
          id: "6",
          name: "CNC Machining Service - aluminum-part.step",
          image: "https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=Service",
          quantity: 1,
          price: 125.0,
        },
      ],
      serviceProvider: "Precision Works",
      estimatedDelivery: "2024-01-09",
    },
    {
      id: "6",
      number: "ORD-2024-006",
      date: "2024-01-02T13:20:00Z",
      status: "cancelled",
      type: "product",
      total: 299.99,
      items: [
        {
          id: "7",
          name: products[2].name,
          image: products[2].images[0],
          quantity: 1,
          price: products[2].price,
          sku: products[2].sku,
        },
      ],
    },
  ];

  // Filter orders
  const filteredOrders = allOrders.filter((order) => {
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "products" && order.type === "product") ||
      (selectedFilter === "services" && order.type === "service") ||
      order.status === selectedFilter;

    const matchesSearch =
      searchQuery === "" ||
      order.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const filterOptions = [
    { value: "all", label: "All Orders", count: allOrders.length },
    {
      value: "products",
      label: "Products",
      count: allOrders.filter((o) => o.type === "product").length,
    },
    {
      value: "services",
      label: "Services",
      count: allOrders.filter((o) => o.type === "service").length,
    },
    {
      value: "delivered",
      label: "Delivered",
      count: allOrders.filter((o) => o.status === "delivered").length,
    },
    {
      value: "shipped",
      label: "Shipped",
      count: allOrders.filter((o) => o.status === "shipped").length,
    },
    {
      value: "processing",
      label: "Processing",
      count: allOrders.filter((o) => o.status === "processing").length,
    },
  ];

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

  const getTypeIcon = (type: string) => {
    return type === "service" ? "⚡" : "📦";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <span>Orders</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-store-text">
                Your Orders
              </h1>
              <p className="text-store-text-muted mt-1">
                {filteredOrders.length} order
                {filteredOrders.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/account">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/catalog">
                <Button size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Shop More
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by number or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-store-primary focus:border-store-primary"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFilter === option.value
                        ? "bg-store-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {paginatedOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-store-text mb-2">
                No orders found
              </h3>
              <p className="text-store-text-muted mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria."
                  : "You haven't placed any orders yet."}
              </p>
              <Link href="/catalog">
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getTypeIcon(order.type)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-store-text">
                            {order.number}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-store-text-muted mt-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Ordered {formatDate(order.date)}
                          {order.estimatedDelivery &&
                            order.status !== "delivered" &&
                            order.status !== "cancelled" && (
                              <span>
                                {" "}
                                • Est. delivery{" "}
                                {formatDate(order.estimatedDelivery)}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-store-text">
                        ${order.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-store-text-muted">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-store-text text-sm line-clamp-1">
                            {item.name}
                          </div>
                          {item.sku && (
                            <div className="text-xs text-store-text-muted">
                              SKU: {item.sku}
                            </div>
                          )}
                          <div className="text-xs text-store-text-muted">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </div>
                        </div>

                        {/* Individual Review Button for Delivered Items */}
                        {order.status === "delivered" && order.type === "product" && (
                          <div className="flex-shrink-0">
                            {hasUserReviewed(order.id, item.id) ? (
                              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                <Star className="h-3 w-3 fill-current" />
                                Reviewed
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReviewModal(item, order.id)}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Service Provider Info */}
                  {order.serviceProvider && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-800">
                        <strong>Service Provider:</strong>{" "}
                        {order.serviceProvider}
                      </div>
                    </div>
                  )}

                  {/* Tracking Info */}
                  {order.trackingNumber && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-blue-800">
                          <Truck className="h-4 w-4 inline mr-1" />
                          <strong>Tracking:</strong> {order.trackingNumber}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Track Package
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Link href={`/account/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Invoice
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === "delivered" && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reorder
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Support
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    size="sm"
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedReviewItem && (
        <WriteReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedReviewItem(null);
          }}
          item={selectedReviewItem.item}
          orderId={selectedReviewItem.orderId}
          onSubmit={handleReviewSubmit}
        />
      )}
    </Layout>
  );
}
