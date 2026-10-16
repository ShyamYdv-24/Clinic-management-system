import { z } from 'zod';

export const navItemSchema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  href: z.string().trim().min(1, 'Link URL is required'),
  order: z.number().int().default(0),
  isExternal: z.boolean().default(false),
  children: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        href: z.string().trim().min(1),
        description: z.string().trim().optional(),
        order: z.number().int().default(0),
      })
    )
    .optional(),
});

export const navigationConfigSchema = z.object({
  identifier: z.string().default('main_navigation'),
  headerMenuItems: z.array(navItemSchema),
  footerSections: z.array(
    z.object({
      title: z.string().trim().min(1),
      order: z.number().int().default(0),
      links: z.array(
        z.object({
          label: z.string().trim().min(1),
          href: z.string().trim().min(1),
          order: z.number().int().default(0),
          isExternal: z.boolean().default(false),
        })
      ),
    })
  ),
  emergencyNotice: z.string().trim().optional(),
  appointmentCtaLabel: z.string().default('Book Appointment'),
  isPublished: z.boolean().default(true),
});

export type NavigationConfigInput = z.infer<typeof navigationConfigSchema>;
