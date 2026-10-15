import { z } from 'zod';

export const appointmentBookingSchema = z.object({
  patientName: z.string().trim().min(2, 'Full name is required (min 2 characters)'),
  patientEmail: z.string().trim().email('Valid email address is required'),
  patientPhone: z.string().trim().min(8, 'Valid phone number is required'),
  patientAge: z.number().int().min(0).max(125).optional(),
  patientGender: z.enum(['male', 'female', 'other']).optional(),
  doctorId: z.string().min(1, 'Please select a doctor'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  serviceId: z.string().optional(),
  serviceTitle: z.string().optional(),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  symptoms: z.string().trim().max(1000).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

export type AppointmentBookingInput = z.infer<typeof appointmentBookingSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
