import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { authService } from '../../auth/authService';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email || '';
  const fromSignUp = location.state?.fromSignUp || false;
  const fromForgotPassword = location.state?.fromForgotPassword || false;

  useEffect(() => {
    if (!email) {
      navigate('/auth/signin');
      return;
    }

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle pasted content
      const pastedValue = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(pastedValue.length, 6 - index); i++) {
        newOtp[index + i] = pastedValue[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedValue.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Handle single character input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const validateOtp = () => {
    const otpValue = otp.join('');
    if (!otpValue || otpValue.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOtp()) return;
    
    setIsLoading(true);
    
    try {
      const otpValue = otp.join('');
      
      if (fromSignUp) {
        // Confirm sign up
        await authService.confirmSignUp({
          email,
          confirmationCode: otpValue,
        });
        
        // Navigate to success page or sign in
        navigate('/auth/signin', {
          state: {
            message: 'Account verified successfully! Please sign in.',
            email,
          }
        });
      } else if (fromForgotPassword) {
        // For forgot password flow, navigate to reset password with the verification code
        navigate('/auth/reset-password', {
          state: {
            email,
            verificationCode: otpValue,
          }
        });
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.name === 'CodeMismatchException') {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (error.name === 'LimitExceededException') {
        errorMessage = 'Too many attempts. Please wait before trying again.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsResending(true);
    
    try {
      if (fromSignUp) {
        // Resend sign up confirmation code
        await authService.signUp({
          email,
          password: 'temp', // This won't be used for resend
          name: '',
        });
      } else if (fromForgotPassword) {
        // Resend forgot password code
        await authService.resetPassword({ email });
      }
      
      // Reset timer
      setTimer(60);
      setCanResend(false);
      
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      // Start countdown again
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('Resend code error:', error);
      setErrors({ general: 'Failed to resend code. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-slate-500 mb-4">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-slate-900 font-medium">
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={cn(
                      "w-12 h-12 text-center text-lg font-semibold rounded-xl border border-slate-200 bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 transition-all duration-200",
                      errors.otp && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="text-sm text-red-600 text-center">{errors.otp}</p>
              )}
            </div>

            {/* Timer and Resend */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-slate-500">
                  Resend code in {formatTime(timer)}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium underline disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend verification code'}
                </button>
              )}
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading || otp.join('').length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </Button>

            {/* Back to Sign In */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate('/auth/signin')}
                className="text-sm text-slate-600 hover:text-slate-800 underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
