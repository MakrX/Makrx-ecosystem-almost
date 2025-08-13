"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Printer,
  Package,
  Users,
  Shield,
} from "lucide-react";

export default function Footer() {
  const footerLinks = {
    products: [
      { name: "3D Printers", href: "/catalog/3d-printers" },
      { name: "Electronics", href: "/catalog/electronics" },
      { name: "Tools & Hardware", href: "/catalog/tools" },
      { name: "Materials", href: "/catalog/materials" },
      { name: "Kits & Bundles", href: "/catalog/kits" },
    ],
    services: [
      { name: "3D Printing", href: "/3d-printing" },
      { name: "CNC Machining", href: "/services/cnc" },
      { name: "PCB Assembly", href: "/services/pcb" },
      { name: "Laser Cutting", href: "/services/laser" },
      { name: "Custom Manufacturing", href: "/services/custom" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "MakrX.org", href: "https://makrx.org" },
      { name: "MakrCave", href: "https://makrcave.com" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "Track Order", href: "/track" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  const features = [
    {
      icon: Printer,
      title: "Instant 3D Printing",
      description: "Upload STL, get quotes, print locally",
    },
    {
      icon: Package,
      title: "Quality Products",
      description: "Curated tools for makers",
    },
    {
      icon: Users,
      title: "Verified Providers",
      description: "Trusted service network",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe & encrypted transactions",
    },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      {/* Top Section - Features */}
      <div className="border-b border-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-store-primary to-store-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-store-primary to-store-secondary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🛒</span>
              </div>
              <div>
                <span className="text-xl font-bold">MakrX</span>
                <span className="text-xl font-bold text-store-primary">
                  .Store
                </span>
              </div>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-4 leading-relaxed">
              The e-commerce hub of the MakrX ecosystem. Tools, materials, and fabrication services integrated with the global maker community.
            </p>
            <p className="text-gray-500 dark:text-gray-600 text-sm mb-6">
              MakrX is an initiative by Botness Technologies Pvt. Ltd.
            </p>
            <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a
                  href="mailto:hello@makrx.store"
                  className="hover:text-white transition-colors"
                >
                  hello@makrx.store
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800 dark:border-gray-700">
          <div className="max-w-md mx-auto text-center lg:max-w-none lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Get the latest products, deals, and maker tips delivered to your
                inbox.
              </p>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:max-w-none">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-600 rounded-lg text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-store-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-store-primary to-store-secondary rounded-lg font-medium hover:from-store-primary/90 hover:to-store-secondary/90 transition-all text-white"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
              <span>© 2024 MakrX by Botness Technologies Pvt. Ltd. All rights reserved.</span>
              {footerLinks.legal.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/makrx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/makrx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/makrx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/makrx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
