import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Plus,
  Upload,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  File,
  Image,
  Video,
  Archive,
  Code,
  Search,
  Filter,
  Globe,
  Lock,
  Share2,
  ExternalLink,
  Github,
  HardDrive,
  AlertTriangle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatDistanceToNow } from 'date-fns';
import GitHubIntegration from './GitHubIntegration';

interface ProjectFile {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  description?: string;
  is_public: boolean;
  version: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface ProjectFilesProps {
  projectId: string;
  files: ProjectFile[];
  canEdit: boolean;
  onUpdate: () => void;
  // GitHub Integration props
  githubIntegrationEnabled?: boolean;
  githubRepoUrl?: string;
  githubRepoName?: string;
  githubDefaultBranch?: string;
}

const ProjectFiles: React.FC<ProjectFilesProps> = ({
  projectId,
  files,
  canEdit,
  onUpdate,
  githubIntegrationEnabled = false,
  githubRepoUrl,
  githubRepoName,
  githubDefaultBranch = 'main'
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [fileType, setFileType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getFileIcon = (type: string) => {
    const fileType = type.toLowerCase();
    if (fileType.includes('image')) return <Image className="h-4 w-4 text-blue-600" />;
    if (fileType.includes('video')) return <Video className="h-4 w-4 text-purple-600" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-4 w-4 text-red-600" />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <Archive className="h-4 w-4 text-yellow-600" />;
    if (fileType.includes('code') || fileType.includes('text')) return <Code className="h-4 w-4 text-green-600" />;
    return <File className="h-4 w-4 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      Array.from(selectedFiles).forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      formData.append('description', fileDescription);
      formData.append('is_public', isPublic.toString());
      formData.append('file_type', fileType || 'document');

      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
      setShowUploadModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (file: ProjectFile) => {
    // Create a download link
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.original_filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const resetForm = () => {
    setSelectedFiles(null);
    setFileDescription('');
    setIsPublic(false);
    setFileType('');
    setError(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getFileTypes = () => {
    const types = Array.from(new Set(files.map(f => f.file_type)));
    return types;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || file.file_type === filterType;
    return matchesSearch && matchesType;
  });

  const getFileCategoryStats = () => {
    const stats = {
      documents: files.filter(f => f.file_type.includes('document') || f.file_type.includes('pdf')).length,
      images: files.filter(f => f.file_type.includes('image')).length,
      videos: files.filter(f => f.file_type.includes('video')).length,
      others: files.filter(f => !f.file_type.includes('document') && !f.file_type.includes('pdf') && !f.file_type.includes('image') && !f.file_type.includes('video')).length,
    };
    return stats;
  };

  const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);
  const stats = getFileCategoryStats();

  const renderLocalFilesSection = () => (
    <>
      {/* File Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{files.length}</p>
                <p className="text-xs text-gray-600">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.documents}</p>
                <p className="text-xs text-gray-600">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.images}</p>
                <p className="text-xs text-gray-600">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.videos}</p>
                <p className="text-xs text-gray-600">Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                <p className="text-xs text-gray-600">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All File Types</SelectItem>
                  {getFileTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Local Files ({filteredFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No files found</p>
              <p className="text-sm">Upload documents, images, or other project files</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.file_type)}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate" title={file.original_filename}>
                          {file.original_filename}
                        </h4>
                        <p className="text-xs text-gray-500">v{file.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {file.is_public && (
                        <Globe className="h-3 w-3 text-green-600" title="Public file" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          {file.is_public && (
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open External
                          </DropdownMenuItem>
                          {canEdit && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete File
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {file.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {file.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Size:</span>
                      <span className="font-medium">{formatFileSize(file.file_size)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Uploaded:</span>
                      <span className="font-medium">{formatDate(file.uploaded_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">By:</span>
                      <span className="font-medium">{file.uploaded_by}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs">
                      {file.file_type}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {file.is_public ? (
                        <Globe className="h-3 w-3 text-green-600" />
                      ) : (
                        <Lock className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Files</h3>
          <p className="text-sm text-gray-600">
            {githubIntegrationEnabled
              ? "Manage files from GitHub repository and local uploads"
              : "Manage documents, images, and other project files"
            }
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        )}
      </div>

      {/* Tabs for GitHub vs Local Files */}
      {githubIntegrationEnabled ? (
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Local Files ({files.length})
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Repository
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-6">
            {renderLocalFilesSection()}
          </TabsContent>

          <TabsContent value="github" className="space-y-6">
            <GitHubIntegration
              projectId={projectId}
              isConnected={githubIntegrationEnabled}
              repoUrl={githubRepoUrl}
              repoName={githubRepoName}
              defaultBranch={githubDefaultBranch}
              canEdit={canEdit}
              onUpdate={onUpdate}
            />
          </TabsContent>
        </Tabs>
      ) : (
        renderLocalFilesSection()
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="files">Select Files</Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple files. Max size: 50MB per file.
              </p>
            </div>

            <div>
              <Label htmlFor="file-type">File Category</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select file category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="3d_model">3D Model</SelectItem>
                  <SelectItem value="drawing">Technical Drawing</SelectItem>
                  <SelectItem value="code">Code/Script</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe these files and their purpose..."
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <Label htmlFor="public" className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                Make files publicly accessible
              </Label>
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h4 className="font-medium text-sm mb-2">Selected Files:</h4>
                <div className="space-y-1">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="text-sm text-gray-600 flex justify-between">
                      <span>{file.name}</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleFileUpload} 
                disabled={isUploading || !selectedFiles || selectedFiles.length === 0}
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectFiles;
