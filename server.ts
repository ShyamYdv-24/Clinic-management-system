import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  connectToDatabase,
  isDatabaseConnected,
  checkDatabaseHealth,
} from './src/db/mongodb';
import {
  getPublicDoctors,
  getPublicDoctorBySlug,
  getPublicServices,
  getPublicServiceBySlug,
  getPublicGallery,
  getPublicFaqs,
  getPublicTestimonials,
  getPublicNavigation,
  getPublicPageBySlug,
  getSiteSettings,
  updateSiteSettings,
  createPublicEnquiry,
  createPublicAppointment,
  getAdminEnquiries,
  updateEnquiryStatus,
  getAdminOverviewStats,
  getAdminAppointments,
  checkSlugAvailability,
  getAdminDoctors,
  upsertDoctor,
  deleteDoctor,
  getAdminServices,
  upsertService,
  deleteService,
  getAdminGallery,
  upsertGalleryItem,
  deleteGalleryItem,
  getAdminFaqs,
  upsertFaqItem,
  deleteFaqItem,
  getAdminPages,
  getAdminPageBySlug,
  upsertPage,
  getAdminNavigation,
  updateAdminNavigation,
  getAdminTestimonials,
  upsertTestimonial,
  deleteTestimonial,
  getAdminMediaAssets,
  getAdminMediaAssetById,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  replaceMediaAsset,
} from './src/db/access';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import {
  getCloudinaryStatus,
  validateImageMagicBytes,
  uploadImageBuffer,
} from './src/lib/cloudinary';
import { AdminModel } from './src/db/models/Admin';
import { SessionModel } from './src/db/models/Session';
import { AppointmentModel } from './src/db/models/Appointment';
import { hashPassword, comparePassword } from './src/lib/password';
import { signAdminToken, verifyAdminToken } from './src/lib/auth';
import { loginSchema, changePasswordSchema } from './src/validation/auth.schema';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments (--port 3000 --host 0.0.0.0) or environment.
// AI Studio dev environment runs Nginx on 8080 proxying to 3000.
const args = process.argv.slice(2);
const portFlagIndex = args.indexOf('--port');
const cliPort = portFlagIndex !== -1 && args[portFlagIndex + 1] ? Number(args[portFlagIndex + 1]) : null;
const hostFlagIndex = args.indexOf('--host');
const cliHost = hostFlagIndex !== -1 && args[hostFlagIndex + 1] ? args[hostFlagIndex + 1] : '0.0.0.0';

const PORT = cliPort || (process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000);
const HOST = cliHost;
const app = express();
app.disable('x-powered-by');

// Security & Caching Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // Static uploads caching vs Admin API no-cache
  if (req.path.startsWith('/uploads/')) {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  } else if (req.path.startsWith('/api/admin/') || req.path.startsWith('/api/auth/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));

// Initialize MongoDB connection asynchronously
connectToDatabase().catch((err) => {
  console.warn('Initial MongoDB connection deferred:', err);
});

const cookieOptions: express.CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

// Middleware for Admin authentication verification
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.admin_session) {
    token = req.cookies.admin_session;
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing session or authentication token' });
    return;
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Unauthorized: Expired or invalid session token' });
    return;
  }

  // If MongoDB is connected, verify session validity and revocation in database
  if (isDatabaseConnected()) {
    try {
      const activeSession = await SessionModel.findOne({ token, isValid: true });
      if (!activeSession || activeSession.expiresAt < new Date()) {
        res.status(401).json({ success: false, error: 'Unauthorized: Session has expired or been revoked' });
        return;
      }
    } catch (e) {
      console.warn('Session database check failed, falling back to cryptographic verification:', e);
    }
  }

  (req as Request & { user: typeof payload; sessionToken?: string }).user = payload;
  (req as Request & { sessionToken?: string }).sessionToken = token;
  next();
}

// ----------------- API ROUTES -----------------

