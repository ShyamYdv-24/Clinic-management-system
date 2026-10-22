import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  Clock,
  Megaphone,
  KeyRound,
  Lock,
  ShieldCheck,
  Globe,
  Share2,
  Sliders,
  Calendar,
  Compass,
  MapPin,
  Mail,
  Palette,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Info,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useClinic } from '../../context/ClinicContext';
import { useNotification } from '../../context/NotificationContext';
import { ClinicSettings, DaySchedule, NavLinkItem } from '../../types/clinic';
import { clinicSettingsSchema } from '../../validation/settings.schema';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

type SettingsTab =
  | 'identity'
  | 'contact'
  | 'hours'
  | 'social'
  | 'seo'
  | 'header_footer'
  | 'appointments'
  | 'security';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useClinic();
  const { success, error: notifyError, info } = useNotification();

  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');
  const [formData, setFormData] = useState<ClinicSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'logo' | 'ogImage'>('logo');

  // Sync formData whenever settings changes (e.g. from backend fetch on mount)
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  // Password rotation state (Preserving Phase 4)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRotating, setIsRotating] = useState(false);
  const [rotateSuccess, setRotateSuccess] = useState<string | null>(null);
  const [rotateError, setRotateError] = useState<string | null>(null);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    // Validate using server-aligned Zod schema
    const validation = clinicSettingsSchema.safeParse(formData);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      const errMsg = `${firstIssue.path.join('.')}: ${firstIssue.message}`;
      setSaveError(errMsg);
      notifyError(errMsg, 'Validation Error');
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      success('Clinic configuration saved and persisted to database.', 'Settings Updated');
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings to server.';
      setSaveError(msg);
      notifyError(msg, 'Server Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRotateError(null);
    setRotateSuccess(null);

    if (newPassword !== confirmPassword) {
      setRotateError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 8) {
      setRotateError('New password must be at least 8 characters long');
      return;
    }

    setIsRotating(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch('/api/auth/rotate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password rotation failed');
      }

      if (data.token) {
        sessionStorage.setItem('adminToken', data.token);
      }

      setRotateSuccess('Administrator password rotated successfully! All prior sessions invalidated.');
      success('Password rotated successfully.', 'Security Updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setRotateSuccess(null), 6000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Password rotation failed';
      setRotateError(msg);
      notifyError(msg, 'Rotation Failed');
    } finally {
      setIsRotating(false);
    }
  };

  const updateDailySchedule = (day: keyof NonNullable<ClinicSettings['dailySchedule']>, field: keyof DaySchedule, value: string | boolean) => {
    setFormData((prev) => {
      const currentSchedule = prev.dailySchedule || {
        monday: { open: '08:00', close: '21:00', isClosed: false },
        tuesday: { open: '08:00', close: '21:00', isClosed: false },
        wednesday: { open: '08:00', close: '21:00', isClosed: false },
        thursday: { open: '08:00', close: '21:00', isClosed: false },
        friday: { open: '08:00', close: '21:00', isClosed: false },
        saturday: { open: '08:00', close: '20:00', isClosed: false },
        sunday: { open: '09:00', close: '14:00', isClosed: false },
      };

      return {
        ...prev,
        dailySchedule: {
          ...currentSchedule,
          [day]: {
            ...currentSchedule[day],
            [field]: value,
          },
        },
      };
    });
  };

  const tabs = [
    { id: 'identity' as const, label: 'Clinic Identity', icon: Building },
    { id: 'contact' as const, label: 'Contact & Location', icon: Phone },
    { id: 'hours' as const, label: 'Opening Hours', icon: Clock },
    { id: 'social' as const, label: 'Social Profiles', icon: Share2 },
    { id: 'seo' as const, label: 'Website & SEO', icon: Globe },
    { id: 'header_footer' as const, label: 'Header & Footer', icon: Compass },
    { id: 'appointments' as const, label: 'Appointment Config', icon: Calendar },
    { id: 'security' as const, label: 'Security & Password', icon: KeyRound },
  ];

  const daysList: Array<{ key: keyof NonNullable<ClinicSettings['dailySchedule']>; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <AdminLayout
      title="Global Clinic Configuration"
      subtitle="Persist identity, contact, hours, SEO & public components"
      breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Settings' }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      }
    >
      <div className="max-w-6xl space-y-6">
        {/* Success & Error Global Banners */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs font-semibold shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Clinic configuration successfully updated and saved to database! Public website reflected.</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2.5 text-xs font-semibold shadow-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Tab Navigation Ribbon */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Settings Form Container */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* TAB 1: CLINIC IDENTITY */}
          {activeTab === 'identity' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>1. Clinic Identity & Branding</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Establish the public name, tagline, branding colors, establishment details, and logo assets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinic Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Om Sai Adarsha Clinic"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tagline / Motto <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Compassionate Care, Advanced Medical Excellence"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medical Director / Head Physician
                  </label>
                  <input
                    type="text"
                    value={formData.directorName || ''}
                    onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Dr. Suresh Kumar M.D."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medical Registration / License Number
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="e.g. REG/MED/KA/2012/9941"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={formData.establishedYear || 2012}
                    onChange={(e) => setFormData({ ...formData, establishedYear: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="e.g. 2012"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.brandPrimaryColor || '#059669'}
                      onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                      className="w-9 h-9 p-1 border border-slate-300 rounded-lg cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.brandPrimaryColor || '#059669'}
                      onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="#059669"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Main Brand Logo (Optional - leave empty for Stethoscope badge)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget('logo');
                        setIsMediaPickerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Choose from Media Library</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formData.mainLogoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, mainLogoUrl: e.target.value })}
                      className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="https://example.com/logo.png or /uploads/..."
                    />
                    {formData.mainLogoUrl && (
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={formData.mainLogoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinic Description / About Brief <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.aboutBrief}
                    onChange={(e) => setFormData({ ...formData, aboutBrief: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Describe the medical clinic, primary domains of care, ethics, and diagnostic facilities."
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT INFORMATION */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>2. Contact Information & Location</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure primary patient reception phone, emergency desk, WhatsApp number, and physical address.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Phone (OPD / Reception) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.generalPhone}
                    onChange={(e) => setFormData({ ...formData, generalPhone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="+91 80 2345 6789"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Phone (24x7 Hotline) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Number (with country code)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="care@om-sai-adarsha.clinic"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="124, Temple Road, Near Sai Mandir"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Bengaluru"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Region <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Karnataka"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Postal Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, postalCode: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="560078"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.address.country || 'India'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, country: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="India"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Maps Embed URL
                  </label>
                  <input
                    type="text"
                    value={formData.mapsEmbedUrl || ''}
                    onChange={(e) => setFormData({ ...formData, mapsEmbedUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPENING HOURS */}
          {activeTab === 'hours' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>3. Opening Hours & OPD Schedules</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage weekly hours day-by-day (Monday to Sunday), holiday notices, and timezone.
                </p>
              </div>

              {/* Day-by-Day Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Weekly Schedule</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Day</th>
                        <th className="py-2.5 px-4">Opening Time</th>
                        <th className="py-2.5 px-4">Closing Time</th>
                        <th className="py-2.5 px-4">Closed Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {daysList.map(({ key, label }) => {
                        const sched = formData.dailySchedule?.[key] || {
                          open: '08:00',
                          close: '20:00',
                          isClosed: false,
                        };
                        return (
                          <tr key={key} className="hover:bg-slate-50/50">
                            <td className="py-2 px-4 font-semibold text-slate-800">{label}</td>
                            <td className="py-2 px-4">
                              <input
                                type="time"
                                value={sched.open}
                                disabled={sched.isClosed}
                                onChange={(e) => updateDailySchedule(key, 'open', e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded font-mono disabled:opacity-40"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="time"
                                value={sched.close}
                                disabled={sched.isClosed}
                                onChange={(e) => updateDailySchedule(key, 'close', e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded font-mono disabled:opacity-40"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={sched.isClosed}
                                  onChange={(e) => updateDailySchedule(key, 'isClosed', e.target.checked)}
                                  className="w-4 h-4 text-emerald-600 rounded"
                                />
                                <span className="text-slate-600">{sched.isClosed ? 'Closed' : 'Open'}</span>
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Summary Hours & Holiday Notice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weekdays Summary String
                  </label>
                  <input
                    type="text"
                    value={formData.workingHours.weekdays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHours: { ...formData.workingHours, weekdays: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="08:00 AM - 09:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.timezone || 'Asia/Kolkata'}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="Asia/Kolkata"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Holiday Notices & Announcements
                  </label>
                  <textarea
                    rows={2}
                    value={formData.holidayNotices || ''}
                    onChange={(e) => setFormData({ ...formData, holidayNotices: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Emergency department and 24x7 triage remain operational on all public holidays."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL PROFILES */}
          {activeTab === 'social' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Social Profiles</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure public links for clinic accounts. Only configured and valid links will be rendered on the website footer.
                </p>
              </div>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Page URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks.facebook || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="https://facebook.com/om-sai-adarsha-clinic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram Profile URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="https://instagram.com/om-sai-adarsha-clinic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Channel URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks.youtube || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, youtube: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="https://youtube.com/@om-sai-adarsha-clinic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Page URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="https://linkedin.com/company/om-sai-adarsha-clinic"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WEBSITE & SEO */}
          {activeTab === 'seo' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>5. Website & SEO Metadata</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure search engine metadata, OpenGraph cards, schema markup, and verification tags.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Production Canonical Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.productionUrl || 'https://om-sai-adarsha.clinic'}
                    onChange={(e) => setFormData({ ...formData, productionUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="https://om-sai-adarsha.clinic"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Om Sai Adarsha Clinic — Comprehensive Healthcare & Diagnostics"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Expert doctor consultations, automated pathology lab tests, and 24x7 emergency medical assistance in Bengaluru."
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Default Social Share Card Image (OpenGraph & Social Banners)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget('ogImage');
                        setIsMediaPickerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Choose from Media Library</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formData.defaultOgImage || ''}
                      onChange={(e) => setFormData({ ...formData, defaultOgImage: e.target.value })}
                      className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="https://example.com/social-share.jpg or /uploads/..."
                    />
                    {formData.defaultOgImage && (
                      <div className="w-16 h-10 rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={formData.defaultOgImage}
                          alt="OG Card Preview"
                          className="w-full h-full object-cover rounded"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Recommended size: 1200 x 630 px. Used when links to the clinic are shared on WhatsApp, Facebook, LinkedIn, etc.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Search Console Verification Token
                  </label>
                  <input
                    type="text"
                    value={formData.searchConsoleVerification || ''}
                    onChange={(e) => setFormData({ ...formData, searchConsoleVerification: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="e.g. google-site-verification-token"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Analytics Measurement ID
                  </label>
                  <input
                    type="text"
                    value={formData.analyticsId || ''}
                    onChange={(e) => setFormData({ ...formData, analyticsId: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HEADER AND FOOTER */}
          {activeTab === 'header_footer' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>6. Header & Footer Configuration</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure primary CTA button labels, announcement notice bar, and footer copyright text.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Header Appointment CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.appointmentCtaLabel || 'Book Appointment'}
                    onChange={(e) => setFormData({ ...formData, appointmentCtaLabel: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Book Appointment"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Floating WhatsApp CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappCtaLabel || 'WhatsApp Us'}
                    onChange={(e) => setFormData({ ...formData, whatsappCtaLabel: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="WhatsApp Us"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Top Announcement Notice (Shown in public top banner)
                  </label>
                  <input
                    type="text"
                    value={formData.announcementNotice || ''}
                    onChange={(e) => setFormData({ ...formData, announcementNotice: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Seasonal vaccination and preventive health checkup appointments are open for booking."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Footer Copyright Text
                  </label>
                  <input
                    type="text"
                    value={formData.footerCopyrightText || ''}
                    onChange={(e) => setFormData({ ...formData, footerCopyrightText: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="© 2026 Om Sai Adarsha Clinic. All rights reserved."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: APPOINTMENT CONFIGURATION */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>7. Appointment & WhatsApp Booking Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure WhatsApp routing number, message template placeholders, disclaimers, and consent notice.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp Destination Number
                    </label>
                    <input
                      type="text"
                      value={formData.appointmentWhatsAppNumber || formData.whatsappNumber || ''}
                      onChange={(e) => setFormData({ ...formData, appointmentWhatsAppNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Internal Notification Email for Enquiries
                    </label>
                    <input
                      type="email"
                      value={formData.enquiryNotificationEmail || ''}
                      onChange={(e) => setFormData({ ...formData, enquiryNotificationEmail: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="reception@om-sai-adarsha.clinic"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Message Template (Placeholders: <code className="bg-slate-100 px-1 py-0.5 rounded">{`{patientName}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{`{service}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{`{date}`}</code>)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.whatsappTemplate || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappTemplate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Hello Om Sai Adarsha Clinic, I would like to book a consultation for {patientName} for {service} on {date}."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Appointment Booking Disclaimer
                  </label>
                  <textarea
                    rows={2}
                    value={formData.appointmentDisclaimer || ''}
                    onChange={(e) => setFormData({ ...formData, appointmentDisclaimer: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Appointments booked online are subject to doctor emergency availability. Please arrive 15 minutes before your time slot."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Consent Text
                  </label>
                  <input
                    type="text"
                    value={formData.consentText || ''}
                    onChange={(e) => setFormData({ ...formData, consentText: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="I agree to the clinic privacy policy and consent to receiving appointment updates via SMS and WhatsApp."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY & PASSWORD ROTATION (Preserving Phase 4) */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>8. Security & Admin Password Rotation</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your administrative credential securely. Re-authenticates your active session and invalidates older sessions.
                </p>
              </div>

              {rotateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rotateSuccess}</span>
                </div>
              )}

              {rotateError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{rotateError}</span>
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Administrator Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Administrator Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRotatePassword}
                  disabled={isRotating}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isRotating ? 'Rotating Password...' : 'Rotate Administrator Password'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Row at Bottom */}
          {activeTab !== 'security' && (
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                All changes persist to database and revalidate public components automatically.
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Saving to Database...' : 'Save Settings'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        targetCategory={mediaPickerTarget === 'logo' ? 'logos' : 'social'}
        title={mediaPickerTarget === 'logo' ? 'Select Clinic Logo' : 'Select Social Share Image'}
        onSelect={(selected) => {
          if (mediaPickerTarget === 'logo') {
            setFormData((prev) => ({ ...prev, mainLogoUrl: selected.url }));
          } else {
            setFormData((prev) => ({ ...prev, defaultOgImage: selected.url }));
          }
          setIsMediaPickerOpen(false);
        }}
      />
    </AdminLayout>
  );
};
