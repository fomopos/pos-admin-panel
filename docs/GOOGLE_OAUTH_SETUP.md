# Google OAuth Setup Guide

This guide walks you through configuring Google as an identity provider for your POS Admin Panel using AWS Cognito.

## Overview

The implementation uses AWS Amplify v6 with OAuth 2.0 authorization code flow to enable Google sign-in alongside traditional email/password authentication.

## Prerequisites

- AWS Cognito User Pool created and configured
- Google Cloud Console account
- Access to AWS Console with Cognito permissions

## Step 1: Configure Google OAuth Client

### 1.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application** as the application type
6. Configure the OAuth client:
   - **Name**: Your app name (e.g., "POS Admin Panel")
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - `https://your-production-domain.com` (production)
   - **Authorized redirect URIs**:
     - `https://your-app-name.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
     - Replace `your-app-name` with your Cognito domain prefix
     - Replace `us-east-1` with your AWS region

7. Click **Create** and save the **Client ID** and **Client Secret**

### 1.2 Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (or Internal for Google Workspace)
3. Fill in required fields:
   - **App name**: Your application name
   - **User support email**: Your support email
   - **Developer contact information**: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Save and continue

## Step 2: Configure AWS Cognito

### 2.1 Add Google as Identity Provider

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Select your User Pool
3. Navigate to **Sign-in experience** → **Federated identity provider sign-in**
4. Click **Add identity provider**
5. Select **Google**
6. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client secret**: From Google Cloud Console
   - **Authorized scopes**: `profile email openid`
7. Configure attribute mapping (map Google attributes to Cognito):
   - `email` → `email`
   - `name` → `name`
   - `picture` → `picture` (optional)
8. Click **Add identity provider**

### 2.2 Configure App Client for OAuth

1. In your User Pool, go to **App integration** → **App clients**
2. Select your app client or create a new one
3. Edit **Hosted UI settings**:
   - **Allowed callback URLs**: Add your application callback URLs
     - `http://localhost:5173/auth/callback` (development)
     - `https://your-production-domain.com/auth/callback` (production)
   - **Allowed sign-out URLs**: Add your sign-out URLs
     - `http://localhost:5173/auth/signin` (development)
     - `https://your-production-domain.com/auth/signin` (production)
   - **Identity providers**: Check **Google**
   - **OAuth 2.0 grant types**: Check **Authorization code grant**
   - **OpenID Connect scopes**: Select `email`, `openid`, `profile`, `aws.cognito.signin.user.admin`
4. Save changes

### 2.3 Set Up Cognito Domain

1. In **App integration** → **Domain**, set up a Cognito domain:
   - **Domain prefix**: Choose a unique prefix (e.g., `your-app-name`)
   - Full domain will be: `your-app-name.auth.us-east-1.amazoncognito.com`
2. Click **Create domain** or use existing domain

## Step 3: Update Application Configuration

### 3.1 Update Environment Variables

Update your `.env` file with the following:

```env
# AWS Cognito Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_AWS_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# OAuth Configuration
VITE_OAUTH_DOMAIN=your-app-name.auth.us-east-1.amazoncognito.com
VITE_OAUTH_REDIRECT_SIGNIN=http://localhost:5173/auth/callback
VITE_OAUTH_REDIRECT_SIGNOUT=http://localhost:5173/auth/signin
```

**Production environment** (use comma-separated values for multiple URLs):

```env
VITE_OAUTH_REDIRECT_SIGNIN=http://localhost:5173/auth/callback,https://your-domain.com/auth/callback
VITE_OAUTH_REDIRECT_SIGNOUT=http://localhost:5173/auth/signin,https://your-domain.com/auth/signin
```

### 3.2 Verify Configuration Files

The following files have been updated with OAuth support:

- ✅ **src/auth/config.ts** - OAuth configuration added
- ✅ **src/pages/auth/SignIn.tsx** - Google sign-in button implemented
- ✅ **src/pages/auth/OAuthCallback.tsx** - OAuth callback handler created
- ✅ **src/App.tsx** - `/auth/callback` route added
- ✅ **.env.example** - OAuth variables documented

## Step 4: Testing

### 4.1 Development Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/auth/signin`

3. Click the **Google** button

4. You should be redirected to Google's sign-in page

