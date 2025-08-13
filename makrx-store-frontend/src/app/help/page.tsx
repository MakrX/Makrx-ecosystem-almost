"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Truck,
  CreditCard,
  Package,
  Settings,
  Shield,
  User,
  ArrowRight,
} from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "All Topics", icon: Book },
    { id: "orders", name: "Orders & Shipping", icon: Truck },
    { id: "payments", name: "Payments & Billing", icon: CreditCard },
    { id: "products", name: "Products & Services", icon: Package },
    { id: "account", name: "Account & Profile", icon: User },
    { id: "technical", name: "Technical Support", icon: Settings },
    { id: "security", name: "Security & Privacy", icon: Shield },
  ];

  const faqs: FAQItem[] = [
    {
      id: "1",
      category: "orders",
      question: "How long does shipping take?",
      answer:
        "Standard shipping typically takes 3-5 business days within the US, while international orders may take 7-14 business days. Express shipping options are available for faster delivery.",
    },
    {
      id: "2",
      category: "orders",
      question: "Can I track my order?",
      answer:
        'Yes! Once your order ships, you\'ll receive a tracking number via email. You can also track your orders by logging into your account and visiting the "My Orders" section.',
    },
    {
      id: "3",
      category: "payments",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and cryptocurrency payments through our secure payment processors.",
    },
    {
      id: "4",
      category: "products",
      question: "How do I get a quote for 3D printing?",
      answer:
        "Upload your 3D model files on our Upload & Quote page. Our system will analyze your design and provide instant pricing based on material, quality, and complexity. You can also contact our team for custom quotes.",
    },
    {
      id: "5",
      category: "products",
      question: "What file formats do you support?",
      answer:
        "We support STL, OBJ, 3MF, and PLY file formats for 3D printing. Maximum file size is 100MB per file. For other formats or larger files, please contact our support team.",
    },
    {
      id: "6",
      category: "account",
      question: "How do I reset my password?",
      answer:
        'Click on "Sign In" and then "Forgot Password". Enter your email address and we\'ll send you a reset link. Follow the instructions in the email to create a new password.',
    },
    {
      id: "7",
      category: "technical",
      question: "I'm having trouble uploading files. What should I do?",
      answer:
        "Ensure your file is under 100MB and in a supported format (STL, OBJ, 3MF, PLY). Clear your browser cache, disable ad blockers, and try again. If issues persist, contact our technical support team.",
    },
    {
      id: "8",
      category: "security",
      question: "Is my personal information secure?",
      answer:
        "Yes, we use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties without your consent. Read our Privacy Policy for more details.",
    },
    {
      id: "9",
      category: "orders",
      question: "Can I cancel or modify my order?",
      answer:
        "Orders can be cancelled or modified within 1 hour of placement, provided they haven't entered production. Contact us immediately if you need to make changes to your order.",
    },
    {
      id: "10",
      category: "products",
      question: "What materials are available for 3D printing?",
      answer:
        "We offer PLA, ABS, PETG, TPU, Wood PLA, Metal-filled filaments, and specialty materials. Each material has different properties and pricing. Check our materials guide for detailed specifications.",
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const quickLinks = [
    {
      title: "Getting Started Guide",
      description: "New to 3D printing? Start here for a complete walkthrough",
      icon: Book,
      href: "/getting-started",
    },
    {
      title: "Upload Your First File",
      description:
        "Step-by-step guide to uploading and ordering your first print",
      icon: Package,
      href: "/upload",
    },
    {
      title: "Material Selection Guide",
      description: "Choose the right material for your project",
      icon: Settings,
      href: "/materials-guide",
    },
    {
      title: "Quality Standards",
      description: "Learn about our printing quality levels and what to expect",
      icon: Shield,
      href: "/quality-standards",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions or get in touch with our support
            team
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Quick Start Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Need More Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">
                Get instant help from our support team
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <Clock className="inline h-4 w-4 mr-1" />
                Available 24/7
              </div>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Email Support
              </h3>
              <p className="text-gray-600 mb-4">
                Send us a detailed message about your issue
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <Clock className="inline h-4 w-4 mr-1" />
                Response within 24 hours
              </div>
              <Link
                href="mailto:support@makrx.store"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                Send Email
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Phone Support
              </h3>
              <p className="text-gray-600 mb-4">
                Speak directly with a support specialist
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <Clock className="inline h-4 w-4 mr-1" />
                Mon-Fri, 9AM-6PM PST
              </div>
              <a
                href="tel:+15551234567"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-block"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-4">
                Browse by Topic
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center ${
                        selectedCategory === category.id
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Frequently Asked Questions
                </h3>
                <span className="text-sm text-gray-500">
                  {filteredFAQs.length} result
                  {filteredFAQs.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg"
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                      }
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or browse a different category
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our community forum and documentation have answers to thousands of
            questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/community"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Visit Community Forum
            </Link>
            <Link
              href="/docs"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
