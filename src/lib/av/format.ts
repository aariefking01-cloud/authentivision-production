import type { RiskLevel, Verdict } from "./types";

export const VERDICT_LABEL: Record<Verdict, string> = {
  authentic: "Likely Authentic",
  deepfake: "Deepfake Detected",
  morph: "Face Morph Detected",
  suspicious: "Suspicious Manipulation",
  inconclusive: "Inconclusive",
};

export const VERDICT_SHORT: Record<Verdict, string> = {
  authentic: "Authentic",
  deepfake: "Deepfake",
  morph: "Face Morph",
  suspicious: "Suspicious",
  inconclusive: "Inconclusive",
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