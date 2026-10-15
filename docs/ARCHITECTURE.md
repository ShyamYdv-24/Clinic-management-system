# Om Sai Adarsha Clinic — Architecture & System Design Document (Phase 1)

## 1. Executive Summary
This document establishes the architecture, folder structure, database models, security standards, and route hierarchy for the **Om Sai Adarsha Clinic** healthcare web portal and Administration CMS.

---

## 2. Technical Stack & Foundation

- **Frontend Core**: React 19 SPA running on Vite with TypeScript in strict mode.
- **Styling**: Tailwind CSS v4 with custom healthcare visual palette (deep emerald, teal, crisp slate, and soft medical mints).
- **Icons**: Lucide React.
- **Animation**: Motion (Framer Motion engine).
- **Backend & API Layer**: Express.js with TypeScript (`server.ts`) mounting Vite middleware for seamless unified development on Port 3000.
- **Database & ODM**: MongoDB Atlas & Mongoose (`src/db/models/`).
- **Data Validation**: Zod (`src/validation/`).
- **Security & Password Hashing**:
  - `bcryptjs` with `bcrypt.hash(password, 10)` securely executed before persisting any administrator credentials into MongoDB.
  - JSON Web Tokens (JWT) for stateless administrator session authorization.
- **Assets / Uploads**: Cloudinary integration configuration prepared.

---

## 3. Directory Structure

```
├── .env.example              # Documented environment variables (MONGODB_URI, JWT_SECRET, etc.)
├── metadata.json             # Applet metadata, branding, and capabilities
├── package.json              # Dependencies and lifecycle scripts
├── tsconfig.json             # TypeScript configuration with strict mode enabled
├── vite.config.ts            # Vite bundler configuration
├── server.ts                 # Full-stack Express server mounting Vite middlewares and API routes
├── docs/
│   └── ARCHITECTURE.md       # Architectural specifications & Phase 1 audit report
├── scripts/
│   └── seed.ts               # Database bootstrap script with secure bcrypt password hashing
└── src/
    ├── api/                  # API client and endpoints
    ├── components/
    │   ├── admin/            # Admin Layout, sidebar, stats, data tables
    │   └── common/           # Header, Footer, AppointmentModal, navigation
    ├── config/               # Clinic default data, seed doctors, specialties, FAQs, settings
    ├── context/              # React Contexts (AuthContext, ClinicContext)
    ├── db/                   # MongoDB database connection and Mongoose models
    │   ├── connect.ts        # Resilient MongoDB connector with caching
    │   └── models/
    │       ├── Admin.ts       # Admin model with pre-save bcrypt.hash(password, 10) hook
    │       ├── Doctor.ts      # Doctor entity schema
    │       ├── Service.ts     # Clinical services schema
    │       ├── Appointment.ts # Patient appointment bookings schema
    │       ├── Gallery.ts     # Clinic infrastructure gallery schema
    │       ├── FAQ.ts         # Frequently asked questions schema
    │       └── Setting.ts     # Dynamic clinic metadata, emergency lines, timings
    ├── lib/                  # Utilities, auth helpers, bcrypt helpers
    │   ├── auth.ts           # JWT sign & verify
    │   ├── password.ts       # bcrypt.hash & bcrypt.compare
    │   └── utils.ts          # Formatting, slugify, cn
    ├── pages/                # All route views
    │   ├── HomePage.tsx
    │   ├── AboutPage.tsx
    │   ├── ServicesPage.tsx
    │   ├── ServiceDetailPage.tsx (/services/:slug)
    │   ├── DoctorsPage.tsx
    │   ├── DoctorDetailPage.tsx  (/doctors/:slug)
    │   ├── GalleryPage.tsx
    │   ├── FaqPage.tsx
    │   ├── ContactPage.tsx
    │   └── admin/
    │       ├── AdminLoginPage.tsx      (/dashboard-admin/login)
    │       ├── AdminDashboardPage.tsx  (/dashboard-admin)
    │       └── AdminSettingsPage.tsx   (/dashboard-admin/settings)
    ├── routes/               # Client-side router context & Link component
    ├── types/                # TypeScript interface definitions
    └── validation/           # Zod validation schemas
        ├── auth.schema.ts
        ├── appointment.schema.ts
        ├── doctor.schema.ts
        ├── service.schema.ts
        └── settings.schema.ts
```

---

## 4. Route Coverage (Verified in Phase 1)

### Public Routes:
- `/` — Homepage with Hero, specialties preview, doctor highlights, and booking triggers.
- `/about` — Clinic history, philosophy, hygiene standards, and community healthcare mission.
- `/services` — Complete catalog of treatments and diagnostic services with department filters.
- `/services/[slug]` — Detailed medical service breakdown, procedures, and direct booking trigger.
- `/doctors` — Consulting medical faculty list with specialties, qualifications, and schedules.
- `/doctors/[slug]` — In-depth physician profile, degrees, consultation fee, and available slots.
- `/gallery` — Infrastructure, laboratory, sterile consultation rooms, and health camps.
- `/faq` — Categorized patient queries on appointments, timings, reports, and billing.
- `/contact` — Physical location, phone lines, operating hours, emergency notices, and inquiry form.

### Administration CMS Routes:
- `/dashboard-admin/login` — Secure admin authentication with credentials check.
- `/dashboard-admin` — Central CMS overview with KPIs, booking pipeline, and status updates.
- `/dashboard-admin/settings` — Configuration for clinic phone numbers, address, emergency desk, and announcement banner.

---

## 5. Security & Password Hashing Standard

As required:
- `bcryptjs` is used to hash passwords with salt factor 10.
- `src/db/models/Admin.ts` implements a Mongoose `pre('save')` hook:
  ```typescript
  AdminSchema.pre<IAdminDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
      next();
    } catch (error) {
      next(error as Error);
    }
  });
  ```
- No plain-text passwords are ever stored or exposed in responses.
- Comparison uses `bcrypt.compare` via helper `verifyPassword` or `admin.comparePassword`.
