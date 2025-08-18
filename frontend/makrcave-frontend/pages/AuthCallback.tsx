import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';
import auth from '../lib/auth';
import { getRoleRedirect } from '../lib/roleRedirect';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const process = async () => {
      const ok = await auth.handleAuthCallback();
      if (ok) {
        setStatus('success');
        const user = auth.getCurrentUser();
        const defaultUrl = getRoleRedirect(user?.roles);
        const redirectUrl =
          sessionStorage.getItem('makrx_redirect_url') || defaultUrl;
        sessionStorage.removeItem('makrx_redirect_url');
        setTimeout(() => navigate(redirectUrl), 1500);
      } else {
        setStatus('error');
        setTimeout(() => navigate('/'), 3000);
      }
    };
    process();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-makrx-blue via-makrx-blue/95 to-makrx-blue/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle variant="default" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="backdrop-blur-md border border-white/20 rounded-2xl p-8 bg-white/10 text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-makrx-teal rounded-2xl flex items-center justify-center animate-pulse">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Completing Sign In</h2>
              <p className="text-white/80 mb-4">Please wait while we authenticate you...</p>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-makrx-teal animate-spin" />
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Welcome!</h2>
              <p className="text-white/80">Redirecting you to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sign In Failed</h2>
              <p className="text-white/80 mb-4">Redirecting to home page...</p>
            </>
          )}

          <div className="mt-8 text-center">
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">🔐 Secure Single Sign-On • Powered by MakrX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
