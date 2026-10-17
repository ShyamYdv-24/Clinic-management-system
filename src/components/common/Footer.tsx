import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Stethoscope, ChevronRight } from 'lucide-react';
import { Link } from '../../routes/RouterContext';
import { useClinic } from '../../context/ClinicContext';

export const Footer: React.FC = () => {
  const { settings, services, doctors } = useClinic();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              {settings.mainLogoUrl ? (
                <img src={settings.mainLogoUrl} alt={settings.clinicName} className="w-10 h-10 rounded-xl object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Stethoscope className="w-5 h-5" aria-hidden="true" />
                </div>
              )}
              <span className="font-bold text-lg text-white">{settings.clinicName}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.footerDescription || settings.aboutBrief}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Certified Healthcare & Diagnostic Center</span>
            </div>
          </div>

          {/* Col 2: Individual Medical Services */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Clinical Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" aria-hidden="true" />
                    <span>{service.title}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/services" className="text-emerald-400 hover:underline font-semibold">
                  View All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Consulting Doctors */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Our Specialists
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {doctors.map((doctor) => (
                <li key={doctor.id}>
                  <Link
                    href={`/doctors/${doctor.slug}`}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" aria-hidden="true" />
                    <span>{doctor.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/doctors" className="text-emerald-400 hover:underline font-semibold">
                  Doctor Directory →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Timings & Location */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-2">
              Hours & Emergency
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="text-white font-medium">OPD Timings:</p>
              <p>Mon–Fri: {settings.workingHours.weekdays}</p>
              <p>Saturday: {settings.workingHours.saturday}</p>
              <p className="text-emerald-400 font-semibold pt-1">
                Emergency 24x7: <br />
                <a href={`tel:${settings.emergencyPhone}`} className="hover:underline text-white font-bold">
                  {settings.emergencyPhone}
                </a>
              </p>
            </div>

            <div className="space-y-1 text-xs text-slate-400">
              <p className="text-white font-medium">Clinic Address:</p>
              <p>{settings.address.street}</p>
              <p>{settings.address.city}, {settings.address.state} - {settings.address.postalCode}</p>
              {settings.address.country && <p>{settings.address.country}</p>}
            </div>

            {/* Social Links (only configured valid links) */}
            {settings.socialLinks && Object.values(settings.socialLinks).some(Boolean) && (
              <div className="pt-2">
                <p className="text-white font-medium text-xs mb-2">Connect With Us:</p>
                <div className="flex items-center gap-3">
                  {settings.socialLinks.facebook && (
                    <a
                      href={settings.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                      aria-label="Facebook"
                    >
                      <span className="text-xs font-semibold hover:underline">Facebook</span>
                    </a>
                  )}
                  {settings.socialLinks.instagram && (
                    <a
                      href={settings.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                      aria-label="Instagram"
                    >
                      <span className="text-xs font-semibold hover:underline">Instagram</span>
                    </a>
                  )}
                  {settings.socialLinks.youtube && (
                    <a
                      href={settings.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                      aria-label="YouTube"
                    >
                      <span className="text-xs font-semibold hover:underline">YouTube</span>
                    </a>
                  )}
                  {settings.socialLinks.linkedin && (
                    <a
                      href={settings.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                      aria-label="LinkedIn"
                    >
                      <span className="text-xs font-semibold hover:underline">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-xs">
              <Link
                href="/dashboard-admin/login"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Admin & Staff CMS Login</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>{settings.footerCopyrightText || `© ${new Date().getFullYear()} ${settings.clinicName}. All rights reserved.`}</p>
          <div className="flex items-center gap-1">
            <span>Delivering compassionate community healthcare with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
};
