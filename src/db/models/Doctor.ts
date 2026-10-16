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
  avatarMediaId?: mongoose.Types.ObjectId;
  contactEmail?: string;
  phone?: string;
  languages: string[];
  relatedServiceIds: mongoose.Types.ObjectId[];
  isAvailable: boolean;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctorDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    specialty: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    qualifications: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0 },
    bio: { type: String, required: true },
    consultationFee: { type: Number, default: 0 },
    availableDays: [{ type: String }],
    availableTimeSlots: [{ type: String }],
    avatarUrl: { type: String, required: true },
    avatarMediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    contactEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    languages: [{ type: String, trim: true }],
    relatedServiceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    isAvailable: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

// Search and compound index
DoctorSchema.index({ isPublished: 1, order: 1 });
DoctorSchema.index({ name: 'text', specialty: 'text', department: 'text', bio: 'text' });

export const DoctorModel: Model<IDoctorDocument> =
  mongoose.models.Doctor || mongoose.model<IDoctorDocument>('Doctor', DoctorSchema);
