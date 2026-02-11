import { Amplify } from 'aws-amplify';

// AWS Cognito configuration
const oauthDomain = import.meta.env.VITE_OAUTH_DOMAIN;

// Only include OAuth config if domain is provided
const oauthConfig = oauthDomain ? {
  domain: oauthDomain,
  scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
  redirectSignIn: import.meta.env.VITE_OAUTH_REDIRECT_SIGNIN 
    ? import.meta.env.VITE_OAUTH_REDIRECT_SIGNIN.split(',')
    : [`${window.location.origin}/auth/callback`],
  redirectSignOut: import.meta.env.VITE_OAUTH_REDIRECT_SIGNOUT 
    ? import.meta.env.VITE_OAUTH_REDIRECT_SIGNOUT.split(',')
    : [`${window.location.origin}/auth/signin`],
  responseType: 'code' as const,
} : undefined;

export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || 'ap-south-1_5bSE1jOeH',
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID || '6nhft7fceiqmk1tadrfge8vco5',
      region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
        username: false,
        ...(oauthConfig && { oauth: oauthConfig }),
      },
    },
  },
};

// Configure Amplify
Amplify.configure(awsConfig);

export default awsConfig;
