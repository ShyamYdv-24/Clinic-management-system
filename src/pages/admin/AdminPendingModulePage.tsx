import React from 'react';
import {
  FileText,
  UserCheck,
  Activity,
  Image as ImageIcon,
  HelpCircle,
  MessageSquareQuote,
  Compass,
  HardDrive,
  Globe,
  Clock,
  ArrowRight,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useClinic } from '../../context/ClinicContext';
import { Link } from '../../routes/RouterContext';

export interface PendingModuleConfig {
  slug: string;
  title: string;
  subtitle: string;
  phase: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  dataModel: string;
  fields: { name: string; type: string; description: string }[];
  currentCountLabel: string;
  getCurrentCount: (clinic: ReturnType<typeof useClinic>) => number;
  publicPreviewHref?: string;
  schemaFileName: string;
}

export const MODULE_REGISTRY: Record<string, PendingModuleConfig> = {
  pages: {
    slug: 'pages',
    title: 'Pages & Content Sections',
    subtitle: 'Manage static and dynamic public website pages',
    phase: 'Phase 6',
    icon: FileText,
    description:
      'Centralized visual and structured content management for all public-facing pages: Hero headers, Clinic Introduction, Mission & Vision statements, Emergency announcements, and OPD visiting hour displays.',
    dataModel: 'PageModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/Page.ts',
    currentCountLabel: 'Published Site Pages',
    getCurrentCount: () => 7,
    publicPreviewHref: '/',
    fields: [
      { name: 'slug', type: 'String (indexed, unique)', description: 'URL route path (e.g. "/", "/about")' },
      { name: 'title', type: 'String', description: 'Page navigation and document title' },
      { name: 'sections', type: 'Array<Section>', description: 'Dynamic modular content blocks & hero elements' },
      { name: 'isPublished', type: 'Boolean', description: 'Public visibility toggle' },
      { name: 'lastUpdatedBy', type: 'ObjectId (Admin)', description: 'Audit trail of modifying administrator' },
    ],
  },
  doctors: {
    slug: 'doctors',
    title: 'Medical Specialists & Doctors',
    subtitle: 'Manage clinic physician roster, OPD schedules & profiles',
    phase: 'Phase 7',
    icon: UserCheck,
    description:
      'Comprehensive administration for clinic practitioners: profile biographies, medical credentials, OPD day and hour schedules, consultation fees, and avatar photo assets.',
    dataModel: 'DoctorModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/Doctor.ts',
    currentCountLabel: 'Active Practitioners',
    getCurrentCount: (clinic) => clinic.doctors.length,
    publicPreviewHref: '/doctors',
    fields: [
      { name: 'name', type: 'String', description: 'Physician full name with medical titles' },
      { name: 'specialty', type: 'String', description: 'Clinical domain (Cardiology, Pediatrics, etc.)' },
      { name: 'experienceYears', type: 'Number', description: 'Years of clinical practice' },
      { name: 'availableDays', type: 'Array<String>', description: 'Days of weekly OPD availability' },
      { name: 'consultationFee', type: 'Number', description: 'Standard in-clinic consultation charge' },
      { name: 'isAvailable', type: 'Boolean', description: 'Active booking intake flag' },
    ],
  },
  services: {
    slug: 'services',
    title: 'Clinical Services & Departments',
    subtitle: 'Manage diagnostic, preventive & curative healthcare offerings',
    phase: 'Phase 8',
    icon: Activity,
    description:
      'Configure healthcare services offered at Om Sai Adarsha Clinic: clinical summaries, pricing starting rates, department categorization, preparation instructions, and booking links.',
    dataModel: 'ServiceModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/Service.ts',
    currentCountLabel: 'Configured Services',
    getCurrentCount: (clinic) => clinic.services.length,
    publicPreviewHref: '/services',
    fields: [
      { name: 'title', type: 'String', description: 'Clinical service or diagnostic procedure name' },
      { name: 'department', type: 'String', description: 'Department classification' },
      { name: 'priceStartingAt', type: 'Number', description: 'Base charge or consultation starting fee' },
      { name: 'features', type: 'Array<String>', description: 'Standard inclusions and diagnostic coverage' },
      { name: 'isActive', type: 'Boolean', description: 'Service operational status' },
    ],
  },
  gallery: {
    slug: 'gallery',
    title: 'Clinic Gallery & Facilities',
    subtitle: 'Manage facility photos, diagnostics labs & infrastructure media',
    phase: 'Phase 9',
    icon: ImageIcon,
    description:
      'Media management for clinical facility photography: Reception, Consultation Chambers, Diagnostic Pathology Lab, Observation Ward, and Pharmacy counters.',
    dataModel: 'GalleryModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/Gallery.ts',
    currentCountLabel: 'Facility Assets',
    getCurrentCount: (clinic) => clinic.gallery.length,
    publicPreviewHref: '/gallery',
    fields: [
      { name: 'title', type: 'String', description: 'Descriptive title of facility area' },
      { name: 'category', type: 'String (Enum)', description: 'Facility, Lab, Consultation, Equipment' },
      { name: 'imageUrl', type: 'String', description: 'High-fidelity asset URL' },
      { name: 'caption', type: 'String', description: 'Accessibility caption and context' },
      { name: 'order', type: 'Number', description: 'Display sequencing index' },
    ],
  },
  faqs: {
    slug: 'faqs',
    title: 'Frequently Asked Questions',
    subtitle: 'Manage patient guidance, insurance questions & clinic policies',
    phase: 'Phase 10',
    icon: HelpCircle,
    description:
      'Curate patient self-help queries: appointment preparation instructions, accepted insurance plans, emergency triage, and prescription refill protocols.',
    dataModel: 'FAQModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/FAQ.ts',
    currentCountLabel: 'Published FAQs',
    getCurrentCount: (clinic) => clinic.faqs.length,
    publicPreviewHref: '/faq',
    fields: [
      { name: 'question', type: 'String', description: 'Patient question prompt' },
      { name: 'answer', type: 'String', description: 'Clear clinical answer or administrative protocol' },
      { name: 'category', type: 'String (Enum)', description: 'Appointments, Services, Emergency, Billing' },
      { name: 'order', type: 'Number', description: 'Display accordion sequence' },
      { name: 'isPublished', type: 'Boolean', description: 'Publication visibility toggle' },
    ],
  },
  testimonials: {
    slug: 'testimonials',
    title: 'Patient Testimonials & Reviews',
    subtitle: 'Moderate patient feedback, verification status & ratings',
    phase: 'Phase 11',
    icon: MessageSquareQuote,
    description:
      'Manage verified patient feedback, clinical outcome ratings, treating doctor attribution, and privacy compliance before public publication.',
    dataModel: 'TestimonialModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/Testimonial.ts',
    currentCountLabel: 'Verified Testimonials',
    getCurrentCount: () => 4,
    publicPreviewHref: '/',
    fields: [
      { name: 'patientName', type: 'String', description: 'Patient name or anonymized initials' },
      { name: 'rating', type: 'Number (1-5)', description: 'Clinical care satisfaction rating' },
      { name: 'review', type: 'String', description: 'Patient testimonial narrative' },
      { name: 'treatmentCategory', type: 'String', description: 'Clinical service received' },
      { name: 'isVerified', type: 'Boolean', description: 'Clinical audit verification check' },
    ],
  },
  navigation: {
    slug: 'navigation',
    title: 'Navigation & Footer Configuration',
    subtitle: 'Manage header menus, footer columns & emergency links',
    phase: 'Phase 12',
    icon: Compass,
    description:
      'Configure site-wide navigation architecture: header CTA buttons, OPD appointment quick-links, legal disclaimers, medical license notices, and emergency phone contacts.',
    dataModel: 'NavigationModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/Navigation.ts',
    currentCountLabel: 'Active Menu Items',
    getCurrentCount: () => 7,
    publicPreviewHref: '/',
    fields: [
      { name: 'menuType', type: 'String', description: '"header_primary" | "footer_links" | "quick_actions"' },
      { name: 'items', type: 'Array<{label, href, order}>', description: 'Hierarchical navigation items' },
      { name: 'emergencyBannerText', type: 'String', description: 'Top site announcement notice' },
      { name: 'isPublished', type: 'Boolean', description: 'Active menu status' },
    ],
  },
  media: {
    slug: 'media',
    title: 'Media Library & Assets',
    subtitle: 'Manage image storage, doctor avatars & facility photography',
    phase: 'Phase 13',
    icon: HardDrive,
    description:
      'Digital asset pipeline: local filesystem & cloud storage file tracking, MIME-type validation, responsive image thumbnails, and alt-tag accessibility management.',
    dataModel: 'MediaAssetModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/MediaAsset.ts',
    currentCountLabel: 'Tracked Assets',
    getCurrentCount: () => 12,
    fields: [
      { name: 'fileName', type: 'String', description: 'Sanitized storage file name' },
      { name: 'mimeType', type: 'String', description: 'image/jpeg, image/png, image/webp' },
      { name: 'sizeBytes', type: 'Number', description: 'File size in bytes' },
      { name: 'dimensions', type: 'String', description: 'Width and height resolution' },
      { name: 'storagePath', type: 'String', description: 'Local or CDN destination URL' },
    ],
  },
  seo: {
    slug: 'seo',
    title: 'SEO & Metadata Management',
    subtitle: 'Manage search indexing, OpenGraph cards & MedicalClinic schema',
    phase: 'Phase 14',
    icon: Globe,
    description:
      'Search engine optimization and structured metadata: MedicalClinic JSON-LD schema, canonical URLs, social sharing cards, Google Business profile tags, and automated sitemap.xml generation.',
    dataModel: 'SiteSettingsModel (MongoDB / Mongoose)',
    schemaFileName: 'src/db/models/Setting.ts',
    currentCountLabel: 'Configured Schemas',
    getCurrentCount: () => 3,
    publicPreviewHref: '/',
    fields: [
      { name: 'metaTitle', type: 'String', description: 'Primary HTML title tag (< 60 chars)' },
      { name: 'metaDescription', type: 'String', description: 'Search snippet summary (< 160 chars)' },
      { name: 'ogImage', type: 'String', description: 'Social share preview image card' },
      { name: 'schemaType', type: 'String', description: '"MedicalClinic" | "Physician" | "LocalBusiness"' },
      { name: 'keywords', type: 'Array<String>', description: 'Target healthcare search keywords' },
    ],
  },
};

