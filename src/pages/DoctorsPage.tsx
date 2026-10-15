import React, { useState } from 'react';
import { Calendar, Clock, Award, Phone, Mail, Search, ArrowRight } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link } from '../routes/RouterContext';
import { formatINR } from '../lib/utils';

export const DoctorsPage: React.FC<{ onOpenBooking: (doctorId?: string) => void }> = ({ onOpenBooking }) => {
  const { doctors } = useClinic();
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const departments = ['All', ...new Set(doctors.map((d) => d.department))];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = selectedDept === 'All' || doc.department === selectedDept;
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Medical Faculty & Specialists
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Experienced Doctors You Can Trust
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Meet our distinguished clinical consultants committed to precise diagnosis and patient-centered healing.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedDept === dept
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-64 overflow-hidden relative bg-slate-100">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 text-[11px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 px-2.5 py-1 rounded-md shadow-xs">
                  {doc.experienceYears}+ Years Clinical Practice
                </span>
                <span className="absolute bottom-3 left-3 text-[11px] font-semibold bg-emerald-800/90 text-white px-2.5 py-1 rounded-md">
                  {doc.department}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600">{doc.specialty}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {doc.bio}
                </p>

                {/* Available Days */}
                <div className="pt-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Days: </span>
                  <span>{doc.availableDays.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-3">
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <span className="text-slate-500">Consultation Fee</span>
                <span className="font-bold text-slate-900 text-sm">{formatINR(doc.consultationFee)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/doctors/${doc.slug}`}
                  className="text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Full Bio
                </Link>
                <button
                  onClick={() => onOpenBooking(doc.id)}
                  className="text-center py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  Book Slot
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
