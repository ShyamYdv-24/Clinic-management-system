import React, { useState } from 'react';
import { ArrowRight, Check, Activity, Search } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link } from '../routes/RouterContext';
import { formatINR } from '../lib/utils';

export const ServicesPage: React.FC<{ onOpenBooking: (doctorId?: string, serviceTitle?: string) => void }> = ({
  onOpenBooking,
}) => {
  const { services } = useClinic();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...new Set(services.map((s) => s.category))];

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesQuery =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Comprehensive Medical Specialties
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Clinical Treatments & Diagnostic Care
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          From preventative outpatient examinations to state-of-the-art pathology and urgent minor surgical care.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search service or dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 text-[11px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 px-2.5 py-1 rounded-md shadow-xs">
                  {service.department}
                </span>
              </div>

              <div className="p-6">
                <div className="text-xs font-semibold text-emerald-600 mb-1">{service.category}</div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {service.summary}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 mb-1">Key Inclusions:</div>
                  {service.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-3">
                <span className="text-xs text-slate-500">Starting from</span>
                <span className="text-sm font-bold text-slate-900">
                  {service.priceStartingAt ? formatINR(service.priceStartingAt) : 'Inquire'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/services/${service.slug}`}
                  className="text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Learn More
                </Link>
                <button
                  onClick={() => onOpenBooking(undefined, service.title)}
                  className="text-center py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  Book Service
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
