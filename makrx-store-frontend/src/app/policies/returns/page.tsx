import Link from "next/link";
import {
  RotateCcw,
  Package,
  Shield,
  Clock,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Returns & Exchanges Policy
          </h1>
          <p className="text-xl text-gray-600">
            Hassle-free returns and exchanges for your peace of mind
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  30-Day Returns
                </h3>
                <p className="text-sm text-gray-600">For most products</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <RotateCcw className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Easy Process
                </h3>
                <p className="text-sm text-gray-600">Online return portal</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Quick Refunds
                </h3>
                <p className="text-sm text-gray-600">3-5 business days</p>
              </div>
            </div>

            {/* Return Timeframes */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Return Timeframes
              </h2>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Standard Products
                    </h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      30 Days
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Filaments, tools, accessories, and most 3D printing supplies
                    can be returned within 30 days of delivery in unopened,
                    original condition.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      3D Printers & Equipment
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      45 Days
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Extended return period for 3D printers and major equipment.
                    Must be in original packaging with all accessories and
                    documentation.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Custom 3D Prints
                    </h3>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      7 Days
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Custom printed items can only be returned if there's a
                    quality issue or manufacturing defect. Returns must be
                    initiated within 7 days of delivery.
                  </p>
                </div>
              </div>
            </section>

            {/* Return Conditions */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Return Conditions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Returnable Items
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Unopened filament spools in original packaging</li>
                    <li>• Unused tools and accessories</li>
                    <li>• 3D printers with all original components</li>
                    <li>• Defective or damaged items</li>
                    <li>• Items received in error</li>
                    <li>• Quality-issue custom prints</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Non-Returnable Items
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Opened filament spools (hygiene/quality)</li>
                    <li>• Custom-printed items (unless defective)</li>
                    <li>• Consumables (nozzles, build plates after use)</li>
                    <li>• Software and digital downloads</li>
                    <li>• Items damaged by misuse</li>
                    <li>• Clearance/final sale items</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Return Process */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Return Process
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Initiate Return
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Log into your account and go to Order History. Click
                      "Return Items" next to your order to start the return
                      process.
                    </p>
                    <Link
                      href="/account/orders"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Go to Order History →
                    </Link>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select Items & Reason
                    </h3>
                    <p className="text-gray-600">
                      Choose which items you want to return and select a reason.
                      This helps us improve our products and service. Upload
                      photos if returning due to damage.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Print Return Label
                    </h3>
                    <p className="text-gray-600">
                      We'll email you a prepaid return shipping label. For most
                      returns, shipping is free. For returns due to change of
                      mind, a ₹497 shipping fee may apply.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Package & Ship
                    </h3>
                    <p className="text-gray-600">
                      Pack items in original packaging when possible. Include
                      all accessories, manuals, and documentation. Drop off at
                      any authorized shipping location.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Receive Refund
                    </h3>
                    <p className="text-gray-600">
                      Once we receive and inspect your return, we'll process
                      your refund within 2-3 business days. Refunds are issued
                      to the original payment method.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Exchanges */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Exchanges
              </h2>

              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <RotateCcw className="w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Quick Exchange Process
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Need a different color or size? We offer direct exchanges
                      to get you the right product faster than a return and new
                      order.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-gray-700">
                          Same product, different color/specification
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-gray-700">
                          Free shipping on exchanges within 30 days
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-gray-700">
                          Cross-ship available for urgent needs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Refund Information
              </h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Refund Methods
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Original Payment Method
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Credit/Debit cards: 3-5 business days</li>
                        <li>• PayPal: 1-2 business days</li>
                        <li>• Bank transfer: 5-7 business days</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Store Credit
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Instant credit to account</li>
                        <li>• 10% bonus on store credit refunds</li>
                        <li>• Never expires</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">
                        Partial Refunds
                      </h3>
                      <p className="text-yellow-700 text-sm">
                        Items returned not in original condition, damaged, or
                        missing parts may receive a partial refund. We'll
                        contact you before processing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Special Cases */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Special Cases
              </h2>

              <div className="space-y-6">
                <div className="border-l-4 border-red-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Defective Items
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Received a defective or damaged item? We'll make it right
                    with a full refund or replacement, plus we'll cover all
                    shipping costs.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Free return shipping</li>
                    <li>• Priority processing</li>
                    <li>• Extended return window</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Wrong Item Shipped
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Our mistake! We'll send the correct item immediately and
                    provide a prepaid return label for the wrong item.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Cross-ship replacement</li>
                    <li>• No restocking fees</li>
                    <li>• Expedited shipping at no charge</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bulk Orders
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Large quantity orders have special return considerations.
                    Contact our business sales team for personalized assistance.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Dedicated account manager</li>
                    <li>• Flexible return terms</li>
                    <li>• Custom return logistics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Need Help?
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Our customer service team is here to help with any return
                  questions or concerns.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-full inline-block mb-3">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Returns Portal
                    </h3>
                    <Link
                      href="/account/orders"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Start Return
                    </Link>
                  </div>

                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-full inline-block mb-3">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Live Chat
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Available 9 AM - 6 PM EST
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-purple-100 p-3 rounded-full inline-block mb-3">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Email Support
                    </h3>
                    <p className="text-gray-600 text-sm">returns@makrx.store</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Links */}
            <div className="border-t pt-8">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link
                  href="/policies/shipping"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Shipping Policy
                </Link>
                <Link
                  href="/policies/terms"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/policies/privacy"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/contact"
                  className="text-blue-600 hover:text-blue-700"
                >
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
