import type {
  Verdict,
  RiskLevel,
  ClassificationBreakdown,
  ProvenanceRecord,
  ModelSignalsRecord,
  AgreementRecord,
  DetectionSignal,
  SuspiciousRegion,
} from '../types';
import type { DetectorResult } from './SpecializedDetectorProvider';

export interface FusionInput {
  geminiVerdict?: Verdict;
  geminiConfidence?: number;
  geminiSummary?: string;
  geminiClassification?: ClassificationBreakdown;
  geminiEvidence?: any[];
  geminiSuspiciousRegions?: SuspiciousRegion[];
  geminiQuality?: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  specializedDetector: DetectorResult;
  externalDetector: DetectorResult;
  provenance: ProvenanceRecord;
}

export interface FusionOutput {
  verdict: Verdict;
  confidence: number;
  uncertainty: number;
  quality: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  riskLevel: RiskLevel;
  classification: ClassificationBreakdown;
  analysisSummary: string;
  evidence: DetectionSignal[];
  suspiciousRegions: SuspiciousRegion[];
  provenance: ProvenanceRecord;
  modelSignals: ModelSignalsRecord;
  agreement: AgreementRecord;
  limitations: string[];
}

export class FusionEngine {
  public static fuse(input: FusionInput): FusionOutput {
    const {
      geminiVerdict = 'INCONCLUSIVE',
      geminiConfidence = 50,
      geminiSummary = 'Multimodal image assessment completed.',
      geminiClassification = { aiGenerated: 0.33, manipulated: 0.33, authentic: 0.34 },
      geminiEvidence = [],
      geminiSuspiciousRegions = [],
      geminiQuality = 'HIGH',
      specializedDetector,
      externalDetector,
      provenance,
    } = input;

    // 1. Calculate Signal Agreement
    let supportingSignals = 0;
    let conflictingSignals = 0;

    // Is Gemini suggesting AI or manipulation?
    const geminiSaysAi = geminiVerdict === 'LIKELY_AI_GENERATED' || geminiVerdict === 'LIKELY_DEEPFAKE' || geminiVerdict === 'LIKELY_MANIPULATED';
    const geminiSaysAuthentic = geminiVerdict === 'LIKELY_AUTHENTIC';

    // Specialized detector signal (score > 0.6 = AI, < 0.4 = authentic)
    const specializedSaysAi = specializedDetector.score > 0.6;
    const specializedSaysAuthentic = specializedDetector.score < 0.4;

    if (geminiSaysAi) {
      supportingSignals++;
      if (specializedSaysAi) supportingSignals++;
      if (specializedSaysAuthentic) conflictingSignals++;
    } else if (geminiSaysAuthentic) {
      supportingSignals++;
      if (specializedSaysAuthentic) supportingSignals++;
      if (specializedSaysAi) conflictingSignals++;
    }

    if (externalDetector.available) {
      const externalSaysAi = externalDetector.score > 0.6;
      if ((geminiSaysAi && externalSaysAi) || (geminiSaysAuthentic && !externalSaysAi)) {
        supportingSignals++;
      } else {
        conflictingSignals++;
      }
    }

    // Provenance signals
    if (provenance.synthIdDetected) {
      supportingSignals += 2;
    }
    if (provenance.c2paDetected) {
      supportingSignals += 1;
    }

    let agreementLevel: "HIGH" | "MODERATE" | "LOW" | "CONFLICTING" = "MODERATE";
    if (conflictingSignals >= 2) {
      agreementLevel = "CONFLICTING";
    } else if (supportingSignals >= 2 && conflictingSignals === 0) {
      agreementLevel = "HIGH";
    } else if (supportingSignals >= 1) {
      agreementLevel = "MODERATE";
    } else {
      agreementLevel = "LOW";
    }

    // 2. Determine Calibrated Verdict & Confidence
    let finalVerdict: Verdict = geminiVerdict;
    let finalConfidence = geminiConfidence;

    if (provenance.synthIdDetected) {
      finalVerdict = 'LIKELY_AI_GENERATED';
      finalConfidence = Math.max(92, finalConfidence);
    } else if (agreementLevel === 'CONFLICTING') {
      finalVerdict = 'INCONCLUSIVE';
      finalConfidence = Math.min(55, finalConfidence);
    } else if (agreementLevel === 'HIGH') {
      finalConfidence = Math.min(98.5, finalConfidence + 6);
    } else if (agreementLevel === 'LOW') {
      finalConfidence = Math.max(50, finalConfidence - 10);
    }

    // Quality override gate - fallback to specialized detector if Gemini quality is low
    if (geminiQuality === 'INSUFFICIENT' && specializedDetector.score <= 0.4 && !provenance.synthIdDetected) {
      // If specialized detector is confident, trust specialized detector rather than failing
      if (specializedDetector.score < 0.25) {
        finalVerdict = 'LIKELY_AUTHENTIC';
        finalConfidence = 82.0;
      } else if (specializedDetector.score > 0.75) {
        finalVerdict = 'LIKELY_AI_GENERATED';
        finalConfidence = 84.0;
      }
    }

    const uncertainty = Math.round((100 - finalConfidence) * 0.25 * 10) / 10;

    const riskLevel: RiskLevel =
      finalVerdict === 'LIKELY_AUTHENTIC' || finalVerdict === 'authentic'
        ? 'low'
        : finalVerdict === 'INCONCLUSIVE' || finalVerdict === 'inconclusive'
        ? 'medium'
        : finalConfidence > 90
        ? 'critical'
        : 'high';

    // Normalize classification scores
    const rawAi = geminiClassification.aiGenerated ?? 0.33;
    const rawManip = geminiClassification.manipulated ?? 0.33;
    const rawAuth = geminiClassification.authentic ?? 0.34;
    const total = rawAi + rawManip + rawAuth || 1.0;

    const classification: ClassificationBreakdown = {
      aiGenerated: Math.round((rawAi / total) * 100) / 100,
      manipulated: Math.round((rawManip / total) * 100) / 100,
      authentic: Math.round((rawAuth / total) * 100) / 100,
    };

    // Construct unified evidence list
    const evidence: DetectionSignal[] = geminiEvidence.map((ev, idx) => ({
      id: `ev-${idx}-${Math.floor(Math.random() * 1000)}`,
      label: ev.finding || ev.category || 'Forensic Finding',
      severity: (ev.severity || 'medium').toLowerCase() as RiskLevel,
      contribution: Math.round((ev.confidence || 0.8) * 40 * 10) / 10,
      summary: ev.finding || 'Observed visual anomaly.',
      detail: ev.detail || `${ev.category} analysis finding: ${ev.finding}`,
    }));

    if (provenance.synthIdDetected) {
      evidence.unshift({
        id: 'ev-synthid-01',
        label: 'SynthID Google AI Watermark Detected',
        severity: 'critical',
        contribution: 45.0,
        summary: 'Imperceptible frequency-domain Google AI watermark detected.',
        detail: 'The binary container carries a verified SynthID frequency signature embedded during AI generation.',
      });
    } else if (provenance.c2paDetected) {
      evidence.unshift({
        id: 'ev-c2pa-01',
        label: 'Verified C2PA Content Credentials Manifest',
        severity: 'low',
        contribution: 35.0,
        summary: 'Signed C2PA provenance manifest structure found in container.',
        detail: provenance.details || 'C2PA manifest structure parsed successfully.',
      });
    }

    const modelSignals: ModelSignalsRecord = {
      geminiAssessment: geminiSummary,
      specializedDetector: {
        available: specializedDetector.available,
        label: specializedDetector.providerName,
        score: specializedDetector.score,
      },
      externalDetector: {
        available: externalDetector.available,
        provider: externalDetector.available ? externalDetector.providerName : null,
        score: externalDetector.available ? externalDetector.score : null,
      },
      provenanceCheck: provenance.details,
    };

    const agreement: AgreementRecord = {
      level: agreementLevel,
      supportingSignals,
      conflictingSignals,
    };

    const limitations = [
      'AI image authenticity assessment is probabilistic and evaluates pixel heuristics.',
      'Absence of C2PA or SynthID metadata does not independently prove or disprove authenticity.',
      'Social media re-compression or resizing may reduce sensitivity to fine high-frequency noise.',
      'High-impact forensic decisions should be verified by a certified forensic reviewer.',
    ];

    return {
      verdict: finalVerdict,
      confidence: Math.round(finalConfidence * 10) / 10,
      uncertainty,
      quality: geminiQuality,
      riskLevel,
      classification,
      analysisSummary: geminiSummary,
      evidence,
      suspiciousRegions: geminiSuspiciousRegions,
      provenance,
      modelSignals,
      agreement,
      limitations,
    };
  }
}
