import { z } from 'zod';

export const basicOnboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  professionalTitle: z.string().min(2, 'Professional title is required'),
  email: z.string().email('Invalid email address'),
  countryCode: z.string().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  countryOfResidence: z.string().min(2, 'Country is required'),
  nationality: z.string().min(2, 'Nationality is required'),
});

export type BasicOnboardingData = z.infer<typeof basicOnboardingSchema>;
