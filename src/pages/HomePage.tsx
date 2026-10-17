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
  MapPin,
  CheckCircle2,
  Image as ImageIcon,
  HelpCircle,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link } from '../routes/RouterContext';
import { formatINR } from '../lib/utils';
import { Button } from '../components/common/Button';

interface HomePageProps {
  onOpenBooking: (doctorId?: string, serviceTitle?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenBooking }) => {
  const { doctors, services, settings, faqs, gallery } = useClinic();

  const featuredDoctors = doctors.slice(0, 4);
  const featuredServices = services.slice(0, 4);
  const previewGallery = gallery.slice(0, 3);
  const previewFaqs = faqs.slice(0, 4);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Patient-Centered Community Healthcare</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Compassionate Care. <br />
                <span className="text-emerald-600">Advanced Medical</span> Excellence.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {settings.clinicName} offers dedicated outpatient specialist consultations, computerized laboratory
                diagnostics, and 24x7 emergency first-aid triage in {settings.address.city}.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => onOpenBooking()}
                  leftIcon={<Calendar className="w-5 h-5" aria-hidden="true" />}
                >
                  Book Appointment Online
                </Button>

                <a
                  href={`tel:${settings.emergencyPhone}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold px-5 py-3.5 rounded-xl text-sm sm:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-2xs"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Call Emergency Desk</span>
                </a>
              </div>

              {/* Verified Trust Pillars (No fabricated statistics) */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Experienced Faculty</div>
                    <div className="text-xs text-slate-500">Board-certified specialist doctors</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">In-House Pathology</div>
                    <div className="text-xs text-slate-500">Rapid digital report turnaround</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">24x7 First-Aid Triage</div>
                    <div className="text-xs text-slate-500">Urgent care & stabilization</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
                  alt="Specialist physician consultation at Om Sai Adarsha Clinic"
                  className="w-full h-80 sm:h-96 object-cover object-top"
                  loading="eager"
                />
                <div className="p-6 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      OPD Consultations Open
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>{settings.workingHours.weekdays}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Direct Doctor Appointments</h3>
                  <p className="text-xs text-slate-600 leading-normal">
                    Schedule online or call our reception. Digital prescriptions and instant pathology test reporting.
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-100 items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Automated Laboratory</div>
                  <div className="text-[11px] text-slate-500">Encrypted digital test reports</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Clinic Introduction Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50/60 rounded-3xl p-8 sm:p-12 border border-emerald-100/80">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">About Our Healthcare Practice</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              A Trusted Neighborhood Medical Center
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {settings.aboutBrief}
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
              >
                <span>Read more about our mission & clinical philosophy</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Our Healthcare Specialties</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dedicated Clinical Services</h2>
          </div>
          <Link
            href="/services"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
          >
            <span>View All Medical Services</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <Link
                  href={`/services/${service.slug}`}
                  className="block h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none"
                    loading="lazy"
                  />
                </Link>
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block mb-2">
                  {service.category}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-emerald-700 transition-colors">
                  <Link href={`/services/${service.slug}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">
                    {service.title}
                  </Link>
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
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Doctors Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Expert Medical Faculty</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Consulting Doctors</h2>
            <p className="text-sm text-slate-600 mt-2">
              Qualified physicians offering individualized clinical guidance, accurate diagnosis, and empathetic care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <Link
                    href={`/doctors/${doc.slug}`}
                    className="block h-56 bg-slate-100 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 shadow-2xs">
                      {doc.experienceYears}+ Yrs Practice
                    </div>
                  </Link>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base">
                      <Link href={`/doctors/${doc.slug}`} className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">
                        {doc.name}
                      </Link>
                    </h3>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">{doc.specialty}</p>
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
                      className="text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Bio & Schedule
                    </Link>
                    <button
                      onClick={() => onOpenBooking(doc.id)}
                      className="text-center py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Explore All Doctors & Available Timings</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4.5 Direct Showcase: Individual Doctor & Service Profiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1">
              Direct Public Routes
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Explore All Individual Doctor & Service Pages
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              Select any clinical department or consulting specialist to view dedicated qualifications, schedules, and specific diagnostic procedures.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column A: All Individual Services (/services/[slug]) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                <h3 className="font-bold text-sm text-emerald-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Individual Service Pages (/services/[slug])</span>
                </h3>
                <span className="text-[11px] bg-emerald-500/30 px-2 py-0.5 rounded text-white font-medium">
                  {services.length} Services
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {services.map((serv) => (
                  <Link
                    key={serv.id}
                    href={`/services/${serv.slug}`}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                        <span>{serv.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-300 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-emerald-200/70 mt-0.5 line-clamp-1">{serv.department}</div>
                    </div>
                    <div className="text-[10px] text-emerald-300/90 font-mono mt-2">
                      /services/{serv.slug}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Column B: All Individual Doctors (/doctors/[slug]) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                <h3 className="font-bold text-sm text-emerald-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Individual Doctor Profiles (/doctors/[slug])</span>
                </h3>
                <span className="text-[11px] bg-emerald-500/30 px-2 py-0.5 rounded text-white font-medium">
                  {doctors.length} Specialists
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {doctors.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/doctors/${doc.slug}`}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-emerald-400/40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-emerald-200/70 truncate">{doc.specialty}</div>
                      <div className="text-[10px] text-emerald-300/90 font-mono mt-0.5">
                        /doctors/{doc.slug}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Facilities & Gallery Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Clinic Infrastructure</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Clinical Facilities</h2>
          </div>
          <Link
            href="/gallery"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
          >
            <span>View Full Photo Gallery</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewGallery.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-2xs group"
            >
              <div className="aspect-4/3 overflow-hidden bg-slate-100 relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none"
                  loading="lazy"
                />
                <span className="absolute top-3 right-3 text-[11px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 px-2 py-0.5 rounded shadow-2xs uppercase">
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Preview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Patient Guidance</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {previewFaqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-xl border border-slate-200/80 bg-white">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed pl-6.5">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/faq"
            className="text-sm font-semibold text-emerald-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
          >
            Have more questions? Read our full FAQ section →
          </Link>
        </div>
      </section>

      {/* 7. Contact Information & Hours Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Om Sai Adarsha Clinic Location & Timings
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Need Medical Assistance or Ready to Visit?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300 pt-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-white">Address:</span>
                    <p className="text-xs text-slate-400">
                      {settings.address.street}, {settings.address.city}, {settings.address.state} -{' '}
                      {settings.address.postalCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-white">OPD Hours:</span>
                    <p className="text-xs text-slate-400">
                      Mon–Fri: {settings.workingHours.weekdays} | Sat: {settings.workingHours.saturday}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Button
                variant="primary"
                onClick={() => onOpenBooking()}
                leftIcon={<Calendar className="w-4 h-4" aria-hidden="true" />}
              >
                Book Consultation
              </Button>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>View Map & Contact Details</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