// In-memory sliding rate limiter for login attempts (15 min lockout after 5 consecutive failures)
interface RateLimitRecord {
  attempts: number;
  blockedUntil?: number;
}
const loginRateLimitMap = new Map<string, RateLimitRecord>();

function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip);
  if (!record) return { allowed: true };

  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000),
    };
  }

  if (record.blockedUntil && record.blockedUntil <= now) {
    loginRateLimitMap.delete(ip);
  }

  return { allowed: true };
}

function recordFailedLoginAttempt(ip: string): void {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip) || { attempts: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.blockedUntil = now + 15 * 60 * 1000;
  }
  loginRateLimitMap.set(ip, record);
}

function recordSuccessfulLogin(ip: string): void {
  loginRateLimitMap.delete(ip);
}

// Database & System Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  const dbHealth = checkDatabaseHealth();
  res.json({
    status: 'ok',
    clinic: 'Om Sai Adarsha Clinic API',
    database: dbHealth,
    timestamp: new Date().toISOString(),
  });
});

// Admin Login (supports password-only for clinic owner or email + password)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const rateLimit = checkLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    res.status(429).json({
      success: false,
      error: `Too many failed login attempts. Rate limit enforced. Please retry in ${rateLimit.retryAfterSeconds} seconds.`,
    });
    return;
  }

  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      recordFailedLoginAttempt(clientIp);
      res.status(400).json({
        success: false,
        error: parseResult.error.issues[0]?.message || 'Invalid credentials format',
      });
      return;
    }

    const { email, password } = parseResult.data;
    const initialEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@om-sai-adarsha.clinic').toLowerCase();
    const initialPass = process.env.INITIAL_ADMIN_PASSWORD || 'OmSaiClinic@2026';
    const targetEmail = (email || initialEmail).toLowerCase();

    // Check MongoDB if connected
    if (isDatabaseConnected()) {
      const admin = await AdminModel.findOne(
        email ? { email: targetEmail } : { isActive: true }
      ).sort({ createdAt: 1 });

      if (!admin || !admin.isActive) {
        recordFailedLoginAttempt(clientIp);
        res.status(401).json({ success: false, error: 'Invalid administrator credentials' });
        return;
      }

      const isValid = await admin.comparePassword(password);
      if (!isValid) {
        recordFailedLoginAttempt(clientIp);
        res.status(401).json({ success: false, error: 'Invalid administrator credentials' });
        return;
      }

      recordSuccessfulLogin(clientIp);
      admin.lastLogin = new Date();
      await admin.save();

      const token = signAdminToken({
        userId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      });

      // Persist active session in MongoDB
      try {
        await SessionModel.create({
          adminId: admin._id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: clientIp,
          userAgent: (req.headers['user-agent'] as string) || 'unknown',
          isValid: true,
        });
      } catch (err) {
        console.warn('Failed to record session in database:', err);
      }

      res.cookie('admin_session', token, cookieOptions);
      res.json({
        success: true,
        token,
        user: {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
      return;
    }

    // Default bootstrap admin verification if DB is unconfigured in development
    const isOwnerMatch = (!email || email.toLowerCase() === initialEmail) && password === initialPass;

    if (isOwnerMatch) {
      recordSuccessfulLogin(clientIp);
      const token = signAdminToken({
        userId: 'admin-bootstrap-1',
        email: initialEmail,
        role: 'superadmin',
      });

      res.cookie('admin_session', token, cookieOptions);
      res.json({
        success: true,
        token,
        user: {
          id: 'admin-bootstrap-1',
          email: initialEmail,
          name: 'Clinic Administrator',
          role: 'superadmin',
        },
      });
      return;
    }

    recordFailedLoginAttempt(clientIp);
    res.status(401).json({ success: false, error: 'Invalid administrator credentials' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ success: false, error: msg });
  }
});

