import { useAuth } from '../contexts/AuthContext';
import SuperAdminSidebar from './SuperAdminSidebar';
import ManagerSidebar from './ManagerSidebar';
import MakerSidebar from './MakerSidebar';

export default function Sidebar() {
  const { user, isSuperAdmin, isMakrcaveManager, isMaker } = useAuth();
  // Render role-specific sidebar
  if (isSuperAdmin) {
    return <SuperAdminSidebar />;
  }

  if (isMakrcaveManager) {
    return <ManagerSidebar />;
  }

  if (isMaker) {
    return <MakerSidebar />;
  }

  // Fallback to MakerSidebar if role is unclear
  return <MakerSidebar />;
}
