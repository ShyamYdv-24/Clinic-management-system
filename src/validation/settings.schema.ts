import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const dayScheduleSchema = z.object({
  open: z.string().regex(timeRegex, 'Opening time must be HH:MM format').default('08:00'),
  close: z.string().regex(timeRegex, 'Closing time must be HH:MM format').default('20:00'),
  isClosed: z.boolean().default(false),
});

const navLinkItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Navigation label is required'),
  href: z.string().min(1, 'Navigation link URL is required'),
  isVisible: z.boolean().default(true),
  order: z.number().default(1),
});

export const clinicSettingsSchema = z.object({
  // 1. Clinic Identity
  clinicName: z.string().trim().min(2, 'Clinic name must be at least 2 characters'),
  tagline: z.string().trim().min(3, 'Tagline is required'),
  mainLogoUrl: z.string().optional().default(''),
  lightLogoUrl: z.string().optional().default(''),
  darkLogoUrl: z.string().optional().default(''),
  faviconUrl: z.string().optional().default('/favicon.ico'),
  defaultOgImage: z.string().optional().default('/og-image.jpg'),
  brandPrimaryColor: z.string().optional().default('#059669'),
  brandSecondaryColor: z.string().optional().default('#0f172a'),
  aboutBrief: z.string().trim().min(10, 'Clinic description must be at least 10 characters'),
  establishedYear: z.number().int().min(1900).max(2050).optional().default(2012),
  registrationNumber: z.string().optional().default(''),
  directorName: z.string().optional().default(''),

  // 2. Contact Information
  emergencyPhone: z.string().trim().min(7, 'Emergency phone number is required (min 7 digits)'),
  generalPhone: z.string().trim().min(7, 'General phone number is required (min 7 digits)'),
  whatsappNumber: z.string().trim().optional(),
  email: z.string().trim().email('Valid email is required'),
  address: z.object({
    street: z.string().trim().min(3, 'Street address is required'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State / Region is required'),
    postalCode: z.string().trim().min(3, 'Postal code is required'),
    country: z.string().optional().default('India'),
    landmark: z.string().optional(),
  }),
  mapsEmbedUrl: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  clickToCallEnabled: z.boolean().optional().default(true),
  whatsappCtaEnabled: z.boolean().optional().default(true),

  // 3. Opening Hours
  workingHours: z.object({
    weekdays: z.string().min(3, 'Weekday hours required'),
    saturday: z.string().min(3, 'Saturday hours required'),
    sunday: z.string().min(3, 'Sunday hours required'),
    emergency24x7: z.boolean().default(true),
  }),
  dailySchedule: z
    .object({
      monday: dayScheduleSchema,
      tuesday: dayScheduleSchema,
      wednesday: dayScheduleSchema,
      thursday: dayScheduleSchema,
      friday: dayScheduleSchema,
      saturday: dayScheduleSchema,
      sunday: dayScheduleSchema,
    })
    .optional(),
  holidayNotices: z.string().optional(),
  displayPreferences: z.enum(['detailed', 'compact']).optional().default('detailed'),
  timezone: z.string().optional().default('Asia/Kolkata'),

  // 4. Social Profiles
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
  }),

  // 5. Website & SEO
  productionUrl: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  searchConsoleVerification: z.string().optional(),
  analyticsId: z.string().optional(),
  cookieConsentEnabled: z.boolean().optional().default(true),
  structuredData: z
    .object({
      clinicType: z.string().optional(),
      priceRange: z.string().optional(),
      medicalSpecialty: z.string().optional(),
    })
    .optional(),

  // 6. Header and Footer
  headerLogoStyle: z.enum(['text_and_icon', 'custom_image', 'text_only']).optional().default('text_and_icon'),
  navLinks: z.array(navLinkItemSchema).optional(),
  footerDescription: z.string().optional(),
  footerCopyrightText: z.string().optional(),
  appointmentCtaLabel: z.string().optional().default('Book Appointment'),
  whatsappCtaLabel: z.string().optional().default('WhatsApp Us'),
  announcementNotice: z.string().optional(),

  // 7. Appointment Configuration
  appointmentWhatsAppNumber: z.string().optional(),
  whatsappTemplate: z.string().optional(),
  requireSymptoms: z.boolean().optional().default(true),
  requireAge: z.boolean().optional().default(false),
  requireGender: z.boolean().optional().default(false),
  appointmentDisclaimer: z.string().optional(),
  consentText: z.string().optional(),
  enquiryNotificationEmail: z.string().optional(),
});

export type ClinicSettingsInput = z.infer<typeof clinicSettingsSchema>;
