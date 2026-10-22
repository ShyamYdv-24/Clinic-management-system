import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Share2,
  Code2,
  FileText,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Save,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Smartphone,
  Monitor,
  Tag,
  Plus,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useClinic } from '../../context/ClinicContext';
import { useNotification } from '../../context/NotificationContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

type SeoTab = 'snippets' | 'social' | 'schema' | 'sitemap_robots' | 'verification';

export const AdminSeoPage: React.FC = () => {
  const { settings, updateSettings, doctors, services, faqs } = useClinic();
  const { success, error: notifyError } = useNotification();

  const [activeTab, setActiveTab] = useState<SeoTab>('snippets');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form state initialized from clinic settings
  const [metaTitle, setMetaTitle] = useState(settings.metaTitle || 'Om Sai Adarsha Clinic — Comprehensive Healthcare & Diagnostics');
  const [metaDescription, setMetaDescription] = useState(
    settings.metaDescription ||
      'Expert doctor consultations, automated pathology lab tests, and 24x7 emergency medical assistance in Bengaluru. Book your OPD appointment online.'
  );
  const [productionUrl, setProductionUrl] = useState(settings.productionUrl || 'https://om-sai-adarsha.clinic');
  const [defaultOgImage, setDefaultOgImage] = useState(settings.defaultOgImage || settings.mainLogoUrl || '');
  const [searchConsoleVerification, setSearchConsoleVerification] = useState(settings.searchConsoleVerification || '');
  const [analyticsId, setAnalyticsId] = useState(settings.analyticsId || '');
  
  // Keywords tags
  const [keywords, setKeywords] = useState<string[]>([
    'Clinic in Bengaluru',
    'General Physician',
    'Pediatric Care',
    'Pathology Lab',
    'OPD Appointment',
    'Doctor Consultation',
    'Emergency Clinic',
  ]);
  const [newKeyword, setNewKeyword] = useState('');

  // Media Picker modal state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Copy indicator state
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);

  // Sync when settings change
  useEffect(() => {
    if (settings.metaTitle) setMetaTitle(settings.metaTitle);
    if (settings.metaDescription) setMetaDescription(settings.metaDescription);
    if (settings.productionUrl) setProductionUrl(settings.productionUrl);
    if (settings.defaultOgImage) setDefaultOgImage(settings.defaultOgImage);
    if (settings.searchConsoleVerification) setSearchConsoleVerification(settings.searchConsoleVerification);
    if (settings.analyticsId) setAnalyticsId(settings.analyticsId);
  }, [settings]);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== keywordToRemove));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        metaTitle,
        metaDescription,
        productionUrl,
        defaultOgImage,
        searchConsoleVerification,
        analyticsId,
      });

      // Also persist to backend API
      const token = sessionStorage.getItem('adminToken');
      await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          metaTitle,
          metaDescription,
          productionUrl,
          defaultOgImage,
          searchConsoleVerification,
          analyticsId,
        }),
      });

      success('SEO configuration and metadata updated successfully.', 'SEO Saved');
    } catch (err) {
      notifyError((err as Error).message, 'Failed to Save SEO');
    } finally {
      setIsSaving(false);
    }
  };

  // Structured Data JSON-LD preview
  const jsonLdPreview = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: settings.clinicName || 'Om Sai Adarsha Clinic',
    url: productionUrl,
    logo: settings.mainLogoUrl || `${productionUrl}/logo.png`,
    image: defaultOgImage || `${productionUrl}/og-image.jpg`,
    telephone: settings.emergencyPhone || settings.generalPhone || '+91-80-2838-5555',
    email: settings.email || 'care@om-sai-adarsha.clinic',
    priceRange: '₹₹',
    medicalSpecialty: [
      'General Medicine',
      'Pediatrics',
      'Cardiology',
      'Orthopedics',
      'Gynecology & Obstetrics',
      'Dermatology',
      'Pathology & Diagnostic Laboratory',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address?.street || '#42, 1st Cross, Vidyaranyapura Main Road',
      addressLocality: settings.address?.city || 'Bengaluru',
      addressRegion: settings.address?.state || 'Karnataka',
      postalCode: settings.address?.postalCode || '560097',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: settings.coordinates?.lat || 13.0827,
      longitude: settings.coordinates?.lng || 77.5615,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '09:00',
        closes: '13:00',
      },
    ],
  };

  const jsonLdString = JSON.stringify(jsonLdPreview, null, 2);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(jsonLdString);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    success('Schema.org JSON-LD copied to clipboard.');
  };

  // Static + dynamic sitemap entries
  const sitemapEntries = [
    { url: `${productionUrl}/`, priority: '1.0', changefreq: 'daily', type: 'Static Page' },
    { url: `${productionUrl}/about`, priority: '0.8', changefreq: 'weekly', type: 'Static Page' },
    { url: `${productionUrl}/services`, priority: '0.9', changefreq: 'daily', type: 'Clinical Catalog' },
    { url: `${productionUrl}/doctors`, priority: '0.9', changefreq: 'daily', type: 'Medical Faculty' },
    { url: `${productionUrl}/gallery`, priority: '0.7', changefreq: 'weekly', type: 'Facility Gallery' },
    { url: `${productionUrl}/faq`, priority: '0.8', changefreq: 'weekly', type: 'Patient FAQ' },
    { url: `${productionUrl}/contact`, priority: '0.8', changefreq: 'weekly', type: 'Contact & Location' },
    ...doctors.map((d) => ({
      url: `${productionUrl}/doctors/${d.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      type: `Doctor: ${d.name}`,
    })),
    ...services.map((s) => ({
      url: `${productionUrl}/services/${s.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      type: `Service: ${s.title}`,
    })),
  ];

  return (
    <AdminLayout
      title="SEO & Metadata Management"
      subtitle="Search snippet optimization, OpenGraph social sharing, MedicalClinic Schema.org JSON-LD, and robots.txt"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'SEO Management' }]}
      actions={
        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <span>XML Sitemap</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <span>robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : 'Save SEO Changes'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: 'snippets', label: '1. SERP & Search Snippets', icon: Search },
            { id: 'social', label: '2. Social & OpenGraph Cards', icon: Share2 },
            { id: 'schema', label: '3. MedicalClinic Schema (JSON-LD)', icon: Code2 },
            { id: 'sitemap_robots', label: '4. Sitemap & Robots.txt', icon: FileText },
            { id: 'verification', label: '5. Search Console & Analytics', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SeoTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SERP & SEARCH SNIPPETS */}
        {activeTab === 'snippets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            {/* Left Col: Edit Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span>Search Engine Listing Metadata</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure titles, meta summaries, and canonical URLs for Google and search engines.
                  </p>
                </div>

                {/* Canonical URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Canonical Website Domain URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={productionUrl}
                    onChange={(e) => setProductionUrl(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="https://om-sai-adarsha.clinic"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Canonical domain used in <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">&lt;link rel="canonical"&gt;</code> and absolute XML sitemap URLs.
                  </p>
                </div>

                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Primary HTML Title Tag (&lt;title&gt;) <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        metaTitle.length >= 30 && metaTitle.length <= 60
                          ? 'text-emerald-600'
                          : metaTitle.length > 60
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {metaTitle.length} / 60 chars {metaTitle.length > 60 ? '(may truncate)' : ''}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Om Sai Adarsha Clinic — Comprehensive Healthcare & Diagnostics"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Recommended length: 45 to 60 characters for optimal visibility.</p>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Meta Description (&lt;meta name="description"&gt;) <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        metaDescription.length >= 120 && metaDescription.length <= 160
                          ? 'text-emerald-600'
                          : metaDescription.length > 160
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {metaDescription.length} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    placeholder="Summarize clinic services, visiting doctor specialties, and emergency hours..."
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Recommended length: 120 to 160 characters.</p>
                </div>

                {/* Target Keywords */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Healthcare Search Keywords
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        <Tag className="w-3 h-3 text-emerald-600" />
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-rose-600 ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <form onSubmit={handleAddKeyword} className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add clinical keyword (e.g. Pediatrician Vidyaranyapura)..."
                      className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Col: Google SERP Simulation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Google SERP Simulation</span>
                  </h4>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setSerpDevice('desktop')}
                      className={`px-2 py-0.5 rounded flex items-center gap-1 font-semibold cursor-pointer ${
                        serpDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpDevice('mobile')}
                      className={`px-2 py-0.5 rounded flex items-center gap-1 font-semibold cursor-pointer ${
                        serpDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Google Result Card Mockup */}
                <div
                  className={`bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1 ${
                    serpDevice === 'mobile' ? 'max-w-[340px] mx-auto' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-sans">
                    <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                      OS
                    </div>
                    <div className="flex flex-col leading-tight truncate">
                      <span className="text-[12px] font-medium text-slate-900 truncate">
                        {settings.clinicName || 'Om Sai Adarsha Clinic'}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate font-mono">
                        {productionUrl.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-sans font-medium line-clamp-1 pt-1">
                    {metaTitle}
                  </h3>

                  <p className="text-xs text-[#4d5156] font-sans leading-relaxed line-clamp-2 pt-0.5">
                    {metaDescription}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real-Time Indexing Ready</span>
                  </div>
                  <p>
                    All public pages dynamically inject these values via SEO head tags and revalidate with search engine spiders on every request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOCIAL & OPENGRAPH */}
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>OpenGraph & Twitter Card Settings</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Defines the rich banner cards displayed when your clinic URL is shared on WhatsApp, Facebook, LinkedIn, X, and iMessage.
                  </p>
                </div>

                {/* OG Image */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Default Social Share Banner Image (1200 x 630 px) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Choose from Media Library</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={defaultOgImage}
                      onChange={(e) => setDefaultOgImage(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="https://om-sai-adarsha.clinic/og-banner.jpg or /uploads/..."
                      required
                    />
                    {defaultOgImage && (
                      <div className="w-16 h-10 rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={defaultOgImage}
                          alt="OG Card preview"
                          className="w-full h-full object-cover rounded"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Twitter Card Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Twitter / X Card Layout
                  </label>
                  <select
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    defaultValue="summary_large_image"
                  >
                    <option value="summary_large_image">summary_large_image (Full wide visual banner - Recommended)</option>
                    <option value="summary">summary (Small thumbnail with description)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Col: Social Card Simulation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Social Media Card Preview (WhatsApp / LinkedIn)</span>
                  </h4>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
                  <div className="h-44 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                    {defaultOgImage ? (
                      <img src={defaultOgImage} alt="Social banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <ImageIcon className="w-8 h-8 stroke-1" />
                        <span className="text-xs">No OG Image Configured</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 bg-white border-t border-slate-200 space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      {productionUrl.replace(/^https?:\/\//, '').split('/')[0]}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{metaTitle}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {metaDescription}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When patients share clinic links, this graphic card will display directly in chat apps and social feeds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEDICAL CLINIC SCHEMA (JSON-LD) */}
        {activeTab === 'schema' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>Schema.org MedicalClinic Structured Data (JSON-LD)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Embedded in the HTML document to qualify for Google Rich Results, knowledge graphs, and local map pack listings.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? 'Copied JSON-LD' : 'Copy Schema'}</span>
                  </button>
                  <a
                    href="https://validator.schema.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
                  >
                    <span>Validate on Schema.org</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 max-h-[460px] leading-relaxed">
                  <code>{jsonLdString}</code>
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">MedicalSpecialty Array</div>
                  <p className="text-slate-500 text-[11px]">
                    Identifies clinical disciplines for Google Healthcare Knowledge Panel.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">GeoCoordinates Specification</div>
                  <p className="text-slate-500 text-[11px]">
                    Coordinates (13.0827, 77.5615) link the clinic directly to local Google Maps queries.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">OpeningHoursSpecification</div>
                  <p className="text-slate-500 text-[11px]">
                    Informs searchers whether OPD consultation chambers are open right now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SITEMAP & ROBOTS.TXT */}
        {activeTab === 'sitemap_robots' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Sitemap section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Generated XML Sitemap ({sitemapEntries.length} URL entries)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live endpoint dynamically served at <code className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">/sitemap.xml</code>
                  </p>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200/60 cursor-pointer"
                >
                  <span>Open Live /sitemap.xml</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Index URL Location</th>
                      <th className="py-2.5 px-4">Content Category</th>
                      <th className="py-2.5 px-4 text-center">Change Frequency</th>
                      <th className="py-2.5 px-4 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {sitemapEntries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-900 text-xs">
                          {entry.url}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 text-xs">
                          {entry.type}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-500">
                          {entry.changefreq}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {entry.priority}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Robots.txt section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Crawl Directives (robots.txt)</span>
                </h3>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer"
                >
                  <span>Open Live /robots.txt</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{`User-agent: *
Allow: /
Disallow: /dashboard-admin/
Disallow: /api/admin/
Disallow: /api/auth/

Sitemap: ${productionUrl}/sitemap.xml`}
              </pre>

              <p className="text-xs text-slate-500">
                Protected administrative endpoints and authentication routes are explicitly blocked from crawler indexing, while clinical public pages are fully discoverable.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: VERIFICATION & ANALYTICS */}
        {activeTab === 'verification' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Search Console & Webmaster Verification</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify clinic domain ownership on Google Search Console to monitor impression volume, search queries, and index coverage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Search Console Verification Token
                  </label>
                  <input
                    type="text"
                    value={searchConsoleVerification}
                    onChange={(e) => setSearchConsoleVerification(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="e.g. google-site-verification=abc123xyz"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Injected as &lt;meta name="google-site-verification" content="..."&gt; in public pages.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Analytics 4 Measurement ID
                  </label>
                  <input
                    type="text"
                    value={analyticsId}
                    onChange={(e) => setAnalyticsId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tracks patient page views and appointment conversions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Picker Modal for OG Share Image */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        targetCategory="social"
        title="Select Social Share Banner Image"
        onSelect={(selected) => {
          setDefaultOgImage(selected.url);
          setIsMediaPickerOpen(false);
        }}
      />
    </AdminLayout>
  );
};
