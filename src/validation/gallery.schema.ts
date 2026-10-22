import { z } from 'zod';

export const galleryCategoryEnum = z.enum([
  'facilities',
  'laboratories',
  'consultation',
  'equipment',
  'events',
  'team',
]);

export const galleryItemSchema = z.object({
  title: z.string().trim().min(2, 'Title or caption is required'),
  category: galleryCategoryEnum.default('facilities'),
  imageUrl: z.string().trim().min(1, 'Image URL is required'),
  description: z.string().trim().optional(),
  featured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
