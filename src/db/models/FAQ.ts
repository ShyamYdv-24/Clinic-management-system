import mongoose, { Schema, Document, Model } from 'mongoose';

export type FAQCategory = 'general' | 'appointments' | 'services' | 'insurance' | 'emergency';

export interface IFAQDocument extends Document {
  question: string;
  answer: string;
  category: FAQCategory;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQDocument>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['general', 'appointments', 'services', 'insurance', 'emergency'],
      default: 'general',
      index: true,
    },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

FAQSchema.index({ isPublished: 1, order: 1 });
FAQSchema.index({ question: 'text', answer: 'text' });

export const FAQModel: Model<IFAQDocument> =
  mongoose.models.FAQ || mongoose.model<IFAQDocument>('FAQ', FAQSchema);
