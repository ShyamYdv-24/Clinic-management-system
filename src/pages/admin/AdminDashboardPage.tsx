import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Trash2,
  Settings,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useClinic } from '../../context/ClinicContext';
import { Appointment } from '../../types/clinic';
import { formatDate } from '../../lib/utils';
import { Link } from '../../routes/RouterContext';

export const AdminDashboardPage: React.FC = () => {
  const { appointments, doctors, services, updateAppointmentStatus, deleteAppointment } = useClinic();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    {
      title: 'Total Appointments',
      value: appointments.length,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Pending Approvals',
      value: appointments.filter((a) => a.status === 'pending').length,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Active Specialists',
      value: doctors.length,
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Medical Services',
      value: services.length,
      icon: Activity,
      color: 'bg-purple-50 text-purple-600',
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

  return (
    <AdminLayout title="Clinic Administration Overview">
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Navigation to modules */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Architecture Modular Expansion</h3>
            <p className="text-xs text-slate-500">
              Admin modules prepared for Phase 2: Doctors Management, Services Management, Gallery, and Audit Logs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard-admin/settings"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Clinic Settings</span>
            </Link>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Patient Appointments & Registrations</h2>
              <p className="text-xs text-slate-500">Review incoming appointment requests and change status.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, phone, doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
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
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No appointments matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
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
                          <div className="text-[11px] text-slate-500">
                            {apt.patientPhone} • {apt.patientEmail}
                          </div>
                          {apt.symptoms && (
                            <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                              Symptoms: {apt.symptoms}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                          <div className="text-[11px] text-emerald-600 font-medium">
                            {apt.serviceTitle || 'General Consultation'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{formatDate(apt.appointmentDate)}</div>
                          <div className="text-[11px] text-slate-500">{apt.timeSlot}</div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={apt.status}
                            onChange={(e) =>
                              updateAppointmentStatus(apt.id, e.target.value as Appointment['status'])
                            }
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                              statusColors[apt.status] || 'bg-slate-100'
                            } cursor-pointer focus:outline-none`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteAppointment(apt.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete Appointment"
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
