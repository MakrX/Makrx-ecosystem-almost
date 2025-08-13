import React from 'react';
import { ExternalLink, ShoppingCart, Package, Wrench, Cpu } from 'lucide-react';

export default function Store() {
  const categories = [
    {
      name: "3D Printers & Filaments",
      description: "Professional 3D printers, high-quality filaments, and printing accessories",
      icon: <Package className="w-8 h-8" />
    },
    {
      name: "Electronics & Components",
      description: "Arduino, Raspberry Pi, sensors, and electronic components for IoT projects",
      icon: <Cpu className="w-8 h-8" />
    },
    {
      name: "Hand Tools & Machines",
      description: "Precision tools, power tools, and fabrication equipment for makers",
      icon: <Wrench className="w-8 h-8" />
    },
    {
      name: "Materials & Supplies",
      description: "Wood, metals, plastics, adhesives, and other materials for projects",
      icon: <ShoppingCart className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <ShoppingCart className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            MakrX.Store
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Your one-stop marketplace for maker tools, components, and materials. 
            Integrated with makerspace inventory systems for seamless project execution.
          </p>
          <a
            href="https://makrx.store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Browse Store
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Integration with Makerspaces */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Connected to Your Makerspace
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inventory Sync</h3>
              <p className="text-gray-600">Automatically sync store purchases with your makerspace inventory management system.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bulk Ordering</h3>
              <p className="text-gray-600">Generate BOMs from projects and order components in bulk with special makerspace pricing.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Project Integration</h3>
              <p className="text-gray-600">Order missing components directly from project BOMs with one-click ordering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Product Categories</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Benefits */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose MakrX.Store?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Curated Selection</h3>
              <p className="text-gray-600">Products chosen by makers, for makers. Only quality tools and components that work.</p>
            </div>

            <div className="bg-white p-8 rounded-xl text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Quick shipping across India with same-day delivery in major cities.</p>
            </div>

            <div className="bg-white p-8 rounded-xl text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with special discounts for makerspace members and bulk orders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Building Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Explore thousands of maker-focused products and get everything you need for your next project.
          </p>
          <a
            href="https://makrx.store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Browse Store
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
