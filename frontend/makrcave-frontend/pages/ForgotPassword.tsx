import { useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';
import authService from '../services/authService';

export default function ForgotPassword() {
  useEffect(() => {
    authService.login({ action: 'reset-password' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex justify-center"><Building2 className="w-8 h-8" /></div>
        <p>Redirecting to password reset...</p>
        <div className="fixed top-6 right-6"><ThemeToggle variant="default" /></div>
      </div>
    </div>
  );
}
