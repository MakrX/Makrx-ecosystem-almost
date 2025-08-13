import React from 'react';
import { ExternalLink, Building2, Package, Calendar, BarChart3 } from 'lucide-react';

export default function Makerspaces() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-makrx-blue to-blue-800 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Building2 className="w-16 h-16 text-makrx-yellow mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            MakrCave Makerspaces
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Access premium makerspaces with cutting-edge equipment, inventory management, 
            and project collaboration tools. Join a community of creators and innovators.
          </p>
          <a
            href="https://makrcave.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-makrx-yellow text-makrx-blue font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Explore MakrCave
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Complete Makerspace Management
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Inventory Management</h3>
              <p className="text-gray-600 dark:text-gray-400">Track tools, materials, and equipment with real-time availability and automated reordering.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Reservations</h3>
              <p className="text-gray-600 dark:text-gray-400">Book equipment, workstations, and meeting rooms with smart scheduling and conflict resolution.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Project Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">Collaborate on projects, track progress, and share resources with team members.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">BOM Ordering</h3>
              <p className="text-gray-600 dark:text-gray-400">Generate bills of materials and order components directly from integrated suppliers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Carousel */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">See MakrCave in Action</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Dashboard Screenshot</span>
            </div>
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Inventory Screenshot</span>
            </div>
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Project Screenshot</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-makrx-blue">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Makerspace?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join makerspaces worldwide using MakrCave to streamline operations and empower creators.
          </p>
          <a
            href="https://makrcave.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-makrx-yellow text-makrx-blue font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Explore MakrCave
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
