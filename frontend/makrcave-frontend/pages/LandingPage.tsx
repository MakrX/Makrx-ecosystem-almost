import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowRight, MapPin, Users, Zap, Shield, Star, ChevronRight, Play, ExternalLink, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveMap from '../components/InteractiveMap';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Public Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-2xl font-bold text-white">MakrCave</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <div className="relative group">
                <button className="text-white/80 hover:text-white transition-colors flex items-center">
                  MakrX Ecosystem
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-64 bg-black/90 backdrop-blur-md border border-white/20 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 space-y-2">
                    <a href="https://makrx.org" className="block p-2 hover:bg-white/10 rounded-md">
                      <div className="font-medium text-white">MakrX.org</div>
                      <div className="text-sm text-white/70">Ecosystem gateway & maker hub</div>
                    </a>
                    <div className="block p-2 bg-blue-500/20 rounded-md">
                      <div className="font-medium text-blue-400">MakrCave</div>
                      <div className="text-sm text-blue-300/70">You are here - Makerspace management</div>
                    </div>
                    <a href="https://makrx.store" className="block p-2 hover:bg-white/10 rounded-md">
                      <div className="font-medium text-white">MakrX.Store</div>
                      <div className="text-sm text-white/70">E-commerce & fabrication hub</div>
                    </a>
                  </div>
                </div>
              </div>
              <Link to="/find-makerspace" className="text-white/80 hover:text-white transition-colors">Find Makerspace</Link>
              <Link to="/makrverse" className="text-white/80 hover:text-white transition-colors">MakrVerse</Link>
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#institutions" className="text-white/80 hover:text-white transition-colors">Institutions</a>
              <Link to="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/register" className="text-white/80 hover:text-white transition-colors">
                Join the Movement
              </Link>
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none">
                  Go to Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 z-40">
            <div className="container mx-auto px-6 py-4">
              <nav className="flex flex-col space-y-4">
                <a href="#explore" className="text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Explore</a>
                <Link to="/makrverse" className="text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>MakrVerse</Link>
                <a href="#features" className="text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                <a href="#institutions" className="text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Institutions</a>
                <a href="#community" className="text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Community</a>
                <hr className="border-white/20" />
                <Link to="/register" className="text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Join the Movement
                </Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none w-full">
                    Go to Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Responsive Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
        <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-6 sm:mb-8 leading-tight">
              Complete{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Makerspace
              </span>{' '}
              Management
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto">
              The heart of the MakrX ecosystem: comprehensive management for inventory, equipment, skills, service orders, and community collaboration — all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-lg sm:max-w-none mx-auto">
              <Link to="/find-makerspace">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                  <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Find a MakrCave
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-40 animation-delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-50 animation-delay-500"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse opacity-30 animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-300 rounded-full animate-pulse opacity-40 animation-delay-1500"></div>
        </div>
      </section>

      {/* What is MakrCave */}
      <section className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What is MakrCave?
            </h2>
            <p className="text-xl text-white/80 leading-relaxed mb-4">
              The comprehensive makerspace management platform within the MakrX ecosystem — connecting makers with the tools, resources, and community they need to bring ideas to life.
            </p>
            <p className="text-lg text-white/70 leading-relaxed">
              A complete solution for running any makerspace with integrated business operations, community building, service provider capabilities, and seamless connections to MakrX.org and MakrX.Store.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: '📦', label: 'Smart Inventory', desc: 'Auto-tracking with MakrX.Store integration' },
              { icon: '🏗️', label: 'Project Hub', desc: 'BOMs, collaboration & ecosystem sync' },
              { icon: '📅', label: 'Equipment Access', desc: 'Skill-gated booking & safety control' },
              { icon: '⚙️', label: 'Service Orders', desc: 'Full fabrication job lifecycle management' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.label}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MakrVerse Live Map */}
      <section id="explore" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Enter the MakrVerse
            </h2>
            <p className="text-xl text-white/80">Live map of the global maker world</p>
          </div>

          <div className="max-w-6xl mx-auto mb-12">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
              <CardContent className="p-0">
                {/* MakrVerse Preview */}
                <div className="relative h-96 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
                  {/* Simulated world map with MakrCaves */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Continents */}
                      <div className="absolute top-1/4 left-1/3 w-32 h-24 bg-green-700/20 rounded-full blur-sm"></div>
                      <div className="absolute top-1/3 right-1/4 w-28 h-20 bg-green-600/20 rounded-lg blur-sm"></div>
                      <div className="absolute bottom-1/3 left-1/4 w-24 h-16 bg-green-700/20 rounded-full blur-sm"></div>

                      {/* Active MakrCaves */}
                      <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                      <div className="absolute bottom-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                      <div className="absolute top-2/3 left-2/3 w-4 h-4 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>

                      {/* Connection lines */}
                      <svg className="absolute inset-0 w-full h-full opacity-30">
                        <line x1="33%" y1="33%" x2="66%" y2="50%" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1" className="animate-pulse" />
                        <line x1="66%" y1="50%" x2="50%" y2="50%" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1" className="animate-pulse" />
                        <line x1="50%" y1="50%" x2="66%" y2="66%" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1" className="animate-pulse" />
                      </svg>

                      {/* Live activity indicators */}
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md rounded-lg px-3 py-2">
                        <div className="flex items-center text-green-400 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span>234 Makers Online</span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md rounded-lg px-3 py-2">
                        <div className="flex items-center text-yellow-400 text-sm">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                          <span>67 Machines Running</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overlay content */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-white mb-4">Google Earth for Makers</h3>
                      <p className="text-lg text-white/80 mb-6 max-w-md">
                        Watch real-time projects, discover AR exploration points, and earn travel badges
                      </p>
                      <Link to="/makrverse">
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 text-lg">
                          <MapPin className="mr-2 h-5 w-5" />
                          Explore MakrVerse
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MakrVerse Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-white mb-2">Live Global Map</h3>
                <p className="text-white/70">Real-time view of all MakrCaves, active projects, and running machines worldwide</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">👀</div>
                <h3 className="text-xl font-semibold text-white mb-2">AR Exploration</h3>
                <p className="text-white/70">Discover hidden AR points, explore maker history, and unlock future visions</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-white mb-2">Travel Badges</h3>
                <p className="text-white/70">Earn achievements as you explore caves, connect with makers, and discover new technologies</p>
              </CardContent>
            </Card>
          </div>

          {/* Original Explore Section */}
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Find MakrCaves Near You
            </h3>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-md border-white/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <InteractiveMap />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/portal/map">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      See Full Map
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Start Your Own MakrCave
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Is It For */}
      <section className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Who Is It For?
            </h2>
            <p className="text-xl text-white/80">MakrCave serves four primary roles in the makerspace ecosystem</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              {
                emoji: '👑',
                title: 'Super Admins',
                message: 'Control all makerspaces & global settings.',
                features: ['Global makerspace management', 'System-wide analytics', 'Feature flag control']
              },
              {
                emoji: '🏭',
                title: 'Makerspace Admins',
                message: 'Manage inventory, members, and operations.',
                features: ['Member management', 'Inventory control', 'Equipment oversight']
              },
              {
                emoji: '⚙️',
                title: 'Service Providers',
                message: 'Receive and process fabrication jobs.',
                features: ['Job management', 'Material tracking', 'Quality control']
              },
              {
                emoji: '👨‍🔧',
                title: 'Makerspace Members',
                message: 'Use equipment, work on projects, collaborate.',
                features: ['Equipment reservations', 'Project management', 'BOM collaboration']
              }
            ].map((audience, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="text-5xl mb-4">{audience.emoji}</div>
                  <CardTitle className="text-white text-xl">{audience.title}</CardTitle>
                  <CardDescription className="text-white/80">{audience.message}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {audience.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center text-white/70">
                        <ChevronRight className="h-4 w-4 mr-2 text-blue-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Integrations */}
      <section className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="text-blue-400">MakrX</span> Ecosystem Integration
            </h2>
            <p className="text-xl text-white/80">Seamlessly connected across the unified platform for makers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: '🛒',
                title: 'MakrX.Store',
                description: 'Integrated e-commerce: instant BOM ordering, quick reorders, and automated material procurement'
              },
              {
                icon: '🌍',
                title: 'MakrX.org',
                description: 'Unified ecosystem gateway: single sign-on, maker profiles, and global makerspace discovery'
              },
              {
                icon: '🎓',
                title: 'Learning Module',
                description: 'Skill badge verification for equipment access control'
              },
              {
                icon: '📡',
                title: 'Hardware Edge Nodes',
                description: 'Machine access control via NFC, QR codes, and biometric authentication'
              },
              {
                icon: '🔄',
                title: 'Slicing APIs',
                description: 'Automatic material use calculation and inventory deduction'
              },
              {
                icon: '🚀',
                title: 'Feature Flags',
                description: 'Enable/disable modules dynamically for different makerspaces'
              }
            ].map((integration, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <div className="text-5xl mb-4 text-center">{integration.icon}</div>
                  <CardTitle className="text-white text-center">{integration.title}</CardTitle>
                  <CardDescription className="text-white/80 text-center">{integration.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Inside the System */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Inside the System
            </h2>
            <p className="text-xl text-white/80">Powered by cutting-edge technology</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Skill-Gated Machine Access',
                description: 'Machines require specific skill badges with NFC/QR/fingerprint access control'
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Smart Inventory Management',
                description: 'Track filament rolls, auto-deduction, low stock alerts, quick MakrX.Store reorders'
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Project & BOM Management',
                description: 'Team collaboration with BOMs linked directly to MakrX.Store product codes'
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: 'Job Management System',
                description: 'Service providers receive jobs, upload G-code, track materials automatically'
              },
              {
                icon: <ArrowRight className="h-8 w-8" />,
                title: 'Equipment Reservations',
                description: 'Book machines with cost rules: free for members, paid per hour, or subscription included'
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                title: 'Membership & Analytics',
                description: 'Membership plans, usage reports, equipment utilization, revenue tracking'
              }
            ].map((feature, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <div className="text-blue-400 mb-4">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-white/80">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              Explore Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* The Movement */}
      <section className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              The Movement
            </h2>
            <blockquote className="text-2xl md:text-3xl text-white/90 italic mb-8 leading-relaxed">
              "Open making. Real skills. Shared knowledge. Join the mission to make making accessible to everyone, everywhere."
            </blockquote>
            <p className="text-xl text-white/80 mb-8">
              We're not just building a platform — we're creating a revolution in how people learn, create, and collaborate.
            </p>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg px-6 py-2">
              Join the Mission
            </Badge>
          </div>
        </div>
      </section>

      {/* MakrCave x Institutions */}
      <section id="institutions" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              MakrCave × Institutions
            </h2>
            <p className="text-xl text-white/80">For colleges, libraries, schools, R&D labs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Scale Your Educational Impact</h3>
              <div className="space-y-6">
                {[
                  { title: 'Real-Time Analytics', desc: 'Track usage, engagement, and learning outcomes across all equipment' },
                  { title: 'Skill-Based Access', desc: 'Automated safety protocols with competency verification' },
                  { title: 'Integrated Learning', desc: 'Connected to the global MakrX ecosystem and community' },
                  { title: 'Scalable Platform', desc: 'Enterprise-grade infrastructure that grows with your institution' }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="bg-blue-500 rounded-full p-2 mt-1">
                      <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{benefit.title}</h4>
                      <p className="text-white/70">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                Get a Demo for Your Institution
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <div className="space-y-4">
                <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                <div className="h-4 bg-purple-400 rounded w-1/2"></div>
                <div className="h-4 bg-cyan-400 rounded w-2/3"></div>
                <div className="text-center text-white/60 py-8">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Interactive Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Become a MakrCave */}
      <section className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the <span className="text-blue-400">MakrX</span> Network
            </h2>
            <p className="text-xl text-white/80">Connect your makerspace to the global ecosystem</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { step: '01', title: 'Apply', desc: 'Submit your makerspace to join the MakrX ecosystem' },
                { step: '02', title: 'Setup', desc: 'Complete integration with ecosystem support and training' },
                { step: '03', title: 'Launch', desc: 'Go live as part of the global MakrX network' }
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-white/70">{step.desc}</p>
                </div>
              ))}
            </div>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Network Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    'MakrX.Store integration & bulk ordering',
                    'Fabrication job forwarding & revenue',
                    'Ecosystem-wide member access & growth'
                  ].map((benefit, idx) => (
                    <div key={idx} className="text-center">
                      <div className="bg-blue-500/20 rounded-lg p-4 mb-3">
                        <Star className="h-6 w-6 text-blue-400 mx-auto" />
                      </div>
                      <p className="text-white/80">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-white/80">Real humans, real builds</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "MakrCave transformed how our engineering students learn. The skill-gated access ensures safety while encouraging exploration.",
                author: "Dr. Sarah Chen",
                role: "Engineering Dean, Tech University",
                project: "Built robotic arm prototype"
              },
              {
                quote: "As a makerspace owner, the analytics and automated systems have doubled our efficiency and member satisfaction.",
                author: "Marcus Johnson",
                role: "MakrSpace Austin Owner",
                project: "Scaled from 50 to 200 members"
              },
              {
                quote: "The community aspect is incredible. I've learned more in 6 months than I did in years of solo tinkering.",
                author: "Alex Rivera",
                role: "Hobbyist Maker",
                project: "3D printed prosthetic hand"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-white/90 mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="text-white">
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-white/70">{testimonial.role}</div>
                    <div className="text-sm text-blue-400 mt-1">{testimonial.project}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section id="community" className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the Community
            </h2>
            <p className="text-xl text-white/80">Connect, learn, and build together</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Discord & Forums</CardTitle>
                <CardDescription className="text-white/80">
                  Join thousands of makers sharing knowledge and projects
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
                  Join Discord
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Events & Hackathons</CardTitle>
                <CardDescription className="text-white/80">
                  Participate in global making events and competitions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  View Events
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Project Showcase</CardTitle>
                <CardDescription className="text-white/80">
                  Share your builds and get inspired by others
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Explore Projects
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black/40 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold text-white">MakrCave</span>
              </div>
              <p className="text-white/70 mb-4">
                Comprehensive makerspace management within the MakrX ecosystem.
              </p>
              <p className="text-white/60 text-sm">
                MakrX is an initiative by Botness Technologies Pvt. Ltd.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Discover</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/find-makerspace" className="hover:text-white transition-colors">Find MakrCave</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Start a MakrCave</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">For Organizations</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#institutions" className="hover:text-white transition-colors">Institutions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2024 MakrX by Botness Technologies Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link to="/login" className="text-white/60 hover:text-white text-sm transition-colors">
                Portal Login
              </Link>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
