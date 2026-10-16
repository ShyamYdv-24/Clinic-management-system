import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppointmentDocument extends Document {
  appointmentNumber?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  doctorId: mongoose.Types.ObjectId | string;
  doctorName: string;
  serviceId?: mongoose.Types.ObjectId | string;
  serviceTitle?: string;
  appointmentDate: string;
  timeSlot: string;
  symptoms?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointmentDocument>(
  {
    appointmentNumber: { type: String, trim: true, index: true },
    patientName: { type: String, required: true, trim: true },
    patientEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    patientPhone: { type: String, required: true, trim: true, index: true },
    patientAge: { type: Number },
    patientGender: { type: String, enum: ['male', 'female', 'other'] },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    serviceId: { type: String },
    serviceTitle: { type: String },
    appointmentDate: { type: String, required: true },
    timeSlot: { type: String, required: true },
    symptoms: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

AppointmentSchema.index({ status: 1, appointmentDate: 1 });
AppointmentSchema.index({ patientName: 'text', patientPhone: 'text', appointmentNumber: 'text' });

export const AppointmentModel: Model<IAppointmentDocument> =
  mongoose.models.Appointment || mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
