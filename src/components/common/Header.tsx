import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  Clock,
  Calendar,
  ShieldCheck,
  Menu,
  X,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  Activity,
  UserCheck,
  Award,
} from 'lucide-react';
import { useRouter, Link } from '../../routes/RouterContext';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  const { pathname } = useRouter();
  const { settings, doctors, services } = useClinic();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop dropdown states
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [doctorsDropdownOpen, setDoctorsDropdownOpen] = useState(false);

  // Mobile submenu accordions
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileDoctorsOpen, setMobileDoctorsOpen] = useState(false);

  const servicesRef = useRef<HTMLDivElement>(null);
  const doctorsRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setServicesDropdownOpen(false);
        setDoctorsDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesDropdownOpen(false);
      }
      if (doctorsRef.current && !doctorsRef.current.contains(e.target as Node)) {
        setDoctorsDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      {/* Top Notification & Emergency Bar */}
      <div className="bg-emerald-900 text-white text-xs sm:text-sm py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-emerald-200">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Emergency 24x7:</span>
              <a
                href={`tel:${settings.emergencyPhone}`}
                className="text-white hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded px-1"
              >
                {settings.emergencyPhone}
              </a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Mon-Sat: {settings.workingHours.weekdays}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {settings.announcementNotice && (
              <span className="hidden lg:inline-block text-emerald-200 truncate max-w-md">
                ✦ {settings.announcementNotice}
              </span>
            )}
            <Link
              href={isAuthenticated ? '/dashboard-admin' : '/dashboard-admin/login'}
              className="inline-flex items-center gap-1 text-xs bg-emerald-800/80 hover:bg-emerald-700 px-2.5 py-0.5 rounded text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
              <span>{isAuthenticated ? 'Admin Dashboard' : 'Staff Portal'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Clinic Brand & Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-xl p-1"
          >
            {settings.mainLogoUrl ? (
              <img
                src={settings.mainLogoUrl}
                alt={settings.clinicName}
                className="w-11 h-11 rounded-xl object-contain shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform motion-reduce:transition-none">
                <Stethoscope className="w-6 h-6" aria-hidden="true" />
              </div>
            )}
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                {settings.clinicName}
              </div>
              <p className="text-xs text-slate-500 font-medium">{settings.tagline}</p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                pathname === '/'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            <Link
              href="/about"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                pathname === '/about'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              About Us
            </Link>

            {/* Services with Dropdown Menu for all individual services */}
            <div
              ref={servicesRef}
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  pathname.startsWith('/services')
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-expanded={servicesDropdownOpen}
                aria-haspopup="true"
              >
                <span>Services</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full pt-1 w-80 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Individual Clinical Services
                    </div>
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug}`}
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-emerald-50/80 transition-colors group"
                      >
                        <Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-emerald-700">
                            {service.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{service.department}</div>
                        </div>
                      </Link>
                    ))}
                    <div className="pt-1 border-t border-slate-100">
                      <Link
                        href="/services"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl"
                      >
                        <span>View All Services Catalog</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Doctors with Dropdown Menu for all individual doctors */}
            <div
              ref={doctorsRef}
              className="relative"
              onMouseEnter={() => setDoctorsDropdownOpen(true)}
              onMouseLeave={() => setDoctorsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setDoctorsDropdownOpen(!doctorsDropdownOpen)}
                className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  pathname.startsWith('/doctors')
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-expanded={doctorsDropdownOpen}
                aria-haspopup="true"
              >
                <span>Our Doctors</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              </button>

              {doctorsDropdownOpen && (
                <div className="absolute left-0 top-full pt-1 w-80 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Individual Doctor Profiles
                    </div>
                    {doctors.map((doctor) => (
                      <Link
                        key={doctor.id}
                        href={`/doctors/${doctor.slug}`}
                        onClick={() => setDoctorsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-emerald-50/80 transition-colors group"
                      >
                        <img
                          src={doctor.avatarUrl}
                          alt={doctor.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-500/20"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                            {doctor.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{doctor.specialty}</div>
                        </div>
                      </Link>
                    ))}
                    <div className="pt-1 border-t border-slate-100">
                      <Link
                        href="/doctors"
                        onClick={() => setDoctorsDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl"
                      >
                        <span>View Full Doctor Directory</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/gallery"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                pathname === '/gallery'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Gallery
            </Link>

            <Link
              href="/faq"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                pathname === '/faq'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              FAQ
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                pathname === '/contact'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 motion-reduce:active:scale-100 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>{settings.appointmentCtaLabel || 'Book Appointment'}</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="sm:hidden inline-flex items-center p-2 rounded-lg bg-emerald-600 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              title="Book Appointment"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto"
          role="dialog"
          aria-label="Mobile Navigation"
        >
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium"
          >
            <span>Home</span>
          </Link>

          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium"
          >
            <span>About Us</span>
          </Link>

          {/* Mobile Services Submenu */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-slate-700 hover:bg-emerald-50 text-sm font-medium cursor-pointer"
            >
              <span>Services & Treatments</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180 text-emerald-600' : ''}`}
              />
            </button>
            {mobileServicesOpen && (
              <div className="bg-slate-50 p-2 space-y-1">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-800"
                  >
                    • {service.title}
                  </Link>
                ))}
                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All Services →
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Doctors Submenu */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileDoctorsOpen(!mobileDoctorsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-slate-700 hover:bg-emerald-50 text-sm font-medium cursor-pointer"
            >
              <span>Consulting Doctors</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileDoctorsOpen ? 'rotate-180 text-emerald-600' : ''}`}
              />
            </button>
            {mobileDoctorsOpen && (
              <div className="bg-slate-50 p-2 space-y-1">
                {doctors.map((doctor) => (
                  <Link
                    key={doctor.id}
                    href={`/doctors/${doctor.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-800"
                  >
                    • {doctor.name} ({doctor.specialty})
                  </Link>
                ))}
                <Link
                  href="/doctors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All Doctors Directory →
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium"
          >
            <span>Gallery</span>
          </Link>

          <Link
            href="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium"
          >
            <span>FAQ</span>
          </Link>

          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium"
          >
            <span>Contact</span>
          </Link>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>{settings.appointmentCtaLabel || 'Book Appointment'}</span>
            </button>
            <Link
              href={isAuthenticated ? '/dashboard-admin' : '/dashboard-admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>{isAuthenticated ? 'Admin Dashboard' : 'Admin / Staff Login'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
