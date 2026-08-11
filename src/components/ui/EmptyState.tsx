import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-slate-600 mb-5">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-slate-300 font-display mb-2">{title}</h3>
      <p className="text-[13px] text-slate-500 max-w-xs mb-6">{description}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
