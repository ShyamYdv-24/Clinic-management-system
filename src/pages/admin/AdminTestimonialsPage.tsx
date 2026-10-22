import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  RefreshCw,
  X,
  AlertTriangle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNotification } from '../../context/NotificationContext';

export interface TestimonialRecord {
  id: string;
  patientName: string;
  patientInitials?: string;
  rating: number;
  review: string;
  treatmentCategory?: string;
  doctorName?: string;
  serviceTitle?: string;
  isVerified: boolean;
  isPublished: boolean;
  order: number;
  date?: string;
}

const emptyTestimonial: Omit<TestimonialRecord, 'id'> = {
  patientName: '',
  patientInitials: '',
  rating: 5,
  review: '',
  treatmentCategory: 'General Consultation',
  doctorName: '',
  serviceTitle: '',
  isVerified: true,
  isPublished: false,
  order: 1,
  date: new Date().toISOString().split('T')[0],
};

export const AdminTestimonialsPage: React.FC = () => {
  const { success, error: notifyError } = useNotification();

  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Form & Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialRecord | null>(null);
  const [formData, setFormData] = useState<Omit<TestimonialRecord, 'id'>>(emptyTestimonial);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deletingItem, setDeletingItem] = useState<TestimonialRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      if (!res.ok) throw new Error('Failed to load testimonials');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTestimonials(data.data);
      }
    } catch (err) {
      notifyError((err as Error).message, 'Fetch Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      ...emptyTestimonial,
      order: testimonials.length + 1,
      date: new Date().toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: TestimonialRecord) => {
    setEditingItem(t);
    setFormData({
      patientName: t.patientName,
      patientInitials: t.patientInitials || '',
      rating: t.rating || 5,
      review: t.review,
      treatmentCategory: t.treatmentCategory || '',
      doctorName: t.doctorName || '',
      serviceTitle: t.serviceTitle || '',
      isVerified: t.isVerified ?? true,
      isPublished: t.isPublished ?? false,
      order: t.order || 0,
      date: t.date || new Date().toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  const handleTogglePublished = async (t: TestimonialRecord) => {
    const nextStatus = !t.isPublished;
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...t, isPublished: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update publication status');
      setTestimonials((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, isPublished: nextStatus } : item))
      );
      success(
        `Testimonial by ${t.patientName} is now ${nextStatus ? 'Published' : 'Draft'}.`,
        'Updated'
      );
    } catch (err) {
      notifyError((err as Error).message, 'Update Failed');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      notifyError('Patient name is required', 'Form Error');
      return;
    }
    if (!formData.review.trim() || formData.review.length < 10) {
      notifyError('Review text must be at least 10 characters', 'Form Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/testimonials/${editingItem.id}`
        : '/api/admin/testimonials';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save testimonial');

      success(
        editingItem ? 'Patient testimonial updated.' : 'Authorized testimonial added.',
        'Saved'
      );
      setIsFormOpen(false);
      fetchTestimonials();
    } catch (err) {
      notifyError((err as Error).message, 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deletingItem.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete testimonial');
      setTestimonials((prev) => prev.filter((t) => t.id !== deletingItem.id));
      success('Testimonial removed.', 'Deleted');
      setDeletingItem(null);
    } catch (err) {
      notifyError((err as Error).message, 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const matchesSearch =
        t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.treatmentCategory && t.treatmentCategory.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && t.isPublished) ||
        (statusFilter === 'draft' && !t.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [testimonials, searchQuery, statusFilter]);

  return (
    <AdminLayout
      title="Authentic Patient Testimonials"
      subtitle="Authorized patient feedback, clinical domain ratings & verified status"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Testimonials' }]}
      actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Testimonial</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* Compliance Notice */}
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Medical Ethics Policy:</span> Only add genuine, verified
            testimonials with patient consent. Never invent fabricated patient reviews or artificial
            ratings. If authentic feedback is unavailable, keep the module empty or in draft status.
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-1 w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search testimonials by patient name or feedback..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchTestimonials}
            className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Loading authentic testimonials...</span>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <MessageSquareQuote className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No testimonials recorded</p>
              <p className="text-[11px] text-slate-400">
                In adherence to healthcare standards, this module remains empty until real patient
                feedback with informed consent is registered.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTestimonials.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.patientName}</span>
                        {item.treatmentCategory && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {item.treatmentCategory}
                          </span>
                        )}
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < item.rating ? 'fill-current' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(item)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${
                            item.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{item.review}"
                      </p>

                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        {item.doctorName && <span>Doctor: {item.doctorName}</span>}
                        {item.date && <span>Date: {item.date}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Edit Testimonial"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Testimonial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                {editingItem ? 'Edit Testimonial' : 'Register Authorized Testimonial'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name / Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Treatment Category
                  </label>
                  <input
                    type="text"
                    value={formData.treatmentCategory || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, treatmentCategory: e.target.value })
                    }
                    placeholder="e.g. Diabetology Care"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Review / Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Authentic clinical testimonial provided by the patient."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    value={formData.doctorName || ''}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Suresh Kumar"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-medium text-slate-700">Published on Website</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-medium text-slate-700">Verified Patient</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Delete Testimonial?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to permanently remove the review by <strong>{deletingItem.patientName}</strong>?
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
