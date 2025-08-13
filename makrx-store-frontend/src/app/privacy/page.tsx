"use client";

import React from "react";
import Link from "next/link";
import { Shield, Eye, Lock, Users, FileText, Calendar } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Eye,
      content: `We collect information you provide directly to us, such as when you create an account, make a purchase, upload files, or contact us. This includes:

• Personal information (name, email address, phone number)
• Payment information (processed securely through third-party providers)
• Account preferences and settings
• 3D model files and project data you upload
• Communication with our support team`,
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Users,
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices and support messages
• Respond to your comments and questions
• Analyze how you use our platform to improve user experience
• Detect, investigate and prevent fraudulent transactions`,
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Users,
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:

• With service providers who assist us in operating our platform
• With printing partners to fulfill your orders (only necessary information)
• To comply with legal obligations or protect our rights
• In connection with a business transfer or merger
• With your explicit consent`,
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: `We implement appropriate security measures to protect your information:

• SSL encryption for all data transmission
• Secure cloud storage with encryption at rest
• Regular security audits and monitoring
• Access controls and authentication protocols
• Secure payment processing through certified providers
• Regular backup and disaster recovery procedures`,
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: Eye,
      content: `We use cookies and similar technologies to:

• Remember your preferences and settings
• Analyze site traffic and usage patterns
• Provide personalized content and recommendations
• Enable social media features
• Measure the effectiveness of our marketing campaigns

You can control cookies through your browser settings, but some features may not work properly if disabled.`,
    },
    {
      id: "file-handling",
      title: "3D File Data Handling",
      icon: FileText,
      content: `When you upload 3D model files:

• Files are processed to generate quotes and optimize for printing
• We may retain files for a limited time to fulfill your orders
• Files are automatically deleted after completion unless you request storage
• We implement strict access controls for file data
• Files are never shared with third parties without your consent
• You retain all ownership rights to your uploaded content`,
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      icon: Shield,
      content: `You have the right to:

• Access, update, or delete your personal information
• Download your data in a portable format
• Opt out of marketing communications
• Request deletion of your uploaded files
• Object to certain processing of your data
• Lodge a complaint with a supervisory authority

To exercise these rights, contact us at privacy@makrx.store.`,
    },
    {
      id: "international",
      title: "International Data Transfers",
      icon: Users,
      content: `If you are located outside the United States, please note that we transfer, store, and process your information in the United States and other countries. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws.`,
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: Shield,
      content: `Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.`,
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      icon: Calendar,
      content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100">
                    <Icon className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-600">
                    {index + 1}. {section.title}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
                >
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-4">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Questions About Your Privacy?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy or our privacy
            practices, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
            <a
              href="mailto:privacy@makrx.store"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              privacy@makrx.store
            </a>
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Data Protection Officer
            </h3>
            <p className="text-gray-600 text-sm">
              For EU residents, you can contact our Data Protection Officer at:
              <a
                href="mailto:dpo@makrx.store"
                className="text-blue-600 hover:text-blue-700 ml-1"
              >
                dpo@makrx.store
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Related Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/terms"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center group"
            >
              <FileText className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                Terms of Service
              </h4>
              <p className="text-sm text-gray-600">Our terms and conditions</p>
            </Link>
            <Link
              href="/cookies"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center group"
            >
              <Eye className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                Cookie Policy
              </h4>
              <p className="text-sm text-gray-600">How we use cookies</p>
            </Link>
            <Link
              href="/security"
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center group"
            >
              <Lock className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                Security
              </h4>
              <p className="text-sm text-gray-600">How we protect your data</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
