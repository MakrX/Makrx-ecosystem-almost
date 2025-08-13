import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Star,
  Users,
  Package,
  FileText,
  BookOpen,
  Zap,
  Award,
  Shield,
  Heart,
  GitFork,
  Eye,
  MessageCircle,
  ShoppingCart,
  Lightbulb,
  Wrench,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EnhancedProjectCard from '../components/EnhancedProjectCard';

interface PublicProject {
  project_id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name?: string;
  owner_avatar?: string;
  visibility: 'public';
  status: 'draft' | 'in-progress' | 'complete' | 'on-hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  
  // Collaboration stats
  collaborator_count: number;
  bom_items_count: number;
  files_count: number;
  milestones_count: number;
  completed_milestones_count: number;
  
  // Public project features
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration?: string;
  required_skills: string[];
  learning_objectives: string[];
  license_type: string;
  required_equipment: string[];
  space_requirements?: string;
  safety_considerations?: string;
  
  // Engagement metrics
  view_count: number;
  fork_count: number;
  like_count: number;
  
  // Integration
  github_repo_url?: string;
  enable_github_integration?: boolean;
}

const PublicProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState<string[]>([]);
  const [licenseFilter, setLicenseFilter] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [hasBOM, setHasBOM] = useState<boolean | null>(null);
  const [hasFiles, setHasFiles] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'like_count' | 'view_count' | 'name'>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Available filter options
  const availableSkills = [
    '3D Printing', 'Arduino', 'CAD Design', 'Electronics', 'Programming',
    'Laser Cutting', 'CNC Machining', 'Woodworking', 'Metalworking', 'Soldering',
    'PCB Design', 'IoT', 'Robotics', 'AI/ML', 'Web Development'
  ];

  const availableEquipment = [
    '3D Printer', 'Laser Cutter', 'CNC Machine', 'Soldering Station', 'Oscilloscope',
    'Multimeter', 'Power Supply', 'Hot Air Station', 'Drill Press', 'Band Saw',
    'Hand Tools', 'Arduino', 'Raspberry Pi', 'Breadboard', 'PCB'
  ];

  // Mock data for development
  const getMockProjects = (): PublicProject[] => [
    {
      project_id: 'pub-1',
      name: 'Smart Plant Watering System',
      description: 'IoT-based automatic plant watering system using Arduino and soil moisture sensors. Perfect for beginners learning IoT and plant care automation.',
      owner_id: 'maker-1',
      owner_name: 'Sarah Green',
      owner_avatar: '/avatars/sarah.jpg',
      visibility: 'public',
      status: 'complete',
      start_date: '2024-01-15',
      end_date: '2024-02-15',
      tags: ['IoT', 'Arduino', 'Plants', 'Automation', 'Sensors'],
      is_featured: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-02-15T15:30:00Z',
      collaborator_count: 2,
      bom_items_count: 8,
      files_count: 12,
      milestones_count: 5,
      completed_milestones_count: 5,
      difficulty_level: 'beginner',
      estimated_duration: '2-3 weeks',
      required_skills: ['Arduino', 'Basic Electronics', 'Programming'],
      learning_objectives: ['Learn sensor interfacing', 'Understand IoT basics', 'Practice Arduino programming'],
      license_type: 'cc-by-sa',
      required_equipment: ['Arduino', 'Breadboard', 'Soldering Station'],
      space_requirements: 'Basic workbench with power outlet',
      safety_considerations: 'Basic electrical safety when working with low voltage circuits',
      view_count: 1248,
      fork_count: 23,
      like_count: 156,
      github_repo_url: 'https://github.com/sarahgreen/smart-plant-watering',
      enable_github_integration: true
    },
    {
      project_id: 'pub-2',
      name: 'Laser Cut Mechanical Keyboard',
      description: 'Custom mechanical keyboard with laser-cut case, hand-wired switches, and QMK firmware. Advanced project for keyboard enthusiasts.',
      owner_id: 'maker-2',
      owner_name: 'Alex Chen',
      owner_avatar: '/avatars/alex.jpg',
      visibility: 'public',
      status: 'in-progress',
      start_date: '2024-02-01',
      tags: ['Laser Cutting', 'Keyboards', 'Electronics', 'CAD'],
      is_featured: false,
      created_at: '2024-02-01T09:00:00Z',
      updated_at: '2024-02-10T14:20:00Z',
      collaborator_count: 3,
      bom_items_count: 25,
      files_count: 18,
      milestones_count: 8,
      completed_milestones_count: 4,
      difficulty_level: 'advanced',
      estimated_duration: '1-2 months',
      required_skills: ['CAD Design', 'Laser Cutting', 'Electronics', 'Soldering'],
      learning_objectives: ['Advanced CAD skills', 'Keyboard electronics', 'Firmware programming'],
      license_type: 'cc-by',
      required_equipment: ['Laser Cutter', 'Soldering Station', 'CAD Software'],
      space_requirements: 'Access to laser cutter and electronics workbench',
      safety_considerations: 'Laser safety protocols, proper ventilation for acrylic cutting',
      view_count: 892,
      fork_count: 12,
      like_count: 89,
      github_repo_url: 'https://github.com/alexchen/laser-keyboard',
      enable_github_integration: true
    },
    {
      project_id: 'pub-3',
      name: 'Weather Station with Display',
      description: 'Complete weather monitoring station with outdoor sensors and indoor display. Great introduction to sensor networks and data visualization.',
      owner_id: 'maker-3',
      owner_name: 'Dr. Maria Rodriguez',
      owner_avatar: '/avatars/maria.jpg',
      visibility: 'public',
      status: 'complete',
      tags: ['Weather', 'Sensors', 'Display', 'Data'],
      is_featured: true,
      created_at: '2024-01-20T11:15:00Z',
      updated_at: '2024-02-08T16:45:00Z',
      collaborator_count: 1,
      bom_items_count: 15,
      files_count: 8,
      milestones_count: 6,
      completed_milestones_count: 6,
      difficulty_level: 'intermediate',
      estimated_duration: '3-4 weeks',
      required_skills: ['Arduino', 'Sensors', 'Programming', 'Basic Electronics'],
      learning_objectives: ['Sensor integration', 'Data collection', 'Display programming'],
      license_type: 'mit',
      required_equipment: ['Arduino', 'Sensors', 'Display', 'Enclosure'],
      space_requirements: 'Indoor and outdoor installation space',
      view_count: 672,
      fork_count: 18,
      like_count: 124,
      enable_github_integration: false
    }
  ];

  // Fetch public projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        skip: '0',
        limit: '50',
        sort_by: sortBy,
        sort_direction: sortDirection
      });

      if (searchTerm) params.append('search', searchTerm);
      if (difficultyFilter !== 'all') params.append('difficulty_level', difficultyFilter);
      if (licenseFilter !== 'all') params.append('license_type', licenseFilter);
      if (featuredOnly) params.append('featured_only', 'true');
      if (hasBOM !== null) params.append('has_bom', hasBOM.toString());
      if (hasFiles !== null) params.append('has_files', hasFiles.toString());
      
      // Add skill filters
      skillsFilter.forEach(skill => params.append('required_skills', skill));
      
      // Add equipment filters
      equipmentFilter.forEach(equipment => params.append('required_equipment', equipment));

      const response = await fetch(`/api/v1/enhanced-projects/public?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`API error ${response.status}, falling back to mock data`);
        setProjects(getMockProjects());
        return;
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.warn('API fetch failed, using mock data:', err);
      setProjects(getMockProjects());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, difficultyFilter, skillsFilter, equipmentFilter, licenseFilter, featuredOnly, hasBOM, hasFiles, sortBy, sortDirection]);

  const handleLike = async (projectId: string) => {
    if (!user) {
      alert('Please log in to like projects');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/enhanced-projects/${projectId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchProjects(); // Refresh to update like count
      }
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const handleFork = async (projectId: string) => {
    if (!user) {
      alert('Please log in to fork projects');
      return;
    }

    const projectName = prompt('Enter a name for your forked project:');
    if (!projectName) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/enhanced-projects/${projectId}/fork`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_project_id: projectId,
          new_project_name: projectName,
          fork_reason: 'Personal modification and learning'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Project forked successfully! Your new project ID: ${result.forked_project_id}`);
        fetchProjects(); // Refresh to update fork count
      }
    } catch (error) {
      console.error('Error forking project:', error);
    }
  };

  const handleComment = (projectId: string) => {
    window.location.href = `/portal/public-projects/${projectId}#comments`;
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <BookOpen className="h-4 w-4" />;
      case 'intermediate': return <Zap className="h-4 w-4" />;
      case 'advanced': return <Award className="h-4 w-4" />;
      case 'expert': return <Shield className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Projects</h1>
          <p className="text-gray-600 mt-1">
            Explore and collaborate on open-source maker projects from the community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/portal/projects/create'}>
            Share Your Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
                <p className="text-sm text-gray-600">Public Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {projects.filter(p => p.is_featured).length}
                </p>
                <p className="text-sm text-gray-600">Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {projects.reduce((sum, p) => sum + p.like_count, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {projects.reduce((sum, p) => sum + p.collaborator_count, 0)}
                </p>
                <p className="text-sm text-gray-600">Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search and basic filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects, skills, or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="License" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Licenses</SelectItem>
                    <SelectItem value="cc-by-sa">CC BY-SA</SelectItem>
                    <SelectItem value="cc-by">CC BY</SelectItem>
                    <SelectItem value="mit">MIT</SelectItem>
                    <SelectItem value="apache">Apache</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at">Recently Updated</SelectItem>
                    <SelectItem value="created_at">Newest</SelectItem>
                    <SelectItem value="like_count">Most Liked</SelectItem>
                    <SelectItem value="view_count">Most Viewed</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </Button>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced filters */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button
                variant={featuredOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeaturedOnly(!featuredOnly)}
              >
                <Star className="h-3 w-3 mr-1" />
                Featured Only
              </Button>
              
              <Button
                variant={hasBOM === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHasBOM(hasBOM === true ? null : true)}
              >
                <Package className="h-3 w-3 mr-1" />
                Has BOM
              </Button>
              
              <Button
                variant={hasFiles === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHasFiles(hasFiles === true ? null : true)}
              >
                <FileText className="h-3 w-3 mr-1" />
                Has Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid/List */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms to discover more projects.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setDifficultyFilter('all');
                setLicenseFilter('all');
                setFeaturedOnly(false);
                setHasBOM(null);
                setHasFiles(null);
              }}>
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {projects.map((project) => (
            <EnhancedProjectCard
              key={project.project_id}
              project={project}
              viewMode={viewMode}
              showPublicFeatures={true}
              onUpdate={fetchProjects}
              onLike={handleLike}
              onFork={handleFork}
              onComment={handleComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProjects;
