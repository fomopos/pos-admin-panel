import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { authService } from '../../auth/authService';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await authService.resetPassword({ email });
      setIsSubmitted(true);
      
      // Navigate to verification page after a brief delay
      setTimeout(() => {
        navigate('/auth/verify-email', {
          state: {
            email,
            fromForgotPassword: true,
          }
        });
      }, 2000);
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = t('auth.errors.resetEmailFailed');
      
      if (error.code === 'UserNotFoundException') {
        errorMessage = t('auth.errors.userNotFound');
      } else if (error.code === 'LimitExceededException') {
        errorMessage = t('auth.errors.tooManyRequests');
      } else if (error.code === 'InvalidParameterException') {
        errorMessage = t('auth.validation.emailInvalid');
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/auth/signin');
  };

  if (isSubmitted) {
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

          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                {t('auth.forgotPassword.checkEmail')}
              </h1>
              
              <p className="text-slate-600 mb-6">
                {t('auth.forgotPassword.sentCode', { email })}
              </p>
              
              <p className="text-sm text-slate-500 mb-8">
                {t('auth.forgotPassword.redirecting')}
              </p>
              
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Forgot Password Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {t('auth.forgotPassword.title')}
            </h1>
            <p className="text-slate-500">
              {t('auth.forgotPassword.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t('auth.fields.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleInputChange}
                placeholder={t('auth.placeholders.email')}
                className={cn(
                  "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('auth.forgotPassword.sending')}
                </div>
              ) : (
                t('auth.forgotPassword.button')
              )}
            </Button>

            {/* Back to Sign In */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                {t('auth.forgotPassword.backToSignIn')}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            {t('auth.forgotPassword.rememberPassword')}{' '}
            <button
              onClick={handleBackToSignIn}
              className="text-slate-900 hover:text-slate-700 font-medium transition-colors underline"
            >
              {t('auth.signIn.button')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
