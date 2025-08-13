import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!code || !state) {
          throw new Error('Missing authentication parameters');
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://auth.makrx.org/realms/makrx/protocol/openid-connect/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: 'makrx-cave',
            code: code,
            redirect_uri: window.location.origin + '/auth/callback',
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed');
        }

        const tokens = await tokenResponse.json();
        
        // Store tokens
        localStorage.setItem('makrx_access_token', tokens.access_token);
        localStorage.setItem('makrx_refresh_token', tokens.refresh_token);
        localStorage.setItem('makrx_token_expires', (Date.now() + tokens.expires_in * 1000).toString());

        // Decode user info from token
        try {
          const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
          const userInfo = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            preferred_username: payload.preferred_username,
            email_verified: payload.email_verified || false,
            roles: payload.realm_access?.roles || [],
            scopes: (payload.scope || '').split(' ')
          };
          
          localStorage.setItem('makrx_user_info', JSON.stringify(userInfo));
        } catch (decodeError) {
          console.warn('Failed to decode user info:', decodeError);
        }

        setStatus('success');
        
        // Get stored redirect URL or default to dashboard
        const redirectUrl = sessionStorage.getItem('makrx_redirect_url') || '/portal/dashboard';
        sessionStorage.removeItem('makrx_redirect_url');
        
        // Small delay for better UX
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1500);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to landing page after error
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    processCallback();
  }, [location, navigate]);

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
        <div className="backdrop-blur-md border border-white/20 rounded-2xl p-8 bg-white/10 text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-makrx-teal rounded-2xl flex items-center justify-center animate-pulse">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Completing Sign In
              </h2>
              <p className="text-white/80 mb-4">
                Please wait while we authenticate you with MakrCave...
              </p>
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
              <h2 className="text-xl font-bold text-white mb-2">
                Welcome to <span className="text-makrx-teal">MakrCave</span>!
              </h2>
              <p className="text-white/80">
                Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Sign In Failed
              </h2>
              <p className="text-white/80 mb-4">
                {error || 'An error occurred during authentication'}
              </p>
              <p className="text-sm text-white/60">
                Redirecting to home page...
              </p>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                🔐 Secure Single Sign-On • Powered by MakrX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
