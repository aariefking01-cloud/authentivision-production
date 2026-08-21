export type Verdict =
  | 'AUTHENTIC'
  | 'DEEPFAKE'
  | 'FACE MORPHED'
  | 'FACE MORP'
  | 'MANIPULATED / SYNTHETIC'
  | 'MANIPULATED'
  | 'INSUFFICIENT EVIDENCE'
  | 'SUSPICIOUS'
  | 'INCONCLUSIVE'
  | 'authentic'
  | 'deepfake'
  | 'morph'
  | 'face-morph'
  | 'morphed'
  | 'suspicious'
  | 'inconclusive'
  | 'LIKELY_AUTHENTIC'
  | 'LIKELY_AI_GENERATED'
  | 'LIKELY_DEEPFAKE'
  | 'LIKELY_MANIPULATED'
  | 'LIKELY_MORPHED';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type MediaType = 'video' | 'image';
export type AnalysisStatus = 'queued' | 'processing' | 'complete' | 'failed';
export type CaseStatus = 'open' | 'investigating' | 'review' | 'closed' | 'archived';
export type IntegrityStatus = 'verified' | 'warning' | 'changed' | 'unknown';
export type SystemStatus = 'operational' | 'processing' | 'degraded' | 'offline';

export interface Analysis {
  id: string;
  caseId: string;
  filename: string;
  mediaType: MediaType;
  verdict: Verdict;
  confidence: number;
  risk: RiskLevel;
  analyzedAt: string;
  status: AnalysisStatus;
  duration?: number;
  analyst?: string;
}

export interface Case {
  id: string;
  name: string;
  description: string;
  investigator: string;
  createdAt: string;
  updatedAt: string;
  priority: RiskLevel;
  status: CaseStatus;
  evidenceCount: number;
  analysisCount: number;
  findings: string;
}

export interface Evidence {
  id: string;
  filename: string;
  hash: string;
  mediaType: MediaType;
  size: string;
  addedAt: string;
  integrity: IntegrityStatus;
  caseId: string;
  status: 'active' | 'archived';
  sha256: string;
}

export interface SystemComponent {
  name: string;
  status: SystemStatus;
  latency?: string;
  load?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}
