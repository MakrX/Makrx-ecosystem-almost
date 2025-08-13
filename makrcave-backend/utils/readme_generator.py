from typing import Dict, List, Optional
from datetime import datetime
from ..models.project import Project
from ..crud.project import get_project

def generate_project_readme(project: Project) -> str:
    """Generate a comprehensive README.md file for a project"""
    
    readme_content = f"""# {project.name}

{project.description or 'A MakrCave project for collaborative making and innovation.'}

## 📋 Project Overview

- **Project ID**: `{project.project_id}`
- **Status**: {project.status.replace('_', ' ').title()}
- **Visibility**: {project.visibility.replace('_', ' ').title()}
- **Owner**: {project.owner_id}
- **Created**: {project.created_at.strftime('%B %d, %Y')}
- **Last Updated**: {project.updated_at.strftime('%B %d, %Y')}

"""

    # Add timeline information if available
    if project.start_date or project.end_date:
        readme_content += "## 📅 Timeline\n\n"
        if project.start_date:
            readme_content += f"- **Start Date**: {project.start_date.strftime('%B %d, %Y')}\n"
        if project.end_date:
            readme_content += f"- **Target Completion**: {project.end_date.strftime('%B %d, %Y')}\n"
        readme_content += "\n"

    # Add tags if available
    if project.tags:
        readme_content += f"## 🏷️ Tags\n\n"
        tags_markdown = " ".join([f"`{tag}`" for tag in project.tags])
        readme_content += f"{tags_markdown}\n\n"

    # Add team information
    if project.collaborators:
        readme_content += "## 👥 Team\n\n"
        readme_content += "| Member | Role | Joined |\n"
        readme_content += "|--------|------|--------|\n"
        
        for collaborator in project.collaborators:
            join_date = collaborator.accepted_at or collaborator.invited_at
            join_date_str = join_date.strftime('%B %d, %Y') if join_date else 'Pending'
            readme_content += f"| {collaborator.user_id} | {collaborator.role.title()} | {join_date_str} |\n"
        readme_content += "\n"

    # Add milestones if available
    if project.milestones:
        readme_content += "## 🎯 Milestones\n\n"
        
        completed_milestones = [m for m in project.milestones if m.is_completed]
        pending_milestones = [m for m in project.milestones if not m.is_completed]
        
        if completed_milestones:
            readme_content += "### ✅ Completed\n\n"
            for milestone in completed_milestones:
                completion_date = milestone.completion_date.strftime('%B %d, %Y') if milestone.completion_date else 'Unknown'
                readme_content += f"- **{milestone.title}** - Completed on {completion_date}\n"
                if milestone.description:
                    readme_content += f"  - {milestone.description}\n"
            readme_content += "\n"
        
        if pending_milestones:
            readme_content += "### 🔄 In Progress\n\n"
            for milestone in pending_milestones:
                priority_emoji = {
                    'critical': '🔴',
                    'high': '🟠', 
                    'medium': '🟡',
                    'low': '🟢'
                }.get(milestone.priority, '⚪')
                
                target_date = milestone.target_date.strftime('%B %d, %Y') if milestone.target_date else 'No deadline'
                readme_content += f"- {priority_emoji} **{milestone.title}** - Target: {target_date}\n"
                if milestone.description:
                    readme_content += f"  - {milestone.description}\n"
            readme_content += "\n"

    # Add BOM if available
    if project.bom_items:
        readme_content += "## 📦 Bill of Materials (BOM)\n\n"
        readme_content += "| Item | Type | Quantity | Status | Critical |\n"
        readme_content += "|------|------|----------|--------|---------|\n"
        
        for bom_item in project.bom_items:
            critical_marker = "⚠️" if bom_item.is_critical else ""
            status_emoji = {
                'needed': '❌',
                'ordered': '⏳',
                'received': '✅',
                'reserved': '🔒'
            }.get(bom_item.procurement_status, '❓')
            
            readme_content += f"| {bom_item.item_name} | {bom_item.item_type.replace('_', ' ').title()} | {bom_item.quantity} | {status_emoji} {bom_item.procurement_status.title()} | {critical_marker} |\n"
        
        # Add cost summary if available
        total_cost = sum([item.total_cost or 0 for item in project.bom_items])
        if total_cost > 0:
            readme_content += f"\n**Total Estimated Cost**: ${total_cost:.2f}\n\n"
        else:
            readme_content += "\n"

    # Add equipment reservations if available
    if project.equipment_reservations:
        readme_content += "## 🔧 Equipment Reservations\n\n"
        readme_content += "| Equipment | Status | Start Date | End Date |\n"
        readme_content += "|-----------|--------|------------|----------|\n"
        
        for reservation in project.equipment_reservations:
            status_emoji = {
                'requested': '⏳',
                'confirmed': '✅',
                'in_use': '🔄',
                'completed': '✅',
                'cancelled': '❌'
            }.get(reservation.status, '❓')
            
            start_date = datetime.fromisoformat(reservation.requested_start.replace('Z', '+00:00')).strftime('%B %d, %Y')
            end_date = datetime.fromisoformat(reservation.requested_end.replace('Z', '+00:00')).strftime('%B %d, %Y')
            
            readme_content += f"| {reservation.equipment_id} | {status_emoji} {reservation.status.title()} | {start_date} | {end_date} |\n"
        readme_content += "\n"

    # Add GitHub integration info if available
    if project.github_integration_enabled and project.github_repo_url:
        readme_content += "## 🔗 GitHub Integration\n\n"
        readme_content += f"This project is connected to the GitHub repository: [{project.github_repo_name}]({project.github_repo_url})\n\n"
        readme_content += "### Repository Structure\n\n"
        readme_content += "```\n"
        readme_content += f"{project.github_repo_name}/\n"
        readme_content += "├── README.md          # This file\n"
        readme_content += "├── docs/              # Project documentation\n"
        readme_content += "├── src/               # Source code\n"
        readme_content += "├── hardware/          # Hardware designs, CAD files\n"
        readme_content += "├── software/          # Software components\n"
        readme_content += "├── assets/            # Images, videos, resources\n"
        readme_content += "└── LICENSE            # Project license\n"
        readme_content += "```\n\n"

    # Add files overview if available
    if project.files:
        readme_content += "## 📁 Project Files\n\n"
        
        # Group files by type
        file_types = {}
        for file in project.files:
            file_type = file.file_type
            if file_type not in file_types:
                file_types[file_type] = []
            file_types[file_type].append(file)
        
        for file_type, files in file_types.items():
            readme_content += f"### {file_type.replace('_', ' ').title()} Files\n\n"
            for file in files:
                visibility = "🌐" if file.is_public else "🔒"
                readme_content += f"- {visibility} **{file.original_filename}** (v{file.version})\n"
                if file.description:
                    readme_content += f"  - {file.description}\n"
            readme_content += "\n"

    # Add getting started section
    readme_content += """## 🚀 Getting Started

### Prerequisites

- Access to the MakrCave platform
- Required certifications for equipment usage (if applicable)
- Team collaboration permissions

### Contributing

1. Join the project team through the MakrCave platform
2. Review the project goals and current milestones
3. Check out the BOM for required materials
4. Reserve necessary equipment through the platform
5. Collaborate with team members on project tasks

### Communication

- **Project Platform**: [MakrCave Project Dashboard](https://makrcave.com/projects/{project.project_id})
- **Team Chat**: Available through MakrCave messaging
- **File Sharing**: Integrated with project file management

"""

    # Add project guidelines
    readme_content += """## 📋 Project Guidelines

### Safety First
- Follow all makerspace safety protocols
- Use proper personal protective equipment (PPE)
- Report any safety concerns immediately

### Resource Management
- Return borrowed tools and equipment promptly
- Keep shared spaces clean and organized
- Report damaged or missing items

### Collaboration
- Communicate progress regularly with team members
- Document important decisions and changes
- Respect different skill levels and learning goals

"""

    # Add footer
    readme_content += f"""## 📞 Support

For technical support or questions about this project, contact the project owner or visit the [MakrCave Help Center](https://makrcave.com/help).

---

*This README was automatically generated by the MakrCave Project Management System on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}.*

**Project Status**: {project.status.replace('_', ' ').title()} | **Visibility**: {project.visibility.replace('_', ' ').title()}
"""

    return readme_content

