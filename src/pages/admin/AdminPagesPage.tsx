import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  Layers,
  ArrowUpDown,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNotification } from '../../context/NotificationContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export interface PageSectionItem {
  sectionKey: string;
  heading?: string;
  subheading?: string;
  content?: string;
  mediaUrl?: string;
  order: number;
  isPublished: boolean;
}

export interface PageDocumentRecord {
  id?: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: PageSectionItem[];
  isPublished: boolean;
}

export const AdminPagesPage: React.FC = () => {
  const { success, error: notifyError } = useNotification();

  const [pages, setPages] = useState<PageDocumentRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('home');
  const [activePage, setActivePage] = useState<PageDocumentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [targetSectionIndex, setTargetSectionIndex] = useState<number | null>(null);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pages');
      if (!res.ok) throw new Error('Failed to load editable pages');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPages(data.data);
        const current = data.data.find((p: any) => p.slug === selectedSlug) || data.data[0];
        if (current) {
          setActivePage(JSON.parse(JSON.stringify(current)));
          setSelectedSlug(current.slug);
        }
      }
    } catch (err) {
      notifyError((err as Error).message, 'Fetch Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    const found = pages.find((p) => p.slug === slug);
    if (found) {
      setActivePage(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleSectionChange = (
    index: number,
    field: keyof PageSectionItem,
    value: string | number | boolean
  ) => {
    if (!activePage) return;
    const nextSections = [...activePage.sections];
    nextSections[index] = {
      ...nextSections[index],
      [field]: value,
    };
    setActivePage({
      ...activePage,
      sections: nextSections,
    });
  };

  const handleAddSection = () => {
    if (!activePage) return;
    const newSection: PageSectionItem = {
      sectionKey: `custom_section_${Date.now()}`,
      heading: 'New Clinical Highlight',
      subheading: 'Highlighting exceptional patient care and diagnostic speed',
      content: 'Enter the body content for this website block here.',
      order: activePage.sections.length + 1,
      isPublished: true,
    };
    setActivePage({
      ...activePage,
      sections: [...activePage.sections, newSection],
    });
  };

  const handleRemoveSection = (index: number) => {
    if (!activePage) return;
    const next = activePage.sections.filter((_, idx) => idx !== index);
    setActivePage({
      ...activePage,
      sections: next,
    });
  };

  const handleSavePage = async () => {
    if (!activePage) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${activePage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activePage),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save page sections');

      success(`Page "${activePage.title}" content updated and persisted.`, 'Saved');
      fetchPages();
    } catch (err) {
      notifyError((err as Error).message, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Pages & Controlled Section Editor"
      subtitle="Edit live homepage banners, introduction, feature cards, CTAs & metadata"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Pages & Sections' }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>Preview Content</span>
          </button>
          <button
            type="button"
            onClick={handleSavePage}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : 'Save Page'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl">
        {/* Page Selector Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex items-center gap-1 overflow-x-auto">
          {pages.map((p) => {
            const active = selectedSlug === p.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => handleSelectPage(p.slug)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{p.title}</span>
                <span className="text-[10px] font-mono text-slate-400">/{p.slug}</span>
              </button>
            );
          })}
        </div>

        {activePage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Sections Editor */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Configured Content Sections ({activePage.sections.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rearrange, toggle visibility, and modify headings and body text safely.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Block</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {activePage.sections.map((section, idx) => (
                    <div
                      key={section.sectionKey}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{section.order || idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                            {section.sectionKey}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={section.isPublished}
                              onChange={(e) =>
                                handleSectionChange(idx, 'isPublished', e.target.checked)
                              }
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span className="text-xs font-medium text-slate-600">
                              {section.isPublished ? 'Visible' : 'Hidden'}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Heading / Title
                          </label>
                          <input
                            type="text"
                            value={section.heading || ''}
                            onChange={(e) => handleSectionChange(idx, 'heading', e.target.value)}
                            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                            placeholder="Section Heading"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Subheading / Motto
                          </label>
                          <input
                            type="text"
                            value={section.subheading || ''}
                            onChange={(e) => handleSectionChange(idx, 'subheading', e.target.value)}
                            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Optional supporting subheading"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Body Content
                          </label>
                          <textarea
                            rows={3}
                            value={section.content || ''}
                            onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
                            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Enter sanitized plain text content"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Section Media / Banner Image
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetSectionIndex(idx);
                                setIsMediaPickerOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2 py-0.5 rounded cursor-pointer"
                            >
                              <ImageIcon className="w-3 h-3" />
                              <span>Choose Media</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={section.mediaUrl || ''}
                              onChange={(e) => handleSectionChange(idx, 'mediaUrl', e.target.value)}
                              className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                              placeholder="Optional image URL or /uploads/..."
                            />
                            {section.mediaUrl && (
                              <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={section.mediaUrl}
                                  alt="Section media"
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right col: Page Metadata & SEO */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Page Settings & Metadata</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Title, SEO tags & global status</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Internal Page Title
                    </label>
                    <input
                      type="text"
                      value={activePage.title}
                      onChange={(e) => setActivePage({ ...activePage, title: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Browser & SEO Meta Title
                    </label>
                    <input
                      type="text"
                      value={activePage.metaTitle || ''}
                      onChange={(e) =>
                        setActivePage({ ...activePage, metaTitle: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Om Sai Adarsha Clinic | Family Medicine"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Search Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={activePage.metaDescription || ''}
                      onChange={(e) =>
                        setActivePage({ ...activePage, metaDescription: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Brief snippet for search engines..."
                    />
                  </div>

                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activePage.isPublished}
                        onChange={(e) =>
                          setActivePage({ ...activePage, isPublished: e.target.checked })
                        }
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Page is Published Live
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewModalOpen && activePage && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Live Preview: {activePage.title} (/{activePage.slug})
                </h4>
                <p className="text-xs text-slate-400">Rendering published sections only</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {activePage.sections
                .filter((s) => s.isPublished)
                .map((sec) => (
                  <div key={sec.sectionKey} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                      {sec.sectionKey}
                    </div>
                    {sec.heading && <h3 className="font-bold text-base text-slate-900">{sec.heading}</h3>}
                    {sec.subheading && <p className="text-xs text-slate-500 font-medium mb-2">{sec.subheading}</p>}
                    {sec.content && <p className="text-xs text-slate-700 leading-relaxed">{sec.content}</p>}
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setTargetSectionIndex(null);
        }}
        title="Select Section Media Asset"
        onSelect={(selected) => {
          if (targetSectionIndex !== null && activePage) {
            handleSectionChange(targetSectionIndex, 'mediaUrl', selected.url);
          }
          setIsMediaPickerOpen(false);
          setTargetSectionIndex(null);
        }}
      />
    </AdminLayout>
  );
};
