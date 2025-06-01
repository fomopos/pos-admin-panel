import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { authService } from '../../auth/authService';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = location.state?.email || '';
  const verificationCode = location.state?.verificationCode || '';

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd: string) => /\d/.test(pwd) },
    { label: 'One special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  React.useEffect(() => {
    if (!email || !verificationCode) {
      navigate('/auth/forgot-password');
    }
  }, [email, verificationCode, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Check password requirements
    const failedRequirements = passwordRequirements.filter(req => !req.test(formData.newPassword));
    if (failedRequirements.length > 0) {
      newErrors.newPassword = 'Password does not meet all requirements';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await authService.confirmResetPassword({
        email,
        confirmationCode: verificationCode,
        newPassword: formData.newPassword
      });
      
      // Show success message and redirect to sign in
      navigate('/auth/signin', {
        state: {
          message: 'Password reset successful! Please sign in with your new password.',
          type: 'success'
        }
      });
      
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.code === 'CodeMismatchException') {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (error.code === 'ExpiredCodeException') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (error.code === 'InvalidPasswordException') {
        errorMessage = 'Password does not meet security requirements.';
      } else if (error.code === 'LimitExceededException') {
        errorMessage = 'Too many attempts. Please wait before trying again.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const passedRequirements = passwordRequirements.filter(req => req.test(formData.newPassword));
    return passedRequirements.length;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Reset Password
            </h1>
            <p className="text-slate-500">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    errors.newPassword && "border-red-500 focus-visible:ring-red-500"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword}</p>
              )}
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Password strength</span>
                    <span className={cn(
                      "text-xs font-medium",
                      getPasswordStrength() <= 2 && "text-red-600",
                      getPasswordStrength() === 3 && "text-yellow-600",
                      getPasswordStrength() === 4 && "text-blue-600",
                      getPasswordStrength() === 5 && "text-green-600"
                    )}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        getPasswordStrengthColor()
                      )}
                      style={{ width: `${(getPasswordStrength() / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Password must contain:</p>
                <div className="grid grid-cols-1 gap-1">
                  {passwordRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={cn(
                        "flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center",
                        requirement.test(formData.newPassword)
                          ? "bg-green-100 text-green-600"
                          : "bg-slate-100 text-slate-400"
                      )}>
                        {requirement.test(formData.newPassword) && (
                          <CheckIcon className="w-3 h-3" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs",
                        requirement.test(formData.newPassword)
                          ? "text-green-600 font-medium"
                          : "text-slate-500"
                      )}>
                        {requirement.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    errors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Reset Password Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Resetting password...
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>

            {/* Back to Sign In */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/auth/signin')}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                ← Back to sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
