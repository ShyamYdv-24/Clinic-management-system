import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  ArrowUpDown,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNotification } from '../../context/NotificationContext';

export interface FAQRecord {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'appointments' | 'services' | 'insurance' | 'emergency';
  order: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt?: string;
}

const emptyFAQ: Omit<FAQRecord, 'id'> = {
  question: '',
  answer: '',
  category: 'general',
  order: 1,
  isActive: true,
  isPublished: true,
};

const faqCategories: Array<{ key: FAQRecord['category']; label: string }> = [
  { key: 'general', label: 'General Information' },
  { key: 'appointments', label: 'Appointments & Scheduling' },
  { key: 'services', label: 'Clinical Services & Lab' },
  { key: 'insurance', label: 'Insurance & Billing' },
  { key: 'emergency', label: '24x7 Emergency Desk' },
];

export const AdminFaqsPage: React.FC = () => {
  const { success, error: notifyError } = useNotification();

  const [faqs, setFaqs] = useState<FAQRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'question'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Expanded FAQ rows
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal & form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQRecord | null>(null);
  const [formData, setFormData] = useState<Omit<FAQRecord, 'id'>>(emptyFAQ);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deletingFaq, setDeletingFaq] = useState<FAQRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/faqs');
      if (!res.ok) throw new Error('Failed to load FAQs');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFaqs(data.data);
      }
    } catch (err) {
      notifyError((err as Error).message, 'Fetch Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setFormData({ ...emptyFAQ, order: faqs.length + 1 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (faq: FAQRecord) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order || 0,
      isActive: faq.isActive ?? true,
      isPublished: faq.isPublished ?? true,
    });
    setIsFormOpen(true);
  };

  const handleTogglePublished = async (faq: FAQRecord) => {
    const nextStatus = !faq.isPublished;
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...faq, isPublished: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update FAQ status');
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, isPublished: nextStatus } : f))
      );
      success(
        `FAQ is now ${nextStatus ? 'Published' : 'Unpublished (Draft)'}.`,
        'Status Updated'
      );
    } catch (err) {
      notifyError((err as Error).message, 'Update Failed');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || formData.question.length < 3) {
      notifyError('Question must be at least 3 characters', 'Form Error');
      return;
    }
    if (!formData.answer.trim() || formData.answer.length < 5) {
      notifyError('Answer must be at least 5 characters', 'Form Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingFaq ? `/api/admin/faqs/${editingFaq.id}` : '/api/admin/faqs';
      const method = editingFaq ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save FAQ');

      success(editingFaq ? 'FAQ updated.' : 'New FAQ item created.', 'Saved');
      setIsFormOpen(false);
      fetchFaqs();
    } catch (err) {
      notifyError((err as Error).message, 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFaq) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/faqs/${deletingFaq.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete FAQ');
      setFaqs((prev) => prev.filter((f) => f.id !== deletingFaq.id));
      success('FAQ item deleted.', 'Deleted');
      setDeletingFaq(null);
    } catch (err) {
      notifyError((err as Error).message, 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFaqs = useMemo(() => {
    return faqs
      .filter((f) => {
        const matchesSearch =
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && f.isPublished) ||
          (statusFilter === 'draft' && !f.isPublished);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'order') comp = a.order - b.order;
        else if (sortBy === 'question') comp = a.question.localeCompare(b.question);
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [faqs, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  return (
    <AdminLayout
      title="FAQ Management"
      subtitle="Edit clinical questions, insurance policies, appointments guidance & answers"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'FAQs' }]}
      actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ Item</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-7xl">
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-1 w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs by question or answer keyword..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Categories</option>
              {faqCategories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
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
              <option value="question">Question</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={fetchFaqs}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* FAQs List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Loading FAQs...</span>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No FAQ entries match</p>
              <p className="text-[11px] text-slate-400">Add a question and answer above.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div key={faq.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {faq.category}
                          </span>
                          <span className="text-xs font-mono text-slate-400">#{faq.order}</span>
                          <button
                            type="button"
                            onClick={() => handleTogglePublished(faq)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${
                              faq.isPublished
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {faq.isPublished ? 'Published' : 'Draft'}
                          </button>
                        </div>
                        <h4
                          onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                          className="font-bold text-xs text-slate-900 cursor-pointer hover:text-emerald-700 flex items-center justify-between"
                        >
                          <span>{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                          )}
                        </h4>
                        {isExpanded && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100 mt-2">
                            {faq.answer}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(faq)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Edit FAQ"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingFaq(faq)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingFaq ? 'Edit FAQ Item' : 'Create FAQ Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. How do I get my diagnostic blood test report online?"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {faqCategories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Answer <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide a clear, accurate, and reassuring answer for patients."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-1.5 pb-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">Published on FAQ Page</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Delete FAQ Item?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this question from the knowledge base?
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFaq(null)}
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
