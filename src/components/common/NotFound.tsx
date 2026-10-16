import React from 'react';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { Link } from '../../routes/RouterContext';
import { Button } from './Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
        <Stethoscope className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
          404 Error
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Page Not Found</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          The clinic page you are looking for does not exist or may have been relocated.
        </p>
      </div>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Clinic Homepage</span>
        </Link>
      </div>
    </div>
  );
};
