import React from 'react';
import { ArrowLeft, Calendar, Clock, Award, Phone, Mail, CheckCircle, ShieldCheck } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link, useRouter } from '../routes/RouterContext';
import { formatINR } from '../lib/utils';

export const DoctorDetailPage: React.FC<{ onOpenBooking: (doctorId?: string) => void }> = ({ onOpenBooking }) => {
  const { match } = useRouter();
  const { doctors } = useClinic();

  const slug = match.params.slug;
  const doctor = doctors.find((d) => d.slug === slug);

  if (!doctor) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-sm text-slate-500">The requested physician profile does not exist.</p>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <Link
        href="/doctors"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Medical Faculty</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Avatar and Quick Details */}
          <div className="md:col-span-5 space-y-4">
            <div className="rounded-2xl overflow-hidden aspect-4/5 shadow-md bg-slate-100">
              <img
                src={doctor.avatarUrl}
                alt={doctor.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
              <div className="text-xs font-semibold text-emerald-900">Consultation Schedule</div>
              <div className="space-y-1 text-xs text-emerald-800">
                <p>
                  <strong>Days:</strong> {doctor.availableDays.join(', ')}
                </p>
                <div>
                  <strong>Hours:</strong>
                  <ul className="list-disc list-inside mt-0.5">
                    {doctor.availableTimeSlots.map((slot, i) => (
                      <li key={i}>{slot}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Biography and Accreditations */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                {doctor.department}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{doctor.name}</h1>
              <p className="text-sm font-semibold text-emerald-600 mt-0.5">{doctor.specialty}</p>
              <p className="text-xs text-slate-500 mt-1">{doctor.experienceYears}+ Years Clinical Practice</p>
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Medical Degrees & Fellowships
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.qualifications.map((q, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{q}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Clinical Background & Practice
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Pricing & Booking */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500">Consultation Fee</span>
                <div className="text-2xl font-extrabold text-slate-900">{formatINR(doctor.consultationFee)}</div>
              </div>

              <button
                onClick={() => onOpenBooking(doctor.id)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment With {doctor.name.split(' ')[1] || 'Doctor'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
