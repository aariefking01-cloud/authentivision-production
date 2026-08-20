import type { AnalysisConfig } from './types';
import { DetectionEngine, type DetectionResult } from './detection-engine';
import { saveAnalysisInFirestore, logAuditEvent } from '../firebase/firestore';
import { saveMediaToVault } from './media-vault';

export type JobStatus =
  | 'QUEUED'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'ANALYZING'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type JobStage =
  | '01 Media Ingestion'
  | '02 Metadata Extraction'
  | '03 Frame Sampling'
  | '04 Face Detection'
  | '05 Artifact Analysis'
  | '06 Temporal Analysis'
  | '07 Model Inference'
  | '08 Confidence Calibration'
  | '09 Forensic Assembly';

export interface AnalysisJobProgress {
  jobId: string;
  caseId: string;
  filename: string;
  status: JobStatus;
  stage: JobStage;
  progressPercent: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: DetectionResult;
}

export type ProgressCallback = (progress: AnalysisJobProgress) => void;

export class JobRunner {
  private engine = new DetectionEngine('REAL_MODEL');

  public async runAnalysisJob(
    file: File,
    caseId: string,
    sha256: string,
    analystName: string,
    config?: AnalysisConfig,
    onProgress?: ProgressCallback,
    mediaUrl?: string
  ): Promise<DetectionResult> {
    const jobId = `JOB-${Math.floor(100000 + Math.random() * 900000)}`;
    const startedAt = new Date().toISOString();

    const notify = (status: JobStatus, stage: JobStage, progressPercent: number, extra?: { result?: DetectionResult; error?: string }) => {
      if (onProgress) {
        onProgress({
          jobId,
          caseId,
          filename: file.name,
          status,
          stage,
          progressPercent,
          startedAt,
          completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date().toISOString() : undefined,
          ...extra,
        });
      }
    };

    try {
      notify('QUEUED', '01 Media Ingestion', 5);
      await new Promise(r => setTimeout(r, 200));

      notify('VALIDATING', '02 Metadata Extraction', 15);
      await new Promise(r => setTimeout(r, 250));

      notify('PROCESSING', '03 Frame Sampling', 30);
      await new Promise(r => setTimeout(r, 300));

      notify('PROCESSING', '04 Face Detection', 45);
      await new Promise(r => setTimeout(r, 350));

      notify('ANALYZING', '05 Artifact Analysis', 60);
      await new Promise(r => setTimeout(r, 400));

      notify('ANALYZING', '06 Temporal Analysis', 75);
      await new Promise(r => setTimeout(r, 350));

      notify('ANALYZING', '07 Model Inference', 88);

      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm)$/i.test(file.name);
      let result: DetectionResult;

      if (isVideo) {
        result = await this.engine.analyzeVideo(file, config, mediaUrl);
      } else {
        result = await this.engine.analyzeImage(file, config);
      }

      // Persist evidence media Blob into MediaVault (Memory + IndexedDB) for persistent playback
      const activePlayableUrl = await saveMediaToVault(result.id, sha256, file, file.name);
      result.imageUrl = activePlayableUrl || result.imageUrl || mediaUrl;

      notify('FINALIZING', '08 Confidence Calibration', 95);
      await new Promise(r => setTimeout(r, 200));

      const sizeMb = Math.round((file.size / (1024 * 1024)) * 100) / 100;
      const record = this.engine.createRecordFromResult(
        result,
        file.name,
        isVideo ? 'video' : 'image',
        caseId,
        sizeMb,
        sha256,
        analystName,
        result.imageUrl || mediaUrl
      );

      // Save to Firestore
      await saveAnalysisInFirestore(record);
      await logAuditEvent({
        action: 'ANALYSIS_COMPLETED',
        resource: result.id,
        caseId,
        result: 'success',
        actor: analystName,
      });

      notify('COMPLETED', '09 Forensic Assembly', 100, { result });
      return result;
    } catch (err: any) {
      const errorMsg = err?.message || 'Inference engine pipeline error';
      notify('FAILED', '07 Model Inference', 0, { error: errorMsg });
      throw err;
    }
  }
}
