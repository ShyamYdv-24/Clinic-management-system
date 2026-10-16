import mongoose, { Schema, Document, Model } from 'mongoose';

export type EnquiryStatus = 'new' | 'in_progress' | 'responded' | 'resolved' | 'archived';

export interface IEnquiryDocument extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  department?: string;
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  status: EnquiryStatus;
  isRead: boolean;
  assignedAdminId?: mongoose.Types.ObjectId;
  internalNotes?: string;
  responseSentAt?: Date;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Patient or visitor name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Valid email address is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'whatsapp'],
      default: 'phone',
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'responded', 'resolved', 'archived'],
      default: 'new',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    assignedAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    internalNotes: {
      type: String,
      trim: true,
    },
    responseSentAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search and filtering indexes
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ name: 'text', subject: 'text', message: 'text', email: 'text' });

export const EnquiryModel: Model<IEnquiryDocument> =
  mongoose.models.Enquiry || mongoose.model<IEnquiryDocument>('Enquiry', EnquirySchema);