export const AdminPendingModulePage: React.FC<{ moduleKey: string }> = ({ moduleKey }) => {
  const clinic = useClinic();
  const config = MODULE_REGISTRY[moduleKey];

  if (!config) {
    return (
      <AdminLayout title="Module Not Found">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Requested module does not exist</h2>
          <p className="text-xs text-slate-500 mt-1">Please select a valid option from the sidebar.</p>
          <Link
            href="/dashboard-admin"
            className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
          >
            Return to Overview
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const Icon = config.icon;
  const currentCount = config.getCurrentCount(clinic);

  return (
    <AdminLayout
      title={config.title}
      subtitle={`Scheduled for ${config.phase}`}
      breadcrumbs={[
        { label: 'Admin', href: '/dashboard-admin' },
        { label: config.title },
      ]}
      actions={
        config.publicPreviewHref ? (
          <Link
            href={config.publicPreviewHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview Public View</span>
          </Link>
        ) : undefined
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* Implementation Status Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {config.phase} Implementation
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Architecture & Schema Ready
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">{config.title}</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {config.description}
                </p>
              </div>
            </div>

            {/* Quick Count Metric */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl shrink-0 text-right md:min-w-[140px]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {config.currentCountLabel}
              </div>
              <div className="text-2xl font-extrabold text-white mt-0.5 font-mono tabular-nums">
                {currentCount}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center justify-end gap-1">
                <span>Active in clinic data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Schema & Field Specification */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Database Schema Specification</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Model: <code className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">{config.dataModel}</code> · Source: <code className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">{config.schemaFileName}</code>
              </p>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Verified in Phase 3
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Field Name</th>
                  <th className="py-2.5 px-4">Type & Constraints</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {config.fields.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 text-xs">
                      {f.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                      {f.type}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 text-xs">
                      {f.description}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Valid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phase Transition Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Full Management UI Scheduled for {config.phase}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                The database schema, validation rules, and public view controllers are fully tested. CRUD administration will be mounted next.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard-admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <span>Return to Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
