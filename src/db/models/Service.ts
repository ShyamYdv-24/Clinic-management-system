import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceDocument extends Document {
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  iconName: string;
  imageUrl: string;
  imageMediaId?: mongoose.Types.ObjectId;
  features: string[];
  estimatedDurationMinutes?: number;
  priceStartingAt?: number;
  department: string;
  relatedDoctorIds?: mongoose.Types.ObjectId[];
  isActive: boolean;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IServiceDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: { type: String, required: true, trim: true, index: true },
    summary: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    iconName: { type: String, default: 'Activity', trim: true },
    imageUrl: { type: String, required: true },
    imageMediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    features: [{ type: String, trim: true }],
    estimatedDurationMinutes: { type: Number },
    priceStartingAt: { type: Number },
    department: { type: String, required: true, trim: true, index: true },
    relatedDoctorIds: [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],
    isActive: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

// Compound indexing and search
ServiceSchema.index({ isPublished: 1, order: 1 });
ServiceSchema.index({ title: 'text', summary: 'text', description: 'text', department: 'text' });

export const ServiceModel: Model<IServiceDocument> =
  mongoose.models.Service || mongoose.model<IServiceDocument>('Service', ServiceSchema);
