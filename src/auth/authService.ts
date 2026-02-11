import { 
  signIn, 
  signUp, 
  confirmSignUp, 
  signOut as amplifySignOut, 
  getCurrentUser, 
  resetPassword, 
  confirmResetPassword,
  fetchAuthSession
} from 'aws-amplify/auth';
import { useTenantStore } from '../tenants/tenantStore';

export interface User {
  userId: string;
  email: string;
  name?: string;
  tenants: string[];
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  name?: string;
}

export interface ConfirmSignUpParams {
  email: string;
  confirmationCode: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface ConfirmResetPasswordParams {
  email: string;
  confirmationCode: string;
  newPassword: string;
}

class AuthService {
  async signIn({ email, password }: SignInParams) {
    try {
      const result = await signIn({
        username: email,
        password,
      });
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp({ email, password, name }: SignUpParams) {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: name || '',
          },
        },
      });
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async confirmSignUp({ email, confirmationCode }: ConfirmSignUpParams) {
    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode,
      });
      return result;
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      console.log('🚪 Signing out user and clearing all cached data');
      
      // Clear all tenant store data before signing out
      const { clearAllData } = useTenantStore.getState();
      clearAllData();
      
      // Sign out locally without redirecting to hosted UI
      // Using global: false ensures no redirect to Cognito Hosted UI
      await amplifySignOut({ global: false });
      console.log('✅ User signed out and data cleared successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      // Extract user ID from the basic user object
      const userId = user.userId;
      
      // Get detailed user info from the idToken payload
      const idToken = session.tokens?.idToken;
      const payload = idToken?.payload;
      
      // Extract email and name from idToken claims
      const email = (payload?.email as string) || user.signInDetails?.loginId || '';
      const name = (payload?.name as string) || (payload?.['cognito:username'] as string) || user.username;
      
      console.log('👤 User details from idToken:', {
        userId,
        email,
        name,
        claims: payload ? Object.keys(payload) : []
      });
      
      // Tenants are fetched separately via tenantApiService.getUserTenants()
      const tenants: string[] = [];
      
      return {
        userId,
        email,
        name,
        tenants,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async resetPassword({ email }: ResetPasswordParams) {
    try {
      const result = await resetPassword({
        username: email,
      });
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async confirmResetPassword({ email, confirmationCode, newPassword }: ConfirmResetPasswordParams) {
    try {
      const result = await confirmResetPassword({
        username: email,
        confirmationCode,
        newPassword,
      });
      return result;
    } catch (error) {
      console.error('Confirm reset password error:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      console.log('🔄 Refreshing authentication token');
      
      // Force refresh the AWS Cognito session
      const session = await fetchAuthSession({ forceRefresh: true });
      const newToken = session.tokens?.accessToken?.toString() || null;
      
      if (newToken) {
        console.log('✅ Token refreshed successfully');
        return newToken;
      } else {
        throw new Error('No token received from session refresh');
      }
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
