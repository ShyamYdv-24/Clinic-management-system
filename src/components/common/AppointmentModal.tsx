import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { appointmentEnquirySchema, AppointmentEnquiryInput } from '../../validation/enquiry.schema';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctorId?: string;
  preselectedServiceTitle?: string;
}

interface SubmissionResult {
  reference: string;
  whatsappUrl: string;
  isDuplicate?: boolean;
  patientName: string;
  patientPhone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  doctorOrService: string;
}

const TIME_SLOTS = [
  '09:30 AM - 11:30 AM (Morning OPD)',
  '11:30 AM - 01:30 PM (Midday OPD)',
  '05:00 PM - 07:00 PM (Evening OPD)',
  '07:00 PM - 08:30 PM (Night Clinic)',
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctorId,
  preselectedServiceTitle,
}) => {
  const { doctors, services, settings } = useClinic();

  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [modalRenderTime, setModalRenderTime] = useState(Date.now());

  // Calculate tomorrow as default min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentEnquiryInput>({
    defaultValues: {
      patientName: '',
      patientPhone: '',
      preferredDate: tomorrowStr,
      preferredTimeSlot: TIME_SLOTS[0],
      doctorId: preselectedDoctorId || '',
      doctorName: '',
      serviceId: '',
      serviceTitle: preselectedServiceTitle || '',
      message: '',
      consentGiven: true,
      honeypot: '',
    },
  });

  const selectedDoctorId = watch('doctorId');

  // Update doctorName whenever doctorId changes
  useEffect(() => {
    if (selectedDoctorId) {
      const doc = doctors.find((d) => d.id === selectedDoctorId);
      if (doc) {
        setValue('doctorName', doc.name);
      }
    }
  }, [selectedDoctorId, doctors, setValue]);

  // Sync preselected values when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalRenderTime(Date.now());
      setSubmissionResult(null);
      setServerError(null);
      setCopiedRef(false);

      if (preselectedDoctorId) {
        setValue('doctorId', preselectedDoctorId);
        const doc = doctors.find((d) => d.id === preselectedDoctorId);
        if (doc) setValue('doctorName', doc.name);
      } else if (doctors.length > 0) {
        setValue('doctorId', doctors[0].id);
        setValue('doctorName', doctors[0].name);
      }

      if (preselectedServiceTitle) {
        setValue('serviceTitle', preselectedServiceTitle);
      }
    }
  }, [isOpen, preselectedDoctorId, preselectedServiceTitle, doctors, setValue]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleResetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    reset();
    setSubmissionResult(null);
    setServerError(null);
    setCopiedRef(false);
    onClose();
  };

  const onSubmit = async (data: AppointmentEnquiryInput) => {
    setServerError(null);

    // Minimum form interaction time check (anti-bot)
    if (Date.now() - modalRenderTime < 1000) {
      setServerError('Form submitted too rapidly. Please review your details and submit again.');
      return;
    }

    // Client-side validation via Zod
    const validation = appointmentEnquirySchema.safeParse(data);
    if (!validation.success) {
      setServerError(validation.error.issues[0]?.message || 'Please check the form inputs.');
      return;
    }

    try {
      const response = await fetch('/api/enquiries/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to register appointment request. Please contact clinic reception.');
      }

      // Record persisted enquiry result
      const docOrService =
        data.doctorName ||
        data.serviceTitle ||
        doctors.find((d) => d.id === data.doctorId)?.name ||
        'General Outpatient Consultation';

      setSubmissionResult({
        reference: json.reference,
        whatsappUrl: json.whatsappUrl,
        isDuplicate: json.isDuplicate,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        preferredDate: data.preferredDate,
        preferredTimeSlot: data.preferredTimeSlot,
        doctorOrService: docOrService,
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'An error occurred while logging your enquiry.');
    }
  };

  const handleCopyReference = () => {
    if (submissionResult?.reference) {
      navigator.clipboard.writeText(submissionResult.reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 3000);
    }
  };

  const handleOpenWhatsApp = () => {
    if (submissionResult?.whatsappUrl) {
      window.open(submissionResult.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
    >
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Close Appointment Modal"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* ---------------- CONFIRMATION & WHATSAPP STEP ---------------- */}
        {submissionResult ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 id="appointment-modal-title" className="text-xl font-bold text-slate-900">
                {submissionResult.isDuplicate ? 'Enquiry Already Received' : 'Enquiry Recorded Successfully!'}
              </h3>
              <p className="text-xs text-slate-500">
                Your consultation request has been stored in our clinic registry.
              </p>
            </div>

            {/* Reference Number Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Appointment Reference Number
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-mono font-bold text-emerald-800 tracking-wide">
                  {submissionResult.reference}
                </span>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Copy Reference"
                  aria-label="Copy Reference Number"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Status: Received — Pending Clinic Confirmation</span>
              </div>
            </div>

            {/* Summary Details */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-semibold text-slate-800">{submissionResult.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consultation:</span>
                <span className="font-semibold text-slate-800">{submissionResult.doctorOrService}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Slot:</span>
                <span className="font-semibold text-slate-800">
                  {submissionResult.preferredDate} ({submissionResult.preferredTimeSlot.split(' ')[0]})
                </span>
              </div>
            </div>

            {/* Crucial Medical Disclaimers & Next Step */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 space-y-2">
              <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Next Step: Forward to Reception via WhatsApp</span>
              </p>
              <p className="text-[11px] leading-relaxed text-emerald-800/90">
                To expedite confirmation, send your pre-filled enquiry details directly to our reception WhatsApp desk.
                Opening WhatsApp does <strong>not</strong> send the message automatically; please tap <strong>Send</strong> in WhatsApp.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Send className="w-4 h-4" />
                <span>Open WhatsApp to Send Details</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full text-slate-500 hover:text-slate-700 font-medium py-2 text-xs transition-colors cursor-pointer"
              >
                Close & Return to Clinic Site
              </button>
            </div>

            {/* Fallback Phone Support */}
            <p className="text-[11px] text-center text-slate-400 pt-1 border-t border-slate-100">
              WhatsApp not opening? Call reception directly at{' '}
              <a
                href={`tel:${(settings.emergencyPhone || '+919876543210').replace(/\s+/g, '')}`}
                className="font-semibold text-emerald-700 hover:underline"
              >
                {settings.emergencyPhone || '+91 98765 43210'}
              </a>{' '}
              and quote your reference code.
            </p>
          </div>
        ) : (
          /* ---------------- APPOINTMENT ENQUIRY FORM ---------------- */
          <div>
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold mb-2">
                <Stethoscope className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Outpatient Appointment Enquiry</span>
              </div>
              <h3 id="appointment-modal-title" className="text-xl font-bold text-slate-900">
                Book a Consultation
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Submit your preferred date and consulting doctor. Our reception will review schedule availability.
              </p>
            </div>

            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Submission Notice</p>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Anti-spam honeypot (hidden from human users) */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register('honeypot')}
                className="hidden"
                aria-hidden="true"
              />

              {/* Patient Name */}
              <div>
                <label htmlFor="patientName" className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
                  <input
                    id="patientName"
                    type="text"
                    {...register('patientName', { required: 'Patient name is required' })}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.patientName ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
                    }`}
                    placeholder="e.g. Ramesh Kumar"
                    aria-describedby={errors.patientName ? 'patientName-error' : undefined}
                    aria-invalid={!!errors.patientName}
                  />
                </div>
                {errors.patientName && (
                  <p id="patientName-error" role="alert" aria-live="polite" className="text-[11px] text-rose-600 mt-1">
                    {errors.patientName.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="patientPhone" className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Mobile Number (WhatsApp-enabled) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
                  <input
                    id="patientPhone"
                    type="tel"
                    {...register('patientPhone', { required: 'Mobile number is required' })}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-colors ${
                      errors.patientPhone ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
                    }`}
                    placeholder="+91 98765 43210"
                    aria-describedby={errors.patientPhone ? 'patientPhone-error' : undefined}
                    aria-invalid={!!errors.patientPhone}
                  />
                </div>
                {errors.patientPhone && (
                  <p id="patientPhone-error" role="alert" aria-live="polite" className="text-[11px] text-rose-600 mt-1">
                    {errors.patientPhone.message}
                  </p>
                )}
              </div>

              {/* Doctor / Specialist Selection */}
              <div>
                <label htmlFor="doctorId" className="block text-xs font-semibold text-slate-700 mb-1">
                  Consulting Doctor / Specialist
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
                  <select
                    id="doctorId"
                    {...register('doctorId')}
                    className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">General OPD (First Available Doctor)</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="preferredDate" className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
                    <input
                      id="preferredDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      {...register('preferredDate', { required: 'Preferred date is required' })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  {errors.preferredDate && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.preferredDate.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="preferredTimeSlot" className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Time Slot <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
                    <select
                      id="preferredTimeSlot"
                      {...register('preferredTimeSlot', { required: 'Time slot is required' })}
                      className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Message / Symptoms */}
              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Short Note or Symptoms
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
                  <textarea
                    id="message"
                    rows={2}
                    {...register('message')}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Brief description of primary symptoms, follow-up, or medical history..."
                  />
                </div>
              </div>

              {/* Privacy Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('consentGiven', {
                      required: 'You must provide consent for clinic communication',
                    })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    I consent to Om Sai Adarsha Clinic contacting me via WhatsApp and Phone regarding this consultation enquiry.
                    (Strict medical privacy; details are never shared with third parties).
                  </span>
                </label>
                {errors.consentGiven && (
                  <p role="alert" aria-live="polite" className="text-[11px] text-rose-600 mt-1 ml-6">{errors.consentGiven.message}</p>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Recording Consultation Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Request Appointment & Open WhatsApp</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400">
                Notice: All outpatient appointments are subject to clinical triage and doctor availability.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
