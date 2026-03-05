# Strategic Pathways - Onboarding & Dashboard Documentation

## Table of Contents
1. [User Onboarding Flow](#user-onboarding-flow)
2. [Profile Structures](#profile-structures)
3. [Verification Framework](#verification-framework)
4. [Matching Algorithm](#matching-algorithm)
5. [Dashboard Architecture](#dashboard-architecture)
6. [Social Media Integration](#social-media-integration)

---

## 1. User Onboarding Flow

### 7-Step Onboarding Journey

#### Step 1: Awareness
Users discover the platform via:
- LinkedIn: https://www.linkedin.com/company/join-strategicpathways/?viewAsMember=true
- Events and referrals
- Founder content

#### Step 2: Sign-Up
- **Email + Password** or **LinkedIn OAuth**
- Email verification required
- Route: `/signup`

#### Step 3: Choose Profile Type
Users select between:
- **Standard (MVP)**: Quick onboarding, 5-minute setup
- **Premium (Verified Tier)**: Extended profile with verification

#### Step 4: Profile Completion
Multi-step progress bar with sections:
- **Basic Info**: Name, Email, LinkedIn, Country, Nationality
- **Professional Snapshot**: Sector, Expertise, Experience, Role
- **Engagement Intent**: Project types, Availability, Work model
- **Short Narrative**: 100-word bio, Value proposition
- **Consent**: Verification and data policy agreement

**Profile Completion Percentage** displayed throughout.

#### Step 5: Smart Recommendations
System auto-generates:
- Suggested opportunities based on initial data
- Upcoming events relevant to location/interests
- Potential collaborations

#### Step 6: Welcome Dashboard
Dashboard displays:
- Profile strength indicator
- Available opportunities
- Recommended collaborations
- Upcoming events
- CTA: "Complete profile to unlock more matches"

#### Step 7: Community Activation
Within first 7 days, trigger:
- Welcome email
- Member spotlight invitation
- Introductory call invite
- First event invite

---

## 2. Profile Structures

### A. Standard MVP Profile (Lean & Fast)

**Design Goals:**
- Quick onboarding (5 minutes)
- Low friction
- Early traction
- Manual matching support

**Sections:**

#### Section A: Basic Info
- Full Name
- Email
- LinkedIn URL
- Current Country
- Nationality

#### Section B: Professional Snapshot
- Primary Sector (dropdown)
- Functional Expertise (select up to 3)
- Years of Experience
- Current Role/Status

#### Section C: Engagement Intent
- Engagement preferences:
  - Paid projects
  - SME advisory
  - Venture building
  - Mentorship
  - Research
- Weekly Availability
- Work model (Remote/Hybrid/In-person)

#### Section D: Short Narrative
- 100-word Bio
- Value proposition

#### Section E: Consent
- Agreement to verification
- Data policy acceptance

**Why it works:**
- Takes 5 minutes to complete
- Provides enough data for manual matching
- Clean segmentation for analytics
- High conversion rate

### B. Premium-Tier Extended Profile

**Design Goals:**
- Verified professionals
- High-value consulting
- Venture co-creation
- Institutional matching

**Includes ALL MVP features PLUS:**

#### Advanced Professional Detail
- Up to 10 detailed skill tags (structured taxonomy)
  - Examples: Financial Modeling, AI Strategy
- Industry sub-specialization
- Quantifiable key achievements
- Countries worked in
- Languages spoken with proficiency levels

#### Income & Engagement Preferences
- Preferred project types:
  - Advisory
  - Interim Executive
  - Venture Partner
  - Board Advisor
- Compensation range expectations (pro-bono to premium rate)
- Investment interests:
  - Angel
  - Syndicate
  - Venture building

#### Verification Layer
- CV upload
- Certifications
- Reference contacts
- Optional ID verification

#### Impact Orientation
- Passionate problem areas
- SDG alignment (optional)
- Willingness to mentor
- Public profile features

#### Premium Badge System
- Verified Professional
- Venture Builder
- Policy Advisor
- SME Specialist
- Diaspora Ambassador

**Database Architecture:**
8-section structure:
1. Basic Information
2. Education
3. Experience
4. Interests
5. Contribution
6. Income/Venture Interest
7. Verification
8. Community/Visibility

---

## 3. Verification Framework

### Balance: Credibility + Trust + Inclusivity + Ease

### Target Categories & Document Requirements

#### A. Study-Abroad Returnees (Recent Graduates)
**Definition:** Completed programs abroad and returned to Kenya

**Required Documents:**
- 1 academic proof (degree certificate, transcript)
- 1 identity document (Kenyan passport, National ID)

**Alternatives:**
- University letters
- Scholarship documents (if certificates pending)

#### B. Diaspora Returnees (Professionals)
**Definition:** Studied/worked abroad significantly, relocated to Kenya

**Required Documents:**
- 1 employment proof (foreign employment contract, reference letter)
- 1 ID document

**Additional Accepted:**
- Proof of residency (visas, work permits)
- Foreign academic documents

#### C. Diaspora Experts (Still Abroad)
**Definition:** Professionals contributing remotely

**Verification:**
- Professional profile validation (LinkedIn, certifications)
- Soft verification interview

#### D. Optional Layers (For Bidding)
- Professional licenses
- KEBS/ERC/EPRA registration
- Business registrations
- Portfolios
- Research publications

### Scalable Digital Verification Tiers

#### Tier 1 – Self-Declared (Free Tier)
- Email verification
- LinkedIn profile
- Basic ID upload

#### Tier 2 – Verified Professional (Premium Tier)
- Manual document review
- Short verification call
- "Verified Global Professional" badge

#### Tier 3 – Institutional Ready (For Bidding Teams)
- Full document verification
- Professional reference checks
- Compliance documentation collection

### Best Practice for Launch
1. Start with LinkedIn + degree/employment proof
2. Light-touch manual review
3. Gradually increase verification levels for project bidding

### Data Protection & Trust
- Secure encrypted uploads
- Document visibility limited to admins only
- Clear Data Protection & Privacy Policy
- Full compliance with Kenya Data Protection Act (2019)

---

## 4. Matching Algorithm Logic

### Weighted Matching Engine

**6 Key Dimensions:**
1. Sector
2. Function
3. Geography
4. Experience Level
5. Engagement Intent
6. Availability

### Basic Weighted Scoring Logic

**Weights:**
- Sector Match → 25%
- Functional Skill Match → 25%
- Geography Relevance → 15%
- Experience Level Fit → 15%
- Availability Match → 10%
- Engagement Preference Match → 10%

### Calculation Formula

```
Match Score = (Sector × 0.25) + (Function × 0.25) + (Geo × 0.15) + 
              (Experience × 0.15) + (Availability × 0.10) + (Intent × 0.10)
```

### Scoring Parameters
- Exact match = 1
- Partial match = 0.5
- No match = 0

**Output:** % compatibility score

### Future Enhancements
- Skill keyword AI matching
- Behavior-based ranking
- Post-project reputation scoring

---

## 5. Dashboard Architecture

### User Dashboard (Normal Users)

**Route:** `/dashboard`

#### 1. Main Welcome Dashboard (Home)

**Key Components:**

##### Onboarding Progress Tracker
- Visual indicator showing Profile Strength / Completion %
- CTA: "Complete profile to unlock more matches"

##### Smart Recommendations Feed
Auto-generated cards displaying:
- Available opportunities (tailored to MVP data)
- Recommended collaborations (based on sector/expertise)
- Upcoming events (relevant to location/interests)

##### Status Tags
- "Collaboration Ready" tag
- "Verified Global Professional" badge

#### 2. Profile Management & Upgrade Hub

**Route:** `/profile/edit`

**8-Section Framework:**

##### Basic Info & Global Exposure
- Current country
- Nationality
- Highest education level
- Countries worked/studied in

##### Professional Snapshot
- Primary sector dropdown
- Functional expertise (up to 5 for premium)
- Current employment status

##### Engagement Intent Settings
- Preferred project types toggles:
  - Short-term paid projects
  - SME advisory
  - Venture co-creation
- Weekly availability (5 hours/week, full time)

##### Value & Impact
- Specific skills (open text)
- Passionate problem areas
- Cross-sector collaboration willingness

##### Premium Income Preferences
- Compensation range expectations (pro-bono to premium rate)
- Investment interest (Angel, Syndicate)

#### 3. Verification Center

**Route:** `/verification`

**Key Components:**

##### Current Tier Status
Display: Tier 1 (Self-Declared), Tier 2 (Verified Professional), or Tier 3 (Institutional Ready)

##### Document Upload Portal
Secure, encrypted upload fields for:
- Academic proof (degree certificates, transcripts)
- Identity & Return confirmation (Kenyan passport, National ID)
- Employment verification (contracts, payslips with redacted financial details)
- Optional bidding layers (Professional licenses, KEBS/ERC registration)

##### Consent & Privacy
Mandatory checkbox:
"I agree that Strategic Pathways may verify my professional background for platform credibility purposes"

Link to Data Protection & Privacy Policy (Kenya Data Protection Act 2019 compliant)

#### 4. Opportunities & Matching Board

**Route:** `/opportunities`

**Key Components:**

##### % Compatibility Score
Each opportunity displays match score calculated by weighted formula

##### Filters
Sort by engagement format:
- Remote
- Hybrid
- In-person

##### Project Types
Labeled tags:
- Advisory
- Interim Executive
- Venture Partner
- Board Advisor

#### 5. Community & Activation Lounge

**Fulfills Step 7 of onboarding**

**Key Components:**

##### Member Spotlights
- Highlights top users
- Opt-in via profile settings: "Open to being featured in member spotlights?"

##### Mentorship Network
- Connects users who answered "Yes" to "Would you like to mentor others?"
- Links with early-career professionals/founders

##### Onboarding Tasks
- Schedule introductory call
- RSVP to first event

---

### Admin Dashboard

**Route:** `/admin`

**Access:** Admin role only (protected route)

#### Key Sections:

##### 1. Overview
- Total Members
- Active Projects
- Pending Applications
- Verified Professionals
- Diaspora Experts
- Study-Abroad Returnees
- Average Rating
- Growth charts
- Recent applications table

##### 2. Members Management
- Search and filter members
- View member profiles
- Edit member details
- Verification status management
- Add new members manually

##### 3. Projects Management
- View all projects
- Project status tracking
- Progress monitoring
- Member assignments

##### 4. Applications Review
- Pending verification documents
- Approve/Reject applications
- View uploaded documents
- Download verification files
- User profile access

##### 5. Analytics
- Revenue tracking
- Active members metrics
- Success rate monitoring
- Monthly activity charts

##### 6. Settings
- Platform configuration
- Membership tier management
- Notification preferences
- General settings

---

## 6. Social Media Integration

### Official Channels

All pages should link to:

- **LinkedIn:** https://www.linkedin.com/company/join-strategicpathways/?viewAsMember=true
- **Instagram:** https://www.instagram.com/joinstrategicpathways/
- **TikTok:** https://www.tiktok.com/@joinstrategicpathways
- **X (Twitter):** https://x.com/SPathways_
- **Facebook:** https://www.facebook.com/profile.php?id=61588643401308
- **Threads:** https://www.threads.com/@joinstrategicpathways
- **YouTube:** https://www.youtube.com/@joinstrategicpathways

### Integration Points
- Website footer
- Website header
- Contact pages
- Profile pages
- Dashboard sidebar

---

## Implementation Notes

### Database Schema Required

**Tables:**
- `profiles` - User profile data
- `user_projects` - User project history
- `user_skills` - User skills mapping
- `verification_documents` - Document uploads
- `opportunities` - Available opportunities
- `events` - Platform events
- `collaborations` - User connections
- `activities` - User activity log

### Storage Buckets
- `avatars` - Profile pictures
- `resumes` - CV/Resume uploads
- `verification-documents` - Verification files

### Key Features
- Real-time profile completion tracking
- Smart matching algorithm
- Document verification workflow
- Event management system
- Collaboration recommendations
- Activity tracking

### Security Considerations
- Row Level Security (RLS) policies
- Encrypted document storage
- Admin-only document access
- GDPR/Kenya Data Protection Act compliance
- Secure file uploads

---

## Routes Summary

### Public Routes
- `/` - Home
- `/login` - Login
- `/signup` - Signup
- `/opportunities` - Opportunities listing
- `/how-it-works` - Platform guide
- `/pricing` - Pricing tiers
- `/contact` - Contact page

### Protected Routes (Authenticated Users)
- `/dashboard` - User dashboard
- `/profile` - User profile view
- `/profile/edit` - Edit profile
- `/onboarding` - Onboarding flow
- `/verification` - Verification center

### Admin Routes (Admin Only)
- `/admin` - Admin dashboard
- `/admin/user/:userId` - User detail view

---

## Next Steps

1. **Database Setup:** Ensure all tables and RLS policies are configured
2. **File Storage:** Configure Supabase storage buckets with proper policies
3. **Email Templates:** Set up transactional emails for onboarding steps
4. **Matching Algorithm:** Implement weighted scoring logic
5. **Event System:** Build event management and RSVP functionality
6. **Analytics:** Integrate tracking for user behavior and conversions
7. **Testing:** Comprehensive testing of onboarding flow and dashboards
8. **Documentation:** User guides and admin manuals

---

**Last Updated:** 2024
**Version:** 1.0
**Platform:** Strategic Pathways
