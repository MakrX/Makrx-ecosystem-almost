// ========================================
// LOGIN PAGE COMPONENT - SSO REDIRECT
// ========================================
// Redirects users to centralized auth.makrx.org SSO

import { useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';

export default function Login() {
  // ========================================
  // SSO REDIRECT
  // ========================================
  useEffect(() => {
    // Store current page for redirect after login
    sessionStorage.setItem('makrx_redirect_url', window.location.origin + '/portal/dashboard');
    
    // Redirect to auth.makrx.org
    const params = new URLSearchParams({
      client_id: 'makrx-cave',
      redirect_uri: window.location.origin + '/auth/callback',
      response_type: 'code',
      scope: 'openid email profile',
      state: Math.random().toString(36).substring(2)
    });
    
    window.location.href = `https://auth.makrx.org/realms/makrx/protocol/openid-connect/auth?${params}`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-makrx-blue via-makrx-blue/95 to-makrx-blue/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle variant="default" />
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-lg rotate-12"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-makrx-teal/30 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 border border-white/10 rounded-lg -rotate-12"></div>
      </div>
      
      <div className="w-full max-w-md relative">
        {/* Loading Card */}
        <div className="backdrop-blur-md border border-white/20 rounded-2xl p-8 bg-white/10 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-makrx-teal rounded-2xl flex items-center justify-center animate-pulse">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Redirecting to <span className="text-makrx-teal">MakrX SSO</span>
            </h1>
            <p className="text-white/80 mb-6">
              Please wait while we redirect you to the secure authentication portal at
            </p>
            <p className="text-makrx-teal font-mono text-sm mb-6">
              auth.makrx.org
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-white/30 border-t-makrx-teal rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                🔐 Secure Single Sign-On • Powered by MakrX
              </p>
            </div>
          </div>
        </div>

        {/* Back to Gateway */}
        <div className="text-center mt-6">
          <a 
            href="https://e986654b5a5843d7b3f8adf13b61022c-556d114307be4dee892ae999b.projects.builder.codes"
            className="text-white/80 hover:text-white text-sm flex items-center justify-center gap-2"
          >
            ← Back to MakrX Gateway
          </a>
        </div>
      </div>
    </div>
  );
}
