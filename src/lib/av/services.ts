/**
 * Mock service layer.
 *
 * Every function here is a stand-in for a future backend call. Signatures are
 * intentionally async and promise-based so a real API client (or an on-device
 * model runner) can replace the implementations without touching the UI.
 */
import { ACTIVITY, ANALYSES, CASES, EVIDENCE, REPORTS, SERVICES } from "./mock-data";
import type {
  ActivityEvent,
  AnalysisConfig,
  AnalysisRecord,
  CaseRecord,
  EvidenceRecord,
  ReportRecord,
  SystemService,
} from "./types";

export const IS_DEMO = true;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface AnalyzeRequest {
  filename: string;
  sizeMb: number;
  kind: "video" | "image";
  config: AnalysisConfig;
}

/** Simulated submission. Returns the id of a demo analysis record. */
export async function analyzeMedia(req: AnalyzeRequest): Promise<{ analysisId: string }> {
  await delay(400);
  const match = ANALYSES.find((a) => a.kind === req.kind) ?? ANALYSES[0]!;
  return { analysisId: match.id };
}

export async function getAnalysisResult(id: string): Promise<AnalysisRecord | undefined> {
  await delay(120);
  return ANALYSES.find((a) => a.id === id);
}

export async function getAnalysisHistory(): Promise<AnalysisRecord[]> {
  await delay(120);
  return ANALYSES;
}

export async function getCase(id: string): Promise<CaseRecord | undefined> {
  await delay(120);
  return CASES.find((c) => c.id === id);
}

export async function getEvidence(id?: string): Promise<EvidenceRecord[]> {
  await delay(120);
  return id ? EVIDENCE.filter((e) => e.id === id) : EVIDENCE;
}

export async function generateReport(analysisId: string): Promise<ReportRecord | undefined> {
  await delay(600);
  return REPORTS.find((r) => r.analysisId === analysisId) ?? REPORTS[0];
}

export async function getSystemHealth(): Promise<SystemService[]> {
  await delay(80);
  return SERVICES;
}

export async function getActivity(): Promise<ActivityEvent[]> {
  await delay(80);
  return ACTIVITY;
}