import React, { useState, useEffect } from 'react';
import {
  Search,
  Upload,
  RefreshCw,
  Trash2,
  Edit2,
  Eye,
  Copy,
  Check,
  AlertTriangle,
  HardDrive,
  Cloud,
  Layers,
  FileImage,
  ExternalLink,
  Info,
  Calendar,
  X,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNotification } from '../../context/NotificationContext';

export interface MediaUsageRecord {
  entityType: 'doctor' | 'service' | 'gallery' | 'settings' | 'page';
  entityId: string;
  entityTitle: string;
  field: string;
}

export interface MediaAssetRecord {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  secureUrl: string;
  publicId?: string;
  category: string;
  altText: string;
  dimensions?: { width?: number; height?: number };
  tags: string[];
  usages?: MediaUsageRecord[];
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CloudinaryStatus {
  isConfigured: boolean;
  provider: 'cloudinary' | 'local_storage';
  cloudName: string | null;
  message: string;
}

const CATEGORIES = [
  { key: 'all', label: 'All Assets' },
  { key: 'logos', label: 'Logos & Brand' },
  { key: 'doctors', label: 'Doctor Photos' },
  { key: 'services', label: 'Service Banners' },
  { key: 'gallery', label: 'Gallery Photos' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'social', label: 'Social & OG' },
  { key: 'general', label: 'General' },
];

export const AdminMediaPage: React.FC = () => {
  const { success, error: notifyError } = useNotification();

  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [status, setStatus] = useState<CloudinaryStatus | null>(null);

  // Modals state
  const [previewAsset, setPreviewAsset] = useState<MediaAssetRecord | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [replaceTargetAsset, setReplaceTargetAsset] = useState<MediaAssetRecord | null>(null);
  const [editingAsset, setEditingAsset] = useState<MediaAssetRecord | null>(null);
  const [deleteTargetAsset, setDeleteTargetAsset] = useState<MediaAssetRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadTags, setUploadTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Replacement state
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);

