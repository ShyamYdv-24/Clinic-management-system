import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';

export const ContactPage: React.FC = () => {
  const { settings } = useClinic();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError('Please fill in your name, email, and message.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const cleanPhone = (settings.whatsappNumber || settings.generalPhone || '').replace(/[^\d]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Om Sai Adarsha Clinic, I am writing to inquire about clinical consultations and diagnostic services.'
  )}`;

  return (
    <div className="py-10 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Contact Us & Location' }]} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Reach Our Clinic
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Location, Contact & Inquiries
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Centrally situated in Bengaluru with accessible wheelchair ramps, dedicated customer parking, and 24x7 emergency response desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold">Om Sai Adarsha Clinic</h2>

            <div className="space-y-5 text-sm text-emerald-100">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-white">Physical Address</p>
                  <address className="not-italic text-xs text-emerald-200 mt-0.5 leading-relaxed">
                    {settings.address.street}
                    {settings.address.landmark && `, ${settings.address.landmark}`}
                    <br />
                    {settings.address.city}, {settings.address.state} - {settings.address.postalCode}
                  </address>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-white">Direct Telephone Lines</p>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Reception Desk:{' '}
                    <a href={`tel:${settings.generalPhone}`} className="text-white hover:underline font-medium">
                      {settings.generalPhone}
                    </a>
                  </p>
                  <p className="text-xs text-emerald-300 font-bold mt-1">
                    Emergency Triage 24x7:{' '}
                    <a href={`tel:${settings.emergencyPhone}`} className="text-emerald-300 hover:underline">
                      {settings.emergencyPhone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-white">Official Email</p>
                  <a href={`mailto:${settings.email}`} className="text-xs text-emerald-200 hover:underline">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-white">Consulting & OPD Hours</p>
                  <p className="text-xs text-emerald-200 mt-0.5">Mon – Fri: {settings.workingHours.weekdays}</p>
                  <p className="text-xs text-emerald-200">Saturday: {settings.workingHours.saturday}</p>
                  <p className="text-xs text-emerald-200">Sunday: {settings.workingHours.sunday}</p>
                  <p className="text-xs text-emerald-300 font-medium mt-1">First-Aid Stabilization: 24 Hours</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="pt-2 border-t border-emerald-800/80">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <MessageCircle className="w-4 h-4 fill-white" aria-hidden="true" />
                <span>Chat Instantly via WhatsApp ({settings.whatsappNumber || settings.generalPhone})</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Emergency Safety Notice */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <PhoneCall className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
              <span>For Immediate Emergency Care</span>
            </div>
            <p className="leading-relaxed">
              If you or a patient are experiencing acute symptoms (chest pain, severe breathlessness, head trauma), please do not wait for an email reply. Call our emergency response team immediately at <strong>{settings.emergencyPhone}</strong> or visit our 24x7 desk.
            </p>
          </div>
        </div>

        {/* Message Form & Map Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Inquiry Delivered Successfully</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{name}</strong>. Your message has been received by our administrative desk. We will respond to <strong>{email}</strong> shortly.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Send an Inquiry / General Question</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Have questions regarding specialist appointments, diagnostic test turnaround, or health check packages? Write to us.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Inquiry or Concern *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please specify your question, preferred specialist, or laboratory test requirement..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" aria-hidden="true" />}
                >
                  Send Inquiry Message
                </Button>
              </form>
            )}
          </div>

          {/* Interactive Google Maps Embed Location */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Google Maps Location & Driving Directions</span>
              </h3>
              <a
                href="https://maps.google.com/?q=Om+Sai+Adarsha+Clinic+Bengaluru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-16/9 bg-slate-100 border border-slate-200 shadow-inner">
              <iframe
                title="Om Sai Adarsha Clinic Location on Google Maps"
                src={settings.mapsEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.828557997931!2d77.583344!3d12.918732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae150bf443f14b%3A0x7d6a5e12f6e4a29a!2sJayanagar%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Easily accessible via Metro and public transit. Visitor parking spots available adjacent to the clinic entrance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
