# Google OAuth Quick Reference

## 🚀 Quick Setup (5 minutes)

### 1. Google Console
```
1. Go to console.cloud.google.com
2. Create project → Enable Google+ API
3. OAuth consent screen → External → Add test users
4. Credentials → Create OAuth Client ID → Web application
5. Add redirect URI: http://localhost:3000/auth/google/callback
6. Copy Client ID & Secret
```

### 2. Backend `.env`
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:5173
ENV=development
```

### 3. Frontend `.env`
```env
VITE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Test
```bash
# Terminal 1
cd server && npm run start:dev

# Terminal 2
cd client && npm run dev

# Browser
http://localhost:5173/signin → Click "Sign in with Google"
```

---

## 🔒 Security Architecture

```
┌─────────────────┬──────────────────┬─────────────────┐
│   Token Type    │   Storage        │   Expiry        │
├─────────────────┼──────────────────┼─────────────────┤
│ Access Token    │ Memory (JS var)  │ 15 minutes      │
│ Refresh Token   │ HttpOnly Cookie  │ 7 days          │
│ Google Token    │ Never stored     │ N/A             │
└─────────────────┴──────────────────┴─────────────────┘
```

**Why this is secure:**
- ✅ XSS can't steal refresh token (HttpOnly)
- ✅ CSRF protected (SameSite cookie + state param)
- ✅ Short-lived access tokens
- ✅ Token rotation on refresh
- ✅ Max 5 sessions per user

---

## 📡 API Endpoints

### OAuth Flow
```
GET  /auth/google                    # Initiate OAuth
GET  /auth/google/callback?code=...  # Google callback
POST /auth/refresh-token             # Refresh access token
POST /auth/logout                    # Clear tokens
```

### Usage
```typescript
// Frontend - Trigger OAuth
window.location.href = "http://localhost:3000/auth/google"

// Frontend - Refresh token (automatic via RTK Query)
fetch('/auth/refresh-token', {
  credentials: 'include' // Important!
})
```

---

## 🎯 Key Files

### Backend
```
auth.service.ts
├── getGoogleAuthURL()     # Generates OAuth URL with state
└── googleLogin(code)      # Exchanges code for tokens

auth.controller.ts
├── GET /google            # Redirects to Google
└── GET /google/callback   # Handles callback
```

### Frontend
```
GoogleLoginButton.tsx      # "Sign in with Google" button
OauthSuccessPage.tsx        # Handles OAuth redirect
authSlice.ts               # Updates Redux state
```

---

## 🐛 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `redirect_uri_mismatch` | URL doesn't match Google Console | Check `.env` GOOGLE_CALLBACK_URL |
| `Access blocked` | Not a test user | Add email in Google Console |
| `Invalid refresh token` | Cookies not sent | Add `credentials: 'include'` |
| Works in dev, fails in prod | Wrong environment settings | Update ENV=production |
| User not logged in | Profile fetch fails | Check CORS allows credentials |

### Debug Commands
```bash
# Check cookies in browser
DevTools → Application → Cookies → localhost:5173

# Check backend logs
cd server && npm run start:dev
# Look for "OAuth Callback Error" or "Google OAuth Error"

# Test backend directly
curl -X GET http://localhost:3000/auth/google
# Should redirect to Google
```

---

## 🔄 OAuth Flow (Simplified)

```
User → Google Button
  ↓
Backend: /auth/google
  ↓
Google Login Page
  ↓
Backend: /auth/google/callback?code=xyz
  ↓
Exchange code for Google token
  ↓
Fetch user profile from Google
  ↓
Create/Update user in database
  ↓
Generate JWT tokens
  ↓
Set refresh token in cookie
  ↓
Redirect: /oauth-success?accessToken=abc
  ↓
Frontend: Store token + Fetch user data
  ↓
User logged in! 🎉
```

---

## 📋 Production Checklist

### Environment
- [ ] `ENV=production` in server `.env`
- [ ] HTTPS URLs for all endpoints
- [ ] Update `GOOGLE_CALLBACK_URL` to production
- [ ] Update `FRONTEND_URL` to production
- [ ] Secrets stored in environment (not committed)

### Google Console
- [ ] Add production redirect URI
- [ ] Add production JavaScript origin
- [ ] Remove localhost URIs (security)
- [ ] Consider publishing app (removes test user limit)

### Code
- [ ] CORS allows production frontend
- [ ] Cookies: `secure: true`, `sameSite: 'none'`
- [ ] Error monitoring enabled
- [ ] Rate limiting on OAuth endpoints

### Testing
- [ ] Test OAuth flow on production
- [ ] Test token refresh
- [ ] Test logout
- [ ] Test error cases
- [ ] Test on mobile devices

---

## 💡 Tips

**Development:**
```bash
# Use different ports to avoid conflicts
Backend:  localhost:3000
Frontend: localhost:5173

# Add console.logs for debugging
console.log('Access Token:', accessToken)
console.log('User:', user)
```

**Production:**
```bash
# Use environment variables
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Monitor OAuth errors
# Set up error tracking (Sentry, LogRocket, etc.)

# Use secret management
# AWS Secrets Manager, GCP Secret Manager, etc.
```

**Security:**
```typescript
// ✅ DO: Use credentials
fetch('/api/endpoint', { credentials: 'include' })

// ❌ DON'T: Store refresh token in localStorage
localStorage.setItem('refreshToken', token) // NEVER DO THIS!

// ✅ DO: Let HttpOnly cookies handle it
// Backend sets cookie, browser sends automatically

// ❌ DON'T: Expose tokens in URLs
redirect(`/page?token=${token}`) // Visible in logs!

// ✅ DO: Clear sensitive data from URL
window.history.replaceState({}, '', '/')
```

---

## 🎓 Learn More

- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Security](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [HttpOnly Cookies](https://owasp.org/www-community/HttpOnly)
- [CSRF Protection](https://owasp.org/www-community/attacks/csrf)

---

## 📞 Need Help?

1. Check `docs/GOOGLE_OAUTH_SETUP.md` for detailed guide
2. Check `docs/OAUTH_IMPLEMENTATION_SUMMARY.md` for implementation details
3. Open an issue on GitHub
4. Check browser console for errors
5. Check server logs for errors

---

**Last Updated:** December 7, 2024
**Status:** ✅ Production Ready