  // Edit metadata form
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCategory, setEditCategory] = useState('general');
  const [editTags, setEditTags] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Deletion force confirmation
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStatus = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch('/api/admin/media/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success) {
        setStatus(json);
      }
    } catch (e) {
      console.warn('Could not fetch storage status:', e);
    }
  };

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const res = await fetch(`/api/admin/media?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAssets(json.data);
      }
    } catch (err) {
      notifyError('Failed to load media assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchAssets();
  }, [selectedCategory, searchQuery]);

  const handleCopyUrl = (asset: MediaAssetRecord) => {
    const targetUrl = asset.secureUrl || asset.url;
    navigator.clipboard.writeText(targetUrl);
    setCopiedId(asset.id);
    success('Media URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Upload Handlers
  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, SVG, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    setUploadError(null);
    setUploadFile(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setUploadTitle(cleanTitle);
    setUploadAltText(cleanTitle);

    const reader = new FileReader();
    reader.onload = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const token = sessionStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('category', uploadCategory);
      formData.append('altText', uploadAltText.trim());
      formData.append('tags', uploadTags);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Upload failed');
      }

      success(`Asset "${json.data.title}" uploaded successfully.`);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle('');
      setUploadAltText('');
      setUploadTags('');
      fetchAssets();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Replace Handlers
  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReplaceError('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setReplaceError('File exceeds 10MB limit.');
      return;
    }

    setReplaceError(null);
    setReplaceFile(file);

    const reader = new FileReader();
    reader.onload = () => setReplacePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTargetAsset || !replaceFile) return;

    setIsReplacing(true);
    setReplaceError(null);

    try {
      const token = sessionStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', replaceFile);

      const res = await fetch(`/api/admin/media/${replaceTargetAsset.id}/replace`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Replacement failed');
      }

      success(
        `Asset replaced successfully. Updated ${json.updatedReferences?.length || 0} referencing content records!`
      );
      setReplaceTargetAsset(null);
      setReplaceFile(null);
      setReplacePreview(null);
      fetchAssets();
    } catch (err: any) {
      setReplaceError(err.message || 'Replacement failed');
    } finally {
      setIsReplacing(false);
    }
  };

  // Edit Metadata Handlers
  const handleOpenEdit = (asset: MediaAssetRecord) => {
    setEditingAsset(asset);
    setEditTitle(asset.title);
    setEditAltText(asset.altText);
    setEditCategory(asset.category);
    setEditTags((asset.tags || []).join(', '));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    setIsSavingEdit(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const tagsArray = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/media/${editingAsset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          altText: editAltText.trim(),
          category: editCategory,
          tags: tagsArray,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update metadata');
      }

      success('Asset metadata updated successfully.');
      setEditingAsset(null);
      fetchAssets();
    } catch (err: any) {
      notifyError(err.message || 'Could not update metadata');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Handlers
  const handleConfirmDelete = async (force: boolean = false) => {
    if (!deleteTargetAsset) return;

    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const url = `/api/admin/media/${deleteTargetAsset.id}${force ? '?force=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Deletion failed');
      }

      success('Media asset removed successfully.');
      setDeleteTargetAsset(null);
      fetchAssets();
    } catch (err: any) {
      notifyError(err.message || 'Deletion rejected');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick stats
  const totalSizeBytes = assets.reduce((acc, a) => acc + (a.sizeBytes || 0), 0);
  const totalUsedCount = assets.filter((a) => (a.usageCount || 0) > 0).length;

  return (
    <AdminLayout
      title="Media Asset Library"
      subtitle="Secure image uploads, Cloudinary cloud delivery, accessibility metadata, and relational usage tracking."
      breadcrumbs={[{ label: 'Media Library' }]}
      onRefresh={fetchAssets}
      isRefreshing={isLoading}
      actions={
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Cloudinary Storage Status Card / Banner */}
        {status && (
          <div
            className={`p-4 rounded-2xl border text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
              status.isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  status.isConfigured ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {status.isConfigured ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    {status.isConfigured ? 'Cloudinary Cloud Storage Active' : 'Local Development Storage Mode'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      status.isConfigured
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {status.provider}
                  </span>
                </div>
                <p className="mt-0.5 text-slate-600 leading-relaxed">
                  {status.message}
                </p>
              </div>
            </div>

            {!status.isConfigured && (
              <div className="shrink-0 bg-white/80 border border-amber-200 rounded-xl p-2.5 font-mono text-[11px] text-amber-800">
                <span className="font-semibold block text-[10px] uppercase text-amber-600">
                  Required Environment Variables:
                </span>
                CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
              </div>
            )}
          </div>
        )}

        {/* Overview Stat Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Media Assets</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{assets.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">In Active Use</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{totalUsedCount} assets</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Volume</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Categories</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">8 Types</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search media by title, alt text, filename, or tags..."
                className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={fetchAssets}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Assets</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching and inspecting media assets...</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FileImage className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No media assets match your criteria</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a new image or clear your active search filters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Upload First Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map((asset) => {
                const targetUrl = asset.secureUrl || asset.url;
                const isCopied = copiedId === asset.id;
                const hasUsages = (asset.usageCount || 0) > 0;

                return (
                  <div
                    key={asset.id}
                    className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                      <img
                        src={targetUrl}
                        alt={asset.altText}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {asset.category}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2">
                        {hasUsages ? (
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            <span>{asset.usageCount} {asset.usageCount === 1 ? 'use' : 'uses'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium bg-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded-md">
                            Unused
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewAsset(asset)}
                          className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="Detailed Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(asset)}
                          className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="Copy Public URL"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplaceTargetAsset(asset);
                            setReplaceFile(null);
                            setReplacePreview(null);
                            setReplaceError(null);
                          }}
                          className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="Replace Image File"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(asset)}
                          className="p-2 bg-white/90 hover:bg-white text-emerald-600 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetAsset(asset)}
                          className="p-2 bg-white/90 hover:bg-white text-rose-600 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={asset.title}>
                          {asset.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono line-clamp-1 mt-0.5" title={asset.originalFileName}>
                          {asset.originalFileName}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {asset.dimensions?.width && asset.dimensions?.height
                            ? `${asset.dimensions.width}×${asset.dimensions.height}`
                            : asset.mimeType}
                        </span>
                        <span>{(asset.sizeBytes / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL PREVIEW DRAWER / MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">{previewAsset.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200 flex items-center justify-center p-2">
                <img
                  src={previewAsset.secureUrl || previewAsset.url}
                  alt={previewAsset.altText}
                  className="max-h-72 object-contain rounded-lg"
                />
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[11px] block">MIME Type</span>
                  <span className="font-semibold text-slate-800 font-mono">{previewAsset.mimeType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Dimensions</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {previewAsset.dimensions?.width} × {previewAsset.dimensions?.height} px
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">File Size</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {(previewAsset.sizeBytes / 1024).toFixed(1)} KB ({(previewAsset.sizeBytes / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Category</span>
                  <span className="font-semibold text-slate-800 capitalize">{previewAsset.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Public Storage ID</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11px] truncate block" title={previewAsset.publicId}>
                    {previewAsset.publicId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Uploaded Date</span>
                  <span className="font-semibold text-slate-800">
                    {previewAsset.createdAt ? new Date(previewAsset.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Live Usages in Content */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Content References ({previewAsset.usages?.length || 0})</span>
                  </span>
                </div>

                {previewAsset.usages && previewAsset.usages.length > 0 ? (
                  <div className="space-y-1.5">
                    {previewAsset.usages.map((u, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                            {u.entityType}
                          </span>
                          <span className="font-semibold text-slate-800">{u.entityTitle}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">{u.field}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    This media asset is not currently referenced by any doctor, service, gallery item, or page section.
                  </p>
                )}
              </div>

              {/* Public URL copy bar */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Public CDN / Storage URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={previewAsset.secureUrl || previewAsset.url}
                    className="flex-1 text-xs px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(previewAsset)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedId === previewAsset.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload New Media Asset</h3>
                <p className="text-xs text-slate-500">
                  Cloudinary storage with server-side validation and magic-byte inspection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:border-emerald-500 transition-colors">
                {uploadPreview ? (
                  <div className="space-y-2">
                    <img
                      src={uploadPreview}
                      alt="Upload Preview"
                      className="max-h-40 mx-auto rounded-lg object-contain border border-slate-200"
                    />
                    <label className="text-xs text-emerald-600 font-bold cursor-pointer hover:underline block">
                      Choose Different File
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={handleUploadFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-800 block">Select image from computer</span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Supports JPEG, PNG, WebP, SVG, and GIF up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      onChange={handleUploadFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descriptive Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Dr. Suresh Kumar OPD Suite"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asset Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="doctors">Doctor Photographs</option>
                    <option value="services">Service Banners</option>
                    <option value="gallery">Gallery Photos</option>
                    <option value="logos">Logos & Brand</option>
                    <option value="facilities">Facilities & Suites</option>
                    <option value="banners">Banners & CTAs</option>
                    <option value="social">Social Share (OG)</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alt Text (Accessibility) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    placeholder="Descriptive label for screen readers"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="clinic, physician, diagnostic, cardiology"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading to Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Asset</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPLACE IMAGE MODAL */}
      {replaceTargetAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Replace Media Asset File</h3>
                <p className="text-xs text-slate-500">
                  Replacing this asset will automatically update all referenced records across doctors, services, and gallery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplaceTargetAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {replaceError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{replaceError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Current Asset</span>
                <img
                  src={replaceTargetAsset.secureUrl || replaceTargetAsset.url}
                  alt="Current"
                  className="w-full h-28 object-cover rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">New Image File</span>
                {replacePreview ? (
                  <img
                    src={replacePreview}
                    alt="Replacement Preview"
                    className="w-full h-28 object-cover rounded-lg border border-emerald-300 ring-2 ring-emerald-500"
                  />
                ) : (
                  <div className="w-full h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                    Select new file below
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose Replacement Image File <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleReplaceFileChange}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Magic-byte content validation will run on the server to ensure image authenticity.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplaceTargetAsset(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replaceFile || isReplacing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-2"
                >
                  {isReplacing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Replacement...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace & Update Referencing Records</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT METADATA MODAL */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Asset Metadata</h3>
                <p className="text-xs text-slate-500">Update descriptive title, category, alt text, and tags.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="doctors">Doctor Photographs</option>
                    <option value="services">Service Banners</option>
                    <option value="gallery">Gallery Photos</option>
                    <option value="logos">Logos & Brand</option>
                    <option value="facilities">Facilities & Suites</option>
                    <option value="banners">Banners & CTAs</option>
                    <option value="social">Social Share (OG)</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alt Text <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Metadata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL WITH USAGE WARNING */}
      {deleteTargetAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  (deleteTargetAsset.usageCount || 0) > 0
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {(deleteTargetAsset.usageCount || 0) > 0 ? 'Asset In Use - Deletion Guard' : 'Confirm Asset Deletion'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(deleteTargetAsset.usageCount || 0) > 0
                    ? 'This asset cannot be safely deleted because active clinical content still references it.'
                    : `Are you sure you want to delete "${deleteTargetAsset.title}"?`}
                </p>
              </div>
            </div>

            {/* List active usages if any */}
            {(deleteTargetAsset.usageCount || 0) > 0 && deleteTargetAsset.usages && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-rose-900 block">
                  Active References ({deleteTargetAsset.usages.length}):
                </span>
                <ul className="space-y-1 text-rose-800 list-disc list-inside">
                  {deleteTargetAsset.usages.map((u, i) => (
                    <li key={i}>
                      <span className="font-semibold">{u.entityTitle}</span> ({u.field})
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-rose-700 mt-1">
                  To prevent broken image links on public pages, replace the image or remove references before deleting.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetAsset(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              {(deleteTargetAsset.usageCount || 0) > 0 ? (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleConfirmDelete(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {isDeleting ? 'Force Deleting...' : 'Force Delete & Unlink'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleConfirmDelete(false)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
