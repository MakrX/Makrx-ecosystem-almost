import { Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RoleBasedSidebar from './RoleBasedSidebar';
import Header from './Header';

export default function Layout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileSidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.querySelector('.makrcave-sidebar');
        const target = event.target as Node;

        if (sidebar && !sidebar.contains(target)) {
          setIsMobileSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileSidebarOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-makrx-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading MakrCave...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div className="makrcave-sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Sidebar with mobile support */}
      <div className={`makrcave-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <RoleBasedSidebar onMobileClose={() => setIsMobileSidebarOpen(false)} />
      </div>

      <div className="makrcave-main">
        <Header onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="p-3 sm:p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
