import React, { useState } from 'react';
import { PhoneCall, Clock, Calendar, ShieldCheck, Menu, X, Stethoscope, ChevronRight } from 'lucide-react';
import { useRouter, Link } from '../../routes/RouterContext';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  const { pathname } = useRouter();
  const { settings } = useClinic();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Our Doctors', href: '/doctors' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Notification & Emergency Bar */}
      <div className="bg-emerald-900 text-white text-xs sm:text-sm py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-emerald-200">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Emergency 24x7:</span>
              <a href={`tel:${settings.emergencyPhone}`} className="text-white hover:underline font-semibold">
                {settings.emergencyPhone}
              </a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
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
              className="inline-flex items-center gap-1 text-xs bg-emerald-800/80 hover:bg-emerald-700 px-2.5 py-0.5 rounded text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isAuthenticated ? 'Admin Dashboard' : 'Staff Portal'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Clinic Brand & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Om Sai Adarsha <span className="text-emerald-600 font-semibold">Clinic</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Healthcare with Devotion & Science</p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="sm:hidden inline-flex items-center p-2 rounded-lg bg-emerald-600 text-white"
              title="Book Appointment"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium"
            >
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <Link
              href={isAuthenticated ? '/dashboard-admin' : '/dashboard-admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-sm"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>{isAuthenticated ? 'Admin Dashboard' : 'Admin / Staff Login'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
