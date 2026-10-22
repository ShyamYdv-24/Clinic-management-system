import mongoose, { Schema, Document, Model } from 'mongoose';

export type EnquiryStatus = 'new' | 'contacted' | 'confirmed' | 'closed';

export interface IEnquiryHistoryItem {
  status: EnquiryStatus;
  note?: string;
  timestamp: Date;
  updatedBy: string;
}

export interface IEnquiryDocument extends Document {
  referenceNumber: string;
  patientName: string;
  patientPhone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  doctorId?: string;
  doctorName?: string;
  serviceId?: string;
  serviceTitle?: string;
  message?: string;
  consentGiven: boolean;
  consentTimestamp: Date;
  status: EnquiryStatus;
  isRead: boolean;
  internalNotes?: string;
  history: IEnquiryHistoryItem[];
  ipAddress?: string;
  whatsappUrl?: string;
  source: 'appointment_modal' | 'contact_form' | 'direct';
  createdAt: Date;
  updatedAt: Date;
}

const EnquiryHistorySchema = new Schema<IEnquiryHistoryItem>(
  {
    status: {
      type: String,
      enum: ['new', 'contacted', 'confirmed', 'closed'],
      required: true,
    },
    note: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'System' },
  },
  { _id: false }
);

const EnquirySchema = new Schema<IEnquiryDocument>(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      index: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone number is required'],
      trim: true,
      index: true,
    },
    preferredDate: {
      type: String,
      required: [true, 'Preferred appointment date is required'],
      index: true,
    },
    preferredTimeSlot: {
      type: String,
      required: [true, 'Preferred consultation slot is required'],
    },
    doctorId: {
      type: String,
      trim: true,
    },
    doctorName: {
      type: String,
      trim: true,
    },
    serviceId: {
      type: String,
      trim: true,
    },
    serviceTitle: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    consentGiven: {
      type: Boolean,
      required: true,
      default: true,
    },
    consentTimestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'confirmed', 'closed'],
      default: 'new',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    internalNotes: {
      type: String,
      trim: true,
    },
    history: {
      type: [EnquiryHistorySchema],
      default: [],
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    whatsappUrl: {
      type: String,
    },
    source: {
      type: String,
      enum: ['appointment_modal', 'contact_form', 'direct'],
      default: 'appointment_modal',
    },
  },
  {
    timestamps: true,
  }
);

// High performance compound indexes for filtering and search
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ preferredDate: 1, status: 1 });
EnquirySchema.index({ patientPhone: 1, createdAt: -1 });
EnquirySchema.index({
  referenceNumber: 'text',
  patientName: 'text',
  patientPhone: 'text',
  doctorName: 'text',
  serviceTitle: 'text',
});

export const EnquiryModel: Model<IEnquiryDocument> =
  mongoose.models.Enquiry || mongoose.model<IEnquiryDocument>('Enquiry', EnquirySchema);
