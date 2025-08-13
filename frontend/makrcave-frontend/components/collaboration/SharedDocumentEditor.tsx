import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  FileText, 
  Save, 
  Download, 
  Share2, 
  History, 
  Users, 
  Edit3,
  Eye,
  Lock,
  Unlock,
  Plus,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useAuth } from '../../contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface DocumentChange {
  id: string;
  user_id: string;
  user_name: string;
  operation: 'insert' | 'delete' | 'format';
  position: number;
  content: string;
  timestamp: Date;
}

interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  author: string;
  timestamp: Date;
  comment?: string;
}

interface ActiveEditor {
  user_id: string;
  user_name: string;
  cursor_position: number;
  selection_start?: number;
  selection_end?: number;
  last_activity: Date;
  color: string;
}

interface SharedDocumentEditorProps {
  projectId: string;
  documentId?: string;
  title?: string;
  initialContent?: string;
  isReadOnly?: boolean;
  className?: string;
}

const SharedDocumentEditor: React.FC<SharedDocumentEditorProps> = ({
  projectId,
  documentId,
  title = 'Shared Document',
  initialContent = '',
  isReadOnly = false,
  className = ''
}) => {
  const { user } = useAuth();
  const { addEventListener, isConnected } = useRealTimeUpdates();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Document state
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockOwner, setLockOwner] = useState<string | null>(null);

  // Collaboration state
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([]);
  const [documentHistory, setDocumentHistory] = useState<DocumentVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');

  // User colors for collaborative editing
  const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const getUserColor = (userId: string) => {
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return userColors[Math.abs(hash) % userColors.length];
  };

  // Real-time collaboration listeners
  useEffect(() => {
    if (!isConnected || !documentId) return;

    const removeListeners = [
      addEventListener('document.change', (event) => {
        if (event.payload.document_id === documentId && event.payload.user_id !== user?.id) {
          const change: DocumentChange = {
            id: event.id,
            user_id: event.payload.user_id,
            user_name: event.payload.user_name,
            operation: event.payload.operation,
            position: event.payload.position,
            content: event.payload.content,
            timestamp: new Date(event.payload.timestamp)
          };

          applyRemoteChange(change);
        }
      }),

      addEventListener('document.cursor', (event) => {
        if (event.payload.document_id === documentId && event.payload.user_id !== user?.id) {
          setActiveEditors(prev => {
            const filtered = prev.filter(e => e.user_id !== event.payload.user_id);
            filtered.push({
              user_id: event.payload.user_id,
              user_name: event.payload.user_name,
              cursor_position: event.payload.position,
              selection_start: event.payload.selection_start,
              selection_end: event.payload.selection_end,
              last_activity: new Date(event.payload.timestamp),
              color: getUserColor(event.payload.user_id)
            });
            return filtered;
          });
        }
      }),

      addEventListener('document.lock', (event) => {
        if (event.payload.document_id === documentId) {
          setIsLocked(event.payload.locked);
          setLockOwner(event.payload.locked ? event.payload.user_id : null);
        }
      })
    ];

    return () => {
      removeListeners.forEach(remove => remove());
    };
  }, [isConnected, documentId, addEventListener, user?.id]);

  // Apply remote changes to document
  const applyRemoteChange = (change: DocumentChange) => {
    setContent(prev => {
      switch (change.operation) {
        case 'insert':
          return prev.slice(0, change.position) + change.content + prev.slice(change.position);
        case 'delete':
          return prev.slice(0, change.position) + prev.slice(change.position + change.content.length);
        default:
          return prev;
      }
    });
  };

  // Broadcast document changes
  const broadcastChange = async (operation: 'insert' | 'delete', position: number, content: string) => {
    if (!user || !isConnected || !documentId) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      await fetch('/api/v1/collaboration/document/change', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_id: documentId,
          project_id: projectId,
          user_id: user.id,
          user_name: user.name || user.email,
          operation,
          position,
          content,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to broadcast change:', error);
    }
  };

  // Broadcast cursor position
  const broadcastCursor = useCallback(async (position: number, selStart?: number, selEnd?: number) => {
    if (!user || !isConnected || !documentId) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      await fetch('/api/v1/collaboration/document/cursor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_id: documentId,
          project_id: projectId,
          user_id: user.id,
          user_name: user.name || user.email,
          position,
          selection_start: selStart,
          selection_end: selEnd,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to broadcast cursor:', error);
    }
  }, [user, isConnected, documentId, projectId]);

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isReadOnly || (isLocked && lockOwner !== user?.id)) return;

    const newContent = e.target.value;
    const oldContent = content;
    
    // Determine the change operation
    if (newContent.length > oldContent.length) {
      // Insert operation
      const position = e.target.selectionStart - (newContent.length - oldContent.length);
      const insertedText = newContent.slice(position, e.target.selectionStart);
      broadcastChange('insert', position, insertedText);
    } else if (newContent.length < oldContent.length) {
      // Delete operation
      const position = e.target.selectionStart;
      const deletedText = oldContent.slice(position, position + (oldContent.length - newContent.length));
      broadcastChange('delete', position, deletedText);
    }

    setContent(newContent);
    setHasUnsavedChanges(newContent !== savedContent);
    
    // Auto-save with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  };

  // Handle cursor and selection changes
  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const position = textarea.selectionStart;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setCursorPosition(position);
    setSelectionStart(start);
    setSelectionEnd(end);

    broadcastCursor(position, start !== end ? start : undefined, start !== end ? end : undefined);
  };

  // Save document
  const handleSave = async () => {
    if (!documentId || !hasUnsavedChanges) return;

    setSyncStatus('saving');
    
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          project_id: projectId
        })
      });

      if (response.ok) {
        setSavedContent(content);
        setHasUnsavedChanges(false);
        setLastSaveTime(new Date());
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      setSyncStatus('error');
    }
  };

  // Toggle document lock
  const handleToggleLock = async () => {
    if (!documentId || !user) return;

    const newLockState = !isLocked || lockOwner !== user.id;
    
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      await fetch(`/api/v1/documents/${documentId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locked: newLockState,
          project_id: projectId
        })
      });

      setIsLocked(newLockState);
      setLockOwner(newLockState ? user.id : null);
    } catch (error) {
      console.error('Failed to toggle lock:', error);
    }
  };

  // Export document
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Load document history
  const loadHistory = async () => {
    if (!documentId) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/documents/${documentId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const history = await response.json();
        setDocumentHistory(history);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // Restore from history
  const restoreVersion = async (version: DocumentVersion) => {
    if (!window.confirm(`Restore to version ${version.version}? Current changes will be lost.`)) return;

    setContent(version.content);
    setSavedContent(version.content);
    setHasUnsavedChanges(false);
    setShowHistory(false);
    await handleSave();
  };

  // Clean up old editor presence
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      setActiveEditors(prev => 
        prev.filter(editor => now.getTime() - editor.last_activity.getTime() < 10000)
      );
    }, 5000);

    return () => clearInterval(cleanup);
  }, []);

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'saving':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'synced':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'saving':
        return 'Saving...';
      case 'synced':
        return lastSaveTime ? `Saved ${formatDistanceToNow(lastSaveTime, { addSuffix: true })}` : 'Saved';
      case 'error':
        return 'Error saving';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg">{title}</CardTitle>
            
            {isLocked && (
              <Badge variant={lockOwner === user?.id ? 'default' : 'destructive'}>
                <Lock className="h-3 w-3 mr-1" />
                {lockOwner === user?.id ? 'Locked by you' : 'Locked'}
              </Badge>
            )}
            
            {!isConnected && (
              <Badge variant="destructive">Offline</Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Sync status */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {getSyncStatusIcon()}
              <span>{getSyncStatusText()}</span>
            </div>

            {/* Active editors */}
            <div className="flex -space-x-1">
              {activeEditors.slice(0, 3).map(editor => (
                <Avatar key={editor.user_id} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback 
                    className="text-xs"
                    style={{ backgroundColor: editor.color + '20', color: editor.color }}
                  >
                    {editor.user_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {activeEditors.length > 3 && (
                <Badge variant="outline" className="h-6 text-xs">
                  +{activeEditors.length - 3}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || syncStatus === 'saving'}
              >
                <Save className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={loadHistory}>
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleToggleLock}>
                    {isLocked ? (
                      <>
                        <Unlock className="h-4 w-4 mr-2" />
                        Unlock Document
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Lock for Editing
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onSelect={handleSelectionChange}
            onMouseUp={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            placeholder="Start typing to collaborate in real-time..."
            className="w-full h-96 p-4 resize-none border-0 focus:outline-none font-mono text-sm"
            disabled={isReadOnly || (isLocked && lockOwner !== user?.id)}
          />

          {/* Collaborative cursors overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {activeEditors.map(editor => {
              const textarea = textareaRef.current;
              if (!textarea) return null;

              // Calculate cursor position (simplified - real implementation would need more complex positioning)
              const lines = content.slice(0, editor.cursor_position).split('\n');
              const lineNumber = lines.length - 1;
              const lineHeight = 20; // Approximate line height
              const top = lineNumber * lineHeight + 16; // 16px for padding

              return (
                <div
                  key={editor.user_id}
                  className="absolute flex items-center"
                  style={{ 
                    top: Math.min(top, 380), // Keep within bounds
                    left: 16,
                    color: editor.color
                  }}
                >
                  <div 
                    className="w-0.5 h-5 mr-1"
                    style={{ backgroundColor: editor.color }}
                  />
                  <Badge 
                    variant="outline" 
                    className="text-xs h-5"
                    style={{ 
                      backgroundColor: editor.color + '20',
                      borderColor: editor.color,
                      color: editor.color
                    }}
                  >
                    {editor.user_name}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document info footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>{content.length} characters</span>
            <span>{content.split('\n').length} lines</span>
            <span>Cursor at {cursorPosition}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeEditors.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {activeEditors.length + 1} editing
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-2/3 h-2/3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Document History</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-2">
                {documentHistory.map(version => (
                  <div key={version.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Version {version.version}</div>
                      <div className="text-sm text-gray-600">
                        {version.author} • {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                      </div>
                      {version.comment && (
                        <div className="text-sm text-gray-500 italic">{version.comment}</div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreVersion(version)}
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default SharedDocumentEditor;
