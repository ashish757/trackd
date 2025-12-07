# Google OAuth Setup Guide

## Overview

This guide will help you set up Google OAuth authentication for the Trackd application. The implementation uses a secure flow with HttpOnly cookies for refresh tokens and in-memory storage for access tokens.

## Security Features

✅ **HttpOnly Cookies** - Refresh tokens stored in HttpOnly cookies (protected from XSS)  
✅ **CSRF Protection** - State parameter used in OAuth flow  
✅ **Token Rotation** - New refresh token issued on each refresh  
✅ **Token Limit** - Maximum 5 refresh tokens per user  
✅ **Email Verification** - Only verified Google emails accepted  
✅ **Secure Redirect** - Tokens not exposed in browser history  
✅ **In-Memory Access Token** - Access token never stored in localStorage

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- PostgreSQL database running

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `Trackd` (or your preferred name)
5. Click "Create"

### 1.2 Enable Google+ API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Trackd
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On the **Scopes** page, click "Add or Remove Scopes"
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
8. Click "Save and Continue"
9. Add test users (your email) if in testing mode
10. Click "Save and Continue"

### 1.4 Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose **Web application**
4. Set the name: `Trackd Web Client`
5. Add **Authorized JavaScript origins**:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
6. Add **Authorized redirect URIs**:
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://api.yourdomain.com/auth/google/callback`
7. Click "Create"
8. Copy the **Client ID** and **Client Secret** (you'll need these for `.env`)

## Step 2: Backend Configuration

### 2.1 Update `.env` File

Add these variables to `/server/.env`:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=http://localhost:5173

# Environment
ENV=development
```

**Production Example:**
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/auth/google/callback
FRONTEND_URL=https://yourdomain.com
ENV=production
```

### 2.2 Database Schema

The Prisma schema already includes Google OAuth fields:

```prisma
model User {
  // ...existing fields
  password      String?   // Optional for OAuth users
  googleId      String?   @unique
  avatar        String?
  // ...
}
```

If you haven't run migrations yet:

```bash
cd server
npx prisma migrate dev --name add_google_oauth_fields
```

## Step 3: Frontend Configuration

### 3.1 Update `.env` File

Add these variables to `/client/.env`:

```env
VITE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
```

**Production Example:**
```env
VITE_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Step 4: Testing the OAuth Flow

### 4.1 Start the Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 4.2 Test the Login Flow

1. Navigate to `http://localhost:5173/signin`
2. Click "Sign in with Google"
3. You should be redirected to Google's consent screen
4. Choose your Google account
5. Grant permissions
6. You should be redirected back to your app and logged in

### 4.3 Verify Success

Check these indicators:
- ✅ Redirected to home page
- ✅ User data loaded in Redux state
- ✅ No errors in browser console
- ✅ Refresh token cookie set (check DevTools > Application > Cookies)

## How It Works

### OAuth Flow Diagram

```
┌─────────┐          ┌────────┐          ┌─────────┐          ┌──────────┐
│ User    │          │ Client │          │ Server  │          │  Google  │
└────┬────┘          └───┬────┘          └────┬────┘          └────┬─────┘
     │                   │                     │                    │
     │  Click "Sign in"  │                     │                    │
     ├──────────────────>│                     │                    │
     │                   │  GET /auth/google   │                    │
     │                   ├────────────────────>│                    │
     │                   │                     │                    │
     │                   │    Redirect to      │                    │
     │                   │    Google OAuth     │                    │
     │                   │<────────────────────┤                    │
     │                   │                     │                    │
     │                   │           Redirect to Google            │
     │                   ├───────────────────────────────────────>│
     │                   │                     │                    │
     │    Google Login   │                     │                    │
     │    & Consent      │                     │                    │
     │<──────────────────┼─────────────────────┼────────────────────┤
     │                   │                     │                    │
     │                   │    Callback with code                   │
     │                   │                     │<───────────────────┤
     │                   │                     │                    │
     │                   │                     │  Exchange code     │
     │                   │                     │  for tokens        │
     │                   │                     ├───────────────────>│
     │                   │                     │                    │
     │                   │                     │  User profile      │
     │                   │                     │<───────────────────┤
     │                   │                     │                    │
     │                   │   Redirect with     │                    │
     │                   │   accessToken       │                    │
     │                   │<────────────────────┤                    │
     │                   │   (refreshToken     │                    │
     │                   │    in cookie)       │                    │
     │                   │                     │                    │
     │                   │  Fetch user data    │                    │
     │                   ├────────────────────>│                    │
     │                   │                     │                    │
     │                   │  User data          │                    │
     │                   │<────────────────────┤                    │
     │                   │                     │                    │
     │   Logged in!      │                     │                    │
     │<──────────────────┤                     │                    │
```

### Security Considerations

1. **State Parameter**: Random state parameter prevents CSRF attacks
2. **HttpOnly Cookies**: Refresh token not accessible via JavaScript
3. **SameSite**: Cookie attribute prevents CSRF (None in production, Lax in dev)
4. **Secure Flag**: HTTPS-only cookies in production
5. **Token Rotation**: New refresh token issued on each use
6. **Token Limit**: Max 5 concurrent sessions per user
7. **Email Verification**: Only verified Google emails accepted

## Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Cause**: The callback URL doesn't match what's configured in Google Console

**Solution**:
1. Check your `.env` file - `GOOGLE_CALLBACK_URL` should match exactly
2. Verify in Google Console > Credentials > Your OAuth Client
3. Make sure the URI includes the protocol (`http://` or `https://`)
4. No trailing slash in the URI

### Issue: "Access blocked: Authorization Error"

**Cause**: App not verified or user not added to test users

**Solution**:
1. Go to Google Console > OAuth consent screen
2. Add your email to "Test users"
3. Or publish the app (requires verification for production)

### Issue: User redirected but not logged in

**Cause**: Frontend can't fetch user data

**Solution**:
1. Check browser console for errors
2. Verify `VITE_API_BASE_URL` in client `.env`
3. Check that backend `/user/profile` endpoint exists
4. Verify CORS settings allow credentials

### Issue: "Invalid refresh token" on page reload

**Cause**: Cookies not being sent with requests

**Solution**:
1. Add `credentials: 'include'` to fetch requests
2. Check CORS configuration allows credentials
3. Verify `sameSite` cookie attribute is correct for your setup

### Issue: Works in dev but not production

**Cause**: Environment-specific settings not updated

**Solution**:
1. Update `ENV=production` in server `.env`
2. Update all URLs to production domains
3. Add production URLs to Google Console
4. Ensure HTTPS is enabled (required for `secure` cookies)

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google API Console](https://console.developers.google.com/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

## Support

If you encounter issues not covered here, please:
1. Check the browser console for errors
2. Check the server logs
3. Verify all environment variables are set correctly
4. Ensure database migrations are up to date

