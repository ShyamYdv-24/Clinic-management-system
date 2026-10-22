import { z } from 'zod';

export const faqCategoryEnum = z.enum([
  'general',
  'appointments',
  'services',
  'insurance',
  'emergency',
]);

export const faqItemSchema = z.object({
  question: z.string().trim().min(3, 'Question must be at least 3 characters'),
  answer: z.string().trim().min(5, 'Answer must be at least 5 characters'),
  category: faqCategoryEnum.default('general'),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true),
});

export type FAQItemInput = z.infer<typeof faqItemSchema>;
