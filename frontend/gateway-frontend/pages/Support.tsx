import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, Search, MessageCircle, Mail, Phone,
  ChevronDown, ChevronRight, ExternalLink, Send,
  FileText, Video, Users, Zap, Clock, CheckCircle
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface SupportArticle {
  title: string;
  description: string;
  category: string;
  href: string;
  type: 'article' | 'video' | 'guide';
}

export default function Support() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const faqs: FAQ[] = [
    {
      question: "How do I get started with MakrX?",
      answer: "Getting started is easy! First, create your account at auth.makrx.org. Choose your role (Maker, Makerspace Owner, or Service Provider) and you'll be guided through the appropriate onboarding process. Check out our Quick Start Guide for detailed instructions.",
      category: "Getting Started"
    },
    {
      question: "What's included in a MakrCave subscription?",
      answer: "MakrCave subscriptions include equipment booking, inventory management, member billing, project tracking, and analytics. Pricing varies by makerspace size and features needed. Contact our sales team for a custom quote.",
      category: "Billing"
    },
    {
      question: "How do I place a custom manufacturing order?",
      answer: "Upload your design files to our Store platform and get an instant quote. You can choose from 3D printing, CNC machining, laser cutting, and PCB assembly services. Our global provider network ensures competitive pricing and fast delivery.",
      category: "Orders"
    },
    {
      question: "Can I integrate MakrX with my existing systems?",
      answer: "Yes! We offer comprehensive APIs and webhooks for integration with ERP, inventory management, and payment systems. Our documentation includes guides for common integrations like Keycloak SSO and various payment gateways.",
      category: "Integration"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, bank transfers, and UPI payments through our secure payment partners. For enterprise customers, we also offer invoice-based billing and custom payment terms.",
      category: "Billing"
    },
    {
      question: "How do I become a service provider?",
      answer: "Service providers can earn money by fulfilling manufacturing orders. Apply through our Provider Panel, complete the verification process, and start accepting jobs. We provide training, equipment financing options, and ongoing support.",
      category: "Providers"
    }
  ];

  const supportArticles: SupportArticle[] = [
    {
      title: "Platform Setup Guide",
      description: "Complete walkthrough of setting up your MakrX environment",
      category: "Setup",
      href: "/docs/setup",
      type: "guide"
    },
    {
      title: "Equipment Management Best Practices",
      description: "Learn how to efficiently manage your makerspace equipment",
      category: "Management",
      href: "/docs/equipment",
      type: "article"
    },
    {
      title: "API Integration Tutorial",
      description: "Step-by-step guide to integrating with MakrX APIs",
      category: "Development",
      href: "/docs/api-tutorial",
      type: "video"
    },
    {
      title: "Billing Configuration",
      description: "Set up automated billing and payment processing",
      category: "Billing",
      href: "/docs/billing",
      type: "guide"
    }
  ];

  const filteredFAQs = searchTerm 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    // Handle form submission
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'guide': return <HelpCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
            <span className="text-makrx-blue">Support</span> Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get help with MakrX platforms, find answers to common questions, 
            and connect with our support team.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-makrx-blue focus:border-transparent shadow-sm"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
            <MessageCircle className="w-12 h-12 text-makrx-blue mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Get instant help from our support team</p>
            <button className="bg-makrx-blue text-white px-6 py-2 rounded-lg hover:bg-makrx-blue/90 transition-colors">
              Start Chat
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
            <Mail className="w-12 h-12 text-makrx-yellow mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Send us a detailed message</p>
            <Link 
              to="mailto:support@makrx.org"
              className="bg-makrx-yellow text-makrx-blue px-6 py-2 rounded-lg hover:bg-makrx-yellow/90 transition-colors inline-block"
            >
              Send Email
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
            <Phone className="w-12 h-12 text-makrx-brown mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">Speak with our experts directly</p>
            <Link 
              to="tel:+918047382910"
              className="bg-makrx-brown text-white px-6 py-2 rounded-lg hover:bg-makrx-brown/90 transition-colors inline-block"
            >
              Call Now
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold mb-1">{faq.question}</h3>
                      <span className="text-sm text-gray-500">{faq.category}</span>
                    </div>
                    {expandedFAQ === index ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Popular Articles */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Popular Help Articles</h2>
              <div className="space-y-4">
                {supportArticles.map((article, index) => (
                  <Link
                    key={index}
                    to={article.href}
                    className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-makrx-blue hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1">
                            {getTypeIcon(article.type)}
                            {article.type}
                          </span>
                          <span className="text-xs text-gray-500">{article.category}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{article.title}</h3>
                        <p className="text-gray-600">{article.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6">Contact Us</h2>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Issue</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue focus:border-transparent resize-none"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-makrx-blue text-white py-2 rounded-lg hover:bg-makrx-blue/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-2">Response Times</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Live Chat: Immediate
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Email: Within 4 hours
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Phone: Business hours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
