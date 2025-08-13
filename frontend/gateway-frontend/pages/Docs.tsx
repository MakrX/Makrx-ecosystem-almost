import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Code, Wrench, Users, ArrowRight,
  Search, ExternalLink, Download, Star, 
  FileText, Video, HelpCircle, ChevronRight,
  Terminal, Layers, Settings, Zap
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  items: DocItem[];
  color: string;
}

interface DocItem {
  title: string;
  description: string;
  type: 'guide' | 'api' | 'video' | 'example';
  href: string;
  isExternal?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export default function Docs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const docSections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Quick start guides and platform overviews',
      icon: <BookOpen className="w-6 h-6 text-makrx-blue" />,
      color: 'makrx-blue',
      items: [
        {
          title: 'Platform Overview',
          description: 'Understanding the MakrX ecosystem and how all platforms work together',
          type: 'guide',
          href: '/docs/overview',
          difficulty: 'Beginner'
        },
        {
          title: 'Quick Start Guide',
          description: 'Get up and running with MakrX in 5 minutes',
          type: 'guide',
          href: '/docs/quickstart',
          difficulty: 'Beginner'
        },
        {
          title: 'Account Setup',
          description: 'Setting up your account and understanding roles',
          type: 'guide',
          href: '/docs/account-setup',
          difficulty: 'Beginner'
        },
        {
          title: 'Platform Tour (Video)',
          description: '10-minute video walkthrough of all major features',
          type: 'video',
          href: '/docs/video-tour',
          difficulty: 'Beginner'
        }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Complete API documentation for developers',
      icon: <Code className="w-6 h-6 text-makrx-yellow" />,
      color: 'makrx-yellow',
      items: [
        {
          title: 'Authentication API',
          description: 'SSO integration and token management',
          type: 'api',
          href: '/docs/api/auth',
          difficulty: 'Intermediate'
        },
        {
          title: 'MakrCave API',
          description: 'Makerspace management and booking APIs',
          type: 'api',
          href: '/docs/api/makrcave',
          difficulty: 'Intermediate'
        },
        {
          title: 'Store & Orders API',
          description: 'Product catalog and order management',
          type: 'api',
          href: '/docs/api/store',
          difficulty: 'Intermediate'
        },
        {
          title: 'Webhooks',
          description: 'Real-time event notifications',
          type: 'api',
          href: '/docs/api/webhooks',
          difficulty: 'Advanced'
        }
      ]
    },
    {
      id: 'makerspace-guides',
      title: 'Makerspace Management',
      description: 'Guides for running and managing makerspaces',
      icon: <Wrench className="w-6 h-6 text-makrx-brown" />,
      color: 'makrx-brown',
      items: [
        {
          title: 'Setting Up Your Makerspace',
          description: 'Complete guide to configuring MakrCave for your space',
          type: 'guide',
          href: '/docs/makerspace/setup',
          difficulty: 'Intermediate'
        },
        {
          title: 'Equipment Management',
          description: 'Adding, configuring, and maintaining equipment',
          type: 'guide',
          href: '/docs/makerspace/equipment',
          difficulty: 'Intermediate'
        },
        {
          title: 'Member Onboarding',
          description: 'Best practices for onboarding new members',
          type: 'guide',
          href: '/docs/makerspace/members',
          difficulty: 'Beginner'
        },
        {
          title: 'Billing & Pricing Setup',
          description: 'Configure pricing models and billing automation',
          type: 'guide',
          href: '/docs/makerspace/billing',
          difficulty: 'Advanced'
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect MakrX with external tools and services',
      icon: <Layers className="w-6 h-6 text-green-600" />,
      color: 'green-600',
      items: [
        {
          title: 'Keycloak SSO Setup',
          description: 'Integrate with existing identity providers',
          type: 'guide',
          href: '/docs/integrations/sso',
          difficulty: 'Advanced'
        },
        {
          title: 'Payment Gateway Integration',
          description: 'Configure Razorpay, Stripe, and other payment providers',
          type: 'guide',
          href: '/docs/integrations/payments',
          difficulty: 'Advanced'
        },
        {
          title: 'Third-party APIs',
          description: 'Connect with external inventory and manufacturing systems',
          type: 'api',
          href: '/docs/integrations/apis',
          difficulty: 'Advanced'
        },
        {
          title: 'Slack & Discord Bots',
          description: 'Community management and notifications',
          type: 'guide',
          href: '/docs/integrations/chat',
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      id: 'theme-system',
      title: 'Theme System',
      description: 'Dark mode, customization, and design system',
      icon: <Settings className="w-6 h-6 text-purple-600" />,
      color: 'purple-600',
      items: [
        {
          title: 'Theme Demo',
          description: 'Interactive showcase of dark/light mode components',
          type: 'example',
          href: '/theme-demo',
          difficulty: 'Beginner'
        },
        {
          title: 'Theme Implementation',
          description: 'How to implement dark mode in your applications',
          type: 'guide',
          href: '/docs/theming/implementation',
          difficulty: 'Intermediate'
        },
        {
          title: 'Design System',
          description: 'MakrX color palette, typography, and component system',
          type: 'guide',
          href: '/docs/theming/design-system',
          difficulty: 'Beginner'
        },
        {
          title: 'Custom Themes',
          description: 'Creating and deploying custom brand themes',
          type: 'guide',
          href: '/docs/theming/custom',
          difficulty: 'Advanced'
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return <FileText className="w-4 h-4" />;
      case 'api': return <Terminal className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'example': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'bg-blue-100 text-blue-700';
      case 'api': return 'bg-purple-100 text-purple-700';
      case 'video': return 'bg-red-100 text-red-700';
      case 'example': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const allItems = docSections.flatMap(section => 
    section.items.map(item => ({ ...item, sectionId: section.id, sectionTitle: section.title }))
  );

  const filteredItems = searchTerm 
    ? allItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
            <span className="text-makrx-blue">Documentation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive guides, API references, and tutorials to help you 
            get the most out of the MakrX ecosystem.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-makrx-blue focus:border-transparent shadow-sm"
          />
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Search Results ({filteredItems.length})</h2>
            <div className="space-y-4">
              {filteredItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-makrx-blue hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                          {item.type}
                        </span>
                        {item.difficulty && (
                          <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(item.difficulty)}`}>
                            {item.difficulty}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{item.sectionTitle}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Documentation Sections */}
        {!searchTerm && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {docSections.map(section => (
              <div key={section.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className={`bg-${section.color}/10 p-6 border-b border-gray-100`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${section.color}/20 rounded-xl flex items-center justify-center`}>
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{section.title}</h2>
                      <p className="text-gray-600">{section.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    {section.items.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className="block p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getTypeColor(item.type)}`}>
                                {getTypeIcon(item.type)}
                                {item.type}
                              </span>
                              {item.difficulty && (
                                <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(item.difficulty)}`}>
                                  {item.difficulty}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-gradient-to-r from-makrx-blue to-makrx-brown rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="mb-6 opacity-90">
            Can't find what you're looking for? Our community and support team are here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/support"
              className="bg-white text-makrx-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </Link>
            <Link
              to="/community"
              className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Join Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
