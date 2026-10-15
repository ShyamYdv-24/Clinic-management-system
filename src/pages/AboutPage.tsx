import React from 'react';
import { Award, ShieldCheck, Heart, Users, Target, Clock, CheckCircle } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const AboutPage: React.FC<{ onOpenBooking: () => void }> = ({ onOpenBooking }) => {
  const { settings } = useClinic();

  return (
    <div className="py-12 space-y-16">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          About Om Sai Adarsha Clinic
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Caring for Families with Medical Excellence & Empathy
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Founded with a mission to deliver trustworthy, accessible, and high-quality outpatient care in Bengaluru.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-900">Our Heritage & Healing Mission</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Om Sai Adarsha Clinic was established to bridge the gap between complex multi-specialty hospitals and local
              neighborhood clinics. We believe every patient deserves attentive listening, accurate scientific diagnosis,
              and ethical healthcare guidance without unwarranted diagnostic tests or long waiting lines.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our multidisciplinary team includes respected internal medicine physicians, gynecologists, pediatricians,
              and dermatologists backed by in-house computer-controlled laboratory diagnostics and a 24x7 emergency desk.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>NABL-Standard Pathology Testing</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Strict Infection Control & Sanitization</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>24x7 Emergency First-Aid Response</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transparent & Subsidized Pricing</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Schedule a Visit
              </button>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
              alt="Om Sai Adarsha Clinic facility"
              className="rounded-2xl shadow-xl w-full h-80 sm:h-96 object-cover"
            />
            <div className="absolute -bottom-6 -right-4 bg-emerald-900 text-white p-5 rounded-2xl shadow-xl max-w-xs">
              <div className="font-bold text-sm">Patient Trust Rating</div>
              <div className="text-xs text-emerald-200 mt-1">
                Over 25,000+ patient treatments with 98.4% satisfaction rating.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900">The Principles We Practice By</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Guiding every consultation, procedure, and prescription.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Unconditional Compassion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Treating every individual with the dignity and respect we would expect for our own loved ones.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Scientific Precision</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grounding clinical decisions on verified evidence, digital diagnostics, and current global medical consensus.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Ethical Integrity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent consultation fees and zero commissions on diagnostics or prescription referrals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
