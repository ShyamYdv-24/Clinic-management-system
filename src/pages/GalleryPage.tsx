import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Eye, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SEOHead } from '../components/common/SEOHead';

export const GalleryPage: React.FC = () => {
  const { gallery, settings } = useClinic();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const categories = [
    { label: 'All Photos', key: 'all' },
    { label: 'Facilities & Lounges', key: 'facilities' },
    { label: 'Diagnostics & Lab', key: 'laboratories' },
    { label: 'Consultation Suites', key: 'consultation' },
    { label: 'Diagnostic Equipment', key: 'equipment' },
    { label: 'Community Health Camps', key: 'events' },
  ];

  const filteredGallery = gallery.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleNext = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((prev) => ((prev! + 1) % filteredGallery.length));
  }, [activeIndex, filteredGallery.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((prev) => ((prev! - 1 + filteredGallery.length) % filteredGallery.length));
  }, [activeIndex, filteredGallery.length]);

  // Keyboard navigation for accessible lightbox
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handleNext, handlePrev]);

  const activeItem = activeIndex !== null ? filteredGallery[activeIndex] : null;

  return (
    <div className="py-10 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Clinic Infrastructure & Facilities Gallery"
        description={`Take a visual walkthrough of ${settings.clinicName}'s sterilized consultation chambers, digital pathology laboratory, and comfortable reception waiting spaces.`}
        canonicalPath="/gallery"
      />
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Clinic Gallery' }]} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Visual Tour & Infrastructure
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Modern Clinical Spaces & Laboratories
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Explore our sterile consultation rooms, digital diagnostic laboratories, and patient lounges designed for comfort and privacy.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Gallery category filters">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setActiveCategory(c.key);
              setActiveIndex(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeCategory === c.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGallery.map((item, index) => (
          <div
            key={item.id}
            tabIndex={0}
            role="button"
            aria-label={`View enlarged photo: ${item.title}`}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveIndex(index);
              }
            }}
            className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs hover:shadow-xl transition-all cursor-pointer aspect-4/3 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-500"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
              <span className="text-[11px] uppercase font-bold text-emerald-300 tracking-wider">
                {item.category}
              </span>
              <h3 className="font-bold text-sm sm:text-base mt-1 leading-snug">{item.title}</h3>
              {item.description && <p className="text-xs text-slate-300 mt-1 line-clamp-2">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged image lightbox"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          {/* Close button */}
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
            aria-label="Close Lightbox (Escape)"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
            aria-label="Previous Photo (Left Arrow)"
          >
            <ChevronLeft className="w-7 h-7" aria-hidden="true" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
            aria-label="Next Photo (Right Arrow)"
          >
            <ChevronRight className="w-7 h-7" aria-hidden="true" />
          </button>

          {/* Image & Caption */}
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={activeItem.imageUrl}
              alt={activeItem.title}
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white max-w-xl">
              <h3 className="font-bold text-base sm:text-lg">{activeItem.title}</h3>
              {activeItem.description && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1">{activeItem.description}</p>
              )}
              <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider mt-2">
                Photo {activeIndex! + 1} of {filteredGallery.length} • {activeItem.category}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
