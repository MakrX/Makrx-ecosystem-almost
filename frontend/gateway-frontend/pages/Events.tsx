import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Users, Star, Filter,
  Search, ChevronRight, ExternalLink, Play, Award,
  BookOpen, Wrench, Zap, Globe
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'competition' | 'meetup' | 'online';
  capacity: number;
  registered: number;
  price: number;
  instructor?: string;
  image: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  featured?: boolean;
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: '3D Printing Workshop: From Design to Print',
    description: 'Learn the complete 3D printing workflow from CAD design to finished product. Hands-on experience with industry-standard equipment.',
    date: '2024-02-15',
    time: '10:00 AM - 4:00 PM',
    location: 'MakrCave Bangalore',
    type: 'workshop',
    capacity: 20,
    registered: 15,
    price: 2500,
    instructor: 'Dr. Sarah Chen',
    image: '/api/placeholder/400/250',
    difficulty: 'Beginner',
    tags: ['3D Printing', 'CAD', 'Design'],
    featured: true
  },
  {
    id: '2',
    title: 'Maker Innovation Challenge 2024',
    description: 'Annual competition for innovative maker projects. Win prizes worth ₹1 lakh and mentorship opportunities.',
    date: '2024-02-20',
    time: '9:00 AM - 6:00 PM',
    location: 'Multiple Locations',
    type: 'competition',
    capacity: 100,
    registered: 67,
    price: 0,
    image: '/api/placeholder/400/250',
    difficulty: 'Advanced',
    tags: ['Competition', 'Innovation', 'Prizes'],
    featured: true
  },
  {
    id: '3',
    title: 'Arduino & IoT Fundamentals',
    description: 'Build your first IoT device with Arduino. Learn sensors, connectivity, and data visualization.',
    date: '2024-02-22',
    time: '2:00 PM - 6:00 PM',
    location: 'Online',
    type: 'online',
    capacity: 50,
    registered: 32,
    price: 1500,
    instructor: 'Mike Rodriguez',
    image: '/api/placeholder/400/250',
    difficulty: 'Intermediate',
    tags: ['Arduino', 'IoT', 'Electronics']
  },
  {
    id: '4',
    title: 'Laser Cutting & Engraving Masterclass',
    description: 'Master precision cutting and creative engraving techniques. Work with wood, acrylic, and leather.',
    date: '2024-02-25',
    time: '11:00 AM - 5:00 PM',
    location: 'MakrCave Mumbai',
    type: 'workshop',
    capacity: 15,
    registered: 8,
    price: 3000,
    instructor: 'Lisa Park',
    image: '/api/placeholder/400/250',
    difficulty: 'Intermediate',
    tags: ['Laser Cutting', 'Design', 'Materials']
  },
  {
    id: '5',
    title: 'Delhi Makers Meetup',
    description: 'Monthly networking event for Delhi maker community. Share projects, find collaborators, and learn from peers.',
    date: '2024-02-28',
    time: '6:00 PM - 9:00 PM',
    location: 'MakrCave Delhi',
    type: 'meetup',
    capacity: 40,
    registered: 28,
    price: 0,
    image: '/api/placeholder/400/250',
    difficulty: 'Beginner',
    tags: ['Networking', 'Community', 'Projects']
  }
];

const pastEvents: Event[] = [
  {
    id: 'p1',
    title: 'CNC Machining Intensive',
    description: 'Advanced CNC programming and operation workshop',
    date: '2024-01-20',
    time: '9:00 AM - 5:00 PM',
    location: 'MakrCave Bangalore',
    type: 'workshop',
    capacity: 12,
    registered: 12,
    price: 4000,
    instructor: 'James Wilson',
    image: '/api/placeholder/400/250',
    difficulty: 'Advanced',
    tags: ['CNC', 'Machining', 'Manufacturing']
  },
  {
    id: 'p2',
    title: 'Hackathon 2024: Smart Cities',
    description: '48-hour hackathon focused on smart city solutions',
    date: '2024-01-15',
    time: '9:00 AM - 9:00 AM',
    location: 'Multiple Locations',
    type: 'competition',
    capacity: 200,
    registered: 180,
    price: 500,
    image: '/api/placeholder/400/250',
    difficulty: 'Advanced',
    tags: ['Hackathon', 'Smart Cities', 'IoT']
  }
];

export default function Events() {
  const [filter, setFilter] = useState<'all' | 'workshop' | 'competition' | 'meetup' | 'online'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesFilter = filter === 'all' || event.type === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workshop': return <Wrench className="w-4 h-4" />;
      case 'competition': return <Award className="w-4 h-4" />;
      case 'meetup': return <Users className="w-4 h-4" />;
      case 'online': return <Globe className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-blue-100 text-blue-700';
      case 'competition': return 'bg-purple-100 text-purple-700';
      case 'meetup': return 'bg-green-100 text-green-700';
      case 'online': return 'bg-orange-100 text-orange-700';
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

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
            <span className="text-makrx-blue">Events</span> & Workshops
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our vibrant maker community through workshops, competitions, 
            and networking events designed to inspire and educate.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {['all', 'workshop', 'competition', 'meetup', 'online'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors flex items-center gap-2 ${
                    filter === type
                      ? 'bg-makrx-blue text-white'
                      : 'bg-white border border-gray-200 hover:border-makrx-blue'
                  }`}
                >
                  {type !== 'all' && getTypeIcon(type)}
                  {type}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Featured Events */}
        {filter === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Featured Events
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingEvents.filter(event => event.featured).map(event => (
                <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${getTypeColor(event.type)}`}>
                        {getTypeIcon(event.type)}
                        {event.type}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs ${getDifficultyColor(event.difficulty)}`}>
                        {event.difficulty}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">
                        {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
                      </div>
                      <button className="bg-makrx-blue text-white px-6 py-2 rounded-lg hover:bg-makrx-blue/90 transition-colors">
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {filter === 'all' ? 'All Upcoming Events' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Events`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-t-xl"
                />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getTypeColor(event.type)}`}>
                      {getTypeIcon(event.type)}
                      {event.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(event.difficulty)}`}>
                      {event.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="font-bold mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-1 mb-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.registered}/{event.capacity} registered
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
                    </span>
                    <button className="text-makrx-blue hover:text-makrx-blue/80 font-medium text-sm flex items-center gap-1">
                      Register <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastEvents.map(event => (
              <div key={event.id} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getTypeColor(event.type)}`}>
                    {getTypeIcon(event.type)}
                    {event.type}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-600">Completed</span>
                </div>
                
                <h3 className="font-bold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                  <span>{event.registered} participants</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
