import { z } from 'zod';

export const pageSectionSchema = z.object({
  sectionKey: z.string().trim().min(2, 'Section key is required'),
  heading: z.string().trim().optional(),
  subheading: z.string().trim().optional(),
  content: z.string().optional(),
  mediaUrl: z.string().trim().optional(),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(true),
  extraData: z.record(z.string(), z.unknown()).optional(),
});

export const pageSchema = z.object({
  slug: z.string().trim().min(1, 'Page slug is required'),
  title: z.string().trim().min(2, 'Page title is required'),
  metaTitle: z.string().trim().optional(),
  metaDescription: z.string().trim().optional(),
  sections: z.array(pageSectionSchema).default([]),
  isPublished: z.boolean().default(true),
});

export type PageInput = z.infer<typeof pageSchema>;
