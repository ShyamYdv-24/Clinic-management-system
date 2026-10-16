import { z } from 'zod';

export const envSchema = z.object({
  MONGODB_URI: z
    .string()
    .trim()
    .regex(/^mongodb(\+srv)?:\/\/.+/, 'MONGODB_URI must be a valid mongodb:// or mongodb+srv:// connection URI')
    .optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET should be at least 16 characters for security').default('om-sai-adarsha-clinic-secret-token-fallback-2026'),
  PORT: z.string().or(z.number()).default(3000),
  INITIAL_ADMIN_EMAIL: z.string().email().default('admin@om-sai-adarsha.clinic'),
  INITIAL_ADMIN_PASSWORD: z.string().min(8).default('OmSaiClinic@2026'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): { valid: boolean; config?: EnvConfig; error?: string } {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    return { valid: false, error: errorDetails };
  }
  return { valid: true, config: result.data };
}
