import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser } from 'aws-amplify/auth';
import { authService } from '../../auth/authService';

/**
 * OAuth Callback Handler
 * This component handles the redirect after successful OAuth authentication with Cognito.
 * It verifies the user session and redirects to tenant/store selection.
 */
const OAuthCallback: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Verify the user is authenticated after OAuth redirect
        const user = await getCurrentUser();
        console.log('OAuth authentication successful:', user);

        // Check if authenticated
        const isAuthenticated = await authService.isAuthenticated();
        
        if (isAuthenticated) {
          // Navigate to tenant/store selection, which will then redirect to dashboard
          navigate('/tenant-store-selection', { replace: true });
        } else {
          throw new Error('Authentication verification failed');
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        
        // Handle specific error cases
        let errorMessage = t('auth.errors.oauthCallbackFailed');
        
        if (err.name === 'UserUnAuthenticatedException' || err.message?.includes('not authenticated')) {
          errorMessage = t('auth.errors.authenticationFailed');
        }
        
        setError(errorMessage);
        
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          navigate('/auth/signin', { 
            replace: true,
            state: { 
              message: errorMessage,
              type: 'error'
            }
          });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, t]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8 max-w-md w-full">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg 
                className="h-6 w-6 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
            
            {/* Error Message */}
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {t('auth.errors.authenticationError')}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {error}
            </p>
            <p className="text-xs text-slate-500">
              {t('auth.redirectingToSignIn')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8 max-w-md w-full">
        <div className="text-center">
          {/* Loading Spinner */}
          <div className="mx-auto mb-4">
            <svg 
              className="animate-spin h-12 w-12 text-slate-600 mx-auto" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          
          {/* Loading Message */}
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {t('auth.completingAuthentication')}
          </h3>
          <p className="text-sm text-slate-600">
            {t('auth.pleaseWait')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
