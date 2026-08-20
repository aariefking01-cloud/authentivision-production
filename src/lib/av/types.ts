export type Verdict = "AUTHENTIC" | "DEEPFAKE" | "FACE MORPHED" | "FACE MORP" | "SUSPICIOUS" | "INCONCLUSIVE" | "authentic" | "deepfake" | "morph" | "face-morph" | "morphed" | "suspicious" | "inconclusive" | "LIKELY_AUTHENTIC" | "LIKELY_AI_GENERATED" | "LIKELY_DEEPFAKE" | "LIKELY_MANIPULATED" | "LIKELY_MORPHED" | "INCONCLUSIVE";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type MediaKind = "video" | "image";
export type AnalysisStatus = "queued" | "processing" | "complete" | "failed";
export type Integrity = "verified" | "warning" | "changed" | "unknown";
export type CaseStatus = "open" | "investigating" | "review" | "closed" | "archived";
export type ServiceStatus = "operational" | "processing" | "degraded" | "offline";

export interface HumanReviewRecord {
  reviewedBy: string;
  reviewedAt: string;
  decision: "confirmed" | "rejected" | "inconclusive";
  notes: string;
}

export interface SuspiciousRegion {
  description: string;
  x: number; // 0-100%
  y: number; // 0-100%
  width: number; // 0-100%
  height: number; // 0-100%
  signalType?: string;
  severity?: RiskLevel;
}

export interface ProvenanceRecord {
  c2paDetected: boolean;
  c2paValid: boolean;
  synthIdDetected: boolean;
  metadataAvailable: boolean;
  softwareUsed?: string;
  details?: string;
}

export interface ModelSignalsRecord {
  geminiAssessment?: string;
  specializedDetector?: {
    available: boolean;
    label: string;
    score: number;
  };
  externalDetector?: {
    available: boolean;
    provider?: string | null;
    score?: number | null;
  };
  provenanceCheck?: string;
}

export interface AgreementRecord {
  level: "HIGH" | "MODERATE" | "LOW" | "CONFLICTING";
  supportingSignals: number;
  conflictingSignals: number;
}

export interface ClassificationBreakdown {
  aiGenerated: number; // 0.0 - 1.0
  manipulated: number; // 0.0 - 1.0
  authentic: number; // 0.0 - 1.0
}

export interface AnalysisRecord {
  id: string;
  caseId: string;
  filename: string;
  kind: MediaKind;
  imageUrl?: string;
  videoPoster?: string;
  verdict: Verdict;
  confidence: number;
  uncertainty?: number;
  quality?: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
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
  modelDetails?: {
    modelId: string;
    version: string;
    framework: string;
    calibrationMethod: string;
    engineMode: string;
  };
  narrativeExplanation?: string;
  classification?: ClassificationBreakdown;
  suspiciousRegions?: SuspiciousRegion[];
  provenance?: ProvenanceRecord;
  modelSignals?: ModelSignalsRecord;
  agreement?: AgreementRecord;
  limitations?: string[];
  signals: DetectionSignal[];
  timeline: TimelineMarker[];
  humanReview?: HumanReviewRecord | undefined;
  feedback?: {
    correct: boolean;
    submittedAt: string;
    comments?: string;
  };
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
  analysisCount?: number;
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
  risk?: RiskLevel;
  generatedAt?: string;
  analyst?: string;
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
