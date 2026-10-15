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

export interface ClinicSettings {
  clinicName: string;
  tagline: string;
  emergencyPhone: string;
  generalPhone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
  };
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    emergency24x7: boolean;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  aboutBrief: string;
  announcementNotice?: string;
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
