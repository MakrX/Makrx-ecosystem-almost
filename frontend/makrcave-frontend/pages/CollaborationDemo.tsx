import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  Video, 
  FileText, 
  PaintBucket, 
  Monitor,
  Zap,
  Share2,
  Eye,
  Edit3,
  Clock,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Rocket
} from 'lucide-react';
import ProjectCollaborationHub from '../components/collaboration/ProjectCollaborationHub';
import RealTimeEditingIndicators from '../components/collaboration/RealTimeEditingIndicators';
import CollaborativeWhiteboard from '../components/collaboration/CollaborativeWhiteboard';
import SharedDocumentEditor from '../components/collaboration/SharedDocumentEditor';

const CollaborationDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showCollaborationHub, setShowCollaborationHub] = useState(false);
  const demoProjectId = 'demo-collaboration-project';

  const collaborationFeatures = [
    {
      id: 'real-time-chat',
      title: 'Real-time Chat & Communication',
      description: 'Instant messaging with team members, quick reactions, and system notifications',
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      capabilities: [
        'Instant team messaging',
        'Quick reaction buttons',
        'System notifications',
        'Message threading',
        'File sharing in chat'
      ]
    },
    {
      id: 'live-editing',
      title: 'Live Editing Indicators',
      description: 'See who is editing what in real-time with collaborative cursors and presence indicators',
      icon: Edit3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      capabilities: [
        'Real-time cursor tracking',
        'Active user indicators',
        'Element editing status',
        'Conflict prevention',
        'User presence awareness'
      ]
    },
    {
      id: 'whiteboard',
      title: 'Collaborative Whiteboard',
      description: 'Draw, sketch, and brainstorm together in real-time with shared visual workspace',
      icon: PaintBucket,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      capabilities: [
        'Real-time drawing sync',
        'Multiple user cursors',
        'Shape and text tools',
        'Undo/redo collaboration',
        'Export and save boards'
      ]
    },
    {
      id: 'document-editing',
      title: 'Shared Document Editing',
      description: 'Collaborate on documents with real-time sync, version history, and conflict resolution',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      capabilities: [
        'Real-time text editing',
        'Version history',
        'Document locking',
        'Cursor synchronization',
        'Auto-save functionality'
      ]
    },
    {
      id: 'video-calls',
      title: 'Integrated Video Calls',
      description: 'Start video calls directly within projects without leaving the collaboration context',
      icon: Video,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      capabilities: [
        'In-app video calling',
        'Screen sharing',
        'Audio controls',
        'Call notifications',
        'Integration with chat'
      ]
    },
    {
      id: 'presence-awareness',
      title: 'Real-time Presence',
      description: 'Know who is online, what they are viewing, and their current activity status',
      icon: Eye,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      capabilities: [
        'Online status indicators',
        'Current view tracking',
        'Activity status',
        'Last seen timestamps',
        'Idle detection'
      ]
    }
  ];

  const useCases = [
    {
      title: 'Design Reviews',
      description: 'Review CAD files and designs together with real-time annotations',
      icon: Monitor,
      steps: [
        'Share design files in project',
        'Start collaborative session',
        'Use whiteboard for annotations',
        'Document feedback in real-time'
      ]
    },
    {
      title: 'Project Planning',
      description: 'Plan project milestones and tasks with team collaboration',
      icon: Lightbulb,
      steps: [
        'Create shared planning document',
        'Brainstorm on whiteboard',
        'Assign tasks in real-time',
        'Track progress together'
      ]
    },
    {
      title: 'Remote Workshops',
      description: 'Conduct virtual workshops and training sessions',
      icon: Rocket,
      steps: [
        'Set up video call',
        'Share screen for demos',
        'Use whiteboard for exercises',
        'Document outcomes together'
      ]
    }
  ];

  const renderFeatureDemo = (featureId: string) => {
    switch (featureId) {
      case 'real-time-chat':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Real-time Chat Demo</h3>
            <p className="text-gray-600 mb-4">
              Click the collaboration hub button to see the real-time chat interface in action.
            </p>
            <Button onClick={() => setShowCollaborationHub(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Open Chat Demo
            </Button>
          </div>
        );

      case 'live-editing':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Live Editing Indicators Demo</h3>
            <p className="text-gray-600 mb-4">
              The indicators below show when users are actively editing elements:
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Project Description</span>
                <RealTimeEditingIndicators 
                  projectId={demoProjectId}
                  elementId="description"
                  showViewers={true}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span>BOM Item Details</span>
                <RealTimeEditingIndicators 
                  projectId={demoProjectId}
                  elementId="bom-item-1"
                  showViewers={true}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Milestone Timeline</span>
                <RealTimeEditingIndicators 
                  projectId={demoProjectId}
                  elementId="milestone-timeline"
                  showViewers={true}
                />
              </div>
            </div>
          </div>
        );

      case 'whiteboard':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Collaborative Whiteboard Demo</h3>
            <CollaborativeWhiteboard 
              projectId={demoProjectId}
              height={400}
            />
          </div>
        );

      case 'document-editing':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Shared Document Editor Demo</h3>
            <SharedDocumentEditor 
              projectId={demoProjectId}
              documentId="demo-document"
              title="Demo Project Document"
              initialContent="# Demo Project Document

Welcome to the collaborative document editor demo!

## Features
- Real-time editing
- Cursor synchronization
- Auto-save functionality
- Version history
- Document locking

Try editing this document to see the collaboration features in action."
            />
          </div>
        );

      case 'video-calls':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Video Call Integration Demo</h3>
            <p className="text-gray-600 mb-4">
              Video calling is integrated into the collaboration hub. Start a call to see the interface.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Video Call Controls</span>
                <Badge variant="outline">Demo Mode</Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Start Call
                </Button>
                <Button variant="outline" size="sm">
                  <Monitor className="h-4 w-4 mr-2" />
                  Share Screen
                </Button>
              </div>
            </div>
          </div>
        );

      case 'presence-awareness':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Presence Awareness Demo</h3>
            <p className="text-gray-600 mb-4">
              See who is currently active in the project and what they are working on.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Alex Chen</span>
                </div>
                <div className="text-sm text-gray-600">
                  Editing BOM • Last active now
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span>Sarah Kim</span>
                </div>
                <div className="text-sm text-gray-600">
                  Viewing Timeline • Idle 2m ago
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>Mike Rodriguez</span>
                </div>
                <div className="text-sm text-gray-600">
                  Drawing on Whiteboard • Last active now
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-3xl font-bold">
          <Users className="h-8 w-8 text-blue-600" />
          <span>Real-time Collaboration Features</span>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience seamless teamwork with MakrCave's advanced collaboration tools designed for modern maker teams
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Zap className="h-4 w-4" />
          <span>Powered by real-time WebSocket technology</span>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Real-time Sync</h3>
            <p className="text-sm text-gray-600">
              See changes instantly across all team members with zero delay
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Conflict Prevention</h3>
            <p className="text-sm text-gray-600">
              Smart locking and indicators prevent editing conflicts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Share2 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Seamless Integration</h3>
            <p className="text-sm text-gray-600">
              Built into every aspect of project management
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Collaboration Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborationFeatures.map((feature) => (
            <Card 
              key={feature.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeDemo === feature.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActiveDemo(activeDemo === feature.id ? null : feature.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <ArrowRight className={`h-4 w-4 transition-transform ${
                    activeDemo === feature.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Demo */}
      {activeDemo && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Interactive Demo</span>
              <Badge variant="secondary">Live Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderFeatureDemo(activeDemo)}
          </CardContent>
        </Card>
      )}

      {/* Use Cases */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Common Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <useCase.icon className="h-6 w-6 text-blue-600" />
                  <CardTitle>{useCase.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center space-x-2 text-sm">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {stepIndex + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Try It Out Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Collaborate?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Experience the power of real-time collaboration in your next project. 
            Start working together seamlessly with your team.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg"
              onClick={() => setShowCollaborationHub(true)}
            >
              <Users className="h-5 w-5 mr-2" />
              Start Collaborating
            </Button>
            <Button variant="outline" size="lg">
              <FileText className="h-5 w-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Hub */}
      <ProjectCollaborationHub
        projectId={demoProjectId}
        isVisible={showCollaborationHub}
        onToggle={() => setShowCollaborationHub(!showCollaborationHub)}
      />
    </div>
  );
};

export default CollaborationDemo;
