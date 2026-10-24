import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Clock,
  DollarSign,
  Languages,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  X,
  Stethoscope,
  FolderOpen,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNotification } from '../../context/NotificationContext';
import { useClinic } from '../../context/ClinicContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export interface DoctorRecord {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  department: string;
  qualifications: string[];
  experienceYears: number;
  bio: string;
  consultationFee: number;
  availableDays: string[];
  availableTimeSlots: string[];
  avatarUrl: string;
  contactEmail?: string;
  phone?: string;
  languages?: string[];
  relatedServiceIds?: string[];
  isAvailable: boolean;
  isPublished: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

const emptyDoctor: Omit<DoctorRecord, 'id'> = {
  name: '',
  slug: '',
  specialty: '',
  department: 'General Medicine',
  qualifications: ['M.B.B.S.'],
  experienceYears: 5,
  bio: '',
  consultationFee: 500,
  availableDays: ['Monday', 'Wednesday', 'Friday'],
  availableTimeSlots: ['09:00 AM - 01:00 PM', '05:00 PM - 08:00 PM'],
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  contactEmail: '',
  phone: '',
  languages: ['English', 'Kannada', 'Hindi'],
  relatedServiceIds: [],
  isAvailable: true,
  isPublished: true,
  order: 1,
};

const departments = [
  'General Medicine',
  'Obstetrics & Gynecology',
  'Pediatrics & Child Health',
  'Pathology & Laboratory Medicine',
  'Cardiology & Preventive Care',
  'Orthopedics & Joint Health',
  'Dermatology',
];

