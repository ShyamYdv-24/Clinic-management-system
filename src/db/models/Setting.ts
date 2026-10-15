import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettingDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISettingDocument>(
  {
    clinicName: { type: String, required: true, default: 'Om Sai Adarsha Clinic' },
    tagline: { type: String, default: 'Compassionate Care, Advanced Medical Excellence' },
    emergencyPhone: { type: String, default: '+91 98765 43210' },
    generalPhone: { type: String, default: '+91 80 2345 6789' },
    email: { type: String, default: 'care@om-sai-adarsha.clinic' },
    address: {
      street: { type: String, default: '124, Temple Road, Near Sai Mandir' },
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      postalCode: { type: String, default: '560078' },
      landmark: { type: String, default: 'Opposite Adarsha Park' },
    },
    workingHours: {
      weekdays: { type: String, default: '08:00 AM - 09:00 PM' },
      saturday: { type: String, default: '08:00 AM - 08:00 PM' },
      sunday: { type: String, default: '09:00 AM - 02:00 PM' },
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
    },
    announcementNotice: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SettingModel: Model<ISettingDocument> =
  mongoose.models.Setting || mongoose.model<ISettingDocument>('Setting', SettingSchema);
