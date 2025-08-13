import "./global.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MakerspaceProvider } from "./contexts/MakerspaceContext";
import { FeatureFlagProvider } from "./contexts/FeatureFlagContext";
import { ThemeProvider } from "../../packages/ui/contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { MemberProvider } from "./contexts/MemberContext";
import { BillingProvider } from "./contexts/BillingContext";
import { SkillProvider } from "./contexts/SkillContext";
import { HealthProvider } from "./contexts/HealthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Equipment from "./pages/Equipment";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Reservations from "./pages/Reservations";
import Members from "./pages/Members";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import SkillManagement from "./pages/SkillManagement";
import NotificationsCenter from "./pages/NotificationsCenter";
import MembershipPlans from "./pages/MembershipPlans";
import Announcements from "./pages/Announcements";
import EnhancedInventory from "./pages/EnhancedInventory";
import AdminUsers from "./pages/admin/Users";
import AdminMakerspace from "./pages/admin/Makerspace";
import AdminMakerspaces from "./pages/admin/Makerspaces";
import AdminFeatureFlags from "./pages/admin/FeatureFlags";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import SystemHealth from "./pages/SystemHealth";
import ErrorLogs from "./pages/ErrorLogs";
import LandingPage from "./pages/LandingPage";
import FindMakerspace from "./pages/FindMakerspace";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MakrVerse from "./pages/MakrVerse";
import ProjectShowcase from "./pages/ProjectShowcase";
import CapacityPlanning from "./pages/CapacityPlanning";
import LearningCenter from "./pages/LearningCenter";
import AdvancedMaintenance from "./pages/AdvancedMaintenance";
import SmartInventory from "./pages/SmartInventory";
import Community from "./pages/Community";
import Integrations from "./pages/Integrations";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { createRoot } from "react-dom/client";

const App = () => (
  <ErrorBoundary
    componentName="App Root"
    showDetails={true}
    maxRetries={1}
  >
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <FeatureFlagProvider>
            <MakerspaceProvider>
              <MemberProvider>
                <BillingProvider>
                  <SkillProvider>
                    <HealthProvider
                      autoRefresh={true}
                      refreshInterval={60000}
                      enableNotifications={true}
                    >
                      <BrowserRouter>
                  <Routes>
                    {/* Public Landing Page */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Public Pages */}
                    <Route path="/find-makerspace" element={<FindMakerspace />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Public MakrVerse Map */}
                    <Route path="/makrverse" element={<MakrVerse />} />

                    {/* Authentication Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Protected Portal Routes */}
                    <Route path="/portal" element={<Layout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="enhanced-inventory" element={<EnhancedInventory />} />
                      <Route path="equipment" element={<Equipment />} />
                      <Route path="projects" element={<Projects />} />
                      <Route path="projects/:projectId" element={<ProjectDetail />} />
                      <Route path="showcase" element={<ProjectShowcase />} />
                      <Route path="capacity-planning" element={<CapacityPlanning />} />
                      <Route path="learning" element={<LearningCenter />} />
                      <Route path="advanced-maintenance" element={<AdvancedMaintenance />} />
                      <Route path="smart-inventory" element={<SmartInventory />} />
                      <Route path="community" element={<Community />} />
                      <Route path="integrations" element={<Integrations />} />
                      <Route path="reservations" element={<Reservations />} />
                      <Route path="members" element={<Members />} />
                      <Route path="billing" element={<Billing />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="maintenance" element={<Maintenance />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="skills" element={<SkillManagement />} />
                      <Route path="notifications" element={<NotificationsCenter />} />
                      <Route path="membership-plans" element={<MembershipPlans />} />
                      <Route path="announcements" element={<Announcements />} />
                      <Route path="system-health" element={
                        <ProtectedRoute
                          adminFeature="healthMonitoring"
                          allowedRoles={['super_admin', 'admin']}
                        >
                          <SystemHealth />
                        </ProtectedRoute>
                      } />
                      <Route path="makerspaces" element={<AdminMakerspaces />} />
                      <Route path="admin">
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="makerspace" element={<AdminMakerspace />} />
                        <Route path="feature-flags" element={<AdminFeatureFlags />} />
                        <Route path="error-logs" element={<ErrorLogs />} />
                      </Route>
                    </Route>

                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                      </BrowserRouter>
                    </HealthProvider>
                  </SkillProvider>
                </BillingProvider>
              </MemberProvider>
            </MakerspaceProvider>
          </FeatureFlagProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
