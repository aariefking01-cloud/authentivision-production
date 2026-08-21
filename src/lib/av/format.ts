import type { RiskLevel, Verdict } from './types';

export type NormalizedVerdict =
  | 'AUTHENTIC'
  | 'FACE MORPHED'
  | 'DEEPFAKE'
  | 'MANIPULATED / SYNTHETIC'
  | 'INSUFFICIENT EVIDENCE';

export function normalizeVerdict(v: string): NormalizedVerdict {
  const norm = (v || '').toUpperCase();
  if (norm.includes('INSUFFICIENT') || norm.includes('INCONCLUSIVE')) return 'INSUFFICIENT EVIDENCE';
  if (norm.includes('MORPH') || norm.includes('MORP') || norm.includes('BLEND') || norm.includes('FUSION')) return 'FACE MORPHED';
  if (norm.includes('DEEPFAKE') || norm.includes('SWAP') || norm.includes('SYNTHETIC') || norm.includes('AI') || norm.includes('MANIPULATED') || norm.includes('GENERATED')) return 'DEEPFAKE';
  if (norm.includes('AUTHENTIC')) return 'AUTHENTIC';
  return 'INSUFFICIENT EVIDENCE';
}

export function getVerdictTextColor(v: string): string {
  const verdict = normalizeVerdict(v);
  switch (verdict) {
    case 'AUTHENTIC':
      return 'text-emerald-400';
    case 'FACE MORPHED':
      return 'text-amber-400';
    case 'DEEPFAKE':
    case 'MANIPULATED / SYNTHETIC':
      return 'text-red-400';
    case 'INSUFFICIENT EVIDENCE':
      return 'text-slate-400';
  }
}

export function getVerdictBgColor(v: string): string {
  const verdict = normalizeVerdict(v);
  switch (verdict) {
    case 'AUTHENTIC':
      return 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300';
    case 'FACE MORPHED':
      return 'bg-amber-400/10 border-amber-400/30 text-amber-300';
    case 'DEEPFAKE':
    case 'MANIPULATED / SYNTHETIC':
      return 'bg-red-500/10 border-red-500/30 text-red-300';
    case 'INSUFFICIENT EVIDENCE':
      return 'bg-slate-500/10 border-slate-500/30 text-slate-300';
  }
}

export const VERDICT_LABEL: Record<string, string> = {
  AUTHENTIC: 'AUTHENTIC',
  'FACE MORPHED': 'FACE MORPHED',
  DEEPFAKE: 'DEEPFAKE',
  'MANIPULATED / SYNTHETIC': 'DEEPFAKE',
  'INSUFFICIENT EVIDENCE': 'INSUFFICIENT EVIDENCE',
  authentic: 'AUTHENTIC',
  deepfake: 'DEEPFAKE',
  morph: 'FACE MORPHED',
  'face-morph': 'FACE MORPHED',
  morphed: 'FACE MORPHED',
  suspicious: 'DEEPFAKE',
  inconclusive: 'INSUFFICIENT EVIDENCE',
  LIKELY_AUTHENTIC: 'AUTHENTIC',
  LIKELY_AI_GENERATED: 'DEEPFAKE',
  LIKELY_DEEPFAKE: 'DEEPFAKE',
  LIKELY_MANIPULATED: 'DEEPFAKE',
  LIKELY_MORPHED: 'FACE MORPHED',
  INCONCLUSIVE: 'INSUFFICIENT EVIDENCE',
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

export function pct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

export function shortHash(hash: string, size = 10) {
  return `${hash.slice(0, size)}…${hash.slice(-4)}`;
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function formatDate(iso: string) {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