5. After successful authentication:
   - Redirected to `/auth/callback` (loading screen)
   - Then to `/tenant-store-selection`
   - Finally to `/dashboard`

### 4.2 Verify User Creation

1. Go to AWS Cognito Console
2. Navigate to your User Pool → **Users**
3. Check that users signing in with Google are created with:
   - Username format: `Google_<google-user-id>`
   - Email verified automatically
   - Attributes populated from Google profile

### 4.3 Troubleshooting

#### "OAuth is not properly configured"
- Verify `VITE_OAUTH_DOMAIN` is set correctly (without `https://`)
- Check that Cognito domain is created and active

#### "Google identity provider is not configured"
- Ensure Google is added as an identity provider in Cognito
- Verify app client has Google enabled in identity providers

#### Redirect URI Mismatch
- Verify callback URLs in Google Cloud Console match exactly
- Check that Cognito app client has correct callback URLs
- URLs must match exactly (including trailing slashes)

#### CORS Errors
- Ensure authorized JavaScript origins are set in Google Cloud Console
- Add both `http://localhost:5173` and your production domain

#### Users Not Linking to Existing Accounts
- Cognito does not automatically link federated identities to existing email/password users
- Users must use the same sign-in method consistently
- Consider implementing account linking if needed (custom flow)

## Authentication Flow

```
User clicks "Google" button
    ↓
signInWithRedirect({ provider: 'Google' })
    ↓
Redirect to Cognito Hosted UI
    ↓
Redirect to Google OAuth
    ↓
User authenticates with Google
    ↓
Google redirects to Cognito (/oauth2/idpresponse)
    ↓
Cognito creates/updates user
    ↓
Cognito redirects to /auth/callback
    ↓
OAuthCallback.tsx verifies session
    ↓
Navigate to /tenant-store-selection
    ↓
User selects tenant/store
    ↓
Navigate to /dashboard
```

## Security Considerations

### 1. Token Storage
- Tokens are managed by AWS Amplify (secure, httpOnly)
- No manual token storage in localStorage/sessionStorage

### 2. HTTPS in Production
- **CRITICAL**: Use HTTPS in production for all OAuth flows
- Update redirect URLs to use `https://`
- Configure SSL certificates for your domain

### 3. Attribute Mapping
- Map only necessary attributes from Google
- Review user data permissions in OAuth consent screen
- Consider GDPR/privacy implications

### 4. Rate Limiting
- Cognito applies rate limits to auth requests
- Implement retry logic with exponential backoff if needed

### 5. Session Management
- Sessions expire based on Cognito token settings
- Implement token refresh (already handled by Amplify)
- Clear tenant/store data on sign out

## Multi-Environment Setup

For staging and production environments, create separate:

1. **Google OAuth Clients** (one per environment)
2. **Cognito App Clients** (or use same with multiple redirect URLs)
3. **Environment Variables** (.env.staging, .env.production)

### Example Production Configuration

```env
# Production .env
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_ProdPool
VITE_AWS_USER_POOL_CLIENT_ID=prod-client-id

VITE_OAUTH_DOMAIN=pos-admin-prod.auth.us-east-1.amazoncognito.com
VITE_OAUTH_REDIRECT_SIGNIN=https://admin.yourpos.com/auth/callback
VITE_OAUTH_REDIRECT_SIGNOUT=https://admin.yourpos.com/auth/signin
```

## Additional Identity Providers

To add GitHub, Facebook, or other providers:

1. Follow similar steps in AWS Cognito Console
2. Configure provider-specific OAuth credentials
3. Update `handleSocialLogin` in SignIn.tsx:
   ```typescript
   await signInWithRedirect({ provider: 'GitHub' });
   ```

## Support

For issues or questions:
- AWS Cognito Documentation: https://docs.aws.amazon.com/cognito/
- AWS Amplify Auth: https://docs.amplify.aws/lib/auth/social/q/platform/js/
- Google OAuth: https://developers.google.com/identity/protocols/oauth2

## Rollback Plan

If you need to disable OAuth:

1. Remove Google from Cognito identity providers
2. Revert environment variables (remove VITE_OAUTH_*)
3. The app will continue working with email/password
4. Users who signed in with Google will not be able to authenticate

**Note**: Existing OAuth users will be preserved in Cognito but cannot sign in until OAuth is re-enabled.
