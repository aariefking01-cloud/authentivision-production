import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  orderBy,
  where,
  onSnapshot,
  getDocFromServer,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import type {
  AnalysisRecord,
  CaseRecord,
  EvidenceRecord,
  ReportRecord,
  ActivityEvent,
} from '../av/types';
import { CASES, ANALYSES, EVIDENCE, REPORTS, ACTIVITY } from '../av/mock-data';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// In-memory fallback caches for immediate multi-view access and offline resilience
const inMemoryAnalyses = new Map<string, AnalysisRecord>();
const inMemoryCases = new Map<string, CaseRecord>();
const inMemoryEvidence = new Map<string, EvidenceRecord>();
const inMemoryReports = new Map<string, ReportRecord>();

// Connection health validation
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore notice: client running in offline cache mode.');
    }
    return false;
  }
}

// Automatically trigger connection test on load
testFirestoreConnection().catch(() => {});

// Helper for non-blocking setDoc with timeout
async function safeSetDoc(docRef: any, data: any, timeoutMs = 3000) {
  try {
    const setPromise = setDoc(docRef, data, { merge: true });
    const timeoutPromise = new Promise((res) => setTimeout(res, timeoutMs));
    await Promise.race([setPromise, timeoutPromise]);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docRef.path);
  }
}

// Firestore collection names
export const COLS = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  CASES: 'cases',
  EVIDENCE: 'evidence',
  ANALYSES: 'analyses',
  JOBS: 'analysisJobs',
  REPORTS: 'reports',
  AUDIT_LOGS: 'auditLogs',
  MODEL_VERSIONS: 'modelVersions',
  NOTIFICATIONS: 'notifications',
  FEEDBACK: 'feedback',
};

// Seeding function to populate base forensic vault if empty
export async function seedInitialDataIfEmpty() {
  try {
    const casesSnap = await getDocs(query(collection(db, COLS.CASES), limit(1)));
    if (!casesSnap.empty) return; // Already seeded

    console.log('Populating initial forensic records to Firestore database...');

    // Seed Cases
    for (const c of CASES) {
      await safeSetDoc(doc(db, COLS.CASES, c.id), {
        ...c,
        organizationId: 'ORG-FED-01',
        createdBy: 'system',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      });
    }

    // Seed Evidence
    for (const e of EVIDENCE) {
      await safeSetDoc(doc(db, COLS.EVIDENCE, e.id), {
        ...e,
        organizationId: 'ORG-FED-01',
        storagePath: `organizations/ORG-FED-01/cases/${e.caseId}/evidence/${e.id}/original`,
        uploadedBy: 'system',
      });
    }

    // Seed Analyses
    for (const a of ANALYSES) {
      await safeSetDoc(doc(db, COLS.ANALYSES, a.id), {
        ...a,
        organizationId: 'ORG-FED-01',
        humanReview: a.verdict === 'deepfake' || a.verdict === 'morph' ? {
          reviewedBy: 'Dr. K. Osei',
          reviewedAt: new Date().toISOString(),
          decision: 'confirmed',
          notes: 'Concur with AI findings. Edge-gradient anomalies confirmed under secondary transform inspection.',
        } : null,
      });
    }

    // Seed Reports
    for (const r of REPORTS) {
      await safeSetDoc(doc(db, COLS.REPORTS, r.id), {
        ...r,
        organizationId: 'ORG-FED-01',
      });
    }

    // Seed Audit Logs
    for (const act of ACTIVITY) {
      await safeSetDoc(doc(db, COLS.AUDIT_LOGS, act.id), {
        ...act,
        organizationId: 'ORG-FED-01',
        timestamp: act.at,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seed');
  }
}

// Cases CRUD
export async function fetchCases(): Promise<CaseRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLS.CASES));
    if (snap.empty) {
      await seedInitialDataIfEmpty();
      return CASES;
    }
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as CaseRecord));
    items.forEach(c => inMemoryCases.set(c.id, c));
    return items;
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, COLS.CASES);
    return CASES;
  }
}

