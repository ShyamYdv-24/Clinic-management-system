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
  createPublicEnquiry,
  createPublicAppointment,
  getAdminEnquiries,
  updateEnquiryStatus,
} from './src/db/access';
import { AdminModel } from './src/db/models/Admin';
import { AppointmentModel } from './src/db/models/Appointment';
import { hashPassword } from './src/lib/password';
import { signAdminToken, verifyAdminToken } from './src/lib/auth';
import { loginSchema } from './src/validation/auth.schema';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Initialize MongoDB connection asynchronously
connectToDatabase().catch((err) => {
  console.warn('Initial MongoDB connection deferred:', err);
});

// Middleware for Admin authentication verification
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Unauthorized: Expired or invalid token' });
    return;
  }

  (req as Request & { user: typeof payload }).user = payload;
  next();
}

// ----------------- API ROUTES -----------------

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

// Admin Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.issues[0]?.message || 'Validation failed',
      });
      return;
    }

    const { email, password } = parseResult.data;

    // Check MongoDB if connected
    if (isDatabaseConnected()) {
      const admin = await AdminModel.findOne({ email: email.toLowerCase() });
      if (!admin || !admin.isActive) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const isValid = await admin.comparePassword(password);
      if (!isValid) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      admin.lastLogin = new Date();
      await admin.save();

      const token = signAdminToken({
        userId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      });

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

    // Default bootstrap admin credentials if DB is unconfigured in development
    const initialEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@om-sai-adarsha.clinic').toLowerCase();
    const initialPass = process.env.INITIAL_ADMIN_PASSWORD || 'OmSaiClinic@2026';

    if (email.toLowerCase() === initialEmail && password === initialPass) {
      const token = signAdminToken({
        userId: 'admin-bootstrap-1',
        email: initialEmail,
        role: 'superadmin',
      });

      res.json({
        success: true,
        token,
        user: {
          id: 'admin-bootstrap-1',
          email: initialEmail,
          name: 'Om Sai Clinic Administrator',
          role: 'superadmin',
        },
      });
      return;
    }

    res.status(401).json({ success: false, error: 'Invalid email or password' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Login failed';
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

  app.listen(PORT, () => {
    console.log(`Om Sai Adarsha Clinic server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
