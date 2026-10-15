import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFAQDocument extends Document {
  question: string;
  answer: string;
  category: 'general' | 'appointments' | 'services' | 'insurance' | 'emergency';
  order: number;
  isActive: boolean;
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
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FAQModel: Model<IFAQDocument> =
  mongoose.models.FAQ || mongoose.model<IFAQDocument>('FAQ', FAQSchema);
