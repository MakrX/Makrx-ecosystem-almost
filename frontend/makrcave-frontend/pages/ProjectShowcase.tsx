import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Star,
  Clock,
  Eye,
  Heart,
  GitFork,
  Download,
  Award,
  Lightbulb,
  Wrench,
  Cpu,
  Zap,
  Sparkles,
  Globe,
  Users,
  Calendar,
  ArrowRight,
  Tag,
  SortAsc,
  SortDesc,
  MapPin,
  Filter as FilterIcon,
  X,
  CheckCircle2,
  Layers3,
  Rocket,
  Target,
  Gauge
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProjectShowcaseCard from '../components/showcase/ProjectShowcaseCard';
import FeaturedProjectCarousel from '../components/showcase/FeaturedProjectCarousel';
import ProjectCategoryExplorer from '../components/showcase/ProjectCategoryExplorer';
import TrendingProjectsWidget from '../components/showcase/TrendingProjectsWidget';
import MakerSpotlight from '../components/showcase/MakerSpotlight';

interface ShowcaseProject {
  project_id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name: string;
  owner_avatar?: string;
  makerspace_name?: string;
  makerspace_id?: string;
  visibility: 'public';
  status: 'draft' | 'in-progress' | 'complete' | 'on-hold' | 'cancelled';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_time: string; // "2-4 hours", "1-2 weeks", etc.
  category: string;
  subcategories: string[];
  tags: string[];
  skills_required: string[];
  equipment_used: string[];
  
  // Showcase metrics
  view_count: number;
  like_count: number;
  fork_count: number;
  comment_count: number;
  download_count: number;
  completion_rate: number; // Percentage of people who completed after viewing
  
  // Media and assets
  thumbnail_url?: string;
  gallery_images: string[];
  demo_video_url?: string;
  
  // Project details
  bill_of_materials: Array<{
    name: string;
    quantity: number;
    estimated_cost: number;
    supplier?: string;
  }>;
  total_estimated_cost: number;
  
  // Social features
  is_featured: boolean;
  is_staff_pick: boolean;
  is_trending: boolean;
  awards: Array<{
    type: string;
    name: string;
    icon: string;
    awarded_at: string;
  }>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  featured_at?: string;
  
  // Interaction flags for current user
  is_liked: boolean;
  is_bookmarked: boolean;
  is_following_owner: boolean;
}

type SortOption = 'newest' | 'trending' | 'popular' | 'most_liked' | 'most_forked' | 'recently_updated';
type ViewMode = 'grid' | 'list';

