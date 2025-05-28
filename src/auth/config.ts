import { Amplify } from 'aws-amplify';

// AWS Cognito configuration
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
      },
    },
  },
};

// Configure Amplify
Amplify.configure(awsConfig);

export default awsConfig;
