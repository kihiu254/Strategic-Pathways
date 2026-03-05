# Strategic Pathways - Image Assets Documentation

## 📸 Image Inventory

### Current Images in `/public/images/`

#### 1. **audience_institutions.jpg**
- **Purpose:** Audience section - Institutions
- **Used in:** AudienceSection.tsx
- **Description:** Represents institutional partners and organizations
- **Recommended size:** 800x600px
- **Format:** JPG

#### 2. **audience_returnees.jpg**
- **Purpose:** Audience section - Returnees
- **Used in:** AudienceSection.tsx
- **Description:** Represents diaspora returnees and study-abroad professionals
- **Recommended size:** 800x600px
- **Format:** JPG

#### 3. **hero_collaboration.jpg**
- **Purpose:** Hero section background
- **Used in:** HeroSection.tsx
- **Description:** Main hero image showing collaboration and teamwork
- **Recommended size:** 1920x1080px
- **Format:** JPG

#### 4. **impact_mentorship.jpg**
- **Purpose:** Impact section
- **Used in:** ImpactSection.tsx
- **Description:** Showcases mentorship and community impact
- **Recommended size:** 800x600px
- **Format:** JPG

#### 5. **opportunities_workspace.jpg**
- **Purpose:** Opportunities section
- **Used in:** OpportunitiesSection.tsx
- **Description:** Professional workspace and opportunities
- **Recommended size:** 800x600px
- **Format:** JPG

#### 6. **step1_apply.png**
- **Purpose:** How It Works - Step 1
- **Used in:** HowItWorksSection.tsx
- **Description:** Icon/illustration for application step
- **Recommended size:** 400x400px
- **Format:** PNG (transparent background)

#### 7. **step2_connect.png**
- **Purpose:** How It Works - Step 2
- **Used in:** HowItWorksSection.tsx
- **Description:** Icon/illustration for connection step
- **Recommended size:** 400x400px
- **Format:** PNG (transparent background)

#### 8. **step3_grow.png**
- **Purpose:** How It Works - Step 3
- **Used in:** HowItWorksSection.tsx
- **Description:** Icon/illustration for growth step
- **Recommended size:** 400x400px
- **Format:** PNG (transparent background)

#### 9. **value_team_meeting.jpg**
- **Purpose:** Value section
- **Used in:** ValueSection.tsx
- **Description:** Team collaboration and value proposition
- **Recommended size:** 800x600px
- **Format:** JPG

### Logo Files in `/public/`

#### 1. **logo.png**
- **Purpose:** Main logo
- **Used in:** Navigation, Footer, various components
- **Recommended size:** 400x100px
- **Format:** PNG (transparent background)

#### 2. **logo.jpg**
- **Purpose:** Logo alternative
- **Format:** JPG

#### 3. **logo-og.png**
- **Purpose:** Open Graph image for social media
- **Recommended size:** 1200x630px
- **Format:** PNG

#### 4. **logo-social.png**
- **Purpose:** Social media profile image
- **Recommended size:** 400x400px
- **Format:** PNG

---

## 🎨 Image Usage Guidelines

### Image Optimization
All images should be:
- ✅ Optimized for web (compressed)
- ✅ Properly sized for their use case
- ✅ Using appropriate format (JPG for photos, PNG for logos/icons)
- ✅ Lazy loaded where possible
- ✅ Have alt text for accessibility

### Recommended Image Sizes

| Use Case | Recommended Size | Format |
|----------|-----------------|--------|
| Hero Images | 1920x1080px | JPG |
| Section Images | 800x600px | JPG |
| Icons/Steps | 400x400px | PNG |
| Logo | 400x100px | PNG |
| OG Image | 1200x630px | PNG |
| Profile Pictures | 400x400px | JPG/PNG |

---

## 📦 Additional Images Needed

### For Referrals Page
- **referral_share.jpg** - People sharing and networking
- **referral_rewards.jpg** - Rewards and benefits visualization

### For Dashboard
- **dashboard_welcome.jpg** - Welcome banner image
- **opportunities_banner.jpg** - Opportunities section banner
- **events_banner.jpg** - Events section banner

### For Verification
- **verification_success.jpg** - Verification success illustration
- **document_upload.jpg** - Document upload illustration

### For Profile
- **profile_placeholder.jpg** - Default profile picture
- **cover_default.jpg** - Default cover image

---

## 🖼️ Image Component Usage

### Using OptimizedImage Component

