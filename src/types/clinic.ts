export type Role = 'superadmin' | 'admin' | 'staff';

export interface Doctor {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  department: string;
  qualifications: string[];
  experienceYears: number;
  bio: string;
  consultationFee: number;
  availableDays: string[];
  availableTimeSlots: string[];
  avatarUrl: string;
  contactEmail?: string;
  phone?: string;
  languages?: string[];
  relatedServiceSlugs?: string[];
  isAvailable: boolean;
  order: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  iconName: string;
  imageUrl: string;
  features: string[];
  estimatedDurationMinutes?: number;
  priceStartingAt?: number;
  department: string;
  relatedDoctorIds?: string[];
  isActive: boolean;
  order: number;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  doctorId: string;
  doctorName: string;
  serviceId?: string;
  serviceTitle?: string;
  appointmentDate: string;
  timeSlot: string;
  symptoms?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'facilities' | 'laboratories' | 'consultation' | 'equipment' | 'events' | 'team';
  imageUrl: string;
  description?: string;
  featured: boolean;
  uploadedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'appointments' | 'services' | 'insurance' | 'emergency';
  order: number;
  isActive: boolean;
}

export interface DaySchedule {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
  order: number;
}

export interface ClinicSettings {
  // 1. Clinic Identity
  clinicName: string;
  tagline: string;
  mainLogoUrl?: string;
  lightLogoUrl?: string;
  darkLogoUrl?: string;
  faviconUrl?: string;
  defaultOgImage?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  aboutBrief: string;
  establishedYear?: number;
  registrationNumber?: string;
  directorName?: string;

  // 2. Contact Information
  emergencyPhone: string;
  generalPhone: string;
  whatsappNumber?: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    landmark?: string;
  };
  mapsEmbedUrl?: string;
  googleMapsUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  clickToCallEnabled?: boolean;
  whatsappCtaEnabled?: boolean;

  // 3. Opening Hours
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    emergency24x7: boolean;
  };
  dailySchedule?: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  holidayNotices?: string;
  displayPreferences?: 'detailed' | 'compact';
  timezone?: string;

  // 4. Social Profiles
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };

  // 5. Website & SEO
  productionUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  searchConsoleVerification?: string;
  analyticsId?: string;
  cookieConsentEnabled?: boolean;
  structuredData?: {
    clinicType?: string;
    priceRange?: string;
    medicalSpecialty?: string;
  };

  // 6. Header and Footer
  headerLogoStyle?: 'text_and_icon' | 'custom_image' | 'text_only';
  navLinks?: NavLinkItem[];
  footerDescription?: string;
  footerCopyrightText?: string;
  appointmentCtaLabel?: string;
  whatsappCtaLabel?: string;
  announcementNotice?: string;

  // 7. Appointment Configuration
  appointmentWhatsAppNumber?: string;
  whatsappTemplate?: string;
  requireSymptoms?: boolean;
  requireAge?: boolean;
  requireGender?: boolean;
  appointmentDisclaimer?: string;
  consentText?: string;
  enquiryNotificationEmail?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
