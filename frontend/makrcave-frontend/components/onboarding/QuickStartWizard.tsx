import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Rocket, CheckCircle, Clock, Users, MapPin, Zap, Star, 
  ArrowRight, Target, Award, Coffee, Calendar, Settings,
  Lightbulb, TrendingUp, BookOpen, Heart, Package
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'setup' | 'explore' | 'create' | 'connect';
  action: () => void;
  completed: boolean;
}

interface QuickStartWizardProps {
  userType: 'user' | 'admin' | 'provider' | 'super_admin';
  onClose: () => void;
  onActionComplete: (actionId: string) => void;
}

const QuickStartWizard: React.FC<QuickStartWizardProps> = ({
  userType,
  onClose,
  onActionComplete
}) => {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [currentCategory, setCurrentCategory] = useState<string>('setup');
  const [showCelebration, setShowCelebration] = useState(false);

  const getActionsForUserType = (type: string): QuickAction[] => {
    const commonActions = [
      {
        id: 'complete_profile',
        title: 'Complete Your Profile',
        description: 'Add a photo, bio, and interests to help others connect with you',
        icon: Users,
        estimatedTime: '3 min',
        difficulty: 'easy' as const,
        category: 'setup' as const,
        action: () => console.log('Navigate to profile'),
        completed: false
      },
      {
        id: 'explore_community',
        title: 'Explore the Community',
        description: 'Browse maker profiles and see what others are building',
        icon: Heart,
        estimatedTime: '5 min',
        difficulty: 'easy' as const,
        category: 'explore' as const,
        action: () => console.log('Navigate to community'),
        completed: false
      },
      {
        id: 'join_discord',
        title: 'Join Our Discord',
        description: 'Connect with makers in real-time chat and get help',
        icon: Users,
        estimatedTime: '2 min',
        difficulty: 'easy' as const,
        category: 'connect' as const,
        action: () => window.open('https://discord.gg/makrcave', '_blank'),
        completed: false
      }
    ];

    const makerActions = [
      ...commonActions,
      {
        id: 'find_makerspace',
        title: 'Find a MakrCave Near You',
        description: 'Discover makerspaces in your area and book your first visit',
        icon: MapPin,
        estimatedTime: '5 min',
        difficulty: 'easy' as const,
        category: 'explore' as const,
        action: () => console.log('Navigate to map'),
        completed: false
      },
      {
        id: 'create_first_project',
        title: 'Start Your First Project',
        description: 'Create a project and add it to your portfolio',
        icon: Lightbulb,
        estimatedTime: '10 min',
        difficulty: 'medium' as const,
        category: 'create' as const,
        action: () => console.log('Navigate to new project'),
        completed: false
      },
      {
        id: 'book_equipment',
        title: 'Book Equipment',
        description: 'Reserve your first piece of equipment for a project',
        icon: Calendar,
        estimatedTime: '5 min',
        difficulty: 'easy' as const,
        category: 'create' as const,
        action: () => console.log('Navigate to booking'),
        completed: false
      },
      {
        id: 'take_skill_assessment',
        title: 'Take a Skill Assessment',
        description: 'Demonstrate your abilities and unlock equipment access',
        icon: Award,
        estimatedTime: '15 min',
        difficulty: 'medium' as const,
        category: 'setup' as const,
        action: () => console.log('Navigate to skills'),
        completed: false
      }
    ];

    const adminActions = [
      ...commonActions,
      {
        id: 'setup_makerspace',
        title: 'Complete Makerspace Setup',
        description: 'Add equipment, set pricing, and configure your space',
        icon: Settings,
        estimatedTime: '20 min',
        difficulty: 'medium' as const,
        category: 'setup' as const,
        action: () => console.log('Navigate to makerspace setup'),
        completed: false
      },
      {
        id: 'add_equipment',
        title: 'Add Your First Equipment',
        description: 'Register equipment for booking and usage tracking',
        icon: Package,
        estimatedTime: '10 min',
        difficulty: 'easy' as const,
        category: 'setup' as const,
        action: () => console.log('Navigate to equipment'),
        completed: false
      },
      {
        id: 'invite_members',
        title: 'Invite Your First Members',
        description: 'Send invitations to build your community',
        icon: Users,
        estimatedTime: '5 min',
        difficulty: 'easy' as const,
        category: 'connect' as const,
        action: () => console.log('Navigate to invitations'),
        completed: false
      },
      {
        id: 'configure_pricing',
        title: 'Set Up Pricing Plans',
        description: 'Create membership tiers and equipment pricing',
        icon: TrendingUp,
        estimatedTime: '15 min',
        difficulty: 'medium' as const,
        category: 'setup' as const,
        action: () => console.log('Navigate to pricing'),
        completed: false
      }
    ];

    const providerActions = [
      ...commonActions,
      {
        id: 'setup_services',
        title: 'Configure Your Services',
        description: 'Set up your fabrication capabilities and pricing',
        icon: Settings,
        estimatedTime: '15 min',
        difficulty: 'medium' as const,
        category: 'setup' as const,
        action: () => console.log('Navigate to services'),
        completed: false
      },
      {
        id: 'upload_portfolio',
        title: 'Upload Work Samples',
        description: 'Showcase your best work to attract customers',
        icon: Star,
        estimatedTime: '10 min',
        difficulty: 'easy' as const,
        category: 'setup' as const,
        action: () => console.log('Navigate to portfolio'),
        completed: false
      },
      {
        id: 'accept_first_job',
        title: 'Accept Your First Job',
        description: 'Browse available jobs and accept one to get started',
        icon: Target,
        estimatedTime: '5 min',
        difficulty: 'easy' as const,
        category: 'create' as const,
        action: () => console.log('Navigate to jobs'),
        completed: false
      }
    ];

    switch (type) {
      case 'user':
        return makerActions;
      case 'admin':
        return adminActions;
      case 'provider':
        return providerActions;
      default:
        return commonActions;
    }
  };

  const actions = getActionsForUserType(userType);
  const categories = [
    { id: 'setup', label: 'Setup', icon: Settings, color: 'blue' },
    { id: 'explore', label: 'Explore', icon: MapPin, color: 'green' },
    { id: 'create', label: 'Create', icon: Lightbulb, color: 'purple' },
    { id: 'connect', label: 'Connect', icon: Users, color: 'pink' }
  ];

  const filteredActions = actions.filter(action => action.category === currentCategory);
  const totalCompleted = actions.filter(action => completedActions.has(action.id)).length;
  const progress = (totalCompleted / actions.length) * 100;

  const handleActionComplete = (actionId: string) => {
    setCompletedActions(prev => new Set([...prev, actionId]));
    onActionComplete(actionId);
    
    // Show celebration if this completes a milestone
    if ((totalCompleted + 1) % 3 === 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    switch (category?.color) {
      case 'blue':
        return 'from-blue-500 to-cyan-500';
      case 'green':
        return 'from-green-500 to-emerald-500';
      case 'purple':
        return 'from-purple-500 to-pink-500';
      case 'pink':
        return 'from-pink-500 to-rose-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Rocket className="h-6 w-6 mr-3" />
                Quick Start Guide
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Get the most out of MakrCave with these essential first steps
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress: {totalCompleted} of {actions.length} completed</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="bg-white/20" />
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Category Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            {categories.map(category => {
              const categoryActions = actions.filter(a => a.category === category.id);
              const categoryCompleted = categoryActions.filter(a => completedActions.has(a.id)).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setCurrentCategory(category.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentCategory === category.id
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.label}
                  {categoryCompleted > 0 && (
                    <Badge className="ml-2 bg-green-100 text-green-700 text-xs">
                      {categoryCompleted}/{categoryActions.length}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActions.map((action, index) => {
              const isCompleted = completedActions.has(action.id);
              
              return (
                <Card 
                  key={action.id}
                  className={`transition-all duration-300 hover:shadow-lg ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => !isCompleted && handleActionComplete(action.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(action.category)}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {action.title}
                          </h3>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {action.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-gray-500 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {action.estimatedTime}
                            </div>
                            <Badge className={`text-xs ${getDifficultyColor(action.difficulty)}`}>
                              {action.difficulty}
                            </Badge>
                          </div>
                          
                          {!isCompleted && (
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Motivation Section */}
          {totalCompleted > 0 && (
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Great Progress!</h3>
                  <p className="text-gray-600 text-sm">
                    You've completed {totalCompleted} actions. 
                    {totalCompleted >= actions.length 
                      ? " You're all set to start making amazing things!" 
                      : ` Just ${actions.length - totalCompleted} more to go!`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Achievement Celebration */}
          {showCelebration && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-60">
              <div className="bg-white rounded-lg shadow-2xl p-8 text-center animate-bounce">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Milestone Achieved!</h3>
                <p className="text-gray-600">You're making great progress!</p>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span>Need help? Check out our</span>
              <Button variant="link" className="p-0 h-auto text-blue-600">
                documentation
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close Guide
              </Button>
              {progress === 100 && (
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <Rocket className="h-4 w-4 mr-2" />
                  Launch Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuickStartWizard;
