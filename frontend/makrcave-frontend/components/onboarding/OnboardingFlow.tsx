import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  ArrowRight, ArrowLeft, CheckCircle, Users, Settings, Zap, Shield, 
  MapPin, Star, Award, BookOpen, Wrench, Factory, UserCheck, 
  Globe, Smartphone, Laptop, Monitor, Play, PlusCircle, Target,
  Lightbulb, Coffee, Rocket, Heart, TrendingUp, Camera, Clock,
  Building2, GraduationCap, Briefcase, Home, ChevronRight
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  requiredFields?: string[];
}

interface UserProfile {
  userType: 'user' | 'admin' | 'provider' | 'super_admin' | '';
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
  };
  interests: string[];
  experience: string;
  makerspaceInfo?: {
    name: string;
    type: string;
    location: string;
    description: string;
    equipment: string[];
    capacity: number;
    pricing: string;
  };
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    publicProfile: boolean;
    mentoring: boolean;
  };
  skills: string[];
  goals: string[];
}

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    userType: '',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      bio: ''
    },
    interests: [],
    experience: '',
    preferences: {
      notifications: true,
      newsletter: true,
      publicProfile: false,
      mentoring: false
    },
    skills: [],
    goals: []
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const userTypes = [
    {
      id: 'user',
      title: 'Individual User',
      description: 'I want to access makerspaces, work on projects, and learn new skills',
      icon: Wrench,
      color: 'from-blue-500 to-cyan-500',
      features: ['Access equipment', 'Join projects', 'Learn skills', 'Connect with makers']
    },
    {
      id: 'admin',
      title: 'Makerspace Admin',
      description: 'I manage a makerspace and want to streamline operations',
      icon: Building2,
      color: 'from-purple-500 to-pink-500',
      features: ['Manage inventory', 'Track usage', 'Handle memberships', 'Monitor equipment']
    },
    {
      id: 'provider',
      title: 'Service Provider',
      description: 'I offer fabrication services and want to receive job orders',
      icon: Factory,
      color: 'from-green-500 to-emerald-500',
      features: ['Receive orders', 'Manage queue', 'Track materials', 'Quality control']
    },
    {
      id: 'super_admin',
      title: 'Platform Administrator',
      description: 'I oversee multiple makerspaces and platform operations',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      features: ['Global oversight', 'Analytics', 'Policy management', 'System configuration']
    }
  ];

  const interests = [
    '3D Printing', 'Electronics', 'Woodworking', 'Metalworking', 'Robotics',
    'IoT Development', 'Prototyping', 'Art & Design', 'Sustainability',
    'Education', 'Entrepreneurship', 'Research & Development'
  ];

  const skills = [
    'CAD Design', '3D Printing', 'Arduino/Raspberry Pi', 'Soldering',
    'CNC Machining', 'Laser Cutting', 'Programming', 'Project Management',
    'Circuit Design', 'Mechanical Engineering', 'Industrial Design', 'Teaching'
  ];

  const goals = [
    'Learn new technologies', 'Start a business', 'Teach others', 'Build prototypes',
    'Complete personal projects', 'Collaborate with teams', 'Develop skills',
    'Create art', 'Solve problems', 'Innovate solutions'
  ];

  // Welcome Step Component
  const WelcomeStep: React.FC = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Rocket className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            MakrCave
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your journey into the future of making starts here. Let's set up your profile and 
          connect you with the perfect makerspace community.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { icon: Globe, title: 'Global Network', desc: 'Access 500+ makerspaces worldwide' },
          { icon: Zap, title: 'Smart Tools', desc: 'AI-powered project and inventory management' },
          { icon: Users, title: 'Community', desc: 'Connect with 10k+ makers globally' }
        ].map((feature, idx) => (
          <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <feature.icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-2xl mx-auto">
        <div className="flex items-center space-x-3">
          <Lightbulb className="h-6 w-6 text-yellow-400" />
          <div className="text-left">
            <p className="text-yellow-400 font-medium">Pro Tip</p>
            <p className="text-gray-300 text-sm">Complete your profile to unlock personalized recommendations and early access features!</p>
          </div>
        </div>
      </div>
    </div>
  );

  // User Type Selection Step
  const UserTypeStep: React.FC = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">What brings you to MakrCave?</h2>
        <p className="text-gray-300 text-lg">Choose your primary role to personalize your experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {userTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all duration-300 border-2 ${
              userProfile.userType === type.id 
                ? 'border-blue-500 bg-blue-500/20' 
                : 'border-white/20 bg-white/10 hover:bg-white/15'
            } backdrop-blur-md`}
            onClick={() => setUserProfile(prev => ({ ...prev, userType: type.id as any }))}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${type.color} shadow-lg`}>
                  <type.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                  <p className="text-gray-300 mb-4">{type.description}</p>
                  <div className="space-y-2">
                    {type.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Personal Information Step
  const PersonalInfoStep: React.FC = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Tell us about yourself</h2>
        <p className="text-gray-300">This helps us connect you with the right community and opportunities</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-white">First Name *</Label>
            <Input
              id="firstName"
              value={userProfile.personalInfo.firstName}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, firstName: e.target.value }
              }))}
              className="bg-white/10 border-white/20 text-white"
              placeholder="John"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-white">Last Name *</Label>
            <Input
              id="lastName"
              value={userProfile.personalInfo.lastName}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, lastName: e.target.value }
              }))}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-white">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={userProfile.personalInfo.email}
            onChange={(e) => setUserProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, email: e.target.value }
            }))}
            className="bg-white/10 border-white/20 text-white"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <Label htmlFor="location" className="text-white">Location</Label>
          <Input
            id="location"
            value={userProfile.personalInfo.location}
            onChange={(e) => setUserProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, location: e.target.value }
            }))}
            className="bg-white/10 border-white/20 text-white"
            placeholder="San Francisco, CA"
          />
        </div>

        <div>
          <Label htmlFor="experience" className="text-white">Experience Level</Label>
          <Select 
            value={userProfile.experience} 
            onValueChange={(value) => setUserProfile(prev => ({ ...prev, experience: value }))}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner - New to making</SelectItem>
              <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
              <SelectItem value="advanced">Advanced - Experienced maker</SelectItem>
              <SelectItem value="expert">Expert - Professional level</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bio" className="text-white">Bio (Optional)</Label>
          <Textarea
            id="bio"
            value={userProfile.personalInfo.bio}
            onChange={(e) => setUserProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, bio: e.target.value }
            }))}
            className="bg-white/10 border-white/20 text-white"
            placeholder="Tell us about your interests, projects, or goals..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  // Interests and Skills Step
  const InterestsSkillsStep: React.FC = () => (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">What are you passionate about?</h2>
        <p className="text-gray-300">Select your interests and skills to get personalized recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Heart className="h-5 w-5 text-red-400 mr-2" />
              Your Interests
            </CardTitle>
            <CardDescription className="text-gray-400">
              What areas of making excite you most?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {interests.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={userProfile.interests.includes(interest)}
                    onCheckedChange={(checked) => {
                      setUserProfile(prev => ({
                        ...prev,
                        interests: checked 
                          ? [...prev.interests, interest]
                          : prev.interests.filter(i => i !== interest)
                      }));
                    }}
                  />
                  <Label 
                    htmlFor={`interest-${interest}`} 
                    className="text-white text-sm cursor-pointer"
                  >
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="h-5 w-5 text-yellow-400 mr-2" />
              Your Skills
            </CardTitle>
            <CardDescription className="text-gray-400">
              What skills do you currently have or want to develop?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {skills.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={userProfile.skills.includes(skill)}
                    onCheckedChange={(checked) => {
                      setUserProfile(prev => ({
                        ...prev,
                        skills: checked 
                          ? [...prev.skills, skill]
                          : prev.skills.filter(s => s !== skill)
                      }));
                    }}
                  />
                  <Label 
                    htmlFor={`skill-${skill}`} 
                    className="text-white text-sm cursor-pointer"
                  >
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="h-5 w-5 text-blue-400 mr-2" />
            Your Goals
          </CardTitle>
          <CardDescription className="text-gray-400">
            What do you hope to achieve with MakrCave?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {goals.map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={`goal-${goal}`}
                  checked={userProfile.goals.includes(goal)}
                  onCheckedChange={(checked) => {
                    setUserProfile(prev => ({
                      ...prev,
                      goals: checked 
                        ? [...prev.goals, goal]
                        : prev.goals.filter(g => g !== goal)
                    }));
                  }}
                />
                <Label 
                  htmlFor={`goal-${goal}`} 
                  className="text-white text-sm cursor-pointer"
                >
                  {goal}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Makerspace Setup Step (for admins)
  const MakerspaceSetupStep: React.FC = () => {
    if (userProfile.userType !== 'admin') return null;

    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Set up your makerspace</h2>
          <p className="text-gray-300">Let's configure your makerspace for optimal management</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="makerspaceName" className="text-white">Makerspace Name *</Label>
            <Input
              id="makerspaceName"
              value={userProfile.makerspaceInfo?.name || ''}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                makerspaceInfo: { ...prev.makerspaceInfo!, name: e.target.value }
              }))}
              className="bg-white/10 border-white/20 text-white"
              placeholder="TechMaker Hub"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="makerspaceType" className="text-white">Type of Space</Label>
              <Select 
                value={userProfile.makerspaceInfo?.type || ''} 
                onValueChange={(value) => setUserProfile(prev => ({
                  ...prev,
                  makerspaceInfo: { ...prev.makerspaceInfo!, type: value }
                }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select space type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community">Community Makerspace</SelectItem>
                  <SelectItem value="educational">Educational Institution</SelectItem>
                  <SelectItem value="corporate">Corporate Innovation Lab</SelectItem>
                  <SelectItem value="private">Private Workshop</SelectItem>
                  <SelectItem value="library">Public Library</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="capacity" className="text-white">Capacity (People)</Label>
              <Input
                id="capacity"
                type="number"
                value={userProfile.makerspaceInfo?.capacity || ''}
                onChange={(e) => setUserProfile(prev => ({
                  ...prev,
                  makerspaceInfo: { ...prev.makerspaceInfo!, capacity: parseInt(e.target.value) }
                }))}
                className="bg-white/10 border-white/20 text-white"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="makerspaceLocation" className="text-white">Location *</Label>
            <Input
              id="makerspaceLocation"
              value={userProfile.makerspaceInfo?.location || ''}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                makerspaceInfo: { ...prev.makerspaceInfo!, location: e.target.value }
              }))}
              className="bg-white/10 border-white/20 text-white"
              placeholder="123 Innovation St, Tech City, CA 94000"
            />
          </div>

          <div>
            <Label htmlFor="makerspaceDescription" className="text-white">Description</Label>
            <Textarea
              id="makerspaceDescription"
              value={userProfile.makerspaceInfo?.description || ''}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                makerspaceInfo: { ...prev.makerspaceInfo!, description: e.target.value }
              }))}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Describe your makerspace, its mission, and what makes it unique..."
              rows={4}
            />
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Equipment & Tools</CardTitle>
              <CardDescription className="text-gray-400">
                Select the equipment available in your makerspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  '3D Printers', 'Laser Cutters', 'CNC Machines', 'Soldering Stations',
                  'Arduino/Raspberry Pi', 'Hand Tools', 'Power Tools', 'Electronics Lab',
                  'Woodworking Tools', 'Metalworking Tools', 'Sewing Machines', 'Pottery Wheel'
                ].map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={`equipment-${equipment}`}
                      checked={userProfile.makerspaceInfo?.equipment?.includes(equipment) || false}
                      onCheckedChange={(checked) => {
                        setUserProfile(prev => ({
                          ...prev,
                          makerspaceInfo: {
                            ...prev.makerspaceInfo!,
                            equipment: checked 
                              ? [...(prev.makerspaceInfo?.equipment || []), equipment]
                              : (prev.makerspaceInfo?.equipment || []).filter(e => e !== equipment)
                          }
                        }));
                      }}
                    />
                    <Label 
                      htmlFor={`equipment-${equipment}`} 
                      className="text-white text-sm cursor-pointer"
                    >
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Preferences Step
  const PreferencesStep: React.FC = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Customize your experience</h2>
        <p className="text-gray-300">Set your preferences for notifications, privacy, and community features</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Notifications</CardTitle>
            <CardDescription className="text-gray-400">
              Choose how you'd like to stay updated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Push Notifications</Label>
                <p className="text-sm text-gray-400">Get notified about important updates</p>
              </div>
              <Checkbox
                checked={userProfile.preferences.notifications}
                onCheckedChange={(checked) => setUserProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, notifications: checked as boolean }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Newsletter</Label>
                <p className="text-sm text-gray-400">Weekly updates and maker spotlights</p>
              </div>
              <Checkbox
                checked={userProfile.preferences.newsletter}
                onCheckedChange={(checked) => setUserProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, newsletter: checked as boolean }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Privacy & Community</CardTitle>
            <CardDescription className="text-gray-400">
              Control your visibility and community participation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Public Profile</Label>
                <p className="text-sm text-gray-400">Allow others to find and connect with you</p>
              </div>
              <Checkbox
                checked={userProfile.preferences.publicProfile}
                onCheckedChange={(checked) => setUserProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, publicProfile: checked as boolean }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Mentoring</Label>
                <p className="text-sm text-gray-400">Available to help other makers learn</p>
              </div>
              <Checkbox
                checked={userProfile.preferences.mentoring}
                onCheckedChange={(checked) => setUserProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, mentoring: checked as boolean }
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Completion Step
  const CompletionStep: React.FC = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to the{' '}
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            MakrCave Network!
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your profile is complete! You're now connected to a global community of makers, 
          innovators, and creators.
        </p>
      </div>
      
      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-green-400 mb-3">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-green-400 mt-1" />
            <div>
              <p className="text-white font-medium">Find Makerspaces</p>
              <p className="text-gray-400 text-sm">Discover spaces near you</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-green-400 mt-1" />
            <div>
              <p className="text-white font-medium">Join Projects</p>
              <p className="text-gray-400 text-sm">Collaborate with makers</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <BookOpen className="h-5 w-5 text-green-400 mt-1" />
            <div>
              <p className="text-white font-medium">Learn Skills</p>
              <p className="text-gray-400 text-sm">Take courses and earn badges</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-green-400 mt-1" />
            <div>
              <p className="text-white font-medium">Start Creating</p>
              <p className="text-gray-400 text-sm">Begin your first project</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3">
          <Rocket className="mr-2 h-5 w-5" />
          Explore Dashboard
        </Button>
        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3">
          <Users className="mr-2 h-5 w-5" />
          Find Community
        </Button>
      </div>
    </div>
  );

  const steps: OnboardingStep[] = [
    { id: 'welcome', title: 'Welcome', description: 'Get started with MakrCave', component: WelcomeStep },
    { id: 'userType', title: 'Your Role', description: 'Choose your user type', component: UserTypeStep, requiredFields: ['userType'] },
    { id: 'personalInfo', title: 'Personal Info', description: 'Tell us about yourself', component: PersonalInfoStep, requiredFields: ['firstName', 'lastName', 'email'] },
    { id: 'interests', title: 'Interests & Skills', description: 'Your passions and abilities', component: InterestsSkillsStep },
    ...(userProfile.userType === 'admin' ? [{ id: 'makerspace', title: 'Makerspace Setup', description: 'Configure your space', component: MakerspaceSetupStep, requiredFields: ['makerspaceInfo.name', 'makerspaceInfo.location'] }] : []),
    { id: 'preferences', title: 'Preferences', description: 'Customize your experience', component: PreferencesStep },
    { id: 'completion', title: 'Complete', description: 'Welcome to the community!', component: CompletionStep }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceed = () => {
    if (!currentStepData.requiredFields) return true;
    
    return currentStepData.requiredFields.every(field => {
      const fieldPath = field.split('.');
      let value: any = userProfile;
      
      for (const path of fieldPath) {
        value = value?.[path];
      }
      
      return value && value.toString().trim() !== '';
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-white">MakrCave Setup</span>
            </div>
            <Badge variant="outline" className="border-white/30 text-white">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">{currentStepData.title}</span>
              <span className="text-gray-400">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardContent className="p-8">
            <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <CurrentStepComponent />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-white/30 text-white hover:bg-white/10 disabled:opacity-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'bg-blue-500 scale-125' 
                    : completedSteps.has(idx)
                    ? 'bg-green-500'
                    : idx < currentStep 
                    ? 'bg-gray-400' 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Launch Dashboard
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
