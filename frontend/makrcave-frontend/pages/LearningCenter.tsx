import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  BookOpen,
  Users,
  Award,
  Clock,
  Star,
  Filter,
  Search,
  Play,
  CheckCircle2,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  User,
  ChevronRight,
  Download,
  Share2,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Video,
  FileText,
  Headphones,
  Image as ImageIcon,
  Upload,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in hours
  lessons: number;
  enrollment: number;
  rating: number;
  price: number;
  tags: string[];
  skills: string[];
  thumbnail: string;
  type: 'video' | 'interactive' | 'workshop' | 'certification';
  progress?: number;
  enrolled?: boolean;
  completed?: boolean;
  nextLesson?: string;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: string[];
  validityPeriod: number; // in months
  issuer: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  estimatedTime: number; // in hours
  status?: 'not_started' | 'in_progress' | 'completed' | 'expired';
  progress?: number;
  completedDate?: string;
  expiryDate?: string;
  credentialId?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: string[];
  totalHours: number;
  difficulty: string;
  completion: number;
  enrolled: boolean;
}

const LearningCenter: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Load learning data
    generateMockLearningData();
  }, []);

  const generateMockLearningData = () => {
    const mockCourses: Course[] = [
      {
        id: 'course-001',
        title: '3D Printing Fundamentals',
        description: 'Master the basics of 3D printing technology, materials, and design principles.',
        instructor: 'Dr. Sarah Chen',
        category: '3D Printing',
        difficulty: 'Beginner',
        duration: 8,
        lessons: 12,
        enrollment: 245,
        rating: 4.8,
        price: 149,
        tags: ['3D Printing', 'CAD', 'Materials'],
        skills: ['3D Design', 'Printer Operation', 'Material Selection'],
        thumbnail: '/api/placeholder/300/200',
        type: 'video',
        progress: 65,
        enrolled: true,
        nextLesson: 'Lesson 8: Advanced Support Structures'
      },
      {
        id: 'course-002',
        title: 'Advanced CNC Machining',
        description: 'Deep dive into precision machining techniques and advanced toolpath strategies.',
        instructor: 'Mike Rodriguez',
        category: 'CNC',
        difficulty: 'Advanced',
        duration: 24,
        lessons: 18,
        enrollment: 89,
        rating: 4.9,
        price: 299,
        tags: ['CNC', 'Machining', 'Precision'],
        skills: ['G-Code Programming', 'Tool Selection', 'Quality Control'],
        thumbnail: '/api/placeholder/300/200',
        type: 'workshop'
      },
      {
        id: 'course-003',
        title: 'Electronics for Makers',
        description: 'Build your foundation in electronics, from basic circuits to microcontrollers.',
        instructor: 'Alex Johnson',
        category: 'Electronics',
        difficulty: 'Intermediate',
        duration: 16,
        lessons: 20,
        enrollment: 156,
        rating: 4.7,
        price: 199,
        tags: ['Electronics', 'Arduino', 'Soldering'],
        skills: ['Circuit Design', 'Programming', 'Component Selection'],
        thumbnail: '/api/placeholder/300/200',
        type: 'interactive',
        progress: 30,
        enrolled: true
      },
      {
        id: 'course-004',
        title: 'Laser Cutting Mastery',
        description: 'From design to production using laser cutting technology.',
        instructor: 'Emma Davis',
        category: 'Laser Cutting',
        difficulty: 'Intermediate',
        duration: 12,
        lessons: 15,
        enrollment: 198,
        rating: 4.6,
        price: 179,
        tags: ['Laser Cutting', 'Vector Design', 'Materials'],
        skills: ['Vector Graphics', 'Material Preparation', 'Safety Protocols'],
        thumbnail: '/api/placeholder/300/200',
        type: 'video'
      }
    ];

    const mockCertifications: Certification[] = [
      {
        id: 'cert-001',
        name: 'Certified 3D Printing Specialist',
        description: 'Industry-recognized certification for 3D printing expertise.',
        category: '3D Printing',
        requirements: ['Complete 3D Printing Fundamentals', 'Pass practical exam', 'Submit portfolio project'],
        validityPeriod: 24,
        issuer: 'MakrCave Academy',
        difficulty: 'Intermediate',
        prerequisites: ['Basic CAD knowledge'],
        estimatedTime: 40,
        status: 'in_progress',
        progress: 75
      },
      {
        id: 'cert-002',
        name: 'CNC Machining Professional',
        description: 'Advanced certification for precision machining professionals.',
        category: 'CNC',
        requirements: ['Complete Advanced CNC course', 'Pass written exam', 'Demonstrate machining proficiency'],
        validityPeriod: 36,
        issuer: 'Manufacturing Institute',
        difficulty: 'Advanced',
        prerequisites: ['2 years machining experience'],
        estimatedTime: 60,
        status: 'not_started'
      },
      {
        id: 'cert-003',
        name: 'Electronics Safety Certification',
        description: 'Essential safety certification for electronics work.',
        category: 'Electronics',
        requirements: ['Complete safety training', 'Pass safety exam'],
        validityPeriod: 12,
        issuer: 'Safety Standards Board',
        difficulty: 'Beginner',
        prerequisites: [],
        estimatedTime: 8,
        status: 'completed',
        progress: 100,
        completedDate: '2024-01-15',
        expiryDate: '2025-01-15',
        credentialId: 'ESC-2024-001234'
      }
    ];

    const mockLearningPaths: LearningPath[] = [
      {
        id: 'path-001',
        title: 'Digital Fabrication Master',
        description: 'Complete pathway from beginner to expert in digital fabrication technologies.',
        courses: ['course-001', 'course-002', 'course-004'],
        totalHours: 44,
        difficulty: 'Progressive',
        completion: 45,
        enrolled: true
      },
      {
        id: 'path-002',
        title: 'Maker Entrepreneur',
        description: 'Learn to build and commercialize maker products.',
        courses: ['course-003', 'business-001', 'marketing-001'],
        totalHours: 32,
        difficulty: 'Intermediate',
        completion: 0,
        enrolled: false
      }
    ];

    setCourses(mockCourses);
    setCertifications(mockCertifications);
    setLearningPaths(mockLearningPaths);
    setEnrolledCourses(mockCourses.filter(course => course.enrolled));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
          <p className="text-gray-600">Expand your skills with our comprehensive courses and certifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Content
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Learning Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-gray-600">Courses Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Certifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-gray-600">Active Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-gray-600">Hours Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="my-learning">My Learning</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
        </TabsList>

        {/* All Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses, instructors, or topics..."
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
                  <SelectItem value="Laser Cutting">Laser Cutting</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white text-gray-900">
                      {course.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                      {course.type === 'interactive' && <Target className="h-3 w-3 mr-1" />}
                      {course.type === 'workshop' && <Users className="h-3 w-3 mr-1" />}
                      {course.type === 'certification' && <Award className="h-3 w-3 mr-1" />}
                      {course.type}
                    </Badge>
                  </div>
                  {course.enrolled && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white rounded-lg p-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>By {course.instructor}</span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}h
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrollment}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-blue-600">
                      ${course.price}
                    </div>
                    <div className="flex space-x-2">
                      {course.enrolled ? (
                        <>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm">
                            Enroll Now
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Learning Tab */}
        <TabsContent value="my-learning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Overview */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Learning Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">68%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Courses Completed</span>
                      <span>3/8</span>
                    </div>
                    <Progress value={37.5} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Learning Hours</span>
                      <span>24/60</span>
                    </div>
                    <Progress value={40} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Certifications</span>
                      <span>1/3</span>
                    </div>
                    <Progress value={33.3} />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">This Week</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• 4.5 hours of learning</div>
                    <div>• 2 lessons completed</div>
                    <div>• 1 quiz passed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Courses */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          <p className="text-sm text-gray-600">{course.nextLesson}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex-1">
                              <Progress value={course.progress} className="h-2" />
                            </div>
                            <span className="text-sm text-gray-500">{course.progress}%</span>
                          </div>
                        </div>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Completed', item: 'Lesson 7: Support Structures', course: '3D Printing Fundamentals', time: '2 hours ago' },
                  { action: 'Started', item: 'Circuit Analysis Module', course: 'Electronics for Makers', time: '1 day ago' },
                  { action: 'Earned', item: 'Safety Certificate', course: 'Electronics Safety', time: '3 days ago' },
                  { action: 'Enrolled', item: 'Laser Cutting Mastery', course: 'New Course', time: '1 week ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.action === 'Completed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {activity.action === 'Started' && <Play className="h-4 w-4 text-blue-600" />}
                      {activity.action === 'Earned' && <Award className="h-4 w-4 text-yellow-600" />}
                      {activity.action === 'Enrolled' && <BookOpen className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{activity.action}</span> {activity.item}
                      </div>
                      <div className="text-xs text-gray-500">{activity.course}</div>
                    </div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <Card key={path.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{path.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{path.description}</p>
                    </div>
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{path.courses.length} courses</span>
                    <span>{path.totalHours} hours total</span>
                  </div>
                  
                  {path.enrolled && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{path.completion}%</span>
                      </div>
                      <Progress value={path.completion} />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {path.courses.slice(0, 3).map((courseId, index) => {
                      const course = courses.find(c => c.id === courseId);
                      if (!course) return null;
                      
                      return (
                        <div key={courseId} className="flex items-center space-x-3 p-2 border rounded">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm">{course.title}</span>
                          {course.enrolled && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                      );
                    })}
                    {path.courses.length > 3 && (
                      <div className="text-sm text-gray-500 text-center">
                        +{path.courses.length - 3} more courses
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {path.enrolled ? (
                      <Button className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Continue Path
                      </Button>
                    ) : (
                      <Button className="flex-1">
                        Start Learning Path
                      </Button>
                    )}
                    <Button variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <Card key={cert.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cert.name}</CardTitle>
                        <Badge className={getStatusColor(cert.status || 'not_started')}>
                          {cert.status?.replace('_', ' ') || 'Not Started'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{cert.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Issuer:</span>
                      <div className="font-medium">{cert.issuer}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">{cert.estimatedTime}h</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Valid for:</span>
                      <div className="font-medium">{cert.validityPeriod} months</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Level:</span>
                      <Badge className={getDifficultyColor(cert.difficulty)} variant="outline">
                        {cert.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  {cert.status === 'in_progress' && cert.progress && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{cert.progress}%</span>
                      </div>
                      <Progress value={cert.progress} />
                    </div>
                  )}
                  
                  {cert.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-green-800 mb-2">
                        <Trophy className="h-4 w-4" />
                        <span className="font-medium">Certified!</span>
                      </div>
                      <div className="text-sm text-green-700 space-y-1">
                        <div>Completed: {cert.completedDate}</div>
                        <div>Expires: {cert.expiryDate}</div>
                        <div>ID: {cert.credentialId}</div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Requirements:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {cert.requirements.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-2">
                    {cert.status === 'not_started' && (
                      <Button className="flex-1">
                        Start Certification
                      </Button>
                    )}
                    {cert.status === 'in_progress' && (
                      <Button className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    )}
                    {cert.status === 'completed' && (
                      <Button variant="outline" className="flex-1">
                        View Certificate
                      </Button>
                    )}
                    <Button variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Instructors Tab */}
        <TabsContent value="instructors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Dr. Sarah Chen',
                title: '3D Printing Expert',
                courses: 5,
                students: 1234,
                rating: 4.9,
                specialties: ['3D Printing', 'CAD Design', 'Materials Science'],
                bio: 'PhD in Materials Engineering with 15+ years in additive manufacturing.',
                avatar: '/api/placeholder/100/100'
              },
              {
                name: 'Mike Rodriguez',
                title: 'CNC Master Machinist',
                courses: 8,
                students: 856,
                rating: 4.8,
                specialties: ['CNC Machining', 'Precision Engineering', 'Quality Control'],
                bio: 'Former Boeing engineer, now sharing 20 years of machining expertise.',
                avatar: '/api/placeholder/100/100'
              },
              {
                name: 'Alex Johnson',
                title: 'Electronics Engineer',
                courses: 12,
                students: 2156,
                rating: 4.7,
                specialties: ['Circuit Design', 'Microcontrollers', 'IoT'],
                bio: 'Startup founder and electronics educator passionate about maker culture.',
                avatar: '/api/placeholder/100/100'
              }
            ].map((instructor, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <img 
                      src={instructor.avatar}
                      alt={instructor.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3"
                    />
                    <h3 className="font-semibold text-lg">{instructor.name}</h3>
                    <p className="text-gray-600 text-sm">{instructor.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div>
                      <div className="font-bold text-blue-600">{instructor.courses}</div>
                      <div className="text-xs text-gray-600">Courses</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-600">{instructor.students.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Students</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{instructor.rating}</span>
                    <span className="text-gray-500 text-sm">rating</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{instructor.bio}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {instructor.specialties.map((specialty, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      View Profile
                    </Button>
                    <Button className="flex-1">
                      View Courses
                    </Button>
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

export default LearningCenter;
