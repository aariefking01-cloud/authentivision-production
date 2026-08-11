export type Verdict = "authentic" | "deepfake" | "morph" | "suspicious" | "inconclusive";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type MediaKind = "video" | "image";
export type AnalysisStatus = "queued" | "processing" | "complete" | "failed";
export type Integrity = "verified" | "warning" | "changed" | "unknown";
export type CaseStatus = "open" | "investigating" | "review" | "closed" | "archived";
export type ServiceStatus = "operational" | "processing" | "degraded" | "offline";

export interface AnalysisRecord {
  id: string;
  caseId: string;
  filename: string;
  kind: MediaKind;
  verdict: Verdict;
  confidence: number;
  risk: RiskLevel;
  analyzedAt: string;
  status: AnalysisStatus;
  analyst: string;
  durationSec?: number | undefined;
  resolution: string;
  fps?: number | undefined;
  sizeMb: number;
  codec?: string | undefined;
  sha256: string;
  frames?: number | undefined;
  audio?: boolean | undefined;
  model: string;
  signals: DetectionSignal[];
  timeline: TimelineMarker[];
}

export interface DetectionSignal {
  id: string;
  label: string;
  severity: RiskLevel;
  contribution: number;
  summary: string;
  detail: string;
}

export interface TimelineMarker {
  t: number;
  type: "face" | "temporal" | "compression" | "identity";
  score: number;
  frame: number;
}

export interface CaseRecord {
  id: string;
  name: string;
  description: string;
  investigator: string;
  createdAt: string;
  updatedAt: string;
  priority: "low" | "medium" | "high" | "critical";
  status: CaseStatus;
  evidenceCount: number;
  findings: string[];
}

export interface EvidenceRecord {
  id: string;
  filename: string;
  kind: MediaKind;
  sha256: string;
  sha1: string;
  md5: string;
  sizeMb: number;
  addedAt: string;
  integrity: Integrity;
  caseId: string;
  status: "sealed" | "in-analysis" | "released";
}

export interface ReportRecord {
  id: string;
  title: string;
  caseId: string;
  analysisId: string;
  createdAt: string;
  author: string;
  verdict: Verdict;
  confidence: number;
  format: "PDF" | "JSON" | "CSV";
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  resource: string;
  device: string;
  result: "success" | "warning" | "denied";
}

export interface SystemService {
  name: string;
  status: ServiceStatus;
  detail: string;
  load: number;
}

export interface AnalysisConfig {
  mode: "auto" | "deepfake" | "morph" | "both";
  depth: "fast" | "balanced" | "deep";
  sampling: "10" | "15" | "30" | "adaptive";
  faceDetection: boolean;
  audioAnalysis: boolean;
  metadataAnalysis: boolean;
  explainable: boolean;
}