import { 
  signIn, 
  signUp, 
  confirmSignUp, 
  signOut, 
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
      
      await signOut();
      console.log('✅ User signed out and data cleared successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await getCurrentUser();
      
      // Extract user information from Cognito
      const email = user.signInDetails?.loginId || '';
      const userId = user.userId;
      const name = user.username;
      
      // Mock tenant data - in real app, this would come from your API
      const tenants = ['tenant-1', 'tenant-2'];
      
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
      return session.tokens?.idToken?.toString() || null;
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
      const newToken = session.tokens?.idToken?.toString() || null;
      
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
