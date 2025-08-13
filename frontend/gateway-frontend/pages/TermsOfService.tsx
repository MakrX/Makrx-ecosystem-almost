import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Scale, FileText, AlertTriangle, Shield, Users, CreditCard } from 'lucide-react';

export default function TermsOfService() {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Terms of Service | MakrX - Legal Terms and Conditions</title>
        <meta name="description" content="MakrX Terms of Service - Legal terms and conditions for using our platform, including user responsibilities and service agreements." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-br from-makrx-blue to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <Scale className="w-16 h-16 text-makrx-yellow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Legal terms and conditions for using MakrX
          </p>
          <p className="text-white/80">
            Last updated: {currentDate} | Effective: January 20, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-yellow-800 mb-2">Important Legal Notice</h2>
              <p className="text-yellow-700 text-sm">
                By accessing or using MakrX services, you agree to be bound by these Terms of Service. 
                If you disagree with any part of these terms, you may not access the service.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction and Acceptance</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") govern your use of the MakrX platform, including makrx.org, 
              MakrCave, MakrX Store, and all related services (collectively, the "Services") operated by 
              <strong> Botness Technologies Pvt Ltd</strong> ("Company," "we," "our," or "us").
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms constitute a legally binding agreement between you and Botness Technologies Pvt Ltd, 
              a company incorporated under the laws of India with its registered office in Bangalore, Karnataka.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <dl className="space-y-3">
                <div>
                  <dt className="font-semibold text-gray-800">"Platform"</dt>
                  <dd className="text-gray-600">The MakrX ecosystem including all websites, applications, and services</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800">"User" or "You"</dt>
                  <dd className="text-gray-600">Any individual or entity accessing or using our Services</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800">"Makerspace"</dt>
                  <dd className="text-gray-600">Physical spaces with tools and equipment accessible through our platform</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800">"Content"</dt>
                  <dd className="text-gray-600">All information, data, text, software, music, sound, photographs, graphics, video, messages, or other materials</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-makrx-blue" />
              3. Account Registration and Eligibility
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Eligibility</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>You must be at least 18 years old to use our Services</li>
              <li>You must provide accurate, current, and complete information</li>
              <li>You must not be prohibited from using the Services under applicable law</li>
              <li>Corporate accounts require proper authorization to bind the entity</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Security</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">
                <strong>You are responsible for:</strong> Maintaining the confidentiality of your account credentials, 
                all activities under your account, and immediately notifying us of any unauthorized use.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Description of Services</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">MakrCave Platform</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Makerspace discovery and booking</li>
                  <li>• Equipment reservation system</li>
                  <li>• Project management tools</li>
                  <li>• Community features</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">MakrX Store</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• E-commerce marketplace</li>
                  <li>• 3D printing services</li>
                  <li>• Custom manufacturing</li>
                  <li>• Tool and material sales</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Obligations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Obligations and Prohibited Uses</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Acceptable Use</h3>
            <p className="text-gray-700 mb-4">You agree to use the Services only for lawful purposes and in accordance with these Terms.</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Prohibited Activities</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="font-semibold text-red-800 mb-3">You must NOT:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Violate any applicable laws or regulations</li>
                  <li>• Infringe on intellectual property rights</li>
                  <li>• Upload malicious code or viruses</li>
                  <li>• Engage in fraudulent activities</li>
                  <li>• Harass or abuse other users</li>
                </ul>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Reverse engineer our services</li>
                  <li>• Create unauthorized derivative works</li>
                  <li>• Use automated scripts or bots</li>
                  <li>• Overload our systems</li>
                  <li>• Create fake accounts or impersonate others</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-makrx-blue" />
              6. Payment Terms and Billing
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Pricing and Fees</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>All prices are in Indian Rupees (INR) unless otherwise specified</li>
              <li>Prices include applicable taxes (GST) as required by law</li>
              <li>Subscription fees are billed in advance on a recurring basis</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Payment Processing</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Payments are processed by authorized payment gateways. We do not store your complete payment card details. 
                All transactions are subject to verification and anti-fraud checks.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">6.3 Refunds and Cancellations</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Subscription cancellations take effect at the end of the current billing period</li>
              <li>Refunds are processed according to our <Link to="/returns" className="text-makrx-blue underline">Refund Policy</Link></li>
              <li>No refunds for partial use of services or subscription periods</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-makrx-blue" />
              7. Intellectual Property Rights
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Our Rights</h3>
            <p className="text-gray-700 mb-4">
              The MakrX platform, including all content, features, and functionality, is owned by Botness Technologies Pvt Ltd 
              and protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Your Content</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>You retain ownership</strong> of content you upload. By using our Services, you grant us a 
                license to use, store, and display your content solely for providing and improving our Services.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">7.3 DMCA Compliance</h3>
            <p className="text-gray-700">
              We respond to valid copyright infringement notices. Report violations to: 
              <a href="mailto:legal@makrx.org" className="text-makrx-blue underline"> legal@makrx.org</a>
            </p>
          </section>

          {/* Liability and Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-makrx-blue" />
              8. Disclaimers and Limitation of Liability
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-yellow-800 mb-3">8.1 Service Availability</h3>
              <p className="text-yellow-700 text-sm">
                Services are provided "as is" and "as available." We do not guarantee uninterrupted or error-free service. 
                Scheduled maintenance and unexpected downtime may occur.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Third-Party Services</h3>
            <p className="text-gray-700 mb-4">
              Our platform integrates with third-party makerspaces and services. We are not responsible for the 
              availability, quality, or actions of these third parties.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Limitation of Liability</h3>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-gray-700 text-sm">
                <strong>To the maximum extent permitted by law,</strong> our liability is limited to the amount 
                you paid for the specific service in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless Botness Technologies Pvt Ltd from any claims, damages, 
              or expenses arising from your use of the Services, violation of these Terms, or infringement of any rights.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 By You</h3>
            <p className="text-gray-700 mb-4">You may terminate your account at any time through your account settings or by contacting support.</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 By Us</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                We may suspend or terminate your account immediately for violation of these Terms, 
                illegal activity, or extended inactivity. We will provide notice when reasonably possible.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law and Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 Governing Law</h3>
            <p className="text-gray-700 mb-4">
              These Terms are governed by the laws of India. Any disputes will be subject to the exclusive 
              jurisdiction of the courts in Bangalore, Karnataka.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 Dispute Resolution</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Mandatory Arbitration:</strong> Disputes will be resolved through binding arbitration 
                under the Arbitration and Conciliation Act, 2015, conducted in Bangalore, Karnataka.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms at any time. Significant changes will be communicated through email or 
              platform notifications. Continued use after changes constitutes acceptance.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <div className="bg-makrx-blue/10 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-makrx-blue mb-2">Legal Queries</h3>
                  <p className="text-gray-700 text-sm">
                    Email: <a href="mailto:legal@makrx.org" className="text-makrx-blue underline">legal@makrx.org</a><br />
                    Phone: +91-80-4567-8900
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-makrx-blue mb-2">Registered Address</h3>
                  <p className="text-gray-700 text-sm">
                    Botness Technologies Pvt Ltd<br />
                    Plot No. 123, Tech Park<br />
                    Electronic City, Phase 2<br />
                    Bangalore, Karnataka 560100, India<br />
                    CIN: U72900KA2024PTC123456
                  </p>
                </div>
              </div>
            </div>
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
