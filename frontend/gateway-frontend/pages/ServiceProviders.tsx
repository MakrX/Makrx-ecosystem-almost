import React from 'react';
import { ExternalLink, Zap, DollarSign, Clock, Users } from 'lucide-react';

export default function ServiceProviders() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Zap className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Become a Service Provider
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Join our network of skilled service providers and earn by fulfilling custom manufacturing jobs. 
            First-to-accept system ensures fair job distribution and competitive earnings.
          </p>
          <a
            href="https://auth.makrx.org/register?provider=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Become a Provider
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            How Job Assignment Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold transition-colors">1</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Job Posted</h3>
              <p className="text-gray-600 dark:text-gray-400">Customers upload their designs and requirements through our platform.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold transition-colors">2</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">First-to-Accept</h3>
              <p className="text-gray-600 dark:text-gray-400">Qualified providers receive notifications and can accept jobs on a first-come basis.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold transition-colors">3</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Complete & Earn</h3>
              <p className="text-gray-600 dark:text-gray-400">Fulfill the order, ship to customer, and receive payment through our secure system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Model */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white">Transparent Earnings Model</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900">
              <DollarSign className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Competitive Rates</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Set your own pricing for different services and materials.</p>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">70-85%</div>
              <p className="text-sm text-gray-500 dark:text-gray-500">of job value</p>
            </div>

            <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900">
              <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Quick Payments</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Get paid within 24 hours of successful delivery confirmation.</p>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24hrs</div>
              <p className="text-sm text-gray-500 dark:text-gray-500">payment processing</p>
            </div>

            <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900">
              <Users className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Growing Network</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Access to a rapidly expanding customer base across India.</p>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10K+</div>
              <p className="text-sm text-gray-500 dark:text-gray-500">active customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Provider Success Stories</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl">
              <div className="mb-6">
                <div className="flex text-yellow-400 mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-gray-600 mb-4">
                  "Being a MakrX service provider has transformed my small 3D printing business. 
                  The steady stream of orders and fair pricing has allowed me to expand my operations."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-blue-600">RK</span>
                  </div>
                  <div>
                    <div className="font-semibold">Raj Kumar</div>
                    <div className="text-sm text-gray-500">3D Printing Specialist, Mumbai</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl">
              <div className="mb-6">
                <div className="flex text-yellow-400 mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-gray-600 mb-4">
                  "The first-to-accept system is fair and transparent. I've been able to grow my 
                  laser cutting service from a hobby to a full-time business in just 6 months."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-green-600">PS</span>
                  </div>
                  <div>
                    <div className="font-semibold">Priya Sharma</div>
                    <div className="text-sm text-gray-500">Laser Cutting Expert, Bangalore</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of service providers already earning through the MakrX platform.
          </p>
          <a
            href="https://auth.makrx.org/register?provider=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Become a Provider
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
