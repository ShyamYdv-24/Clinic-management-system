import React, { useState } from 'react';
import { Camera, Eye, Filter } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const GalleryPage: React.FC = () => {
  const { gallery } = useClinic();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const categories = [
    { label: 'All Photos', key: 'all' },
    { label: 'Facilities & Rooms', key: 'facilities' },
    { label: 'Diagnostics & Lab', key: 'laboratories' },
    { label: 'Consultation Suites', key: 'consultation' },
    { label: 'Medical Equipment', key: 'equipment' },
    { label: 'Health Camps & Events', key: 'events' },
  ];

  const filteredGallery = gallery.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Virtual Tour & Facilities
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Modern Infrastructure & Patient Spaces
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Take a look inside our clean, well-equipped consultation rooms, digital diagnostic laboratories, and patient lounges.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeCategory === c.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGallery.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveImage(item.imageUrl)}
            className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all cursor-pointer aspect-4/3"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
              <span className="text-[11px] uppercase font-bold text-emerald-300 tracking-wider">
                {item.category}
              </span>
              <h3 className="font-bold text-sm sm:text-base mt-1 leading-snug">{item.title}</h3>
              {item.description && <p className="text-xs text-slate-300 mt-1 line-clamp-2">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={activeImage} alt="Enlarged facility view" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
