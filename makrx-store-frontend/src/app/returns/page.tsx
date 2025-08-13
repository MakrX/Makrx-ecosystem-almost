"use client";

import Link from "next/link";
import { Package, RotateCcw, Clock, Shield, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Returns & Exchanges</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Returns & Exchanges
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Easy returns and exchanges. Your satisfaction is our priority. If you&apos;re not happy, we&apos;ll make it right.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
            <RotateCcw className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">30 Days</h3>
            <p className="text-gray-600 dark:text-gray-400">Return window</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Free Returns</h3>
            <p className="text-gray-600 dark:text-gray-400">For defective items</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
            <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">3-5 Days</h3>
            <p className="text-gray-600 dark:text-gray-400">Refund processing</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Return Policy */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Package className="h-6 w-6 mr-3 text-blue-600" />
              Return Policy Overview
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                We want you to be completely satisfied with your purchase. If you&apos;re not happy for any reason, 
                you can return most items within 30 days of delivery for a full refund or exchange.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Eligible for Return
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Unused items in original packaging</li>
                    <li>• Defective or damaged items</li>
                    <li>• Items not as described</li>
                    <li>• Wrong item shipped</li>
                  </ul>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    Not Eligible for Return
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Custom or personalized items</li>
                    <li>• Consumable materials (filaments, chemicals)</li>
                    <li>• Items damaged by misuse</li>
                    <li>• Software licenses</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Return Process */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">How to Return an Item</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Request Return Authorization
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Visit your <Link href="/account/orders" className="text-blue-600 dark:text-blue-400 hover:underline">order history</Link> and 
                    click &quot;Return Item&quot; or contact our support team. You&apos;ll receive a Return Authorization (RA) number.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Package Your Item
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pack the item securely in its original packaging. Include all accessories, manuals, and the RA number.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Ship or Schedule Pickup
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use the prepaid return label (for defective items) or ship at your cost. 
                    We also offer free pickup for orders over ₹10,000.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Get Your Refund
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Once we receive and inspect your return, we&apos;ll process your refund within 3-5 business days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Return Conditions */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Return Conditions by Category</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Return Window</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Condition</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Restocking Fee</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400">
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">3D Printers</td>
                    <td className="py-3 px-4">30 days</td>
                    <td className="py-3 px-4">Unopened box only</td>
                    <td className="py-3 px-4">15%</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">Electronics</td>
                    <td className="py-3 px-4">30 days</td>
                    <td className="py-3 px-4">Original packaging required</td>
                    <td className="py-3 px-4">10%</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">Tools & Hardware</td>
                    <td className="py-3 px-4">30 days</td>
                    <td className="py-3 px-4">Unused condition</td>
                    <td className="py-3 px-4">None</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">Consumables</td>
                    <td className="py-3 px-4">7 days</td>
                    <td className="py-3 px-4">Unopened only</td>
                    <td className="py-3 px-4">None</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Exchanges */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Exchanges</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                We offer exchanges for defective items, wrong sizes, or color variations. 
                Exchange processing is faster than returns and typically takes 5-7 business days.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Express Exchange Program
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  For premium customers, we can ship the replacement before receiving the return. 
                  Contact support to check eligibility.
                </p>
              </div>
            </div>
          </section>

          {/* Warranty Claims */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Warranty Claims</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Manufacturer Warranty</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Contact manufacturer directly</li>
                  <li>• We provide purchase proof</li>
                  <li>• Typical coverage: 1-3 years</li>
                  <li>• Covers manufacturing defects</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">MakrX Protection Plan</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Extended warranty available</li>
                  <li>• Covers accidental damage</li>
                  <li>• Fast-track repair service</li>
                  <li>• Available at checkout</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Support */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Need Help?</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                Our customer support team is here to help with any return or exchange questions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Email Support</h3>
                  <p className="text-sm">returns@makrx.store</p>
                  <p className="text-sm text-gray-500">24-48 hour response</p>
                </div>
                <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Phone Support</h3>
                  <p className="text-sm">+91 80-4567-8900</p>
                  <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM</p>
                </div>
                <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Live Chat</h3>
                  <p className="text-sm">Available on website</p>
                  <p className="text-sm text-gray-500">Mon-Sat, 10 AM - 8 PM</p>
                </div>
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
