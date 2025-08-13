'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MapPin, Navigation, Search, Filter, Users, Clock, Wrench, 
  Package, Zap, Star, Phone, Mail, ExternalLink, Calendar,
  Printer, Cpu, Palette, AlertCircle, CheckCircle, Info
} from 'lucide-react';

interface Makerspace {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates: { lat: number; lng: number };
  distance?: number;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  status: 'open' | 'busy' | 'closed';
  capacity: number;
  currentUsers: number;
  priceRange: string;
  amenities: string[];
  equipment: EquipmentInfo[];
  hours: { [key: string]: string };
  specialties: string[];
  image: string;
}

interface EquipmentInfo {
  id: string;
  name: string;
  type: '3d_printer' | 'cnc' | 'laser_cutter' | 'other';
  status: 'available' | 'in_use' | 'maintenance' | 'reserved';
  nextAvailable?: string;
  specifications: Record<string, any>;
}

const mockMakerspaces: Makerspace[] = [
  {
    id: '1',
    name: 'TechHub Downtown',
    address: '123 Innovation St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    distance: 0.8,
    phone: '+1 (555) 123-4567',
    email: 'info@techhub.com',
    website: 'https://techhub.com',
    rating: 4.8,
    reviewCount: 156,
    status: 'open',
    capacity: 50,
    currentUsers: 23,
    priceRange: '₹2,075-2,905/day',
    amenities: ['WiFi', 'Coffee', 'Parking', '24/7 Access', 'Security'],
    hours: {
      'Monday': '9:00 AM - 9:00 PM',
      'Tuesday': '9:00 AM - 9:00 PM',
      'Wednesday': '9:00 AM - 9:00 PM',
      'Thursday': '9:00 AM - 9:00 PM',
      'Friday': '9:00 AM - 9:00 PM',
      'Saturday': '10:00 AM - 8:00 PM',
      'Sunday': '10:00 AM - 6:00 PM'
    },
    specialties: ['Electronics', '3D Printing', 'Prototyping'],
    equipment: [
      { id: 'e1', name: 'Prusa i3 MK3S+', type: '3d_printer', status: 'available', specifications: { build_volume: '250×210×210mm' } },
      { id: 'e2', name: 'Ultimaker S5', type: '3d_printer', status: 'in_use', nextAvailable: '2:30 PM', specifications: { build_volume: '330×240×300mm' } },
      { id: 'e3', name: 'Universal Laser VLS2.30', type: 'laser_cutter', status: 'available', specifications: { bed_size: '610×305mm' } },
      { id: 'e4', name: 'Tormach PCNC 440', type: 'cnc', status: 'maintenance', specifications: { work_area: '254×140×254mm' } }
    ],
    image: '/api/placeholder/400/250'
  },
  {
    id: '2',
    name: 'MakerSpace Austin',
    address: '456 Creative Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    coordinates: { lat: 30.2672, lng: -97.7431 },
    distance: 1.2,
    phone: '+1 (555) 234-5678',
    email: 'hello@makerspaceaustin.org',
    rating: 4.6,
    reviewCount: 89,
    status: 'busy',
    capacity: 75,
    currentUsers: 67,
    priceRange: '₹1,660-2,490/day',
    amenities: ['WiFi', 'Snacks', 'Parking', 'Lockers'],
    hours: {
      'Monday': '8:00 AM - 10:00 PM',
      'Tuesday': '8:00 AM - 10:00 PM',
      'Wednesday': '8:00 AM - 10:00 PM',
      'Thursday': '8:00 AM - 10:00 PM',
      'Friday': '8:00 AM - 10:00 PM',
      'Saturday': '9:00 AM - 9:00 PM',
      'Sunday': '9:00 AM - 7:00 PM'
    },
    specialties: ['Woodworking', 'Textiles', 'Art'],
    equipment: [
      { id: 'e5', name: 'Ender 3 V2', type: '3d_printer', status: 'available', specifications: { build_volume: '220×220×250mm' } },
      { id: 'e6', name: 'Glowforge Pro', type: 'laser_cutter', status: 'reserved', nextAvailable: '4:00 PM', specifications: { bed_size: '279×495mm' } },
      { id: 'e7', name: 'Shapeoko 4', type: 'cnc', status: 'available', specifications: { work_area: '610×610×75mm' } }
    ],
    image: '/api/placeholder/400/250'
  },
  {
    id: '3',
    name: 'Innovation Lab NYC',
    address: '789 Maker Ave',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    distance: 2.1,
    phone: '+1 (555) 345-6789',
    email: 'contact@innovationlabnyc.com',
    rating: 4.9,
    reviewCount: 234,
    status: 'closed',
    capacity: 100,
    currentUsers: 0,
    priceRange: '₹2,905-3,735/day',
    amenities: ['WiFi', 'Cafe', 'Parking', 'Event Space', 'Meeting Rooms'],
    hours: {
      'Monday': '7:00 AM - 11:00 PM',
      'Tuesday': '7:00 AM - 11:00 PM',
      'Wednesday': '7:00 AM - 11:00 PM',
      'Thursday': '7:00 AM - 11:00 PM',
      'Friday': '7:00 AM - 11:00 PM',
      'Saturday': '8:00 AM - 10:00 PM',
      'Sunday': 'Closed'
    },
    specialties: ['Advanced Manufacturing', 'R&D', 'Startups'],
    equipment: [
      { id: 'e8', name: 'Formlabs Form 3L', type: '3d_printer', status: 'available', specifications: { build_volume: '335×200×300mm' } },
      { id: 'e9', name: 'Epilog Fusion Pro', type: 'laser_cutter', status: 'available', specifications: { bed_size: '812×508mm' } },
      { id: 'e10', name: 'Haas Mini Mill', type: 'cnc', status: 'available', specifications: { work_area: '406×254×254mm' } }
    ],
    image: '/api/placeholder/400/250'
  }
];

