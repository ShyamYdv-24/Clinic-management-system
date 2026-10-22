import mongoose from 'mongoose';
import { connectToDatabase } from './mongodb';
import {
  AdminModel,
  DoctorModel,
  ServiceModel,
  GalleryModel,
  FAQModel,
  SiteSettingsModel,
  AppointmentModel,
  TestimonialModel,
  NavigationModel,
  EnquiryModel,
  PageModel,
  MediaAssetModel,
} from './models';
import {
  enquiryCreateSchema,
  appointmentBookingSchema,
  appointmentEnquirySchema,
  updateEnquiryStatusSchema,
  enquiryQuerySchema,
  doctorSchema,
  DoctorInput,
  serviceSchema,
  ServiceInput,
  testimonialSchema,
  TestimonialInput,
  clinicSettingsSchema,
  galleryItemSchema,
  GalleryItemInput,
  faqItemSchema,
  FAQItemInput,
  pageSchema,
  PageInput,
  navigationConfigSchema,
  NavigationConfigInput,
  mediaAssetSchema,
  MediaAssetInput,
} from '../validation';
import { deleteImageByPublicId } from '../lib/cloudinary';
import {
  initialClinicSettings,
  initialDoctors,
  initialServices,
  initialFAQs,
  initialGallery,
} from '../config/clinicData';
import { GalleryItem, FAQItem, ClinicSettings } from '../types/clinic';

// Safe server-side check
function assertServerEnvironment() {
  if (typeof window !== 'undefined') {
    throw new Error('Database access operations are restricted to server-side environments.');
  }
}

/**
 * =========================================================================
 * PUBLIC CONTENT QUERIES (Published only, safe projection, no private fields)
 * =========================================================================
 */

