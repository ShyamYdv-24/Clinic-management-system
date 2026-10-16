import { z } from 'zod';

export const enquiryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 characters')
    .max(15, 'Phone number must be at most 15 characters'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
  department: z.string().trim().optional(),
  preferredContactMethod: z.enum(['phone', 'email', 'whatsapp']).default('phone'),
});

export const enquiryUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'responded', 'resolved', 'archived']).optional(),
  isRead: z.boolean().optional(),
  internalNotes: z.string().trim().optional(),
});

export type EnquiryCreateInput = z.infer<typeof enquiryCreateSchema>;
export type EnquiryUpdateInput = z.infer<typeof enquiryUpdateSchema>;
