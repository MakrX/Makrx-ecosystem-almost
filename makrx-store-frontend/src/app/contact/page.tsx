"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  Building,
  Users,
  Headphones,
  Globe,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email and we'll get back to you within 24 hours",
      contact: "hello@makrx.store",
      action: "mailto:hello@makrx.store",
      available: "24/7",
      color: "blue",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our support team",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567",
      available: "Mon-Fri, 9AM-6PM PST",
      color: "green",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help from our customer success team",
      contact: "Start Chat",
      action: "#",
      available: "24/7",
      color: "purple",
    },
  ];

  const offices = [
    {
      title: "Headquarters",
      address: "123 Innovation Drive\nSan Francisco, CA 94107\nUnited States",
      phone: "+1 (555) 123-4567",
      email: "hello@makrx.store",
    },
    {
      title: "European Office",
      address: "45 Tech Plaza\nBerlin, 10115\nGermany",
      phone: "+49 30 12345678",
      email: "europe@makrx.store",
    },
    {
      title: "Asia Pacific",
      address: "88 Marina Boulevard\nSingapore 018956\nSingapore",
      phone: "+65 6123 4567",
      email: "apac@makrx.store",
    },
  ];

  const departments = [
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Help with orders, shipping, and general questions",
      email: "support@makrx.store",
    },
    {
      icon: Building,
      title: "Business Inquiries",
      description: "Partnerships, bulk orders, and enterprise solutions",
      email: "business@makrx.store",
    },
    {
      icon: Users,
      title: "Press & Media",
      description: "Media inquiries and press kit requests",
      email: "press@makrx.store",
    },
    {
      icon: Globe,
      title: "International",
      description: "Questions about international shipping and services",
      email: "international@makrx.store",
    },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Message Sent!
            </h2>
            <p className="text-gray-600 mb-6">
              Thanks for reaching out. We've received your message and will get
              back to you within 24 hours.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  subject: "",
                  category: "general",
                  message: "",
                });
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our products or services? We're here to help.
            Reach out through any of the channels below and we'll get back to
            you quickly.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How to Reach Us
            </h2>
            <p className="text-lg text-gray-600">
              Choose the method that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
                green: "bg-green-100 text-green-600 hover:bg-green-200",
                purple: "bg-purple-100 text-purple-600 hover:bg-purple-200",
              };

              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${colorClasses[method.color as keyof typeof colorClasses]}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">
                      {method.contact}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {method.available}
                    </p>
                  </div>
                  <a
                    href={method.action}
                    className={`inline-block mt-4 px-6 py-2 rounded-lg font-semibold transition-colors ${
                      method.color === "blue"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : method.color === "green"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {method.title}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="press">Press & Media</option>
                    <option value="feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Department Contacts */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Direct Department Contacts
                </h3>
                <div className="space-y-4">
                  {departments.map((dept, index) => {
                    const Icon = dept.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                      >
                        <div className="flex items-start">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-4 flex-shrink-0">
                            <Icon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {dept.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {dept.description}
                            </p>
                            <a
                              href={`mailto:${dept.email}`}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {dept.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Locations
            </h2>
            <p className="text-lg text-gray-600">Find us around the world</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 text-center"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {office.title}
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="whitespace-pre-line">{office.address}</div>
                  <div className="space-y-1">
                    <p className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {office.phone}
                    </p>
                    <p className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {office.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
