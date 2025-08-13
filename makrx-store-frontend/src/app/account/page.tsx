"use client";

import React from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import {
  User,
  Package,
  CreditCard,
  MapPin,
  Heart,
  Settings,
  Truck,
  ShoppingCart,
  DollarSign,
  Calendar,
  ArrowRight,
  Star,
  Download,
  RefreshCw,
  Bell,
  Gift,
  Zap,
  Bookmark,
} from "lucide-react";
import { products } from "@/data/products";

export default function AccountDashboard() {
  // Mock user data - in real app this would come from auth context
  const user = {
    name: "John Doe",
    email: "john@example.com",
    memberSince: "2023-01-15",
    profileImage: "https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=User",
    tier: "Maker Pro",
    points: 1250,
  };

  // Mock recent orders
  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 299.99,
      items: 3,
      trackingNumber: "TRK123456789",
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "shipped",
      total: 89.5,
      items: 2,
      trackingNumber: "TRK987654321",
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "processing",
      total: 1299.0,
      items: 1,
      trackingNumber: null,
    },
  ];

  // Mock service orders (3D printing, etc.)
  const serviceOrders = [
    {
      id: "SRV-001",
      type: "3D Printing",
      fileName: "custom-bracket.stl",
      status: "printing",
      price: 45.99,
      date: "2024-01-12",
      estimatedCompletion: "2024-01-16",
    },
    {
      id: "SRV-002",
      type: "CNC Machining",
      fileName: "aluminum-part.step",
      status: "completed",
      price: 125.0,
      date: "2024-01-08",
      estimatedCompletion: "2024-01-14",
    },
  ];

  // Mock wishlist items
  const wishlistItems = [
    { id: "1", product: products[1] },
    { id: "2", product: products[2] },
    { id: "3", product: products[4] },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-800 bg-green-100";
      case "shipped":
        return "text-blue-800 bg-blue-100";
      case "processing":
        return "text-yellow-800 bg-yellow-100";
      case "printing":
        return "text-purple-800 bg-purple-100";
      case "completed":
        return "text-green-800 bg-green-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const stats = [
    {
      title: "Total Orders",
      value: "23",
      icon: Package,
      color: "bg-blue-500",
      subtext: "This year",
    },
    {
      title: "Total Spent",
      value: "₹2,36,301",
      icon: DollarSign,
      color: "bg-green-500",
      subtext: "Lifetime",
    },
    {
      title: "Service Jobs",
      value: "8",
      icon: Zap,
      color: "bg-purple-500",
      subtext: "3D printing & CNC",
    },
    {
      title: "Maker Points",
      value: user.points.toLocaleString(),
      icon: Star,
      color: "bg-yellow-500",
      subtext: "₹1,038 value",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-store-text">
                  Account Dashboard
                </h1>
                <p className="text-store-text-muted mt-1">
                  Welcome back, {user.name.split(" ")[0]}!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Link href="/account/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-store-primary to-store-secondary rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-16 h-16 rounded-full border-2 border-white/20"
                />
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-white/80">{user.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {user.tier}
                    </span>
                    <span className="text-sm text-white/80">
                      Member since {new Date(user.memberSince).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-white/80">Maker Points</div>
                <div className="text-sm text-white/60">
                  ≈ ${(user.points * 0.01).toFixed(2)} value
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-store-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-store-text font-medium mb-1">
                    {stat.title}
                  </div>
                  <div className="text-sm text-store-text-muted">
                    {stat.subtext}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-store-text">
                    Recent Orders
                  </h3>
                  <Link href="/account/orders">
                    <Button variant="outline" size="sm">
                      View All Orders
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-store-text">
                            Order {order.id}
                          </div>
                          <div className="text-sm text-store-text-muted">
                            {new Date(order.date).toLocaleDateString()} •{" "}
                            {order.items} items
                          </div>
                          {order.trackingNumber && (
                            <div className="text-xs text-store-primary">
                              Tracking: {order.trackingNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-store-text">
                          ${order.total.toFixed(2)}
                        </div>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Orders */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-store-text">
                    Service Orders
                  </h3>
                  <Link href="/orders">
                    <Button variant="outline" size="sm">
                      View All Services
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {serviceOrders.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Zap className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-store-text">
                            {service.type}
                          </div>
                          <div className="text-sm text-store-text-muted">
                            {service.fileName}
                          </div>
                          <div className="text-xs text-store-text-muted">
                            {service.status === "completed"
                              ? "Completed"
                              : `Est. completion: ${new Date(service.estimatedCompletion).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-store-text">
                          ${service.price.toFixed(2)}
                        </div>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}
                        >
                          {service.status.charAt(0).toUpperCase() +
                            service.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-purple-900">
                        Upload for 3D Printing
                      </h4>
                      <p className="text-sm text-purple-700">
                        Get instant quotes for your STL files
                      </p>
                    </div>
                    <Link href="/3d-printing">
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Upload Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-store-text mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link href="/account/orders">
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      Track Orders
                    </Button>
                  </Link>
                  <Link href="/3d-printing">
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Upload for 3D Print
                    </Button>
                  </Link>
                  <Link href="/account/orders">
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reorder Items
                    </Button>
                  </Link>
                  <Link href="/account/saved-carts">
                    <Button variant="outline" className="w-full justify-start">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Saved Carts
                    </Button>
                  </Link>
                  <Link href="/account/payment-methods">
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment Methods
                    </Button>
                  </Link>
                  <Link href="/catalog">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Browse Catalog
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Wishlist Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-store-text">
                    Wishlist
                  </h3>
                  <Link
                    href="/account/wishlist"
                    className="text-store-primary hover:text-store-primary-dark text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-3">
                  {wishlistItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-store-text text-sm line-clamp-1">
                          {item.product.name}
                        </div>
                        <div className="text-sm font-semibold text-store-primary">
                          ${item.product.price}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {wishlistItems.length === 0 && (
                  <div className="text-center py-6">
                    <Heart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-store-text-muted text-sm">
                      Your wishlist is empty
                    </p>
                  </div>
                )}
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-store-text mb-4">
                  Account Settings
                </h3>
                <div className="space-y-3">
                  <Link href="/account/settings">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Button>
                  </Link>
                  <Link href="/account/addresses">
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      Addresses
                    </Button>
                  </Link>
                  <Link href="/account/payments">
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment Methods
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Maker Points */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Star className="h-6 w-6 mr-2" />
                  <h3 className="text-lg font-semibold">Maker Points</h3>
                </div>
                <div className="text-2xl font-bold mb-2">
                  {user.points.toLocaleString()}
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Earn points with every purchase and redeem for discounts!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Redeem Points
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
