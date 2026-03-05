# Image Optimization Script

## Images Found
- hero_collaboration.jpg (preloaded in index.html)
- audience_institutions.jpg
- audience_returnees.jpg
- impact_mentorship.jpg
- opportunities_workspace.jpg
- value_team_meeting.jpg
- step1_apply.png
- step2_connect.png
- step3_grow.png

## Installation

```bash
npm install -D vite-plugin-image-optimizer sharp
```

## Update vite.config.ts

Add this import at the top:
```typescript
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
```

Add to plugins array:
```typescript
plugins: [
  inspectAttr(), 
  react(),
  ViteImageOptimizer({
    jpg: {
      quality: 80,
    },
    png: {
      quality: 80,
    },
    webp: {
      quality: 80,
    },
  })
],
```

## Add Explicit Dimensions to Images

### Find All Image Tags

Search for `<img` in all component files and add width/height attributes.

### Example Fixes

**Before**:
```tsx
<img src="/images/hero_collaboration.jpg" alt="Team collaboration" />
```

**After**:
```tsx
<img 
  src="/images/hero_collaboration.jpg" 
  alt="Team collaboration"
  width="1200"
  height="800"
  loading="lazy"
/>
```

### Recommended Dimensions

Based on typical usage:

```typescript
// Hero images (full width)
width="1200" height="800"

// Section images (half width)
width="800" height="600"

// Icons/Steps
width="400" height="400"

// Thumbnails
width="300" height="200"
```

## Modern Image Format (WebP)

### Option 1: Use Picture Element

```tsx
<picture>
  <source srcSet="/images/hero_collaboration.webp" type="image/webp" />
  <img 
    src="/images/hero_collaboration.jpg" 
    alt="Team collaboration"
    width="1200"
    height="800"
  />
</picture>
```

### Option 2: Convert Images to WebP

```bash
# Install sharp-cli
npm install -g sharp-cli

# Convert all JPGs to WebP
cd public/images
for %f in (*.jpg) do sharp -i %f -o %~nf.webp --webp-quality 80
```

## Lazy Loading

Add `loading="lazy"` to all images except:
- Hero image (already preloaded)
- Above-the-fold content

```tsx
<img 
  src="/images/value_team_meeting.jpg"
  alt="Description"
  width="800"
  height="600"
  loading="lazy"
/>
```

## Responsive Images

Use srcSet for different screen sizes:

```tsx
<img 
  src="/images/hero_collaboration.jpg"
  srcSet="
    /images/hero_collaboration-400.jpg 400w,
    /images/hero_collaboration-800.jpg 800w,
    /images/hero_collaboration-1200.jpg 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Team collaboration"
  width="1200"
  height="800"
/>
```

## Image Component Helper

Create `src/components/OptimizedImage.tsx`:

```tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className 
}: OptimizedImageProps) {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : 'auto'}
        className={className}
      />
    </picture>
  );
}
```

Usage:
```tsx
<OptimizedImage
  src="/images/hero_collaboration.jpg"
  alt="Team collaboration"
  width={1200}
  height={800}
  priority
/>
```

## Expected Savings

- Original JPGs: ~200-500 KB each
- Optimized JPGs (80% quality): ~100-250 KB each
- WebP format: ~60-150 KB each

**Total savings**: 76-80 KiB (as reported by PageSpeed)

## Checklist

- [ ] Install vite-plugin-image-optimizer
- [ ] Update vite.config.ts
- [ ] Add width/height to all images
- [ ] Add loading="lazy" to below-fold images
- [ ] Convert images to WebP (optional but recommended)
- [ ] Create OptimizedImage component
- [ ] Replace img tags with OptimizedImage
- [ ] Test build: `npm run build`
- [ ] Verify image sizes in dist folder
- [ ] Deploy and retest PageSpeed

## Testing

```bash
# Build and check output
npm run build

# Check image sizes
dir dist\assets\*.jpg
dir dist\assets\*.webp

# Preview production build
npm run preview
```

## Priority Order

1. Add width/height to ALL images (prevents CLS)
2. Add loading="lazy" to below-fold images
3. Install and configure image optimizer
4. Convert to WebP format
5. Implement responsive images with srcSet
