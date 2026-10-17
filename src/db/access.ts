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
} from './models';
import {
  enquiryCreateSchema,
  appointmentBookingSchema,
  doctorSchema,
  DoctorInput,
  serviceSchema,
  ServiceInput,
  testimonialSchema,
  TestimonialInput,
  clinicSettingsSchema,
} from '../validation';
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

export async function getPublicDoctors() {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return initialDoctors;
  }

  const docs = await DoctorModel.find({ isPublished: true })
    .sort({ order: 1, name: 1 })
    .select('-__v')
    .lean();

  if (docs.length === 0) {
    return initialDoctors;
  }

  return docs.map((d) => ({
    ...d,
    id: d._id.toString(),
  }));
}

export async function getPublicDoctorBySlug(slug: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return initialDoctors.find((d) => d.slug === slug) || null;
  }

  const doc = await DoctorModel.findOne({ slug: slug.toLowerCase(), isPublished: true })
    .populate('relatedServiceIds', 'title slug department category')
    .select('-__v')
    .lean();

  if (!doc) {
    return initialDoctors.find((d) => d.slug === slug) || null;
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
    return initialServices;
  }

  const services = await ServiceModel.find({ isPublished: true, isActive: true })
    .sort({ order: 1, title: 1 })
    .select('-__v')
    .lean();

  if (services.length === 0) {
    return initialServices;
  }

  return services.map((s) => ({
    ...s,
    id: s._id.toString(),
  }));
}

export async function getPublicServiceBySlug(slug: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return initialServices.find((s) => s.slug === slug) || null;
  }

  const service = await ServiceModel.findOne({ slug: slug.toLowerCase(), isPublished: true })
    .populate('relatedDoctorIds', 'name slug specialty department avatarUrl')
    .select('-__v')
    .lean();

  if (!service) {
    return initialServices.find((s) => s.slug === slug) || null;
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
    if (category && category !== 'all') {
      return initialGallery.filter((g: GalleryItem) => g.category === category);
    }
    return initialGallery;
  }

  const query: Record<string, unknown> = { isPublished: true };
  if (category && category !== 'all') {
    query.category = category;
  }

  const items = await GalleryModel.find(query).sort({ order: 1, createdAt: -1 }).select('-__v').lean();

  if (items.length === 0 && (!category || category === 'all')) {
    return initialGallery;
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
    if (category && category !== 'all') {
      return initialFAQs.filter((f: FAQItem) => f.category === category);
    }
    return initialFAQs;
  }

  const query: Record<string, unknown> = { isPublished: true, isActive: true };
  if (category && category !== 'all') {
    query.category = category;
  }

  const faqs = await FAQModel.find(query).sort({ order: 1 }).select('-__v').lean();

  if (faqs.length === 0 && (!category || category === 'all')) {
    return initialFAQs;
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
    return [];
  }

  const testimonials = await TestimonialModel.find({ isPublished: true, isVerified: true })
    .sort({ order: 1, createdAt: -1 })
    .select('-__v')
    .lean();

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
    return null;
  }

  const nav = await NavigationModel.findOne({ identifier: 'main_navigation', isPublished: true })
    .select('-__v')
    .lean();

  return nav;
}

export async function getPublicPageBySlug(slug: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) {
    return null;
  }

  const page = await PageModel.findOne({ slug: slug.toLowerCase(), isPublished: true })
    .select('-__v')
    .lean();

  if (!page) return null;

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

export async function createPublicEnquiry(rawInput: unknown) {
  assertServerEnvironment();
  const validated = enquiryCreateSchema.parse(rawInput);

  const conn = await connectToDatabase();
  if (!conn) {
    return {
      success: true,
      data: {
        id: `mock-enq-${Date.now()}`,
        ...validated,
        status: 'new',
        createdAt: new Date(),
      },
      message: 'Enquiry received successfully.',
    };
  }

  const newEnquiry = await EnquiryModel.create({
    name: validated.name,
    email: validated.email,
    phone: validated.phone,
    subject: validated.subject,
    message: validated.message,
    department: validated.department,
    preferredContactMethod: validated.preferredContactMethod,
    status: 'new',
    isRead: false,
  });

  return {
    success: true,
    data: {
      id: newEnquiry._id.toString(),
      name: newEnquiry.name,
      email: newEnquiry.email,
      phone: newEnquiry.phone,
      subject: newEnquiry.subject,
      status: newEnquiry.status,
      createdAt: newEnquiry.createdAt,
    },
    message: 'Enquiry submitted successfully. A clinic representative will contact you.',
  };
}