def generate_makerspace_readme() -> str:
    """Generate a general README for the MakrCave Project Management System"""
    
    readme_content = """# MakrCave Project Management System

A comprehensive project management platform designed specifically for makerspaces, fabrication labs, and collaborative making environments.

## 🎯 Features

### Project Management
- **Collaborative Projects**: Create and manage projects with team members
- **Role-based Access**: Owner, Editor, and Viewer permissions
- **Timeline Tracking**: Milestones with progress monitoring
- **Multi-tenant Support**: Isolated environments for different makerspaces

### Resource Management
- **Bill of Materials (BOM)**: Track project components and procurement
- **Equipment Reservations**: Calendar-based booking system with certification requirements
- **Inventory Integration**: Link projects to makerspace inventory
- **MakrX Store Integration**: Direct ordering from the MakrX marketplace

### File Management
- **GitHub Integration**: Connect projects to GitHub repositories for version control
- **Document Storage**: Upload and organize project files
- **Public/Private Access**: Control file visibility and sharing
- **Version Tracking**: Maintain file version history

### Activity Tracking
- **Comprehensive Audit Trail**: Track all project changes and updates
- **GitHub Sync**: Automatically import commits, pull requests, and issues
- **Real-time Updates**: Live activity feeds with filtering and search
- **Notification System**: Stay informed about project developments

## 🏗️ Architecture

### Backend
- **FastAPI**: High-performance async API framework
- **SQLAlchemy**: Advanced ORM with relationship management
- **PostgreSQL**: Production-grade database with indexing
- **GitHub API**: Direct integration with GitHub repositories

### Frontend
- **React 18**: Modern component architecture with TypeScript
- **Tailwind CSS**: Utility-first styling with custom design system
- **Radix UI**: Accessible component primitives
- **Real-time Updates**: Optimistic UI patterns for seamless experience

## 🔐 Security & Permissions

### Role-Based Access Control
- **Super Admin**: Full system control across all makerspaces
- **Admin**: User and project management capabilities
- **Makerspace Admin**: Full control within assigned makerspace
- **Maker**: Create and manage own projects with team collaboration
- **Service Provider**: Read-only access to assigned projects

### Project Visibility
- **Public**: Visible to all users across makerspaces
- **Team-Only**: Visible to makerspace members and collaborators
- **Private**: Visible only to owner and invited collaborators

## 🚀 Getting Started

### For Project Managers
1. Create a new project with clear goals and timeline
2. Invite team members with appropriate roles
3. Build your BOM with required materials and tools
4. Reserve necessary equipment through the calendar system
5. Connect your GitHub repository for code and documentation

### For Team Members
1. Accept project invitations through email or platform notifications
2. Review project goals, timeline, and current milestones
3. Check equipment requirements and certification needs
4. Collaborate on tasks and maintain regular communication
5. Track progress through the activity feed and milestone updates

### For Administrators
1. Set up makerspace profiles with equipment and policies
2. Manage user roles and permissions
3. Monitor equipment usage and maintenance schedules
4. Review project activities and resource utilization
5. Configure integrations with inventory and ordering systems

## 📊 Key Metrics

### Project Management
- Multi-tenant architecture supporting unlimited makerspaces
- Role-based permissions for 5+ user types
- Equipment booking with certification requirements
- BOM integration with inventory and procurement systems

### GitHub Integration
- Automatic sync of commits, pull requests, and issues
- File management through repository connections
- Activity tracking for development workflows
- Reduced server load through external file storage

### Performance
- Real-time updates with optimistic UI patterns
- Efficient database queries with proper indexing
- Lazy loading for large datasets
- Mobile-responsive design for cross-platform access

## 🔧 API Reference

### Project Endpoints
- `GET /api/v1/projects/` - List projects with filtering
- `POST /api/v1/projects/` - Create new project
- `GET /api/v1/projects/{id}` - Get project details
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### GitHub Integration
- `POST /api/v1/projects/{id}/github/connect` - Connect repository
- `DELETE /api/v1/projects/{id}/github/disconnect` - Disconnect repository
- `GET /api/v1/projects/{id}/github/files` - Browse repository files
- `GET /api/v1/projects/{id}/github/commits` - View commit history
- `POST /api/v1/projects/{id}/github/sync` - Sync recent activity

### Team Management
- `POST /api/v1/projects/{id}/collaborators` - Add team member
- `PUT /api/v1/projects/{id}/collaborators/{user_id}` - Update role
- `DELETE /api/v1/projects/{id}/collaborators/{user_id}` - Remove member

## 🌟 Benefits

### For Makerspaces
- **Streamlined Operations**: Centralized project and resource management
- **Enhanced Collaboration**: Tools designed for maker communities
- **Resource Optimization**: Efficient equipment and inventory tracking
- **Knowledge Sharing**: Project documentation and best practices

### For Makers
- **Professional Project Management**: Industry-standard tools for maker projects
- **Team Collaboration**: Easy coordination with project teammates
- **Resource Access**: Direct integration with makerspace equipment and supplies
- **Portfolio Building**: Documented project history for career development

### For Administrators
- **Comprehensive Oversight**: Complete visibility into makerspace activities
- **Efficient Resource Management**: Optimized equipment utilization
- **Data-Driven Decisions**: Analytics for space planning and improvements
- **Scalable Architecture**: Support for growing maker communities

## 📈 Future Enhancements

### Planned Features
- **AI-Powered Recommendations**: Smart project suggestions and resource optimization
- **Mobile Applications**: Native iOS and Android apps for on-the-go access
- **Advanced Analytics**: Comprehensive reporting and business intelligence
- **IoT Integration**: Real-time equipment monitoring and usage tracking

### Integration Roadmap
- **CAD Software Integration**: Direct import from Fusion 360, SolidWorks, etc.
- **Learning Management**: Certification tracking and skill development
- **Procurement Automation**: Automated ordering based on project requirements
- **Community Marketplace**: Project sharing and collaboration network

## 📞 Support

### Technical Support
- **Documentation**: Comprehensive guides and API reference
- **Community Forum**: Peer support and best practices sharing
- **Direct Support**: Technical assistance for implementation issues
- **Training Programs**: Onboarding and advanced user training

### Contact Information
- **Platform Support**: support@makrcave.com
- **Sales Inquiries**: sales@makrcave.com
- **Partnership Opportunities**: partnerships@makrcave.com
- **Community**: [MakrCave Community Forum](https://community.makrcave.com)

---

*Built with ❤️ for the maker community by the MakrCave team.*

**Version**: 1.0.0 | **License**: MIT | **Platform**: [makrcave.com](https://makrcave.com)
"""

    return readme_content

def create_github_readme(db, project_id: str, user_id: str) -> bool:
    """Create and commit a README.md file to the connected GitHub repository"""
    from .github_service import GitHubService
    from ..crud.project import get_project
    
    project = get_project(db, project_id, user_id)
    if not project or not project.github_integration_enabled:
        return False
    
    github_service = GitHubService(project.github_access_token)
    readme_content = generate_project_readme(project)
    
    # Check if README.md already exists
    existing_readme = github_service.get_file_content(
        project.github_repo_url, 
        "README.md", 
        project.github_default_branch
    )
    
    if existing_readme:
        # Update existing README
        files = github_service.get_repository_files(project.github_repo_url, "", project.github_default_branch)
        readme_file = next((f for f in files if f.name == "README.md"), None)
        
        if readme_file:
            success = github_service.update_file(
                project.github_repo_url,
                "README.md",
                readme_content,
                f"Update project README - Generated by MakrCave",
                readme_file.sha,
                project.github_default_branch
            )
        else:
            success = False
    else:
        # Create new README
        success = github_service.create_file(
            project.github_repo_url,
            "README.md",
            readme_content,
            f"Add project README - Generated by MakrCave",
            project.github_default_branch
        )
    
    return success
