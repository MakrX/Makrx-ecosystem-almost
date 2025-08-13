import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, ArrowLeft, Search, Building2, ShoppingCart,
  GraduationCap, AlertTriangle, Compass, LifeBuoy, Star
} from 'lucide-react';

interface QuickLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({ to, icon, title, description }) => (
  <Link 
    to={to} 
    className="group flex items-start p-6 bg-white rounded-2xl border border-gray-200 hover:border-makrx-blue/30 hover:shadow-lg transition-all duration-300"
  >
    <div className="w-12 h-12 bg-makrx-blue/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-makrx-blue/20 transition-colors">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-makrx-blue transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </Link>
);

export default function NotFound() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Suggest related pages based on the attempted path
  const getSuggestions = () => {
    if (currentPath.includes('makrcave') || currentPath.includes('space')) {
      return [
        { to: '/makrcave', icon: <Building2 className="w-6 h-6 text-makrx-blue" />, title: 'MakrCave', description: 'Explore makerspaces near you' },
        { to: '/makrcave/find', icon: <Search className="w-6 h-6 text-makrx-blue" />, title: 'Find Spaces', description: 'Search for makerspaces and equipment' }
      ];
    } else if (currentPath.includes('store') || currentPath.includes('shop')) {
      return [
        { to: '/store', icon: <ShoppingCart className="w-6 h-6 text-makrx-blue" />, title: 'MakrX Store', description: 'Shop tools and materials' },
        { to: '/store/services', icon: <Building2 className="w-6 h-6 text-makrx-blue" />, title: '3D Printing Services', description: 'Custom manufacturing services' }
      ];
    } else if (currentPath.includes('learn') || currentPath.includes('course')) {
      return [
        { to: '/learn', icon: <GraduationCap className="w-6 h-6 text-makrx-blue" />, title: 'Learning Hub', description: 'Courses and workshops' },
        { to: '/learn/skills', icon: <Star className="w-6 h-6 text-makrx-blue" />, title: 'Skill Development', description: 'Build maker skills' }
      ];
    }
    
    // Default suggestions
    return [
      { to: '/makrcave', icon: <Building2 className="w-6 h-6 text-makrx-blue" />, title: 'MakrCave', description: 'Explore makerspaces near you' },
      { to: '/store', icon: <ShoppingCart className="w-6 h-6 text-makrx-blue" />, title: 'MakrX Store', description: 'Shop tools and materials' },
      { to: '/learn', icon: <GraduationCap className="w-6 h-6 text-makrx-blue" />, title: 'Learning Hub', description: 'Courses and workshops' }
    ];
  };

  const suggestions = getSuggestions();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="mb-12">
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-makrx-blue/10 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-16 h-16 text-makrx-blue" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-gray-500">
            Attempted URL: <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">{currentPath}</code>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-makrx-blue text-white rounded-xl hover:bg-makrx-blue/90 transition-colors font-medium"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <Link 
            to="/search" 
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Link>
        </div>

        {/* Popular Destinations */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Try These Instead
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((suggestion, index) => (
              <QuickLink key={index} {...suggestion} />
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <LifeBuoy className="w-8 h-8 text-makrx-blue mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            If you're having trouble finding what you're looking for, our support team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-makrx-yellow text-makrx-blue rounded-xl hover:bg-yellow-300 transition-colors font-medium"
            >
              Contact Support
            </Link>
            
            <Link 
              to="/help" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Help Center
            </Link>
          </div>
        </div>

        {/* Search Suggestions */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              '3D Printing', 'Laser Cutting', 'Arduino', 'Workshops', 
              'Makerspaces', 'Electronics', 'Wood Working', 'CNC'
            ].map((term) => (
              <Link
                key={term}
                to={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-makrx-blue hover:text-white transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
