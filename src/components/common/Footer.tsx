import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Stethoscope } from 'lucide-react';
import { Link } from '../../routes/RouterContext';
import { useClinic } from '../../context/ClinicContext';

export const Footer: React.FC = () => {
  const { settings } = useClinic();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">Om Sai Adarsha Clinic</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.aboutBrief}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Healthcare & Diagnostic Center</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">About the Clinic</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-emerald-400 transition-colors">Our Medical Services</Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-emerald-400 transition-colors">Consulting Specialists</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-emerald-400 transition-colors">Facilities & Gallery</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">Patient FAQs</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact & Timings</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Consulting Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Consulting Hours
            </h4>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Monday – Friday</p>
                  <p>{settings.workingHours.weekdays}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-white font-medium">Saturday</p>
                <p>{settings.workingHours.saturday}</p>
              </div>
              <div className="pt-2">
                <p className="text-white font-medium">Sunday</p>
                <p>{settings.workingHours.sunday}</p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-xs text-emerald-400 font-medium">
                Emergency & First Aid Desk: 24 Hours / 7 Days
              </div>
            </div>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Clinic Location & Contact
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <address className="not-italic">
                  {settings.address.street}, {settings.address.landmark && `${settings.address.landmark}, `}
                  {settings.address.city}, {settings.address.state} - {settings.address.postalCode}
                </address>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${settings.generalPhone}`} className="hover:text-white transition-colors">
                  {settings.generalPhone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>

              <div className="pt-3">
                <Link
                  href="/dashboard-admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin & Doctor Portal Access</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Om Sai Adarsha Clinic. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Delivering compassionate community healthcare with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
