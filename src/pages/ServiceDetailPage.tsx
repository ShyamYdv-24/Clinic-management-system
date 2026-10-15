import React from 'react';
import { ArrowLeft, CheckCircle2, Clock, ShieldAlert, Calendar, PhoneCall, Stethoscope } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link, useRouter } from '../routes/RouterContext';
import { formatINR } from '../lib/utils';

export const ServiceDetailPage: React.FC<{ onOpenBooking: (doctorId?: string, serviceTitle?: string) => void }> = ({
  onOpenBooking,
}) => {
  const { match } = useRouter();
  const { services, settings } = useClinic();

  const slug = match.params.slug;
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Service Not Found</h2>
        <p className="text-sm text-slate-500">The healthcare service you requested could not be located.</p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Services</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl overflow-hidden max-h-96 w-full shadow-lg">
            <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{service.department}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{service.title}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Category: {service.category}</p>
          </div>

          <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="text-base font-medium text-slate-800">{service.summary}</p>
            <p>{service.description}</p>
          </div>

          {/* Clinical Features List */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Key Highlights & Clinical Procedures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-5 sticky top-28">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Consultation Tariff</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {service.priceStartingAt ? formatINR(service.priceStartingAt) : 'On Inquiry'}
            </div>
            {service.estimatedDurationMinutes && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approx. {service.estimatedDurationMinutes} mins duration</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button
              onClick={() => onOpenBooking(undefined, service.title)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment for This</span>
            </button>

            <a
              href={`tel:${settings.emergencyPhone}`}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Have Questions? Call Desk</span>
            </a>
          </div>

          <div className="bg-emerald-50 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
              <span>Safety & Hygiene Guarantee</span>
            </p>
            <p className="text-[11px] text-emerald-800">
              Disposable instruments and sterile protocols observed strictly for all tests and day-care minor procedures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
