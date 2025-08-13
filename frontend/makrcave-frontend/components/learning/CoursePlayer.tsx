import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  FileText,
  Download,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Lightbulb,
  Target,
  Award,
  Code,
  Image as ImageIcon,
  Video
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';
  duration: number; // in minutes
  content: {
    videoUrl?: string;
    textContent?: string;
    slides?: Array<{
      title: string;
      content: string;
      image?: string;
    }>;
    quiz?: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
  completed: boolean;
  progress: number;
  resources: Array<{
    title: string;
    type: 'pdf' | 'link' | 'code' | 'image';
    url: string;
  }>;
  notes?: string;
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  lessons: Lesson[];
  currentLesson: number;
  overallProgress: number;
  rating: number;
  reviews: number;
  enrolled: boolean;
}

interface CoursePlayerProps {
  course?: Course;
  onComplete?: (lessonId: string) => void;
  onProgress?: (lessonId: string, progress: number) => void;
  onClose?: () => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  onComplete,
  onProgress,
  onClose
}) => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [selectedTab, setSelectedTab] = useState('content');

  // Mock course data
  const mockCourse: Course = {
    id: 'course-001',
    title: '3D Printing Fundamentals',
    instructor: 'Dr. Sarah Chen',
    description: 'Master the basics of 3D printing technology and design principles.',
    currentLesson: 0,
    overallProgress: 45,
    rating: 4.8,
    reviews: 245,
    enrolled: true,
    lessons: [
      {
        id: 'lesson-001',
        title: 'Introduction to 3D Printing',
        description: 'Overview of 3D printing technology and applications',
        type: 'video',
        duration: 15,
        completed: true,
        progress: 100,
        content: {
          videoUrl: 'https://example.com/lesson1.mp4'
        },
        resources: [
          { title: 'Course Slides', type: 'pdf', url: '/resources/lesson1-slides.pdf' },
          { title: 'Additional Reading', type: 'link', url: 'https://example.com/reading' }
        ]
      },
      {
        id: 'lesson-002',
        title: 'Types of 3D Printing Technologies',
        description: 'Explore FDM, SLA, SLS and other 3D printing methods',
        type: 'interactive',
        duration: 20,
        completed: false,
        progress: 60,
        content: {
          slides: [
            {
              title: 'Fused Deposition Modeling (FDM)',
              content: 'FDM is the most common type of 3D printing technology. It works by heating thermoplastic filament and extruding it layer by layer to build objects.',
              image: '/api/placeholder/600/400'
            },
            {
              title: 'Stereolithography (SLA)',
              content: 'SLA uses a laser to cure liquid resin into solid plastic. It offers high precision and smooth surface finishes.',
              image: '/api/placeholder/600/400'
            },
            {
              title: 'Selective Laser Sintering (SLS)',
              content: 'SLS uses a laser to fuse powdered material together. It can work with various materials including plastics, metals, and ceramics.',
              image: '/api/placeholder/600/400'
            }
          ]
        },
        resources: [
          { title: 'Technology Comparison Chart', type: 'pdf', url: '/resources/tech-comparison.pdf' },
          { title: 'Video: SLA vs FDM', type: 'link', url: 'https://youtube.com/watch?v=example' }
        ]
      },
      {
        id: 'lesson-003',
        title: 'Materials and Properties',
        description: 'Understanding different 3D printing materials',
        type: 'text',
        duration: 12,
        completed: false,
        progress: 0,
        content: {
          textContent: `
# 3D Printing Materials

## Thermoplastics
Thermoplastics are the most common materials used in FDM printing:

### PLA (Polylactic Acid)
- **Properties**: Easy to print, biodegradable, low odor
- **Applications**: Prototypes, decorative items, educational models
- **Print Temperature**: 190-220°C
- **Bed Temperature**: 20-60°C

### ABS (Acrylonitrile Butadiene Styrene)
- **Properties**: Strong, flexible, chemical resistant
- **Applications**: Functional parts, automotive components
- **Print Temperature**: 220-250°C
- **Bed Temperature**: 80-110°C

### PETG (Polyethylene Terephthalate Glycol)
- **Properties**: Chemical resistant, clear, strong
- **Applications**: Containers, mechanical parts
- **Print Temperature**: 220-250°C
- **Bed Temperature**: 70-80°C

## Resins (for SLA)
- **Standard Resin**: General purpose, good detail
- **Tough Resin**: Impact resistant, functional parts
- **Clear Resin**: Transparent prints, optical applications

## Safety Considerations
Always ensure proper ventilation when printing with ABS or resins. Use appropriate personal protective equipment when handling uncured resins.
          `
        },
        resources: [
          { title: 'Material Properties Database', type: 'link', url: '/materials-database' },
          { title: 'Safety Data Sheets', type: 'pdf', url: '/resources/sds-materials.pdf' }
        ]
      },
      {
        id: 'lesson-004',
        title: 'Knowledge Check',
        description: 'Test your understanding of 3D printing basics',
        type: 'quiz',
        duration: 10,
        completed: false,
        progress: 0,
        content: {
          quiz: [
            {
              question: 'Which material is best for beginners?',
              options: ['PLA', 'ABS', 'PETG', 'TPU'],
              correctAnswer: 0
            },
            {
              question: 'What does FDM stand for?',
              options: [
                'Fast Direct Manufacturing',
                'Fused Deposition Modeling',
                'Flexible Design Method',
                'Final Dimensional Measurement'
              ],
              correctAnswer: 1
            }
          ]
        },
        resources: []
      }
    ]
  };

  const activeCourse = course || mockCourse;
  const activeLesson = activeCourse.lessons[currentLesson];

  useEffect(() => {
    // Load user notes for current lesson
    const savedNotes = localStorage.getItem(`notes-${activeLesson.id}`);
    setUserNotes(savedNotes || '');
  }, [activeLesson.id]);

  const handleSaveNotes = () => {
    localStorage.setItem(`notes-${activeLesson.id}`, userNotes);
  };

  const nextLesson = () => {
    if (currentLesson < activeCourse.lessons.length - 1) {
      setCurrentLesson(prev => prev + 1);
      setCurrentSlide(0);
    }
  };

  const previousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(prev => prev - 1);
      setCurrentSlide(0);
    }
  };

  const markLessonComplete = () => {
    onComplete?.(activeLesson.id);
    // Auto-advance to next lesson
    if (currentLesson < activeCourse.lessons.length - 1) {
      setTimeout(() => nextLesson(), 1500);
    }
  };

  const nextSlide = () => {
    if (activeLesson.content.slides && currentSlide < activeLesson.content.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const renderLessonContent = () => {
    switch (activeLesson.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <p>Video Player</p>
                  <p className="text-sm opacity-75">Click to start video</p>
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <Progress value={videoProgress} className="h-2" />
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'interactive':
        if (activeLesson.content.slides) {
          const slide = activeLesson.content.slides[currentSlide];
          return (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{slide.title}</CardTitle>
                    <Badge variant="outline">
                      {currentSlide + 1} of {activeLesson.content.slides.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <div className="prose max-w-none">
                    <p>{slide.content}</p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={previousSlide}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {activeLesson.content.slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={nextSlide}
                  disabled={currentSlide === activeLesson.content.slides.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          );
        }
        break;

      case 'text':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: activeLesson.content.textContent?.replace(/\n/g, '<br>') || '' 
                }} />
              </div>
            </CardContent>
          </Card>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            {activeLesson.content.quiz?.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}: {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <Button
                        key={optionIndex}
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={markLessonComplete} className="w-full">
              Submit Quiz
            </Button>
          </div>
        );

      default:
        return <div>Content type not supported</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Course Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{activeCourse.title}</h1>
              <p className="text-gray-600 mb-4">{activeCourse.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {activeCourse.instructor}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {activeCourse.rating} ({activeCourse.reviews} reviews)
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {activeCourse.lessons.reduce((acc, lesson) => acc + lesson.duration, 0)} min total
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          {/* Course Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Course Progress</span>
              <span>{activeCourse.overallProgress}% Complete</span>
            </div>
            <Progress value={activeCourse.overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Lesson Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{activeLesson.title}</CardTitle>
                  <p className="text-gray-600 mt-1">{activeLesson.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="capitalize">{activeLesson.type}</Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {activeLesson.duration} min
                  </Badge>
                  {activeLesson.completed && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Lesson Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Lesson Progress</span>
                  <span>{activeLesson.progress}%</span>
                </div>
                <Progress value={activeLesson.progress} className="h-2" />
              </div>
            </CardHeader>
          </Card>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {renderLessonContent()}
              
              {/* Lesson Navigation */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={previousLesson}
                      disabled={currentLesson === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous Lesson
                    </Button>
                    
                    {!activeLesson.completed && (
                      <Button onClick={markLessonComplete}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    
                    <Button
                      onClick={nextLesson}
                      disabled={currentLesson === activeCourse.lessons.length - 1}
                    >
                      Next Lesson
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeLesson.resources.length > 0 ? (
                      activeLesson.resources.map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {resource.type === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                            {resource.type === 'link' && <Eye className="h-5 w-5 text-blue-500" />}
                            {resource.type === 'code' && <Code className="h-5 w-5 text-green-500" />}
                            {resource.type === 'image' && <ImageIcon className="h-5 w-5 text-purple-500" />}
                            <div>
                              <div className="font-medium">{resource.title}</div>
                              <div className="text-sm text-gray-600 capitalize">{resource.type}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Access
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-8">No additional resources for this lesson.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>My Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <textarea
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      placeholder="Take notes for this lesson..."
                      className="w-full h-40 p-3 border rounded-lg resize-none"
                    />
                    <Button onClick={handleSaveNotes}>
                      Save Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">JD</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">John Doe</span>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                          </div>
                          <p className="text-sm">Great explanation of FDM technology! The visual aids really helped.</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button size="sm" variant="ghost">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              5
                            </Button>
                            <Button size="sm" variant="ghost">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <textarea
                        placeholder="Add to the discussion..."
                        className="w-full h-20 p-3 border rounded-lg resize-none"
                      />
                      <Button className="mt-2">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Course Sidebar */}
        <div className="space-y-6">
          {/* Lesson List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Lessons</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {activeCourse.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(index)}
                    className={`w-full text-left p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                      index === currentLesson ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {lesson.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : index === currentLesson ? (
                          <Play className="h-4 w-4 text-blue-500" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{lesson.title}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {lesson.duration} min
                          <Badge className="ml-2 capitalize text-xs" variant="outline">
                            {lesson.type}
                          </Badge>
                        </div>
                        {lesson.progress > 0 && lesson.progress < 100 && (
                          <Progress value={lesson.progress} className="h-1 mt-2" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask Instructor
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Flag className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
