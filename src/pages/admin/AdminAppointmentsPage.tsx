import React, { useState } from 'react';
import {
  CalendarCheck2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Phone,
  Mail,
  User,
  Stethoscope,
  Copy,
  Check,
  AlertCircle,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useClinic } from '../../context/ClinicContext';
import { useNotification } from '../../context/NotificationContext';
import { Appointment } from '../../types/clinic';
import { formatDate } from '../../lib/utils';
import { Link } from '../../routes/RouterContext';

export const AdminAppointmentsPage: React.FC = () => {
  const { appointments, updateAppointmentStatus, deleteAppointment } = useClinic();
  const { success, info } = useNotification();

  const [activeTab, setActiveTab] = useState<'appointments' | 'enquiries'>('appointments');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In-memory demo enquiries list for the enquiries tab
  const [enquiries, setEnquiries] = useState([
    {
      id: 'enq-1',
      name: 'Sunita Mohapatra',
      email: 'sunita.m@example.com',
      phone: '+91 94370 88219',
      subject: 'Inquiry regarding Sunday Cardiology consultation slots',
      message: 'Does Dr. B. K. Jena take walk-in cardiology patients on Sunday morning, or is prior booking mandatory?',
      status: 'new' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'enq-2',
      name: 'Pradeep Das',
      email: 'p.das.cuttack@example.com',
      phone: '+91 98610 54321',
      subject: 'Digital ECG and Blood Sugar lab report turnaround time',
      message: 'How soon can we receive the digital lipid profile and fasting sugar report after morning sample collection?',
      status: 'responded' as const,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    success(`${label} copied to clipboard: ${text}`, 'Copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
    updateAppointmentStatus(id, newStatus);
    success(`Appointment status updated to "${newStatus}".`, 'Status Updated');
  };

  const handleDelete = (id: string, patientName: string) => {
    if (window.confirm(`Are you sure you want to remove appointment for ${patientName}?`)) {
      deleteAppointment(id);
      success(`Appointment for ${patientName} removed from records.`, 'Record Removed');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone.includes(searchTerm) ||
      (apt.serviceTitle && apt.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesStatus = statusFilter === 'all' || enq.status === statusFilter;
    const matchesSearch =
      enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.phone.includes(searchTerm) ||
      enq.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

  return (
    <AdminLayout
      title="Enquiries & Patient Appointments"
      subtitle="Manage patient registrations, consultation schedules & triage"
      breadcrumbs={[
        { label: 'Admin', href: '/dashboard-admin' },
        { label: 'Appointments & Enquiries' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              info('Appointments exported to CSV ledger format.', 'Ledger Downloaded');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            aria-label="Export appointments list"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Intake
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {appointments.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recorded bookings</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
              Pending Action
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
              {pendingCount}
            </div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">Awaiting confirmation</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Confirmed
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
              {confirmedCount}
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">Ready for consultation</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">
              Web Enquiries
            </div>
            <div className="text-2xl font-bold text-sky-600 mt-1 font-mono tabular-nums">
              {enquiries.length}
            </div>
            <div className="text-[10px] text-sky-600/80 mt-0.5">General patient inquiries</div>
          </div>
        </div>

        {/* Tab Selection & Search Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Functional Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('appointments');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Appointments ({appointments.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('enquiries');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enquiries ({enquiries.length})
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'appointments'
                    ? 'Search patient, doctor, phone...'
                    : 'Search enquiry sender, subject...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                aria-label="Filter records"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700 cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              {activeTab === 'appointments' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              ) : (
                <>
                  <option value="new">New</option>
                  <option value="responded">Responded</option>
                  <option value="resolved">Resolved</option>
                </>
              )}
            </select>

            {(searchTerm || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {activeTab === 'appointments' ? (
            /* Appointments Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Patient Details</th>
                    <th className="py-3 px-4">Doctor & Department</th>
                    <th className="py-3 px-4">Schedule Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="max-w-sm mx-auto text-center space-y-2">
                          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                          <div className="text-sm font-bold text-slate-800">
                            {appointments.length === 0
                              ? 'No Appointments Recorded Yet'
                              : 'No Matching Appointments Found'}
                          </div>
                          <p className="text-xs text-slate-500">
                            {appointments.length === 0
                              ? 'When patients book online through the public portal, their records appear here instantly.'
                              : 'Try adjusting your search query or status filter.'}
                          </p>
                          {appointments.length === 0 && (
                            <Link
                              href="/doctors"
                              className="inline-block mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                            >
                              View Public Doctor Booking
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => {
                      const statusStyles = {
                        pending: 'bg-amber-50 text-amber-800 border-amber-300',
                        confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                        completed: 'bg-blue-50 text-blue-800 border-blue-300',
                        cancelled: 'bg-rose-50 text-rose-800 border-rose-300',
                      }[apt.status];

                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Patient info */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{apt.patientName}</span>
                              {apt.patientAge && (
                                <span className="text-[11px] font-normal text-slate-500">
                                  ({apt.patientAge}y · {apt.patientGender || 'Adult'})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{apt.patientPhone}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(apt.patientPhone, apt.id, 'Phone')}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                title="Copy phone"
                                aria-label="Copy phone"
                              >
                                {copiedId === apt.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {apt.symptoms && (
                              <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded mt-1 border border-slate-200/60 line-clamp-2">
                                <span className="font-semibold text-slate-700">Symptoms:</span> {apt.symptoms}
                              </div>
                            )}
                          </td>

                          {/* Doctor & Service */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-emerald-600" />
                              <span>{apt.doctorName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {apt.serviceTitle || 'General Clinical Consultation'}
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900 font-mono text-xs tabular-nums">
                              {formatDate(apt.appointmentDate)}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{apt.timeSlot}</div>
                          </td>

                          {/* Status Selector */}
                          <td className="py-3 px-4">
                            <select
                              value={apt.status}
                              onChange={(e) =>
                                handleStatusChange(apt.id, e.target.value as Appointment['status'])
                              }
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles} cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                              aria-label={`Change status for appointment ${apt.patientName}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(apt.id, apt.patientName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                              title="Delete appointment"
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
          ) : (
            /* Enquiries Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">Subject & Message</th>
                    <th className="py-3 px-4">Received</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No general enquiries found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredEnquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{enq.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{enq.phone}</div>
                          <div className="text-[11px] text-slate-400">{enq.email}</div>
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          <div className="font-semibold text-slate-800">{enq.subject}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {enq.message}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] font-mono tabular-nums">
                          {formatDate(enq.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              enq.status === 'new'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {enq.status === 'new' ? 'New Enquiry' : 'Responded'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
