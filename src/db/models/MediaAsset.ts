import mongoose, { Schema, Document, Model } from 'mongoose';

export type MediaCategory =
  | 'logos'
  | 'doctors'
  | 'services'
  | 'gallery'
  | 'facilities'
  | 'banners'
  | 'social'
  | 'general'
  | 'documents';

export interface IMediaAssetDocument extends Document {
  title: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  secureUrl: string;
  publicId?: string; // Cloudinary asset ID or unique storage reference
  category: MediaCategory;
  altText: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
  tags: string[];
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAssetDocument>(
  {
    title: {
      type: String,
      required: [true, 'Asset title is required'],
      trim: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 0,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    secureUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['logos', 'doctors', 'services', 'gallery', 'facilities', 'banners', 'social', 'general', 'documents'],
      default: 'general',
      index: true,
    },
    altText: {
      type: String,
      required: true,
      trim: true,
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
    tags: [{ type: String, trim: true }],
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

MediaAssetSchema.index({ category: 1, createdAt: -1 });
MediaAssetSchema.index({ title: 'text', altText: 'text', tags: 'text' });

export const MediaAssetModel: Model<IMediaAssetDocument> =
  mongoose.models.MediaAsset || mongoose.model<IMediaAssetDocument>('MediaAsset', MediaAssetSchema);
