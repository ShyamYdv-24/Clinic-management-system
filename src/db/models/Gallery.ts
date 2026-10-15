import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryDocument extends Document {
  title: string;
  category: 'facilities' | 'laboratories' | 'consultation' | 'equipment' | 'events' | 'team';
  imageUrl: string;
  description?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGalleryDocument>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['facilities', 'laboratories', 'consultation', 'equipment', 'events', 'team'],
      default: 'facilities',
      index: true,
    },
    imageUrl: { type: String, required: true },
    description: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const GalleryModel: Model<IGalleryDocument> =
  mongoose.models.Gallery || mongoose.model<IGalleryDocument>('Gallery', GallerySchema);
