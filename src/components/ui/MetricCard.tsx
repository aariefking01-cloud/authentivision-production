import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: ReactNode;
  trend?: { value: string; up: boolean };
}

export function MetricCard({ label, value, sub, accent = 'text-white', icon, trend }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[0.07] bg-[#0C1118] p-5 group hover:border-white/[0.12] transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500 font-display">{label}</p>
        {icon && <span className="text-slate-600 group-hover:text-slate-500 transition-colors">{icon}</span>}
      </div>
      <p className={`text-[28px] font-bold leading-none font-display ${accent}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-[11px] text-slate-500 mt-1.5">{sub}</p>}
      {trend && (
        <p className={`text-[11px] mt-2 font-medium ${trend.up ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend.up ? '↑' : '↓'} {trend.value} vs last period
        </p>
      )}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
