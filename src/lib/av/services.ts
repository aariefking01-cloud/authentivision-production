import {
  fetchAnalyses,
  fetchAnalysisById,
  fetchCases,
  fetchCaseById,
  fetchEvidenceByCase,
  fetchReports,
  fetchAuditLogs,
  deleteAnalysisFromFirestore,
  subscribeToAnalyses as subAnalyses,
  subscribeToCases as subCases,
  seedInitialDataIfEmpty,
  testFirestoreConnection,
} from "../firebase/firestore";
import { SERVICES } from "./mock-data";
import type {
  ActivityEvent,
  AnalysisConfig,
  AnalysisRecord,
  CaseRecord,
  EvidenceRecord,
  ReportRecord,
  SystemService,
} from "./types";
import { generateAndDownloadReport } from "./reports";

export const IS_DEMO = false;

export interface AnalyzeRequest {
  filename: string;
  sizeMb: number;
  kind: "video" | "image";
  config: AnalysisConfig;
  caseId?: string;
  file?: File;
}

export async function getAnalysisResult(id: string): Promise<AnalysisRecord | undefined> {
  return fetchAnalysisById(id);
}

export async function getAnalysisHistory(): Promise<AnalysisRecord[]> {
  return fetchAnalyses();
}

export async function deleteAnalysis(id: string): Promise<boolean> {
  return deleteAnalysisFromFirestore(id);
}

export async function getCase(id: string): Promise<CaseRecord | undefined> {
  return fetchCaseById(id);
}

export async function getCases(): Promise<CaseRecord[]> {
  return fetchCases();
}

export async function getEvidence(id?: string): Promise<EvidenceRecord[]> {
  return fetchEvidenceByCase(id);
}

export async function generateReport(analysisId: string): Promise<ReportRecord | undefined> {
  const analysis = await fetchAnalysisById(analysisId);
  if (!analysis) return undefined;
  const caseInfo = await fetchCaseById(analysis.caseId);
  return generateAndDownloadReport(analysis, caseInfo, "PDF");
}

export async function getSystemHealth(): Promise<SystemService[]> {
  return SERVICES;
}

export async function getActivity(): Promise<ActivityEvent[]> {
  return fetchAuditLogs();
}

export function subscribeToAnalyses(callback: (records: AnalysisRecord[]) => void) {
  return subAnalyses(callback);
}

export function subscribeToCases(callback: (records: CaseRecord[]) => void) {
  return subCases(callback);
}

export { seedInitialDataIfEmpty, testFirestoreConnection };
