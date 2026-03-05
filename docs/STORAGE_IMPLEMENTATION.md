# Dual Storage Implementation Guide

## Setup Steps

### 1. Run SQL Script
Run `app/docs/setup-dual-storage.sql` in Supabase SQL Editor to create:
- `verification-documents` bucket (for PDFs, IDs, certificates)
- `profile-images` bucket (for profile photos, logos)

### 2. Current Implementation (Supabase Only)
All files currently use Supabase Storage:
```typescript
import { uploadFile } from './lib/uploadUtils';

// Upload verification document
const result = await uploadFile(file, 'verification');

// Upload profile image
const result = await uploadFile(file, 'profiles');
```

### 3. Future Migration to ImageKit (Optional)

When you need better image performance:

**Step 1**: Sign up at https://imagekit.io (Free tier)

**Step 2**: Add credentials to `.env`:
```
VITE_IMAGEKIT_PUBLIC_KEY=your_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

**Step 3**: Update `uploadFile` in `uploadUtils.ts` to route images to ImageKit

**Step 4**: Use optimized URLs:
```typescript
import { getOptimizedImageUrl } from './lib/uploadUtils';

const optimizedUrl = getOptimizedImageUrl(imageUrl, {
  width: 300,
  height: 300,
  quality: 80
});
```

## File Routing Strategy

```
User uploads file
    ↓
Is it an image? (jpg, png, webp)
    ↓ YES → profile-images bucket (Supabase)
    ↓ NO  → verification-documents bucket (Supabase)
```

## Benefits

✅ **Now**: Simple Supabase-only setup
✅ **Later**: Easy migration to ImageKit for images
✅ **Always**: Documents stay secure in Supabase

## Storage Limits

**Supabase Free Tier**:
- 1GB storage
- 2GB bandwidth/month

**ImageKit Free Tier** (when you migrate):
- 20GB storage
- 20GB bandwidth/month
- Unlimited transformations

## Migration Path

1. **Phase 1** (Current): All files → Supabase
2. **Phase 2** (When needed): Images → ImageKit, Documents → Supabase
3. **Phase 3** (Scale): Add CDN for global delivery
