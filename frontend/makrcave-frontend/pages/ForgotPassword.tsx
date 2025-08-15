import { useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';
import auth from '../lib/auth';

export default function ForgotPassword() {
  useEffect(() => {
    auth.login({ action: 'reset_password' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-makrx-blue via-makrx-blue/95 to-makrx-blue/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle variant="default" />
      </div>
      <div className="w-full max-w-md text-center text-white space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-makrx-teal rounded-2xl flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Redirecting to Password Reset...</h1>
        <p className="text-white/80">You will be redirected to the secure MakrX password reset page.</p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-makrx-teal rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
