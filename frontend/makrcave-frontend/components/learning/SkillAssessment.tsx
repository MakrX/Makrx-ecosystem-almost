import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { 
  CheckCircle2,
  Clock,
  Award,
  Target,
  Star,
  Play,
  RotateCcw,
  Download,
  Share2,
  AlertCircle,
  BookOpen,
  Users,
  TrendingUp
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  explanation?: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in minutes
  questions: Question[];
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  lastScore?: number;
  bestScore?: number;
  completed?: boolean;
  certificateEligible: boolean;
}

interface SkillAssessmentProps {
  assessment?: Assessment;
  onComplete?: (score: number, passed: boolean) => void;
  onClose?: () => void;
}

const SkillAssessment: React.FC<SkillAssessmentProps> = ({ 
  assessment, 
  onComplete,
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState<'overview' | 'assessment' | 'results'>('overview');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    categoryScores: Record<string, { correct: number; total: number }>;
  } | null>(null);

  // Mock assessment if none provided
  const mockAssessment: Assessment = {
    id: 'assessment-001',
    title: '3D Printing Fundamentals Assessment',
    description: 'Test your knowledge of 3D printing basics, materials, and safety protocols.',
    category: '3D Printing',
    difficulty: 'Beginner',
    duration: 30,
    passingScore: 70,
    attempts: 1,
    maxAttempts: 3,
    lastScore: 85,
    bestScore: 85,
    completed: false,
    certificateEligible: true,
    questions: [
      {
        id: 'q1',
        question: 'What is the most common material used in FDM 3D printing?',
        options: ['PLA', 'ABS', 'PETG', 'TPU'],
        correctAnswer: 0,
        difficulty: 'easy',
        category: 'Materials',
        explanation: 'PLA (Polylactic Acid) is the most commonly used material for FDM printing due to its ease of use and low printing temperature.'
      },
      {
        id: 'q2',
        question: 'What does "layer height" refer to in 3D printing?',
        options: [
          'The total height of the print',
          'The thickness of each individual layer',
          'The height of the print bed',
          'The height of the nozzle'
        ],
        correctAnswer: 1,
        difficulty: 'easy',
        category: 'Fundamentals'
      },
      {
        id: 'q3',
        question: 'Which support structure type is best for overhangs greater than 45 degrees?',
        options: [
          'No supports needed',
          'Tree supports',
          'Grid supports',
          'Linear supports'
        ],
        correctAnswer: 1,
        difficulty: 'medium',
        category: 'Advanced Techniques'
      },
      {
        id: 'q4',
        question: 'What is the recommended bed temperature for printing ABS?',
        options: ['40-50°C', '60-80°C', '90-110°C', '120-140°C'],
        correctAnswer: 2,
        difficulty: 'medium',
        category: 'Materials'
      },
      {
        id: 'q5',
        question: 'Which post-processing technique is most effective for removing layer lines?',
        options: ['Sanding', 'Chemical smoothing', 'Heat treatment', 'Painting'],
        correctAnswer: 1,
        difficulty: 'hard',
        category: 'Post-Processing'
      }
    ]
  };

  const currentAssessment = assessment || mockAssessment;

  React.useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isTimerActive && timeRemaining === 0) {
      handleSubmitAssessment();
    }
  }, [timeRemaining, isTimerActive]);

  const startAssessment = () => {
    setCurrentStep('assessment');
    setCurrentQuestion(0);
    setAnswers({});
    setTimeRemaining(currentAssessment.duration * 60);
    setIsTimerActive(true);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentAssessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    setIsTimerActive(false);
    
    // Calculate results
    let correctAnswers = 0;
    const categoryScores: Record<string, { correct: number; total: number }> = {};
    
    currentAssessment.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { correct: 0, total: 0 };
      }
      categoryScores[question.category].total++;
      if (isCorrect) categoryScores[question.category].correct++;
    });
    
    const score = Math.round((correctAnswers / currentAssessment.questions.length) * 100);
    const passed = score >= currentAssessment.passingScore;
    
    setResults({
      score,
      passed,
      correctAnswers,
      totalQuestions: currentAssessment.questions.length,
      categoryScores
    });
    
    setCurrentStep('results');
    onComplete?.(score, passed);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (currentStep === 'overview') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Assessment Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{currentAssessment.title}</CardTitle>
                <p className="text-gray-600">{currentAssessment.description}</p>
              </div>
              <Badge className={getDifficultyColor(currentAssessment.difficulty)}>
                {currentAssessment.difficulty}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Assessment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold">{currentAssessment.duration} min</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">{currentAssessment.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="font-semibold">{currentAssessment.passingScore}%</div>
                <div className="text-sm text-gray-600">Passing Score</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <RotateCcw className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold">{currentAssessment.attempts}/{currentAssessment.maxAttempts}</div>
                <div className="text-sm text-gray-600">Attempts</div>
              </div>
            </div>

            {/* Previous Attempts */}
            {currentAssessment.lastScore && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Previous Performance
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Last Score:</span>
                    <div className="font-semibold text-lg">{currentAssessment.lastScore}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Best Score:</span>
                    <div className="font-semibold text-lg">{currentAssessment.bestScore}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-4">
              <h4 className="font-semibold">Instructions:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Answer all questions to the best of your ability
                </li>
                <li className="flex items-start">
                  <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  You have {currentAssessment.duration} minutes to complete the assessment
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  You can navigate between questions, but submit before time runs out
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  {currentAssessment.certificateEligible && 'Earn a certificate by scoring 80% or higher'}
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button onClick={startAssessment} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Assessment
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'assessment') {
    const currentQ = currentAssessment.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentAssessment.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Assessment Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{currentAssessment.title}</h2>
                <div className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {currentAssessment.questions.length}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-red-600">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">
                {currentQ.question}
              </CardTitle>
              <div className="flex space-x-2">
                <Badge className={getDifficultyColor(currentQ.difficulty)}>
                  {currentQ.difficulty}
                </Badge>
                <Badge variant="outline">
                  {currentQ.category}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQ.id]?.toString()}
              onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {currentAssessment.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[currentAssessment.questions[index].id] !== undefined
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {currentQuestion === currentAssessment.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitAssessment}
                  disabled={Object.keys(answers).length < currentAssessment.questions.length}
                >
                  Submit Assessment
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={answers[currentQ.id] === undefined}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'results' && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              {results.passed ? (
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              ) : (
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {results.passed ? 'Congratulations!' : 'Assessment Complete'}
            </h2>
            <p className="text-gray-600 mb-4">
              {results.passed
                ? 'You have successfully passed the assessment!'
                : `You need ${currentAssessment.passingScore}% to pass. Keep learning and try again!`
              }
            </p>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {results.score}%
            </div>
            <div className="text-gray-600">
              {results.correctAnswers} out of {results.totalQuestions} questions correct
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(results.categoryScores).map(([category, scores]) => {
                const percentage = Math.round((scores.correct / scores.total) * 100);
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{category}</span>
                      <span>{scores.correct}/{scores.total} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.passed ? (
                <div className="space-y-3">
                  {currentAssessment.certificateEligible && results.score >= 80 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-800 mb-2">
                        <Award className="h-4 w-4 mr-2" />
                        <span className="font-medium">Certificate Earned!</span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        You've earned a certificate for this assessment.
                      </p>
                      <div className="flex space-x-2">
                        <Button size="sm">
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
                  <div className="space-y-2">
                    <h5 className="font-medium">Recommended Actions:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Continue to advanced courses in this topic</li>
                      <li>• Apply your knowledge in practical projects</li>
                      <li>• Share your achievement with your network</li>
                      <li>• Explore related certification paths</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h5 className="font-medium">Study Recommendations:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {Object.entries(results.categoryScores)
                      .filter(([, scores]) => (scores.correct / scores.total) < 0.7)
                      .map(([category]) => (
                        <li key={category}>• Review {category} concepts and materials</li>
                      ))
                    }
                    <li>• Take additional practice quizzes</li>
                    <li>• Join study groups or forums</li>
                  </ul>
                  <div className="pt-3">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Recommended Courses
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-3 justify-center">
              {!results.passed && currentAssessment.attempts < currentAssessment.maxAttempts && (
                <Button onClick={() => setCurrentStep('overview')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Return to Learning
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default SkillAssessment;
