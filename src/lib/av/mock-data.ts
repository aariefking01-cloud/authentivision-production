import type {
  ActivityEvent,
  AnalysisRecord,
  CaseRecord,
  DetectionSignal,
  EvidenceRecord,
  ReportRecord,
  SystemService,
  TimelineMarker,
} from "./types";

/** Deterministic PRNG so SSR and client render identical demo data. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const BASE = Date.UTC(2026, 7, 10, 12, 0, 0);

function hex(seed: number, len: number) {
  const r = rng(seed);
  let out = "";
  while (out.length < len) out += Math.floor(r() * 16).toString(16);
  return out.slice(0, len);
}

const SIGNAL_POOL: Omit<DetectionSignal, "contribution">[] = [
  {
    id: "facial-boundary",
    label: "Facial boundary inconsistencies",
    severity: "critical",
    summary: "Blending seams detected along the jaw and hairline.",
    detail:
      "Edge-gradient statistics across the face boundary deviate from the surrounding frame by 3.8σ, a pattern consistent with warped face swapping followed by Poisson blending.",
  },
  {
    id: "temporal",
    label: "Temporal frame instability",
    severity: "high",
    summary: "Identity embedding drifts between consecutive frames.",
    detail:
      "Frame-to-frame embedding distance oscillates with a period of ~4 frames, indicating per-frame synthesis without temporal conditioning.",
  },
  {
    id: "eye-region",
    label: "Unnatural eye-region artifacts",
    severity: "high",
    summary: "Specular highlights are inconsistent between both eyes.",
    detail:
      "Corneal reflections do not agree on light-source position; blink cadence falls outside the expected 12–20 blinks/min range.",
  },
  {
    id: "compression",
    label: "Compression inconsistencies",
    severity: "medium",
    summary: "Localised double-quantisation inside the facial region.",
    detail:
      "DCT coefficient histograms in the facial macroblocks show a secondary quantisation peak absent from the background.",
  },
  {
    id: "lighting",
    label: "Lighting mismatch",
    severity: "medium",
    summary: "Face shading direction conflicts with scene illumination.",
    detail:
      "Estimated spherical-harmonic lighting for the face differs by 41° in azimuth from the reconstructed scene lighting.",
  },
  {
    id: "identity",
    label: "Identity embedding anomaly",
    severity: "critical",
    summary: "Embedding sits between two distinct identity clusters.",
    detail:
      "Cosine distance to the nearest reference identity is 0.42 while a secondary identity sits at 0.47 — a signature typical of morphing.",
  },
];

export function signalsFor(seed: number, count = 5): DetectionSignal[] {
  const r = rng(seed + 77);
  return SIGNAL_POOL.slice(0, count).map((s) => ({
    ...s,
    contribution: Math.round((8 + r() * 24) * 10) / 10,
  }));
}

function timelineFor(seed: number, duration: number): TimelineMarker[] {
  const r = rng(seed + 13);
  const types: TimelineMarker["type"][] = ["face", "temporal", "compression", "identity"];
  return Array.from({ length: 14 }, (_, i) => {
    const t = Math.round(r() * duration * 10) / 10;
    return {
      t,
      type: types[Math.floor(r() * types.length)]!,
      score: Math.round((0.35 + r() * 0.6) * 100) / 100,
      frame: Math.round(t * 30) + i,
    };
  }).sort((a, b) => a.t - b.t);
}

const FILES: Array<[string, AnalysisRecord["kind"]]> = [
  ["interview_clip.mp4", "video"],
  ["press_statement_raw.mov", "video"],
  ["passport_scan_A417.jpg", "image"],
  ["cctv_lobby_0142.mkv", "video"],
  ["candidate_portrait.png", "image"],
  ["field_report_segment.mp4", "video"],
  ["id_photo_submission.jpeg", "image"],
  ["conference_keynote.mp4", "video"],
  ["witness_statement.mov", "video"],
  ["visa_application_photo.webp", "image"],
  ["broadcast_excerpt.avi", "video"],
  ["social_repost_clip.mp4", "video"],
];

const VERDICTS: AnalysisRecord["verdict"][] = [
  "deepfake",
  "authentic",
  "morph",
  "suspicious",
  "authentic",
  "authentic",
  "morph",
  "authentic",
  "inconclusive",
  "morph",
  "suspicious",
  "deepfake",
];

const ANALYSTS = ["R. Nayar", "K. Osei", "M. Lindqvist", "A. Serrano", "T. Whitfield"];

function riskFor(verdict: AnalysisRecord["verdict"], confidence: number): AnalysisRecord["risk"] {
  if (verdict === "authentic") return "low";
  if (verdict === "inconclusive") return "medium";
  if (confidence > 94) return "critical";
  if (confidence > 85) return "high";
  return "medium";
}

export const ANALYSES: AnalysisRecord[] = FILES.map(([filename, kind], i) => {
  const r = rng(i * 991 + 7);
  const verdict = VERDICTS[i]!;
  const confidence = Math.round((verdict === "inconclusive" ? 52 + r() * 12 : 78 + r() * 21) * 10) / 10;
  const duration = kind === "video" ? Math.round(28 + r() * 400) : undefined;
  return {
    id: `AV-2026-${(481 - i * 7).toString().padStart(5, "0")}`,
    caseId: `CASE-${104 - (i % 6)}`,
    filename,
    kind,
    verdict,
    confidence,
    risk: riskFor(verdict, confidence),
    analyzedAt: new Date(BASE - i * 1000 * 60 * (11 + i * 9)).toISOString(),
    status: i === 3 ? "processing" : i === 9 ? "failed" : "complete",
    analyst: ANALYSTS[i % ANALYSTS.length]!,
    durationSec: duration,
    resolution: kind === "video" ? (i % 2 ? "1920×1080" : "3840×2160") : "1200×1600",
    fps: kind === "video" ? (i % 2 ? 30 : 25) : undefined,
    sizeMb: Math.round((kind === "video" ? 40 + r() * 900 : 1 + r() * 12) * 10) / 10,
    codec: kind === "video" ? (i % 2 ? "H.264 / AVC" : "HEVC") : undefined,
    sha256: hex(i * 31 + 5, 64),
    frames: duration ? duration * 30 : undefined,
    audio: kind === "video" ? i % 3 !== 0 : undefined,
    model: "AV-Fusion v2.4.1",
    signals: signalsFor(i, verdict === "authentic" ? 3 : 6),
    timeline: timelineFor(i, duration ?? 10),
  };
});

export const CASES: CaseRecord[] = [
  {
    id: "CASE-104",
    name: "Election broadcast integrity review",
    description:
      "Verification of circulating video statements attributed to a public official ahead of a regional election.",
    investigator: "R. Nayar",
    createdAt: new Date(BASE - 86400000 * 3).toISOString(),
    updatedAt: new Date(BASE - 3600000 * 2).toISOString(),
    priority: "critical",
    status: "investigating",
    evidenceCount: 14,
    findings: [
      "Two of fourteen exhibits classified as deepfake with ≥94% confidence.",
      "Consistent blending signature suggests a single generation pipeline.",
    ],
  },
  {
    id: "CASE-103",
    name: "Border document morph screening",
    description: "Batch screening of submitted identity photographs for face-morphing artefacts.",
    investigator: "K. Osei",
    createdAt: new Date(BASE - 86400000 * 8).toISOString(),
    updatedAt: new Date(BASE - 86400000).toISOString(),
    priority: "high",
    status: "review",
    evidenceCount: 62,
    findings: ["Three submissions exceed the morph-probability threshold of 0.85."],
  },
  {
    id: "CASE-102",
    name: "Corporate impersonation incident",
    description: "Suspected synthetic voice-and-face impersonation used in a payment fraud attempt.",
    investigator: "M. Lindqvist",
    createdAt: new Date(BASE - 86400000 * 15).toISOString(),
    updatedAt: new Date(BASE - 86400000 * 4).toISOString(),
    priority: "high",
    status: "open",
    evidenceCount: 6,
    findings: [],
  },
  {
    id: "CASE-101",
    name: "Archive re-verification programme",
    description: "Retrospective authenticity verification of archived newsroom footage.",
    investigator: "A. Serrano",
    createdAt: new Date(BASE - 86400000 * 42).toISOString(),
    updatedAt: new Date(BASE - 86400000 * 11).toISOString(),
    priority: "medium",
    status: "closed",
    evidenceCount: 128,
    findings: ["No manipulation detected across 128 exhibits."],
  },
  {
    id: "CASE-100",
    name: "Research dataset benchmark",
    description: "Controlled benchmark run against a labelled academic deepfake dataset.",
    investigator: "T. Whitfield",
    createdAt: new Date(BASE - 86400000 * 60).toISOString(),
    updatedAt: new Date(BASE - 86400000 * 30).toISOString(),
    priority: "low",
    status: "archived",
    evidenceCount: 400,
    findings: ["Benchmark accuracy recorded for model comparison."],
  },
  {
    id: "CASE-99",
    name: "Journalistic source verification",
    description: "Verification of user-submitted footage prior to publication.",
    investigator: "R. Nayar",
    createdAt: new Date(BASE - 86400000 * 21).toISOString(),
    updatedAt: new Date(BASE - 86400000 * 6).toISOString(),
    priority: "medium",
    status: "investigating",
    evidenceCount: 9,
    findings: ["One exhibit shows compression inconsistencies pending review."],
  },
];

export const EVIDENCE: EvidenceRecord[] = ANALYSES.map((a, i) => ({
  id: `EV-${(9040 + i * 3).toString()}`,
  filename: a.filename,
  kind: a.kind,
  sha256: a.sha256,
  sha1: hex(i * 17 + 3, 40),
  md5: hex(i * 23 + 11, 32),
  sizeMb: a.sizeMb,
  addedAt: a.analyzedAt,
  integrity: i === 5 ? "warning" : i === 8 ? "unknown" : "verified",
  caseId: a.caseId,
  status: i % 4 === 0 ? "in-analysis" : "sealed",
}));

export const REPORTS: ReportRecord[] = ANALYSES.slice(0, 6).map((a, i) => ({
  id: `RPT-2026-${(220 - i).toString()}`,
  title: `Forensic assessment — ${a.filename}`,
  caseId: a.caseId,
  analysisId: a.id,
  createdAt: new Date(new Date(a.analyzedAt).getTime() + 900000).toISOString(),
  author: a.analyst,
  verdict: a.verdict,
  confidence: a.confidence,
  format: (["PDF", "JSON", "CSV"] as const)[i % 3]!,
}));

export const ACTIVITY: ActivityEvent[] = [
  ["Analysis completed", "AV-2026-00481", "success"],
  ["High-risk media flagged", "AV-2026-00481", "warning"],
  ["Report generated", "RPT-2026-220", "success"],
  ["Evidence accessed", "EV-9040", "success"],
  ["Evidence integrity check", "EV-9055", "warning"],
  ["Analysis started", "AV-2026-00460", "success"],
  ["Case modified", "CASE-104", "success"],
  ["Settings changed", "Model preferences", "success"],
  ["Evidence export", "EV-9061", "denied"],
  ["Login", "console.authentivision.io", "success"],
].map(([action, resource, result], i) => ({
  id: `LOG-${5000 + i}`,
  at: new Date(BASE - i * 1000 * 60 * 17).toISOString(),
  actor: ANALYSTS[i % ANALYSTS.length]!,
  action: action as string,
  resource: resource as string,
  device: `10.44.${8 + i}.${21 + i} · Workstation`,
  result: result as ActivityEvent["result"],
}));

export const SERVICES: SystemService[] = [
  { name: "Detection Engine", status: "operational", detail: "AV-Fusion v2.4.1", load: 42 },
  { name: "Face Analysis Engine", status: "operational", detail: "RetinaNet + ArcFace", load: 58 },
  { name: "Frame Processor", status: "processing", detail: "3 jobs in queue", load: 81 },
  { name: "AI Model Registry", status: "operational", detail: "4 models loaded", load: 22 },
  { name: "Evidence Storage", status: "degraded", detail: "Replication lag 42 s", load: 74 },
  { name: "Public API", status: "operational", detail: "p95 128 ms", load: 31 },
];

export const KPIS = {
  total: 12842,
  authentic: 8921,
  suspicious: 2731,
  deepfake: 1190,
  morph: 604,
  avgConfidence: 94.2,
};

export type Range = "24H" | "7D" | "30D" | "90D" | "1Y";

export function activitySeries(range: Range) {
  const points = range === "24H" ? 24 : range === "7D" ? 7 : range === "30D" ? 30 : range === "90D" ? 18 : 12;
  const r = rng(points * 31 + 5);
  return Array.from({ length: points }, (_, i) => {
    const label =
      range === "24H"
        ? `${i.toString().padStart(2, "0")}:00`
        : range === "1Y"
          ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]!
          : `D${i + 1}`;
    return {
      label,
      authentic: Math.round(60 + r() * 120),
      suspicious: Math.round(18 + r() * 46),
      deepfake: Math.round(6 + r() * 30),
      morph: Math.round(2 + r() * 18),
    };
  });
}

export const RISK_LANDSCAPE = [
  { level: "Low", value: 6412, tone: "success" as const },
  { level: "Medium", value: 2731, tone: "warning" as const },
  { level: "High", value: 1190, tone: "danger" as const },
  { level: "Critical", value: 509, tone: "critical" as const },
];

export const MODEL_METRICS = [
  { label: "Accuracy", value: "96.4%" },
  { label: "Precision", value: "95.1%" },
  { label: "Recall", value: "94.3%" },
  { label: "F1 Score", value: "94.7%" },
  { label: "AUC", value: "0.982" },
  { label: "False Positive Rate", value: "3.1%" },
  { label: "False Negative Rate", value: "5.7%" },
  { label: "Inference Time", value: "184 ms/frame" },
  { label: "Model Version", value: "AV-Fusion v2.4.1" },
  { label: "Dataset Version", value: "AV-Bench 2026.1" },
];

export const PIPELINE_STAGES = [
  { id: "01", name: "Media Ingestion", detail: "Container parsing and stream demux" },
  { id: "02", name: "Metadata Extraction", detail: "EXIF, container and encoder history" },
  { id: "03", name: "Frame Sampling", detail: "Adaptive keyframe selection" },
  { id: "04", name: "Face Detection", detail: "Detection, tracking and alignment" },
  { id: "05", name: "Artifact Analysis", detail: "Spatial and frequency-domain residuals" },
  { id: "06", name: "Temporal Analysis", detail: "Cross-frame identity stability" },
  { id: "07", name: "Model Inference", detail: "Ensemble forward pass" },
  { id: "08", name: "Confidence Calibration", detail: "Temperature scaling and thresholds" },
  { id: "09", name: "Forensic Report", detail: "Evidence assembly and hashing" },
];