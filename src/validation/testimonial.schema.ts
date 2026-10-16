import { z } from 'zod';

export const testimonialSchema = z.object({
  patientName: z.string().trim().min(2, 'Patient name is required (min 2 characters)'),
  patientInitials: z.string().trim().max(4).optional(),
  rating: z.number().int().min(1).max(5).default(5),
  review: z.string().trim().min(10, 'Review text must be at least 10 characters'),
  treatmentCategory: z.string().trim().optional(),
  doctorName: z.string().trim().optional(),
  serviceTitle: z.string().trim().optional(),
  isVerified: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  order: z.number().int().default(0),
  date: z.string().optional(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
