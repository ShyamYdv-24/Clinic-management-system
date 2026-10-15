import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Calendar, Phone } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const FaqPage: React.FC<{ onOpenBooking: () => void }> = ({ onOpenBooking }) => {
  const { faqs, settings } = useClinic();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { label: 'All FAQs', key: 'all' },
    { label: 'Appointments', key: 'appointments' },
    { label: 'General & Timings', key: 'general' },
    { label: 'Services & Lab', key: 'services' },
    { label: 'Insurance & Claims', key: 'insurance' },
  ];

  const filteredFaqs = faqs.filter((f) => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  return (
    <div className="py-12 space-y-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Help & Information
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Everything you need to know about booking, consulting hours, laboratory tests, and insurance coverage.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === c.key
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{faq.question}</span>
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Need more help banner */}
      <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-slate-900 text-base">Still have questions?</h4>
          <p className="text-xs sm:text-sm text-slate-600">
            Our front desk is available to assist you with special requests and urgent triage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`tel:${settings.generalPhone}`}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Call Reception</span>
          </a>
          <button
            onClick={onOpenBooking}
            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
