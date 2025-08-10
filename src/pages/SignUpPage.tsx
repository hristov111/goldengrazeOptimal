import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

// Password strength checker
const getPasswordStrength = (password: string) => {
  let score = 0;
  let feedback = [];
  
  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Lowercase letter');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Uppercase letter');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Number');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Special character');
  
  const strength = score === 0 ? 'none' : score <= 2 ? 'weak' : score <= 3 ? 'medium' : score <= 4 ? 'strong' : 'very-strong';
  
  return { score, strength, feedback };
};

interface SignUpPageProps {
  setCurrentPage: (page: string) => void;
  onSignUp: (fullName: string, email: string, password: string) => Promise<{success: boolean; error?: string; message?: string}>;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ setCurrentPage, onSignUp }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [authError, setAuthError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(''));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update password strength in real-time
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.strength === 'weak') {
      newErrors.password = 'Password is too weak. Please strengthen it.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthError('');
    setSuccessMessage('');
    
    try {
      const result = await onSignUp(formData.fullName, formData.email, formData.password);
      
      if (!result.success && result.error) {
        setAuthError(result.error);
      } else if (result.message) {
        setSuccessMessage(result.message);
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-32 h-32 bg-amber-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-amber-300 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-amber-500 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-md mx-auto px-6 py-12 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm tracking-wider">Back to Home</span>
        </button>

        {/* Sign Up Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-amber-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/balm_images/Golder Graze.png" 
                alt="Golden Graze" 
                className="h-12 w-auto"
              />
            </div>
            <h1 className="font-serif text-3xl text-stone-900 mb-2">Join the Ritual</h1>
            <p className="text-stone-600">Create your account to begin your skincare journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auth Error */}
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label className="block text-stone-700 text-sm tracking-wider mb-2">FULL NAME</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-stone-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-stone-300 focus:ring-amber-200 focus:border-amber-400'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-stone-700 text-sm tracking-wider mb-2">EMAIL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-stone-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-stone-300 focus:ring-amber-200 focus:border-amber-400'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-stone-700 text-sm tracking-wider mb-2">PASSWORD</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-stone-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-stone-300 focus:ring-amber-200 focus:border-amber-400'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-600">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 'weak' ? 'text-red-500' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-500' :
                      passwordStrength.strength === 'strong' ? 'text-blue-500' :
                      passwordStrength.strength === 'very-strong' ? 'text-green-500' :
                      'text-stone-400'
                    }`}>
                      {passwordStrength.strength === 'weak' ? 'Weak' :
                       passwordStrength.strength === 'medium' ? 'Medium' :
                       passwordStrength.strength === 'strong' ? 'Strong' :
                       passwordStrength.strength === 'very-strong' ? 'Very Strong' :
                       'Too Weak'}
                    </span>
                  </div>
                  
                  {/* Strength Bar */}
                  <div className="w-full bg-stone-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 'weak' ? 'bg-red-400 w-1/4' :
                        passwordStrength.strength === 'medium' ? 'bg-yellow-400 w-2/4' :
                        passwordStrength.strength === 'strong' ? 'bg-blue-400 w-3/4' :
                        passwordStrength.strength === 'very-strong' ? 'bg-green-400 w-full' :
                        'bg-stone-300 w-1/12'
                      }`}
                    ></div>
                  </div>
                  
                  {/* Missing Requirements */}
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-stone-500">
                      <span>Missing: </span>
                      {passwordStrength.feedback.join(', ')}
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {passwordStrength.strength === 'very-strong' && (
                    <div className="text-xs text-green-600 flex items-center space-x-1">
                      <span>✓</span>
                      <span>Excellent! Your password is very strong.</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-2 text-xs text-stone-500">
                Password should contain: uppercase, lowercase, number, and special character
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="text-sm text-stone-600 bg-stone-50 p-4 rounded-lg">
              By creating an account, you agree to our{' '}
              <button 
                onClick={() => setCurrentPage('terms-of-service')}
                className="text-amber-600 hover:text-amber-700 underline transition-colors"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button 
                onClick={() => setCurrentPage('privacy-policy')}
                className="text-amber-600 hover:text-amber-700 underline transition-colors"
              >
                Privacy Policy
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-white py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>CREATING ACCOUNT...</span>
                </div>
              ) : (
                <span className="group-hover:scale-105 transition-transform duration-300">CREATE ACCOUNT</span>
              )}
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </div>
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-8 pt-6 border-t border-stone-200">
            <p className="text-stone-600 mb-3">Already have an account?</p>
            <button
              onClick={() => setCurrentPage('signin')}
              className="text-amber-600 hover:text-amber-700 font-medium tracking-wider transition-colors hover:scale-105 transform duration-300"
            >
              SIGN IN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;