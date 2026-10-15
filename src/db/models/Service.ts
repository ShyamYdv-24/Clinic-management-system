import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IServiceDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    iconName: { type: String, default: 'Activity' },
    imageUrl: { type: String, required: true },
    features: [{ type: String, trim: true }],
    estimatedDurationMinutes: { type: Number },
    priceStartingAt: { type: Number },
    department: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ServiceModel: Model<IServiceDocument> =
  mongoose.models.Service || mongoose.model<IServiceDocument>('Service', ServiceSchema);
