from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# BOM Item for showcase
class ShowcaseBOMItem(BaseModel):
    name: str
    quantity: int
    estimated_cost: float
    supplier: Optional[str] = None

# Award/Achievement for projects
class ProjectAward(BaseModel):
    type: str
    name: str
    icon: str
    awarded_at: str

# Main showcase project schema
class ShowcaseProjectResponse(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None
    owner_id: str
    owner_name: str
    owner_avatar: Optional[str] = None
    makerspace_name: Optional[str] = None
    makerspace_id: Optional[str] = None
    visibility: str
    status: str
    difficulty_level: str
    estimated_time: str
    category: str
    subcategories: List[str] = []
    tags: List[str] = []
    skills_required: List[str] = []
    equipment_used: List[str] = []
    
    # Showcase metrics
    view_count: int
    like_count: int
    fork_count: int
    comment_count: int
    download_count: int
    completion_rate: int  # Percentage
    
    # Media and assets
    thumbnail_url: Optional[str] = None
    gallery_images: List[str] = []
    demo_video_url: Optional[str] = None
    
    # Project details
    bill_of_materials: List[ShowcaseBOMItem] = []
    total_estimated_cost: float
    
    # Social features
    is_featured: bool
    is_staff_pick: bool
    is_trending: bool
    awards: List[ProjectAward] = []
    
    # Timestamps
    created_at: str
    updated_at: str
    featured_at: Optional[str] = None
    
    # Interaction flags for current user
    is_liked: bool
    is_bookmarked: bool
    is_following_owner: bool
    
    class Config:
        from_attributes = True

# Featured maker for spotlight
class FeaturedMaker(BaseModel):
    user_id: str
    name: str
    avatar: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    makerspace_name: Optional[str] = None
    
    # Stats
    project_count: int
    total_likes: int
    total_views: int
    total_forks: int
    follower_count: int
    
    # Featured project
    featured_project: Dict[str, Any]
    
    # Skills and badges
    top_skills: List[str] = []
    achievements: List[Dict[str, Any]] = []
    
    # Social
    is_verified: bool
    is_staff_pick: bool
    member_since: str

class FeaturedMakerResponse(BaseModel):
    featured_maker: FeaturedMaker
    
    class Config:
        from_attributes = True

# Project statistics
class ProjectStatsResponse(BaseModel):
    total_projects: int
    featured_projects: int
    trending_projects: int
    total_makers: int
    total_likes: int
    total_views: int

# Filter options
class ShowcaseFiltersResponse(BaseModel):
    categories: List[str]
    tags: List[str]
    skills: List[str]
    difficulty_levels: List[str]

# Project search and discovery
class ProjectSearchRequest(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    sort_by: str = "trending"
    limit: int = 20
    offset: int = 0

class ProjectSearchResponse(BaseModel):
    projects: List[ShowcaseProjectResponse]
    total_count: int
    has_more: bool
    filters_applied: Dict[str, Any]

# Trending project (simplified)
class TrendingProjectResponse(BaseModel):
    project_id: str
    name: str
    owner_name: str
    owner_avatar: Optional[str] = None
    category: str
    view_count: int
    like_count: int
    fork_count: int
    difficulty_level: str
    thumbnail_url: Optional[str] = None
    created_at: str
    is_featured: Optional[bool] = False
    
    class Config:
        from_attributes = True

# Project interaction responses
class ProjectLikeResponse(BaseModel):
    status: str
    like_count: int

class ProjectBookmarkResponse(BaseModel):
    status: str

class ProjectFollowResponse(BaseModel):
    status: str
    follower_count: int

# Category statistics
class CategoryStatsResponse(BaseModel):
    category: str
    project_count: int
    avg_difficulty: str
    most_used_skills: List[str]
    trending_projects: int

# Maker leaderboard
class MakerLeaderboardEntry(BaseModel):
    user_id: str
    name: str
    avatar: Optional[str] = None
    total_projects: int
    total_likes: int
    total_views: int
    rank: int
    featured_projects: int

class MakerLeaderboardResponse(BaseModel):
    makers: List[MakerLeaderboardEntry]
    time_period: str  # "week", "month", "all_time"

# Project analytics for creators
class ProjectAnalyticsResponse(BaseModel):
    project_id: str
    views_over_time: List[Dict[str, Any]]
    likes_over_time: List[Dict[str, Any]]
    demographics: Dict[str, Any]
    referral_sources: Dict[str, Any]
    engagement_metrics: Dict[str, Any]

# Community features
class ProjectCommentCreate(BaseModel):
    comment: str
    parent_id: Optional[str] = None

class ProjectCommentResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    comment: str
    parent_id: Optional[str] = None
    created_at: str
    likes: int
    replies_count: int
    
    class Config:
        from_attributes = True

# Project collections/playlists
class ProjectCollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = True
    project_ids: List[str] = []

class ProjectCollectionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    owner_id: str
    owner_name: str
    is_public: bool
    project_count: int
    created_at: str
    updated_at: str
    thumbnail_projects: List[TrendingProjectResponse] = []
    
    class Config:
        from_attributes = True

# Showcase dashboard for admins
class ShowcaseDashboardResponse(BaseModel):
    total_projects: int
    pending_approval: int
    featured_projects: int
    trending_projects: int
    most_active_categories: List[CategoryStatsResponse]
    top_makers: List[MakerLeaderboardEntry]
    recent_activity: List[Dict[str, Any]]