```tsx
import OptimizedImage from '../components/OptimizedImage';

<OptimizedImage
  src="/images/hero_collaboration.jpg"
  alt="Professional collaboration"
  width={1920}
  height={1080}
  className="w-full h-auto"
/>
```

### Direct Image Usage

```tsx
<img 
  src="/images/logo.png" 
  alt="Strategic Pathways" 
  width={160}
  height={40}
  className="h-10 w-auto"
/>
```

---

## 📋 Image Checklist

### Current Images
- ✅ audience_institutions.jpg
- ✅ audience_returnees.jpg
- ✅ hero_collaboration.jpg
- ✅ impact_mentorship.jpg
- ✅ opportunities_workspace.jpg
- ✅ step1_apply.png
- ✅ step2_connect.png
- ✅ step3_grow.png
- ✅ value_team_meeting.jpg
- ✅ logo.png
- ✅ logo.jpg
- ✅ logo-og.png
- ✅ logo-social.png

### Images to Add
- ⏳ referral_share.jpg
- ⏳ referral_rewards.jpg
- ⏳ dashboard_welcome.jpg
- ⏳ opportunities_banner.jpg
- ⏳ events_banner.jpg
- ⏳ verification_success.jpg
- ⏳ document_upload.jpg
- ⏳ profile_placeholder.jpg
- ⏳ cover_default.jpg

---

## 🎯 Image Sources

### Recommended Stock Photo Sites
- **Unsplash** - https://unsplash.com (Free, high-quality)
- **Pexels** - https://pexels.com (Free, diverse)
- **Pixabay** - https://pixabay.com (Free, commercial use)

### Search Keywords for Strategic Pathways
- "African professionals"
- "Business collaboration Kenya"
- "Diaspora networking"
- "Professional mentorship"
- "Team meeting Africa"
- "Workspace collaboration"
- "Business handshake"
- "Professional growth"

---

## 🔧 Image Optimization Tools

### Online Tools
- **TinyPNG** - https://tinypng.com (PNG/JPG compression)
- **Squoosh** - https://squoosh.app (Advanced compression)
- **ImageOptim** - https://imageoptim.com (Mac app)

### Command Line
```bash
# Install imagemagick
npm install -g imagemagick

# Resize image
convert input.jpg -resize 800x600 output.jpg

# Compress image
convert input.jpg -quality 85 output.jpg
```

---

## 📱 Responsive Images

### Using srcset for Different Sizes

```tsx
<img
  src="/images/hero_collaboration.jpg"
  srcSet="
    /images/hero_collaboration-small.jpg 640w,
    /images/hero_collaboration-medium.jpg 1024w,
    /images/hero_collaboration-large.jpg 1920w
  "
  sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
  alt="Professional collaboration"
/>
```

---

## 🎨 Image Naming Convention

### Format
`{section}_{description}.{ext}`

### Examples
- `hero_collaboration.jpg`
- `audience_institutions.jpg`
- `step1_apply.png`
- `logo_social.png`

### Rules
- Use lowercase
- Use underscores for spaces
- Be descriptive
- Include section/purpose

---

## 📊 Image Performance

### Current Status
- ✅ All images optimized
- ✅ Lazy loading implemented
- ✅ Alt text provided
- ✅ Proper sizing

### Metrics to Monitor
- Page load time
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Image load time

---

## 🔒 Image Security

### Best Practices
- ✅ No sensitive information in images
- ✅ Proper file permissions
- ✅ CDN usage for production
- ✅ Image validation on upload

---

## 📝 Alt Text Guidelines

### Good Alt Text Examples
- ✅ "Professional team collaborating in modern office"
- ✅ "Diaspora professional mentoring young entrepreneur"
- ✅ "Strategic Pathways logo"

### Bad Alt Text Examples
- ❌ "Image"
- ❌ "Photo"
- ❌ "IMG_1234.jpg"

---

## 🚀 Deployment Checklist

### Before Deployment
- [ ] All images optimized
- [ ] Alt text added to all images
- [ ] Images tested on mobile
- [ ] Images tested on different browsers
- [ ] Lazy loading working
- [ ] No broken image links
- [ ] OG images configured
- [ ] Favicon set

---

## 📞 Support

For image-related questions:
- Check this documentation
- Review OptimizedImage component
- Contact: joinstrategicpathways@gmail.com

---

**Last Updated:** 2024  
**Version:** 1.0  
**Platform:** Strategic Pathways
