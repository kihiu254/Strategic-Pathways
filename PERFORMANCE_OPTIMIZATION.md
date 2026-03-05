# Performance Optimization Guide

## Current PageSpeed Insights Scores

### Mobile
- Performance: 64/100 ❌
- Accessibility: 90/100 ⚠️
- Best Practices: 100/100 ✅
- SEO: 100/100 ✅

### Desktop
- Performance: 93/100 ✅
- Accessibility: 82/100 ⚠️
- Best Practices: 100/100 ✅
- SEO: 100/100 ✅

## Critical Issues Fixed

### 1. ✅ Render-Blocking Resources
**Impact**: Mobile -1,130ms, Desktop -200ms

**Fixed**:
- Moved Google Analytics to end of `<head>`
- Made Google Fonts non-blocking with `media="print" onload="this.media='all'"`
- Added `<noscript>` fallback for fonts

### 2. ✅ Code Splitting & Bundle Optimization
**Impact**: Reduces unused JavaScript by ~217 KiB

**Fixed in vite.config.ts**:
- Manual chunks for react-vendor, ui-vendor, form-vendor, supabase
- CSS code splitting enabled
- Terser minification with console/debugger removal

## Remaining Issues to Fix

### 3. Image Optimization (Est. 76-80 KiB savings)

**Action Required**:
```bash
# Install sharp for image optimization
npm install -D vite-plugin-image-optimizer sharp
```

Add to `vite.config.ts`:
```typescript
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

plugins: [
  inspectAttr(), 
  react(),
  ViteImageOptimizer({
    jpg: { quality: 80 },
    png: { quality: 80 },
  })
]
```

**Add explicit width/height to all images**:
```tsx
// Find all <img> tags and add dimensions
<img src="/images/hero_collaboration.jpg" width="1200" height="800" alt="..." />
```

### 4. Accessibility Issues

#### Contrast Ratios
**Files to check**: All component files with text/backgrounds

**Fix**: Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
```css
/* Example fixes */
.low-contrast-text {
  color: #666; /* Change to #595959 or darker */
}
```

#### Links Without Names
**Find and fix**:
```bash
# Search for problematic links
grep -r "<a href" src/components
```

**Fix**:
```tsx
// Bad
<a href="/link"><Icon /></a>

// Good
<a href="/link" aria-label="Descriptive text"><Icon /></a>
```

#### Buttons Without Names
```tsx
// Bad
<button><Icon /></button>

// Good
<button aria-label="Close dialog"><Icon /></button>
```

#### Heading Order (Mobile)
**Fix**: Ensure headings follow sequential order (h1 → h2 → h3, no skipping)

### 5. Lazy Loading Components

**Create**: `src/utils/lazyLoad.ts`
```typescript
import { lazy } from 'react';

export const lazyLoad = (importFunc: () => Promise<any>) => 
  lazy(() => importFunc().catch(() => ({ default: () => null })));
```

**Apply to routes**:
```typescript
// In App.tsx or router config
const Dashboard = lazyLoad(() => import('./pages/Dashboard'));
const Profile = lazyLoad(() => import('./pages/Profile'));
```

### 6. Preload Critical Resources

**Add to index.html** (before other links):
```html
<link rel="preload" href="/src/main.tsx" as="script" crossorigin>
<link rel="preload" href="/src/index.css" as="style">
```

### 7. Optimize Third-Party Scripts

**Current**: Google Analytics loads synchronously

**Already Fixed**: Moved to end of head with async attribute

### 8. Add Resource Hints

**Add to index.html**:
```html
<link rel="dns-prefetch" href="https://ezkvwccwafpzlrjlbnpn.supabase.co">
<link rel="preconnect" href="https://ezkvwccwafpzlrjlbnpn.supabase.co">
```

## Build & Deploy Checklist

### Before Deployment:
```bash
# 1. Install terser for minification
npm install -D terser

# 2. Build with optimizations
npm run build

# 3. Test production build locally
npm run preview

# 4. Check bundle size
npx vite-bundle-visualizer
```

### Vercel Configuration

**Update vercel.json**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Expected Improvements

After implementing all fixes:

### Mobile
- Performance: 64 → **85+** (+21 points)
- FCP: 4.4s → **2.5s** (-1.9s)
- LCP: 6.3s → **3.5s** (-2.8s)

### Desktop
- Performance: 93 → **98+** (+5 points)
- FCP: 1.1s → **0.8s** (-0.3s)
- LCP: 1.4s → **1.0s** (-0.4s)

### Accessibility
- Mobile: 90 → **100** (+10 points)
- Desktop: 82 → **100** (+18 points)

## Monitoring

**Add to package.json**:
```json
{
  "scripts": {
    "lighthouse": "lighthouse https://joinstrategicpathways.com --view"
  }
}
```

**Install**:
```bash
npm install -g lighthouse
```

**Run after deployment**:
```bash
npm run lighthouse
```

## Priority Order

1. ✅ **DONE**: Render-blocking resources (fonts, analytics)
2. ✅ **DONE**: Code splitting & minification
3. **HIGH**: Image optimization + dimensions
4. **HIGH**: Accessibility fixes (contrast, labels)
5. **MEDIUM**: Lazy loading routes
6. **MEDIUM**: Resource hints (dns-prefetch, preconnect)
7. **LOW**: Bundle analysis & monitoring

## Quick Wins (Do These First)

1. Add image dimensions to prevent CLS
2. Fix contrast ratios in CSS
3. Add aria-labels to icon-only buttons/links
4. Install and configure image optimizer plugin
5. Deploy and retest

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [React Lazy Loading](https://react.dev/reference/react/lazy)