const ProjectShowcase: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  
  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner', icon: '🟢', description: 'New to making' },
    { value: 'intermediate', label: 'Intermediate', icon: '🟡', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', icon: '🟠', description: 'Very experienced' },
    { value: 'expert', label: 'Expert', icon: '🔴', description: 'Professional level' }
  ];

  // Load projects and filter data
  useEffect(() => {
    loadShowcaseProjects();
    loadFilterOptions();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [projects, searchQuery, selectedCategory, selectedDifficulty, selectedTags, sortBy]);

  const loadShowcaseProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch('/api/v1/projects/showcase', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        // Mock data for development
        setProjects(generateMockShowcaseProjects());
      }
    } catch (error) {
      console.error('Error loading showcase projects:', error);
      setProjects(generateMockShowcaseProjects());
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch('/api/v1/projects/showcase/filters', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCategories(data.categories);
        setAvailableTags(data.tags);
        setAvailableSkills(data.skills);
      } else {
        // Mock filter options
        setAvailableCategories(['3D Printing', 'Electronics', 'Woodworking', 'Robotics', 'IoT', 'Art & Design', 'Automation', 'Tools']);
        setAvailableTags(['Arduino', 'Raspberry Pi', 'CAD', 'LED', 'Sensors', 'Motors', 'WiFi', 'Bluetooth', '3D Printed', 'Open Source']);
        setAvailableSkills(['Soldering', '3D Modeling', 'Programming', 'Circuit Design', 'Woodworking', 'CAD Design', 'Electronics']);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query)) ||
        project.skills_required.some(skill => skill.toLowerCase().includes(query)) ||
        project.owner_name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(project => project.difficulty_level === selectedDifficulty);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(project => 
        selectedTags.every(tag => project.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'trending':
          return (b.like_count + b.view_count + b.fork_count) - (a.like_count + a.view_count + a.fork_count);
        case 'popular':
          return b.view_count - a.view_count;
        case 'most_liked':
          return b.like_count - a.like_count;
        case 'most_forked':
          return b.fork_count - a.fork_count;
        case 'recently_updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedTags([]);
    setSortBy('trending');
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm opacity-90">
              <Sparkles className="h-4 w-4" />
              <span>Discover Amazing Maker Projects</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold">
              Project Showcase
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Explore incredible projects from makers around the world. Get inspired, learn new skills, and share your own creations.
            </p>
            <div className="flex items-center justify-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{projects.length}+</div>
                <div className="text-sm opacity-80">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{availableCategories.length}</div>
                <div className="text-sm opacity-80">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{availableSkills.length}+</div>
                <div className="text-sm opacity-80">Skills</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Featured Projects Carousel */}
        <FeaturedProjectCarousel projects={projects.filter(p => p.is_featured)} />

        {/* Quick Categories */}
        <ProjectCategoryExplorer 
          categories={availableCategories}
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects, makers, or technologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex items-center space-x-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center space-x-2">
                          <span>{level.icon}</span>
                          <span>{level.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Trending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="newest">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Newest</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>Popular</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="most_liked">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <span>Most Liked</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="most_forked">
                      <div className="flex items-center space-x-2">
                        <GitFork className="h-4 w-4" />
                        <span>Most Forked</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
                >
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <div className="flex items-center space-x-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Technologies</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-blue-100"
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag}
                          {selectedTags.includes(tag) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Skills Required</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableSkills.map(skill => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-purple-100"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Levels */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty Level</label>
                    <div className="space-y-2">
                      {difficultyLevels.map(level => (
                        <div 
                          key={level.value}
                          className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                            selectedDifficulty === level.value 
                              ? getDifficultyColor(level.value)
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedDifficulty(
                            selectedDifficulty === level.value ? '' : level.value
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{level.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{level.label}</div>
                              <div className="text-xs text-gray-600">{level.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {filteredProjects.length} projects found
                  </div>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar and Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TrendingProjectsWidget projects={projects.filter(p => p.is_trending)} />
            <MakerSpotlight />
          </div>

          {/* Main Project Grid */}
          <div className="lg:col-span-3">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">No projects found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                    <Button onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {filteredProjects.map(project => (
                  <ProjectShowcaseCard
                    key={project.project_id}
                    project={project}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data generator for development
const generateMockShowcaseProjects = (): ShowcaseProject[] => {
  return [
    {
      project_id: '1',
      name: 'Smart Home IoT Dashboard',
      description: 'A comprehensive IoT dashboard for monitoring and controlling smart home devices with beautiful visualizations.',
      owner_id: 'user1',
      owner_name: 'Alex Chen',
      owner_avatar: '/avatars/alex.jpg',
      makerspace_name: 'TechLab NYC',
      makerspace_id: 'techlab1',
      visibility: 'public',
      status: 'complete',
      difficulty_level: 'intermediate',
      estimated_time: '2-3 weeks',
      category: 'IoT',
      subcategories: ['Home Automation', 'Web Development'],
      tags: ['Arduino', 'React', 'WiFi', 'Sensors'],
      skills_required: ['Programming', 'Electronics', 'Web Development'],
      equipment_used: ['Arduino Uno', '3D Printer', 'Soldering Station'],
      view_count: 1250,
      like_count: 89,
      fork_count: 23,
      comment_count: 12,
      download_count: 67,
      completion_rate: 78,
      thumbnail_url: '/projects/iot-dashboard.jpg',
      gallery_images: ['/projects/iot-1.jpg', '/projects/iot-2.jpg'],
      demo_video_url: '/videos/iot-demo.mp4',
      bill_of_materials: [
        { name: 'Arduino Uno', quantity: 1, estimated_cost: 25, supplier: 'MakrX Store' },
        { name: 'DHT22 Sensor', quantity: 2, estimated_cost: 15, supplier: 'MakrX Store' }
      ],
      total_estimated_cost: 75,
      is_featured: true,
      is_staff_pick: false,
      is_trending: true,
      awards: [
        { type: 'featured', name: 'Featured Project', icon: '⭐', awarded_at: '2024-01-15' }
      ],
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z',
      featured_at: '2024-01-15T00:00:00Z',
      is_liked: false,
      is_bookmarked: false,
      is_following_owner: false
    }
    // Add more mock projects...
  ];
};

export default ProjectShowcase;
