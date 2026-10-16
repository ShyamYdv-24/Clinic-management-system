import React, { useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Calendar,
  PhoneCall,
  Stethoscope,
  HelpCircle,
  User,
  ArrowRight,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link, useRouter } from '../routes/RouterContext';
import { formatINR } from '../lib/utils';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';

export const ServiceDetailPage: React.FC<{
  onOpenBooking: (doctorId?: string, serviceTitle?: string) => void;
}> = ({ onOpenBooking }) => {
  const { match } = useRouter();
  const { services, doctors, faqs, settings } = useClinic();

  const slug = match.params.slug;
  const service = services.find((s) => s.slug === slug);

  // Dynamic document title
  useEffect(() => {
    if (service) {
      document.title = `${service.title} | Om Sai Adarsha Clinic`;
    } else {
      document.title = 'Service Not Found | Om Sai Adarsha Clinic';
    }
    return () => {
      document.title = 'Om Sai Adarsha Clinic';
    };
  }, [service]);

  // Handle missing services with a proper not-found response
  if (!service) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <Stethoscope className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Medical Service Not Found</h2>
          <p className="text-sm text-slate-500">
            The healthcare service or diagnostic test you requested does not exist or may have been renamed.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Browse All Medical Services</span>
          </Link>
        </div>
      </div>
    );
  }

  // Related doctors configured for this service
  const relatedDoctors = doctors.filter((doc) => {
    if (service.relatedDoctorIds && service.relatedDoctorIds.includes(doc.id)) {
      return true;
    }
    if (doc.relatedServiceSlugs && doc.relatedServiceSlugs.includes(service.slug)) {
      return true;
    }
    return doc.department.toLowerCase() === service.department.toLowerCase();
  });

  // Relevant FAQs for this service category/department
  const relevantFaqs = faqs.filter(
    (f) =>
      f.category === 'services' ||
      f.question.toLowerCase().includes(service.title.toLowerCase()) ||
      f.answer.toLowerCase().includes(service.department.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Medical Services', href: '/services' },
          { label: service.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="rounded-2xl overflow-hidden max-h-96 w-full shadow-md border border-slate-200">
            <img
              src={service.imageUrl}
              alt={service.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-100">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>{service.department}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{service.title}</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Specialty: {service.category}</p>
          </div>

          <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="text-base font-semibold text-slate-800 leading-normal">{service.summary}</p>
            <p>{service.description}</p>
          </div>

          {/* Clinical Features List */}
          <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Key Diagnostic & Clinical Inclusions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {service.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Consulting Doctors */}
          {relatedDoctors.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg">Consulting Specialists For This Department</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-12 h-12 rounded-full object-cover border border-emerald-500/20"
                        loading="lazy"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{doc.name}</div>
                        <div className="text-xs text-emerald-600">{doc.specialty}</div>
                      </div>
                    </div>
                    <Link
                      href={`/doctors/${doc.slug}`}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 shrink-0"
                    >
                      Profile →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relevant FAQs */}
          {relevantFaqs.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <span>Frequently Asked Questions</span>
              </h3>
              <div className="space-y-3">
                {relevantFaqs.map((faq, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border border-slate-200/80">
                    <h4 className="font-semibold text-slate-900 text-sm">{faq.question}</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Sticky Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6 sticky top-28">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Consultation Tariff</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {service.priceStartingAt ? formatINR(service.priceStartingAt) : 'On Inquiry'}
            </div>
            {service.estimatedDurationMinutes && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Estimated duration: ~{service.estimatedDurationMinutes} minutes</span>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => onOpenBooking(undefined, service.title)}
              leftIcon={<Calendar className="w-4 h-4" aria-hidden="true" />}
            >
              Book Service Appointment
            </Button>

            <a
              href={`tel:${settings.emergencyPhone}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Call Reception For Enquiries</span>
            </a>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-4 text-xs text-emerald-950 space-y-1.5 border border-emerald-100">
            <p className="font-semibold flex items-center gap-1.5 text-emerald-900">
              <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
              <span>Clinical Sanitization Protocol</span>
            </p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              All sampling consumables and examination instruments undergo hospital-standard sterilization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
