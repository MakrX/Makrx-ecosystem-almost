import Link from 'next/link';
import { Truck, Package, Clock, MapPin, CreditCard, Phone } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Policy</h1>
          <p className="text-xl text-gray-600">Everything you need to know about our shipping and delivery</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over ₹6,225</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
                <p className="text-sm text-gray-600">1-2 business days</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <Package className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Secure Packaging</h3>
                <p className="text-sm text-gray-600">Protected delivery</p>
              </div>
            </div>

            {/* Shipping Methods */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Methods</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Standard Shipping</h3>
                      <p className="text-gray-600">5-7 business days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">₹497</p>
                      <p className="text-sm text-green-600">Free over ₹6,225</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Our most popular shipping option. Reliable delivery with tracking included.
                    Perfect for non-urgent orders and bulk purchases.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Express Shipping</h3>
                      <p className="text-gray-600">2-3 business days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">₹1,078</p>
                      <p className="text-sm text-gray-500">All orders</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Faster delivery for when you need your materials sooner. Includes priority handling
                    and expedited processing.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Overnight Shipping</h3>
                      <p className="text-gray-600">Next business day</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">₹2,074</p>
                      <p className="text-sm text-gray-500">Order by 2 PM</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Emergency delivery for urgent projects. Orders must be placed by 2 PM EST
                    for next business day delivery.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Local Pickup</h3>
                      <p className="text-gray-600">Same day availability</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">FREE</p>
                      <p className="text-sm text-gray-500">Select locations</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Pick up your order from our warehouse or partner locations. Perfect for large
                    or fragile items. Available in major metropolitan areas.
                  </p>
                </div>
              </div>
            </section>

            {/* Processing Time */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Processing Time</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Standard Products</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>In-stock items:</strong> 1-2 business days</li>
                  <li>• <strong>Custom colors/specifications:</strong> 2-3 business days</li>
                  <li>• <strong>Pre-orders:</strong> Ships on announced date</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">3D Printing Services</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Standard quality:</strong> 3-5 business days</li>
                  <li>• <strong>High quality:</strong> 5-7 business days</li>
                  <li>• <strong>Ultra-high quality:</strong> 7-10 business days</li>
                  <li>• <strong>Rush orders:</strong> 24-48 hours (additional fees apply)</li>
                </ul>
              </div>
            </section>

            {/* Geographic Coverage */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Coverage</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Domestic Shipping (US)</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• All 50 states and territories</li>
                    <li>• Alaska and Hawaii (additional fees may apply)</li>
                    <li>• PO Boxes and APO/FPO addresses</li>
                    <li>• Residential and commercial addresses</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">International Shipping</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Canada and Mexico</li>
                    <li>• European Union countries</li>
                    <li>• Australia and New Zealand</li>
                    <li>• Other countries (contact us for rates)</li>
                  </ul>
                  <p className="text-sm text-amber-600 mt-4">
                    International orders may be subject to customs duties and taxes.
                  </p>
                </div>
              </div>
            </section>

            {/* Special Handling */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Special Handling</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-yellow-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hazmat Materials</h3>
                  <p className="text-gray-600">
                    Certain resins and chemicals require special handling and may have shipping restrictions.
                    Ground shipping only for hazmat items. Additional fees and extended processing time apply.
                  </p>
                </div>

                <div className="border-l-4 border-blue-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Large Items</h3>
                  <p className="text-gray-600">
                    3D printers and large equipment ship via freight. We'll contact you to schedule
                    delivery. White glove delivery available for an additional fee.
                  </p>
                </div>

                <div className="border-l-4 border-purple-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fragile Items</h3>
                  <p className="text-gray-600">
                    Detailed 3D prints and delicate materials receive extra protective packaging.
                    Signature confirmation required for deliveries over ₹16,600.
                  </p>
                </div>
              </div>
            </section>

            {/* Tracking */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Tracking</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <Package className="w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                    <p className="text-gray-600 mb-4">
                      Track your order from processing to delivery with our real-time tracking system.
                      You'll receive email and SMS notifications at each step.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Order confirmed and processing</li>
                      <li>• Shipped with tracking number</li>
                      <li>• Out for delivery</li>
                      <li>• Delivered confirmation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Support</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Questions about shipping? Our customer service team is here to help.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Call Us</p>
                      <p className="text-gray-600">1-800-MAKRX-HELP</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Live Chat</p>
                      <p className="text-gray-600">Available 9 AM - 6 PM EST</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Links */}
            <div className="border-t pt-8">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/policies/returns" className="text-blue-600 hover:text-blue-700">
                  Returns Policy
                </Link>
                <Link href="/policies/terms" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </Link>
                <Link href="/policies/privacy" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>
                <Link href="/contact" className="text-blue-600 hover:text-blue-700">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
