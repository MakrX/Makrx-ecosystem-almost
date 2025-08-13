import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';
import authService, { RegisterData } from '../services/authService';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    return strength;
  };

  const validateForm = (): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      return 'Username must be between 3 and 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }

    if (passwordStrength < 3) {
      return 'Password is too weak. Please use a stronger password';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (error) setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const registerData: RegisterData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined
      };

      await authService.register(registerData);
      navigate('/portal/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0: case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: case 5: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0: case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Good';
      case 4: case 5: return 'Strong';
      default: return '';
    }
  };

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
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-makrx-teal rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Join <span className="text-makrx-teal">MakrCave</span>
            </h1>
            <p className="text-white/80">Create your makerspace account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-white text-sm font-medium mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-white text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-white text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          level <= passwordStrength
                            ? getPasswordStrengthColor(passwordStrength)
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/60">
                    Password strength: <span className={passwordStrength >= 3 ? 'text-green-300' : 'text-yellow-300'}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span className="text-xs text-green-300">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-300" />
                      <span className="text-xs text-red-300">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <div className="text-xs text-white/60 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              You will be assigned the <span className="text-makrx-teal font-medium">Maker</span> role initially.
            </div>

            <button
              type="submit"
              disabled={isLoading || passwordStrength < 3 || formData.password !== formData.confirmPassword}
              className="w-full bg-makrx-teal text-white font-semibold py-3 rounded-lg hover:bg-makrx-teal-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-makrx-teal hover:text-makrx-teal-light font-medium">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                🔐 Secure Registration • Powered by MakrCave
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
