import { z } from 'zod';

export const serviceSchema = z.object({
  title: z.string().trim().min(2, 'Service title is required'),
  slug: z.string().trim().min(2, 'Slug is required'),
  category: z.string().trim().min(2, 'Category is required'),
  summary: z.string().trim().min(10, 'Summary must be at least 10 characters'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  iconName: z.string().default('Activity'),
  imageUrl: z.string().min(1, 'Service image URL is required'),
  features: z.array(z.string()).default([]),
  estimatedDurationMinutes: z.number().int().min(5).optional(),
  priceStartingAt: z.number().min(0).optional(),
  department: z.string().min(2, 'Department is required'),
  relatedDoctorIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
