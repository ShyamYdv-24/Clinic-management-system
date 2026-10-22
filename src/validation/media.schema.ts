import { z } from 'zod';

export const mediaCategoryEnum = z.enum([
  'logos',
  'doctors',
  'services',
  'gallery',
  'facilities',
  'banners',
  'social',
  'general',
  'documents',
]);

export type MediaCategory = z.infer<typeof mediaCategoryEnum>;

export const mediaAssetSchema = z.object({
  title: z.string().trim().min(2, 'Asset title is required'),
  originalFileName: z.string().trim().min(1, 'Original file name is required'),
  mimeType: z.string().trim().min(1, 'Mime type is required'),
  sizeBytes: z.number().int().nonnegative(),
  url: z.string().trim().min(1, 'A valid URL or path is required'),
  secureUrl: z.string().trim().min(1, 'A valid secure URL or path is required'),
  publicId: z.string().trim().optional(),
  category: mediaCategoryEnum.default('general'),
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

export const mediaUploadMetaSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').optional(),
  category: mediaCategoryEnum.default('general'),
  altText: z.string().trim().min(2, 'Alt text must be at least 2 characters').optional(),
  tags: z.array(z.string()).default([]),
});

export type MediaUploadMetaInput = z.infer<typeof mediaUploadMetaSchema>;
