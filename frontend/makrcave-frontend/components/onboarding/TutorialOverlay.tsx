import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  X, ArrowRight, ArrowLeft, Play, Pause, RotateCcw, 
  Lightbulb, Target, MousePointer, Keyboard, Eye,
  CheckCircle, Skip, Zap, BookOpen
} from 'lucide-react';

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'scroll' | 'type';
  actionText?: string;
  tip?: string;
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  onComplete: () => void;
  autoPlay?: boolean;
  canSkip?: boolean;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isVisible,
  onClose,
  steps,
  onComplete,
  autoPlay = false,
  canSkip = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isVisible || !currentStepData) return;

    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (element) {
      setHighlightedElement(element);
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let x = 0, y = 0;
      
      switch (currentStepData.position) {
        case 'top':
          x = rect.left + scrollLeft + rect.width / 2;
          y = rect.top + scrollTop - 10;
          break;
        case 'bottom':
          x = rect.left + scrollLeft + rect.width / 2;
          y = rect.bottom + scrollTop + 10;
          break;
        case 'left':
          x = rect.left + scrollLeft - 10;
          y = rect.top + scrollTop + rect.height / 2;
          break;
        case 'right':
          x = rect.right + scrollLeft + 10;
          y = rect.top + scrollTop + rect.height / 2;
          break;
      }
      
      setTooltipPosition({ x, y });
      
      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [currentStep, currentStepData, isVisible]);

  useEffect(() => {
    if (!isPlaying || !isVisible) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 4000); // Auto-advance after 4 seconds

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'click':
        return <MousePointer className="h-4 w-4" />;
      case 'hover':
        return <Eye className="h-4 w-4" />;
      case 'type':
        return <Keyboard className="h-4 w-4" />;
      case 'scroll':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  if (!isVisible || !currentStepData) return null;

  return (
    <>
      {/* Overlay Background */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        style={{
          background: highlightedElement 
            ? `radial-gradient(circle at ${tooltipPosition.x}px ${tooltipPosition.y}px, transparent 100px, rgba(0,0,0,0.6) 200px)`
            : 'rgba(0,0,0,0.6)'
        }}
      >
        {/* Highlight Ring */}
        {highlightedElement && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: highlightedElement.getBoundingClientRect().left - 4,
              top: highlightedElement.getBoundingClientRect().top - 4,
              width: highlightedElement.getBoundingClientRect().width + 8,
              height: highlightedElement.getBoundingClientRect().height + 8,
              border: '3px solid rgb(59, 130, 246)',
              borderRadius: '8px',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
              animation: 'pulse 2s infinite'
            }}
          />
        )}

        {/* Tutorial Tooltip */}
        <Card 
          className="absolute bg-white/95 backdrop-blur-md border-white/20 shadow-2xl max-w-sm z-10"
          style={{
            left: Math.max(20, Math.min(window.innerWidth - 380, tooltipPosition.x - 190)),
            top: Math.max(20, Math.min(window.innerHeight - 300, tooltipPosition.y + 
              (currentStepData.position === 'top' ? -200 : 
               currentStepData.position === 'bottom' ? 20 : -100)))
          }}
        >
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} of {steps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentStepData.content}
                </p>
              </div>

              {/* Action Hint */}
              {currentStepData.action && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  {getActionIcon(currentStepData.action)}
                  <span className="text-sm font-medium text-blue-700">
                    {currentStepData.actionText || `${currentStepData.action} to continue`}
                  </span>
                </div>
              )}

              {/* Tip */}
              {currentStepData.tip && (
                <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-yellow-700 mb-1">Pro Tip</p>
                    <p className="text-xs text-yellow-600">{currentStepData.tip}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlay}
                  className="h-8"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restart}
                  className="h-8"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {canSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="h-8 text-gray-500 hover:text-gray-700"
                  >
                    <Skip className="h-3 w-3 mr-1" />
                    Skip
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="h-8"
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
                
                <Button
                  onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
                  size="sm"
                  className="h-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tutorial Progress</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Styles for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.02);
          }
        }
      `}</style>
    </>
  );
};

export default TutorialOverlay;