// Admin Session Verification
app.get('/api/auth/me', requireAdmin, (req: Request, res: Response) => {
  const user = (req as Request & { user: { userId: string; email: string; role: string } }).user;
  res.json({
    success: true,
    user: {
      id: user.userId,
      email: user.email,
      role: user.role,
    },
  });
});

// Admin Logout with session invalidation
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const token = req.cookies?.admin_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);
  if (token && isDatabaseConnected()) {
    try {
      await SessionModel.updateMany({ token }, { isValid: false });
    } catch (e) {
      console.warn('Failed to invalidate session in DB:', e);
    }
  }
  res.clearCookie('admin_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Secure Admin Password Rotation
app.post('/api/auth/rotate-password', requireAdmin, async (req: Request, res: Response) => {
  const user = (req as Request & { user: { userId: string; email: string; role: string }; sessionToken?: string }).user;

  const parseResult = changePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: parseResult.error.issues[0]?.message || 'Invalid password rotation payload',
    });
    return;
  }

  const { currentPassword, newPassword } = parseResult.data;

  try {
    if (isDatabaseConnected()) {
      const admin = await AdminModel.findById(user.userId);
      if (!admin) {
        res.status(404).json({ success: false, error: 'Administrator account not found' });
        return;
      }

      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Current password verification failed' });
        return;
      }

      // Hash and update
      admin.password = await hashPassword(newPassword);
      await admin.save();

      // Revoke all prior sessions for this admin (anti-session fixation / rotation)
      await SessionModel.updateMany({ adminId: admin._id }, { isValid: false });

      // Generate fresh session token
      const newToken = signAdminToken({
        userId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      });

      // Create new session record
      await SessionModel.create({
        adminId: admin._id,
        token: newToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1',
        userAgent: (req.headers['user-agent'] as string) || 'unknown',
        isValid: true,
      });

      res.cookie('admin_session', newToken, cookieOptions);
      res.json({
        success: true,
        message: 'Administrator password rotated successfully. All previous sessions invalidated.',
        token: newToken,
      });
      return;
    }

    // In dev bootstrap fallback:
    const initialPass = process.env.INITIAL_ADMIN_PASSWORD || 'OmSaiClinic@2026';
    if (currentPassword !== initialPass) {
      res.status(401).json({ success: false, error: 'Current password verification failed' });
      return;
    }

    process.env.INITIAL_ADMIN_PASSWORD = newPassword;
    const newToken = signAdminToken({
      userId: user.userId,
      email: user.email,
      role: user.role as any,
    });

    res.cookie('admin_session', newToken, cookieOptions);
    res.json({
      success: true,
      message: 'Administrator password rotated successfully. All previous sessions invalidated.',
      token: newToken,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Password rotation failed';
    res.status(500).json({ success: false, error: msg });
  }
});

