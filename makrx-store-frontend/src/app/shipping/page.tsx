"use client";

import Link from "next/link";
import { Truck, Clock, MapPin, Package, Shield, ArrowLeft } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Shipping Information</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Shipping Information
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Fast, reliable shipping for makers worldwide. Get your tools and materials delivered when you need them.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
            <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Free Shipping</h3>
            <p className="text-gray-600 dark:text-gray-400">Orders over ₹6,225</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
            <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">1-3 Days</h3>
            <p className="text-gray-600 dark:text-gray-400">Express delivery</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
            <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">PAN India</h3>
            <p className="text-gray-600 dark:text-gray-400">Nationwide coverage</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Shipping Methods */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Package className="h-6 w-6 mr-3 text-blue-600" />
              Shipping Methods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Standard Shipping</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Delivery in 3-7 business days</li>
                  <li>• ₹99 shipping fee (Free over ₹6,225)</li>
                  <li>• Available across India</li>
                  <li>• Package tracking included</li>
                </ul>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Express Shipping</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Delivery in 1-3 business days</li>
                  <li>• ₹249 shipping fee</li>
                  <li>• Available in major cities</li>
                  <li>• Priority handling & tracking</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Shipping Zones */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Shipping Zones & Timeframes</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Zone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Cities/States</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Standard</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Express</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400">
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">Zone 1</td>
                    <td className="py-3 px-4">Mumbai, Delhi, Bangalore, Chennai</td>
                    <td className="py-3 px-4">2-3 days</td>
                    <td className="py-3 px-4">1-2 days</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">Zone 2</td>
                    <td className="py-3 px-4">Major metro cities</td>
                    <td className="py-3 px-4">3-5 days</td>
                    <td className="py-3 px-4">2-3 days</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">Zone 3</td>
                    <td className="py-3 px-4">Other cities & towns</td>
                    <td className="py-3 px-4">5-7 days</td>
                    <td className="py-3 px-4">Not available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Special Items */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Special Item Shipping</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Heavy Items (&gt;20kg)</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• 3D printers, large tools</li>
                  <li>• Freight shipping required</li>
                  <li>• 5-10 business days</li>
                  <li>• Installation support available</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Hazardous Materials</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Chemicals, solvents, batteries</li>
                  <li>• Ground shipping only</li>
                  <li>• 7-14 business days</li>
                  <li>• Special handling fees apply</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Order Tracking */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-green-600" />
              Order Tracking & Security
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                All orders include real-time tracking from dispatch to delivery. You&apos;ll receive:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• Order confirmation email with tracking number</li>
                <li>• SMS updates at key delivery milestones</li>
                <li>• Package photos upon delivery</li>
                <li>• Delivery confirmation with digital signature</li>
              </ul>
              <p className="mt-4">
                Track your orders anytime at <Link href="/track" className="text-blue-600 dark:text-blue-400 hover:underline">makrx.store/track</Link>
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Can I change my shipping address after ordering?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Address changes are possible within 2 hours of placing your order. Contact our support team immediately if you need to make changes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Do you ship to remote areas?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We ship to most PIN codes across India. Remote locations may require additional 2-3 days for delivery.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  What if my package is damaged during shipping?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All packages are insured. Report any damage within 48 hours of delivery for immediate replacement or refund.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