// Active in-memory caches initialized with seed data for fallback & offline development
let activeDoctorsCache: any[] = initialDoctors.map((d) => ({
  ...d,
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

let activeServicesCache: any[] = initialServices.map((s) => ({
  ...s,
  isPublished: true,
  isActive: s.isActive !== undefined ? s.isActive : true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

let activeGalleryCache: any[] = initialGallery.map((g) => ({
  ...g,
  isPublished: true,
  createdAt: new Date().toISOString(),
}));

let activeFaqsCache: any[] = initialFAQs.map((f) => ({
  ...f,
  isPublished: true,
  isActive: f.isActive !== undefined ? f.isActive : true,
  createdAt: new Date().toISOString(),
}));

const defaultPagesSeed: Array<PageInput & { id: string }> = [
  {
    id: 'page-home',
    slug: 'home',
    title: 'Homepage',
    metaTitle: 'Om Sai Adarsha Clinic — Family Healthcare & Diagnostic Clinic in Bengaluru',
    metaDescription: 'Trusted outpatient consultations, comprehensive pathology diagnostics, and emergency triage in Bengaluru.',
    isPublished: true,
    sections: [
      {
        sectionKey: 'hero',
        heading: 'Dedicated Healthcare, Compassionate Clinical Care',
        subheading: 'Experienced family medicine physicians and high-precision laboratory diagnostics.',
        content: 'Om Sai Adarsha Clinic provides dedicated outpatient specialist consultations, computerized laboratory diagnostics, and 24x7 emergency first-aid triage in Bengaluru.',
        order: 1,
        isPublished: true,
      },
      {
        sectionKey: 'introduction',
        heading: 'Welcome to Om Sai Adarsha Clinic',
        subheading: 'Ethical Medical Practice Since 2012',
        content: 'Our clinic offers multi-specialty outpatient consultations with experienced medical practitioners, focusing on direct physician-patient communication.',
        order: 2,
        isPublished: true,
      },
      {
        sectionKey: 'features',
        heading: 'Why Families Choose Our Care',
        subheading: 'Advanced clinical equipment and caring medical staff',
        content: 'From comprehensive health packages to specialized pediatrics and cardiology.',
        order: 3,
        isPublished: true,
      },
      {
        sectionKey: 'cta',
        heading: 'Need Medical Consultation or Same-Day Health Checkup?',
        subheading: 'Consult our senior specialists or schedule diagnostic tests with rapid electronic report delivery.',
        content: 'Call our emergency response desk or book an appointment online.',
        order: 4,
        isPublished: true,
      },
    ],
  },
  {
    id: 'page-about',
    slug: 'about',
    title: 'About Us',
    metaTitle: 'About Om Sai Adarsha Clinic — Medical Leadership & Clinical Standards',
    metaDescription: 'Discover our mission, ethical standards, medical technology, and community healthcare initiatives.',
    isPublished: true,
    sections: [
      {
        sectionKey: 'about_hero',
        heading: 'About Om Sai Adarsha Clinic',
        subheading: 'Committed to delivering evidence-based outpatient consultations and compassionate care.',
        content: 'Founded with a vision to provide accessible, patient-centered healthcare.',
        order: 1,
        isPublished: true,
      },
      {
        sectionKey: 'mission',
        heading: 'Our Medical Ethics & Philosophy',
        content: 'Transparent medical guidance, thorough evaluations, and tailored diagnostic pathways.',
        order: 2,
        isPublished: true,
      },
    ],
  },
  {
    id: 'page-contact',
    slug: 'contact',
    title: 'Contact & Location',
    metaTitle: 'Contact Om Sai Adarsha Clinic — Appointment Line & Address',
    metaDescription: 'Get in touch with our reception desk, emergency response unit, or find clinic directions.',
    isPublished: true,
    sections: [
      {
        sectionKey: 'contact_hero',
        heading: 'Reach Our Healthcare Desk',
        subheading: '24x7 Emergency line, general outpatient booking, and physical directions.',
        content: 'Conveniently located in Bengaluru with direct road connectivity and patient parking.',
        order: 1,
        isPublished: true,
      },
    ],
  },
];

let activePagesCache = [...defaultPagesSeed];

const defaultNavigationData: NavigationConfigInput = {
  identifier: 'main_navigation',
  headerMenuItems: [
    { label: 'Home', href: '/', order: 1, isExternal: false },
    { label: 'About', href: '/about', order: 2, isExternal: false },
    { label: 'Services', href: '/services', order: 3, isExternal: false },
    { label: 'Doctors', href: '/doctors', order: 4, isExternal: false },
    { label: 'Gallery', href: '/gallery', order: 5, isExternal: false },
    { label: 'FAQ', href: '/faq', order: 6, isExternal: false },
    { label: 'Contact', href: '/contact', order: 7, isExternal: false },
  ],
  footerSections: [
    {
      title: 'Quick Links',
      order: 1,
      links: [
        { label: 'About Clinic', href: '/about', order: 1, isExternal: false },
        { label: 'Our Specialists', href: '/doctors', order: 2, isExternal: false },
        { label: 'Clinical Services', href: '/services', order: 3, isExternal: false },
        { label: 'Diagnostic Lab', href: '/services/pathology-diagnostics', order: 4, isExternal: false },
        { label: 'Frequently Asked Questions', href: '/faq', order: 5, isExternal: false },
      ],
    },
    {
      title: 'Patient Care',
      order: 2,
      links: [
        { label: 'Book Appointment', href: '#book', order: 1, isExternal: false },
        { label: '24x7 Emergency Desk', href: '/contact', order: 2, isExternal: false },
        { label: 'Facilities Gallery', href: '/gallery', order: 3, isExternal: false },
        { label: 'Contact & Directions', href: '/contact', order: 4, isExternal: false },
      ],
    },
  ],
  emergencyNotice: 'Emergency department and 24x7 triage remain operational on all public holidays.',
  appointmentCtaLabel: 'Book Appointment',
  isPublished: true,
};

let activeNavigationCache = { ...defaultNavigationData };
let activeTestimonialsCache: any[] = [];

// In-memory sliding window IP rate limiter (Phase 9 Spam Prevention)
const ipSubmissionTracker = new Map<string, number[]>();

export function checkIpRateLimit(ip: string = '127.0.0.1', maxRequests: number = 6, windowMs: number = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = (ipSubmissionTracker.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  ipSubmissionTracker.set(ip, timestamps);
  return true;
}

let activeEnquiriesCache: any[] = [
  {
    id: 'enq-sample-1',
    referenceNumber: 'OSA-2026-91042',
    patientName: 'Ananya Mohanty',
    patientPhone: '+91 98610 12345',
    preferredDate: '2026-10-25',
    preferredTimeSlot: '10:00 AM - 12:00 PM',
    doctorId: 'doc-1',
    doctorName: 'Dr. Suresh Kumar, M.D.',
    serviceId: 'srv-1',
    serviceTitle: 'General & Preventive Medicine',
    message: 'Experiencing recurrent seasonal cough and mild throat irritation for the past 3 days.',
    consentGiven: true,
    consentTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'new',
    isRead: false,
    internalNotes: '',
    history: [
      {
        status: 'new',
        note: 'Appointment enquiry submitted via website booking modal.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedBy: 'Patient',
      },
    ],
    source: 'appointment_modal',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'enq-sample-2',
    referenceNumber: 'OSA-2026-88124',
    patientName: 'Bikram Keshari Sahoo',
    patientPhone: '+91 94370 67890',
    preferredDate: '2026-10-26',
    preferredTimeSlot: '05:30 PM - 07:30 PM',
    doctorId: 'doc-2',
    doctorName: 'Dr. Anjali Ray, DNB',
    serviceId: 'srv-2',
    serviceTitle: 'Pediatric Care & Vaccinations',
    message: 'Routine 9-month immunization booster inquiry for child.',
    consentGiven: true,
    consentTimestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: 'contacted',
    isRead: true,
    internalNotes: 'Contacted patient via WhatsApp; shared pediatric vaccination chart. Awaiting patient confirmation.',
    history: [
      {
        status: 'new',
        note: 'Appointment enquiry submitted via website booking modal.',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        updatedBy: 'Patient',
      },
      {
        status: 'contacted',
        note: 'Reception desk called patient mobile; WhatsApp booster schedule sent.',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        updatedBy: 'FrontDesk Staff',
      },
    ],
    source: 'appointment_modal',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'enq-sample-3',
    referenceNumber: 'OSA-2026-74911',
    patientName: 'Sunita Rout',
    patientPhone: '+91 99380 45678',
    preferredDate: '2026-10-24',
    preferredTimeSlot: '11:30 AM - 01:30 PM',
    doctorId: 'doc-1',
    doctorName: 'Dr. Suresh Kumar, M.D.',
    serviceId: 'srv-3',
    serviceTitle: 'Diabetes & Metabolic Health',
    message: 'Follow-up consultation for HbA1c 3-month review with latest fasting reports.',
    consentGiven: true,
    consentTimestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'confirmed',
    isRead: true,
    internalNotes: 'Token #14 allocated for morning OPD slot. Patient instructed to bring physical lab reports.',
    history: [
      {
        status: 'new',
        note: 'Appointment enquiry submitted via website booking modal.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedBy: 'Patient',
      },
      {
        status: 'contacted',
        note: 'Spoke with patient; verified fasting status.',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        updatedBy: 'FrontDesk Staff',
      },
      {
        status: 'confirmed',
        note: 'Token #14 allocated for Dr. Suresh Kumar consultation on 24-Oct morning.',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        updatedBy: 'FrontDesk Staff',
      },
    ],
    source: 'appointment_modal',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 'enq-sample-4',
    referenceNumber: 'OSA-2026-62019',
    patientName: 'Ramesh Chandra Nayak',
    patientPhone: '+91 97760 34567',
    preferredDate: '2026-10-20',
    preferredTimeSlot: '09:30 AM - 11:30 AM',
    doctorId: 'doc-1',
    doctorName: 'Dr. Suresh Kumar, M.D.',
    serviceId: 'srv-1',
    serviceTitle: 'General Consultation',
    message: 'General health checkup completed.',
    consentGiven: true,
    consentTimestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'closed',
    isRead: true,
    internalNotes: 'Consultation concluded; prescription issued and blood pressure recorded.',
    history: [
      {
        status: 'new',
        note: 'Enquiry submitted.',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedBy: 'Patient',
      },
      {
        status: 'confirmed',
        note: 'Appointment confirmed.',
        timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
        updatedBy: 'FrontDesk Staff',
      },
      {
        status: 'closed',
        note: 'Patient visited OPD; consultation completed.',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedBy: 'FrontDesk Staff',
      },
    ],
    source: 'appointment_modal',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

const initialMediaAssets: Array<MediaAssetInput & { id: string; createdAt: string; updatedAt: string }> = [
  {
    id: 'media-logo-1',
    title: 'Om Sai Adarsha Clinic Official Vector Logo',
    originalFileName: 'om-sai-logo.svg',
    mimeType: 'image/svg+xml',
    sizeBytes: 24500,
    url: '/assets/om-sai-logo.svg',
    secureUrl: '/assets/om-sai-logo.svg',
    publicId: 'local_om_sai_logo',
    category: 'logos',
    altText: 'Om Sai Adarsha Clinic Logo - Ethical Healthcare Since 2012',
    dimensions: { width: 512, height: 128 },
    tags: ['logo', 'branding', 'official', 'header'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-doc-1',
    title: 'Dr. Suresh Kumar M.D. - Profile Photograph',
    originalFileName: 'dr-suresh-kumar.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 185400,
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    secureUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    publicId: 'local_dr_suresh_kumar',
    category: 'doctors',
    altText: 'Dr. Suresh Kumar M.D. Consultant Physician and Diabetologist',
    dimensions: { width: 800, height: 1000 },
    tags: ['physician', 'doctor', 'internal-medicine', 'faculty'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-doc-2',
    title: 'Dr. Ananya Sharma M.D. - Profile Photograph',
    originalFileName: 'dr-ananya-sharma.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 172300,
    url: 'https://images.unsplash.com/photo-1594824813589-3221b5b5c92c?auto=format&fit=crop&w=800&q=80',
    secureUrl: 'https://images.unsplash.com/photo-1594824813589-3221b5b5c92c?auto=format&fit=crop&w=800&q=80',
    publicId: 'local_dr_ananya_sharma',
    category: 'doctors',
    altText: 'Dr. Ananya Sharma M.D. Consultant Pediatrician',
    dimensions: { width: 800, height: 1000 },
    tags: ['pediatrician', 'doctor', 'pediatrics', 'faculty'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-doc-3',
    title: 'Dr. Vikramaditya K. - Profile Photograph',
    originalFileName: 'dr-vikramaditya.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 198000,
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80',
    secureUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80',
    publicId: 'local_dr_vikramaditya',
    category: 'doctors',
    altText: 'Dr. Vikramaditya K. Consultant Cardiologist and Physician',
    dimensions: { width: 800, height: 1000 },
    tags: ['cardiologist', 'doctor', 'cardiology', 'faculty'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-srv-1',
    title: 'Pathology & Diagnostic Laboratory Service Banner',
    originalFileName: 'pathology-diagnostics.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 245000,
    url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80',
    secureUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80',
    publicId: 'local_srv_pathology',
    category: 'services',
    altText: 'Automated diagnostic pathology analyzers and clinical testing suite',
    dimensions: { width: 1000, height: 667 },
    tags: ['service', 'diagnostics', 'laboratory', 'blood-test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-srv-2',
    title: 'Comprehensive General Medicine Service Banner',
    originalFileName: 'general-medicine.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 220000,
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80',
    secureUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80',
    publicId: 'local_srv_general_medicine',
    category: 'services',
    altText: 'General physician consultation suite and patient examination apparatus',
    dimensions: { width: 1000, height: 667 },
    tags: ['service', 'consultation', 'general-medicine'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-gal-1',
    title: 'Clinic Waiting Area and Reception Lounge',
    originalFileName: 'clinic-reception.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 310000,
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
    secureUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
    publicId: 'local_gal_reception',
    category: 'gallery',
    altText: 'Clean, spacious outpatient waiting lounge at Om Sai Adarsha Clinic',
    dimensions: { width: 1000, height: 667 },
    tags: ['gallery', 'facility', 'reception', 'waiting-area'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-social-1',
    title: 'Social Share Card OpenGraph Banner',
    originalFileName: 'og-banner-om-sai.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 412000,
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&h=630&q=80',
    secureUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&h=630&q=80',
    publicId: 'local_social_og_banner',
    category: 'social',
    altText: 'Om Sai Adarsha Clinic — Family Healthcare & Diagnostic Clinic Bengaluru',
    dimensions: { width: 1200, height: 630 },
    tags: ['social', 'opengraph', 'twitter-card', 'seo'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let activeMediaCache = [...initialMediaAssets];

/**
 * =========================================================================
 * PUBLIC CONTENT QUERIES (Published only, safe projection, no private fields)
 * =========================================================================
 */

export async function getPublicDoctors() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeDoctorsCache
      .filter((d) => d.isPublished)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const docs = await DoctorModel.find({ isPublished: true })
    .sort({ order: 1, name: 1 })
    .select('-__v')
    .lean();

  if (docs.length === 0) {
    return activeDoctorsCache.filter((d) => d.isPublished);
  }

  return docs.map((d) => ({
    ...d,
    id: d._id.toString(),
  }));
}

export async function getPublicDoctorBySlug(slug: string) {
  assertServerEnvironment();
  const cleanSlug = slug.toLowerCase().trim();
  const conn = await connectToDatabase();
  if (!conn) {
    const doc = activeDoctorsCache.find((d) => d.slug === cleanSlug && d.isPublished);
    if (!doc) return null;
    const related = (doc.relatedServiceIds || [])
      .map((sid: string) => activeServicesCache.find((s) => (s.id === sid || s.slug === sid) && s.isPublished))
      .filter(Boolean);
    return {
      ...doc,
      relatedServiceIds: related,
    };
  }

  const doc = await DoctorModel.findOne({ slug: cleanSlug, isPublished: true })
    .populate('relatedServiceIds', 'title slug department category')
    .select('-__v')
    .lean();

  if (!doc) {
    const fallback = activeDoctorsCache.find((d) => d.slug === cleanSlug && d.isPublished);
    return fallback || null;
  }

  return {
    ...doc,
    id: doc._id.toString(),
  };
}

export async function getPublicServices() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeServicesCache
      .filter((s) => s.isPublished && s.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const services = await ServiceModel.find({ isPublished: true, isActive: true })
    .sort({ order: 1, title: 1 })
    .select('-__v')
    .lean();

  if (services.length === 0) {
    return activeServicesCache.filter((s) => s.isPublished && s.isActive !== false);
  }

  return services.map((s) => ({
    ...s,
    id: s._id.toString(),
  }));
}

export async function getPublicServiceBySlug(slug: string) {
  assertServerEnvironment();
  const cleanSlug = slug.toLowerCase().trim();
  const conn = await connectToDatabase();
  if (!conn) {
    const service = activeServicesCache.find((s) => s.slug === cleanSlug && s.isPublished);
    if (!service) return null;
    const related = (service.relatedDoctorIds || [])
      .map((did: string) => activeDoctorsCache.find((d) => (d.id === did || d.slug === did) && d.isPublished))
      .filter(Boolean);
    return {
      ...service,
      relatedDoctorIds: related,
    };
  }

  const service = await ServiceModel.findOne({ slug: cleanSlug, isPublished: true })
    .populate('relatedDoctorIds', 'name slug specialty department avatarUrl')
    .select('-__v')
    .lean();

  if (!service) {
    const fallback = activeServicesCache.find((s) => s.slug === cleanSlug && s.isPublished);
    return fallback || null;
  }

  return {
    ...service,
    id: service._id.toString(),
  };
}

export async function getPublicGallery(category?: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeGalleryCache
      .filter((g) => g.isPublished && (!category || category === 'all' || g.category === category))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const query: Record<string, unknown> = { isPublished: true };
  if (category && category !== 'all') {
    query.category = category;
  }

  const items = await GalleryModel.find(query).sort({ order: 1, createdAt: -1 }).select('-__v').lean();

  if (items.length === 0 && (!category || category === 'all')) {
    return activeGalleryCache.filter((g) => g.isPublished);
  }

  return items.map((i) => ({
    ...i,
    id: i._id.toString(),
  }));
}

export async function getPublicFaqs(category?: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeFaqsCache
      .filter((f) => f.isPublished && f.isActive !== false && (!category || category === 'all' || f.category === category))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const query: Record<string, unknown> = { isPublished: true, isActive: true };
  if (category && category !== 'all') {
    query.category = category;
  }

  const faqs = await FAQModel.find(query).sort({ order: 1 }).select('-__v').lean();

  if (faqs.length === 0 && (!category || category === 'all')) {
    return activeFaqsCache.filter((f) => f.isPublished && f.isActive !== false);
  }

  return faqs.map((f) => ({
    ...f,
    id: f._id.toString(),
  }));
}

export async function getPublicTestimonials() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeTestimonialsCache
      .filter((t) => t.isPublished && t.isVerified)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const testimonials = await TestimonialModel.find({ isPublished: true, isVerified: true })
    .sort({ order: 1, createdAt: -1 })
    .select('-__v')
    .lean();

  if (testimonials.length === 0) {
    return activeTestimonialsCache.filter((t) => t.isPublished && t.isVerified);
  }

  return testimonials.map((t) => ({
    ...t,
    id: t._id.toString(),
  }));
}

let activeSettingsCache = { ...initialClinicSettings };

export async function getSiteSettings(): Promise<ClinicSettings> {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeSettingsCache;
  }

  const settingsDoc = await SiteSettingsModel.findOne().select('-__v').lean();
  if (!settingsDoc) {
    return activeSettingsCache;
  }

  return {
    ...activeSettingsCache,
    ...settingsDoc,
    id: (settingsDoc as any)._id?.toString(),
  } as unknown as ClinicSettings;
}

export async function updateSiteSettings(input: unknown): Promise<ClinicSettings> {
  assertServerEnvironment();
  const validated = clinicSettingsSchema.parse(input);
  const conn = await connectToDatabase();

  activeSettingsCache = {
    ...activeSettingsCache,
    ...validated,
  };

  if (!conn) {
    return activeSettingsCache;
  }

  const updated = await SiteSettingsModel.findOneAndUpdate(
    {},
    { $set: validated },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
    .select('-__v')
    .lean();

  return {
    ...activeSettingsCache,
    ...updated,
    id: (updated as any)._id?.toString(),
  } as unknown as ClinicSettings;
}

export async function getPublicNavigation() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeNavigationCache.isPublished ? activeNavigationCache : null;
  }

  const nav = await NavigationModel.findOne({ identifier: 'main_navigation', isPublished: true })
    .select('-__v')
    .lean();

  if (!nav) {
    return activeNavigationCache.isPublished ? activeNavigationCache : null;
  }

  return nav;
}

export async function getPublicPageBySlug(slug: string) {
  assertServerEnvironment();
  const cleanSlug = slug.toLowerCase().trim();
  const conn = await connectToDatabase();
  if (!conn) {
    const page = activePagesCache.find((p) => p.slug === cleanSlug && p.isPublished);
    if (!page) return null;
    return {
      ...page,
      sections: (page.sections || [])
        .filter((s) => s.isPublished)
        .sort((a, b) => a.order - b.order),
    };
  }

  const page = await PageModel.findOne({ slug: cleanSlug, isPublished: true })
    .select('-__v')
    .lean();

  if (!page) {
    const fallback = activePagesCache.find((p) => p.slug === cleanSlug && p.isPublished);
    if (!fallback) return null;
    return {
      ...fallback,
      sections: (fallback.sections || [])
        .filter((s) => s.isPublished)
        .sort((a, b) => a.order - b.order),
    };
  }

  page.sections = (page.sections || [])
    .filter((s) => s.isPublished)
    .sort((a, b) => a.order - b.order);

  return {
    ...page,
    id: page._id.toString(),
  };
}

/**
 * =========================================================================
 * PUBLIC WRITE OPERATIONS (Strict Zod validation before DB access)
 * =========================================================================
 */

/**
 * =========================================================================
 * PHASE 9: APPOINTMENT ENQUIRY & WHATSAPP INTEGRATION ENGINE
 * =========================================================================
 */

export interface CreateEnquiryOptions {
  ip?: string;
  source?: 'appointment_modal' | 'contact_form' | 'direct';
}

export async function createAppointmentEnquiry(rawInput: unknown, options: CreateEnquiryOptions = {}) {
  assertServerEnvironment();

  // 1. Validate submitted data on the server
  const validated = appointmentEnquirySchema.parse(rawInput);

  // 2. Normalize accepted input
  const patientName = validated.patientName.trim();
  const rawPhone = validated.patientPhone.trim();
  const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
  const normalizedPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
  const preferredDate = validated.preferredDate.trim();
  const preferredTimeSlot = validated.preferredTimeSlot.trim();
  const doctorName = (validated.doctorName || '').trim();
  const serviceTitle = (validated.serviceTitle || '').trim();
  const message = (validated.message || '').trim();

  // 3. Spam protection & Rate Limiting
  if (validated.honeypot && validated.honeypot.length > 0) {
    const spamErr = new Error('Invalid submission detected. Please refresh and try again.');
    (spamErr as any).statusCode = 400;
    throw spamErr;
  }

  const clientIp = options.ip || '127.0.0.1';
  if (!checkIpRateLimit(clientIp, 6, 10 * 60 * 1000)) {
    const rateErr = new Error('Too many appointment enquiries submitted. Please wait a few minutes or call reception directly.');
    (rateErr as any).statusCode = 429;
    throw rateErr;
  }

  // 4. Protect against duplicate submissions (within 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const conn = await connectToDatabase();

  let existingDuplicate: any = activeEnquiriesCache.find((e) => {
    const ePhone = (e.patientPhone || '').replace(/[^0-9]/g, '');
    const eNorm = ePhone.length >= 10 ? ePhone.slice(-10) : ePhone;
    const isSamePhone = eNorm === normalizedPhone;
    const isSameDate = e.preferredDate === preferredDate;
    const isSameDoctorOrService =
      (!validated.doctorId && !validated.serviceId) ||
      (validated.doctorId && e.doctorId === validated.doctorId) ||
      (validated.serviceTitle && e.serviceTitle === serviceTitle);
    const isRecent = new Date(e.createdAt) >= fiveMinutesAgo;
    return isSamePhone && isSameDate && isSameDoctorOrService && isRecent;
  });

  if (!existingDuplicate && conn) {
    try {
      const dbDuplicate = await EnquiryModel.findOne({
        patientPhone: { $regex: normalizedPhone + '$' },
        preferredDate,
        createdAt: { $gte: fiveMinutesAgo },
      }).lean();
      if (dbDuplicate) {
        existingDuplicate = { ...dbDuplicate, id: dbDuplicate._id.toString() };
      }
    } catch (e) {
      console.warn('Duplicate DB check notice:', e);
    }
  }

  if (existingDuplicate) {
    return {
      success: true,
      isDuplicate: true,
      reference: existingDuplicate.referenceNumber,
      whatsappUrl: existingDuplicate.whatsappUrl,
      data: existingDuplicate,
      message: `An appointment enquiry for this date was recently recorded with reference ${existingDuplicate.referenceNumber}. Our reception desk is processing it.`,
    };
  }

  // 5. Generate a unique enquiry reference (e.g. OSA-2026-84920)
  const random5 = Math.floor(10000 + Math.random() * 90000);
  const referenceNumber = `OSA-2026-${random5}`;
  const now = new Date();

  // 6. WhatsApp URL-encoded Message Preparation
  const targetSpecialist = doctorName
    ? `Dr. ${doctorName.replace(/^Dr\.\s*/i, '')}`
    : serviceTitle || 'General Outpatient Consultation';

  // Read destination WhatsApp number from settings
  const rawWhatsAppDest =
    activeSettingsCache.whatsappNumber ||
    activeSettingsCache.emergencyPhone ||
    activeSettingsCache.generalPhone ||
    '919876543210';
  let cleanDest = rawWhatsAppDest.replace(/[^0-9]/g, '');
  if (cleanDest.length === 10) {
    cleanDest = '91' + cleanDest; // Default India dialing code if not prefixed
  }

  const whatsappMessage = [
    `*OM SAI ADARSHA CLINIC — APPOINTMENT ENQUIRY*`,
    `----------------------------------------`,
    `*Ref:* ${referenceNumber}`,
    `*Patient Name:* ${patientName}`,
    `*Contact:* ${rawPhone}`,
    `*Preferred Date:* ${preferredDate}`,
    `*Preferred Slot:* ${preferredTimeSlot}`,
    `*Consultation:* ${targetSpecialist}`,
    message ? `*Notes / Symptoms:* ${message}` : null,
    `----------------------------------------`,
    `Please confirm slot availability at your earliest convenience.`,
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappUrl = `https://wa.me/${cleanDest}?text=${encodeURIComponent(whatsappMessage)}`;

  // 7. Initial enquiry record (Status: New)
  const enquiryPayload: any = {
    id: `enq-${Date.now()}-${random5}`,
    referenceNumber,
    patientName,
    patientPhone: rawPhone,
    preferredDate,
    preferredTimeSlot,
    doctorId: validated.doctorId || undefined,
    doctorName: doctorName || undefined,
    serviceId: validated.serviceId || undefined,
    serviceTitle: serviceTitle || undefined,
    message: message || undefined,
    consentGiven: true,
    consentTimestamp: now.toISOString(),
    status: 'new',
    isRead: false,
    internalNotes: '',
    history: [
      {
        status: 'new',
        note: 'Appointment enquiry recorded with reference ' + referenceNumber,
        timestamp: now.toISOString(),
        updatedBy: 'Patient Web Portal',
      },
    ],
    ipAddress: clientIp,
    whatsappUrl,
    source: options.source || 'appointment_modal',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  // 8. Save enquiry to MongoDB (and active memory cache)
  activeEnquiriesCache.unshift(enquiryPayload);

  if (conn) {
    try {
      const created = await EnquiryModel.create({
        ...enquiryPayload,
        consentTimestamp: now,
        history: [
          {
            status: 'new',
            note: 'Appointment enquiry recorded with reference ' + referenceNumber,
            timestamp: now,
            updatedBy: 'Patient Web Portal',
          },
        ],
      });
      enquiryPayload.id = created._id.toString();
    } catch (dbErr) {
      console.error('MongoDB Enquiry persistence failed, active cache retained:', dbErr);
    }
  }

  // Also synchronize to Appointments collection for backward compatibility
  const appointmentNumber = `APT-${referenceNumber.replace('OSA-2026-', '')}`;
  if (conn) {
    try {
      await AppointmentModel.create({
        appointmentNumber,
        patientName,
        patientEmail: 'patient@omsai.clinic',
        patientPhone: rawPhone,
        doctorId: validated.doctorId || 'doc-general',
        doctorName: doctorName || 'Consultant Physician',
        serviceTitle: serviceTitle || 'General Consultation',
        appointmentDate: preferredDate,
        timeSlot: preferredTimeSlot,
        symptoms: message,
        status: 'pending',
      });
    } catch (aptErr) {
      console.warn('Sync to legacy AppointmentModel failed:', aptErr);
    }
  }

  // 9. Return the result to the client (enquiry must be saved before client opens WhatsApp)
  return {
    success: true,
    isDuplicate: false,
    reference: referenceNumber,
    whatsappUrl,
    data: enquiryPayload,
    message: `Appointment enquiry ${referenceNumber} logged successfully. Please proceed to WhatsApp to send details.`,
  };
}

/**
 * Legacy wrappers for backward compatibility
 */
export async function createPublicEnquiry(rawInput: unknown) {
  assertServerEnvironment();
  const input = rawInput as any;
  return createAppointmentEnquiry({
    patientName: input.name || input.patientName || 'Patient',
    patientPhone: input.phone || input.patientPhone || '9876543210',
    preferredDate: input.preferredDate || new Date().toISOString().split('T')[0],
    preferredTimeSlot: input.preferredTimeSlot || input.timeSlot || '10:00 AM - 12:00 PM',
    doctorName: input.doctorName || undefined,
    serviceTitle: input.serviceTitle || input.subject || 'General Consultation',
    message: input.message || undefined,
    consentGiven: true,
  });
}

export async function createPublicAppointment(rawInput: unknown) {
  assertServerEnvironment();
  const input = rawInput as any;
  return createAppointmentEnquiry({
    patientName: input.patientName || 'Patient',
    patientPhone: input.patientPhone || '9876543210',
    preferredDate: input.appointmentDate || input.preferredDate || new Date().toISOString().split('T')[0],
    preferredTimeSlot: input.timeSlot || input.preferredTimeSlot || '10:00 AM - 12:00 PM',
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    serviceId: input.serviceId,
    serviceTitle: input.serviceTitle,
    message: input.symptoms || input.message,
    consentGiven: true,
  });
}

/**
 * =========================================================================
 * ADMIN ENQUIRY MANAGEMENT (Protected by Server-Side Authorization)
 * =========================================================================
 */

export interface GetAdminEnquiriesParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export async function getAdminEnquiriesList(params: GetAdminEnquiriesParams = {}) {
  assertServerEnvironment();
  const conn = await connectToDatabase();

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  let allItems: any[] = [];

  if (conn) {
    try {
      const query: Record<string, unknown> = {};
      if (params.status && params.status !== 'all') {
        query.status = params.status;
      }
      if (params.search && params.search.trim()) {
        const regex = new RegExp(params.search.trim(), 'i');
        query.$or = [
          { referenceNumber: regex },
          { patientName: regex },
          { patientPhone: regex },
          { doctorName: regex },
          { serviceTitle: regex },
          { message: regex },
        ];
      }
      if (params.startDate) {
        query.preferredDate = { ...(query.preferredDate as any), $gte: params.startDate };
      }
      if (params.endDate) {
        query.preferredDate = { ...(query.preferredDate as any), $lte: params.endDate };
      }

      const [docs, total] = await Promise.all([
        EnquiryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v').lean(),
        EnquiryModel.countDocuments(query),
      ]);

      if (docs.length > 0 || total > 0) {
        // Status counts aggregation
        const counts = await EnquiryModel.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const statusMap: Record<string, number> = { all: total, new: 0, contacted: 0, confirmed: 0, closed: 0 };
        counts.forEach((c) => {
          if (c._id && statusMap[c._id] !== undefined) statusMap[c._id] = c.count;
        });

        return {
          enquiries: docs.map((d) => ({ ...d, id: d._id.toString() })),
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
          statusCounts: statusMap,
        };
      }
    } catch (dbErr) {
      console.warn('EnquiryModel query failed, using active cache:', dbErr);
    }
  }

  // Fallback / Active Memory Cache Implementation
  allItems = [...activeEnquiriesCache];

  // Calculate status counts on all items
  const statusCounts: Record<string, number> = {
    all: allItems.length,
    new: allItems.filter((e) => e.status === 'new').length,
    contacted: allItems.filter((e) => e.status === 'contacted').length,
    confirmed: allItems.filter((e) => e.status === 'confirmed').length,
    closed: allItems.filter((e) => e.status === 'closed').length,
  };

  // Filter by status
  if (params.status && params.status !== 'all') {
    allItems = allItems.filter((e) => e.status === params.status);
  }

  // Filter by search query
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    allItems = allItems.filter(
      (e) =>
        (e.referenceNumber && e.referenceNumber.toLowerCase().includes(q)) ||
        (e.patientName && e.patientName.toLowerCase().includes(q)) ||
        (e.patientPhone && e.patientPhone.toLowerCase().includes(q)) ||
        (e.doctorName && e.doctorName.toLowerCase().includes(q)) ||
        (e.serviceTitle && e.serviceTitle.toLowerCase().includes(q)) ||
        (e.message && e.message.toLowerCase().includes(q))
    );
  }

  const total = allItems.length;
  const paginated = allItems.slice(skip, skip + limit);

  return {
    enquiries: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    statusCounts,
  };
}

export async function getAdminEnquiryById(id: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();

  let enquiry: any = activeEnquiriesCache.find((e) => e.id === id || e.referenceNumber === id);
  if (conn) {
    try {
      const doc = await EnquiryModel.findOne({
        $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { referenceNumber: id }],
      })
        .select('-__v')
        .lean();
      if (doc) enquiry = { ...doc, id: doc._id.toString() };
    } catch (e) {
      console.warn('getAdminEnquiryById fallback:', e);
    }
  }

  return enquiry || null;
}

export async function updateAdminEnquiryStatus(
  id: string,
  update: {
    status?: 'new' | 'contacted' | 'confirmed' | 'closed';
    internalNotes?: string;
    isRead?: boolean;
    staffMemberName?: string;
    note?: string;
  }
) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  const now = new Date();
  const staff = update.staffMemberName || 'Clinic Staff';

  // 1. Update in-memory cache
  const idx = activeEnquiriesCache.findIndex((e) => e.id === id || e.referenceNumber === id);
  let updatedRecord: any = null;

  if (idx !== -1) {
    const target = activeEnquiriesCache[idx];
    const prevStatus = target.status;
    const nextStatus = update.status || prevStatus;

    const newHistoryItem = {
      status: nextStatus,
      note: update.note || update.internalNotes || `Status updated to ${nextStatus}`,
      timestamp: now.toISOString(),
      updatedBy: staff,
    };

    activeEnquiriesCache[idx] = {
      ...target,
      status: nextStatus,
      isRead: typeof update.isRead === 'boolean' ? update.isRead : true,
      internalNotes: update.internalNotes !== undefined ? update.internalNotes : target.internalNotes,
      updatedAt: now.toISOString(),
      history: [...(target.history || []), newHistoryItem],
    };
    updatedRecord = activeEnquiriesCache[idx];
  }

  // 2. Persist to MongoDB
  if (conn) {
    try {
      const safeFields: Record<string, unknown> = {
        updatedAt: now,
      };
      if (update.status) safeFields.status = update.status;
      if (typeof update.isRead === 'boolean') safeFields.isRead = update.isRead;
      if (update.internalNotes !== undefined) safeFields.internalNotes = update.internalNotes;

      const historyEntry = {
        status: update.status || 'contacted',
        note: update.note || update.internalNotes || 'Status update logged',
        timestamp: now,
        updatedBy: staff,
      };

      const doc = await EnquiryModel.findOneAndUpdate(
        { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { referenceNumber: id }] },
        {
          $set: safeFields,
          $push: { history: historyEntry },
        },
        { new: true }
      )
        .select('-__v')
        .lean();

      if (doc) updatedRecord = { ...doc, id: doc._id.toString() };
    } catch (dbErr) {
      console.warn('MongoDB enquiry update failed, active cache preserved:', dbErr);
    }
  }

  return updatedRecord;
}

export async function exportAdminEnquiriesCsv(status?: string, search?: string): Promise<string> {
  const result = await getAdminEnquiriesList({ status, search, page: 1, limit: 1000 });
  const enquiries = result.enquiries;

  const sanitizeCell = (val: any) => {
    if (val === undefined || val === null) return '""';
    let str = String(val).replace(/"/g, '""');
    // Prevent formula injection in Excel/Sheets: =, +, -, @
    if (/^[=+\-@]/.test(str)) {
      str = "'" + str;
    }
    return `"${str}"`;
  };

  const headers = [
    'Reference Number',
    'Created Date',
    'Status',
    'Patient Name',
    'Patient Phone',
    'Preferred Date',
    'Preferred Time Slot',
    'Consulting Doctor',
    'Requested Service',
    'Patient Note',
    'Internal Staff Notes',
  ];

  const rows = enquiries.map((e) => [
    sanitizeCell(e.referenceNumber),
    sanitizeCell(e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : ''),
    sanitizeCell(e.status),
    sanitizeCell(e.patientName),
    sanitizeCell(e.patientPhone),
    sanitizeCell(e.preferredDate),
    sanitizeCell(e.preferredTimeSlot),
    sanitizeCell(e.doctorName || 'N/A'),
    sanitizeCell(e.serviceTitle || 'General Consultation'),
    sanitizeCell(e.message || ''),
    sanitizeCell(e.internalNotes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

// Backward compatibility alias for existing admin endpoints
export async function getAdminEnquiries(status?: string) {
  const result = await getAdminEnquiriesList({ status, page: 1, limit: 100 });
  return result.enquiries;
}

export async function updateEnquiryStatus(
  id: string,
  update: {
    status?: any;
    internalNotes?: string;
    isRead?: boolean;
  }
) {
  return updateAdminEnquiryStatus(id, update);
}

// URL Scheme & Safe Target Validation
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return false;
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:')
  ) {
    return true;
  }
  return false;
}

// Slug collision verification
export async function checkSlugAvailability(
  type: 'doctor' | 'service' | 'page',
  slug: string,
  excludeId?: string
): Promise<{ available: boolean; message?: string }> {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  const cleanSlug = slug.toLowerCase().trim();

  if (!cleanSlug || cleanSlug.length < 2) {
    return { available: false, message: 'Slug must be at least 2 characters' };
  }

  // Check active memory caches first
  if (type === 'doctor') {
    const existing = activeDoctorsCache.find(
      (d) => d.slug?.toLowerCase() === cleanSlug && (!excludeId || d.id !== excludeId)
    );
    if (existing) {
      return { available: false, message: `The slug "${cleanSlug}" is already taken by another doctor.` };
    }
  } else if (type === 'service') {
    const existing = activeServicesCache.find(
      (s) => s.slug?.toLowerCase() === cleanSlug && (!excludeId || s.id !== excludeId)
    );
    if (existing) {
      return { available: false, message: `The slug "${cleanSlug}" is already taken by another service.` };
    }
  } else if (type === 'page') {
    const existing = activePagesCache.find(
      (p) => p.slug?.toLowerCase() === cleanSlug && (!excludeId || p.id !== excludeId)
    );
    if (existing) {
      return { available: false, message: `The slug "${cleanSlug}" is already taken by another page.` };
    }
  }

  // Also check database if connected
  if (conn) {
    let existingDoc: { _id: unknown } | null = null;
    if (type === 'doctor') {
      existingDoc = await DoctorModel.findOne({ slug: cleanSlug }).select('_id').lean();
    } else if (type === 'service') {
      existingDoc = await ServiceModel.findOne({ slug: cleanSlug }).select('_id').lean();
    } else if (type === 'page') {
      existingDoc = await PageModel.findOne({ slug: cleanSlug }).select('_id').lean();
    }

    if (existingDoc && (!excludeId || (existingDoc._id as string).toString() !== excludeId)) {
      return { available: false, message: `The slug "${cleanSlug}" is already taken by another ${type}.` };
    }
  }

  return { available: true };
}

// ===================== DOCTORS CRUD =====================
export async function getAdminDoctors() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeDoctorsCache;
  }
  const doctors = await DoctorModel.find().sort({ order: 1, createdAt: -1 }).select('-__v').lean();
  if (doctors.length === 0) return activeDoctorsCache;
  return doctors.map((d) => ({
    ...d,
    id: d._id.toString(),
  }));
}

export async function upsertDoctor(data: DoctorInput, doctorId?: string) {
  assertServerEnvironment();
  const validated = doctorSchema.parse(data);
  const conn = await connectToDatabase();

  const slugCheck = await checkSlugAvailability('doctor', validated.slug, doctorId);
  if (!slugCheck.available) {
    throw new Error(slugCheck.message);
  }

  const now = new Date().toISOString();
  const payload = {
    name: validated.name,
    slug: validated.slug.toLowerCase().trim(),
    specialty: validated.specialty,
    department: validated.department,
    qualifications: validated.qualifications,
    experienceYears: validated.experienceYears,
    bio: validated.bio,
    consultationFee: validated.consultationFee,
    availableDays: validated.availableDays,
    availableTimeSlots: validated.availableTimeSlots,
    avatarUrl: validated.avatarUrl,
    contactEmail: validated.contactEmail,
    phone: validated.phone,
    languages: validated.languages || [],
    relatedServiceIds: validated.relatedServiceIds || [],
    isAvailable: validated.isAvailable,
    isPublished: validated.isPublished !== undefined ? validated.isPublished : true,
    order: validated.order || 0,
    updatedAt: now,
  };

  const itemId = doctorId || `doc-${Date.now()}`;
  const memoryDoc = {
    ...payload,
    id: itemId,
    createdAt: now,
  };

  if (doctorId) {
    const idx = activeDoctorsCache.findIndex((d) => d.id === doctorId);
    if (idx !== -1) {
      activeDoctorsCache[idx] = { ...activeDoctorsCache[idx], ...payload, updatedAt: now };
    } else {
      activeDoctorsCache.push(memoryDoc);
    }
  } else {
    activeDoctorsCache.push(memoryDoc);
  }

  if (!conn) {
    return memoryDoc;
  }

  if (doctorId) {
    const updated = await DoctorModel.findByIdAndUpdate(doctorId, { $set: payload }, { new: true, runValidators: true })
      .select('-__v')
      .lean();
    return updated ? { ...updated, id: updated._id.toString() } : memoryDoc;
  } else {
    const created = await DoctorModel.create(payload);
    return { ...created.toObject(), id: created._id.toString() };
  }
}

export async function deleteDoctor(doctorId: string) {
  assertServerEnvironment();
  activeDoctorsCache = activeDoctorsCache.filter((d) => d.id !== doctorId);
  // Relationship cleanup: Remove this doctor from any referencing services in memory
  activeServicesCache = activeServicesCache.map((s) => ({
    ...s,
    relatedDoctorIds: (s.relatedDoctorIds || []).filter((id: string) => id !== doctorId),
  }));

  const conn = await connectToDatabase();
  if (conn) {
    await DoctorModel.findByIdAndDelete(doctorId);
    // Relationship cleanup: Remove this doctor from any referencing services in DB
    await ServiceModel.updateMany(
      { relatedDoctorIds: doctorId },
      { $pull: { relatedDoctorIds: doctorId } }
    );
  }
  return { success: true, message: 'Doctor deleted and relationships cleared' };
}

// ===================== SERVICES CRUD =====================
export async function getAdminServices() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeServicesCache;
  }
  const services = await ServiceModel.find().sort({ order: 1, createdAt: -1 }).select('-__v').lean();
  if (services.length === 0) return activeServicesCache;
  return services.map((s) => ({
    ...s,
    id: s._id.toString(),
  }));
}

export async function upsertService(data: ServiceInput, serviceId?: string) {
  assertServerEnvironment();
  const validated = serviceSchema.parse(data);
  const conn = await connectToDatabase();

  const slugCheck = await checkSlugAvailability('service', validated.slug, serviceId);
  if (!slugCheck.available) {
    throw new Error(slugCheck.message);
  }

  const now = new Date().toISOString();
  const payload = {
    title: validated.title,
    slug: validated.slug.toLowerCase().trim(),
    category: validated.category,
    summary: validated.summary,
    description: validated.description,
    iconName: validated.iconName || 'Activity',
    imageUrl: validated.imageUrl,
    features: validated.features || [],
    estimatedDurationMinutes: validated.estimatedDurationMinutes,
    priceStartingAt: validated.priceStartingAt,
    department: validated.department,
    relatedDoctorIds: validated.relatedDoctorIds || [],
    isActive: validated.isActive !== undefined ? validated.isActive : true,
    isPublished: validated.isPublished !== undefined ? validated.isPublished : true,
    order: validated.order || 0,
    updatedAt: now,
  };

  const itemId = serviceId || `serv-${Date.now()}`;
  const memoryService = {
    ...payload,
    id: itemId,
    createdAt: now,
  };

  if (serviceId) {
    const idx = activeServicesCache.findIndex((s) => s.id === serviceId);
    if (idx !== -1) {
      activeServicesCache[idx] = { ...activeServicesCache[idx], ...payload, updatedAt: now };
    } else {
      activeServicesCache.push(memoryService);
    }
  } else {
    activeServicesCache.push(memoryService);
  }

  if (!conn) {
    return memoryService;
  }

  if (serviceId) {
    const updated = await ServiceModel.findByIdAndUpdate(serviceId, { $set: payload }, { new: true, runValidators: true })
      .select('-__v')
      .lean();
    return updated ? { ...updated, id: updated._id.toString() } : memoryService;
  } else {
    const created = await ServiceModel.create(payload);
    return { ...created.toObject(), id: created._id.toString() };
  }
}

export async function deleteService(serviceId: string) {
  assertServerEnvironment();
  activeServicesCache = activeServicesCache.filter((s) => s.id !== serviceId);
  // Relationship cleanup: Remove this service from any referencing doctors in memory
  activeDoctorsCache = activeDoctorsCache.map((d) => ({
    ...d,
    relatedServiceIds: (d.relatedServiceIds || []).filter((id: string) => id !== serviceId),
  }));

  const conn = await connectToDatabase();
  if (conn) {
    await ServiceModel.findByIdAndDelete(serviceId);
    // Relationship cleanup: Remove this service from any referencing doctors in DB
    await DoctorModel.updateMany(
      { relatedServiceIds: serviceId },
      { $pull: { relatedServiceIds: serviceId } }
    );
  }
  return { success: true, message: 'Service deleted and relationships cleared' };
}

// ===================== GALLERY CRUD =====================
export async function getAdminGallery() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeGalleryCache;
  }
  const items = await GalleryModel.find().sort({ order: 1, createdAt: -1 }).select('-__v').lean();
  if (items.length === 0) return activeGalleryCache;
  return items.map((g) => ({
    ...g,
    id: g._id.toString(),
  }));
}

export async function upsertGalleryItem(data: GalleryItemInput, itemId?: string) {
  assertServerEnvironment();
  const validated = galleryItemSchema.parse(data);
  const conn = await connectToDatabase();

  const now = new Date().toISOString();
  const payload = {
    title: validated.title,
    category: validated.category,
    imageUrl: validated.imageUrl,
    description: validated.description || '',
    featured: validated.featured || false,
    isPublished: validated.isPublished !== undefined ? validated.isPublished : true,
    order: validated.order || 0,
    updatedAt: now,
  };

  const id = itemId || `gal-${Date.now()}`;
  const memoryGallery = {
    ...payload,
    id,
    createdAt: now,
  };

  if (itemId) {
    const idx = activeGalleryCache.findIndex((g) => g.id === itemId);
    if (idx !== -1) {
      activeGalleryCache[idx] = { ...activeGalleryCache[idx], ...payload };
    } else {
      activeGalleryCache.push(memoryGallery);
    }
  } else {
    activeGalleryCache.push(memoryGallery);
  }

  if (!conn) {
    return memoryGallery;
  }

  if (itemId) {
    const updated = await GalleryModel.findByIdAndUpdate(itemId, { $set: payload }, { new: true, runValidators: true })
      .select('-__v')
      .lean();
    return updated ? { ...updated, id: updated._id.toString() } : memoryGallery;
  } else {
    const created = await GalleryModel.create(payload);
    return { ...created.toObject(), id: created._id.toString() };
  }
}

export async function deleteGalleryItem(itemId: string) {
  assertServerEnvironment();
  activeGalleryCache = activeGalleryCache.filter((g) => g.id !== itemId);
  const conn = await connectToDatabase();
  if (conn) {
    await GalleryModel.findByIdAndDelete(itemId);
  }
  return { success: true, message: 'Gallery item deleted successfully' };
}

// ===================== FAQ CRUD =====================
export async function getAdminFaqs() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeFaqsCache;
  }
  const faqs = await FAQModel.find().sort({ order: 1, createdAt: -1 }).select('-__v').lean();
  if (faqs.length === 0) return activeFaqsCache;
  return faqs.map((f) => ({
    ...f,
    id: f._id.toString(),
  }));
}

export async function upsertFaqItem(data: FAQItemInput, faqId?: string) {
  assertServerEnvironment();
  const validated = faqItemSchema.parse(data);
  const conn = await connectToDatabase();

  const now = new Date().toISOString();
  const payload = {
    question: validated.question,
    answer: validated.answer,
    category: validated.category,
    order: validated.order || 0,
    isActive: validated.isActive !== undefined ? validated.isActive : true,
    isPublished: validated.isPublished !== undefined ? validated.isPublished : true,
    updatedAt: now,
  };

  const id = faqId || `faq-${Date.now()}`;
  const memoryFaq = {
    ...payload,
    id,
    createdAt: now,
  };

  if (faqId) {
    const idx = activeFaqsCache.findIndex((f) => f.id === faqId);
    if (idx !== -1) {
      activeFaqsCache[idx] = { ...activeFaqsCache[idx], ...payload };
    } else {
      activeFaqsCache.push(memoryFaq);
    }
  } else {
    activeFaqsCache.push(memoryFaq);
  }

  if (!conn) {
    return memoryFaq;
  }

  if (faqId) {
    const updated = await FAQModel.findByIdAndUpdate(faqId, { $set: payload }, { new: true, runValidators: true })
      .select('-__v')
      .lean();
    return updated ? { ...updated, id: updated._id.toString() } : memoryFaq;
  } else {
    const created = await FAQModel.create(payload);
    return { ...created.toObject(), id: created._id.toString() };
  }
}

export async function deleteFaqItem(faqId: string) {
  assertServerEnvironment();
  activeFaqsCache = activeFaqsCache.filter((f) => f.id !== faqId);
  const conn = await connectToDatabase();
  if (conn) {
    await FAQModel.findByIdAndDelete(faqId);
  }
  return { success: true, message: 'FAQ deleted successfully' };
}


// ===================== PAGES & SECTIONS CRUD =====================

export async function getAdminPages() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activePagesCache;
  }
  const pages = await PageModel.find().sort({ slug: 1 }).select('-__v').lean();
  if (pages.length === 0) {
    // Seed default pages
    for (const p of defaultPagesSeed) {
      await PageModel.create({
        slug: p.slug,
        title: p.title,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        sections: p.sections,
        isPublished: p.isPublished,
      }).catch(() => null);
    }
    const reloaded = await PageModel.find().sort({ slug: 1 }).select('-__v').lean();
    return reloaded.map((p) => ({ ...p, id: p._id.toString() }));
  }
  return pages.map((p) => ({
    ...p,
    id: p._id.toString(),
  }));
}

export async function getAdminPageBySlug(slug: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  const cleanSlug = slug.toLowerCase().trim();
  if (!conn) {
    return activePagesCache.find((p) => p.slug === cleanSlug) || null;
  }
  const page = await PageModel.findOne({ slug: cleanSlug }).select('-__v').lean();
  return page ? { ...page, id: page._id.toString() } : null;
}

export async function upsertPage(slug: string, data: PageInput) {
  assertServerEnvironment();
  const validated = pageSchema.parse(data);
  const conn = await connectToDatabase();
  const cleanSlug = slug.toLowerCase().trim();

  // Controlled content: ensure no unsanitized raw script injections
  const sanitizedSections = (validated.sections || []).map((sec, idx) => ({
    sectionKey: sec.sectionKey.trim(),
    heading: sec.heading ? sec.heading.replace(/<[^>]*>?/gm, '') : undefined,
    subheading: sec.subheading ? sec.subheading.replace(/<[^>]*>?/gm, '') : undefined,
    content: sec.content || '',
    mediaUrl: sec.mediaUrl && isSafeUrl(sec.mediaUrl) ? sec.mediaUrl.trim() : '',
    order: sec.order !== undefined ? sec.order : idx + 1,
    isPublished: sec.isPublished !== undefined ? sec.isPublished : true,
    extraData: sec.extraData,
  }));

  const payload = {
    slug: cleanSlug,
    title: validated.title.trim(),
    metaTitle: validated.metaTitle ? validated.metaTitle.trim() : undefined,
    metaDescription: validated.metaDescription ? validated.metaDescription.trim() : undefined,
    sections: sanitizedSections,
    isPublished: validated.isPublished !== undefined ? validated.isPublished : true,
  };

  // Update in-memory fallback
  const idx = activePagesCache.findIndex((p) => p.slug === cleanSlug);
  if (idx !== -1) {
    activePagesCache[idx] = { ...activePagesCache[idx], ...payload };
  } else {
    activePagesCache.push({ id: `page-${cleanSlug}`, ...payload });
  }

  if (!conn) {
    return { ...payload, id: `page-${cleanSlug}` };
  }

  const updated = await PageModel.findOneAndUpdate(
    { slug: cleanSlug },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
    .select('-__v')
    .lean();

  return updated ? { ...updated, id: updated._id.toString() } : null;
}

// ===================== NAVIGATION & FOOTER =====================

export async function getAdminNavigation() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeNavigationCache;
  }
  const nav = await NavigationModel.findOne({ identifier: 'main_navigation' }).select('-__v').lean();
  if (!nav) {
    const created = await NavigationModel.create(defaultNavigationData);
    return { ...created.toObject(), id: created._id.toString() };
  }
  return { ...nav, id: nav._id.toString() };
}

export async function updateAdminNavigation(data: NavigationConfigInput) {
  assertServerEnvironment();
  const validated = navigationConfigSchema.parse(data);

  // Validate all URLs to prevent unsafe schemes and open redirects
  for (const item of validated.headerMenuItems) {
    if (!isSafeUrl(item.href)) {
      throw new Error(`Unsafe URL scheme detected in header link "${item.label}": ${item.href}`);
    }
  }

  for (const section of validated.footerSections) {
    for (const link of section.links) {
      if (!isSafeUrl(link.href)) {
        throw new Error(`Unsafe URL scheme detected in footer link "${link.label}": ${link.href}`);
      }
    }
  }

  activeNavigationCache = { ...validated };

  const conn = await connectToDatabase();
  if (!conn) {
    return activeNavigationCache;
  }

  const updated = await NavigationModel.findOneAndUpdate(
    { identifier: validated.identifier || 'main_navigation' },
    { $set: validated },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
    .select('-__v')
    .lean();

  return updated ? { ...updated, id: updated._id.toString() } : null;
}

// ===================== TESTIMONIALS CRUD =====================

export async function getAdminTestimonials() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return activeTestimonialsCache;
  }
  const items = await TestimonialModel.find().sort({ order: 1, createdAt: -1 }).select('-__v').lean();
  return items.map((t) => ({
    ...t,
    id: t._id.toString(),
  }));
}

export async function upsertTestimonial(data: TestimonialInput, testimonialId?: string) {
  assertServerEnvironment();
  const validated = testimonialSchema.parse(data);
  const conn = await connectToDatabase();

  const payload = {
    patientName: validated.patientName,
    patientInitials: validated.patientInitials || validated.patientName.slice(0, 2).toUpperCase(),
    rating: validated.rating,
    review: validated.review,
    treatmentCategory: validated.treatmentCategory,
    doctorName: validated.doctorName,
    serviceTitle: validated.serviceTitle,
    isVerified: validated.isVerified !== undefined ? validated.isVerified : true,
    isPublished: validated.isPublished !== undefined ? validated.isPublished : true,
    order: validated.order || 0,
    date: validated.date || new Date().toISOString().split('T')[0],
  };

  if (!conn) {
    const item = { ...payload, id: testimonialId || `test-${Date.now()}` };
    if (testimonialId) {
      activeTestimonialsCache = activeTestimonialsCache.map((t) => (t.id === testimonialId ? item : t));
    } else {
      activeTestimonialsCache.push(item);
    }
    return item;
  }

  if (testimonialId) {
    const updated = await TestimonialModel.findByIdAndUpdate(testimonialId, { $set: payload }, { new: true, runValidators: true })
      .select('-__v')
      .lean();
    return updated ? { ...updated, id: updated._id.toString() } : null;
  } else {
    const created = await TestimonialModel.create(payload);
    return { ...created.toObject(), id: created._id.toString() };
  }
}

export async function deleteTestimonial(testimonialId: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (conn) {
    await TestimonialModel.findByIdAndDelete(testimonialId);
  } else {
    activeTestimonialsCache = activeTestimonialsCache.filter((t) => t.id !== testimonialId);
  }
  return { success: true, message: 'Testimonial deleted successfully' };
}

// ===================== MEDIA LIBRARY & USAGE TRACKING =====================

export interface MediaUsageRecord {
  entityType: 'doctor' | 'service' | 'gallery' | 'settings' | 'page';
  entityId: string;
  entityTitle: string;
  field: string;
}

/**
 * Scans all content types to track where a given media asset is currently used.
 */
export async function getMediaAssetUsage(assetId: string, assetUrl: string): Promise<MediaUsageRecord[]> {
  assertServerEnvironment();
  const usages: MediaUsageRecord[] = [];
  const cleanUrl = (assetUrl || '').trim();
  const baseUrl = cleanUrl.split('?')[0];

  const isMatch = (targetUrl?: string, mediaIdRef?: any) => {
    if (mediaIdRef && String(mediaIdRef) === assetId) return true;
    if (!targetUrl) return false;
    const cleanTarget = targetUrl.trim();
    if (cleanTarget === cleanUrl) return true;
    if (baseUrl && cleanTarget.split('?')[0] === baseUrl) return true;
    return false;
  };

  // 1. Doctors
  for (const doc of activeDoctorsCache) {
    if (isMatch(doc.avatarUrl, doc.avatarMediaId)) {
      usages.push({
        entityType: 'doctor',
        entityId: doc.id,
        entityTitle: doc.name,
        field: 'Profile Avatar',
      });
    }
  }

  // 2. Services
  for (const s of activeServicesCache) {
    if (isMatch(s.imageUrl, s.imageMediaId)) {
      usages.push({
        entityType: 'service',
        entityId: s.id,
        entityTitle: s.title,
        field: 'Service Image',
      });
    }
  }

  // 3. Gallery
  for (const g of activeGalleryCache) {
    if (isMatch(g.imageUrl, g.mediaAssetId)) {
      usages.push({
        entityType: 'gallery',
        entityId: g.id,
        entityTitle: g.title,
        field: 'Gallery Photo',
      });
    }
  }

  // 4. Site Settings
  if (isMatch(activeSettingsCache.mainLogoUrl)) {
    usages.push({
      entityType: 'settings',
      entityId: 'clinic_settings',
      entityTitle: 'Clinic Site Settings',
      field: 'Primary Brand Logo',
    });
  }

  // 5. Pages & Sections
  for (const p of activePagesCache) {
    for (const sec of p.sections || []) {
      if (isMatch(sec.mediaUrl)) {
        usages.push({
          entityType: 'page',
          entityId: p.slug,
          entityTitle: `${p.title} (${sec.heading || sec.sectionKey})`,
          field: 'Section Media',
        });
      }
    }
  }

  return usages;
}

export async function getAdminMediaAssets(filters?: { category?: string; search?: string }) {
  assertServerEnvironment();
  const conn = await connectToDatabase();

  let items: any[] = [];
  if (!conn) {
    items = [...activeMediaCache];
  } else {
    const query: Record<string, unknown> = {};
    if (filters?.category && filters.category !== 'all') {
      query.category = filters.category;
    }
    if (filters?.search) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ title: regex }, { originalFileName: regex }, { altText: regex }, { tags: regex }];
    }
    const dbItems = await MediaAssetModel.find(query).sort({ createdAt: -1 }).select('-__v').lean();
    if (dbItems.length === 0 && (!filters?.category || filters.category === 'all') && !filters?.search) {
      items = [...activeMediaCache];
    } else {
      items = dbItems.map((doc) => ({ ...doc, id: doc._id.toString() }));
    }
  }

  // Filter in-memory if offline or fallback
  if (!conn) {
    if (filters?.category && filters.category !== 'all') {
      items = items.filter((m) => m.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.originalFileName.toLowerCase().includes(q) ||
          m.altText.toLowerCase().includes(q) ||
          (m.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }
  }

  // Attach live usage count to each asset
  const enriched = await Promise.all(
    items.map(async (asset) => {
      const usages = await getMediaAssetUsage(asset.id, asset.secureUrl || asset.url);
      return {
        ...asset,
        usages,
        usageCount: usages.length,
      };
    })
  );

  return enriched;
}

export async function getAdminMediaAssetById(assetId: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();

  let asset: any = activeMediaCache.find((m) => m.id === assetId);
  if (conn) {
    const doc = await MediaAssetModel.findById(assetId).select('-__v').lean();
    if (doc) asset = { ...doc, id: doc._id.toString() };
  }

  if (!asset) return null;

  const usages = await getMediaAssetUsage(asset.id, asset.secureUrl || asset.url);
  return {
    ...asset,
    usages,
    usageCount: usages.length,
  };
}

export async function createMediaAsset(input: MediaAssetInput) {
  assertServerEnvironment();
  const validated = mediaAssetSchema.parse(input);
  const conn = await connectToDatabase();

  const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const memoryAsset = {
    ...validated,
    id,
    createdAt: now,
    updatedAt: now,
  };

  activeMediaCache.unshift(memoryAsset);

  if (!conn) {
    return memoryAsset;
  }

  const created = await MediaAssetModel.create(validated);
  return { ...created.toObject(), id: created._id.toString() };
}

export async function updateMediaAsset(assetId: string, input: Partial<MediaAssetInput>) {
  assertServerEnvironment();
  const conn = await connectToDatabase();

  const idx = activeMediaCache.findIndex((m) => m.id === assetId);
  if (idx !== -1) {
    activeMediaCache[idx] = {
      ...activeMediaCache[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
  }

  if (!conn) {
    return activeMediaCache[idx] || null;
  }

  const updated = await MediaAssetModel.findByIdAndUpdate(assetId, { $set: input }, { new: true, runValidators: true })
    .select('-__v')
    .lean();

  return updated ? { ...updated, id: updated._id.toString() } : activeMediaCache[idx];
}

/**
 * Replaces a media asset file and updates all referencing content records to avoid broken URLs.
 */
export async function replaceMediaAsset(
  assetId: string,
  newAssetData: {
    url: string;
    secureUrl: string;
    publicId: string;
    sizeBytes: number;
    mimeType: string;
    originalFileName: string;
    dimensions?: { width?: number; height?: number };
  }
) {
  assertServerEnvironment();
  const conn = await connectToDatabase();

  let existingAsset: any = activeMediaCache.find((m) => m.id === assetId);
  if (conn) {
    const doc = await MediaAssetModel.findById(assetId);
    if (doc) existingAsset = { ...doc.toObject(), id: doc._id.toString() };
  }

  if (!existingAsset) {
    throw new Error('Media asset not found for replacement.');
  }

  const oldUrl = existingAsset.secureUrl || existingAsset.url;
  const newUrl = newAssetData.secureUrl || newAssetData.url;
  const oldBaseUrl = oldUrl.split('?')[0];

  const isOldMatch = (targetUrl?: string, mediaIdRef?: any) => {
    if (mediaIdRef && String(mediaIdRef) === assetId) return true;
    if (!targetUrl) return false;
    const cleanTarget = targetUrl.trim();
    if (cleanTarget === oldUrl) return true;
    if (oldBaseUrl && cleanTarget.split('?')[0] === oldBaseUrl) return true;
    return false;
  };

  // 1. Update Media Asset Record
  const updatedMedia = {
    ...existingAsset,
    ...newAssetData,
    updatedAt: new Date().toISOString(),
  };

  const idx = activeMediaCache.findIndex((m) => m.id === assetId);
  if (idx !== -1) {
    activeMediaCache[idx] = updatedMedia;
  }

  if (conn) {
    await MediaAssetModel.findByIdAndUpdate(assetId, { $set: newAssetData });
  }

  // 2. Cascade replacement to all referencing content to prevent broken images!
  const updatedReferences: string[] = [];

  // Update Doctors
  for (const doc of activeDoctorsCache) {
    if (isOldMatch(doc.avatarUrl, doc.avatarMediaId)) {
      doc.avatarUrl = newUrl;
      updatedReferences.push(`Doctor: ${doc.name}`);
      if (conn) {
        await DoctorModel.findByIdAndUpdate(doc.id, { $set: { avatarUrl: newUrl } });
      }
    }
  }

  // Update Services
  for (const s of activeServicesCache) {
    if (isOldMatch(s.imageUrl, s.imageMediaId)) {
      s.imageUrl = newUrl;
      updatedReferences.push(`Service: ${s.title}`);
      if (conn) {
        await ServiceModel.findByIdAndUpdate(s.id, { $set: { imageUrl: newUrl } });
      }
    }
  }

  // Update Gallery
  for (const g of activeGalleryCache) {
    if (isOldMatch(g.imageUrl, g.mediaAssetId)) {
      g.imageUrl = newUrl;
      updatedReferences.push(`Gallery: ${g.title}`);
      if (conn) {
        await GalleryModel.findByIdAndUpdate(g.id, { $set: { imageUrl: newUrl } });
      }
    }
  }

  // Update Settings
  if (isOldMatch(activeSettingsCache.mainLogoUrl)) {
    activeSettingsCache.mainLogoUrl = newUrl;
    updatedReferences.push('Settings: Clinic Brand Logo');
    if (conn) {
      await SiteSettingsModel.findOneAndUpdate({}, { $set: { mainLogoUrl: newUrl } });
    }
  }

  // Update Pages
  for (const p of activePagesCache) {
    let pageUpdated = false;
    for (const sec of p.sections || []) {
      if (isOldMatch(sec.mediaUrl)) {
        sec.mediaUrl = newUrl;
        pageUpdated = true;
        updatedReferences.push(`Page: ${p.title} (${sec.sectionKey})`);
      }
    }
    if (pageUpdated && conn) {
      await PageModel.findOneAndUpdate({ slug: p.slug }, { $set: { sections: p.sections } });
    }
  }

  return {
    asset: updatedMedia,
    updatedReferences,
  };
}

/**
 * Deletes a media asset with reference protection.
 */
export async function deleteMediaAsset(assetId: string, force: boolean = false) {
  assertServerEnvironment();
  const conn = await connectToDatabase();

  let asset: any = activeMediaCache.find((m) => m.id === assetId);
  if (conn) {
    const doc = await MediaAssetModel.findById(assetId);
    if (doc) asset = { ...doc.toObject(), id: doc._id.toString() };
  }

  if (!asset) {
    throw new Error('Media asset not found.');
  }

  const usages = await getMediaAssetUsage(assetId, asset.secureUrl || asset.url);

  if (usages.length > 0 && !force) {
    const errorDetails = usages.map((u) => `${u.entityTitle} (${u.field})`).join(', ');
    const err = new Error(
      `Cannot delete media asset because it is currently in use by ${usages.length} record(s): ${errorDetails}. Please replace or remove references first.`
    );
    (err as any).statusCode = 409;
    (err as any).usages = usages;
    throw err;
  }

  // If forced deletion, safely nullify references
  if (force && usages.length > 0) {
    for (const u of usages) {
      if (u.entityType === 'doctor') {
        const doc = activeDoctorsCache.find((d) => d.id === u.entityId);
        if (doc) doc.avatarMediaId = undefined;
      } else if (u.entityType === 'service') {
        const s = activeServicesCache.find((srv) => srv.id === u.entityId);
        if (s) s.imageMediaId = undefined;
      } else if (u.entityType === 'gallery') {
        const g = activeGalleryCache.find((item) => item.id === u.entityId);
        if (g) g.mediaAssetId = undefined;
      }
    }
  }

  // Remove from Cloudinary / storage
  if (asset.publicId) {
    await deleteImageByPublicId(asset.publicId).catch(() => null);
  }

  // Remove from cache and database
  activeMediaCache = activeMediaCache.filter((m) => m.id !== assetId);
  if (conn) {
    await MediaAssetModel.findByIdAndDelete(assetId);
  }

  return { success: true, message: 'Media asset deleted successfully.' };
}

export async function getAdminOverviewStats() {
  assertServerEnvironment();
  const conn = await connectToDatabase();

  if (!conn) {
    return {
      databaseConnected: false,
      totalAppointments: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      totalEnquiries: 0,
      unreadEnquiries: 0,
      totalDoctors: activeDoctorsCache.length,
      totalServices: activeServicesCache.length,
      totalGallery: activeGalleryCache.length,
      totalFaqs: activeFaqsCache.length,
      totalTestimonials: activeTestimonialsCache.length,
      totalMediaAssets: activeMediaCache.length,
      serverTime: new Date().toISOString(),
    };
  }

  const [
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    totalEnquiries,
    unreadEnquiries,
    totalDoctors,
    totalServices,
    totalGallery,
    totalFaqs,
    totalTestimonials,
    totalMediaAssets,
  ] = await Promise.all([
    AppointmentModel.countDocuments(),
    AppointmentModel.countDocuments({ status: 'pending' }),
    AppointmentModel.countDocuments({ status: 'confirmed' }),
    AppointmentModel.countDocuments({ status: 'completed' }),
    AppointmentModel.countDocuments({ status: 'cancelled' }),
    EnquiryModel.countDocuments(),
    EnquiryModel.countDocuments({ isRead: false }),
    DoctorModel.countDocuments(),
    ServiceModel.countDocuments(),
    GalleryModel.countDocuments(),
    FAQModel.countDocuments(),
    TestimonialModel.countDocuments(),
    MediaAssetModel.countDocuments(),
  ]);

  return {
    databaseConnected: true,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    totalEnquiries,
    unreadEnquiries,
    totalDoctors,
    totalServices,
    totalGallery,
    totalFaqs,
    totalTestimonials,
    totalMediaAssets: totalMediaAssets || activeMediaCache.length,
    serverTime: new Date().toISOString(),
  };
}

export async function getAdminAppointments(status?: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) return [];

  const query: Record<string, unknown> = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const appointments = await AppointmentModel.find(query).sort({ createdAt: -1 }).select('-__v').lean();
  return appointments.map((a) => ({
    ...a,
    id: a._id.toString(),
  }));
}
