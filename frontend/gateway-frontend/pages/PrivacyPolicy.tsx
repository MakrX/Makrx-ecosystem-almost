import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Eye, Database, UserCheck, Lock, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Privacy Policy | MakrX - Protecting Your Privacy</title>
        <meta name="description" content="MakrX Privacy Policy - How we collect, use, and protect your personal information in compliance with DPDP Act 2023 and GDPR." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-br from-makrx-blue to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-makrx-yellow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Your privacy is fundamental to everything we do
          </p>
          <p className="text-white/80">
            Last updated: {currentDate} | Effective: January 20, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Quick Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Privacy at a Glance
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">What we collect:</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Contact information (name, email)</li>
                <li>• Usage data for service improvement</li>
                <li>• Makerspace preferences and activity</li>
                <li>• Payment information (securely processed)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">How we protect it:</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• End-to-end encryption</li>
                <li>• No selling to third parties</li>
                <li>• DPDP Act 2023 compliance</li>
                <li>• Full data portability rights</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              MakrX, operated by <strong>Botness Technologies Pvt Ltd</strong> ("we," "our," or "us"), is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, 
              including makrx.org, MakrCave, MakrX Store, and related services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We comply with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, 
              General Data Protection Regulation (GDPR), and other applicable privacy laws.
            </p>
          </section>

          {/* Data Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-makrx-blue" />
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>Name, email address, phone number</li>
              <li>Profile information and preferences</li>
              <li>Makerspace memberships and bookings</li>
              <li>Payment and billing information</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Usage Information</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>Platform usage patterns and preferences</li>
              <li>Device information and IP addresses</li>
              <li>Location data (when permitted)</li>
              <li>Cookies and tracking technologies</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Project and Content Data</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Project files and designs (when shared)</li>
              <li>Equipment usage and preferences</li>
              <li>Community contributions and feedback</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Legitimate Purposes:</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Service Delivery:</strong> Providing access to makerspaces, processing orders, and managing memberships</li>
                <li><strong>Communication:</strong> Sending important updates, newsletters, and customer support</li>
                <li><strong>Improvement:</strong> Analyzing usage patterns to enhance our platform and services</li>
                <li><strong>Safety:</strong> Ensuring security and preventing fraud or misuse</li>
                <li><strong>Legal Compliance:</strong> Meeting regulatory requirements and legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <div className="border-l-4 border-red-500 pl-4 mb-4">
              <p className="text-gray-700 font-medium">
                <strong>We do not sell your personal information to third parties.</strong>
              </p>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">We may share information with:</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Partner Makerspaces:</strong> To facilitate bookings and access</li>
              <li><strong>Service Providers:</strong> Payment processors, hosting services (with data protection agreements)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
              <li><strong>Business Transfers:</strong> In case of merger or acquisition (with notice)</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-makrx-blue" />
              5. Data Security and Protection
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Technical Safeguards</h3>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• End-to-end encryption</li>
                  <li>• Secure HTTPS connections</li>
                  <li>• Regular security audits</li>
                  <li>• Access controls and monitoring</li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Organizational Safeguards</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Employee training programs</li>
                  <li>• Data minimization practices</li>
                  <li>• Incident response procedures</li>
                  <li>• Regular compliance reviews</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <UserCheck className="w-6 h-6 mr-2 text-makrx-blue" />
              6. Your Rights and Choices
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Under DPDP Act 2023 and GDPR, you have the right to:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="text-yellow-700 space-y-2">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate information</li>
                  <li><strong>Erasure:</strong> Request deletion of your data</li>
                  <li><strong>Portability:</strong> Export your data</li>
                </ul>
                <ul className="text-yellow-700 space-y-2">
                  <li><strong>Object:</strong> Opt-out of certain processing</li>
                  <li><strong>Restrict:</strong> Limit how we use your data</li>
                  <li><strong>Withdraw Consent:</strong> Revoke permissions</li>
                  <li><strong>Complaint:</strong> Report to data protection authorities</li>
                </ul>
              </div>
              <p className="text-yellow-700 mt-4">
                <strong>To exercise these rights:</strong> Email us at <a href="mailto:privacy@makrx.org" className="underline">privacy@makrx.org</a> or use your account settings.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-makrx-blue" />
              7. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your data is primarily processed in India. When we transfer data internationally (e.g., for cloud services), 
              we ensure adequate protection through Standard Contractual Clauses and adequacy decisions.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                <strong>Our services are not intended for children under 18.</strong> We do not knowingly collect personal information from minors. 
                If you believe we have collected information from a child, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain personal information only as long as necessary for the purposes outlined in this policy or as required by law. 
              Account data is typically retained for 3 years after account closure, unless deletion is specifically requested.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <div className="bg-makrx-blue/10 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-makrx-blue mb-2">Data Protection Officer</h3>
                  <p className="text-gray-700 text-sm">
                    Email: <a href="mailto:dpo@makrx.org" className="text-makrx-blue underline">dpo@makrx.org</a><br />
                    Phone: +91-80-4567-8900
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-makrx-blue mb-2">Company Address</h3>
                  <p className="text-gray-700 text-sm">
                    Botness Technologies Pvt Ltd<br />
                    Plot No. 123, Tech Park<br />
                    Electronic City, Phase 2<br />
                    Bangalore, Karnataka 560100, India
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes by email or 
              through our platform. Your continued use of our services after changes become effective constitutes acceptance.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-makrx-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to MakrX
          </Link>
        </div>
      </div>
    </div>
  );
}
