# LinkedIn OAuth Fix

## Problem
After signing in with LinkedIn, users are redirected back to the login page instead of being authenticated.

## Root Cause
The OAuth callback isn't being properly handled after LinkedIn redirects back to your app.

## Solution Applied

### 1. Updated LoginPage.tsx
- Changed OAuth redirect URL to `/login` instead of `/profile`
- Added OAuth callback detection in useEffect
- Properly handles hash parameters and session after OAuth

### 2. Supabase Configuration Required

**CRITICAL**: You must update your Supabase Auth settings:

1. Go to: https://supabase.com/dashboard/project/ezkvwccwafpzlrjlbnpn/auth/url-configuration

2. Add these URLs to **Redirect URLs**:
   ```
   http://localhost:5173/login
   https://joinstrategicpathways.com/login
   ```

3. Verify **Site URL** is set to:
   ```
   https://joinstrategicpathways.com
   ```

### 3. LinkedIn Developer Portal Configuration

1. Go to: https://www.linkedin.com/developers/apps

2. Find your app (Client ID: 776micqx4a7ug7)

3. Under **Auth** tab, verify **Redirect URLs** include:
   ```
   https://ezkvwccwafpzlrjlbnpn.supabase.co/auth/v1/callback
   ```

4. Under **Products**, ensure these are enabled:
   - Sign In with LinkedIn using OpenID Connect
   - Share on LinkedIn

5. Verify **OAuth 2.0 scopes** include:
   - openid
   - profile
   - email

## Testing Steps

1. Deploy the updated code:
   ```bash
   npm run build
   git add .
   git commit -m "Fix LinkedIn OAuth callback handling"
   git push
   ```

2. Wait for Vercel deployment to complete

3. Test LinkedIn login:
   - Go to https://joinstrategicpathways.com/login
   - Click "Continue with LinkedIn"
   - Authorize the app
   - Should redirect to /login then immediately to /profile or /onboarding

## Debugging

If still not working, check browser console for:

1. **Session errors**:
   ```javascript
   // Open browser console on /login page after OAuth
   const { data } = await supabase.auth.getSession();
   console.log('Session:', data.session);
   ```

2. **URL parameters**:
   ```javascript
   // Check if OAuth callback parameters are present
   console.log('Hash:', window.location.hash);
   console.log('Search:', window.location.search);
   ```

3. **Supabase logs**:
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for LinkedIn sign-in attempts
   - Check for any errors

## Common Issues

### Issue 1: "Invalid redirect URL"
**Fix**: Add the exact URL to Supabase Redirect URLs list

### Issue 2: Session is null after redirect
**Fix**: Check that LinkedIn app has correct callback URL in LinkedIn Developer Portal

### Issue 3: "Provider not enabled"
**Fix**: 
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable LinkedIn (OIDC)
3. Add your LinkedIn Client ID and Secret

### Issue 4: Infinite redirect loop
**Fix**: Clear browser cookies and localStorage:
```javascript
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

## Environment Variables

Verify these are set correctly in `.env`:

```env
VITE_LINKEDIN_CLIENT_ID=776micqx4a7ug7
LINKEDIN_CLIENT_SECRET=WPL_AP1.EjRT7QkNBqn8xv.YOUR_COMPLETE_SECRET_HERE
VITE_LINKEDIN_REDIRECT_URI=https://ezkvwccwafpzlrjlbnpn.supabase.co/auth/v1/callback
```

**Note**: The client secret should be added to Supabase Dashboard, not your .env file (for security).

## Vercel Environment Variables

Make sure these are set in Vercel:
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add:
   - `VITE_LINKEDIN_CLIENT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PRODUCTION_URL`

## Alternative: Use PKCE Flow

If issues persist, you can enable PKCE flow for better security:

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'linkedin_oidc',
  options: {
    redirectTo: `${window.location.origin}/login`,
    scopes: 'openid profile email',
    skipBrowserRedirect: false,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});
```

## Success Indicators

After fix is working:
1. ✅ Click LinkedIn button → LinkedIn authorization page
2. ✅ Click "Allow" → Redirect to /login
3. ✅ Immediately redirect to /profile or /onboarding
4. ✅ User is logged in (check profile page loads)
5. ✅ No errors in console

## Support

If still having issues:
1. Check Supabase Auth logs
2. Check browser Network tab for failed requests
3. Verify all redirect URLs match exactly (no trailing slashes)
4. Test with Google OAuth to confirm OAuth flow works
5. Check that LinkedIn app is not in "Development" mode (should be "Production")
