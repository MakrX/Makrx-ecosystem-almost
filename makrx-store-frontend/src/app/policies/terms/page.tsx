import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  Shield,
  Scale,
  Gavel,
  Users,
} from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600">
            Legal terms and conditions for using MakrX Store
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 15, 2024
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8">
            {/* Introduction */}
            <section className="mb-12">
              <div className="bg-blue-50 p-6 rounded-lg mb-8">
                <div className="flex items-start space-x-4">
                  <Scale className="w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Agreement to Terms
                    </h2>
                    <p className="text-gray-700">
                      By accessing and using MakrX Store, you agree to be bound
                      by these Terms of Service and all applicable laws and
                      regulations. If you do not agree with any of these terms,
                      you are prohibited from using or accessing this site.
                    </p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none text-gray-600">
                <p>
                  These Terms of Service ("Terms") govern your use of our
                  website, products, and services (collectively, the "Service")
                  operated by MakrX Store ("us", "we", or "our").
                </p>
              </div>
            </section>

            {/* Definitions */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Definitions
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">"Service"</h3>
                    <p className="text-sm text-gray-600">
                      Refers to the MakrX Store website, e-commerce platform, 3D
                      printing services, and all related features and
                      functionality.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      "User", "You"
                    </h3>
                    <p className="text-sm text-gray-600">
                      Any individual or entity that accesses or uses our
                      Service.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">"Content"</h3>
                    <p className="text-sm text-gray-600">
                      All text, graphics, images, 3D models, software, and other
                      materials available through the Service.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">"Products"</h3>
                    <p className="text-sm text-gray-600">
                      Physical items, materials, equipment, and digital services
                      offered for sale through our platform.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Account Terms
              </h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Account Registration
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      • You must be at least 18 years old to create an account
                    </li>
                    <li>
                      • You must provide accurate and complete information
                    </li>
                    <li>
                      • You are responsible for maintaining account security
                    </li>
                    <li>• One person may not maintain multiple accounts</li>
                    <li>
                      • You must notify us immediately of any unauthorized
                      access
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Account Responsibilities
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Keep your login credentials confidential</li>
                    <li>• Update account information when it changes</li>
                    <li>• Use the Service only for lawful purposes</li>
                    <li>• Comply with all applicable laws and regulations</li>
                    <li>• Respect intellectual property rights</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Use of Service */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Acceptable Use
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Permitted Uses
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Purchase products for personal or business use</li>
                    <li>• Upload 3D models for printing services</li>
                    <li>• Share reviews and feedback</li>
                    <li>• Access educational content and resources</li>
                    <li>• Communicate with customer support</li>
                    <li>• Participate in community features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Prohibited Uses
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Upload illegal or infringing content</li>
                    <li>• Attempt to hack or compromise security</li>
                    <li>• Distribute malware or harmful code</li>
                    <li>• Engage in fraudulent activities</li>
                    <li>• Spam or send unsolicited communications</li>
                    <li>• Violate others' privacy or rights</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3D Printing Services */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                3D Printing Services
              </h2>

              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">
                        File Requirements & Restrictions
                      </h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        You are responsible for ensuring your uploaded files
                        comply with all applicable laws and do not infringe on
                        intellectual property rights.
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• No copyrighted content without permission</li>
                        <li>• No weapons, illegal items, or harmful objects</li>
                        <li>• Files must be technically printable</li>
                        <li>• Maximum file size and complexity limits apply</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Service Terms
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      • Print quality depends on file quality and specifications
                    </li>
                    <li>• Estimated delivery times are not guaranteed</li>
                    <li>• We may reject orders that violate our policies</li>
                    <li>• Rush orders may incur additional fees</li>
                    <li>• Material substitutions may be made when necessary</li>
                    <li>• Files are automatically deleted after 30 days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Intellectual Property
              </h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Our Rights
                  </h3>
                  <p className="text-gray-600 mb-4">
                    MakrX Store and its content, features, and functionality are
                    owned by us and are protected by international copyright,
                    trademark, patent, trade secret, and other intellectual
                    property laws.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Website design, logos, and branding</li>
                    <li>• Software and technical infrastructure</li>
                    <li>• Educational content and documentation</li>
                    <li>• Proprietary printing profiles and settings</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Rights
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You retain ownership of any intellectual property you upload
                    to our Service. By uploading content, you grant us a limited
                    license to use it for service provision.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• You own the rights to your uploaded 3D models</li>
                    <li>• We only use your files to fulfill your orders</li>
                    <li>• Files are not shared with third parties</li>
                    <li>• You can request file deletion at any time</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Payments and Refunds */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Payments and Refunds
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Terms
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• All prices are in USD unless otherwise stated</li>
                    <li>• Payment is due at time of order</li>
                    <li>• We accept major credit cards and PayPal</li>
                    <li>• Prices may change without notice</li>
                    <li>• Sales tax applies where required</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Refund Policy
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Returns accepted within specified timeframes</li>
                    <li>• Refunds processed to original payment method</li>
                    <li>• Custom items may have different policies</li>
                    <li>• Shipping costs may not be refundable</li>
                    <li>• See our Returns Policy for full details</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Disclaimers */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Disclaimers and Limitations
              </h2>

              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">
                        Service "As Is"
                      </h3>
                      <p className="text-red-700 text-sm">
                        Our Service is provided "as is" and "as available"
                        without warranties of any kind, either express or
                        implied. We do not guarantee uninterrupted, secure, or
                        error-free operation of the Service.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Limitation of Liability
                  </h3>
                  <p className="text-gray-600 mb-4">
                    In no event shall MakrX Store be liable for any indirect,
                    incidental, special, consequential, or punitive damages,
                    including without limitation, loss of profits, data, use,
                    goodwill, or other intangible losses.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      • Maximum liability limited to amount paid for services
                    </li>
                    <li>
                      • Not responsible for third-party content or services
                    </li>
                    <li>• User assumes risk for downloaded or printed items</li>
                    <li>
                      • Indemnification required for user-provided content
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Privacy and Data Protection
              </h2>

              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <Shield className="w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Your Privacy Rights
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your privacy is important to us. Our collection and use of
                      personal information is governed by our Privacy Policy,
                      which is incorporated into these Terms by reference.
                    </p>
                    <Link
                      href="/policies/privacy"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read Our Privacy Policy →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Termination
              </h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Termination by You
                  </h3>
                  <p className="text-gray-600 mb-3">
                    You may terminate your account at any time by contacting
                    customer support or using the account deletion feature in
                    your settings.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Outstanding orders will be fulfilled</li>
                    <li>
                      • Account data will be deleted per our retention policy
                    </li>
                    <li>
                      • Some information may be retained for legal compliance
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Termination by Us
                  </h3>
                  <p className="text-gray-600 mb-3">
                    We may terminate or suspend your account immediately if you
                    violate these Terms or engage in prohibited activities.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Violation of Terms of Service</li>
                    <li>• Fraudulent or illegal activity</li>
                    <li>• Abuse of our systems or staff</li>
                    <li>• Non-payment of fees</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Governing Law */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Governing Law and Disputes
              </h2>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Gavel className="w-8 h-8 text-purple-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Legal Framework
                    </h3>
                    <div className="space-y-4 text-gray-600">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Governing Law
                        </h4>
                        <p className="text-sm">
                          These Terms are governed by and construed in
                          accordance with the laws of the State of California,
                          without regard to conflict of law principles.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Dispute Resolution
                        </h4>
                        <p className="text-sm mb-2">
                          Any disputes arising from these Terms will be resolved
                          through binding arbitration rather than in court,
                          except for small claims disputes.
                        </p>
                        <ul className="text-sm space-y-1">
                          <li>
                            • Arbitration conducted under AAA Commercial Rules
                          </li>
                          <li>• Located in California</li>
                          <li>
                            • Individual arbitration only (no class actions)
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Changes to Terms
              </h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <FileText className="w-6 h-6 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      Updates and Modifications
                    </h3>
                    <p className="text-yellow-700 text-sm mb-3">
                      We reserve the right to update these Terms at any time. We
                      will notify users of material changes by posting the
                      updated Terms on our website and updating the "Last
                      Updated" date.
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>
                        • Continued use constitutes acceptance of new Terms
                      </li>
                      <li>• Material changes will be communicated via email</li>
                      <li>• 30-day notice period for significant changes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Questions about these Terms of Service? Contact our legal
                  team.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Legal Department
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Email: legal@makrx.store
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: 1-800-MAKRX-HELP
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Mailing Address
                    </h3>
                    <p className="text-sm text-gray-600">
                      MakrX Store Legal
                      <br />
                      123 Innovation Drive
                      <br />
                      Tech City, TC 12345
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Links */}
            <div className="border-t pt-8">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link
                  href="/policies/privacy"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/policies/shipping"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Shipping Policy
                </Link>
                <Link
                  href="/policies/returns"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Returns Policy
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
