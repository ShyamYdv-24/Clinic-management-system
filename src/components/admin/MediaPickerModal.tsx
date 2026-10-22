import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Upload,
  Check,
  ImageIcon,
  FolderOpen,
  Filter,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

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
  usageCount?: number;
  createdAt?: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: { url: string; id: string; altText: string; title: string }) => void;
  targetCategory?: string;
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  targetCategory,
  title = 'Select Media Asset',
}) => {
  const { success, error: notifyError } = useNotification();
  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(targetCategory || 'all');
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetRecord | null>(null);

  // Upload tab state
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCategory, setUploadCategory] = useState(targetCategory || 'general');
  const [isUploading, setIsUploading] = useState(false);

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
      console.warn('Failed to fetch media assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, selectedCategory, searchQuery]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifyError('Please select a valid image file (JPEG, PNG, WebP, SVG, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notifyError('File size exceeds the 10MB limit.');
      return;
    }

    setUploadFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setUploadTitle(cleanName);
    setUploadAltText(cleanName);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('category', uploadCategory);
      formData.append('altText', uploadAltText.trim());

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Upload failed');
      }

      success('Image uploaded successfully to Media Library.');
      onSelect({
        url: json.data.secureUrl || json.data.url,
        id: json.data.id,
        altText: json.data.altText,
        title: json.data.title,
      });
      onClose();
    } catch (err: any) {
      notifyError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (!selectedAsset) return;
    onSelect({
      url: selectedAsset.secureUrl || selectedAsset.url,
      id: selectedAsset.id,
      altText: selectedAsset.altText,
      title: selectedAsset.title,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                Choose an asset from Cloudinary storage or upload a new photo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  activeTab === 'library' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload New
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Library View */}
        {activeTab === 'library' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filter bar */}
            <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets by name, tag, or alt text..."
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'logos', 'doctors', 'services', 'gallery', 'facilities', 'social'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium capitalize cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <span>Loading media assets...</span>
                </div>
              ) : assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs text-center">
                  <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">No media assets found</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload an image or adjust your search filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Upload Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {assets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`group relative rounded-xl border p-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 relative mb-2">
                          <img
                            src={asset.secureUrl || asset.url}
                            alt={asset.altText}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-slate-900/70 text-white px-1.5 py-0.5 rounded capitalize backdrop-blur-xs">
                            {asset.category}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1" title={asset.title}>
                            {asset.title}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                            <span>{(asset.sizeBytes / 1024).toFixed(0)} KB</span>
                            {asset.usageCount !== undefined && asset.usageCount > 0 && (
                              <span className="text-emerald-700 font-medium">Used in {asset.usageCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {selectedAsset ? (
                  <span className="font-medium text-slate-800">
                    Selected: <span className="text-emerald-700 font-semibold">{selectedAsset.title}</span>
                  </span>
                ) : (
                  <span>Click an asset to select</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedAsset}
                  onClick={handleConfirmSelect}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  Use Selected Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload View */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadSubmit} className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
            <div className="max-w-xl mx-auto w-full space-y-4">
              {/* Drag/Drop area */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50 relative">
                {uploadPreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="max-h-48 rounded-xl object-contain shadow-xs border border-slate-200 mb-3"
                    />
                    <label className="text-xs text-emerald-600 font-semibold cursor-pointer hover:underline">
                      Change File
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to choose or drag an image here
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Supports JPEG, PNG, WebP, SVG, and GIF up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Form fields */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asset Title <span className="text-rose-500">*</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="doctors">Doctor Photographs</option>
                    <option value="services">Service Images</option>
                    <option value="gallery">Gallery Photos</option>
                    <option value="logos">Clinic Logos & Branding</option>
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
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Back to Library
              </button>
              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading to Cloud Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Select</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
