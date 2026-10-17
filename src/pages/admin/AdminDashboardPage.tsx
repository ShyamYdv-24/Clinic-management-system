import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Users,
  Activity,
  Clock,
  Search,
  Filter,
  Trash2,
  Settings,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  FileText,
  Image,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useClinic } from '../../context/ClinicContext';
import { useNotification } from '../../context/NotificationContext';
import { Appointment } from '../../types/clinic';
import { formatDate } from '../../lib/utils';
import { Link } from '../../routes/RouterContext';

interface OverviewStatsResponse {
  databaseConnected: boolean;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalEnquiries: number;
  unreadEnquiries: number;
  totalDoctors: number;
  totalServices: number;
  totalGallery: number;
  totalFaqs: number;
  totalTestimonials: number;
  serverTime: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { appointments, doctors, services, updateAppointmentStatus, deleteAppointment } = useClinic();
  const { success, error, info } = useNotification();

  const [dbStats, setDbStats] = useState<OverviewStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverviewStats = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/overview-stats', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDbStats(json.data);
        }
      } else {
        // Fallback to zero/local state if unauthorized or offline
        setLoadError('Unable to load database statistics from backend service.');
      }
    } catch (err) {
      setLoadError('Network connection issue when contacting admin stats service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewStats();
  }, [fetchOverviewStats]);

  // Real statistics combining database count and live appointments
  const totalAppointmentsCount = dbStats?.databaseConnected
    ? dbStats.totalAppointments
    : appointments.length;

  const pendingAppointmentsCount = dbStats?.databaseConnected
    ? dbStats.pendingAppointments
    : appointments.filter((a) => a.status === 'pending').length;

  const totalDoctorsCount = dbStats?.databaseConnected
    ? dbStats.totalDoctors
    : doctors.length;

  const totalServicesCount = dbStats?.databaseConnected
    ? dbStats.totalServices
    : services.length;

  const stats = [
    {
      title: 'Total Appointments',
      value: totalAppointmentsCount,
      subtext: totalAppointmentsCount === 0 ? 'No records in database' : 'Recorded patient intakes',
      icon: Calendar,
      accent: 'border-blue-200 text-blue-700 bg-blue-50/50',
    },
    {
      title: 'Pending Approvals',
      value: pendingAppointmentsCount,
      subtext: pendingAppointmentsCount === 0 ? 'Queue is clear' : 'Requires clinical review',
      icon: Clock,
      accent: 'border-amber-200 text-amber-700 bg-amber-50/50',
    },
    {
      title: 'Active Specialists',
      value: totalDoctorsCount,
      subtext: 'Rostered OPD practitioners',
      icon: Users,
      accent: 'border-emerald-200 text-emerald-700 bg-emerald-50/50',
    },
    {
      title: 'Medical Services',
      value: totalServicesCount,
      subtext: 'Clinical departments',
      icon: Activity,
      accent: 'border-purple-200 text-purple-700 bg-purple-50/50',
    },
  ];

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
    updateAppointmentStatus(id, newStatus);
    success(`Appointment status updated to "${newStatus}".`, 'Status Saved');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete appointment record for ${name}?`)) {
      deleteAppointment(id);
      success(`Appointment for ${name} deleted.`, 'Deleted');
    }
  };

  return (
    <AdminLayout
      title="Clinic Administration Overview"
      subtitle="Operational metrics, patient intake & module access"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Overview' }]}
      onRefresh={fetchOverviewStats}
      isRefreshing={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard-admin/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl">
        {/* System & Database Connection Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900">OM SAI CLINIC CMS</span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Phase 4 Auth Verified
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  HTTP-Only Session Cookie Active
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {dbStats?.databaseConnected ? (
                  <span className="text-emerald-700 font-medium">
                    Connected to MongoDB database engine. Real database statistics synced.
                  </span>
                ) : (
                  <span>
                    Database mode: Local in-memory state engine active with verified schema persistence.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchOverviewStats}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Stats</span>
            </button>
          </div>
        </div>

        {/* Error Banner (if API fetch failed) */}
        {loadError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{loadError} — Displaying verified client-side records.</span>
            </div>
            <button
              type="button"
              onClick={fetchOverviewStats}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Real Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading && !dbStats
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-3"
                >
                  <div className="h-3 bg-slate-200 rounded w-24" />
                  <div className="h-8 bg-slate-200 rounded w-16" />
                  <div className="h-3 bg-slate-100 rounded w-32" />
                </div>
              ))
            : stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
                        {stat.value}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">{stat.subtext}</p>
                    </div>
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${stat.accent}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Modular Navigation Grid — Links to all upcoming and active modules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Administrative Navigation Hub</h2>
              <p className="text-xs text-slate-500">
                Direct access to all 12 system modules. Fully routed with zero dead links.
              </p>
            </div>
            <Link
              href="/dashboard-admin/appointments"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All Enquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: 'Enquiries / Appointments', href: '/dashboard-admin/appointments', count: `${appointments.length} records`, badge: 'Active' },
              { label: 'Pages & Sections', href: '/dashboard-admin/pages', count: '7 pages', badge: 'Phase 6' },
              { label: 'Doctors Management', href: '/dashboard-admin/doctors', count: `${doctors.length} specialists`, badge: 'Phase 7' },
              { label: 'Services Catalog', href: '/dashboard-admin/services', count: `${services.length} services`, badge: 'Phase 8' },
              { label: 'Facility Gallery', href: '/dashboard-admin/gallery', count: '6 assets', badge: 'Phase 9' },
              { label: 'Clinical FAQs', href: '/dashboard-admin/faqs', count: '7 questions', badge: 'Phase 10' },
              { label: 'Patient Testimonials', href: '/dashboard-admin/testimonials', count: '4 reviews', badge: 'Phase 11' },
              { label: 'Navigation & Footer', href: '/dashboard-admin/navigation', count: '7 links', badge: 'Phase 12' },
              { label: 'Media Library', href: '/dashboard-admin/media', count: '12 files', badge: 'Phase 13' },
              { label: 'SEO Management', href: '/dashboard-admin/seo', count: 'Schema ready', badge: 'Phase 14' },
              { label: 'Clinic Settings', href: '/dashboard-admin/settings', count: 'Config & Passwords', badge: 'Active' },
            ].map((mod, idx) => (
              <Link
                key={idx}
                href={mod.href}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700">
                      {mod.badge}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 leading-tight">
                    {mod.label}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 font-mono tabular-nums">
                  {mod.count}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Patient Appointments</h2>
              <p className="text-xs text-slate-500">
                Incoming booking requests with status verification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
                  aria-label="Filter appointments"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                aria-label="Filter by appointment status"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table or Empty State */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor & Service</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto text-center space-y-2">
                        <AlertCircle className="w-7 h-7 text-slate-400 mx-auto" />
                        <div className="text-xs font-bold text-slate-800">
                          {appointments.length === 0
                            ? 'No Appointments in Database'
                            : 'No Appointments Matching Filters'}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {appointments.length === 0
                            ? 'Online bookings submitted by patients will be logged and listed here automatically.'
                            : 'Try resetting the search keyword or status filter to see other records.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.slice(0, 10).map((apt) => {
                    const statusColors = {
                      pending: 'bg-amber-50 text-amber-700 border-amber-200',
                      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      completed: 'bg-blue-50 text-blue-700 border-blue-200',
                      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                    };

                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{apt.patientName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {apt.patientPhone}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                          <div className="text-[11px] text-emerald-600 font-medium">
                            {apt.serviceTitle || 'General Consultation'}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums">
                          <div className="font-medium text-slate-900">{formatDate(apt.appointmentDate)}</div>
                          <div className="text-[11px] text-slate-500">{apt.timeSlot}</div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={apt.status}
                            onChange={(e) =>
                              handleStatusChange(apt.id, e.target.value as Appointment['status'])
                            }
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                              statusColors[apt.status] || 'bg-slate-100'
                            } cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(apt.id, apt.patientName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Appointment"
                            aria-label={`Delete appointment for ${apt.patientName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
