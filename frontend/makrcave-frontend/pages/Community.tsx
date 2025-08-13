import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  Users,
  MessageSquare,
  Calendar,
  Award,
  Heart,
  Share2,
  UserPlus,
  Search,
  Filter,
  MapPin,
  Clock,
  Star,
  BookOpen,
  Wrench,
  Lightbulb,
  TrendingUp,
  Globe,
  Camera,
  Video,
  FileText,
  Link2,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Send,
  Bell,
  Settings,
  Shield,
  Flag,
  Bookmark,
  Download,
  Upload,
  Play,
  Pause,
  Volume2,
  Coffee,
  Zap,
  Target,
  Handshake,
  Sparkles,
  Activity,
  PieChart,
  BarChart3,
  TrendingDown,
  UserCheck,
  Building2,
  Briefcase,
  Mail,
  Phone,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CommunityMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  title: string;
  location: string;
  joinDate: string;
  reputation: number;
  skills: string[];
  interests: string[];
  projects: number;
  connections: number;
  contributions: number;
  badges: Array<{
    name: string;
    icon: string;
    color: string;
  }>;
  isOnline: boolean;
  bio: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: number;
  views: number;
  isPinned: boolean;
  isSolved: boolean;
  lastActivity: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'meetup' | 'conference' | 'competition' | 'social';
  date: string;
  time: string;
  duration: number;
  location: string;
  isVirtual: boolean;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  price: number;
  tags: string[];
  image: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface Project {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  collaborators: string[];
  category: string;
  tags: string[];
  image: string;
  likes: number;
  views: number;
  progress: number;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  createdAt: string;
  updatedAt: string;
  isOpenForCollaboration: boolean;
  skillsNeeded: string[];
}

