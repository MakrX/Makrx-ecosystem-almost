import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { 
  Users,
  Star,
  Clock,
  Target,
  BookOpen,
  Award,
  MessageSquare,
  Calendar,
  Search,
  Filter,
  UserCheck,
  Heart,
  TrendingUp,
  Lightbulb,
  Handshake,
  Zap,
  Eye,
  Plus,
  Edit,
  MoreHorizontal,
  MapPin,
  Mail,
  Phone,
  Video,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sparkles,
  Globe,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
  location: string;
  rating: number;
  reviewCount: number;
  expertise: string[];
  languages: string[];
  experience: number; // years
  mentees: number;
  price: number; // per hour
  availability: 'available' | 'busy' | 'unavailable';
  responseTime: string;
  bio: string;
  achievements: string[];
  sessionTypes: string[];
  timezone: string;
  nextAvailable: string;
  socialLinks: {
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  studentName: string;
  studentAvatar: string;
  skill: string;
  description: string;
  preferredTime: string;
  sessionType: 'one-time' | 'ongoing' | 'project-based';
  budget: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  urgency: 'low' | 'medium' | 'high';
}

interface SkillExchange {
  id: string;
  title: string;
  description: string;
  offeredSkill: string;
  wantedSkill: string;
  author: string;
  authorAvatar: string;
  location: string;
  type: 'skill_swap' | 'teach_and_learn' | 'study_group';
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  participants: number;
  maxParticipants: number;
  tags: string[];
  createdAt: string;
  isActive: boolean;
}

interface MentorshipHubProps {
  onRequestMentorship?: (mentorId: string) => void;
  onJoinExchange?: (exchangeId: string) => void;
}

const MentorshipHub: React.FC<MentorshipHubProps> = ({
  onRequestMentorship,
  onJoinExchange
}) => {
  const [activeTab, setActiveTab] = useState('mentors');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Mock mentors data
  const mentors: Mentor[] = [
    {
      id: 'mentor-001',
      name: 'Dr. Sarah Chen',
      avatar: '/api/placeholder/100/100',
      title: 'Senior Materials Engineer',
      company: 'NASA JPL',
      location: 'Los Angeles, CA',
      rating: 4.9,
      reviewCount: 47,
      expertise: ['3D Printing', 'Materials Science', 'Additive Manufacturing', 'Product Design'],
      languages: ['English', 'Mandarin'],
      experience: 12,
      mentees: 89,
      price: 75,
      availability: 'available',
      responseTime: 'Usually responds within 2 hours',
      bio: 'PhD in Materials Science with 12+ years in aerospace and 3D printing. Passionate about teaching and helping makers bring ideas to life.',
      achievements: ['NASA Group Achievement Award', '15+ Patents', 'Published 30+ Papers'],
      sessionTypes: ['One-on-One', 'Group Sessions', 'Project Reviews', 'Career Guidance'],
      timezone: 'PST (UTC-8)',
      nextAvailable: 'Today at 2:00 PM',
      socialLinks: {
        website: 'https://sarahchen.dev',
        linkedin: 'sarah-chen-materials',
        github: 'sarahchen'
      }
    },
    {
      id: 'mentor-002',
      name: 'Marcus Johnson',
      avatar: '/api/placeholder/100/100',
      title: 'Lead CNC Programmer',
      company: 'Tesla',
      location: 'Austin, TX',
      rating: 4.8,
      reviewCount: 32,
      expertise: ['CNC Machining', 'CAM Programming', 'Precision Manufacturing', 'Quality Control'],
      languages: ['English', 'Spanish'],
      experience: 15,
      mentees: 56,
      price: 60,
      availability: 'busy',
      responseTime: 'Usually responds within 4 hours',
      bio: 'Expert CNC machinist and programmer with experience in automotive and aerospace manufacturing.',
      achievements: ['Tesla Innovation Award', 'ASM Certified', '20+ Years Manufacturing'],
      sessionTypes: ['Technical Reviews', 'Hands-on Training', 'Process Optimization'],
      timezone: 'CST (UTC-6)',
      nextAvailable: 'Tomorrow at 10:00 AM',
      socialLinks: {
        linkedin: 'marcus-johnson-cnc'
      }
    },
    {
      id: 'mentor-003',
      name: 'Alex Kim',
      avatar: '/api/placeholder/100/100',
      title: 'IoT Solutions Architect',
      company: 'Google',
      location: 'Mountain View, CA',
      rating: 4.7,
      reviewCount: 28,
      expertise: ['Arduino', 'Raspberry Pi', 'IoT Development', 'PCB Design', 'Embedded Systems'],
      languages: ['English', 'Korean'],
      experience: 8,
      mentees: 73,
      price: 65,
      availability: 'available',
      responseTime: 'Usually responds within 1 hour',
      bio: 'Full-stack IoT developer helping makers create connected products. Love teaching electronics and programming.',
      achievements: ['Google Cloud Certified', 'Open Source Contributor', 'Hackathon Winner'],
      sessionTypes: ['Code Reviews', 'Project Guidance', 'Career Mentoring', 'Technical Workshops'],
      timezone: 'PST (UTC-8)',
      nextAvailable: 'Today at 4:00 PM',
      socialLinks: {
        website: 'https://alexkim.dev',
        github: 'alexkim-iot',
        twitter: 'alexcodes'
      }
    }
  ];

  // Mock mentorship requests
  const mentorshipRequests: MentorshipRequest[] = [
    {
      id: 'req-001',
      mentorId: 'mentor-001',
      mentorName: 'Dr. Sarah Chen',
      studentName: 'John Doe',
      studentAvatar: '/api/placeholder/50/50',
      skill: '3D Printing',
      description: 'Need help with multi-material printing techniques for a medical device prototype.',
      preferredTime: 'Weekends, 2-4 PM',
      sessionType: 'project-based',
      budget: '$75/hour',
      status: 'pending',
      createdAt: '2024-12-18',
      urgency: 'medium'
    },
    {
      id: 'req-002',
      mentorId: 'mentor-002',
      mentorName: 'Marcus Johnson',
      studentName: 'Emma Wilson',
      studentAvatar: '/api/placeholder/50/50',
      skill: 'CNC Programming',
      description: 'Learning CAM programming for aluminum parts. Need guidance on speeds and feeds.',
      preferredTime: 'Evenings after 6 PM',
      sessionType: 'ongoing',
      budget: '$60/hour',
      status: 'accepted',
      createdAt: '2024-12-17',
      urgency: 'low'
    }
  ];

  // Mock skill exchanges
  const skillExchanges: SkillExchange[] = [
    {
      id: 'exchange-001',
      title: 'CAD Design ↔ Electronics Knowledge',
      description: 'I can teach advanced CAD techniques (Fusion 360, SolidWorks) in exchange for learning Arduino programming and circuit design.',
      offeredSkill: 'CAD Design',
      wantedSkill: 'Arduino Programming',
      author: 'Mike Chen',
      authorAvatar: '/api/placeholder/50/50',
      location: 'San Francisco Bay Area',
      type: 'skill_swap',
      duration: '4-6 weeks',
      level: 'intermediate',
      participants: 2,
      maxParticipants: 4,
      tags: ['CAD', 'Electronics', 'Arduino', 'Design'],
      createdAt: '2024-12-15',
      isActive: true
    },
    {
      id: 'exchange-002',
      title: 'Woodworking Study Group',
      description: 'Group learning traditional woodworking techniques and hand tool usage. Beginners welcome!',
      offeredSkill: 'Woodworking',
      wantedSkill: 'Group Learning',
      author: 'Sarah Johnson',
      authorAvatar: '/api/placeholder/50/50',
      location: 'Austin, TX',
      type: 'study_group',
      duration: '8 weeks',
      level: 'beginner',
      participants: 6,
      maxParticipants: 10,
      tags: ['Woodworking', 'Hand Tools', 'Traditional', 'Group'],
      createdAt: '2024-12-14',
      isActive: true
    },
    {
      id: 'exchange-003',
      title: 'Laser Cutting ↔ 3D Modeling',
      description: 'Experienced with laser cutting and file preparation. Looking to improve 3D modeling skills for product design.',
      offeredSkill: 'Laser Cutting',
      wantedSkill: '3D Modeling',
      author: 'David Park',
      authorAvatar: '/api/placeholder/50/50',
      location: 'Portland, OR',
      type: 'skill_swap',
      duration: '3-4 weeks',
      level: 'intermediate',
      participants: 1,
      maxParticipants: 2,
      tags: ['Laser Cutting', '3D Modeling', 'Product Design'],
      createdAt: '2024-12-13',
      isActive: true
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = skillFilter === 'all' || mentor.expertise.includes(skillFilter);
    const matchesAvailability = availabilityFilter === 'all' || mentor.availability === availabilityFilter;
    
    return matchesSearch && matchesSkill && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mentorship Hub</h2>
          <p className="text-gray-600">Learn from experts and share your knowledge with the community</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Become a Mentor
          </Button>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Find a Mentor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mentors.length}</p>
                <p className="text-sm text-gray-600">Active Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Handshake className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{skillExchanges.length}</p>
                <p className="text-sm text-gray-600">Skill Exchanges</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-gray-600">Learning Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'mentors', label: 'Find Mentors', icon: Users },
            { id: 'requests', label: 'My Requests', icon: MessageSquare },
            { id: 'exchanges', label: 'Skill Exchange', icon: Handshake },
            { id: 'sessions', label: 'My Sessions', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Find Mentors Tab */}
      {activeTab === 'mentors' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search mentors by name or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="3D Printing">3D Printing</SelectItem>
                  <SelectItem value="CNC Machining">CNC Machining</SelectItem>
                  <SelectItem value="Arduino">Arduino</SelectItem>
                  <SelectItem value="CAD Design">CAD Design</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img 
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{mentor.name}</h3>
                          <p className="text-gray-600 text-sm">{mentor.title}</p>
                          <p className="text-gray-500 text-sm">{mentor.company}</p>
                        </div>
                        <Badge className={getAvailabilityColor(mentor.availability)}>
                          {mentor.availability}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{mentor.rating} ({mentor.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{mentor.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{mentor.bio}</p>

                  {/* Expertise */}
                  <div className="mb-4">
                    <h5 className="font-medium text-sm mb-2">Expertise:</h5>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.expertise.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="font-bold text-blue-600">{mentor.experience}y</div>
                      <div className="text-xs text-gray-600">Experience</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-600">{mentor.mentees}</div>
                      <div className="text-xs text-gray-600">Mentees</div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-600">${mentor.price}/h</div>
                      <div className="text-xs text-gray-600">Rate</div>
                    </div>
                  </div>

                  {/* Availability Info */}
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {mentor.responseTime}
                    </div>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Next available: {mentor.nextAvailable}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center space-x-2 mb-4">
                    {mentor.socialLinks.website && (
                      <Button size="sm" variant="outline">
                        <Globe className="h-3 w-3" />
                      </Button>
                    )}
                    {mentor.socialLinks.github && (
                      <Button size="sm" variant="outline">
                        <Github className="h-3 w-3" />
                      </Button>
                    )}
                    {mentor.socialLinks.linkedin && (
                      <Button size="sm" variant="outline">
                        <Linkedin className="h-3 w-3" />
                      </Button>
                    )}
                    {mentor.socialLinks.twitter && (
                      <Button size="sm" variant="outline">
                        <Twitter className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1"
                      onClick={() => onRequestMentorship?.(mentor.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request Mentorship
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {mentorshipRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold">Mentorship Request - {request.skill}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge className={getUrgencyColor(request.urgency)} variant="outline">
                        {request.urgency} priority
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">To: {request.mentorName}</p>
                    <p className="text-gray-700 mb-4">{request.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Session Type:</span>
                        <div className="font-medium capitalize">{request.sessionType.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Preferred Time:</span>
                        <div className="font-medium">{request.preferredTime}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Budget:</span>
                        <div className="font-medium">{request.budget}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <div className="font-medium">{request.createdAt}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Skill Exchange Tab */}
      {activeTab === 'exchanges' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Skill Exchanges</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Exchange
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skillExchanges.map((exchange) => (
              <Card key={exchange.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img 
                      src={exchange.authorAvatar}
                      alt={exchange.author}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{exchange.title}</h3>
                      <p className="text-gray-600 text-sm">by {exchange.author}</p>
                      <div className="flex items-center text-gray-500 text-xs mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {exchange.location}
                      </div>
                    </div>
                    <Badge className={`capitalize ${
                      exchange.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      exchange.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {exchange.level}
                    </Badge>
                  </div>

                  <p className="text-gray-700 text-sm mb-4">{exchange.description}</p>

                  {/* Skills Exchange Visual */}
                  <div className="flex items-center justify-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Badge className="bg-blue-100 text-blue-800">
                      {exchange.offeredSkill}
                    </Badge>
                    <div className="flex items-center text-gray-400">
                      <Handshake className="h-4 w-4" />
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {exchange.wantedSkill}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">{exchange.duration}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <div className="font-medium capitalize">{exchange.type.replace('_', ' ')}</div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Participants</span>
                      <span className="font-medium">{exchange.participants}/{exchange.maxParticipants}</span>
                    </div>
                    <Progress value={(exchange.participants / exchange.maxParticipants) * 100} className="h-2" />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {exchange.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full"
                    onClick={() => onJoinExchange?.(exchange.id)}
                    disabled={exchange.participants >= exchange.maxParticipants}
                  >
                    {exchange.participants >= exchange.maxParticipants ? 'Full' : 'Join Exchange'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
            <p className="text-gray-600 mb-4">Schedule a mentorship session to get started</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipHub;
