# Strategic Pathways - Quick Implementation Guide

## Overview
This guide provides developers with a quick reference for implementing the onboarding flow and dashboard system.

## Key Files Created/Modified

### New Files
1. `/app/src/sections/UserDashboard.tsx` - User dashboard component
2. `/app/docs/ONBOARDING_DASHBOARD_GUIDE.md` - Comprehensive documentation
3. `/app/docs/IMPLEMENTATION_QUICK_START.md` - This file

### Modified Files
1. `/app/src/App.tsx` - Added user dashboard route
2. `/app/src/sections/Navigation.tsx` - Updated dashboard links

## Routes

### User Routes
- `/dashboard` - User dashboard (normal users)
- `/profile` - User profile view
- `/profile/edit` - Edit profile
- `/onboarding` - Onboarding flow
- `/verification` - Verification center
- `/opportunities` - Opportunities listing

### Admin Routes
- `/admin` - Admin dashboard (admin users only)
- `/admin/user/:userId` - User detail view

## Dashboard Separation

### User Dashboard (`/dashboard`)
**Purpose:** Post-onboarding experience for normal users

**Features:**
- Profile completion tracker
- Smart opportunity recommendations
- Upcoming events
- Recommended collaborations
- Community activation prompts
- Mentorship network access

**Access:** All authenticated users

### Admin Dashboard (`/admin`)
**Purpose:** Platform management for administrators

**Features:**
- Member management
- Project tracking
- Application review
- Verification document access
- Analytics and reporting
- Platform settings

**Access:** Admin role only (protected by AdminRoute)

## Onboarding Flow

### 7 Steps
1. **Awareness** - User discovers platform
2. **Sign-Up** - Email/password or LinkedIn OAuth
3. **Choose Profile Type** - Standard (MVP) or Premium
4. **Profile Completion** - Multi-step form with progress bar
5. **Smart Recommendations** - Auto-generated opportunities
6. **Welcome Dashboard** - First view of dashboard
7. **Community Activation** - Welcome emails and invites

### Profile Types

#### Standard (MVP)
- 5-minute setup
- Basic info, professional snapshot, engagement intent
- Short narrative (100-word bio)
- Consent and data policy

#### Premium (Verified)
- Extended profile
- Advanced professional details
- Income & engagement preferences
- Verification layer (CV, certifications, references)
- Impact orientation (SDG alignment, mentorship)
- Premium badges

## Verification Tiers

### Tier 1 - Self-Declared (Free)
- Email verification
- LinkedIn profile
- Basic ID upload

### Tier 2 - Verified Professional (Premium)
- Manual document review
- Verification call
- "Verified Global Professional" badge

### Tier 3 - Institutional Ready (Bidding)
- Full document verification
- Professional reference checks
- Compliance documentation

## Matching Algorithm

### Formula
```
Match Score = (Sector × 0.25) + (Function × 0.25) + (Geo × 0.15) + 
              (Experience × 0.15) + (Availability × 0.10) + (Intent × 0.10)
```

### Scoring
- Exact match = 1
- Partial match = 0.5
- No match = 0

## Database Tables Required

```sql
-- Core tables
profiles
user_projects
user_skills
verification_documents
opportunities
events
collaborations
activities

-- Storage buckets
avatars
resumes
verification-documents
```

## Key Components

### UserDashboard.tsx
```typescript
// Main user dashboard component
// Displays: profile completion, opportunities, events, collaborations
// Route: /dashboard
```

### AdminDashboard.tsx
```typescript
// Admin dashboard component
// Displays: members, projects, applications, analytics
// Route: /admin (protected)
```

### ProfileOnboarding.tsx
```typescript
// Multi-step onboarding form
// Handles: profile type selection, data collection, submission
// Route: /onboarding
```

## Social Media Links

All pages should include links to:
- LinkedIn: https://www.linkedin.com/company/join-strategicpathways/?viewAsMember=true
- Instagram: https://www.instagram.com/joinstrategicpathways/
- TikTok: https://www.tiktok.com/@joinstrategicpathways
- X: https://x.com/SPathways_
- Facebook: https://www.facebook.com/profile.php?id=61588643401308
- Threads: https://www.threads.com/@joinstrategicpathways
- YouTube: https://www.youtube.com/@joinstrategicpathways

## Implementation Checklist

### Phase 1: Core Setup
- [x] Create UserDashboard component
- [x] Update App.tsx with dashboard route
- [x] Update Navigation with dashboard links
- [ ] Test user dashboard access
- [ ] Test admin dashboard access (admin only)

### Phase 2: Onboarding
- [x] ProfileOnboarding component exists
- [ ] Test 7-step flow
- [ ] Verify profile completion tracking
- [ ] Test Standard vs Premium paths
- [ ] Validate form submissions

### Phase 3: Verification
- [ ] Document upload functionality
- [ ] Admin document review interface
- [ ] Tier progression logic
- [ ] Badge assignment system

### Phase 4: Matching
- [ ] Implement matching algorithm
- [ ] Test opportunity recommendations
- [ ] Validate match scores
- [ ] Collaboration suggestions

### Phase 5: Community
- [ ] Event management system
- [ ] RSVP functionality
- [ ] Member spotlight feature
- [ ] Mentorship network

### Phase 6: Testing
- [ ] User flow testing
- [ ] Admin flow testing
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Security audit

## Environment Variables

Ensure these are set in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Considerations

### Row Level Security (RLS)
- Users can only view/edit their own profiles
- Admins can view all profiles
- Verification documents only accessible by admins
- Projects linked to user IDs

### File Upload Security
- Max file size: 5MB
- Allowed types: PDF, DOCX, JPG, PNG
- Encrypted storage
- Signed URLs for downloads

## Testing Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests (if configured)
npm test
```

## Common Issues & Solutions

### Issue: Dashboard not loading
**Solution:** Check if user is authenticated and route is protected

### Issue: Profile completion not updating
**Solution:** Verify database trigger for profile_completion_percentage

### Issue: Documents not uploading
**Solution:** Check storage bucket policies and file size limits

### Issue: Admin dashboard accessible to normal users
**Solution:** Ensure AdminRoute component is wrapping admin routes

## Next Steps

1. **Test the onboarding flow** - Complete a full user registration
2. **Verify dashboard separation** - Test both user and admin dashboards
3. **Check verification system** - Upload documents and test admin review
4. **Validate matching algorithm** - Ensure opportunities show correct match scores
5. **Test community features** - Events, collaborations, mentorship

## Support

For questions or issues:
- Review `/app/docs/ONBOARDING_DASHBOARD_GUIDE.md` for detailed documentation
- Check existing components in `/app/src/sections/`
- Review database schema in `/app/docs/database-schema.sql`

## Version History

- **v1.0** - Initial implementation with user and admin dashboards
- Onboarding flow with 7 steps
- Verification system with 3 tiers
- Matching algorithm with weighted scoring

---

**Last Updated:** 2024
**Platform:** Strategic Pathways