export async function fetchCaseById(id: string): Promise<CaseRecord | undefined> {
  if (inMemoryCases.has(id)) {
    return inMemoryCases.get(id);
  }
  try {
    const snap = await getDoc(doc(db, COLS.CASES, id));
    if (snap.exists()) {
      const item = { id: snap.id, ...snap.data() } as CaseRecord;
      inMemoryCases.set(item.id, item);
      return item;
    }
    return CASES.find(c => c.id === id);
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, `${COLS.CASES}/${id}`);
    return CASES.find(c => c.id === id);
  }
}

export async function createCaseInFirestore(caseData: Partial<CaseRecord>): Promise<CaseRecord> {
  const newId = `CASE-${105 + Math.floor(Math.random() * 900)}`;
  const fullCase: CaseRecord = {
    id: newId,
    name: caseData.name || 'Untitled Investigation',
    description: caseData.description || 'Forensic investigation case.',
    investigator: caseData.investigator || auth.currentUser?.displayName || 'R. Nayar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: caseData.priority || 'high',
    status: caseData.status || 'open',
    evidenceCount: 0,
    findings: [],
  };

  inMemoryCases.set(newId, fullCase);

  try {
    await safeSetDoc(doc(db, COLS.CASES, newId), {
      ...fullCase,
      userId: auth.currentUser?.uid || 'anonymous',
      organizationId: 'ORG-FED-01',
    });
    await logAuditEvent({
      action: 'CASE_CREATED',
      resource: newId,
      result: 'success',
      actor: caseData.investigator || 'Investigator',
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `${COLS.CASES}/${newId}`);
  }

  return fullCase;
}

export async function updateCaseInFirestore(id: string, updates: Partial<CaseRecord>) {
  try {
    await updateDoc(doc(db, COLS.CASES, id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await logAuditEvent({
      action: 'CASE_UPDATED',
      resource: id,
      result: 'success',
      actor: auth.currentUser?.displayName || 'Investigator',
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `${COLS.CASES}/${id}`);
  }
}

// Evidence CRUD
export async function fetchEvidenceByCase(caseId?: string): Promise<EvidenceRecord[]> {
  const mergedMap = new Map<string, EvidenceRecord>();
  EVIDENCE.forEach(e => mergedMap.set(e.id, e));
  inMemoryEvidence.forEach((e, id) => mergedMap.set(id, e));

  try {
    const snap = await getDocs(collection(db, COLS.EVIDENCE));
    if (!snap.empty) {
      snap.docs.forEach(d => {
        const item = { id: d.id, ...d.data() } as EvidenceRecord;
        mergedMap.set(item.id, item);
      });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, COLS.EVIDENCE);
  }

  const items = Array.from(mergedMap.values());
  return caseId ? items.filter(e => e.caseId === caseId) : items;
}

export async function createEvidenceInFirestore(evidenceData: Omit<EvidenceRecord, 'id'>): Promise<EvidenceRecord> {
  const newId = `EV-${Math.floor(10000 + Math.random() * 90000)}`;
  const record: EvidenceRecord = {
    id: newId,
    ...evidenceData,
  };

  inMemoryEvidence.set(newId, record);

  try {
    await safeSetDoc(doc(db, COLS.EVIDENCE, newId), {
      ...record,
      userId: auth.currentUser?.uid || 'anonymous',
      organizationId: 'ORG-FED-01',
    });
    await logAuditEvent({
      action: 'EVIDENCE_UPLOADED',
      resource: newId,
      caseId: evidenceData.caseId,
      result: 'success',
      actor: auth.currentUser?.displayName || 'Analyst',
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `${COLS.EVIDENCE}/${newId}`);
  }

  return record;
}

// Analyses CRUD
export async function fetchAnalyses(): Promise<AnalysisRecord[]> {
  const mergedMap = new Map<string, AnalysisRecord>();
  // Put mock defaults first
  ANALYSES.forEach(a => mergedMap.set(a.id, a));
  inMemoryAnalyses.forEach((a, id) => mergedMap.set(id, a));

  try {
    const snap = await getDocs(collection(db, COLS.ANALYSES));
    if (!snap.empty) {
      snap.docs.forEach(d => {
        const item = { id: d.id, ...d.data() } as AnalysisRecord;
        mergedMap.set(item.id, item);
        inMemoryAnalyses.set(item.id, item);
      });
    } else {
      await seedInitialDataIfEmpty();
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, COLS.ANALYSES);
  }

  // Sort by analyzedAt descending
  return Array.from(mergedMap.values()).sort((a, b) => 
    new Date(b.analyzedAt || 0).getTime() - new Date(a.analyzedAt || 0).getTime()
  );
}

export async function fetchAnalysisById(id: string): Promise<AnalysisRecord | undefined> {
  if (inMemoryAnalyses.has(id)) {
    return inMemoryAnalyses.get(id);
  }
  try {
    const snap = await getDoc(doc(db, COLS.ANALYSES, id));
    if (snap.exists()) {
      const record = { id: snap.id, ...snap.data() } as AnalysisRecord;
      inMemoryAnalyses.set(record.id, record);
      return record;
    }
    return ANALYSES.find(a => a.id === id);
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, `${COLS.ANALYSES}/${id}`);
    return ANALYSES.find(a => a.id === id);
  }
}

export async function saveAnalysisInFirestore(record: AnalysisRecord) {
  inMemoryAnalyses.set(record.id, record);
  try {
    await safeSetDoc(doc(db, COLS.ANALYSES, record.id), {
      ...record,
      userId: auth.currentUser?.uid || 'anonymous',
      organizationId: 'ORG-FED-01',
      savedAt: new Date().toISOString(),
    });
    await logAuditEvent({
      action: 'ANALYSIS_COMPLETED',
      resource: record.id,
      caseId: record.caseId,
      result: 'success',
      actor: record.analyst || auth.currentUser?.displayName || 'DetectionEngine',
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${COLS.ANALYSES}/${record.id}`);
  }
}

export async function deleteAnalysisFromFirestore(id: string): Promise<boolean> {
  inMemoryAnalyses.delete(id);
  try {
    await deleteDoc(doc(db, COLS.ANALYSES, id));
    await logAuditEvent({
      action: 'ANALYSIS_DELETED',
      resource: id,
      result: 'success',
      actor: auth.currentUser?.displayName || 'Analyst',
    });
    return true;
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${COLS.ANALYSES}/${id}`);
    return false;
  }
}

export async function updateHumanReviewInFirestore(
  analysisId: string,
  review: { reviewedBy: string; decision: 'confirmed' | 'rejected' | 'inconclusive'; notes: string }
) {
  const reviewData = {
    ...review,
    reviewedAt: new Date().toISOString(),
  };

  if (inMemoryAnalyses.has(analysisId)) {
    const existing = inMemoryAnalyses.get(analysisId)!;
    existing.humanReview = reviewData;
  }

  try {
    await updateDoc(doc(db, COLS.ANALYSES, analysisId), {
      humanReview: reviewData,
    });
    await logAuditEvent({
      action: 'REVIEW_CREATED',
      resource: analysisId,
      result: 'success',
      actor: review.reviewedBy,
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `${COLS.ANALYSES}/${analysisId}`);
  }
}

export async function saveFeedbackInFirestore(
  analysisId: string,
  feedback: { correct: boolean; comments?: string; submittedBy?: string }
) {
  const feedbackData = {
    ...feedback,
    submittedAt: new Date().toISOString(),
  };

  inMemoryAnalyses.forEach((rec, key) => {
    if (key === analysisId) {
      rec.feedback = feedbackData;
    }
  });

  try {
    await updateDoc(doc(db, COLS.ANALYSES, analysisId), {
      feedback: feedbackData,
    });
    const fbId = `FB-${Math.floor(100000 + Math.random() * 900000)}`;
    await safeSetDoc(doc(db, COLS.FEEDBACK, fbId), {
      id: fbId,
      analysisId,
      userId: auth.currentUser?.uid || 'anonymous',
      ...feedbackData,
    });
    await logAuditEvent({
      action: 'FEEDBACK_SUBMITTED',
      resource: analysisId,
      result: 'success',
      actor: feedback.submittedBy || 'Analyst',
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${COLS.FEEDBACK}/${analysisId}`);
  }
}

// Reports CRUD
export async function fetchReports(): Promise<ReportRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLS.REPORTS));
    if (snap.empty) return REPORTS;
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportRecord));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, COLS.REPORTS);
    return REPORTS;
  }
}

export async function createReportInFirestore(report: ReportRecord) {
  try {
    await safeSetDoc(doc(db, COLS.REPORTS, report.id), {
      ...report,
      userId: auth.currentUser?.uid || 'anonymous',
      organizationId: 'ORG-FED-01',
    });
    await logAuditEvent({
      action: 'REPORT_GENERATED',
      resource: report.id,
      caseId: report.caseId,
      result: 'success',
      actor: report.author,
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `${COLS.REPORTS}/${report.id}`);
  }
}

// Audit Logs
export async function fetchAuditLogs(): Promise<ActivityEvent[]> {
  try {
    const snap = await getDocs(collection(db, COLS.AUDIT_LOGS));
    if (snap.empty) return ACTIVITY;
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityEvent));
    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, COLS.AUDIT_LOGS);
    return ACTIVITY;
  }
}

export async function logAuditEvent(event: {
  action: string;
  resource: string;
  result: 'success' | 'warning' | 'denied';
  actor?: string;
  caseId?: string;
  evidenceId?: string;
}) {
  const id = `LOG-${Math.floor(10000 + Math.random() * 90000)}`;
  const logItem: ActivityEvent = {
    id,
    at: new Date().toISOString(),
    actor: event.actor || auth.currentUser?.displayName || 'Forensic Officer',
    action: event.action,
    resource: event.resource,
    device: '10.44.12.89 · Secure Workstation',
    result: event.result,
  };

  try {
    await safeSetDoc(doc(db, COLS.AUDIT_LOGS, id), {
      ...logItem,
      caseId: event.caseId || null,
      evidenceId: event.evidenceId || null,
      userId: auth.currentUser?.uid || 'anonymous',
      organizationId: 'ORG-FED-01',
      timestamp: logItem.at,
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `${COLS.AUDIT_LOGS}/${id}`);
  }

  return logItem;
}

// Real-time listener hooks
export function subscribeToAnalyses(callback: (records: AnalysisRecord[]) => void): Unsubscribe {
  try {
    return onSnapshot(
      collection(db, COLS.ANALYSES),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AnalysisRecord));
          list.forEach(a => inMemoryAnalyses.set(a.id, a));
          callback(list.sort((a, b) => new Date(b.analyzedAt || 0).getTime() - new Date(a.analyzedAt || 0).getTime()));
        } else {
          callback(ANALYSES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLS.ANALYSES);
        callback(Array.from(inMemoryAnalyses.values()));
      }
    );
  } catch (e) {
    callback(ANALYSES);
    return () => {};
  }
}

export function subscribeToCases(callback: (records: CaseRecord[]) => void): Unsubscribe {
  try {
    return onSnapshot(
      collection(db, COLS.CASES),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CaseRecord));
          list.forEach(c => inMemoryCases.set(c.id, c));
          callback(list);
        } else {
          callback(CASES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLS.CASES);
        callback(CASES);
      }
    );
  } catch (e) {
    callback(CASES);
    return () => {};
  }
}
