import mongoose, { Schema, Document, Model } from 'mongoose';

export type GalleryCategory =
  | 'facilities'
  | 'laboratories'
  | 'consultation'
  | 'equipment'
  | 'events'
  | 'team';

export interface IGalleryItemDocument extends Document {
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  mediaAssetId?: mongoose.Types.ObjectId;
  description?: string;
  featured: boolean;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGalleryItemDocument>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['facilities', 'laboratories', 'consultation', 'equipment', 'events', 'team'],
      default: 'facilities',
      index: true,
    },
    imageUrl: { type: String, required: true },
    mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    description: { type: String, trim: true },
    featured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

GallerySchema.index({ isPublished: 1, order: 1 });
GallerySchema.index({ title: 'text', description: 'text' });

export const GalleryModel: Model<IGalleryItemDocument> =
  mongoose.models.Gallery || mongoose.model<IGalleryItemDocument>('Gallery', GallerySchema);

// Backwards-compatible aliases
export const GalleryItemModel = GalleryModel;
export type IGalleryDocument = IGalleryItemDocument;
