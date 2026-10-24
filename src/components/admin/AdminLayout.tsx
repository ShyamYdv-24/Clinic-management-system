import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  FileText,
  UserCheck,
  Activity,
  Image as ImageIcon,
  HelpCircle,
  MessageSquareQuote,
  Compass,
  HardDrive,
  Globe,
  Settings,
  LogOut,
  Stethoscope,
  ExternalLink,
  Menu,
  X,
  Search,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { useRouter, Link } from '../../routes/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { useNotification } from '../../context/NotificationContext';

export interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  onRefresh,
  isRefreshing = false,
}) => {
  const { pathname, navigate } = useRouter();
  const { user, logout } = useAuth();
  const { appointments } = useClinic();
  const { success, info } = useNotification();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Close mobile drawer on route change & enforce private noindex metadata
  useEffect(() => {
    setMobileDrawerOpen(false);
    document.title = `${title} | Admin Portal — Om Sai Adarsha Clinic`;

    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');
  }, [pathname, title]);

  // Handle keyboard shortcut for search (Ctrl+K / Cmd+K) and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('admin-global-search');
        searchInput?.focus();
      }
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'pending').length;

  // The 12 primary navigation links (+ Logout as #13)
  const navSections = [
    {
      group: 'Core Operations',
      items: [
        {
          label: 'Overview',
          href: '/dashboard-admin',
          icon: LayoutDashboard,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'Enquiries / Appointments',
          href: '/dashboard-admin/appointments',
          icon: CalendarCheck2,
          badge: pendingAppointmentsCount > 0 ? `${pendingAppointmentsCount} pending` : 'Active',
          badgeColor:
            pendingAppointmentsCount > 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
    {
      group: 'Clinical Content',
      items: [
        {
          label: 'Pages & Sections',
          href: '/dashboard-admin/pages',
          icon: FileText,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'Doctors',
          href: '/dashboard-admin/doctors',
          icon: UserCheck,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'Services',
          href: '/dashboard-admin/services',
          icon: Activity,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'Gallery',
          href: '/dashboard-admin/gallery',
          icon: ImageIcon,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'FAQs',
          href: '/dashboard-admin/faqs',
          icon: HelpCircle,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'Testimonials',
          href: '/dashboard-admin/testimonials',
          icon: MessageSquareQuote,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
    {
      group: 'System & Architecture',
      items: [
        {
          label: 'Navigation & Footer',
          href: '/dashboard-admin/navigation',
          icon: Compass,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'Media Library',
          href: '/dashboard-admin/media',
          icon: HardDrive,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'SEO Management',
          href: '/dashboard-admin/seo',
          icon: Globe,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          label: 'Settings',
          href: '/dashboard-admin/settings',
          icon: Settings,
          badge: 'Active',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    success('Administrator logged out. Session terminated safely.', 'Signed Out');
    navigate('/dashboard-admin/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    info(`Filtering records for "${globalSearch.trim()}"`, 'Search Filter Active');
    if (pathname !== '/dashboard-admin/appointments' && pathname !== '/dashboard-admin') {
      navigate('/dashboard-admin/appointments');
    }
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard-admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
              Om Sai Adarsha Clinic
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <span>Admin Console</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal">v2.0</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Admin Identity Card */}
      <div className="px-4 py-3 bg-slate-900/70 border-b border-slate-800/80 flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-xs font-bold uppercase shadow-inner">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"
            title="Authenticated Session Active"
            aria-label="Online"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate leading-tight">
            {user?.name || 'Administrator'}
          </div>
          <div className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
            {user?.email || 'admin@om-sai.clinic'}
          </div>
        </div>
        <div className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 uppercase tracking-wider shrink-0">
          {user?.role || 'Admin'}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-3 tracking-wider">
              {sec.group}
            </div>
            {sec.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border tracking-wide whitespace-nowrap shrink-0 ${
                        item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Public Website Preview Link */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-3 mb-1 tracking-wider">
            External Portal
          </div>
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Public Patient Website</span>
            </div>
            <span className="text-[10px] text-slate-400">Live</span>
          </Link>
        </div>
      </nav>

      {/* Logout Action */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label="Sign out from administrative session"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <span className="text-[10px] text-rose-500 uppercase font-mono">End Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Desktop Sidebar (Fixed 260px) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-800 shrink-0 sticky top-0 h-screen z-20">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Header with Hamburger Trigger */}
      <header className="md:hidden bg-slate-950 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            aria-label="Open mobile admin navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-white tracking-tight leading-tight">
              Om Sai Admin
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingAppointmentsCount > 0 && (
            <Link
              href="/dashboard-admin/appointments"
              className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full"
            >
              {pendingAppointmentsCount} Pending
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            className="relative w-72 max-w-[85vw] bg-slate-950 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Drawer"
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                aria-label="Close navigation drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Breadcrumbs & Title */}
            <div className="min-w-0">
              {/* Breadcrumb Trail */}
              <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                <Link
                  href="/dashboard-admin"
                  className="hover:text-emerald-700 transition-colors font-medium flex items-center gap-1"
                >
                  <span>Admin</span>
                </Link>
                {breadcrumbs && breadcrumbs.length > 0 ? (
                  breadcrumbs.map((b, i) => (
                    <React.Fragment key={i}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      {b.href ? (
                        <Link href={b.href} className="hover:text-emerald-700 transition-colors font-medium">
                          {b.label}
                        </Link>
                      ) : (
                        <span className="text-slate-800 font-semibold truncate">{b.label}</span>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="text-slate-800 font-semibold truncate">{title}</span>
                  </>
                )}
              </nav>

              <div className="flex items-baseline gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                  {title}
                </h1>
                {subtitle && (
                  <span className="hidden sm:inline-block text-xs text-slate-600 truncate">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Search, Refresh, Actions */}
            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
              {/* Search Control */}
              <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="admin-global-search"
                  type="text"
                  placeholder="Search records... (Ctrl+K)"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`pl-8 pr-12 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white text-slate-800 focus:outline-none transition-all w-48 xl:w-64 ${
                    searchFocused
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  aria-label="Search administrative records"
                />
                <kbd className="absolute right-2 top-2 text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono pointer-events-none">
                  ⌘K
                </kbd>
              </form>

              {/* Refresh Button */}
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                  title="Synchronize database records"
                  aria-label="Refresh database records"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span className="hidden sm:inline">Sync</span>
                </button>
              )}

              {/* Custom Page Actions */}
              {actions}

              {/* Security Status Badge */}
              <div
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 select-none"
                title="Single Administrator Session Verified via Signed JWT & HTTP-Only Cookie"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected</span>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
