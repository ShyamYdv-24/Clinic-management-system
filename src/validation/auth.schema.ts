import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const createAdminUserSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['superadmin', 'admin', 'staff']).default('admin'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
