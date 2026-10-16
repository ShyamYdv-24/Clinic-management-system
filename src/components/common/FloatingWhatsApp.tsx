import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useClinic();

  const phone = settings.whatsappNumber || settings.generalPhone;
  if (!phone) return null;

  // Clean non-digit characters for WhatsApp API link
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const message = encodeURIComponent(
    `Hello Om Sai Adarsha Clinic, I would like to inquire about appointments and medical services.`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <aside
      aria-label="Direct WhatsApp Medical Assistance"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Om Sai Adarsha Clinic on WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-medium p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg shadow-emerald-950/20 transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="hidden sm:inline-block text-xs font-semibold tracking-wide">
          WhatsApp Us
        </span>
      </a>
      <span className="sr-only">Opens WhatsApp in a new tab</span>
    </aside>
  );
};
