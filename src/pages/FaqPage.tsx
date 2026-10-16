import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Calendar, Phone, Search } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const FaqPage: React.FC<{ onOpenBooking: () => void }> = ({ onOpenBooking }) => {
  const { faqs, settings } = useClinic();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { label: 'All FAQs', key: 'all' },
    { label: 'Appointments', key: 'appointments' },
    { label: 'General & Timings', key: 'general' },
    { label: 'Services & Lab', key: 'services' },
    { label: 'Insurance & Claims', key: 'insurance' },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesQuery =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-10 space-y-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Patient FAQs' }]} />

      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Patient Guidance & Common Queries
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Find clear answers regarding appointment scheduling, laboratory sample collection, insurance reimbursements, and clinic hours.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search questions (e.g., reports, hours, insurance)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search frequently asked questions"
          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="FAQ categories">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              selectedCategory === c.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Accessible Accordion List */}
      {filteredFaqs.length === 0 ? (
        <EmptyState
          title="No questions match your search"
          description={`No results found for "${searchQuery}". Please try alternative terms or contact our front desk.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="space-y-3" role="region" aria-label="Frequently Asked Questions Accordion">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-btn-${index}`;
            const panelId = `faq-panel-${index}`;

            return (
              <div
                key={faq.id || index}
                className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden transition-all shadow-2xs"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleAccordion(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleAccordion(index);
                      }
                    }}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base cursor-pointer hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className={`px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 ${
                    isOpen ? 'block' : 'hidden'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reception Assistance Box */}
      <div className="bg-emerald-50/80 rounded-2xl p-6 sm:p-8 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-slate-900 text-base">Have an unlisted query or special requirement?</h4>
          <p className="text-xs sm:text-sm text-slate-600">
            Our clinic desk is ready to answer questions about medical records, doctors, or reports.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${settings.generalPhone}`}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Phone className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Call Reception</span>
          </a>
          <Button variant="primary" size="sm" onClick={onOpenBooking}>
            Book Consultation
          </Button>
        </div>
      </div>
    </div>
  );
};
