import React, { useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  Phone,
  Mail,
  Languages,
  CheckCircle,
  ShieldCheck,
  Stethoscope,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link, useRouter } from '../routes/RouterContext';
import { formatINR } from '../lib/utils';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { SEOHead } from '../components/common/SEOHead';

export const DoctorDetailPage: React.FC<{ onOpenBooking: (doctorId?: string) => void }> = ({
  onOpenBooking,
}) => {
  const { match } = useRouter();
  const { doctors, services, settings } = useClinic();

  const slug = match.params.slug;
  const doctor = doctors.find((d) => d.slug === slug);

  // Handle missing doctor
  if (!doctor) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-5">
        <SEOHead
          title="Doctor Profile Not Found"
          description="The requested physician profile could not be found in our medical specialist directory."
          canonicalPath={`/doctors/${slug}`}
        />
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <Stethoscope className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Physician Profile Not Found</h2>
          <p className="text-sm text-slate-500">
            The requested doctor profile does not exist or may have been updated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Return to Doctor Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Related services associated with this doctor
  const relatedServices = services.filter((serv) => {
    if (doctor.relatedServiceSlugs && doctor.relatedServiceSlugs.includes(serv.slug)) {
      return true;
    }
    if (serv.relatedDoctorIds && serv.relatedDoctorIds.includes(doctor.id)) {
      return true;
    }
    return serv.department.toLowerCase() === doctor.department.toLowerCase();
  });

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SEOHead
        title={`${doctor.name} — ${doctor.specialty}`}
        description={`Consult with ${doctor.name}, ${doctor.qualifications.join(', ')} with ${doctor.experienceYears}+ years of clinical experience in ${doctor.specialty} at ${settings.clinicName}, Bengaluru.`}
        ogImage={doctor.avatarUrl}
        canonicalPath={`/doctors/${doctor.slug}`}
        type="profile"
        doctorSchema={{
          name: doctor.name,
          specialty: doctor.specialty,
          qualifications: doctor.qualifications,
          bio: doctor.bio,
          image: doctor.avatarUrl,
        }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Consulting Doctors', href: '/doctors' },
          { label: doctor.name },
        ]}
      />

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Avatar and Quick Details */}
          <div className="md:col-span-5 space-y-4">
            <div className="rounded-2xl overflow-hidden aspect-4/5 shadow-md bg-slate-100 border border-slate-200">
              <img
                src={doctor.avatarUrl}
                alt={doctor.name}
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
            </div>

            {/* Consulting Schedule Box */}
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 space-y-2">
              <div className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                <span>Consultation Timings</span>
              </div>
              <div className="space-y-1.5 text-xs text-emerald-900">
                <p>
                  <strong className="text-emerald-950">Days:</strong> {doctor.availableDays.join(', ')}
                </p>
                <div>
                  <strong className="text-emerald-950">Slots:</strong>
                  <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-emerald-800">
                    {doctor.availableTimeSlots.map((slot, i) => (
                      <li key={i}>{slot}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Languages */}
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-600 flex items-center gap-2">
                <Languages className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Consults in:</strong> {doctor.languages.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Biography, Qualifications & Related Services */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md border border-emerald-200/60">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-200/60"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>{q}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Clinical Background & Scope
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Associated Services */}
            {relatedServices.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Related Clinical Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedServices.map((serv) => (
                    <Link
                      key={serv.id}
                      href={`/services/${serv.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>{serv.title}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing & Booking */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500">Standard Consultation Fee</span>
                <div className="text-2xl font-extrabold text-slate-900">{formatINR(doctor.consultationFee)}</div>
              </div>

              <Button
                variant="primary"
                onClick={() => onOpenBooking(doctor.id)}
                leftIcon={<Calendar className="w-4 h-4" aria-hidden="true" />}
              >
                Book Appointment With {doctor.name.split(' ')[1] || 'Doctor'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
