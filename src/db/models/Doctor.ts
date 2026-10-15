import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDoctorDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctorDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    specialty: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    qualifications: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0 },
    bio: { type: String, required: true },
    consultationFee: { type: Number, default: 0 },
    availableDays: [{ type: String }],
    availableTimeSlots: [{ type: String }],
    avatarUrl: { type: String, required: true },
    contactEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DoctorModel: Model<IDoctorDocument> =
  mongoose.models.Doctor || mongoose.model<IDoctorDocument>('Doctor', DoctorSchema);