export async function createPublicAppointment(rawInput: unknown) {
  assertServerEnvironment();
  const validated = appointmentBookingSchema.parse(rawInput);

  const conn = await connectToDatabase();
  const appointmentNumber = `APT-${Date.now().toString().slice(-6)}`;

  if (!conn) {
    return {
      success: true,
      data: {
        id: `apt-${Date.now()}`,
        appointmentNumber,
        ...validated,
        status: 'pending',
        createdAt: new Date(),
      },
      message: `Appointment request ${appointmentNumber} registered.`,
    };
  }

  // Explicit field assignment for mass assignment prevention
  const appointment = await AppointmentModel.create({
    appointmentNumber,
    patientName: validated.patientName,
    patientEmail: validated.patientEmail,
    patientPhone: validated.patientPhone,
    patientAge: validated.patientAge,
    patientGender: validated.patientGender,
    doctorId: validated.doctorId,
    doctorName: validated.doctorName,
    serviceId: validated.serviceId,
    serviceTitle: validated.serviceTitle,
    appointmentDate: validated.appointmentDate,
    timeSlot: validated.timeSlot,
    symptoms: validated.symptoms,
    status: 'pending',
  });

  return {
    success: true,
    data: {
      id: appointment._id.toString(),
      appointmentNumber: appointment.appointmentNumber || appointmentNumber,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      status: appointment.status,
      createdAt: appointment.createdAt,
    },
    message: `Appointment request ${appointmentNumber} registered successfully.`,
  };
}

/**
 * =========================================================================
 * ADMIN / BACK-OFFICE OPERATIONS (Protected mutations with safe checks)
 * =========================================================================
 */

export async function getAdminEnquiries(status?: string) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) return [];

  const query: Record<string, unknown> = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const enquiries = await EnquiryModel.find(query).sort({ createdAt: -1 }).select('-__v').lean();

  return enquiries.map((e) => ({
    ...e,
    id: e._id.toString(),
  }));
}

export async function updateEnquiryStatus(
  id: string,
  update: {
    status?: 'new' | 'in_progress' | 'responded' | 'resolved' | 'archived';
    internalNotes?: string;
    isRead?: boolean;
  }
) {
  assertServerEnvironment();
  const conn = await connectToDatabase();
  if (!conn) return null;

  const safeFields: Record<string, unknown> = {};
  if (update.status) safeFields.status = update.status;
  if (typeof update.isRead === 'boolean') safeFields.isRead = update.isRead;
  if (typeof update.internalNotes === 'string') safeFields.internalNotes = update.internalNotes;

  const updated = await EnquiryModel.findByIdAndUpdate(id, { $set: safeFields }, { new: true })
    .select('-__v')
    .lean();

  return updated ? { ...updated, id: updated._id.toString() } : null;
}

export async function upsertDoctor(data: DoctorInput, doctorId?: string) {
  assertServerEnvironment();
  const validated = doctorSchema.parse(data);
  const conn = await connectToDatabase();
  if (!conn) return null;

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
    languages: validated.languages,
    isAvailable: validated.isAvailable,
    isPublished: true,
  };

  if (doctorId) {
    return DoctorModel.findByIdAndUpdate(doctorId, { $set: payload }, { new: true, runValidators: true });
  } else {
    return DoctorModel.create(payload);
  }
}

export async function upsertService(data: ServiceInput, serviceId?: string) {
  assertServerEnvironment();
  const validated = serviceSchema.parse(data);
  const conn = await connectToDatabase();
  if (!conn) return null;

  const payload = {
    title: validated.title,
    slug: validated.slug.toLowerCase().trim(),
    category: validated.category,
    summary: validated.summary,
    description: validated.description,
    iconName: validated.iconName,
    imageUrl: validated.imageUrl,
    features: validated.features,
    estimatedDurationMinutes: validated.estimatedDurationMinutes,
    priceStartingAt: validated.priceStartingAt,
    department: validated.department,
    isActive: validated.isActive,
    isPublished: true,
  };

  if (serviceId) {
    return ServiceModel.findByIdAndUpdate(serviceId, { $set: payload }, { new: true, runValidators: true });
  } else {
    return ServiceModel.create(payload);
  }
}

export async function upsertTestimonial(data: TestimonialInput, testimonialId?: string) {
  assertServerEnvironment();
  const validated = testimonialSchema.parse(data);
  const conn = await connectToDatabase();
  if (!conn) return null;

  const payload = {
    patientName: validated.patientName,
    patientInitials: validated.patientInitials,
    rating: validated.rating,
    review: validated.review,
    treatmentCategory: validated.treatmentCategory,
    doctorName: validated.doctorName,
    serviceTitle: validated.serviceTitle,
    isVerified: validated.isVerified,
    isPublished: validated.isPublished,
    order: validated.order,
    date: validated.date || new Date().toISOString().split('T')[0],
  };

  if (testimonialId) {
    return TestimonialModel.findByIdAndUpdate(testimonialId, { $set: payload }, { new: true, runValidators: true });
  } else {
    return TestimonialModel.create(payload);
  }
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
      totalDoctors: initialDoctors.length,
      totalServices: initialServices.length,
      totalGallery: initialGallery.length,
      totalFaqs: initialFAQs.length,
      totalTestimonials: 4,
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
