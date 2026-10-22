import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Star,
  ExternalLink,
  Upload,
  X,
  AlertTriangle,
  ArrowUpDown,
  FolderOpen,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNotification } from '../../context/NotificationContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export interface GalleryRecord {
  id: string;
  title: string;
  category: 'facilities' | 'laboratories' | 'consultation' | 'equipment' | 'events' | 'team';
  imageUrl: string;
  description?: string;
  featured: boolean;
  isPublished: boolean;
  order: number;
  createdAt?: string;
}

const emptyGalleryItem: Omit<GalleryRecord, 'id'> = {
  title: '',
  category: 'facilities',
  imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
  description: '',
  featured: false,
  isPublished: true,
  order: 1,
};

const galleryCategories: Array<{ key: GalleryRecord['category']; label: string }> = [
  { key: 'facilities', label: 'Clinic Facilities' },
  { key: 'consultation', label: 'Consultation Suites' },
  { key: 'laboratories', label: 'Diagnostic Laboratories' },
  { key: 'equipment', label: 'Medical Equipment' },
  { key: 'events', label: 'Health Camps & Events' },
  { key: 'team', label: 'Medical Staff & Team' },
];

export const AdminGalleryPage: React.FC = () => {
  const { success, error: notifyError } = useNotification();

  const [items, setItems] = useState<GalleryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'title'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal & form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryRecord | null>(null);
  const [formData, setFormData] = useState<Omit<GalleryRecord, 'id'>>(emptyGalleryItem);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview & Delete
  const [previewItem, setPreviewItem] = useState<GalleryRecord | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/gallery');
      if (!res.ok) throw new Error('Failed to load gallery items');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (err) {
      notifyError((err as Error).message, 'Fetch Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ ...emptyGalleryItem, order: items.length + 1 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: GalleryRecord) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description || '',
      featured: item.featured ?? false,
      isPublished: item.isPublished ?? true,
      order: item.order || 0,
    });
    setIsFormOpen(true);
  };

  const handleTogglePublished = async (item: GalleryRecord) => {
    const nextStatus = !item.isPublished;
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isPublished: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update publication status');
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPublished: nextStatus } : i))
      );
      success(`Photo "${item.title}" is now ${nextStatus ? 'Published' : 'Draft'}.`, 'Updated');
    } catch (err) {
      notifyError((err as Error).message, 'Update Failed');
    }
  };

  const handleToggleFeatured = async (item: GalleryRecord) => {
    const nextFeatured = !item.featured;
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, featured: nextFeatured }),
      });
      if (!res.ok) throw new Error('Failed to update featured flag');
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, featured: nextFeatured } : i))
      );
      success(`Photo "${item.title}" featured status updated.`, 'Updated');
    } catch (err) {
      notifyError((err as Error).message, 'Update Failed');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      notifyError('Title is required', 'Form Error');
      return;
    }
    if (!formData.imageUrl.trim()) {
      notifyError('Image URL is required', 'Form Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem ? `/api/admin/gallery/${editingItem.id}` : '/api/admin/gallery';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save gallery photo');

      success(
        editingItem ? 'Gallery item updated.' : 'New photo added to gallery.',
        'Photo Saved'
      );
      setIsFormOpen(false);
      fetchGallery();
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
      const res = await fetch(`/api/admin/gallery/${deletingItem.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete gallery item');
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      success('Gallery item removed.', 'Deleted');
      setDeletingItem(null);
    } catch (err) {
      notifyError((err as Error).message, 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => {
        const matchesSearch =
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = categoryFilter === 'all' || i.category === categoryFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && i.isPublished) ||
          (statusFilter === 'draft' && !i.isPublished);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'order') comp = a.order - b.order;
        else if (sortBy === 'title') comp = a.title.localeCompare(b.title);
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [items, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  return (
    <AdminLayout
      title="Gallery & Facility Media"
      subtitle="Manage photo showcases, diagnostic room previews, tags, and display ordering"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Gallery' }]}
      actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Photo</span>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos by title or description..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Categories</option>
              {galleryCategories.map((c) => (
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
              <option value="title">Caption / Title</option>
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
              onClick={fetchGallery}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Gallery Grid View */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Loading gallery assets...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs space-y-2">
            <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No photos found</p>
            <p className="text-[11px] text-slate-400">Add clinic photographs or change filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-all"
              >
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                      #{item.order}
                    </span>
                    {item.featured && (
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(item)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-colors shadow-xs ${
                        item.isPublished
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800/80 text-slate-200'
                      }`}
                    >
                      {item.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {item.category}
                    </div>
                    <div className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(item)}
                      className={`p-1 rounded cursor-pointer ${
                        item.featured
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-300 hover:text-amber-400'
                      }`}
                      title="Toggle Featured"
                    >
                      <Star className={`w-4 h-4 ${item.featured ? 'fill-current' : ''}`} />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Photo Details' : 'Add Photo to Gallery'}
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
                  Caption / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modern Automated Diagnostic Lab"
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
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as any })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {galleryCategories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Image URL / Asset Path <span className="text-rose-500">*</span>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Alt Text
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the clinical equipment, suite, or environment depicted."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">Feature on Homepage</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">Published</span>
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
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Photo' : 'Add Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL PREVIEW */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{previewItem.title}</h4>
                <p className="text-[11px] text-emerald-700 font-semibold uppercase">{previewItem.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewItem.imageUrl}
              alt={previewItem.title}
              className="w-full max-h-[70vh] object-contain rounded-xl bg-slate-900"
            />
            {previewItem.description && (
              <p className="text-xs text-slate-600">{previewItem.description}</p>
            )}
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
            <h4 className="font-bold text-sm text-slate-900">Delete Gallery Photo?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to permanently remove <strong>{deletingItem.title}</strong>?
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

      {/* MEDIA PICKER MODAL */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(selected) => {
          setFormData((prev) => ({
            ...prev,
            imageUrl: selected.url,
            title: prev.title || selected.title,
            description: prev.description || selected.altText,
          }));
        }}
        targetCategory="gallery"
        title="Select Gallery Image"
      />
    </AdminLayout>
  );
};
