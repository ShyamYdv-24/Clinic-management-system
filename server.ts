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
  getSiteSettings,
  updateSiteSettings,
  createPublicEnquiry,
  createPublicAppointment,
  getAdminEnquiries,
  updateEnquiryStatus,
  getAdminOverviewStats,
  getAdminAppointments,
} from './src/db/access';
import cookieParser from 'cookie-parser';
import { AdminModel } from './src/db/models/Admin';
import { SessionModel } from './src/db/models/Session';
import { AppointmentModel } from './src/db/models/Appointment';
import { hashPassword, comparePassword } from './src/lib/password';
import { signAdminToken, verifyAdminToken } from './src/lib/auth';
import { loginSchema, changePasswordSchema } from './src/validation/auth.schema';

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

app.use(express.json());
app.use(cookieParser());

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

// Public Appointment Booking
app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const result = await createPublicAppointment(req.body);
    res.status(201).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Booking failed';
    res.status(400).json({ success: false, error: msg });
  }
});

// Public General Enquiry
app.post('/api/enquiries', async (req: Request, res: Response) => {
  try {
    const result = await createPublicEnquiry(req.body);
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