const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AdminDoctorsPage: React.FC = () => {
  const { services } = useClinic();
  const { success, error: notifyError } = useNotification();

  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'experience' | 'fee'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorRecord | null>(null);
  const [formData, setFormData] = useState<Omit<DoctorRecord, 'id'>>(emptyDoctor);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Preview Drawer
  const [previewDoctor, setPreviewDoctor] = useState<DoctorRecord | null>(null);

  // Delete confirmation
  const [deletingDoctor, setDeletingDoctor] = useState<DoctorRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/doctors');
      if (!res.ok) throw new Error('Failed to load doctors list');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDoctors(data.data);
      }
    } catch (err) {
      notifyError((err as Error).message, 'Fetch Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Keyboard accessibility for modal and drawer dismissal
  useEffect(() => {
    if (!isFormOpen && !previewDoctor && !deletingDoctor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFormOpen) setIsFormOpen(false);
        if (previewDoctor) setPreviewDoctor(null);
        if (deletingDoctor) setDeletingDoctor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, previewDoctor, deletingDoctor]);

  // Auto-slug generation from doctor name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/^dr\.?\s*/i, 'dr-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingDoctor ? prev.slug : slug,
    }));
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setFormData({ ...emptyDoctor, order: doctors.length + 1 });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (doctor: DoctorRecord) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      slug: doctor.slug,
      specialty: doctor.specialty,
      department: doctor.department,
      qualifications: doctor.qualifications || [],
      experienceYears: doctor.experienceYears || 0,
      bio: doctor.bio || '',
      consultationFee: doctor.consultationFee || 0,
      availableDays: doctor.availableDays || [],
      availableTimeSlots: doctor.availableTimeSlots || [],
      avatarUrl: doctor.avatarUrl,
      contactEmail: doctor.contactEmail || '',
      phone: doctor.phone || '',
      languages: doctor.languages || [],
      relatedServiceIds: doctor.relatedServiceIds || [],
      isAvailable: doctor.isAvailable ?? true,
      isPublished: doctor.isPublished ?? true,
      order: doctor.order || 0,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Toggle Publication
  const handleTogglePublished = async (doctor: DoctorRecord) => {
    const nextStatus = !doctor.isPublished;
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doctor, isPublished: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update publication status');
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctor.id ? { ...d, isPublished: nextStatus } : d))
      );
      success(
        `Dr. ${doctor.name} is now ${nextStatus ? 'Published' : 'Unpublished (Draft)'}.`,
        'Status Updated'
      );
    } catch (err) {
      notifyError((err as Error).message, 'Update Failed');
    }
  };

  // Submit Create or Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick check
    if (!formData.name.trim()) {
      setFormErrors((prev) => ({ ...prev, name: 'Doctor name is required' }));
      return;
    }
    if (!formData.slug.trim()) {
      setFormErrors((prev) => ({ ...prev, slug: 'URL slug is required' }));
      return;
    }
    if (!formData.specialty.trim()) {
      setFormErrors((prev) => ({ ...prev, specialty: 'Specialty is required' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingDoctor
        ? `/api/admin/doctors/${editingDoctor.id}`
        : '/api/admin/doctors';
      const method = editingDoctor ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save doctor');
      }

      success(
        editingDoctor ? 'Doctor profile updated successfully.' : 'New doctor added successfully.',
        'Doctor Saved'
      );
      setIsFormOpen(false);
      fetchDoctors();
    } catch (err) {
      notifyError((err as Error).message, 'Validation or Server Error');
      setFormErrors((prev) => ({ ...prev, form: (err as Error).message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete doctor
  const handleConfirmDelete = async () => {
    if (!deletingDoctor) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/doctors/${deletingDoctor.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete doctor');
      setDoctors((prev) => prev.filter((d) => d.id !== deletingDoctor.id));
      success(`Doctor ${deletingDoctor.name} has been removed.`, 'Deleted');
      setDeletingDoctor(null);
    } catch (err) {
      notifyError((err as Error).message, 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and Sort
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        const matchesSearch =
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.slug.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDept =
          departmentFilter === 'all' || doc.department === departmentFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && doc.isPublished) ||
          (statusFilter === 'draft' && !doc.isPublished);

        return matchesSearch && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'order') comp = a.order - b.order;
        else if (sortBy === 'name') comp = a.name.localeCompare(b.name);
        else if (sortBy === 'experience') comp = a.experienceYears - b.experienceYears;
        else if (sortBy === 'fee') comp = a.consultationFee - b.consultationFee;
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [doctors, searchQuery, departmentFilter, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage) || 1;
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout
      title="Doctors Management"
      subtitle="Full CRUD directory, verified qualifications, specialties & schedule"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Doctors' }]}
      actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-7xl">
        {/* Controls Ribbon */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-1 w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search doctors by name, specialty, department or slug..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="order">Display Order</option>
              <option value="name">Name</option>
              <option value="experience">Experience</option>
              <option value="fee">Consultation Fee</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={fetchDoctors}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Loading registered physicians from database...</span>
            </div>
          ) : paginatedDoctors.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No doctors match your query</p>
              <p className="text-[11px] text-slate-400">
                Try modifying your search criteria or add a new doctor record above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Specialty & Dept</th>
                    <th className="py-3 px-4">Experience & Fee</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4 text-center">Order</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.avatarUrl}
                            alt={doc.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{doc.name}</span>
                              {!doc.isAvailable && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-normal">
                                  On Leave
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              /doctors/{doc.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{doc.specialty}</div>
                        <div className="text-[11px] text-slate-500">{doc.department}</div>
                        {doc.qualifications && doc.qualifications.length > 0 && (
                          <div className="text-[10px] text-emerald-700 font-medium truncate max-w-xs">
                            {doc.qualifications.join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-700">{doc.experienceYears} Years Exp</div>
                        <div className="text-emerald-700 font-bold">₹{doc.consultationFee}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-600 truncate max-w-xs">
                          {doc.availableDays?.join(', ') || 'By Appointment'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {doc.availableTimeSlots?.[0] || 'Flexible Hours'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-600 font-semibold">
                        #{doc.order}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(doc)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            doc.isPublished
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Click to toggle publication"
                        >
                          {doc.isPublished ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoctor(doc)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Preview Doctor Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(doc)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit Doctor"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingDoctor(doc)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Ribbon */}
          {totalPages > 1 && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing page {currentPage} of {totalPages} ({filteredDoctors.length} total)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                      currentPage === idx + 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT DOCTOR MODAL */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-form-modal-title"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 id="doctor-form-modal-title" className="text-base font-bold text-slate-900">
                  {editingDoctor ? `Edit: ${editingDoctor.name}` : 'Register New Medical Doctor'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage physician credentials, slug, consultation fee, OPD slots, and publication status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Close doctor form dialog"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {formErrors.form && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formErrors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physician Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Dr. Suresh Kumar M.D."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value.toLowerCase().trim() })
                    }
                    placeholder="e.g. dr-suresh-kumar"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                  {formErrors.slug && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.slug}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialty & Focus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g. Consultant Physician & Diabetologist"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualifications (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.qualifications.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualifications: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="M.B.B.S., M.D. (Internal Medicine), F.C.C.P."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience in Years
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceYears: Number(e.target.value) })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consultation Fee (₹ INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData({ ...formData, consultationFee: Number(e.target.value) })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Avatar Photograph URL <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Choose from Media Library</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Biography <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Comprehensive overview of physician background, diagnostic methodology, and achievements."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Languages (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(formData.languages || []).join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="English, Kannada, Hindi, Telugu"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email (Internal)
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="doctor@om-sai-adarsha.clinic"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Available Days Picker */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Consultation Days of Week
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allWeekdays.map((day) => {
                      const active = formData.availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? formData.availableDays.filter((d) => d !== day)
                              : [...formData.availableDays, day];
                            setFormData({ ...formData, availableDays: next });
                          }}
                          className={`text-xs px-3 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Published on Public Website
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Currently Accepting Appointments
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingDoctor ? 'Update Doctor Profile' : 'Save & Publish Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL PREVIEW DRAWER */}
      {previewDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={previewDoctor.avatarUrl}
                  alt={previewDoctor.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{previewDoctor.name}</h3>
                  <p className="text-xs text-emerald-700 font-semibold">{previewDoctor.specialty}</p>
                  <p className="text-[11px] text-slate-400 font-mono">/doctors/{previewDoctor.slug}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoctor(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{previewDoctor.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Qualifications:</span>
                <span className="font-semibold text-slate-800">
                  {previewDoctor.qualifications?.join(', ') || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-emerald-700">₹{previewDoctor.consultationFee}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Available Days:</span>
                <span className="font-semibold text-slate-800">
                  {previewDoctor.availableDays?.join(', ') || 'All Days'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Languages:</span>
                <span className="font-semibold text-slate-800">
                  {previewDoctor.languages?.join(', ') || 'English'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Physician Biography
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{previewDoctor.bio}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <a
                href={`/doctors/${previewDoctor.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setPreviewDoctor(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Remove Doctor Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>Dr. {deletingDoctor.name}</strong>?
                This will automatically remove references to this doctor from all clinical services.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoctor(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PICKER MODAL */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(selected) => {
          setFormData((prev) => ({ ...prev, avatarUrl: selected.url }));
        }}
        targetCategory="doctors"
        title="Select Doctor Profile Photograph"
      />
    </AdminLayout>
  );
};
