"use client";

import React from "react";
import Link from "next/link";
import { FileText, Scale, Shield, AlertTriangle, Calendar } from "lucide-react";

export default function TermsOfServicePage() {
  const lastUpdated = "January 15, 2024";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
            <Scale className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Please read these terms carefully before using our platform and
            services.
          </p>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 mb-6">
              By accessing and using MakrX Store ("we," "our," or "us"), you
              accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              2. Use License
            </h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of the
              materials on MakrX Store's website for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a
              transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>modify or copy the materials</li>
              <li>
                use the materials for any commercial purpose or for any public
                display (commercial or non-commercial)
              </li>
              <li>
                attempt to decompile or reverse engineer any software contained
                on the website
              </li>
              <li>
                remove any copyright or other proprietary notations from the
                materials
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-700 mb-4">
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. You are
              responsible for safeguarding the password and for all activities
              that occur under your account.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. 3D Printing Services
            </h2>
            <p className="text-gray-700 mb-4">
              Our 3D printing services are subject to the following terms:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Files must be in supported formats (STL, OBJ, 3MF, PLY)</li>
              <li>
                We reserve the right to refuse printing of inappropriate or
                illegal content
              </li>
              <li>
                Print quality may vary based on file complexity and material
                selection
              </li>
              <li>
                Delivery times are estimates and may vary based on demand and
                complexity
              </li>
              <li>You retain ownership of your uploaded files and designs</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Payment Terms
            </h2>
            <p className="text-gray-700 mb-4">
              Payment is required at the time of order placement. We accept
              major credit cards, PayPal, and other payment methods as indicated
              on our platform. All prices are in USD unless otherwise specified.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Shipping and Returns
            </h2>
            <p className="text-gray-700 mb-4">
              Shipping costs and delivery times vary by location and service
              level. Returns are accepted within 30 days of delivery for
              eligible items. Custom 3D printed items may not be returnable
              unless defective.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
              7. Disclaimer
            </h2>
            <p className="text-gray-700 mb-6">
              The materials on MakrX Store's website are provided on an 'as is'
              basis. MakrX Store makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Limitations
            </h2>
            <p className="text-gray-700 mb-6">
              In no event shall MakrX Store or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on MakrX Store's website, even
              if MakrX Store or an authorized representative has been notified
              orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Intellectual Property
            </h2>
            <p className="text-gray-700 mb-6">
              You retain all rights to any content you upload to our platform.
              By uploading content, you grant us a limited license to process,
              store, and fulfill your orders. We respect intellectual property
              rights and will respond to valid DMCA takedown notices.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Prohibited Uses
            </h2>
            <p className="text-gray-700 mb-4">You may not use our service:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>
                For any unlawful purpose or to solicit others to perform
                unlawful acts
              </li>
              <li>
                To violate any international, federal, provincial, or state
                regulations, rules, laws, or local ordinances
              </li>
              <li>
                To infringe upon or violate our intellectual property rights or
                the intellectual property rights of others
              </li>
              <li>
                To harass, abuse, insult, harm, defame, slander, disparage,
                intimidate, or discriminate
              </li>
              <li>To submit false or misleading information</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Termination
            </h2>
            <p className="text-gray-700 mb-6">
              We may terminate or suspend your account and bar access to the
              service immediately, without prior notice or liability, under our
              sole discretion, for any reason whatsoever including but not
              limited to a breach of the Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Governing Law
            </h2>
            <p className="text-gray-700 mb-6">
              These terms and conditions are governed by and construed in
              accordance with the laws of California, United States, and you
              irrevocably submit to the exclusive jurisdiction of the courts in
              that state or location.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              13. Changes to Terms
            </h2>
            <p className="text-gray-700 mb-6">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days notice prior to any new terms taking
              effect.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Questions About These Terms?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            If you have any questions about these Terms of Service, please
            contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
            <a
              href="mailto:legal@makrx.store"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              legal@makrx.store
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
