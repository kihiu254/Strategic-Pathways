# Strategic Pathways - System Flow Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWARENESS (Step 1)                          │
│  LinkedIn • Events • Referrals • Founder Content • Social Media     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SIGN-UP (Step 2)                            │
│              Email + Password  OR  LinkedIn OAuth                   │
│                    Route: /signup                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   CHOOSE PROFILE TYPE (Step 3)                      │
│                    Route: /onboarding                               │
│                                                                     │
│    ┌──────────────────┐              ┌──────────────────┐         │
│    │  Standard (MVP)  │              │ Premium (Verified)│         │
│    │  • 5 min setup   │              │ • Extended profile│         │
│    │  • Basic info    │              │ • Verification    │         │
│    │  • Quick match   │              │ • Premium badges  │         │
│    └────────┬─────────┘              └────────┬──────────┘         │
└─────────────┼────────────────────────────────┼────────────────────┘
              │                                │
              └────────────┬───────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   PROFILE COMPLETION (Step 4)                       │
│                    Route: /onboarding                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Progress Bar: [████████████░░░░░░░░░░] 60%                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Section A: Basic Info (Name, Email, LinkedIn, Country)            │
│  Section B: Professional Snapshot (Sector, Expertise, Experience)  │
│  Section C: Engagement Intent (Project types, Availability)        │
│  Section D: Short Narrative (Bio, Value proposition)               │
│  Section E: Consent (Verification, Data policy)                    │
│                                                                     │
│  [Premium Only]                                                     │
│  Section F: Advanced Details (Skills, Achievements, Languages)     │
│  Section G: Income & Venture (Compensation, Investment)            │
│  Section H: Verification (CV, Certifications, References)          │
│  Section I: Impact (SDG, Mentorship, Public profile)               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  SMART RECOMMENDATIONS (Step 5)                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ MATCHING ALGORITHM                                          │  │
│  │                                                             │  │
│  │ Match Score = (Sector × 0.25) + (Function × 0.25) +        │  │
│  │               (Geo × 0.15) + (Experience × 0.15) +          │  │
│  │               (Availability × 0.10) + (Intent × 0.10)       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Auto-generates:                                                    │
│  • Suggested opportunities (with % match)                           │
│  • Upcoming events (location-based)                                 │
│  • Potential collaborations (skill-based)                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    WELCOME DASHBOARD (Step 6)                       │
│                      Route: /dashboard                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Profile Strength: [████████░░] 80%                           │ │
│  │ "Complete profile to unlock more matches"                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ Opportunities│ │ Connections  │ │   Events     │ │  Rating  │ │
│  │      12      │ │      45      │ │      3       │ │   4.8    │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                     │
│  Available Opportunities (with match scores)                        │
│  Upcoming Events (with RSVP)                                        │
│  Recommended Collaborations                                         │
│  Community Activation Prompts                                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  COMMUNITY ACTIVATION (Step 7)                      │
│                     Within First 7 Days                             │
│                                                                     │
│  Day 1: Welcome Email                                               │
│  Day 2: Member Spotlight Invitation                                 │
│  Day 3: Introductory Call Invite                                    │
│  Day 5: First Event Invite                                          │
│  Day 7: Mentorship Network Introduction                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION                              │
│                                                                     │
│              User Login → Check Role → Route to Dashboard          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│    USER DASHBOARD         │   │    ADMIN DASHBOARD        │
│    Route: /dashboard      │   │    Route: /admin          │
│    Access: All Users      │   │    Access: Admin Only     │
└───────────────────────────┘   └───────────────────────────┘
│                           │   │                           │
│ ┌─────────────────────┐   │   │ ┌─────────────────────┐   │
│ │ Profile Completion  │   │   │ │ Overview            │   │
│ │ • Progress tracker  │   │   │ │ • Total members     │   │
│ │ • CTA to complete   │   │   │ │ • Active projects   │   │
│ └─────────────────────┘   │   │ │ • Pending apps      │   │
│                           │   │ │ • Growth charts     │   │
│ ┌─────────────────────┐   │   │ └─────────────────────┘   │
│ │ Stats Grid          │   │   │                           │
│ │ • Profile strength  │   │   │ ┌─────────────────────┐   │
│ │ • Opportunities     │   │   │ │ Members Management  │   │
│ │ • Connections       │   │   │ │ • Search & filter   │   │
│ │ • Events            │   │   │ │ • View profiles     │   │
│ └─────────────────────┘   │   │ │ • Edit details      │   │
│                           │   │ │ • Verification      │   │
│ ┌─────────────────────┐   │   │ └─────────────────────┘   │
│ │ Opportunities       │   │   │                           │
│ │ • Match scores      │   │   │ ┌─────────────────────┐   │
│ │ • Smart filtering   │   │   │ │ Projects Tracking   │   │
│ │ • Apply directly    │   │   │ │ • View all          │   │
│ └─────────────────────┘   │   │ │ • Status tracking   │   │
│                           │   │ │ • Progress monitor  │   │
│ ┌─────────────────────┐   │   │ └─────────────────────┘   │
│ │ Upcoming Events     │   │   │                           │
│ │ • Date & location   │   │   │ ┌─────────────────────┐   │
│ │ • RSVP button       │   │   │ │ Applications Review │   │
│ │ • Event details     │   │   │ │ • Pending docs      │   │
│ └─────────────────────┘   │   │ │ • Approve/Reject    │   │
│                           │   │ │ • View documents    │   │
│ ┌─────────────────────┐   │   │ │ • Download files    │   │
│ │ Collaborations      │   │   │ └─────────────────────┘   │
│ │ • Recommended users │   │   │                           │
│ │ • Match percentage  │   │   │ ┌─────────────────────┐   │
│ │ • Connect button    │   │   │ │ Analytics           │   │
│ └─────────────────────┘   │   │ │ • Revenue tracking  │   │
│                           │   │ │ • Active members    │   │
│ ┌─────────────────────┐   │   │ │ • Success rate      │   │
│ │ Community           │   │   │ │ • Monthly charts    │   │
│ │ • Member spotlight  │   │   │ └─────────────────────┘   │
│ │ • Mentorship        │   │   │                           │
│ │ • Onboarding tasks  │   │   │ ┌─────────────────────┐   │
│ └─────────────────────┘   │   │ │ Settings            │   │
└───────────────────────────┘   │ │ • Platform config   │   │
                                │ │ • Tier management   │   │
                                │ │ • Notifications     │   │
                                │ └─────────────────────┘   │
                                └───────────────────────────┘