export default function InteractiveMap() {
  const [makerspaces, setMakerspaces] = useState<Makerspace[]>(mockMakerspaces);
  const [selectedSpace, setSelectedSpace] = useState<Makerspace | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapView, setMapView] = useState<'list' | 'map'>('map');

  useEffect(() => {
    // Simulate getting user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Use San Francisco as default
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  }, []);

  const filteredMakerspaces = makerspaces.filter(space => {
    const matchesSearch = searchTerm === '' || 
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || space.status === filterStatus;
    
    const matchesEquipment = filterEquipment === 'all' ||
      space.equipment.some(eq => eq.type === filterEquipment && eq.status === 'available');
    
    return matchesSearch && matchesStatus && matchesEquipment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case '3d_printer': return <Printer className="w-4 h-4" />;
      case 'cnc': return <Cpu className="w-4 h-4" />;
      case 'laser_cutter': return <Palette className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'in_use': return 'text-yellow-600';
      case 'maintenance': return 'text-red-600';
      case 'reserved': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleReserveSpace = (spaceId: string) => {
    console.log('Reserving space:', spaceId);
    // Handle reservation logic
  };

  const MapViewComponent = () => (
    <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
      {/* Simulated Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Map Pins */}
      {filteredMakerspaces.map((space, index) => (
        <div
          key={space.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${25 + index * 20}%`,
            top: `${30 + index * 15}%`
          }}
          onClick={() => setSelectedSpace(space)}
        >
          <div className={`relative p-2 rounded-full shadow-lg transition-transform hover:scale-110 ${
            space.status === 'open' ? 'bg-green-500' :
            space.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            <MapPin className="w-6 h-6 text-white" />
            {space.status === 'open' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
            {space.name}
          </div>
        </div>
      ))}
      
      {/* User Location */}
      {userLocation && (
        <div
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: '50%', top: '50%' }}
        >
          <div className="relative p-2 bg-blue-600 rounded-full shadow-lg">
            <Navigation className="w-5 h-5 text-white" />
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button size="sm" variant="outline" className="bg-white">
          <Navigation className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-white">
          +
        </Button>
        <Button size="sm" variant="outline" className="bg-white">
          -
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find Makerspaces Near You</h2>
          <p className="text-gray-600">Discover available tools and book time at local makerspaces</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mapView === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMapView('map')}
          >
            Map View
          </Button>
          <Button
            variant={mapView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMapView('list')}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search makerspaces, cities, or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="busy">Busy</option>
          <option value="closed">Closed</option>
        </select>
        
        <select
          value={filterEquipment}
          onChange={(e) => setFilterEquipment(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Equipment</option>
          <option value="3d_printer">3D Printers</option>
          <option value="cnc">CNC Machines</option>
          <option value="laser_cutter">Laser Cutters</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map/List View */}
        <div className="lg:col-span-2">
          {mapView === 'map' ? (
            <MapViewComponent />
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMakerspaces.map((space) => (
                <Card
                  key={space.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedSpace(space)}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{space.name}</h3>
                      <Badge className={getStatusColor(space.status)}>
                        {space.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {space.address}, {space.city}, {space.state}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{space.rating}</span>
                      </div>
                      <span>{space.distance} mi away</span>
                      <span>{space.priceRange}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Makerspace Details */}
        <div>
          {selectedSpace ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedSpace.name}</CardTitle>
                    <CardDescription>
                      {selectedSpace.address}, {selectedSpace.city}, {selectedSpace.state}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(selectedSpace.status)}>
                    {selectedSpace.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={selectedSpace.image}
                  alt={selectedSpace.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedSpace.rating} ({selectedSpace.reviewCount} reviews)</span>
                  </div>
                  <span className="font-medium">{selectedSpace.priceRange}</span>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current Capacity</span>
                    <span>{selectedSpace.currentUsers}/{selectedSpace.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        selectedSpace.currentUsers / selectedSpace.capacity > 0.8 ? 'bg-red-500' :
                        selectedSpace.currentUsers / selectedSpace.capacity > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(selectedSpace.currentUsers / selectedSpace.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <h4 className="font-semibold mb-2">Available Equipment</h4>
                  <div className="space-y-2">
                    {selectedSpace.equipment.map((equipment) => (
                      <div key={equipment.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getEquipmentIcon(equipment.type)}
                          <span>{equipment.name}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${getEquipmentStatusColor(equipment.status)}`}>
                          {equipment.status === 'available' && <CheckCircle className="w-3 h-3" />}
                          {equipment.status === 'in_use' && <Clock className="w-3 h-3" />}
                          {equipment.status === 'maintenance' && <AlertCircle className="w-3 h-3" />}
                          {equipment.status === 'reserved' && <Info className="w-3 h-3" />}
                          <span className="capitalize">{equipment.status.replace('_', ' ')}</span>
                          {equipment.nextAvailable && (
                            <span className="text-gray-500">({equipment.nextAvailable})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedSpace.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedSpace.email}</span>
                    </div>
                    {selectedSpace.website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                        <a href={selectedSpace.website} className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() => handleReserveSpace(selectedSpace.id)}
                    disabled={selectedSpace.status === 'closed'}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {selectedSpace.status === 'closed' ? 'Currently Closed' : 'Book Time'}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a Makerspace
                  </h3>
                  <p className="text-gray-600">
                    Click on a makerspace pin or list item to view details and book time.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
