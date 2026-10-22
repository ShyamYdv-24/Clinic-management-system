import { z } from 'zod';

export const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Doctor name is required'),
  slug: z.string().trim().min(2, 'Slug is required'),
  specialty: z.string().trim().min(2, 'Specialty is required'),
  department: z.string().trim().min(2, 'Department is required'),
  qualifications: z.array(z.string()).min(1, 'At least one qualification required'),
  experienceYears: z.number().int().min(0, 'Experience must be 0 or more'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  consultationFee: z.number().min(0, 'Consultation fee must be non-negative'),
  availableDays: z.array(z.string()).min(1, 'Select at least one day'),
  availableTimeSlots: z.array(z.string()).min(1, 'Select at least one time slot'),
  avatarUrl: z.string().min(1, 'Doctor image URL is required'),
  contactEmail: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  languages: z.array(z.string()).default([]),
  relatedServiceIds: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type DoctorInput = z.infer<typeof doctorSchema>;
