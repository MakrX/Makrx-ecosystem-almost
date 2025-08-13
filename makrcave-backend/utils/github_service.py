import requests
import base64
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
import re
from urllib.parse import urlparse

from ..schemas.project import GitHubRepoInfo, GitHubCommit, GitHubFile, GitHubActivity

class GitHubService:
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "MakrCave-Project-Manager"
        }
        if access_token:
            self.headers["Authorization"] = f"token {access_token}"

    def parse_repo_url(self, repo_url: str) -> Optional[Dict[str, str]]:
        """Parse GitHub repository URL to extract owner and repo name"""
        # Support various GitHub URL formats
        patterns = [
            r"github\.com/([^/]+)/([^/]+)/?$",
            r"github\.com/([^/]+)/([^/]+)\.git$",
            r"github\.com/([^/]+)/([^/]+)/.*$"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, repo_url)
            if match:
                owner, repo = match.groups()
                # Remove .git suffix if present
                repo = repo.replace('.git', '')
                return {"owner": owner, "repo": repo, "full_name": f"{owner}/{repo}"}
        
        return None

    def get_repository_info(self, repo_url: str) -> Optional[GitHubRepoInfo]:
        """Get repository information from GitHub API"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return None

            url = f"{self.base_url}/repos/{repo_info['full_name']}"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                return GitHubRepoInfo(
                    name=data["name"],
                    full_name=data["full_name"],
                    description=data.get("description"),
                    html_url=data["html_url"],
                    clone_url=data["clone_url"],
                    ssh_url=data["ssh_url"],
                    default_branch=data["default_branch"],
                    is_private=data["private"],
                    size=data["size"],
                    language=data.get("language"),
                    created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
                    updated_at=datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00")),
                    pushed_at=datetime.fromisoformat(data["pushed_at"].replace("Z", "+00:00"))
                )
            
            return None
        except Exception as e:
            print(f"Error fetching repository info: {e}")
            return None

    def get_repository_files(self, repo_url: str, path: str = "", branch: str = "main") -> List[GitHubFile]:
        """Get files and directories from repository"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return []

            url = f"{self.base_url}/repos/{repo_info['full_name']}/contents/{path}"
            params = {"ref": branch}
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                files = []
                
                # Handle single file response
                if isinstance(data, dict):
                    data = [data]
                
                for item in data:
                    files.append(GitHubFile(
                        name=item["name"],
                        path=item["path"],
                        sha=item["sha"],
                        size=item["size"],
                        url=item["url"],
                        html_url=item["html_url"],
                        download_url=item.get("download_url"),
                        type=item["type"],
                        encoding=item.get("encoding"),
                        content=item.get("content")
                    ))
                
                return files
            
            return []
        except Exception as e:
            print(f"Error fetching repository files: {e}")
            return []

    def get_file_content(self, repo_url: str, file_path: str, branch: str = "main") -> Optional[str]:
        """Get content of a specific file"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return None

            url = f"{self.base_url}/repos/{repo_info['full_name']}/contents/{file_path}"
            params = {"ref": branch}
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("encoding") == "base64":
                    content = base64.b64decode(data["content"]).decode("utf-8")
                    return content
            
            return None
        except Exception as e:
            print(f"Error fetching file content: {e}")
            return None

    def get_commits(self, repo_url: str, branch: str = "main", per_page: int = 30, page: int = 1) -> List[GitHubCommit]:
        """Get commit history from repository"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return []

            url = f"{self.base_url}/repos/{repo_info['full_name']}/commits"
            params = {
                "sha": branch,
                "per_page": per_page,
                "page": page
            }
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                commits_data = response.json()
                commits = []
                
                for commit_data in commits_data:
                    commit = commit_data["commit"]
                    
                    # Get detailed commit info for file changes
                    commit_detail = self.get_commit_details(repo_url, commit_data["sha"])
                    
                    commits.append(GitHubCommit(
                        sha=commit_data["sha"],
                        message=commit["message"],
                        author_name=commit["author"]["name"],
                        author_email=commit["author"]["email"],
                        author_date=datetime.fromisoformat(commit["author"]["date"].replace("Z", "+00:00")),
                        committer_name=commit["committer"]["name"],
                        committer_email=commit["committer"]["email"],
                        committer_date=datetime.fromisoformat(commit["committer"]["date"].replace("Z", "+00:00")),
                        url=commit_data["html_url"],
                        added_files=commit_detail.get("added_files", []),
                        modified_files=commit_detail.get("modified_files", []),
                        removed_files=commit_detail.get("removed_files", [])
                    ))
                
                return commits
            
            return []
        except Exception as e:
            print(f"Error fetching commits: {e}")
            return []

    def get_commit_details(self, repo_url: str, commit_sha: str) -> Dict[str, List[str]]:
        """Get detailed commit information including file changes"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return {"added_files": [], "modified_files": [], "removed_files": []}

            url = f"{self.base_url}/repos/{repo_info['full_name']}/commits/{commit_sha}"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                files = data.get("files", [])
                
                added_files = []
                modified_files = []
                removed_files = []
                
                for file in files:
                    filename = file["filename"]
                    status = file["status"]
                    
                    if status == "added":
                        added_files.append(filename)
                    elif status == "modified":
                        modified_files.append(filename)
                    elif status == "removed":
                        removed_files.append(filename)
                
                return {
                    "added_files": added_files,
                    "modified_files": modified_files,
                    "removed_files": removed_files
                }
            
            return {"added_files": [], "modified_files": [], "removed_files": []}
        except Exception as e:
            print(f"Error fetching commit details: {e}")
            return {"added_files": [], "modified_files": [], "removed_files": []}

    def get_pull_requests(self, repo_url: str, state: str = "all", per_page: int = 30) -> List[GitHubActivity]:
        """Get pull requests from repository"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return []

            url = f"{self.base_url}/repos/{repo_info['full_name']}/pulls"
            params = {"state": state, "per_page": per_page}
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                prs_data = response.json()
                activities = []
                
                for pr in prs_data:
                    activities.append(GitHubActivity(
                        type="pull_request",
                        action=pr["state"],
                        title=pr["title"],
                        description=pr.get("body"),
                        author=pr["user"]["login"],
                        created_at=datetime.fromisoformat(pr["created_at"].replace("Z", "+00:00")),
                        url=pr["html_url"],
                        metadata={
                            "number": pr["number"],
                            "merged": pr.get("merged", False),
                            "head_branch": pr["head"]["ref"],
                            "base_branch": pr["base"]["ref"]
                        }
                    ))
                
                return activities
            
            return []
        except Exception as e:
            print(f"Error fetching pull requests: {e}")
            return []

    def get_issues(self, repo_url: str, state: str = "all", per_page: int = 30) -> List[GitHubActivity]:
        """Get issues from repository"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return []

            url = f"{self.base_url}/repos/{repo_info['full_name']}/issues"
            params = {"state": state, "per_page": per_page}
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                issues_data = response.json()
                activities = []
                
                for issue in issues_data:
                    # Skip pull requests (they appear in issues API too)
                    if "pull_request" in issue:
                        continue
                    
                    activities.append(GitHubActivity(
                        type="issue",
                        action=issue["state"],
                        title=issue["title"],
                        description=issue.get("body"),
                        author=issue["user"]["login"],
                        created_at=datetime.fromisoformat(issue["created_at"].replace("Z", "+00:00")),
                        url=issue["html_url"],
                        metadata={
                            "number": issue["number"],
                            "labels": [label["name"] for label in issue.get("labels", [])],
                            "assignees": [assignee["login"] for assignee in issue.get("assignees", [])]
                        }
                    ))
                
                return activities
            
            return []
        except Exception as e:
            print(f"Error fetching issues: {e}")
            return []

    def get_releases(self, repo_url: str, per_page: int = 10) -> List[GitHubActivity]:
        """Get releases from repository"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return []

            url = f"{self.base_url}/repos/{repo_info['full_name']}/releases"
            params = {"per_page": per_page}
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                releases_data = response.json()
                activities = []
                
                for release in releases_data:
                    activities.append(GitHubActivity(
                        type="release",
                        action="published",
                        title=release["name"] or release["tag_name"],
                        description=release.get("body"),
                        author=release["author"]["login"],
                        created_at=datetime.fromisoformat(release["created_at"].replace("Z", "+00:00")),
                        url=release["html_url"],
                        metadata={
                            "tag_name": release["tag_name"],
                            "draft": release["draft"],
                            "prerelease": release["prerelease"],
                            "assets_count": len(release.get("assets", []))
                        }
                    ))
                
                return activities
            
            return []
        except Exception as e:
            print(f"Error fetching releases: {e}")
            return []

    def validate_access(self, repo_url: str) -> bool:
        """Validate that the service can access the repository"""
        try:
            repo_info = self.get_repository_info(repo_url)
            return repo_info is not None
        except:
            return False

    def create_file(self, repo_url: str, file_path: str, content: str, message: str, branch: str = "main") -> bool:
        """Create a new file in the repository"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return False

            url = f"{self.base_url}/repos/{repo_info['full_name']}/contents/{file_path}"
            
            encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')
            
            data = {
                "message": message,
                "content": encoded_content,
                "branch": branch
            }
            
            response = requests.put(url, headers=self.headers, json=data)
            return response.status_code == 201
        except Exception as e:
            print(f"Error creating file: {e}")
            return False

    def update_file(self, repo_url: str, file_path: str, content: str, message: str, 
                   file_sha: str, branch: str = "main") -> bool:
        """Update an existing file in the repository"""
        try:
            repo_info = self.parse_repo_url(repo_url)
            if not repo_info:
                return False

            url = f"{self.base_url}/repos/{repo_info['full_name']}/contents/{file_path}"
            
            encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')
            
            data = {
                "message": message,
                "content": encoded_content,
                "sha": file_sha,
                "branch": branch
            }
            
            response = requests.put(url, headers=self.headers, json=data)
            return response.status_code == 200
        except Exception as e:
            print(f"Error updating file: {e}")
            return False
