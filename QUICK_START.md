# Quick Start: Critical Performance Fixes

## What's Already Done ✅

1. ✅ Vite build optimization (code splitting, minification)
2. ✅ Non-blocking Google Fonts
3. ✅ Deferred Google Analytics
4. ✅ Vercel cache headers
5. ✅ Lazy loading for all routes (already in App.tsx)

## Do These Next (30 minutes)

### Step 1: Install Image Optimizer (5 min)

```bash
cd app
npm install -D vite-plugin-image-optimizer sharp
```

Update `vite.config.ts`:
```typescript
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// Add to plugins array:
ViteImageOptimizer({
  jpg: { quality: 80 },
  png: { quality: 80 },
})
```

### Step 2: Add Image Dimensions (10 min)

Search for all `<img` tags and add dimensions. Priority files:

**HeroSection.tsx**:
```tsx
<img 
  src="/images/hero_collaboration.jpg" 
  width="1200" 
  height="800"
  alt="..."
/>
```

**Other sections**: Add similar dimensions based on actual image sizes.

### Step 3: Fix Accessibility - Buttons (5 min)

Search for icon-only buttons and add aria-labels:

```bash
# Search command
findstr /s "<button" src\components\*.tsx src\sections\*.tsx
```

Add `aria-label` to any button without text:
```tsx
<button aria-label="Close">
  <XIcon />
</button>
```

### Step 4: Fix Accessibility - Links (5 min)

Search for icon-only links:

```bash
findstr /s "<a href" src\components\*.tsx src\sections\*.tsx
```

Add `aria-label` to any link without text:
```tsx
<a href="/profile" aria-label="View profile">
  <UserIcon />
</a>
```

### Step 5: Build and Deploy (5 min)

```bash
npm run build
npm run preview  # Test locally
git add .
git commit -m "Performance optimizations: code splitting, image optimization, accessibility fixes"
git push
```

## Expected Results

### Before
- Mobile Performance: 64
- Desktop Performance: 93
- Mobile Accessibility: 90
- Desktop Accessibility: 82

### After (Estimated)
- Mobile Performance: 75-80 (+11-16 points)
- Desktop Performance: 96-98 (+3-5 points)
- Mobile Accessibility: 95-100 (+5-10 points)
- Desktop Accessibility: 95-100 (+13-18 points)

## Verify Improvements

1. Deploy to Vercel
2. Wait 2-3 minutes for deployment
3. Run PageSpeed Insights: https://pagespeed.web.dev/
4. Enter: https://joinstrategicpathways.com
5. Check both Mobile and Desktop scores

## If Scores Don't Improve

### Check Build Output

```bash
npm run build
```

Look for:
- Chunk sizes (should be < 500 KB each)
- Image optimization messages
- No errors

### Check Deployed Files

Visit:
- https://joinstrategicpathways.com/assets/ (check file sizes)
- View page source (check fonts are non-blocking)
- DevTools Network tab (check caching headers)

## Next Phase (Optional - 1-2 hours)

For even better scores (85+ mobile):

1. Convert images to WebP format
2. Implement responsive images (srcSet)
3. Add resource hints (dns-prefetch for Supabase)
4. Fix remaining contrast issues
5. Optimize third-party scripts

See `PERFORMANCE_OPTIMIZATION.md` for detailed instructions.

## Monitoring

Add to `package.json`:
```json
{
  "scripts": {
    "perf": "lighthouse https://joinstrategicpathways.com --view --preset=desktop",
    "perf:mobile": "lighthouse https://joinstrategicpathways.com --view --preset=mobile"
  }
}
```

Install Lighthouse:
```bash
npm install -g lighthouse
```

Run after each deployment:
```bash
npm run perf
npm run perf:mobile
```

## Troubleshooting

### Images Not Optimized
- Check vite-plugin-image-optimizer is in plugins array
- Verify sharp is installed: `npm list sharp`
- Check build output for optimization messages

### Fonts Still Blocking
- Clear browser cache
- Check index.html has `media="print" onload="this.media='all'"`
- Verify noscript fallback exists

### Accessibility Issues Remain
- Use Chrome DevTools Accessibility panel
- Install axe DevTools extension
- Run automated scan on deployed site

### Cache Headers Not Working
- Check vercel.json is in root of app folder
- Redeploy to Vercel
- Check response headers in DevTools Network tab

## Support Resources

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Web.dev Performance](https://web.dev/performance/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vercel Caching](https://vercel.com/docs/concepts/edge-network/caching)

## Summary

Priority fixes completed:
1. ✅ Code splitting and minification
2. ✅ Non-blocking resources
3. ✅ Cache headers
4. 🔄 Image optimization (install plugin)
5. 🔄 Image dimensions (add to components)
6. 🔄 Accessibility labels (add aria-labels)

Time investment: ~30 minutes
Expected improvement: +10-15 points mobile, +5-10 points desktop
