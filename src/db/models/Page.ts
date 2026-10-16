import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPageSection {
  sectionKey: string;
  heading?: string;
  subheading?: string;
  content?: string;
  mediaUrl?: string;
  order: number;
  isPublished: boolean;
  extraData?: Record<string, unknown>;
}

export interface IPageDocument extends Document {
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: IPageSection[];
  isPublished: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSectionSchema = new Schema<IPageSection>(
  {
    sectionKey: { type: String, required: true, trim: true },
    heading: { type: String, trim: true },
    subheading: { type: String, trim: true },
    content: { type: String },
    mediaUrl: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    extraData: { type: Schema.Types.Mixed },
  },
  { _id: true }
);

const PageSchema = new Schema<IPageDocument>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    sections: [PageSectionSchema],
    isPublished: { type: Boolean, default: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

PageSchema.index({ slug: 1, isPublished: 1 });

export const PageModel: Model<IPageDocument> =
  mongoose.models.Page || mongoose.model<IPageDocument>('Page', PageSchema);
