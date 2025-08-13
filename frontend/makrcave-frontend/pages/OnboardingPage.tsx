import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import TutorialOverlay from '../components/onboarding/TutorialOverlay';
import QuickStartWizard from '../components/onboarding/QuickStartWizard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ArrowRight, CheckCircle, Clock, Users, Zap, Star,
  Play, BookOpen, MessageCircle, Gift, Target
} from 'lucide-react';

interface OnboardingState {
  stage: 'welcome' | 'profile_setup' | 'tutorial' | 'quick_start' | 'completed';
  userType: 'maker' | 'admin' | 'provider' | 'super_admin' | '';
  completedSteps: string[];
  showTutorial: boolean;
  showQuickStart: boolean;
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    stage: 'welcome',
    userType: '',
    completedSteps: [],
    showTutorial: false,
    showQuickStart: false
  });

  // Check if user is returning from invitation or specific flow
  const inviteCode = searchParams.get('invite');
  const userTypeParam = searchParams.get('type') as 'maker' | 'admin' | 'provider' | 'super_admin';
  const skipToParam = searchParams.get('skip_to');

  useEffect(() => {
    // Handle URL parameters for direct flows
    if (userTypeParam) {
      setOnboardingState(prev => ({ ...prev, userType: userTypeParam }));
    }
    
    if (skipToParam === 'tutorial') {
      setOnboardingState(prev => ({ ...prev, stage: 'tutorial', showTutorial: true }));
    } else if (skipToParam === 'quick_start') {
      setOnboardingState(prev => ({ ...prev, stage: 'quick_start', showQuickStart: true }));
    }
  }, [userTypeParam, skipToParam]);

  // Tutorial steps for different user types
  const getTutorialSteps = (userType: string) => {
    const commonSteps = [
      {
        id: 'header',
        target: '[data-tutorial="header"]',
        title: 'Welcome to Your Dashboard',
        content: 'This is your command center. Everything you need is accessible from here.',
        position: 'bottom' as const,
        tip: 'Click the MakrCave logo anytime to return to the dashboard'
      },
      {
        id: 'navigation',
        target: '[data-tutorial="navigation"]',
        title: 'Main Navigation',
        content: 'Use this sidebar to navigate between different sections of the platform.',
        position: 'right' as const,
        action: 'hover' as const,
        actionText: 'Hover over items to see details'
      },
      {
        id: 'profile',
        target: '[data-tutorial="profile"]',
        title: 'Your Profile',
        content: 'Keep your profile updated to connect with the right people and opportunities.',
        position: 'left' as const,
        action: 'click' as const
      }
    ];

    const makerSteps = [
      ...commonSteps,
      {
        id: 'projects',
        target: '[data-tutorial="projects"]',
        title: 'Your Projects',
        content: 'Create and manage your projects here. Collaborate with others and track progress.',
        position: 'bottom' as const,
        tip: 'Projects can be public or private depending on your preference'
      },
      {
        id: 'equipment',
        target: '[data-tutorial="equipment"]',
        title: 'Equipment Booking',
        content: 'Reserve equipment for your projects. Check availability and book time slots.',
        position: 'top' as const,
        action: 'click' as const,
        actionText: 'Click to view available equipment'
      }
    ];

    const adminSteps = [
      ...commonSteps,
      {
        id: 'analytics',
        target: '[data-tutorial="analytics"]',
        title: 'Analytics Dashboard',
        content: 'Monitor your makerspace usage, member activity, and equipment utilization.',
        position: 'bottom' as const,
        tip: 'Data updates in real-time to help you make informed decisions'
      },
      {
        id: 'members',
        target: '[data-tutorial="members"]',
        title: 'Member Management',
        content: 'Add new members, manage permissions, and track membership status.',
        position: 'right' as const
      },
      {
        id: 'inventory',
        target: '[data-tutorial="inventory"]',
        title: 'Inventory Control',
        content: 'Track materials, manage stock levels, and set up automatic reordering.',
        position: 'left' as const,
        tip: 'Connect to MakrX.Store for seamless inventory management'
      }
    ];

    switch (userType) {
      case 'maker':
        return makerSteps;
      case 'admin':
        return adminSteps;
      default:
        return commonSteps;
    }
  };

  const handleProfileSetupComplete = (userType: string) => {
    setOnboardingState(prev => ({
      ...prev,
      stage: 'tutorial',
      userType: userType as any,
      showTutorial: true
    }));
  };

  const handleTutorialComplete = () => {
    setOnboardingState(prev => ({
      ...prev,
      stage: 'quick_start',
      showTutorial: false,
      showQuickStart: true
    }));
  };

  const handleQuickStartComplete = () => {
    setOnboardingState(prev => ({
      ...prev,
      stage: 'completed',
      showQuickStart: false
    }));
    
    // Navigate to appropriate dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleSkipToQuickStart = () => {
    setOnboardingState(prev => ({
      ...prev,
      stage: 'quick_start',
      showQuickStart: true
    }));
  };

  const handleSkipAll = () => {
    navigate('/dashboard');
  };

  if (onboardingState.stage === 'profile_setup' || onboardingState.stage === 'welcome') {
    return <OnboardingFlow />;
  }

  if (onboardingState.stage === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6">
              🎉 You're All Set!
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Welcome to the MakrCave community! Your dashboard is loading and you'll be 
              redirected shortly. Time to start making amazing things!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Users, label: 'Connected', desc: 'Join 10k+ makers' },
                { icon: Zap, label: 'Equipped', desc: 'Access smart tools' },
                { icon: Star, label: 'Ready', desc: 'Start creating' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center p-4 bg-white/5 rounded-lg">
                  <item.icon className="h-8 w-8 text-blue-400 mb-2" />
                  <span className="font-semibold text-white">{item.label}</span>
                  <span className="text-sm text-gray-400">{item.desc}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
            >
              Enter Dashboard Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mock Dashboard for Tutorial */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header 
          data-tutorial="header"
          className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MakrCave</span>
              <Badge className="bg-green-100 text-green-700">Tutorial Mode</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <div 
                data-tutorial="profile"
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg px-3 py-2"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <nav 
            data-tutorial="navigation"
            className="w-64 bg-white shadow-sm h-screen border-r border-gray-200"
          >
            <div className="p-6">
              <div className="space-y-2">
                {[
                  { icon: Target, label: 'Dashboard', active: true },
                  { icon: BookOpen, label: 'Projects', badge: '3' },
                  { icon: Clock, label: 'Equipment', notification: true },
                  { icon: Users, label: 'Community' },
                  { icon: Gift, label: 'Store' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
                      item.active 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.notification && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, John! 👋
                </h1>
                <p className="text-gray-600">Here's what's happening in your makerspace today.</p>
              </div>

              {/* Tutorial Trigger Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card data-tutorial="projects" className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">My Projects</h3>
                        <p className="text-gray-600 text-sm">3 active projects</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-tutorial="equipment" className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Equipment</h3>
                        <p className="text-gray-600 text-sm">2 reservations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-tutorial="analytics" className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Analytics</h3>
                        <p className="text-gray-600 text-sm">View insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skip Options */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleSkipToQuickStart}
                  className="border-gray-300"
                >
                  Skip Tutorial
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkipAll}
                  className="text-gray-500"
                >
                  Skip All & Go to Dashboard
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Tutorial Overlay */}
      {onboardingState.showTutorial && (
        <TutorialOverlay
          isVisible={onboardingState.showTutorial}
          onClose={() => setOnboardingState(prev => ({ ...prev, showTutorial: false }))}
          steps={getTutorialSteps(onboardingState.userType)}
          onComplete={handleTutorialComplete}
          autoPlay={true}
          canSkip={true}
        />
      )}

      {/* Quick Start Wizard */}
      {onboardingState.showQuickStart && (
        <QuickStartWizard
          userType={onboardingState.userType as any}
          onClose={() => setOnboardingState(prev => ({ ...prev, showQuickStart: false }))}
          onActionComplete={(actionId) => {
            setOnboardingState(prev => ({
              ...prev,
              completedSteps: [...prev.completedSteps, actionId]
            }));
          }}
        />
      )}
    </div>
  );
};

export default OnboardingPage;
