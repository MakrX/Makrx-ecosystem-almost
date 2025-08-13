'use client';

import { useState } from 'react';
import { Shield, Download, Mail, FileText, User, Eye, Trash2, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface DataRequest {
  type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection';
  title: string;
  description: string;
  icon: any;
  processingTime: string;
}

const dataRequests: DataRequest[] = [
  {
    type: 'access',
    title: 'Right of Access',
    description: 'Request a copy of the personal data we hold about you',
    icon: Eye,
    processingTime: '30 days'
  },
  {
    type: 'portability',
    title: 'Data Portability',
    description: 'Receive your data in a structured, machine-readable format',
    icon: Download,
    processingTime: '30 days'
  },
  {
    type: 'rectification',
    title: 'Right to Rectification',
    description: 'Request correction of inaccurate or incomplete personal data',
    icon: Settings,
    processingTime: '30 days'
  },
  {
    type: 'erasure',
    title: 'Right to Erasure',
    description: 'Request deletion of your personal data ("right to be forgotten")',
    icon: Trash2,
    processingTime: '30 days'
  },
  {
    type: 'restriction',
    title: 'Restriction of Processing',
    description: 'Request limitation of how we process your personal data',
    icon: Shield,
    processingTime: '30 days'
  },
  {
    type: 'objection',
    title: 'Right to Object',
    description: 'Object to processing of your data for specific purposes',
    icon: FileText,
    processingTime: '30 days'
  }
];

export default function GDPRPage() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    requestType: '',
    description: '',
    verificationMethod: 'email'
  });

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('GDPR request submitted:', formData);
    // Handle form submission
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              GDPR Data Protection Rights
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Exercise your rights under the General Data Protection Regulation (GDPR). 
              We're committed to protecting your privacy and ensuring transparent data practices.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Rights */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rights Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Your Data Protection Rights
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataRequests.map((request) => {
                  const Icon = request.icon;
                  return (
                    <div
                      key={request.type}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedRequest === request.type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRequest(request.type)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {request.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {request.description}
                          </p>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Processing time: {request.processingTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Request Form */}
            {selectedRequest && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Submit Data Protection Request
                </h3>
                
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Request Type *
                    </label>
                    <select
                      required
                      value={formData.requestType}
                      onChange={(e) => handleInputChange('requestType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select request type</option>
                      {dataRequests.map((request) => (
                        <option key={request.type} value={request.type}>
                          {request.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Details
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Please provide any additional details about your request..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Identity Verification Method *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="verification"
                          value="email"
                          checked={formData.verificationMethod === 'email'}
                          onChange={(e) => handleInputChange('verificationMethod', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Email verification (we'll send a confirmation link)
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="verification"
                          value="document"
                          checked={formData.verificationMethod === 'document'}
                          onChange={(e) => handleInputChange('verificationMethod', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Document upload (government-issued ID)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">Identity Verification Required</p>
                        <p>
                          To protect your privacy, we need to verify your identity before processing your request. 
                          This ensures that personal data is only disclosed to the rightful individual.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Submit Request
                  </button>
                </form>
              </div>
            )}

            {/* Data Processing Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                How We Process Your Data
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Data We Collect
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Account information (name, email, phone number)</li>
                    <li>• Order and transaction history</li>
                    <li>• Website usage analytics and preferences</li>
                    <li>• Communication records and support interactions</li>
                    <li>• Device information and IP addresses</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Legal Basis for Processing
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• <strong>Contract:</strong> To provide our services and fulfill orders</li>
                    <li>• <strong>Legitimate Interest:</strong> To improve our services and security</li>
                    <li>• <strong>Consent:</strong> For marketing communications and cookies</li>
                    <li>• <strong>Legal Obligation:</strong> For tax records and compliance</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Data Retention
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Account data: Retained while account is active</li>
                    <li>• Transaction records: 7 years for tax compliance</li>
                    <li>• Marketing data: Until consent is withdrawn</li>
                    <li>• Analytics data: Anonymized after 26 months</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Data Protection Officer
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">dpo@makrx.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Address</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      MakrX Inc.<br />
                      123 Innovation St<br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                  <Download className="w-4 h-4" />
                  Download Privacy Policy
                </button>
                <button className="w-full flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                  <FileText className="w-4 h-4" />
                  Cookie Policy
                </button>
                <button className="w-full flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                  <Settings className="w-4 h-4" />
                  Manage Cookie Preferences
                </button>
              </div>
            </div>

            {/* Processing Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Request Processing
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Submit Request</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Immediate</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Identity Verification</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1-3 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Processing</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Up to 30 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Completion</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Notification sent</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisory Authority */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Supervisory Authority
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                If you're not satisfied with our response, you have the right to lodge a complaint with your local data protection authority.
              </p>
              <a
                href="https://ec.europa.eu/justice/article-29/structure/data-protection-authorities/index_en.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Find your local DPA →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
