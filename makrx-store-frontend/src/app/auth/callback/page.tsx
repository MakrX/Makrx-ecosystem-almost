"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleAuthCallback, getCurrentUser } from "@/lib/auth";
import { getRoleRedirect } from "@/lib/roleRedirect";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const error = searchParams.get('error');
        if (error) {
          throw new Error(error);
        }

        // Process the auth callback via Keycloak adapter
        const success = await handleAuthCallback();

        if (success) {
          setStatus('success');
          const user = getCurrentUser();
          const defaultUrl = getRoleRedirect(user?.roles);
          const redirectUrl =
            sessionStorage.getItem('makrx_redirect_url') ||
            localStorage.getItem('makrx_pre_login_url') ||
            defaultUrl;

          // Clear stored URLs
          sessionStorage.removeItem('makrx_redirect_url');
          localStorage.removeItem('makrx_pre_login_url');

          // Small delay for better UX
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1500);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to login after error
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Completing Sign In
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we authenticate you...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sign In Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting you to your destination...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sign In Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'An error occurred during authentication'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to home page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
