# Email Automation System Setup

## Overview
Comprehensive email automation system that sends emails for all user actions using Resend API.

## Features Implemented

### ✅ Email Types
- **Welcome Email**: Sent when user signs up
- **Onboarding Reminder**: Sent 24 hours after signup if profile incomplete
- **Onboarding Complete**: Sent when user completes profile
- **Project Added**: Sent when user adds a project
- **CV Uploaded**: Sent when user uploads CV/Resume
- **Opportunity Match**: Sent when new opportunities match user profile
- **Application Status**: Sent when application status changes

### ✅ Integration Points
- **SignupPage**: Welcome email on verification
- **ProfilePage**: Project added & CV uploaded emails
- **Onboarding**: Completion email trigger
- **Opportunities**: Match notification emails

## Setup Instructions

### 1. Install Dependencies
```bash
npm install resend
```

### 2. Environment Variables
Add to your `.env` file:
```
RESEND_API_KEY=your_resend_api_key_here
VITE_PRODUCTION_URL=https://www.joinstrategicpathways.com
```

### 3. Verify Domain
1. Go to Resend dashboard
2. Add and verify your domain: `joinstrategicpathways.com`
3. Set up DNS records as instructed

### 4. Test Email Sending
```typescript
import { EmailAutomationService } from '../lib/emailAutomation';

// Test welcome email
await EmailAutomationService.onUserSignup(
  'user-id',
  'test@example.com',
  'John Doe'
);
```

## Email Templates

All emails feature:
- Professional branding with Strategic Pathways colors
- Responsive design
- Clear call-to-action buttons
- Consistent styling
- Mobile-friendly layout

## Automation Triggers

### Automatic Triggers
- ✅ User signup → Welcome email
- ✅ Project added → Confirmation email
- ✅ CV uploaded → Confirmation email
- ⏳ Onboarding incomplete after 24h → Reminder email
- ⏳ New opportunity match → Match notification
- ⏳ Application status change → Status update

### Manual Triggers
All email types can be triggered manually using the `EmailAutomationService` class.

## Cost Estimation

**Resend Pricing**:
- Free tier: 3,000 emails/month
- Pro tier: $20/month for 50,000 emails
- Very cost-effective compared to alternatives

## Next Steps

1. Set up automated onboarding reminders using cron jobs
2. Implement opportunity matching email triggers
3. Add email preferences for users
4. Set up email analytics and tracking
5. Create additional email templates for edge cases

## Files Created

- `emailService.ts` - Email templates and sending logic
- `emailAutomation.ts` - Service integration layer
- `send.ts` - API endpoint for email sending
- Updated `SignupPage.tsx` - Welcome email trigger
- Updated `ProfilePage.tsx` - Project/CV email triggers