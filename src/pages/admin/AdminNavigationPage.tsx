import React, { useState, useEffect } from 'react';
import {
  Compass,
  Save,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNotification } from '../../context/NotificationContext';

export interface NavItem {
  label: string;
  href: string;
  order: number;
  isExternal?: boolean;
}

export interface FooterSection {
  title: string;
  order: number;
  links: NavItem[];
}

export interface NavigationConfig {
  identifier: string;
  headerMenuItems: NavItem[];
  footerSections: FooterSection[];
  emergencyNotice?: string;
  appointmentCtaLabel: string;
  isPublished: boolean;
}

export const AdminNavigationPage: React.FC = () => {
  const { success, error: notifyError } = useNotification();

  const [config, setConfig] = useState<NavigationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal for Header Item
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [headerItemIndex, setHeaderItemIndex] = useState<number | null>(null);
  const [headerFormData, setHeaderFormData] = useState<NavItem>({
    label: '',
    href: '',
    order: 1,
    isExternal: false,
  });

  // Modal for Footer Link
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [targetSectionIdx, setTargetSectionIdx] = useState<number>(0);
  const [footerLinkIndex, setFooterLinkIndex] = useState<number | null>(null);
  const [footerFormData, setFooterFormData] = useState<NavItem>({
    label: '',
    href: '',
    order: 1,
    isExternal: false,
  });

  const fetchNavigation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/navigation');
      if (!res.ok) throw new Error('Failed to load navigation configuration');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (err) {
      notifyError((err as Error).message, 'Fetch Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save navigation');

      success('Navigation links and footer menus persisted.', 'Saved');
      fetchNavigation();
    } catch (err) {
      notifyError((err as Error).message, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  // Move Header Item Up / Down
  const handleMoveHeaderItem = (index: number, direction: 'up' | 'down') => {
    if (!config) return;
    const items = [...config.headerMenuItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    // re-index order
    items.forEach((item, i) => {
      item.order = i + 1;
    });

    setConfig({ ...config, headerMenuItems: items });
  };

  // Header Modal Submit
  const handleHeaderFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    if (!headerFormData.label.trim()) {
      notifyError('Navigation label is required', 'Validation');
      return;
    }
    if (!headerFormData.href.trim()) {
      notifyError('Navigation link URL is required', 'Validation');
      return;
    }

    const items = [...config.headerMenuItems];
    if (headerItemIndex !== null) {
      items[headerItemIndex] = { ...headerFormData };
    } else {
      items.push({ ...headerFormData, order: items.length + 1 });
    }

    setConfig({ ...config, headerMenuItems: items });
    setIsHeaderModalOpen(false);
  };

  const handleRemoveHeaderItem = (index: number) => {
    if (!config) return;
    const items = config.headerMenuItems.filter((_, i) => i !== index);
    items.forEach((item, i) => {
      item.order = i + 1;
    });
    setConfig({ ...config, headerMenuItems: items });
  };

  // Footer Link Submit
  const handleFooterFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    if (!footerFormData.label.trim()) {
      notifyError('Link label is required', 'Validation');
      return;
    }
    if (!footerFormData.href.trim()) {
      notifyError('Link URL is required', 'Validation');
      return;
    }

    const sections = [...config.footerSections];
    const currentSection = { ...sections[targetSectionIdx] };
    const links = [...currentSection.links];

    if (footerLinkIndex !== null) {
      links[footerLinkIndex] = { ...footerFormData };
    } else {
      links.push({ ...footerFormData, order: links.length + 1 });
    }

    currentSection.links = links;
    sections[targetSectionIdx] = currentSection;
    setConfig({ ...config, footerSections: sections });
    setIsFooterModalOpen(false);
  };

  const handleRemoveFooterLink = (secIdx: number, linkIdx: number) => {
    if (!config) return;
    const sections = [...config.footerSections];
    sections[secIdx].links = sections[secIdx].links.filter((_, idx) => idx !== linkIdx);
    setConfig({ ...config, footerSections: sections });
  };

  return (
    <AdminLayout
      title="Navigation & Footer Architecture"
      subtitle="Configure main menu links, ordering, URL safety checks & footer categories"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Navigation' }]}
      actions={
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaving ? 'Saving...' : 'Save Navigation'}</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {isLoading || !config ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Loading navigation tree...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Main Navigation Links */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Header Navigation Bar ({config.headerMenuItems.length} Items)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controls primary navigation targets shown in the sticky top desktop & mobile drawer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHeaderItemIndex(null);
                    setHeaderFormData({
                      label: '',
                      href: '/',
                      order: config.headerMenuItems.length + 1,
                      isExternal: false,
                    });
                    setIsHeaderModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Menu Item</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">Order</th>
                      <th className="py-2.5 px-4">Menu Label</th>
                      <th className="py-2.5 px-4">Target URL</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config.headerMenuItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-500">
                          #{item.order}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{item.label}</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-700">{item.href}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              item.isExternal
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.isExternal ? 'External' : 'Internal SPA'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveHeaderItem(idx, 'up')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === config.headerMenuItems.length - 1}
                              onClick={() => handleMoveHeaderItem(idx, 'down')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setHeaderItemIndex(idx);
                                setHeaderFormData({ ...item });
                                setIsHeaderModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveHeaderItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Delete Item"
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
            </div>

            {/* Footer Sections Links */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-emerald-600" />
                  <span>Footer Columns & Quick Navigation Links</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Organize footer column groupings (e.g. Quick Links, Patient Care, Policies).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.footerSections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                        <span>{section.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({section.links.length} links)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetSectionIdx(sIdx);
                          setFooterLinkIndex(null);
                          setFooterFormData({
                            label: '',
                            href: '/',
                            order: section.links.length + 1,
                            isExternal: false,
                          });
                          setIsFooterModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-white border border-slate-200 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-50"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Link</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {section.links.map((link, lIdx) => (
                        <div
                          key={lIdx}
                          className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200/60 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{link.label}</span>
                            <span className="text-[11px] font-mono text-slate-400 ml-2">
                              {link.href}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setTargetSectionIdx(sIdx);
                                setFooterLinkIndex(lIdx);
                                setFooterFormData({ ...link });
                                setIsFooterModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFooterLink(sIdx, lIdx)}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HEADER ITEM MODAL */}
      {isHeaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                {headerItemIndex !== null ? 'Edit Header Item' : 'New Header Menu Item'}
              </h4>
              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHeaderFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Menu Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={headerFormData.label}
                  onChange={(e) =>
                    setHeaderFormData({ ...headerFormData, label: e.target.value })
                  }
                  placeholder="e.g. Health Packages"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target URL / Route <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={headerFormData.href}
                  onChange={(e) => setHeaderFormData({ ...headerFormData, href: e.target.value })}
                  placeholder="e.g. /services or https://..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Safe URL schemes only (/path, https://, tel:, mailto:). Unsafe scripts are blocked.
                </p>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headerFormData.isExternal}
                    onChange={(e) =>
                      setHeaderFormData({ ...headerFormData, isExternal: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-medium text-slate-700">Open in New Tab (External)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHeaderModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER LINK MODAL */}
      {isFooterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                {footerLinkIndex !== null ? 'Edit Footer Link' : 'New Footer Link'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFooterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFooterFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={footerFormData.label}
                  onChange={(e) =>
                    setFooterFormData({ ...footerFormData, label: e.target.value })
                  }
                  placeholder="e.g. Diagnostic Lab Tests"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target URL / Route <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={footerFormData.href}
                  onChange={(e) => setFooterFormData({ ...footerFormData, href: e.target.value })}
                  placeholder="e.g. /services/pathology-diagnostics"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFooterModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
