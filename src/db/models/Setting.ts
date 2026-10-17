import mongoose, { Schema, Document, Model } from 'mongoose';
import { ClinicSettings } from '../../types/clinic';

export interface ISiteSettingsDocument extends Document, ClinicSettings {
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema(
  {
    // 1. Clinic Identity
    clinicName: { type: String, required: true, default: 'Om Sai Adarsha Clinic', trim: true },
    tagline: { type: String, default: 'Compassionate Care, Advanced Medical Excellence', trim: true },
    mainLogoUrl: { type: String, default: '', trim: true },
    lightLogoUrl: { type: String, default: '', trim: true },
    darkLogoUrl: { type: String, default: '', trim: true },
    faviconUrl: { type: String, default: '/favicon.ico', trim: true },
    defaultOgImage: { type: String, default: '/og-image.jpg', trim: true },
    brandPrimaryColor: { type: String, default: '#059669', trim: true },
    brandSecondaryColor: { type: String, default: '#0f172a', trim: true },
    aboutBrief: {
      type: String,
      default:
        'Om Sai Adarsha Clinic is committed to providing patient-centered, comprehensive healthcare with experienced medical specialists, cutting-edge diagnostic equipment, and personalized attention.',
      trim: true,
    },
    establishedYear: { type: Number, default: 2012 },
    registrationNumber: { type: String, default: 'REG/MED/KA/2012/9941', trim: true },
    directorName: { type: String, default: 'Dr. Suresh Kumar M.D.', trim: true },

    // 2. Contact Information
    emergencyPhone: { type: String, default: '+91 98765 43210', trim: true },
    generalPhone: { type: String, default: '+91 80 2345 6789', trim: true },
    whatsappNumber: { type: String, default: '+91 98765 43210', trim: true },
    email: { type: String, default: 'care@om-sai-adarsha.clinic', lowercase: true, trim: true },
    address: {
      street: { type: String, default: '124, Temple Road, Near Sai Mandir', trim: true },
      city: { type: String, default: 'Bengaluru', trim: true },
      state: { type: String, default: 'Karnataka', trim: true },
      postalCode: { type: String, default: '560078', trim: true },
      country: { type: String, default: 'India', trim: true },
      landmark: { type: String, default: 'Opposite Adarsha Park', trim: true },
    },
    mapsEmbedUrl: { type: String, trim: true },
    googleMapsUrl: { type: String, default: 'https://maps.google.com/?q=12.918732,77.583344', trim: true },
    coordinates: {
      lat: { type: Number, default: 12.918732 },
      lng: { type: Number, default: 77.583344 },
    },
    clickToCallEnabled: { type: Boolean, default: true },
    whatsappCtaEnabled: { type: Boolean, default: true },

    // 3. Opening Hours
    workingHours: {
      weekdays: { type: String, default: '08:00 AM - 09:00 PM', trim: true },
      saturday: { type: String, default: '08:00 AM - 08:00 PM', trim: true },
      sunday: { type: String, default: '09:00 AM - 02:00 PM', trim: true },
      emergency24x7: { type: Boolean, default: true },
    },
    dailySchedule: {
      monday: { open: { type: String, default: '08:00' }, close: { type: String, default: '21:00' }, isClosed: { type: Boolean, default: false } },
      tuesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '21:00' }, isClosed: { type: Boolean, default: false } },
      wednesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '21:00' }, isClosed: { type: Boolean, default: false } },
      thursday: { open: { type: String, default: '08:00' }, close: { type: String, default: '21:00' }, isClosed: { type: Boolean, default: false } },
      friday: { open: { type: String, default: '08:00' }, close: { type: String, default: '21:00' }, isClosed: { type: Boolean, default: false } },
      saturday: { open: { type: String, default: '08:00' }, close: { type: String, default: '20:00' }, isClosed: { type: Boolean, default: false } },
      sunday: { open: { type: String, default: '09:00' }, close: { type: String, default: '14:00' }, isClosed: { type: Boolean, default: false } },
    },
    holidayNotices: { type: String, default: 'Emergency department and 24x7 triage remain operational on all public holidays.', trim: true },
    displayPreferences: { type: String, default: 'detailed', enum: ['detailed', 'compact'] },
    timezone: { type: String, default: 'Asia/Kolkata', trim: true },

    // 4. Social Profiles
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com/om-sai-adarsha-clinic' },
      instagram: { type: String, default: 'https://instagram.com/om-sai-adarsha-clinic' },
      twitter: { type: String, default: 'https://twitter.com/omsaiclinic' },
      youtube: { type: String, default: 'https://youtube.com/@om-sai-adarsha-clinic' },
      linkedin: { type: String, default: 'https://linkedin.com/company/om-sai-adarsha-clinic' },
    },

    // 5. Website & SEO
    productionUrl: { type: String, default: 'https://om-sai-adarsha.clinic', trim: true },
    metaTitle: { type: String, default: 'Om Sai Adarsha Clinic — Comprehensive Healthcare & Diagnostics', trim: true },
    metaDescription: {
      type: String,
      default:
        'Om Sai Adarsha Clinic offers expert doctor consultations, automated pathology lab tests, and 24x7 emergency medical assistance in Bengaluru.',
      trim: true,
    },
    ogImage: { type: String, default: '/og-image.jpg', trim: true },
    searchConsoleVerification: { type: String, default: '', trim: true },
    analyticsId: { type: String, default: '', trim: true },
    cookieConsentEnabled: { type: Boolean, default: true },
    structuredData: {
      clinicType: { type: String, default: 'MedicalClinic' },
      priceRange: { type: String, default: '₹₹' },
      medicalSpecialty: { type: String, default: 'General Practice, Diabetology, Cardiology, Pediatrics' },
    },

    // 6. Header and Footer
    headerLogoStyle: { type: String, default: 'text_and_icon', enum: ['text_and_icon', 'custom_image', 'text_only'] },
    navLinks: [
      {
        id: String,
        label: String,
        href: String,
        isVisible: Boolean,
        order: Number,
      },
    ],
    footerDescription: {
      type: String,
      default:
        'Dedicated outpatient consultation, preventative health packages, diagnostic pathology, emergency stabilization, and pediatric care with an unwavering commitment to patient dignity and medical ethics.',
      trim: true,
    },
    footerCopyrightText: { type: String, default: '© 2026 Om Sai Adarsha Clinic. All rights reserved.', trim: true },
    appointmentCtaLabel: { type: String, default: 'Book Appointment', trim: true },
    whatsappCtaLabel: { type: String, default: 'WhatsApp Us', trim: true },
    announcementNotice: { type: String, default: '', trim: true },

    // 7. Appointment Configuration
    appointmentWhatsAppNumber: { type: String, default: '+91 98765 43210', trim: true },
    whatsappTemplate: {
      type: String,
      default:
        'Hello Om Sai Adarsha Clinic, I would like to book a consultation for {patientName} for {service} on {date}.',
      trim: true,
    },
    requireSymptoms: { type: Boolean, default: true },
    requireAge: { type: Boolean, default: false },
    requireGender: { type: Boolean, default: false },
    appointmentDisclaimer: {
      type: String,
      default:
        'Appointments booked online are subject to doctor emergency availability. Please arrive 15 minutes before your time slot.',
      trim: true,
    },
    consentText: {
      type: String,
      default:
        'I agree to the clinic privacy policy and consent to receiving appointment updates via SMS and WhatsApp.',
      trim: true,
    },
    enquiryNotificationEmail: { type: String, default: 'reception@om-sai-adarsha.clinic', trim: true },
  },
  { timestamps: true, strict: false }
);

export const SiteSettingsModel: Model<ISiteSettingsDocument> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema);

// Backwards-compatible aliases
export const SettingModel = SiteSettingsModel;
export type ISettingDocument = ISiteSettingsDocument;
