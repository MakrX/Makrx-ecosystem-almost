import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Palette, 
  Undo, 
  Redo, 
  Download, 
  Trash2,
  MousePointer2,
  Minus,
  Triangle,
  Sticky as StickyNote,
  Move3D,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useAuth } from '../../contexts/AuthContext';

interface DrawingAction {
  id: string;
  type: 'draw' | 'erase' | 'shape' | 'text' | 'note';
  user_id: string;
  user_name: string;
  data: any;
  timestamp: Date;
}

interface UserCursor {
  user_id: string;
  user_name: string;
  x: number;
  y: number;
  color: string;
  tool: string;
}

interface CollaborativeWhiteboardProps {
  projectId: string;
  className?: string;
  height?: number;
  isReadOnly?: boolean;
}

const CollaborativeWhiteboard: React.FC<CollaborativeWhiteboardProps> = ({
  projectId,
  className = '',
  height = 600,
  isReadOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const { addEventListener, isConnected } = useRealTimeUpdates();
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'select' | 'rectangle' | 'circle' | 'line' | 'text' | 'note'>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [undoStack, setUndoStack] = useState<DrawingAction[]>([]);
  const [userCursors, setUserCursors] = useState<UserCursor[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  // User colors for cursors and attribution
  const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const getUserColor = (userId: string) => {
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return userColors[Math.abs(hash) % userColors.length];
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');
    
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    
    if (overlayCtx) {
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';
    }

    // Load existing whiteboard data
    loadWhiteboardData();
  }, [projectId]);

  // Real-time collaboration
  useEffect(() => {
    if (!isConnected) return;

    const removeListeners = [
      addEventListener('whiteboard.action', (event) => {
        if (event.payload.project_id === projectId && event.payload.user_id !== user?.id) {
          const action: DrawingAction = {
            id: event.id,
            type: event.payload.type,
            user_id: event.payload.user_id,
            user_name: event.payload.user_name,
            data: event.payload.data,
            timestamp: new Date(event.payload.timestamp)
          };
          
          setActions(prev => [...prev, action]);
          applyAction(action);
        }
      }),

      addEventListener('whiteboard.cursor', (event) => {
        if (event.payload.project_id === projectId && event.payload.user_id !== user?.id) {
          setUserCursors(prev => {
            const filtered = prev.filter(c => c.user_id !== event.payload.user_id);
            filtered.push({
              user_id: event.payload.user_id,
              user_name: event.payload.user_name,
              x: event.payload.x,
              y: event.payload.y,
              color: getUserColor(event.payload.user_id),
              tool: event.payload.tool || 'pen'
            });
            return filtered;
          });
        }
      })
    ];

    return () => {
      removeListeners.forEach(remove => remove());
    };
  }, [isConnected, projectId, addEventListener, user?.id]);

  // Load whiteboard data
  const loadWhiteboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/whiteboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActions(data.actions || []);
        redrawCanvas(data.actions || []);
      }
    } catch (error) {
      console.error('Failed to load whiteboard data:', error);
    }
  };

  // Broadcast action
  const broadcastAction = async (action: DrawingAction) => {
    if (!user || !isConnected) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      await fetch('/api/v1/collaboration/whiteboard/action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          user_id: user.id,
          user_name: user.name || user.email,
          type: action.type,
          data: action.data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to broadcast action:', error);
    }
  };

  // Broadcast cursor position
  const broadcastCursor = useCallback(async (x: number, y: number) => {
    if (!user || !isConnected) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      await fetch('/api/v1/collaboration/whiteboard/cursor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          user_id: user.id,
          user_name: user.name || user.email,
          x: x,
          y: y,
          tool: currentTool,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to broadcast cursor:', error);
    }
  }, [user, isConnected, projectId, currentTool]);

  // Apply drawing action
  const applyAction = (action: DrawingAction) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    switch (action.type) {
      case 'draw':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = action.data.color;
        ctx.lineWidth = action.data.width;
        ctx.beginPath();
        ctx.moveTo(action.data.points[0].x, action.data.points[0].y);
        action.data.points.forEach((point: { x: number; y: number }) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        break;

      case 'erase':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = action.data.width;
        ctx.beginPath();
        ctx.moveTo(action.data.points[0].x, action.data.points[0].y);
        action.data.points.forEach((point: { x: number; y: number }) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        break;

      case 'shape':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = action.data.color;
        ctx.lineWidth = action.data.width;
        ctx.beginPath();
        
        switch (action.data.shape) {
          case 'rectangle':
            ctx.rect(action.data.x, action.data.y, action.data.width, action.data.height);
            break;
          case 'circle':
            ctx.arc(action.data.x + action.data.width / 2, action.data.y + action.data.height / 2, 
                   Math.min(Math.abs(action.data.width), Math.abs(action.data.height)) / 2, 0, 2 * Math.PI);
            break;
          case 'line':
            ctx.moveTo(action.data.x, action.data.y);
            ctx.lineTo(action.data.x + action.data.width, action.data.y + action.data.height);
            break;
        }
        ctx.stroke();
        break;

      case 'text':
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = action.data.color;
        ctx.font = `${action.data.fontSize || 16}px Arial`;
        ctx.fillText(action.data.text, action.data.x, action.data.y);
        break;
    }

    ctx.restore();
  };

  // Redraw entire canvas
  const redrawCanvas = (actionsToRender: DrawingAction[] = actions) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    actionsToRender.forEach(applyAction);
  };

  // Mouse event handlers
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      const action: DrawingAction = {
        id: Date.now().toString(),
        type: currentTool === 'pen' ? 'draw' : 'erase',
        user_id: user?.id || '',
        user_name: user?.name || user?.email || '',
        data: {
          points: [pos],
          color: strokeColor,
          width: strokeWidth
        },
        timestamp: new Date()
      };
      
      setActions(prev => [...prev, action]);
      setUndoStack([]);
      broadcastAction(action);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    broadcastCursor(pos.x, pos.y);

    if (!isDrawing || isReadOnly) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      setActions(prev => {
        const lastAction = prev[prev.length - 1];
        if (lastAction && lastAction.user_id === user?.id) {
          const updatedAction = {
            ...lastAction,
            data: {
              ...lastAction.data,
              points: [...lastAction.data.points, pos]
            }
          };
          
          const newActions = [...prev.slice(0, -1), updatedAction];
          applyAction(updatedAction);
          broadcastAction(updatedAction);
          return newActions;
        }
        return prev;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Tool handlers
  const handleUndo = () => {
    if (actions.length === 0) return;

    const lastAction = actions[actions.length - 1];
    setUndoStack(prev => [...prev, lastAction]);
    setActions(prev => prev.slice(0, -1));
    redrawCanvas(actions.slice(0, -1));
  };

  const handleRedo = () => {
    if (undoStack.length === 0) return;

    const actionToRedo = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setActions(prev => [...prev, actionToRedo]);
    applyAction(actionToRedo);
  };

  const handleClear = () => {
    if (!window.confirm('Clear the entire whiteboard? This cannot be undone.')) return;
    
    setActions([]);
    setUndoStack([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${projectId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Render user cursors on overlay
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    userCursors.forEach(cursor => {
      const x = cursor.x * zoom + pan.x;
      const y = cursor.y * zoom + pan.y;

      // Draw cursor
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = cursor.color;
      ctx.fill();

      // Draw user name
      ctx.fillStyle = cursor.color;
      ctx.font = '12px Arial';
      ctx.fillText(cursor.user_name, x + 8, y - 8);
    });
  }, [userCursors, zoom, pan]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Collaborative Whiteboard
            {!isConnected && (
              <Badge variant="destructive">Offline</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-1">
            {/* Active users */}
            <div className="flex -space-x-1 mr-2">
              {userCursors.slice(0, 3).map(cursor => (
                <Avatar key={cursor.user_id} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback 
                    className="text-xs"
                    style={{ backgroundColor: cursor.color + '20', color: cursor.color }}
                  >
                    {cursor.user_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {userCursors.length > 3 && (
                <Badge variant="outline" className="h-6 text-xs">
                  +{userCursors.length - 3}
                </Badge>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-2">
            {/* Tools */}
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button
                variant={currentTool === 'select' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTool('select')}
                disabled={isReadOnly}
              >
                <MousePointer2 className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'pen' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTool('pen')}
                disabled={isReadOnly}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'eraser' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTool('eraser')}
                disabled={isReadOnly}
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'rectangle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTool('rectangle')}
                disabled={isReadOnly}
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'circle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTool('circle')}
                disabled={isReadOnly}
              >
                <Circle className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTool('line')}
                disabled={isReadOnly}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTool('text')}
                disabled={isReadOnly}
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>

            {/* Color picker */}
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
              disabled={isReadOnly}
            />

            {/* Stroke width */}
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-20"
              disabled={isReadOnly}
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom controls */}
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={actions.length === 0 || isReadOnly}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={undoStack.length === 0 || isReadOnly}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={actions.length === 0 || isReadOnly}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative" style={{ height }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={height}
            className="absolute inset-0 border rounded-lg cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: '0 0'
            }}
          />
          <canvas
            ref={overlayRef}
            width={800}
            height={height}
            className="absolute inset-0 pointer-events-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborativeWhiteboard;
