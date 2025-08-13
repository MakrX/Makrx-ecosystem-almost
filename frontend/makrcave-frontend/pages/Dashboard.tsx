import RoleDashboard from '../components/RoleDashboard';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';

export default function Dashboard() {
  return (
    <div>
      <RoleDashboard />
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle variant="icon-only" />
      </div>
    </div>
  );
}
