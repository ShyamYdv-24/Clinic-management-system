import React from 'react';
import { SearchX, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200 max-w-lg mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
        {icon || <SearchX className="w-7 h-7" />}
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-800 text-base">{title}</h4>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onAction} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