// Public Content Endpoints
app.get('/api/doctors', async (_req: Request, res: Response) => {
  try {
    const doctors = await getPublicDoctors();
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/doctors/:slug', async (req: Request, res: Response) => {
  try {
    const doctor = await getPublicDoctorBySlug(req.params.slug);
    if (!doctor) {
      res.status(404).json({ success: false, error: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/services', async (_req: Request, res: Response) => {
  try {
    const services = await getPublicServices();
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/services/:slug', async (req: Request, res: Response) => {
  try {
    const service = await getPublicServiceBySlug(req.params.slug);
    if (!service) {
      res.status(404).json({ success: false, error: 'Service not found' });
      return;
    }
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/gallery', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const gallery = await getPublicGallery(category);
    res.json({ success: true, data: gallery });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/faqs', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const faqs = await getPublicFaqs(category);
    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/testimonials', async (_req: Request, res: Response) => {
  try {
    const testimonials = await getPublicTestimonials();
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getSiteSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/navigation', async (_req: Request, res: Response) => {
  try {
    const nav = await getPublicNavigation();
    res.json({ success: true, data: nav });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/pages/:slug', async (req: Request, res: Response) => {
  try {
    const page = await getPublicPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Dynamic XML Sitemap
app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const settings = await getSiteSettings();
    const baseUrl = (process.env.APP_URL || settings.productionUrl || 'https://om-sai-adarsha.clinic').replace(/\/$/, '');
    const [doctors, services] = await Promise.all([
      getPublicDoctors().catch(() => []),
      getPublicServices().catch(() => []),
    ]);

    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'weekly' },
      { path: '/services', priority: '0.9', changefreq: 'daily' },
      { path: '/doctors', priority: '0.9', changefreq: 'daily' },
      { path: '/gallery', priority: '0.7', changefreq: 'weekly' },
      { path: '/faq', priority: '0.8', changefreq: 'weekly' },
      { path: '/contact', priority: '0.8', changefreq: 'weekly' },
    ];

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const route of staticRoutes) {
      xml += `  <url>\n    <loc>${baseUrl}${route.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
    }

    for (const doc of doctors) {
      if (doc.slug) {
        xml += `  <url>\n    <loc>${baseUrl}/doctors/${doc.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    }

    for (const srv of services) {
      if (srv.slug) {
        xml += `  <url>\n    <loc>${baseUrl}/services/${srv.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Dynamic robots.txt
app.get('/robots.txt', async (_req: Request, res: Response) => {
  try {
    const settings = await getSiteSettings();
    const baseUrl = (process.env.APP_URL || settings.productionUrl || 'https://om-sai-adarsha.clinic').replace(/\/$/, '');
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /dashboard-admin/',
      'Disallow: /api/admin/',
      'Disallow: /api/auth/',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');

    res.header('Content-Type', 'text/plain');
    res.send(robots);
  } catch (err) {
    res.status(500).send('Error generating robots.txt');
  }
});

// Rate limiting map for public forms (enquiries and appointments)
interface SubmissionRateLimit {
  count: number;
  resetAt: number;
}
const publicSubmissionsMap = new Map<string, SubmissionRateLimit>();

function checkPublicSubmissionRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = publicSubmissionsMap.get(ip);
  if (!limit || limit.resetAt < now) {
    publicSubmissionsMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 }); // 10 min window
    return true;
  }
  if (limit.count >= 30) {
    return false; // Exceeded 30 submissions per 10 minutes
  }
  limit.count += 1;
  return true;
}

// Simple HTML/XSS sanitizer for raw text inputs
function sanitizeInputString(str?: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[^\w\s.,?!@+\-–—()/'":#]/gi, '') // Strip potential script payloads / control chars
    .trim();
}

// Public Appointment Booking (with rate limiting and sanitization)
app.post('/api/appointments', async (req: Request, res: Response) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  if (!checkPublicSubmissionRateLimit(clientIp)) {
    res.status(429).json({
      success: false,
      error: 'Too many appointment requests from this connection. Please wait a few minutes before submitting again or call reception directly.',
    });
    return;
  }

  // Anti-bot honeypot check
  if (req.body.honeypot || req.body.hp_website) {
    res.status(200).json({ success: true, message: 'Request received' });
    return;
  }

  try {
    const sanitizedBody = {
      ...req.body,
      patientName: sanitizeInputString(req.body.patientName),
      patientPhone: sanitizeInputString(req.body.patientPhone),
      symptoms: sanitizeInputString(req.body.symptoms || req.body.message),
      message: sanitizeInputString(req.body.message || req.body.symptoms),
    };
    const result = await createPublicAppointment(sanitizedBody);
    res.status(201).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Booking failed';
    res.status(400).json({ success: false, error: msg });
  }
});

// Public General Enquiry (with rate limiting and sanitization)
app.post('/api/enquiries', async (req: Request, res: Response) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  if (!checkPublicSubmissionRateLimit(clientIp)) {
    res.status(429).json({
      success: false,
      error: 'Too many inquiries submitted from this connection. Please wait a few minutes before submitting again.',
    });
    return;
  }

  if (req.body.honeypot || req.body.hp_website) {
    res.status(200).json({ success: true, message: 'Inquiry received' });
    return;
  }

  try {
    const sanitizedBody = {
      ...req.body,
      patientName: sanitizeInputString(req.body.patientName || req.body.name),
      patientPhone: sanitizeInputString(req.body.patientPhone || req.body.phone),
      email: sanitizeInputString(req.body.email),
      message: sanitizeInputString(req.body.message),
    };
    const result = await createPublicEnquiry(sanitizedBody);
    res.status(201).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Enquiry submission failed';
    res.status(400).json({ success: false, error: msg });
  }
});

// Admin Protected Routes
app.get('/api/admin/enquiries', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const enquiries = await getAdminEnquiries(status);
    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.patch('/api/admin/enquiries/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await updateEnquiryStatus(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Enquiry not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin Overview Statistics (real database metrics)
app.get('/api/admin/overview-stats', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const stats = await getAdminOverviewStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin Appointments List
app.get('/api/admin/appointments', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const appointments = await getAdminAppointments(status);
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin Appointment Status Mutation
app.patch('/api/admin/appointments/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    if (isDatabaseConnected()) {
      const updatePayload: Record<string, unknown> = {};
      if (status) updatePayload.status = status;
      if (notes !== undefined) updatePayload.notes = notes;
      const updated = await AppointmentModel.findByIdAndUpdate(req.params.id, { $set: updatePayload }, { new: true });
      if (!updated) {
        res.status(404).json({ success: false, error: 'Appointment not found' });
        return;
      }
      res.json({ success: true, data: updated });
      return;
    }
    res.json({ success: true, message: 'Status updated (local mode)' });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin Appointment Delete
app.delete('/api/admin/appointments/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    if (isDatabaseConnected()) {
      await AppointmentModel.findByIdAndDelete(req.params.id);
    }
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin Update Global Settings (Persists to MongoDB)
const handleUpdateSettings = async (req: Request, res: Response) => {
  try {
    const updated = await updateSiteSettings(req.body);
    res.json({
      success: true,
      message: 'Global clinic settings updated and persisted successfully',
      data: updated,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update settings';
    res.status(400).json({ success: false, error: msg });
  }
};

app.put('/api/admin/settings', requireAdmin, handleUpdateSettings);
app.post('/api/admin/settings', requireAdmin, handleUpdateSettings);

app.post('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'email, password, and name are required' });
      return;
    }

    if (isDatabaseConnected()) {
      const hashedPassword = await hashPassword(password);
      const newAdmin = await AdminModel.create({
        email,
        password: hashedPassword,
        name,
        role: role || 'admin',
      });

      res.status(201).json({
        success: true,
        user: {
          id: newAdmin._id.toString(),
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
        },
      });
      return;
    }

    res.status(200).json({ success: true, message: 'Simulated admin creation in dev mode' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'User creation failed';
    res.status(500).json({ success: false, error: msg });
  }
});

// ==================== ADMINISTRATIVE CRUD ENDPOINTS ====================

// Check Slug Availability
app.get('/api/admin/check-slug', requireAdmin, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as 'doctor' | 'service' | 'page';
    const slug = req.query.slug as string;
    const excludeId = req.query.excludeId as string | undefined;
    if (!type || !slug) {
      res.status(400).json({ success: false, error: 'type and slug query parameters are required' });
      return;
    }
    const result = await checkSlugAvailability(type, slug, excludeId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Doctors CRUD
app.get('/api/admin/doctors', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const doctors = await getAdminDoctors();
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/admin/doctors/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const doctors = await getAdminDoctors();
    const doc = doctors.find((d) => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.post('/api/admin/doctors', requireAdmin, async (req: Request, res: Response) => {
  try {
    const doctor = await upsertDoctor(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.put('/api/admin/doctors/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const doctor = await upsertDoctor(req.body, req.params.id);
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.delete('/api/admin/doctors/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await deleteDoctor(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Services CRUD
app.get('/api/admin/services', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const services = await getAdminServices();
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/admin/services/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const services = await getAdminServices();
    const service = services.find((s) => s.id === req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.post('/api/admin/services', requireAdmin, async (req: Request, res: Response) => {
  try {
    const service = await upsertService(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.put('/api/admin/services/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const service = await upsertService(req.body, req.params.id);
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.delete('/api/admin/services/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await deleteService(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Gallery CRUD
app.get('/api/admin/gallery', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const items = await getAdminGallery();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.post('/api/admin/gallery', requireAdmin, async (req: Request, res: Response) => {
  try {
    const item = await upsertGalleryItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.put('/api/admin/gallery/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const item = await upsertGalleryItem(req.body, req.params.id);
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.delete('/api/admin/gallery/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await deleteGalleryItem(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// FAQ CRUD
app.get('/api/admin/faqs', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const faqs = await getAdminFaqs();
    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.post('/api/admin/faqs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const faq = await upsertFaqItem(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.put('/api/admin/faqs/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const faq = await upsertFaqItem(req.body, req.params.id);
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.delete('/api/admin/faqs/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await deleteFaqItem(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Pages & Sections CRUD
app.get('/api/admin/pages', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const pages = await getAdminPages();
    res.json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/admin/pages/:slug', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = await getAdminPageBySlug(req.params.slug);
    if (!page) {
      res.status(404).json({ success: false, error: 'Page not found' });
      return;
    }
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.put('/api/admin/pages/:slug', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = await upsertPage(req.params.slug, req.body);
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// Navigation & Footer CRUD
app.get('/api/admin/navigation', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const nav = await getAdminNavigation();
    res.json({ success: true, data: nav });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.put('/api/admin/navigation', requireAdmin, async (req: Request, res: Response) => {
  try {
    const nav = await updateAdminNavigation(req.body);
    res.json({ success: true, data: nav, message: 'Navigation updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// Testimonials CRUD
app.get('/api/admin/testimonials', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const testimonials = await getAdminTestimonials();
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.post('/api/admin/testimonials', requireAdmin, async (req: Request, res: Response) => {
  try {
    const testimonial = await upsertTestimonial(req.body);
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.put('/api/admin/testimonials/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const testimonial = await upsertTestimonial(req.body, req.params.id);
    res.json({ success: true, data: testimonial });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

app.delete('/api/admin/testimonials/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await deleteTestimonial(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ===================== MEDIA LIBRARY API =====================

// Status check (Cloudinary vs Local Fallback)
app.get('/api/admin/media/status', requireAdmin, async (_req: Request, res: Response) => {
  res.json({ success: true, ...getCloudinaryStatus() });
});

// List media assets
app.get('/api/admin/media', requireAdmin, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const assets = await getAdminMediaAssets({ category, search });
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Get media asset by id
app.get('/api/admin/media/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const asset = await getAdminMediaAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Media asset not found.' });
    }
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Upload media asset
app.post('/api/admin/media/upload', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded. Please select an image.' });
    }

    // Server-side file content inspection via magic bytes (Never trust client MIME alone)
    const validation = validateImageMagicBytes(file.buffer);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error || 'The uploaded file signature does not match a supported image format.',
      });
    }

    const title = (req.body.title || file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')).trim();
    const category = req.body.category || 'general';
    const altText = (req.body.altText || title).trim();
    let tags: string[] = [];
    if (typeof req.body.tags === 'string') {
      tags = req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    } else if (Array.isArray(req.body.tags)) {
      tags = req.body.tags;
    }

    // Upload to Cloudinary (or local fallback)
    const uploadResult = await uploadImageBuffer(file.buffer, {
      fileName: file.originalname,
      tags: [category, ...tags],
    });

    const asset = await createMediaAsset({
      title,
      originalFileName: file.originalname,
      mimeType: validation.detectedMime || file.mimetype,
      sizeBytes: file.size,
      url: uploadResult.url,
      secureUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      category,
      altText,
      dimensions: {
        width: uploadResult.width,
        height: uploadResult.height,
      },
      tags,
    });

    res.status(201).json({
      success: true,
      data: asset,
      storageProvider: uploadResult.storageProvider,
      message: 'Media asset uploaded successfully.',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// Replace existing media asset file (cascades to all referencing content to prevent broken images)
app.post('/api/admin/media/:id/replace', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No replacement file provided.' });
    }

    const validation = validateImageMagicBytes(file.buffer);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error || 'The replacement file signature does not match a supported image format.',
      });
    }

    const uploadResult = await uploadImageBuffer(file.buffer, {
      fileName: file.originalname,
    });

    const result = await replaceMediaAsset(req.params.id, {
      url: uploadResult.url,
      secureUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      sizeBytes: file.size,
      mimeType: validation.detectedMime || file.mimetype,
      originalFileName: file.originalname,
      dimensions: {
        width: uploadResult.width,
        height: uploadResult.height,
      },
    });

    res.json({
      success: true,
      data: result.asset,
      updatedReferences: result.updatedReferences,
      message: `Image replaced successfully. Updated ${result.updatedReferences.length} referencing content records.`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// Update media asset metadata
app.put('/api/admin/media/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await updateMediaAsset(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Media asset not found.' });
    }
    res.json({ success: true, data: updated, message: 'Media metadata updated successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// Delete media asset (with usage protection)
app.delete('/api/admin/media/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true';
    const result = await deleteMediaAsset(req.params.id, force);
    res.json(result);
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({
      success: false,
      error: err.message,
      usages: err.usages || [],
    });
  }
});

// ===================== SEO MANAGEMENT API =====================

app.get('/api/admin/seo', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const settings = await getSiteSettings();
    const [doctors, services] = await Promise.all([
      getPublicDoctors().catch(() => []),
      getPublicServices().catch(() => []),
    ]);
    const baseUrl = (process.env.APP_URL || settings.productionUrl || 'https://om-sai-adarsha.clinic').replace(/\/$/, '');

    res.json({
      success: true,
      data: {
        metaTitle: settings.metaTitle || 'Om Sai Adarsha Clinic — Comprehensive Healthcare & Diagnostics',
        metaDescription:
          settings.metaDescription ||
          'Expert doctor consultations, automated pathology lab tests, and 24x7 emergency medical assistance in Bengaluru.',
        defaultOgImage: settings.defaultOgImage || settings.mainLogoUrl || '',
        productionUrl: baseUrl,
        searchConsoleVerification: settings.searchConsoleVerification || '',
        analyticsId: settings.analyticsId || '',
        keywords: [
          'Clinic in Bengaluru',
          'General Physician',
          'Pediatric Care',
          'Pathology Lab',
          'OPD Appointment',
          'Doctor Consultation',
        ],
        sitemapUrl: `${baseUrl}/sitemap.xml`,
        robotsUrl: `${baseUrl}/robots.txt`,
        indexedPagesCount: 7 + doctors.length + services.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.put('/api/admin/seo', requireAdmin, async (req: Request, res: Response) => {
  try {
    const current = await getSiteSettings();
    const updated = await updateSiteSettings({
      ...current,
      metaTitle: req.body.metaTitle ?? current.metaTitle,
      metaDescription: req.body.metaDescription ?? current.metaDescription,
      defaultOgImage: req.body.defaultOgImage ?? current.defaultOgImage,
      productionUrl: req.body.productionUrl ?? current.productionUrl,
      searchConsoleVerification: req.body.searchConsoleVerification ?? current.searchConsoleVerification,
      analyticsId: req.body.analyticsId ?? current.analyticsId,
    });
    res.json({ success: true, data: updated, message: 'SEO configuration saved successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// ----------------- VITE MIDDLEWARE / SPA STATIC -----------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Om Sai Adarsha Clinic server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
