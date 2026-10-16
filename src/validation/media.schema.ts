import { z } from 'zod';

export const mediaAssetSchema = z.object({
  title: z.string().trim().min(2, 'Asset title is required'),
  originalFileName: z.string().trim().min(1, 'Original file name is required'),
  mimeType: z.string().trim().min(1, 'Mime type is required'),
  sizeBytes: z.number().int().nonnegative(),
  url: z.string().url('A valid URL is required'),
  secureUrl: z.string().url('A valid secure URL is required'),
  publicId: z.string().trim().optional(),
  category: z.enum(['doctors', 'services', 'facilities', 'banners', 'general', 'documents']).default('general'),
  altText: z.string().trim().min(2, 'Alt text is required for accessibility'),
  dimensions: z
    .object({
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    })
    .optional(),
  tags: z.array(z.string().trim()).default([]),
});

export type MediaAssetInput = z.infer<typeof mediaAssetSchema>;
