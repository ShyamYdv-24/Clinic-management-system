import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestimonialDocument extends Document {
  patientName: string;
  patientInitials?: string;
  rating: number; // 1 to 5
  review: string;
  treatmentCategory?: string;
  doctorId?: mongoose.Types.ObjectId;
  doctorName?: string;
  serviceId?: mongoose.Types.ObjectId;
  serviceTitle?: string;
  isVerified: boolean;
  isPublished: boolean;
  order: number;
  date?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonialDocument>(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientInitials: {
      type: String,
      trim: true,
      maxlength: 4,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    review: {
      type: String,
      required: [true, 'Patient testimonial text is required'],
      trim: true,
    },
    treatmentCategory: {
      type: String,
      trim: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    doctorName: {
      type: String,
      trim: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
    },
    serviceTitle: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    date: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for public ordering and filtering
TestimonialSchema.index({ isPublished: 1, order: 1, createdAt: -1 });
TestimonialSchema.index({ review: 'text', patientName: 'text', treatmentCategory: 'text' });

export const TestimonialModel: Model<ITestimonialDocument> =
  mongoose.models.Testimonial || mongoose.model<ITestimonialDocument>('Testimonial', TestimonialSchema);
