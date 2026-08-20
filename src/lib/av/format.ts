import type { RiskLevel, Verdict } from "./types";

export function normalizeVerdict(v: string): 'AUTHENTIC' | 'DEEPFAKE' | 'FACE MORPHED' | 'SUSPICIOUS' | 'INCONCLUSIVE' {
  const norm = (v || '').toUpperCase();
  if (norm.includes('AUTHENTIC')) return 'AUTHENTIC';
  if (norm.includes('MORPH') || norm.includes('MORP')) return 'FACE MORPHED';
  if (norm.includes('DEEPFAKE') || norm.includes('AI_GENERATED') || norm.includes('SYNTHETIC')) return 'DEEPFAKE';
  if (norm.includes('MANIPULATED') || norm.includes('SUSPICIOUS')) return 'FACE MORPHED';
  if (norm.includes('INCONCLUSIVE')) return 'INCONCLUSIVE';
  return 'INCONCLUSIVE';
}

export function getVerdictTextColor(v: string): string {
  const verdict = normalizeVerdict(v);
  switch (verdict) {
    case 'AUTHENTIC': return 'text-emerald-400';
    case 'DEEPFAKE': return 'text-red-500';
    case 'FACE MORPHED': return 'text-amber-400';
    case 'SUSPICIOUS': return 'text-purple-400';
    case 'INCONCLUSIVE': return 'text-slate-400';
  }
}

export const VERDICT_LABEL: Record<string, string> = {
  authentic: "AUTHENTIC",
  deepfake: "DEEPFAKE",
  morph: "FACE MORPHED",
  "face-morph": "FACE MORPHED",
  morphed: "FACE MORPHED",
  suspicious: "FACE MORPHED",
  inconclusive: "INCONCLUSIVE",
  LIKELY_AUTHENTIC: "AUTHENTIC",
  LIKELY_AI_GENERATED: "DEEPFAKE",
  LIKELY_DEEPFAKE: "DEEPFAKE",
  LIKELY_MANIPULATED: "FACE MORPHED",
  LIKELY_MORPHED: "FACE MORPHED",
  INCONCLUSIVE: "INCONCLUSIVE",
  AUTHENTIC: "AUTHENTIC",
  DEEPFAKE: "DEEPFAKE",
  "FACE MORPHED": "FACE MORPHED",
  "FACE MORP": "FACE MORPHED",
  SUSPICIOUS: "FACE MORPHED",
};

export const VERDICT_SHORT: Record<string, string> = {
  authentic: "AUTHENTIC",
  deepfake: "DEEPFAKE",
  morph: "FACE MORPHED",
  "face-morph": "FACE MORPHED",
  morphed: "FACE MORPHED",
  suspicious: "FACE MORPHED",
  inconclusive: "INCONCLUSIVE",
  LIKELY_AUTHENTIC: "AUTHENTIC",
  LIKELY_AI_GENERATED: "DEEPFAKE",
  LIKELY_DEEPFAKE: "DEEPFAKE",
  LIKELY_MANIPULATED: "FACE MORPHED",
  LIKELY_MORPHED: "FACE MORPHED",
  INCONCLUSIVE: "INCONCLUSIVE",
  AUTHENTIC: "AUTHENTIC",
  DEEPFAKE: "DEEPFAKE",
  "FACE MORPHED": "FACE MORPHED",
  "FACE MORP": "FACE MORPHED",
  SUSPICIOUS: "FACE MORPHED",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function formatDate(iso: string) {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatBytes(mb: number) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

export function compactNumber(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
