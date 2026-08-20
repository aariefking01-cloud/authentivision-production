import type { Verdict, RiskLevel, AnalysisStatus, CaseStatus, IntegrityStatus, SystemStatus } from '../../types';
import { normalizeVerdict } from '../../lib/av/format';

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const norm = normalizeVerdict(verdict);
  const map: Record<string, { label: string; color: string }> = {
    AUTHENTIC: { label: 'AUTHENTIC', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 font-bold' },
    DEEPFAKE: { label: 'DEEPFAKE', color: 'text-red-400 bg-red-400/10 border-red-400/30 font-bold' },
    'FACE MORPHED': { label: 'FACE MORPHED', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30 font-bold' },
    'FACE MORP': { label: 'FACE MORPHED', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30 font-bold' },
    SUSPICIOUS: { label: 'FACE MORPHED', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30 font-bold' },
    INCONCLUSIVE: { label: 'INCONCLUSIVE', color: 'text-slate-400 bg-slate-400/10 border-slate-400/30 font-bold' },
  };
  const { label, color } = map[norm] || map.INCONCLUSIVE;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border font-mono tracking-wide ${color}`}>
      {label}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const map: Record<RiskLevel, { label: string; color: string }> = {
    low: { label: 'Low', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    medium: { label: 'Medium', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    high: { label: 'High', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
    critical: { label: 'Critical', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  };
  const { label, color } = map[risk] || map.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wider ${color}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: AnalysisStatus | CaseStatus }) {
  const map: Record<string, { label: string; color: string; dot: string }> = {
    complete: { label: 'Complete', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    processing: { label: 'Processing', color: 'text-cyan-400', dot: 'bg-cyan-400' },
    queued: { label: 'Queued', color: 'text-slate-400', dot: 'bg-slate-400' },
    failed: { label: 'Failed', color: 'text-red-400', dot: 'bg-red-400' },
    open: { label: 'Open', color: 'text-cyan-400', dot: 'bg-cyan-400' },
    investigating: { label: 'Investigating', color: 'text-violet-400', dot: 'bg-violet-400' },
    review: { label: 'Review', color: 'text-amber-400', dot: 'bg-amber-400' },
    closed: { label: 'Closed', color: 'text-slate-400', dot: 'bg-slate-400' },
    archived: { label: 'Archived', color: 'text-slate-500', dot: 'bg-slate-500' },
  };
  const s = map[status] ?? { label: status, color: 'text-slate-400', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
      {s.label}
    </span>
  );
}

export function IntegrityBadge({ integrity }: { integrity: IntegrityStatus }) {
  const map: Record<IntegrityStatus, { label: string; color: string }> = {
    verified: { label: 'Verified', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    warning: { label: 'Warning', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    changed: { label: 'Changed', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    unknown: { label: 'Unknown', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  };
  const { label, color } = map[integrity];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>
      {label}
    </span>
  );
}

export function SystemStatusBadge({ status }: { status: SystemStatus }) {
  const dotClass: Record<SystemStatus, string> = {
    operational: 'status-dot operational',
    processing: 'status-dot processing',
    degraded: 'status-dot warning',
    offline: 'status-dot offline',
  };
  const labelMap: Record<SystemStatus, string> = {
    operational: 'Operational',
    processing: 'Processing',
    degraded: 'Degraded',
    offline: 'Offline',
  };
  const textColor: Record<SystemStatus, string> = {
    operational: 'text-emerald-400',
    processing: 'text-cyan-400',
    degraded: 'text-amber-400',
    offline: 'text-slate-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${textColor[status]}`}>
      <span className={dotClass[status]} />
      {labelMap[status]}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 90 ? 'text-red-400' : confidence >= 70 ? 'text-amber-400' : 'text-slate-400';
  return (
    <span className={`font-mono text-[13px] font-semibold ${color}`}>
      {confidence.toFixed(1)}%
    </span>
  );
}
