import React from 'react';
import {
  Calendar,
  ShieldCheck,
  Award,
  Users,
  Activity,
  ArrowRight,
  PhoneCall,
  Clock,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link } from '../routes/RouterContext';
import { formatINR } from '../lib/utils';

interface HomePageProps {
  onOpenBooking: (doctorId?: string, serviceTitle?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenBooking }) => {
  const { doctors, services, settings, faqs } = useClinic();

  const previewDoctors = doctors.slice(0, 4);
  const previewServices = services.slice(0, 4);
  const previewFaqs = faqs.slice(0, 4);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trusted Healthcare in Bengaluru</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Compassionate Care. <br />
                <span className="text-emerald-600">Advanced Medical</span> Excellence.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Om Sai Adarsha Clinic offers distinguished medical specialists, modern diagnostics, gentle pediatric
                attention, and 24x7 emergency response with absolute dedication to patient wellness.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-sm sm:text-base cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment Online</span>
                </button>

                <a
                  href={`tel:${settings.emergencyPhone}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold px-5 py-3.5 rounded-xl shadow-xs text-sm sm:text-base transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>Call Emergency</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">18+</div>
                  <div className="text-xs text-slate-500 font-medium">Years Serving Patients</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">25k+</div>
                  <div className="text-xs text-slate-500 font-medium">Happy Recoveries</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">24/7</div>
                  <div className="text-xs text-slate-500 font-medium">Emergency Assistance</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
                  alt="Doctor consultation at Om Sai Adarsha Clinic"
                  className="w-full h-80 sm:h-96 object-cover object-top"
                />
                <div className="p-6 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      OPD Open Today
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {settings.workingHours.weekdays}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Direct Doctor Appointments</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Walk in or book online to avoid long waiting times. Digital prescriptions and instant lab reports.
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Certified Diagnostic Lab</div>
                  <div className="text-[11px] text-slate-500">Same-Day Digital Reports</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Our Healthcare Specialties</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dedicated Clinical Services</h2>
          </div>
          <Link
            href="/services"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl bg-slate-100">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block mb-2">
                  {service.category}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-emerald-700 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {service.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {service.priceStartingAt ? (
                  <span className="text-xs font-medium text-slate-500">
                    From <strong className="text-slate-900">{formatINR(service.priceStartingAt)}</strong>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Consultation</span>
                )}
                <Link
                  href={`/services/${service.slug}`}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Our Specialists */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Expert Medical Faculty</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Consulting Doctors</h2>
            <p className="text-sm text-slate-600 mt-2">
              Seasoned medical professionals offering individualized clinical guidance and empathetic care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-56 bg-slate-100 relative overflow-hidden">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 shadow-xs">
                      {doc.experienceYears}+ Yrs Exp
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                    <p className="text-xs font-medium text-emerald-600 mt-0.5">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{doc.department}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                      {doc.bio}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span>Consultation</span>
                    <span className="font-bold text-slate-900">{formatINR(doc.consultationFee)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/doctors/${doc.slug}`}
                      className="text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => onOpenBooking(doc.id)}
                      className="text-center py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-xl transition-colors"
            >
              <span>Explore All Doctors & Available Timings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Om Sai Adarsha Clinic */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-emerald-900 text-white space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Uncompromising Patient Hygiene</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Sterile consultation spaces, hospital-grade autoclave sterilization, and dedicated infection control
              protocols for all procedures.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-teal-900 text-white space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center text-teal-300">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Digital Lab & Speedy Reports</h3>
            <p className="text-sm text-teal-100/80 leading-relaxed">
              Automated biochemistry diagnostics and digital WhatsApp/email delivery of test results directly to your
              phone.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Patient-First Philosophy</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Affordable consultations, zero hidden fees, and transparent medical explanations that empower you to make
              informed health choices.
            </p>
          </div>
        </div>
      </section>

      {/* Quick FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Patient Guidance</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {previewFaqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-xl border border-slate-200/80 bg-white">
              <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{faq.question}</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/faq" className="text-sm font-semibold text-emerald-600 hover:underline">
            Have more questions? Read our full FAQ section →
          </Link>
        </div>
      </section>
    </div>
  );
};
