import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';
import authService from '../services/authService';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'complete'>(
    resetToken ? 'reset' : 'request'
  );

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.requestPasswordReset({ email });
      setSuccess(result.message || 'Password reset email sent! Check your inbox.');
      setStep('complete');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.resetPassword(resetToken!, newPassword);
      setSuccess(result.message || 'Password reset successfully!');
      setStep('complete');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequestForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-makrx-teal rounded-2xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Reset Password
        </h1>
        <p className="text-white/80">Enter your email to receive reset instructions</p>
      </div>

      <form onSubmit={handleResetRequest} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-300" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-makrx-teal text-white font-semibold py-3 rounded-lg hover:bg-makrx-teal-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending Email...
            </>
          ) : (
            'Send Reset Email'
          )}
        </button>
      </form>
    </>
  );

  const renderResetForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-makrx-teal rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Create New Password
        </h1>
        <p className="text-white/80">Enter your new password below</p>
      </div>

      <form onSubmit={handlePasswordReset} className="space-y-6">
        <div>
          <label htmlFor="newPassword" className="block text-white text-sm font-medium mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-300" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-makrx-teal text-white font-semibold py-3 rounded-lg hover:bg-makrx-teal-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </>
  );

  const renderSuccessState = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {step === 'complete' && resetToken ? 'Password Reset Complete' : 'Check Your Email'}
        </h1>
        <p className="text-white/80">
          {step === 'complete' && resetToken 
            ? 'Your password has been successfully reset'
            : 'We\'ve sent password reset instructions to your email'
          }
        </p>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-300" />
          <p className="text-sm text-green-300">{success}</p>
        </div>
      </div>

      <div className="space-y-4">
        {step === 'complete' && resetToken ? (
          <Link
            to="/login"
            className="w-full bg-makrx-teal text-white font-semibold py-3 rounded-lg hover:bg-makrx-teal-light transition-colors flex items-center justify-center gap-2"
          >
            Continue to Login
          </Link>
        ) : (
          <div className="text-center text-white/60 text-sm">
            <p>Didn't receive the email? Check your spam folder or try again.</p>
            <button
              onClick={() => {
                setStep('request');
                setSuccess('');
                setError('');
              }}
              className="text-makrx-teal hover:text-makrx-teal-light font-medium mt-2"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-makrx-blue via-makrx-blue/95 to-makrx-blue/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle variant="default" />
      </div>
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-lg rotate-12"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-makrx-teal/30 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 border border-white/10 rounded-lg -rotate-12"></div>
      </div>
      
      <div className="w-full max-w-md relative">
        <div className="backdrop-blur-md border border-white/20 rounded-2xl p-8 bg-white/10">
          {step === 'request' && renderRequestForm()}
          {step === 'reset' && renderResetForm()}
          {step === 'complete' && renderSuccessState()}

          {step !== 'complete' && (
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-white/60 hover:text-white text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          )}

          <div className="mt-8 text-center">
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                🔐 Secure Password Reset • Powered by MakrCave
              </p>
            </div>
          </div>
        </div>

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
