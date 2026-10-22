import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
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
  Clock,
  DollarSign,
  Tag,
  Stethoscope,
  X,
  AlertTriangle,
  Layers,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNotification } from '../../context/NotificationContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export interface ServiceRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  iconName: string;
  imageUrl: string;
  features: string[];
  estimatedDurationMinutes?: number;
  priceStartingAt?: number;
  department: string;
  relatedDoctorIds?: string[];
  isActive: boolean;
  isPublished: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

const emptyService: Omit<ServiceRecord, 'id'> = {
  title: '',
  slug: '',
  category: 'Consultation & Diagnostics',
  summary: '',
  description: '',
  iconName: 'Activity',
  imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  features: ['Physician examination', 'Comprehensive clinical report'],
  estimatedDurationMinutes: 30,
  priceStartingAt: 500,
  department: 'General Medicine',
  relatedDoctorIds: [],
  isActive: true,
  isPublished: true,
  order: 1,
};

const serviceCategories = [
  'Consultation & Diagnostics',
  'Specialty Care',
  'Preventive Health',
  'Laboratory & Pathology',
  'Emergency & Urgent Care',
];

const availableIcons = [
  'Activity',
  'Stethoscope',
  'HeartHandshake',
  'Baby',
  'TestTubes',
  'ShieldCheck',
  'Clock',
  'Award',
  'Sparkles',
];

