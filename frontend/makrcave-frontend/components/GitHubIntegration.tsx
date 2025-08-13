import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Github, 
  GitBranch, 
  GitCommit, 
  FileText, 
  Star, 
  Eye, 
  GitFork, 
  ExternalLink,
  Calendar,
  User,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  description?: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language?: string;
  updated_at: string;
  html_url: string;
}

interface GitHubIntegrationProps {
  repoUrl: string;
  branch?: string;
  className?: string;
}

const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({ 
  repoUrl, 
  branch = 'main',
  className = '' 
}) => {
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Extract repo info from URL
  const getRepoInfo = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  };

  const repoInfo = getRepoInfo(repoUrl);

  // Mock data for development (since GitHub API requires authentication)
  const getMockData = () => {
    const mockRepo: GitHubRepo = {
      name: repoInfo?.repo || 'project-repo',
      full_name: `${repoInfo?.owner}/${repoInfo?.repo}` || 'user/project-repo',
      description: 'IoT home automation system with Arduino and sensors',
      stargazers_count: 42,
      watchers_count: 15,
      forks_count: 8,
      language: 'Arduino',
      updated_at: new Date().toISOString(),
      html_url: repoUrl
    };

    const mockCommits: GitHubCommit[] = [
      {
        sha: 'abc123',
        message: 'Add temperature sensor calibration',
        author: {
          name: 'John Maker',
          email: 'john@example.com',
          date: new Date(Date.now() - 86400000).toISOString()
        },
        url: `${repoUrl}/commit/abc123`
      },
      {
        sha: 'def456',
        message: 'Update WiFi connection logic',
        author: {
          name: 'Sarah Developer',
          email: 'sarah@example.com',
          date: new Date(Date.now() - 172800000).toISOString()
        },
        url: `${repoUrl}/commit/def456`
      },
      {
        sha: 'ghi789',
        message: 'Initial project setup and documentation',
        author: {
          name: 'John Maker',
          email: 'john@example.com',
          date: new Date(Date.now() - 259200000).toISOString()
        },
        url: `${repoUrl}/commit/ghi789`
      }
    ];

    const mockFiles: GitHubFile[] = [
      { name: 'README.md', path: 'README.md', type: 'file', size: 2048 },
      { name: 'src', path: 'src', type: 'dir' },
      { name: 'main.ino', path: 'src/main.ino', type: 'file', size: 4096 },
      { name: 'sensors.h', path: 'src/sensors.h', type: 'file', size: 1024 },
      { name: 'wifi_config.h', path: 'src/wifi_config.h', type: 'file', size: 512 },
      { name: 'schematics', path: 'schematics', type: 'dir' },
      { name: 'circuit.png', path: 'schematics/circuit.png', type: 'file', size: 102400 },
      { name: 'BOM.xlsx', path: 'BOM.xlsx', type: 'file', size: 8192 }
    ];

    return { mockRepo, mockCommits, mockFiles };
  };

  const fetchGitHubData = async () => {
    if (!repoInfo) {
      setError('Invalid GitHub repository URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would fetch from GitHub API
      // For now, we'll use mock data
      const { mockRepo, mockCommits, mockFiles } = getMockData();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRepo(mockRepo);
      setCommits(mockCommits);
      setFiles(mockFiles);
    } catch (err) {
      setError('Failed to fetch GitHub data');
      console.error('GitHub API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoUrl && repoInfo) {
      fetchGitHubData();
    }
  }, [repoUrl, branch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!repoInfo) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Invalid GitHub repository URL</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGitHubData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(repoUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button variant="outline" onClick={fetchGitHubData} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="commits">Commits</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : repo ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{repo.full_name}</h3>
                    {repo.description && (
                      <p className="text-gray-600 mt-1">{repo.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        {repo.language}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {repo.stargazers_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {repo.forks_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {repo.watchers_count}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Last updated {formatDate(repo.updated_at)}
                  </div>

                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <Badge variant="outline">{branch}</Badge>
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="commits" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {commits.map((commit) => (
                    <div key={commit.sha} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <GitCommit className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{commit.message}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {commit.author.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(commit.author.date)}
                            </div>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {commit.sha.substring(0, 7)}
                            </code>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(commit.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.path} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{file.name}</span>
                        {file.type === 'dir' && <Badge variant="secondary" className="text-xs">DIR</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {file.size && (
                          <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                        )}
                        {file.type === 'file' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`${repoUrl}/blob/${branch}/${file.path}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubIntegration;
