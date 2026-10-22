import { z } from 'zod';

export const enquiryStatusEnum = z.enum(['new', 'contacted', 'confirmed', 'closed']);
export type EnquiryStatus = z.infer<typeof enquiryStatusEnum>;

/**
 * Appointment Enquiry Validation Schema
 * Collects only necessary clinical contact and scheduling information.
 */
export const appointmentEnquirySchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, 'Patient name must be at least 2 characters')
    .max(100, 'Patient name cannot exceed 100 characters'),
  patientPhone: z
    .string()
    .trim()
    .min(10, 'Please enter a valid 10-digit phone number')
    .max(16, 'Phone number is too long')
    .regex(/^[0-9+\-\s()]+$/, 'Phone number contains invalid characters'),
  preferredDate: z
    .string()
    .min(1, 'Preferred appointment date is required')
    .refine((val) => {
      // Must be today or future date
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Preferred date cannot be in the past'),
  preferredTimeSlot: z
    .string()
    .trim()
    .min(1, 'Please select a preferred consultation time slot'),
  doctorId: z.string().optional().default(''),
  doctorName: z.string().trim().optional().default(''),
  serviceId: z.string().optional().default(''),
  serviceTitle: z.string().trim().optional().default(''),
  message: z
    .string()
    .trim()
    .max(500, 'Optional note cannot exceed 500 characters')
    .optional()
    .default(''),
  consentGiven: z.literal(true, {
    errorMap: () => ({
      message: 'You must provide consent for clinic communication regarding this appointment',
    }),
  }),
  honeypot: z.string().max(0, 'Spam detected').optional().default(''),
  submitTimestamp: z.number().optional(),
});

export const updateEnquiryStatusSchema = z.object({
  status: enquiryStatusEnum.optional(),
  internalNotes: z.string().trim().max(2000, 'Internal notes cannot exceed 2000 characters').optional(),
  isRead: z.boolean().optional(),
  staffMemberName: z.string().trim().optional(),
});

export const enquiryQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AppointmentEnquiryInput = z.infer<typeof appointmentEnquirySchema>;
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;
export type EnquiryQueryParams = z.infer<typeof enquiryQuerySchema>;
