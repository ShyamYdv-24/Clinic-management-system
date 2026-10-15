import { z } from 'zod';

export const clinicSettingsSchema = z.object({
  clinicName: z.string().trim().min(2, 'Clinic name is required'),
  tagline: z.string().trim().min(5, 'Tagline is required'),
  emergencyPhone: z.string().trim().min(7, 'Emergency phone number is required'),
  generalPhone: z.string().trim().min(7, 'General phone number is required'),
  email: z.string().trim().email('Valid email is required'),
  address: z.object({
    street: z.string().trim().min(3, 'Street address is required'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
    postalCode: z.string().trim().min(3, 'Postal code is required'),
    landmark: z.string().optional(),
  }),
  workingHours: z.object({
    weekdays: z.string().min(3, 'Weekday hours required'),
    saturday: z.string().min(3, 'Saturday hours required'),
    sunday: z.string().min(3, 'Sunday hours required'),
    emergency24x7: z.boolean().default(true),
  }),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
  }),
  aboutBrief: z.string().min(20, 'Brief description required'),
  announcementNotice: z.string().optional(),
});

export type ClinicSettingsInput = z.infer<typeof clinicSettingsSchema>;
