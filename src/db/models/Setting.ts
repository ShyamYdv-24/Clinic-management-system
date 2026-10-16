import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettingsDocument extends Document {
  clinicName: string;
  tagline: string;
  emergencyPhone: string;
  generalPhone: string;
  whatsappNumber?: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
  };
  mapsEmbedUrl?: string;
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
  metaDescription?: string;
  announcementNotice?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    clinicName: { type: String, required: true, default: 'Om Sai Adarsha Clinic', trim: true },
    tagline: { type: String, default: 'Compassionate Care, Advanced Medical Excellence', trim: true },
    emergencyPhone: { type: String, default: '+91 98765 43210', trim: true },
    generalPhone: { type: String, default: '+91 80 2345 6789', trim: true },
    whatsappNumber: { type: String, default: '+91 98765 43210', trim: true },
    email: { type: String, default: 'care@om-sai-adarsha.clinic', lowercase: true, trim: true },
    address: {
      street: { type: String, default: '124, Temple Road, Near Sai Mandir', trim: true },
      city: { type: String, default: 'Bengaluru', trim: true },
      state: { type: String, default: 'Karnataka', trim: true },
      postalCode: { type: String, default: '560078', trim: true },
      landmark: { type: String, default: 'Opposite Adarsha Park', trim: true },
    },
    mapsEmbedUrl: { type: String, trim: true },
    workingHours: {
      weekdays: { type: String, default: '08:00 AM - 09:00 PM', trim: true },
      saturday: { type: String, default: '08:00 AM - 08:00 PM', trim: true },
      sunday: { type: String, default: '09:00 AM - 02:00 PM', trim: true },
      emergency24x7: { type: Boolean, default: true },
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com' },
      instagram: { type: String, default: 'https://instagram.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      youtube: { type: String, default: 'https://youtube.com' },
    },
    aboutBrief: {
      type: String,
      default:
        'Om Sai Adarsha Clinic is committed to providing patient-centered, comprehensive healthcare with experienced medical specialists, cutting-edge diagnostic equipment, and personalized attention.',
      trim: true,
    },
    metaDescription: {
      type: String,
      default:
        'Om Sai Adarsha Clinic offers expert doctor consultations, automated pathology lab tests, and 24x7 emergency medical assistance in Bengaluru.',
      trim: true,
    },
    announcementNotice: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export const SiteSettingsModel: Model<ISiteSettingsDocument> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema);

// Backwards-compatible alias
export const SettingModel = SiteSettingsModel;
export type ISettingDocument = ISiteSettingsDocument;
