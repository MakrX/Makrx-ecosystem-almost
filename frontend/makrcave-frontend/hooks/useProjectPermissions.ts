import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMakerspace } from '../contexts/MakerspaceContext';
import { hasPermission } from '../config/rolePermissions';

interface Project {
  project_id: string;
  owner_id: string;
  makerspace_id?: string;
  visibility: 'public' | 'private' | 'team-only';
  collaborators?: Array<{
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
  }>;
}

interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAddMembers: boolean;
  canManageBOM: boolean;
  canReserveEquipment: boolean;
  canManageFiles: boolean;
  canViewActivity: boolean;
  canCreateProjects: boolean;
  canViewAllProjects: boolean;
}

export const useProjectPermissions = (project?: Project): ProjectPermissions => {
  const { user } = useAuth();
  const { currentMakerspace } = useMakerspace();

  return useMemo(() => {
    if (!user) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canAddMembers: false,
        canManageBOM: false,
        canReserveEquipment: false,
        canManageFiles: false,
        canViewActivity: false,
        canCreateProjects: false,
        canViewAllProjects: false,
      };
    }

    const userRole = user.role;
    const userId = user.user_id;

    // Determine if user owns the project
    const isOwner = project ? project.owner_id === userId : false;

    // Determine if user is a collaborator
    const isCollaborator = project ? 
      project.collaborators?.some(c => c.user_id === userId) ?? false : false;

    // Determine collaborator role
    const collaboratorRole = project ? 
      project.collaborators?.find(c => c.user_id === userId)?.role : null;

    // Determine if project is in user's assigned makerspace
    const isAssignedMakerspace = project ? 
      (currentMakerspace?.id === project.makerspace_id) : true;

    // Determine if user has access to the project
    const hasProjectAccess = project ? (
      // Public projects are visible to all
      project.visibility === 'public' ||
      // Private projects only to owner and collaborators
      (project.visibility === 'private' && (isOwner || isCollaborator)) ||
      // Team projects to makerspace members
      (project.visibility === 'team-only' && isAssignedMakerspace) ||
      // Admins can see all projects
      ['super_admin', 'admin', 'makerspace_admin'].includes(userRole)
    ) : true;

    // Check base permissions from role configuration
    const canViewProjects = hasPermission(userRole, 'projects', 'view', {
      isOwnResource: isOwner,
      isAssignedMakerspace,
    });

    const canEditProjects = hasPermission(userRole, 'projects', 'edit', {
      isOwnResource: isOwner,
      isAssignedMakerspace,
    });

    const canDeleteProjects = hasPermission(userRole, 'projects', 'delete', {
      isOwnResource: isOwner,
      isAssignedMakerspace,
    });

    const canAddMembers = hasPermission(userRole, 'projects', 'addMembers', {
      isOwnResource: isOwner,
      isAssignedMakerspace,
    });

    // BOM permissions (based on project edit permissions)
    const canManageBOM = hasPermission(userRole, 'bom', 'link', {
      isOwnResource: isOwner,
      isAssignedMakerspace,
    });

    // Equipment reservation permissions
    const canReserveEquipment = hasPermission(userRole, 'equipment', 'reserve', {
      isOwnResource: isOwner,
      isAssignedMakerspace,
    });

    // File management permissions (based on edit permissions)
    const canManageFiles = canEditProjects;

    // Activity viewing (same as project viewing)
    const canViewActivity = canViewProjects;

    // Create projects permission
    const canCreateProjects = hasPermission(userRole, 'projects', 'create');

    // View all projects permission (for admin users)
    const canViewAllProjects = hasPermission(userRole, 'projects', 'view', {
      isOwnResource: false,
      isAssignedMakerspace: false,
    }) && ['super_admin', 'admin', 'makerspace_admin'].includes(userRole);

    // Apply project-specific logic
    const projectPermissions: ProjectPermissions = {
      canView: canViewProjects && hasProjectAccess,
      canEdit: canEditProjects && hasProjectAccess && (
        isOwner || 
        collaboratorRole === 'editor' || 
        collaboratorRole === 'owner' ||
        ['super_admin', 'makerspace_admin'].includes(userRole)
      ),
      canDelete: canDeleteProjects && (
        isOwner || 
        ['super_admin', 'makerspace_admin'].includes(userRole)
      ),
      canAddMembers: canAddMembers && hasProjectAccess && (
        isOwner || 
        collaboratorRole === 'owner' ||
        ['super_admin', 'makerspace_admin'].includes(userRole)
      ),
      canManageBOM: canManageBOM && hasProjectAccess && (
        isOwner || 
        collaboratorRole === 'editor' || 
        collaboratorRole === 'owner' ||
        ['super_admin', 'makerspace_admin'].includes(userRole)
      ),
      canReserveEquipment: canReserveEquipment && hasProjectAccess && (
        isOwner || 
        isCollaborator ||
        ['super_admin', 'makerspace_admin'].includes(userRole)
      ),
      canManageFiles: canManageFiles && hasProjectAccess && (
        isOwner || 
        collaboratorRole === 'editor' || 
        collaboratorRole === 'owner' ||
        ['super_admin', 'makerspace_admin'].includes(userRole)
      ),
      canViewActivity: canViewActivity && hasProjectAccess,
      canCreateProjects,
      canViewAllProjects,
    };

    return projectPermissions;
  }, [user, currentMakerspace, project]);
};

// Helper hook for general project permissions (without specific project)
export const useGeneralProjectPermissions = () => {
  return useProjectPermissions();
};

// Helper function to check if user can access project based on visibility and role
export const canAccessProject = (
  user: any,
  project: Project,
  currentMakerspace: any
): boolean => {
  if (!user) return false;

  const userId = user.user_id;
  const userRole = user.role;
  
  // Check if user is owner or collaborator
  const isOwner = project.owner_id === userId;
  const isCollaborator = project.collaborators?.some(c => c.user_id === userId) ?? false;
  
  // Check makerspace assignment
  const isAssignedMakerspace = currentMakerspace?.id === project.makerspace_id;

  // Apply visibility rules
  switch (project.visibility) {
    case 'public':
      return true;
    case 'private':
      return isOwner || isCollaborator || ['super_admin', 'admin'].includes(userRole);
    case 'team-only':
      return isAssignedMakerspace || isOwner || isCollaborator || ['super_admin', 'admin'].includes(userRole);
    default:
      return false;
  }
};

// Helper function to get user's role in a project
export const getUserProjectRole = (
  user: any,
  project: Project
): 'owner' | 'editor' | 'viewer' | 'none' => {
  if (!user) return 'none';
  
  const userId = user.user_id;
  
  // Check if user is owner
  if (project.owner_id === userId) return 'owner';
  
  // Check collaborator role
  const collaborator = project.collaborators?.find(c => c.user_id === userId);
  if (collaborator) return collaborator.role;
  
  // Check if user has admin access
  if (['super_admin', 'makerspace_admin'].includes(user.role)) {
    return 'editor'; // Admins get editor access to projects in their scope
  }
  
  return 'none';
};

export default useProjectPermissions;
