'use client';

import { useState } from 'react';
import { Shield, Settings, Info, CheckCircle, X, Cookie } from 'lucide-react';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
  cookies: Array<{
    name: string;
    purpose: string;
    duration: string;
    domain: string;
  }>;
}

const cookieCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function and cannot be switched off in our systems.',
    required: true,
    enabled: true,
    cookies: [
      {
        name: 'session_id',
        purpose: 'Maintains user session and authentication state',
        duration: 'Session',
        domain: 'makrx.com'
      },
      {
        name: 'csrf_token',
        purpose: 'Security token to prevent cross-site request forgery',
        duration: 'Session',
        domain: 'makrx.com'
      },
      {
        name: 'cookie_consent',
        purpose: 'Stores your cookie preferences',
        duration: '1 year',
        domain: 'makrx.com'
      }
    ]
  },
  {
    id: 'performance',
    name: 'Performance & Analytics',
    description: 'These cookies help us understand how visitors interact with our website by collecting information anonymously.',
    required: false,
    enabled: true,
    cookies: [
      {
        name: '_ga',
        purpose: 'Google Analytics - Distinguishes unique users',
        duration: '2 years',
        domain: '.makrx.com'
      },
      {
        name: '_ga_*',
        purpose: 'Google Analytics - Session and campaign data',
        duration: '2 years',
        domain: '.makrx.com'
      },
      {
        name: 'hotjar_*',
        purpose: 'Hotjar - User behavior analytics and heatmaps',
        duration: '1 year',
        domain: '.makrx.com'
      }
    ]
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'These cookies enhance functionality and personalization, such as remembering your preferences.',
    required: false,
    enabled: false,
    cookies: [
      {
        name: 'theme_preference',
        purpose: 'Remembers your dark/light mode preference',
        duration: '1 year',
        domain: 'makrx.com'
      },
      {
        name: 'language_pref',
        purpose: 'Stores your language selection',
        duration: '1 year',
        domain: 'makrx.com'
      },
      {
        name: 'currency_pref',
        purpose: 'Remembers your preferred currency',
        duration: '1 year',
        domain: 'makrx.com'
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Advertising',
    description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
    required: false,
    enabled: false,
    cookies: [
      {
        name: '_fbp',
        purpose: 'Facebook Pixel - Tracks conversions and retargeting',
        duration: '3 months',
        domain: '.makrx.com'
      },
      {
        name: 'google_ads_*',
        purpose: 'Google Ads - Conversion tracking and remarketing',
        duration: '90 days',
        domain: '.makrx.com'
      },
      {
        name: 'linkedin_*',
        purpose: 'LinkedIn - B2B advertising and analytics',
        duration: '2 years',
        domain: '.makrx.com'
      }
    ]
  }
];

export default function CookiePolicyPage() {
  const [categories, setCategories] = useState(cookieCategories);
  const [showSettings, setShowSettings] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId && !cat.required 
        ? { ...cat, enabled: !cat.enabled }
        : cat
    ));
  };

  const acceptAll = () => {
    setCategories(prev => prev.map(cat => ({ ...cat, enabled: true })));
    setShowSettings(false);
  };

  const acceptEssentialOnly = () => {
    setCategories(prev => prev.map(cat => ({ ...cat, enabled: cat.required })));
    setShowSettings(false);
  };

  const savePreferences = () => {
    // Save preferences to localStorage or send to server
    console.log('Saving cookie preferences:', categories);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Cookie className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Learn about how MakrX uses cookies and similar technologies to enhance your experience on our website.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cookie Settings Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cookie Preferences
            </h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Manage Cookies
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We use cookies and similar technologies to provide, protect, and improve our services. 
            You can manage your preferences below or learn more about our cookie practices.
          </p>

          {showSettings && (
            <div className="border-t dark:border-gray-600 pt-6">
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        {category.required && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={category.enabled}
                          onChange={() => toggleCategory(category.id)}
                          disabled={category.required}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {category.description}
                    </p>
                    
                    <div className="space-y-2">
                      {category.cookies.map((cookie, index) => (
                        <details key={index} className="group">
                          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            {cookie.name}
                          </summary>
                          <div className="mt-2 ml-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <p><strong>Purpose:</strong> {cookie.purpose}</p>
                            <p><strong>Duration:</strong> {cookie.duration}</p>
                            <p><strong>Domain:</strong> {cookie.domain}</p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t dark:border-gray-600">
                <button
                  onClick={acceptAll}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={acceptEssentialOnly}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={savePreferences}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Policy Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              What Are Cookies?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Cookies can be "persistent" (remain on your device until they expire or are deleted) or "session" 
              (deleted when you close your browser).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              How We Use Cookies
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Essential Website Functions</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Authentication, security, and basic website functionality
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Understanding how visitors use our site to improve user experience
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Personalization</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Remembering your preferences and settings for a better experience
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Marketing and Advertising</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Showing relevant advertisements and measuring campaign effectiveness
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We work with trusted third-party partners who may set cookies on our website:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Google Analytics:</strong> Website performance and user behavior analysis</li>
              <li><strong>Google Ads:</strong> Advertising and conversion tracking</li>
              <li><strong>Facebook Pixel:</strong> Social media advertising and remarketing</li>
              <li><strong>Hotjar:</strong> User experience insights through heatmaps and session recordings</li>
              <li><strong>LinkedIn Insight Tag:</strong> Professional network advertising and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Managing Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have several options for managing cookies:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Browser Settings</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Most browsers allow you to control cookies through their settings preferences
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Privacy Tools</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Use privacy-focused browsers or extensions to block tracking cookies
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Our Cookie Settings</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Use the "Manage Cookies" button above to control your preferences on our site
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Data Protection Rights
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Under applicable data protection laws, you have rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Right to access your personal data</li>
              <li>Right to rectify inaccurate personal data</li>
              <li>Right to erase your personal data</li>
              <li>Right to restrict processing of your personal data</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Updates to This Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. 
              We will notify you of any material changes by posting the updated policy on our website and updating the 
              "Last Updated" date below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have questions about this Cookie Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <p className="text-gray-900 dark:text-white"><strong>Email:</strong> privacy@makrx.com</p>
                <p className="text-gray-900 dark:text-white"><strong>Address:</strong> MakrX Inc., 123 Innovation St, San Francisco, CA 94102</p>
                <p className="text-gray-900 dark:text-white"><strong>Data Protection Officer:</strong> dpo@makrx.com</p>
              </div>
            </div>
          </section>

          <div className="text-center pt-8 border-t dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: January 20, 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
