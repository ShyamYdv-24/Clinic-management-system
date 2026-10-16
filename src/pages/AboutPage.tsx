import React from 'react';
import { ShieldCheck, Heart, Target, CheckCircle, Stethoscope, Users, Building2, Clock } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { Link } from '../routes/RouterContext';

export const AboutPage: React.FC<{ onOpenBooking: () => void }> = ({ onOpenBooking }) => {
  const { settings, doctors } = useClinic();

  return (
    <div className="py-10 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'About the Clinic' }]} />

      {/* Hero / Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          About Om Sai Adarsha Clinic
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Caring for Families with Medical Dedication & Empathy
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Committed to delivering evidence-based outpatient consultations, accurate diagnostics, and compassionate clinical care in Bengaluru.
        </p>
      </div>

      {/* Main Narrative & Facility Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <h2 className="text-2xl font-bold text-slate-900">Our Clinical Mission & Purpose</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Om Sai Adarsha Clinic was founded to provide transparent, accessible, and high-standard outpatient medical care. We focus on direct physician-patient communication, ensuring each individual receives sufficient consultation time, thorough evaluation, and tailored clinical guidance.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our multi-disciplinary team brings together qualified practitioners across General Medicine, Diabetology, Obstetrics & Gynecology, Pediatrics, and Dermatology. In addition, our on-site automated diagnostic facilities allow patients to undergo necessary tests with rapid report generation.
          </p>

          {/* Key Standards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Standardized Pathology Protocols</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Autoclave Sterilization & Hygiene</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>24x7 Emergency First-Aid Triage</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Clear & Upfront Consultation Fees</span>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="primary" onClick={onOpenBooking}>
              Schedule a Consultation
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
              alt="Om Sai Adarsha Clinic facility and patient reception area"
              className="w-full h-80 sm:h-96 object-cover"
              loading="lazy"
            />
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Main Clinic Facility & Reception</span>
              <span className="font-semibold text-emerald-700">Bengaluru Center</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Our Core Healthcare Principles</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Guiding clinical evaluation and patient welfare.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Heart className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Compassion in Practice</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Listening attentively to every patient concern, explaining clinical diagnoses clearly, and treating families with empathy.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Target className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Scientific Precision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rooting recommendations in current clinical consensus, verified diagnostic findings, and rational pharmacological therapy.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Ethical Healthcare</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent fees without unnecessary repeat tests, arbitrary procedures, or third-party commercial influence.
            </p>
          </div>
        </div>
      </div>

      {/* Medical Team Summary Preview */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Medical Team & Department Leads</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Experienced physicians consulting regularly at Om Sai Adarsha Clinic.
            </p>
          </div>
          <Link
            href="/doctors"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View Full Faculty Schedules →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <img
                src={doc.avatarUrl}
                alt={doc.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/20"
                loading="lazy"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                <p className="text-xs text-emerald-600 font-medium">{doc.specialty}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{doc.department}</p>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{doc.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
