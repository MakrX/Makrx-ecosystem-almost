import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { MapPin, Clock, Users, Star, Filter, Search, Phone, Mail, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveMap from '../components/InteractiveMap';

interface Makerspace {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  hours: {
    weekdays: string;
    weekends: string;
  };
  contact: {
    phone?: string;
    email: string;
    website?: string;
  };
  amenities: string[];
  equipment: string[];
  membershipPlans: {
    name: string;
    price: string;
    features: string[];
  }[];
  rating: number;
  memberCount: number;
  images: string[];
  verified: boolean;
}

const FindMakerspace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Mock data for demonstration
  const makerspaces: Makerspace[] = [
    {
      id: 'ms_1',
      name: 'TechMaker Hub',
      description: 'A community-driven makerspace focused on technology innovation and collaborative learning.',
      location: {
        address: '123 Innovation Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      },
      hours: {
        weekdays: '9:00 AM - 10:00 PM',
        weekends: '10:00 AM - 8:00 PM'
      },
      contact: {
        phone: '+1 (555) 123-4567',
        email: 'hello@techmakerhub.com',
        website: 'https://techmakerhub.com'
      },
      amenities: ['WiFi', 'Coffee Bar', 'Parking', '24/7 Access', 'Community Events'],
      equipment: ['3D Printers', 'Laser Cutters', 'Electronics Lab', 'Woodworking', 'Textiles'],
      membershipPlans: [
        {
          name: 'Basic',
          price: '$99/month',
          features: ['Weekday access', 'Basic equipment', 'Community events']
        },
        {
          name: 'Pro',
          price: '$199/month',
          features: ['24/7 access', 'All equipment', 'Storage space', 'Guest passes']
        }
      ],
      rating: 4.8,
      memberCount: 156,
      images: ['/placeholder.svg'],
      verified: true
    },
    {
      id: 'ms_2',
      name: 'Austin Makers Collective',
      description: 'Open community space for makers, artists, and entrepreneurs to create, learn, and collaborate.',
      location: {
        address: '456 Creativity Lane',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        coordinates: { lat: 30.2672, lng: -97.7431 }
      },
      hours: {
        weekdays: '8:00 AM - 11:00 PM',
        weekends: '9:00 AM - 9:00 PM'
      },
      contact: {
        phone: '+1 (555) 987-6543',
        email: 'info@austinmakers.org',
        website: 'https://austinmakers.org'
      },
      amenities: ['WiFi', 'Kitchen', 'Parking', 'Bike Storage', 'Lockers'],
      equipment: ['3D Printers', 'CNC Machines', 'Pottery Studio', 'Photography Studio', 'Metal Shop'],
      membershipPlans: [
        {
          name: 'Student',
          price: '$49/month',
          features: ['Weekday access', 'Basic equipment', 'Workshops']
        },
        {
          name: 'Professional',
          price: '$149/month',
          features: ['Full access', 'All equipment', 'Private storage', 'Meeting rooms']
        }
      ],
      rating: 4.6,
      memberCount: 203,
      images: ['/placeholder.svg'],
      verified: true
    },
    {
      id: 'ms_3',
      name: 'Brooklyn Build Lab',
      description: 'Urban makerspace specializing in sustainable making and circular design principles.',
      location: {
        address: '789 Maker Boulevard',
        city: 'Brooklyn',
        state: 'NY',
        country: 'USA',
        coordinates: { lat: 40.6782, lng: -73.9442 }
      },
      hours: {
        weekdays: '10:00 AM - 9:00 PM',
        weekends: '11:00 AM - 7:00 PM'
      },
      contact: {
        email: 'contact@brooklynbuildlab.com',
        website: 'https://brooklynbuildlab.com'
      },
      amenities: ['WiFi', 'Sustainable Materials', 'Recycling Center', 'Garden Space'],
      equipment: ['3D Printers', 'Laser Cutters', 'Upcycling Workshop', 'Sewing Machines', 'Electronics'],
      membershipPlans: [
        {
          name: 'Community',
          price: '$79/month',
          features: ['Daytime access', 'Workshop participation', 'Material sharing']
        },
        {
          name: 'Maker',
          price: '$159/month',
          features: ['Extended hours', 'All equipment', 'Project storage', 'Mentorship']
        }
      ],
      rating: 4.9,
      memberCount: 89,
      images: ['/placeholder.svg'],
      verified: true
    }
  ];

  const filterOptions = [
    'All Equipment',
    '3D Printers',
    'Laser Cutters',
    'Electronics Lab',
    'Woodworking',
    'CNC Machines',
    'Metal Shop',
    'Textiles',
    '24/7 Access',
    'Student Friendly',
    'Parking Available'
  ];

  const filteredMakerspaces = makerspaces.filter(makerspace => {
    const matchesSearch = searchQuery === '' || 
      makerspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      makerspace.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      makerspace.location.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.every(filter => 
        makerspace.equipment.includes(filter) || 
        makerspace.amenities.includes(filter) ||
        (filter === 'Student Friendly' && makerspace.membershipPlans.some(plan => plan.name === 'Student')) ||
        (filter === 'Parking Available' && makerspace.amenities.includes('Parking'))
      );

    return matchesSearch && matchesFilters;
  });

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-2xl font-bold text-white">MakrCave</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
              <Link to="/makrverse" className="text-white/80 hover:text-white transition-colors">MakrVerse</Link>
              <Link to="/find-makerspace" className="text-white hover:text-white font-semibold">Find Makerspace</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none">
                  Join Makerspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find Your Local{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MakrCave
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Discover makerspaces near you with the tools, community, and resources to bring your ideas to life.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by location, name, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="border-white/30"
                >
                  Grid View
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  onClick={() => setViewMode('map')}
                  className="border-white/30"
                >
                  Map View
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-white/70" />
              <span className="text-white/70 text-sm">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <Badge
                  key={filter}
                  variant={selectedFilters.includes(filter) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    selectedFilters.includes(filter)
                      ? 'bg-blue-600 text-white'
                      : 'border-white/30 text-white/80 hover:bg-white/10'
                  }`}
                  onClick={() => toggleFilter(filter)}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              Found {filteredMakerspaces.length} Makerspaces
            </h2>
          </div>

          {viewMode === 'map' ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-8">
              <InteractiveMap />
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMakerspaces.map((makerspace) => (
              <Card key={makerspace.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-white text-lg">{makerspace.name}</CardTitle>
                      {makerspace.verified && (
                        <Badge className="bg-green-600 text-white text-xs">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white/80 text-sm">{makerspace.rating}</span>
                    </div>
                  </div>
                  <CardDescription className="text-white/70 text-sm">
                    {makerspace.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                      <div className="text-white/80 text-sm">
                        <div>{makerspace.location.address}</div>
                        <div>{makerspace.location.city}, {makerspace.location.state}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-white/80 text-sm">{makerspace.hours.weekdays}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-white/80 text-sm">{makerspace.memberCount} active members</span>
                    </div>

                    <div>
                      <div className="text-white/70 text-xs mb-2">Available Equipment:</div>
                      <div className="flex flex-wrap gap-1">
                        {makerspace.equipment.slice(0, 3).map((equipment) => (
                          <Badge key={equipment} variant="outline" className="border-white/30 text-white/70 text-xs">
                            {equipment}
                          </Badge>
                        ))}
                        {makerspace.equipment.length > 3 && (
                          <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                            +{makerspace.equipment.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/70 text-xs mb-2">Membership Plans:</div>
                      <div className="space-y-1">
                        {makerspace.membershipPlans.map((plan) => (
                          <div key={plan.name} className="flex justify-between items-center text-sm">
                            <span className="text-white/80">{plan.name}</span>
                            <span className="text-blue-400 font-semibold">{plan.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm">
                        View Details
                      </Button>
                      {makerspace.contact.phone && (
                        <Button variant="outline" size="sm" className="border-white/30 text-white/80">
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="border-white/30 text-white/80">
                        <Mail className="h-4 w-4" />
                      </Button>
                      {makerspace.contact.website && (
                        <Button variant="outline" size="sm" className="border-white/30 text-white/80">
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMakerspaces.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg mb-4">No makerspaces found matching your criteria.</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilters([]);
                }}
                variant="outline"
                className="border-white/30 text-white/80"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Don't see your makerspace listed?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join the MakrCave network and connect your makerspace to the global community.
          </p>
          <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 text-lg">
            Become a MakrCave
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FindMakerspace;
