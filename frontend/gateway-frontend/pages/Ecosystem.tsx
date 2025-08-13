import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ShoppingCart, GraduationCap, Settings, 
  ArrowRight, ExternalLink, Users, Wrench, Zap, 
  Globe, Shield, Star, CheckCircle, Play
} from 'lucide-react';

interface AppCardProps {
  name: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  isExternal?: boolean;
  isNew?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ 
  name, description, features, cta, href, icon, color, isExternal, isNew 
}) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:scale-105">
    <div className="flex items-center justify-between mb-6">
      <div className={`w-16 h-16 bg-${color}/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      {isNew && (
        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">New</span>
      )}
    </div>
    
    <h3 className="text-2xl font-bold text-gray-900 mb-3">{name}</h3>
    <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
    
    <div className="space-y-2 mb-6">
      {features.map((feature, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{feature}</span>
        </div>
      ))}
    </div>

    <Link
      to={href}
      className={`w-full bg-${color} text-white py-3 px-6 rounded-lg hover:bg-${color}/90 transition-colors flex items-center justify-center gap-2 group`}
    >
      {cta}
      {isExternal ? <ExternalLink className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
    </Link>
  </div>
);

export default function Ecosystem() {
  const apps: AppCardProps[] = [
    {
      name: "MakrCave",
      description: "Complete makerspace management platform for inventory, bookings, and project collaboration.",
      features: [
        "Equipment reservation system",
        "Real-time inventory tracking", 
        "Project management tools",
        "Member billing & analytics"
      ],
      cta: "Open MakrCave",
      href: "/makrcave",
      icon: <Building2 className="w-8 h-8 text-makrx-blue" />,
      color: "makrx-blue"
    },
    {
      name: "MakrX Store",
      description: "Marketplace for maker products, tools, and custom manufacturing services.",
      features: [
        "Instant 3D printing quotes",
        "Global manufacturing network",
        "Quality guaranteed orders",
        "Bulk pricing & discounts"
      ],
      cta: "Browse Store",
      href: "/store",
      icon: <ShoppingCart className="w-8 h-8 text-makrx-yellow" />,
      color: "makrx-yellow"
    },
    {
      name: "Learn Platform",
      description: "Comprehensive learning hub with courses, certifications, and skill tracking.",
      features: [
        "50+ expert-led courses",
        "Hands-on project tutorials",
        "Skill badges & certificates",
        "Community discussions"
      ],
      cta: "Start Learning",
      href: "/learn",
      icon: <GraduationCap className="w-8 h-8 text-makrx-brown" />,
      color: "makrx-brown"
    },
    {
      name: "Service Provider Panel",
      description: "Earn money by fulfilling manufacturing orders through our global network.",
      features: [
        "First-to-accept job system",
        "Automated quality checks",
        "Payment protection",
        "Performance analytics"
      ],
      cta: "Become Provider",
      href: "#",
      icon: <Settings className="w-8 h-8 text-green-600" />,
      color: "green-600",
      isExternal: true,
      isNew: true
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
            <span className="text-makrx-blue">MakrX</span> Ecosystem
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A complete suite of interconnected platforms designed to empower makers, 
            streamline manufacturing, and accelerate innovation worldwide.
          </p>
        </div>

        {/* Ecosystem Flow */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">How It All Works Together</h2>
            <p className="text-muted-foreground">Seamless integration across all platforms</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-makrx-blue/20 rounded-full flex items-center justify-center">
                <span className="text-makrx-blue font-bold">1</span>
              </div>
              <span className="font-medium">Join MakrCave</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-makrx-yellow/20 rounded-full flex items-center justify-center">
                <span className="text-makrx-yellow font-bold">2</span>
              </div>
              <span className="font-medium">Order from Store</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <span className="font-medium">Provider Fulfills</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-makrx-brown/20 rounded-full flex items-center justify-center">
                <span className="text-makrx-brown font-bold">4</span>
              </div>
              <span className="font-medium">Learn & Iterate</span>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {apps.map((app, index) => (
            <AppCard key={index} {...app} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-makrx-blue to-makrx-brown rounded-3xl p-12 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Ecosystem Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-white/80">Active Makerspaces</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Registered Makers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white/80">Global Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-white/80">Order Success Rate</div>
            </div>
          </div>
        </div>

        {/* Integration Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <Zap className="w-12 h-12 text-makrx-yellow mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Unified Experience</h3>
            <p className="text-muted-foreground">
              Single sign-on across all platforms with synchronized user profiles and preferences.
            </p>
          </div>
          <div className="text-center p-6">
            <Globe className="w-12 h-12 text-makrx-blue mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Global Network</h3>
            <p className="text-muted-foreground">
              Access to worldwide manufacturing capabilities and makerspace communities.
            </p>
          </div>
          <div className="text-center p-6">
            <Shield className="w-12 h-12 text-makrx-brown mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Quality Assurance</h3>
            <p className="text-muted-foreground">
              End-to-end quality control with verified providers and guaranteed outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
