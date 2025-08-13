import Link from "next/link";
import {
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Globe,
  FileText,
} from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600">
            How we collect, use, and protect your information
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
                  <Shield className="w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Your Privacy Matters
                    </h2>
                    <p className="text-gray-700">
                      At MakrX Store, we are committed to protecting your
                      privacy and ensuring the security of your personal
                      information. This policy explains how we collect, use,
                      share, and protect your information when you use our
                      website and services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none text-gray-600">
                <p>
                  This privacy policy applies to all information collected
                  through our website, mobile applications, and any related
                  services, sales, marketing, or events (collectively, the
                  "Services").
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Information We Collect
              </h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Personal Information
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Information you provide directly when creating an account or
                    making a purchase:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <li>• Name and contact information</li>
                    <li>• Email address and phone number</li>
                    <li>• Shipping and billing addresses</li>
                    <li>• Payment information (securely processed)</li>
                    <li>• Account preferences and settings</li>
                    <li>• Order history and preferences</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Eye className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Usage Information
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Information collected automatically when you use our
                    services:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <li>• Device and browser information</li>
                    <li>• IP address and location data</li>
                    <li>• Pages visited and time spent</li>
                    <li>• Search queries and interactions</li>
                    <li>• Cookies and similar technologies</li>
                    <li>• Performance and error data</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      3D Printing Files
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    When you use our 3D printing services:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <li>• Uploaded STL and design files</li>
                    <li>• Print specifications and requirements</li>
                    <li>• File metadata and properties</li>
                    <li>• Print job communications</li>
                    <li>• Quality feedback and ratings</li>
                    <li>• Project photos and documentation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How We Use Your Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Service Delivery
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Process and fulfill your orders</li>
                    <li>• Provide customer support</li>
                    <li>• Send order confirmations and updates</li>
                    <li>• Process 3D printing jobs</li>
                    <li>• Handle returns and exchanges</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Communication
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Send important account information</li>
                    <li>• Provide product updates and news</li>
                    <li>• Respond to inquiries and requests</li>
                    <li>• Send marketing communications (with consent)</li>
                    <li>• Notify about policy changes</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Improvement
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Analyze usage patterns and trends</li>
                    <li>• Improve website functionality</li>
                    <li>• Develop new products and features</li>
                    <li>• Optimize user experience</li>
                    <li>• Conduct research and analytics</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Security & Legal
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Detect and prevent fraud</li>
                    <li>• Ensure platform security</li>
                    <li>• Comply with legal obligations</li>
                    <li>• Enforce terms of service</li>
                    <li>• Protect intellectual property</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Information Sharing
              </h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <Lock className="w-6 h-6 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      We Never Sell Your Data
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      We do not sell, rent, or trade your personal information
                      to third parties for their marketing purposes. Your data
                      is only shared in specific circumstances outlined below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Service Providers
                  </h3>
                  <p className="text-gray-600 mb-3">
                    We share information with trusted third parties who help us
                    operate our business:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Payment processors (Stripe, PayPal)</li>
                    <li>• Shipping companies (UPS, FedEx, USPS)</li>
                    <li>• Email service providers</li>
                    <li>• Cloud storage and hosting services</li>
                    <li>• Analytics and marketing tools</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Legal Requirements
                  </h3>
                  <p className="text-gray-600 mb-3">
                    We may disclose information when required by law or to
                    protect our rights:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Response to legal process or court orders</li>
                    <li>• Investigation of potential violations</li>
                    <li>• Protection of rights, property, or safety</li>
                    <li>• Compliance with regulatory requirements</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-400 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Business Transfers
                  </h3>
                  <p className="text-gray-600">
                    In the event of a merger, acquisition, or sale of assets,
                    your information may be transferred as part of the business
                    transaction. We will notify you of any such change in
                    ownership or control.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Data Security
              </h2>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <Database className="w-8 h-8 text-green-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Security Measures
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We implement industry-standard security measures to
                      protect your information:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Technical Safeguards
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• SSL/TLS encryption for data transmission</li>
                          <li>• Encrypted data storage</li>
                          <li>• Regular security audits and updates</li>
                          <li>• Firewall and intrusion detection</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Administrative Controls
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Limited access on need-to-know basis</li>
                          <li>• Employee training and agreements</li>
                          <li>• Regular access reviews</li>
                          <li>• Incident response procedures</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Privacy Rights
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Access & Update
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      View and modify your personal information through your
                      account settings.
                    </p>
                    <Link
                      href="/account/settings"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Account Settings →
                    </Link>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Delete Account
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Request deletion of your account and associated personal
                      information.
                    </p>
                    <Link
                      href="/contact"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Contact Support →
                    </Link>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Data Export
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Download a copy of your personal data in a portable
                      format.
                    </p>
                    <Link
                      href="/account/settings"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Request Export →
                    </Link>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Opt-Out
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Unsubscribe from marketing communications and adjust
                      privacy preferences.
                    </p>
                    <Link
                      href="/account/settings"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Privacy Settings →
                    </Link>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    California Privacy Rights (CCPA)
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    California residents have additional rights under the
                    California Consumer Privacy Act:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Right to know what personal information is collected
                    </li>
                    <li>• Right to delete personal information</li>
                    <li>• Right to opt-out of sale of personal information</li>
                    <li>
                      • Right to non-discrimination for exercising privacy
                      rights
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Cookies and Tracking
              </h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Types of Cookies We Use
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Essential Cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Required for basic website functionality, such as
                        maintaining your shopping cart and keeping you logged
                        in.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Analytics Cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Help us understand how visitors use our website so we
                        can improve the user experience.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Marketing Cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Used to deliver relevant advertisements and track the
                        effectiveness of our marketing campaigns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Cookie Management
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    You can control cookies through your browser settings or our
                    cookie preference center. Note that disabling certain
                    cookies may affect website functionality.
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Manage Cookie Preferences
                  </button>
                </div>
              </div>
            </section>

            {/* International Users */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                International Users
              </h2>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Globe className="w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Data Transfers
                    </h3>
                    <p className="text-gray-600 mb-4">
                      MakrX Store operates primarily in the United States. If
                      you are located outside the US, your information may be
                      transferred to and processed in the United States where
                      our servers and business operations are located.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          GDPR Compliance (EU Users)
                        </h4>
                        <p className="text-sm text-gray-600">
                          We comply with GDPR requirements for European users,
                          including lawful basis for processing and enhanced
                          user rights.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Adequate Protection
                        </h4>
                        <p className="text-sm text-gray-600">
                          We ensure appropriate safeguards are in place for
                          international data transfers through standard
                          contractual clauses and other approved mechanisms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Us
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Questions about this privacy policy or our data practices?
                  We're here to help.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Privacy Officer
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Email: privacy@makrx.store
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
                      MakrX Store Privacy Team
                      <br />
                      123 Innovation Drive
                      <br />
                      Tech City, TC 12345
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Policy Updates
              </h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-800 text-sm">
                  We may update this privacy policy from time to time to reflect
                  changes in our practices or applicable laws. We will notify
                  you of any material changes by posting the updated policy on
                  our website and updating the "Last Updated" date. For
                  significant changes, we may also send you an email
                  notification.
                </p>
              </div>
            </section>

            {/* Footer Links */}
            <div className="border-t pt-8">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link
                  href="/policies/terms"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Terms of Service
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