const Community: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('feed');
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = () => {
    // Mock community members
    const mockMembers: CommunityMember[] = [
      {
        id: 'member-001',
        name: 'Sarah Chen',
        username: 'sarahmaker',
        avatar: '/api/placeholder/100/100',
        title: '3D Printing Expert',
        location: 'San Francisco, CA',
        joinDate: '2023-01-15',
        reputation: 4850,
        skills: ['3D Printing', 'CAD Design', 'Prototyping'],
        interests: ['Sustainability', 'Medical Devices', 'Education'],
        projects: 24,
        connections: 342,
        contributions: 156,
        isOnline: true,
        bio: 'Passionate about using 3D printing for sustainable solutions. PhD in Materials Science, love teaching and sharing knowledge.',
        badges: [
          { name: 'Expert', icon: 'star', color: 'yellow' },
          { name: 'Mentor', icon: 'user', color: 'blue' },
          { name: 'Top Contributor', icon: 'trophy', color: 'gold' }
        ],
        website: 'https://sarahchen.dev',
        github: 'sarahchen',
        twitter: 'sarahmaker'
      },
      {
        id: 'member-002',
        name: 'Mike Rodriguez',
        username: 'cnc_mike',
        avatar: '/api/placeholder/100/100',
        title: 'CNC Machinist',
        location: 'Austin, TX',
        joinDate: '2022-08-20',
        reputation: 3720,
        skills: ['CNC Machining', 'CAM Programming', 'Quality Control'],
        interests: ['Automotive', 'Aerospace', 'Precision Engineering'],
        projects: 18,
        connections: 225,
        contributions: 98,
        isOnline: false,
        bio: 'Former Boeing engineer, now freelance machinist and educator. Love creating precise parts and teaching others.',
        badges: [
          { name: 'Precision Master', icon: 'target', color: 'blue' },
          { name: 'Helper', icon: 'heart', color: 'red' }
        ],
        linkedin: 'mike-rodriguez-cnc'
      },
      {
        id: 'member-003',
        name: 'Alex Kim',
        username: 'alexcodes',
        avatar: '/api/placeholder/100/100',
        title: 'Electronics & IoT Developer',
        location: 'Seattle, WA',
        joinDate: '2023-03-10',
        reputation: 2940,
        skills: ['Arduino', 'Raspberry Pi', 'PCB Design', 'IoT'],
        interests: ['Smart Home', 'Automation', 'Open Source'],
        projects: 31,
        connections: 189,
        contributions: 145,
        isOnline: true,
        bio: 'Full-stack developer passionate about IoT and maker culture. Building smart solutions for everyday problems.',
        badges: [
          { name: 'Innovator', icon: 'lightbulb', color: 'green' },
          { name: 'Open Source', icon: 'github', color: 'black' }
        ],
        github: 'alexkim-dev',
        website: 'https://alexkim.io'
      }
    ];

    // Mock forum posts
    const mockForumPosts: ForumPost[] = [
      {
        id: 'post-001',
        title: 'Best filament for outdoor prints?',
        content: 'Looking for recommendations on filaments that can withstand weather conditions. Planning to make some garden planters.',
        author: 'Sarah Chen',
        authorAvatar: '/api/placeholder/50/50',
        category: '3D Printing',
        tags: ['filament', 'outdoor', 'weatherproof'],
        createdAt: '2024-12-18T10:30:00Z',
        updatedAt: '2024-12-18T14:20:00Z',
        likes: 23,
        replies: 8,
        views: 156,
        isPinned: false,
        isSolved: true,
        lastActivity: '2 hours ago'
      },
      {
        id: 'post-002',
        title: 'CNC feeds and speeds calculator?',
        content: 'Does anyone have a good calculator or app for determining optimal feeds and speeds for different materials?',
        author: 'Mike Rodriguez',
        authorAvatar: '/api/placeholder/50/50',
        category: 'CNC',
        tags: ['cnc', 'speeds', 'feeds', 'calculator'],
        createdAt: '2024-12-18T09:15:00Z',
        updatedAt: '2024-12-18T12:45:00Z',
        likes: 15,
        replies: 12,
        views: 243,
        isPinned: true,
        isSolved: false,
        lastActivity: '1 hour ago'
      },
      {
        id: 'post-003',
        title: 'Arduino project showcase: Smart greenhouse controller',
        content: 'Just finished my automated greenhouse project! Controls temperature, humidity, and watering. Happy to share the code.',
        author: 'Alex Kim',
        authorAvatar: '/api/placeholder/50/50',
        category: 'Electronics',
        tags: ['arduino', 'iot', 'greenhouse', 'automation'],
        createdAt: '2024-12-17T16:20:00Z',
        updatedAt: '2024-12-18T08:30:00Z',
        likes: 45,
        replies: 18,
        views: 387,
        isPinned: false,
        isSolved: false,
        lastActivity: '30 minutes ago'
      }
    ];

    // Mock events
    const mockEvents: CommunityEvent[] = [
      {
        id: 'event-001',
        title: 'Advanced 3D Printing Workshop',
        description: 'Learn advanced techniques for multi-material printing, support structures, and post-processing.',
        type: 'workshop',
        date: '2024-12-25',
        time: '10:00 AM',
        duration: 4,
        location: 'MakrCave Main Lab',
        isVirtual: false,
        organizer: 'Sarah Chen',
        attendees: 12,
        maxAttendees: 15,
        price: 45,
        tags: ['3D Printing', 'Advanced', 'Hands-on'],
        image: '/api/placeholder/400/200',
        status: 'upcoming'
      },
      {
        id: 'event-002',
        title: 'Maker Meetup: Show & Tell',
        description: 'Monthly gathering to share projects, get feedback, and network with fellow makers.',
        type: 'meetup',
        date: '2024-12-28',
        time: '6:00 PM',
        duration: 3,
        location: 'Community Space',
        isVirtual: false,
        organizer: 'MakrCave Team',
        attendees: 28,
        maxAttendees: 50,
        price: 0,
        tags: ['Networking', 'Projects', 'Community'],
        image: '/api/placeholder/400/200',
        status: 'upcoming'
      },
      {
        id: 'event-003',
        title: 'Virtual PCB Design Masterclass',
        description: 'Online workshop covering PCB design fundamentals, routing techniques, and manufacturing considerations.',
        type: 'workshop',
        date: '2024-12-30',
        time: '2:00 PM',
        duration: 6,
        location: 'Online',
        isVirtual: true,
        organizer: 'Alex Kim',
        attendees: 45,
        maxAttendees: 100,
        price: 25,
        tags: ['Electronics', 'PCB', 'Design'],
        image: '/api/placeholder/400/200',
        status: 'upcoming'
      }
    ];

    // Mock projects
    const mockProjects: Project[] = [
      {
        id: 'project-001',
        title: 'Smart Home Energy Monitor',
        description: 'IoT device to track home energy consumption with real-time visualization and alerts.',
        author: 'Alex Kim',
        authorAvatar: '/api/placeholder/50/50',
        collaborators: ['Sarah Chen', 'Mike Rodriguez'],
        category: 'Electronics',
        tags: ['IoT', 'Energy', 'Smart Home', 'Arduino'],
        image: '/api/placeholder/300/200',
        likes: 67,
        views: 324,
        progress: 75,
        status: 'in_progress',
        createdAt: '2024-11-15',
        updatedAt: '2024-12-18',
        isOpenForCollaboration: true,
        skillsNeeded: ['Mobile App Development', 'Data Visualization']
      },
      {
        id: 'project-002',
        title: 'Biodegradable 3D Printing Filament',
        description: 'Research project developing eco-friendly filament from agricultural waste materials.',
        author: 'Sarah Chen',
        authorAvatar: '/api/placeholder/50/50',
        collaborators: ['Dr. Emma Wilson'],
        category: '3D Printing',
        tags: ['Sustainability', 'Materials', 'Research', 'Eco-friendly'],
        image: '/api/placeholder/300/200',
        likes: 89,
        views: 456,
        progress: 60,
        status: 'in_progress',
        createdAt: '2024-10-01',
        updatedAt: '2024-12-16',
        isOpenForCollaboration: true,
        skillsNeeded: ['Chemistry', 'Material Testing', 'Documentation']
      },
      {
        id: 'project-003',
        title: 'Precision Fixture for Small Parts',
        description: 'Custom CNC machined fixture for holding small electronic components during assembly.',
        author: 'Mike Rodriguez',
        authorAvatar: '/api/placeholder/50/50',
        collaborators: [],
        category: 'CNC',
        tags: ['CNC', 'Fixtures', 'Precision', 'Manufacturing'],
        image: '/api/placeholder/300/200',
        likes: 34,
        views: 178,
        progress: 90,
        status: 'in_progress',
        createdAt: '2024-12-01',
        updatedAt: '2024-12-17',
        isOpenForCollaboration: false,
        skillsNeeded: []
      }
    ];

    setMembers(mockMembers);
    setForumPosts(mockForumPosts);
    setEvents(mockEvents);
    setProjects(mockProjects);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star className="h-3 w-3" />;
      case 'user': return <Users className="h-3 w-3" />;
      case 'trophy': return <Award className="h-3 w-3" />;
      case 'target': return <Target className="h-3 w-3" />;
      case 'heart': return <Heart className="h-3 w-3" />;
      case 'lightbulb': return <Lightbulb className="h-3 w-3" />;
      case 'github': return <Github className="h-3 w-3" />;
      default: return <Award className="h-3 w-3" />;
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const filteredPosts = forumPosts.filter(post => {
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const communityStats = {
    totalMembers: members.length,
    onlineMembers: members.filter(m => m.isOnline).length,
    totalPosts: forumPosts.length,
    totalEvents: events.length,
    totalProjects: projects.length,
    avgReputation: Math.round(members.reduce((sum, m) => sum + m.reputation, 0) / members.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600">Connect, collaborate, and learn with fellow makers</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{communityStats.totalMembers}</p>
                <p className="text-sm text-gray-600">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{communityStats.onlineMembers}</p>
                <p className="text-sm text-gray-600">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{communityStats.totalPosts}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{communityStats.totalEvents}</p>
                <p className="text-sm text-gray-600">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{communityStats.totalProjects}</p>
                <p className="text-sm text-gray-600">Projects</p>
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
                <p className="text-2xl font-bold">{communityStats.avgReputation}</p>
                <p className="text-sm text-gray-600">Avg Rep</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Community Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src="/api/placeholder/50/50" 
                      alt="Your avatar"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <Input 
                        placeholder="Share your latest project or ask a question..."
                        className="mb-3"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Camera className="h-4 w-4 mr-2" />
                            Photo
                          </Button>
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-2" />
                            Video
                          </Button>
                          <Button size="sm" variant="outline">
                            <Link2 className="h-4 w-4 mr-2" />
                            Link
                          </Button>
                        </div>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Feed */}
              {[
                {
                  type: 'project_update',
                  author: 'Alex Kim',
                  avatar: '/api/placeholder/50/50',
                  action: 'updated their project',
                  target: 'Smart Home Energy Monitor',
                  time: '2 hours ago',
                  content: 'Added new sensor integration and improved the mobile dashboard. Now tracking 12 different metrics!',
                  likes: 15,
                  comments: 3
                },
                {
                  type: 'event_created',
                  author: 'Sarah Chen',
                  avatar: '/api/placeholder/50/50',
                  action: 'created a new event',
                  target: 'Advanced 3D Printing Workshop',
                  time: '4 hours ago',
                  content: 'Excited to share advanced 3D printing techniques! Limited spots available.',
                  likes: 28,
                  comments: 7
                },
                {
                  type: 'forum_post',
                  author: 'Mike Rodriguez',
                  avatar: '/api/placeholder/50/50',
                  action: 'posted in',
                  target: 'CNC Discussion',
                  time: '6 hours ago',
                  content: 'Looking for recommendations on feeds and speeds calculators. Any suggestions?',
                  likes: 12,
                  comments: 8
                }
              ].map((activity, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={activity.avatar}
                        alt={activity.author}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{activity.author}</span>
                          <span className="text-gray-600">{activity.action}</span>
                          <span className="font-medium text-blue-600">{activity.target}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500 text-sm">{activity.time}</span>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{activity.content}</p>
                        
                        <div className="flex items-center space-x-6">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm">{activity.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{activity.comments}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                            <Share2 className="h-4 w-4" />
                            <span className="text-sm">Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Online Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Online Members</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.filter(m => m.isOnline).slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Upcoming Events</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.slice(0, 3).map((event) => (
                      <div key={event.id} className="border rounded-lg p-3">
                        <div className="font-medium text-sm mb-1">{event.title}</div>
                        <div className="text-xs text-gray-600 mb-2">{event.date} at {event.time}</div>
                        <div className="text-xs text-gray-500">{event.attendees}/{event.maxAttendees} attending</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Trending Topics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['3D Printing', 'Arduino', 'CNC', 'Sustainability', 'IoT', 'Woodworking', 'Electronics', 'CAD'].map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members by name, skills, or interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <img 
                        src={member.avatar}
                        alt={member.name}
                        className="w-16 h-16 rounded-full"
                      />
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-gray-600 text-sm">@{member.username}</p>
                      <p className="text-gray-600 text-sm">{member.title}</p>
                      <div className="flex items-center text-gray-500 text-xs mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {member.location}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{member.bio}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="font-bold text-blue-600">{member.projects}</div>
                      <div className="text-xs text-gray-600">Projects</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-600">{member.connections}</div>
                      <div className="text-xs text-gray-600">Connections</div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-600">{member.reputation}</div>
                      <div className="text-xs text-gray-600">Reputation</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex space-x-1 mb-4">
                    {member.badges.slice(0, 3).map((badge, index) => (
                      <div key={index} className="flex items-center space-x-1 text-xs">
                        <div className={`p-1 rounded-full ${
                          badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                          badge.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          badge.color === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                          badge.color === 'red' ? 'bg-red-100 text-red-600' :
                          badge.color === 'green' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getBadgeIcon(badge.icon)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center space-x-2 mb-4">
                    {member.website && (
                      <Button size="sm" variant="outline">
                        <Globe className="h-3 w-3" />
                      </Button>
                    )}
                    {member.github && (
                      <Button size="sm" variant="outline">
                        <Github className="h-3 w-3" />
                      </Button>
                    )}
                    {member.twitter && (
                      <Button size="sm" variant="outline">
                        <Twitter className="h-3 w-3" />
                      </Button>
                    )}
                    {member.linkedin && (
                      <Button size="sm" variant="outline">
                        <Linkedin className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <UserPlus className="h-3 w-3 mr-2" />
                      Connect
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forum Tab */}
        <TabsContent value="forum" className="space-y-6">
          {/* Forum Header and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="3D Printing">3D Printing</SelectItem>
                  <SelectItem value="CNC">CNC</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>

          {/* Forum Posts */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={post.authorAvatar}
                      alt={post.author}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                            {post.title}
                            {post.isPinned && <Badge className="ml-2 bg-yellow-100 text-yellow-800">Pinned</Badge>}
                            {post.isSolved && <Badge className="ml-2 bg-green-100 text-green-800">Solved</Badge>}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>by {post.author}</span>
                            <span>•</span>
                            <span>{post.lastActivity}</span>
                            <span>•</span>
                            <Badge variant="outline">{post.category}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm">{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{post.replies} replies</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">{post.views} views</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Bookmark className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white text-gray-900">
                      {event.isVirtual ? 'Virtual' : 'In-Person'}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.duration} hours
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees}/{event.maxAttendees} attendees
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-green-600">
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">
                        Join Event
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {project.isOpenForCollaboration && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-100 text-blue-800">
                        <Handshake className="h-3 w-3 mr-1" />
                        Open for Collaboration
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <img 
                      src={project.authorAvatar}
                      alt={project.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <p className="text-sm text-gray-600">by {project.author}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{project.description}</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Skills Needed */}
                  {project.skillsNeeded.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-sm mb-2">Skills Needed:</h5>
                      <div className="flex flex-wrap gap-1">
                        {project.skillsNeeded.slice(0, 2).map((skill, index) => (
                          <Badge key={index} className="text-xs bg-orange-100 text-orange-800">
                            {skill}
                          </Badge>
                        ))}
                        {project.skillsNeeded.length > 2 && (
                          <Badge className="text-xs bg-orange-100 text-orange-800">
                            +{project.skillsNeeded.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{project.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{project.views}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {project.isOpenForCollaboration && (
                        <Button size="sm">
                          <UserPlus className="h-3 w-3 mr-2" />
                          Join
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;