```

## Verification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      VERIFICATION TIERS                             │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐
│ TIER 1: Self-Declared     │
│ (Free Tier)               │
├───────────────────────────┤
│ Requirements:             │
│ • Email verification      │
│ • LinkedIn profile        │
│ • Basic ID upload         │
├───────────────────────────┤
│ Badge: None               │
│ Access: Basic features    │
└────────────┬──────────────┘
             │
             │ User uploads documents
             │ Admin reviews
             ▼
┌───────────────────────────┐
│ TIER 2: Verified          │
│ Professional (Premium)    │
├───────────────────────────┤
│ Requirements:             │
│ • Manual doc review       │
│ • Verification call       │
│ • Reference check         │
├───────────────────────────┤
│ Badge: ✓ Verified         │
│ Access: Premium features  │
└────────────┬──────────────┘
             │
             │ User applies for projects
             │ Additional verification
             ▼
┌───────────────────────────┐
│ TIER 3: Institutional     │
│ Ready (Bidding)           │
├───────────────────────────┤
│ Requirements:             │
│ • Full doc verification   │
│ • Professional refs       │
│ • Compliance docs         │
├───────────────────────────┤
│ Badge: ✓✓ Institutional   │
│ Access: Bidding projects  │
└───────────────────────────┘
```

## Data Flow

```
┌─────────────┐
│   User      │
│  Actions    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  • UserDashboard.tsx                    │
│  • AdminDashboard.tsx                   │
│  • ProfileOnboarding.tsx                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Supabase Client (API)              │
│  • Authentication                       │
│  • Database queries                     │
│  • Storage operations                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Database (PostgreSQL)           │
│  Tables:                                │
│  • profiles                             │
│  • user_projects                        │
│  • user_skills                          │
│  • verification_documents               │
│  • opportunities                        │
│  • events                               │
│  • collaborations                       │
│  • activities                           │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Storage Buckets                    │
│  • avatars/                             │
│  • resumes/                             │
│  • verification-documents/              │
└─────────────────────────────────────────┘
```

## Matching Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MATCHING ALGORITHM                             │
└─────────────────────────────────────────────────────────────────────┘

User Profile Data                    Opportunity Data
┌──────────────┐                    ┌──────────────┐
│ • Sector     │                    │ • Sector     │
│ • Function   │                    │ • Function   │
│ • Geography  │                    │ • Location   │
│ • Experience │                    │ • Level      │
│ • Availability│                   │ • Timeline   │
│ • Intent     │                    │ • Type       │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       └───────────────┬───────────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │   Calculate Match Score       │
       │                               │
       │ Sector Match      × 0.25      │
       │ Function Match    × 0.25      │
       │ Geography Match   × 0.15      │
       │ Experience Match  × 0.15      │
       │ Availability Match× 0.10      │
       │ Intent Match      × 0.10      │
       │                               │
       │ Scoring:                      │
       │ • Exact match = 1             │
       │ • Partial match = 0.5         │
       │ • No match = 0                │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │   Match Score: 85%            │
       │                               │
       │   Display to User:            │
       │   ⭐ 85% Match                │
       │   "Highly Compatible"         │
       └───────────────────────────────┘
```

---

**Legend:**
- `┌─┐` = Container/Section
- `│` = Vertical connection
- `─` = Horizontal connection
- `▼` = Flow direction
- `•` = List item
- `×` = Multiplication/Weight

**Last Updated:** 2024
**Platform:** Strategic Pathways