export const AdminServicesPage: React.FC = () => {
  const { success, error: notifyError } = useNotification();

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'price' | 'duration'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [formData, setFormData] = useState<Omit<ServiceRecord, 'id'>>(emptyService);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Preview
  const [previewService, setPreviewService] = useState<ServiceRecord | null>(null);

  // Delete confirmation
  const [deletingService, setDeletingService] = useState<ServiceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const fetchServicesAndDoctors = async () => {
    setIsLoading(true);
    try {
      const [servRes, docRes] = await Promise.all([
        fetch('/api/admin/services'),
        fetch('/api/admin/doctors'),
      ]);
      const servData = await servRes.json();
      const docData = await docRes.json();

      if (servData.success && Array.isArray(servData.data)) {
        setServices(servData.data);
      }
      if (docData.success && Array.isArray(docData.data)) {
        setAvailableDoctors(docData.data.map((d: any) => ({ id: d.id, name: d.name })));
      }
    } catch (err) {
      notifyError((err as Error).message, 'Fetch Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesAndDoctors();
  }, []);

  // Auto-slug generation from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingService ? prev.slug : slug,
    }));
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({ ...emptyService, order: services.length + 1 });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (service: ServiceRecord) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      slug: service.slug,
      category: service.category,
      summary: service.summary,
      description: service.description,
      iconName: service.iconName || 'Activity',
      imageUrl: service.imageUrl,
      features: service.features || [],
      estimatedDurationMinutes: service.estimatedDurationMinutes || 30,
      priceStartingAt: service.priceStartingAt || 500,
      department: service.department || 'General Medicine',
      relatedDoctorIds: service.relatedDoctorIds || [],
      isActive: service.isActive ?? true,
      isPublished: service.isPublished ?? true,
      order: service.order || 0,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Toggle Publication
  const handleTogglePublished = async (service: ServiceRecord) => {
    const nextStatus = !service.isPublished;
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, isPublished: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update publication status');
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isPublished: nextStatus } : s))
      );
      success(
        `Service "${service.title}" is now ${nextStatus ? 'Published' : 'Unpublished (Draft)'}.`,
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

    if (!formData.title.trim()) {
      setFormErrors((prev) => ({ ...prev, title: 'Service title is required' }));
      return;
    }
    if (!formData.slug.trim()) {
      setFormErrors((prev) => ({ ...prev, slug: 'URL slug is required' }));
      return;
    }
    if (!formData.summary.trim() || formData.summary.trim().length < 10) {
      setFormErrors((prev) => ({ ...prev, summary: 'Summary must be at least 10 characters' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save service');
      }

      success(
        editingService ? 'Service updated successfully.' : 'New service created successfully.',
        'Service Saved'
      );
      setIsFormOpen(false);
      fetchServicesAndDoctors();
    } catch (err) {
      notifyError((err as Error).message, 'Validation or Server Error');
      setFormErrors((prev) => ({ ...prev, form: (err as Error).message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete service
  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deletingService.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete service');
      setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
      success(`Service "${deletingService.title}" removed.`, 'Deleted');
      setDeletingService(null);
    } catch (err) {
      notifyError((err as Error).message, 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and Sort
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        const matchesSearch =
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && s.isPublished) ||
          (statusFilter === 'draft' && !s.isPublished);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'order') comp = a.order - b.order;
        else if (sortBy === 'title') comp = a.title.localeCompare(b.title);
        else if (sortBy === 'price') comp = (a.priceStartingAt || 0) - (b.priceStartingAt || 0);
        else if (sortBy === 'duration')
          comp = (a.estimatedDurationMinutes || 0) - (b.estimatedDurationMinutes || 0);
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [services, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage) || 1;
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout
      title="Services Management"
      subtitle="Complete clinical catalog, pricing, duration, connected doctors & publication"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Services' }]}
      actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
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
                placeholder="Search services by title, summary, or slug..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Categories</option>
              {serviceCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              <option value="title">Service Title</option>
              <option value="price">Starting Price</option>
              <option value="duration">Duration</option>
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
              onClick={fetchServicesAndDoctors}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Loading clinical services catalogue...</span>
            </div>
          ) : paginatedServices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Activity className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No services match your query</p>
              <p className="text-[11px] text-slate-400">
                Try modifying your search criteria or create a new clinical service.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Category & Department</th>
                    <th className="py-3 px-4">Duration & Pricing</th>
                    <th className="py-3 px-4 text-center">Order</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={service.imageUrl}
                            alt={service.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900">{service.title}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              /services/{service.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{service.category}</div>
                        <div className="text-[11px] text-slate-500">{service.department}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-emerald-700 font-bold">
                          {service.priceStartingAt ? `Starts ₹${service.priceStartingAt}` : 'Consult Desk'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {service.estimatedDurationMinutes ? `${service.estimatedDurationMinutes} mins` : 'Flexible'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-600 font-semibold">
                        #{service.order}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(service)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            service.isPublished
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Click to toggle publication"
                        >
                          {service.isPublished ? (
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
                            onClick={() => setPreviewService(service)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Preview Service"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(service)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingService(service)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Service"
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
                Showing page {currentPage} of {totalPages} ({filteredServices.length} total)
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

      {/* CREATE / EDIT SERVICE MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingService ? `Edit: ${editingService.title}` : 'Add Clinical Service'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure clinical scope, pricing, duration, connected specialists, and features.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
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
                    Service Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Diabetology & Endocrine Wellness"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.title}</p>
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
                    placeholder="e.g. diabetology-endocrine-wellness"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                  {formErrors.slug && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.slug}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {serviceCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. General Medicine"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={formData.estimatedDurationMinutes || 30}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedDurationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Starting Consultation / Procedure Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.priceStartingAt || 500}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceStartingAt: Number(e.target.value),
                      })
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visual Icon
                  </label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {availableIcons.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Image Banner URL <span className="text-rose-500">*</span>
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
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Summary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief 1-2 sentence overview shown in services grid"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Clinical Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed explanation of clinical methodology, preparation instructions, and care guidelines."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Features / Inclusions (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(formData.features || []).join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Comprehensive physical exam, Diabetic profiling, Medication titration"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Related Doctors */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Attending Specialists / Doctors
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableDoctors.map((doc) => {
                      const selected = (formData.relatedDoctorIds || []).includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            const current = formData.relatedDoctorIds || [];
                            const next = selected
                              ? current.filter((id) => id !== doc.id)
                              : [...current, doc.id];
                            setFormData({ ...formData, relatedDoctorIds: next });
                          }}
                          className={`text-xs px-3 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                            selected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {doc.name}
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
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Active Service
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
                  <span>{editingService ? 'Update Service' : 'Save & Publish Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL PREVIEW DRAWER */}
      {previewService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{previewService.title}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{previewService.category}</p>
                <p className="text-[11px] text-slate-400 font-mono">/services/{previewService.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewService(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <img
              src={previewService.imageUrl}
              alt={previewService.title}
              className="w-full h-44 rounded-xl object-cover border border-slate-200"
            />

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Starting Fee:</span>
                <span className="font-bold text-emerald-700">₹{previewService.priceStartingAt}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Duration:</span>
                <span className="font-semibold text-slate-800">
                  {previewService.estimatedDurationMinutes} mins
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{previewService.department}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Summary
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{previewService.summary}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <a
                href={`/services/${previewService.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setPreviewService(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delete Clinical Service?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>{deletingService.title}</strong>?
                This will automatically disconnect it from assigned doctors.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingService(null)}
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
          setFormData((prev) => ({ ...prev, imageUrl: selected.url }));
        }}
        targetCategory="services"
        title="Select Service Banner Image"
      />
    </AdminLayout>
  );
};
