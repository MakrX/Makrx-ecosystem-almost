import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Globe, Twitter, Linkedin, Instagram, 
  Youtube, Github, ArrowRight, Heart, ExternalLink
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      // In production, this would call an API
      console.log('Newsletter subscription:', newsletterEmail);
      setIsSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerSections = [
    {
      title: 'Ecosystem',
      links: [
        { name: 'MakrCave', href: '/makrcave', description: 'Premium makerspaces' },
        { name: 'MakrX Store', href: '/store', description: 'Tools & materials' },
        { name: '3D Store', href: '/3d-store', description: 'Custom printing' },
        { name: 'Service Providers', href: '/service-providers', description: 'Freelance makers' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs', description: 'API & guides' },
        { name: 'Learning Hub', href: '/learn', description: 'Courses & tutorials' },
        { name: 'Events', href: '/events', description: 'Workshops & meetups' },
        { name: 'Blog', href: '/blog', description: 'News & insights' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/support', description: 'Get assistance' },
        { name: 'Status', href: '/status', description: 'System status' },
        { name: 'Contact Us', href: '/contact', description: 'Get in touch' },
        { name: 'Safety Guidelines', href: '/safety', description: 'Stay safe' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about', description: 'Our story' },
        { name: 'Careers', href: '/careers', description: 'Join our team' },
        { name: 'Press Kit', href: '/press', description: 'Media resources' },
        { name: 'Partners', href: '/partners', description: 'Collaboration' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/makrx', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/makrx', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/makrx', color: 'hover:text-pink-500' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@makrx', color: 'hover:text-red-500' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/makrx', color: 'hover:text-gray-400' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Top Section with Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* Company Information */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <Link to="/" className="flex items-center gap-3 group">
                <img 
                  src="https://cdn.builder.io/api/v1/assets/f367f5e46f75423a83d3f29fae529dbb/botlogofinal-c921e6?format=webp&width=800" 
                  alt="MakrBot" 
                  className="w-8 h-8 group-hover:scale-110 transition-transform"
                />
                <div className="text-2xl font-display font-bold">
                  <span className="text-white">Makr</span>
                  <span className="text-makrx-yellow">X</span>
                </div>
              </Link>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              India's largest maker ecosystem connecting creators, innovators, and entrepreneurs 
              through premium makerspaces, cutting-edge tools, and comprehensive learning resources.
            </p>

            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-makrx-yellow flex-shrink-0" />
                <span>Bangalore, Mumbai, Delhi, Pune & 25+ cities across India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-makrx-yellow flex-shrink-0" />
                <a href="tel:+918047258000" className="hover:text-white transition-colors">
                  +91 80472 58000
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-makrx-yellow flex-shrink-0" />
                <a href="mailto:hello@makrx.org" className="hover:text-white transition-colors">
                  hello@makrx.org
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-makrx-yellow flex-shrink-0" />
                <span>An initiative by Botness Technologies Pvt Ltd.</span>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="group flex flex-col text-gray-400 hover:text-white transition-colors"
                        >
                          <span className="font-medium group-hover:text-makrx-yellow transition-colors">
                            {link.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {link.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 dark:border-gray-700 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated with MakrX</h3>
            <p className="text-gray-400 mb-6">
              Get the latest maker news, workshop announcements, and exclusive insights delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address for newsletter subscription
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-makrx-yellow focus:outline-none"
                aria-required="true"
                aria-describedby="newsletter-description"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-makrx-yellow text-makrx-blue font-semibold rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
                aria-label="Subscribe to newsletter"
              >
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
            <p id="newsletter-description" className="text-xs text-gray-500 mt-3">
              No spam, unsubscribe anytime. Read our{' '}
              <Link to="/privacy" className="text-makrx-yellow hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 dark:border-gray-700 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Follow us:</span>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg bg-gray-800 text-gray-400 ${social.color} transition-all hover:scale-110`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>in India</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 dark:border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              <p>
                © {currentYear} Botness Technologies Pvt Ltd. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-gray-600">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Additional Info */}
            <div className="text-sm text-gray-400">
              <p>
                GST: 29ABCDE1234F1Z5 | CIN: U72900KA2020PTC123456
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-gray-800 dark:border-gray-700 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>99.9% Uptime SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-makrx-yellow text-makrx-blue rounded-full shadow-lg hover:bg-yellow-300 transition-all hover:scale-110 z-40"
        aria-label="Scroll to top"
      >
        <ArrowRight className="w-5 h-5 rotate-[-90deg]" />
      </button>
    </footer>
  );
}
