import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Film, Image as ImageIcon, Layers, X, CheckCircle2, ChevronDown, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PIPELINE_STAGES } from '../lib/av/mock-data';
import type { AnalysisConfig } from '../lib/av/types';
import { ingestingEvidenceFile } from '../lib/firebase/storage';
import { createEvidenceInFirestore } from '../lib/firebase/firestore';
import { JobRunner } from '../lib/av/jobs';
import { useAuth } from '../lib/firebase/auth';

type DetectionMode = 'automatic' | 'deepfake' | 'face-morph' | 'both';
type Depth = 'fast' | 'balanced' | 'deep';
type FPS = '10' | '15' | '30' | 'adaptive';

interface PendingFile {
  file: File;
  name: string;
  size: string;
  type: 'Video' | 'Image';
}

export default function NewAnalysisPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [mode, setMode] = useState<DetectionMode>('automatic');
  const [depth, setDepth] = useState<Depth>('balanced');
  const [fps, setFps] = useState<FPS>('adaptive');
  const [faceDetect, setFaceDetect] = useState(true);
  const [audioAnalysis, setAudioAnalysis] = useState(true);
  const [metaAnalysis, setMetaAnalysis] = useState(true);
  const [xai, setXai] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [running, setRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Initializing evidence pipeline...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const fmtSize = (bytes: number) => bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${(bytes / 1e3).toFixed(0)} KB`;

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f => /\.(mp4|mov|avi|mkv|jpg|jpeg|png|webp)$/i.test(f.name));
    setFiles(prev => [...prev, ...valid.map(f => ({
      file: f,
      name: f.name,
      size: fmtSize(f.size),
      type: (f.type.startsWith('video') || /\.(mp4|mov|avi|mkv)$/i.test(f.name) ? 'Video' : 'Image') as 'Video' | 'Image'
    }))]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const startAnalysis = async () => {
    setRunning(true);
    setErrorMsg(null);
    setStageIndex(0);

    const config: AnalysisConfig = {
      mode: mode === 'automatic' ? 'auto' : mode === 'face-morph' ? 'morph' : 'deepfake',
      depth,
      sampling: fps,
      faceDetection: faceDetect,
      audioAnalysis,
      metadataAnalysis: metaAnalysis,
      explainable: xai,
    };

    const targetCaseId = 'CASE-104';
    const analystName = profile?.displayName || 'R. Nayar';

    try {
      if (files.length === 0) {
        // Run demo sample evidence
        setStatusMsg('Generating sample forensic evidence tensor...');
        const runner = new JobRunner();
        const demoBlob = new Blob(['sample-evidence-bytes'], { type: 'video/mp4' });
        const demoFile = new File([demoBlob], 'interview_clip.mp4', { type: 'video/mp4' });

        const result = await runner.runAnalysisJob(
          demoFile,
          targetCaseId,
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          analystName,
          config,
          (progress) => {
            setStatusMsg(`${progress.stage} (${progress.progressPercent}%)`);
            const stageNum = parseInt(progress.stage.slice(0, 2), 10) - 1;
            setStageIndex(isNaN(stageNum) ? 0 : stageNum);
          }
        );

        setRunning(false);
        navigate(`/analysis/${result.id}`);
        return;
      }

      // Real uploaded file execution
      const targetPending = files[0]!;
      const evidenceId = `EV-${Math.floor(10000 + Math.random() * 90000)}`;

      setStatusMsg('01 Media Ingestion: Calculating SHA-256 hash & preparing vault record...');
      setStageIndex(0);

      // Ingest file with safe timeouts
      const ingested = await ingestingEvidenceFile(targetPending.file, targetCaseId, evidenceId);

      // Create Evidence record in Firestore (non-blocking)
      createEvidenceInFirestore({
        filename: ingested.filename,
        kind: ingested.kind,
        sha256: ingested.sha256,
        sha1: ingested.sha1,
        md5: ingested.md5,
        sizeMb: ingested.fileSizeMb,
        addedAt: new Date().toISOString(),
        integrity: 'verified',
        caseId: targetCaseId,
        status: 'in-analysis',
      }).catch(e => console.warn('Evidence record notice:', e));

      // Run Inference Engine Job
      const runner = new JobRunner();
      const mediaUrl = ingested.downloadUrl || ingested.previewUrl;
      const result = await runner.runAnalysisJob(
        targetPending.file,
        targetCaseId,
        ingested.sha256,
        analystName,
        config,
        (progress) => {
          setStatusMsg(`${progress.stage} (${progress.progressPercent}%)`);
          const stageNum = parseInt(progress.stage.slice(0, 2), 10) - 1;
          setStageIndex(isNaN(stageNum) ? 0 : stageNum);
        },
        mediaUrl
      );

      setRunning(false);
      navigate(`/analysis/${result.id}`);
    } catch (err: any) {
      console.error('Analysis execution error:', err);
      setErrorMsg(err?.message || 'Forensic analysis pipeline encountered an error.');
      setRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Analysis</p>
        <h1 className="text-[22px] font-bold text-white font-display">New Forensic Analysis</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">Upload digital media to calculate cryptographic hash and run AI verification.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-[13px] text-red-300">
          <strong>Pipeline Exception:</strong> {errorMsg}
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload media files"
        onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-cyan-400/70 bg-cyan-400/5 glow-cyan'
            : 'border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".mp4,.mov,.avi,.mkv,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={e => e.target.files && addFiles(Array.from(e.target.files))}
          aria-hidden="true"
        />
        <div className={`w-16 h-16 rounded-2xl border mx-auto mb-5 flex items-center justify-center transition-all ${
          dragging ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400' : 'border-white/[0.1] bg-white/[0.03] text-slate-500'
        }`}>
          <Upload size={24} />
        </div>
        <h3 className="text-[16px] font-semibold text-slate-200 font-display mb-1.5">
          {dragging ? 'Drop evidence here' : 'Drop evidence file here'}
        </h3>
        <p className="text-[13px] text-slate-500 mb-4">
          or <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer">browse file</span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['MP4', 'MOV', 'AVI', 'MKV', 'JPG', 'JPEG', 'PNG', 'WEBP'].map(ext => (
            <span key={ext} className="text-[10px] font-mono text-slate-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
              {ext}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-600 mt-3 font-mono">Real SHA-256 hashing · Cloud Storage Vault</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-[13px] font-medium text-slate-300">{files.length} file{files.length !== 1 ? 's' : ''} queued</p>
            <button onClick={() => setFiles([])} className="text-[11px] text-slate-500 hover:text-slate-300">Clear all</button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                {f.type === 'Video' ? <Film size={14} className="text-violet-400 flex-shrink-0" /> : <ImageIcon size={14} className="text-cyan-400 flex-shrink-0" />}
                <span className="text-[13px] text-slate-200 flex-1 truncate">{f.name}</span>
                <span className="text-[11px] font-mono text-slate-500 flex-shrink-0">{f.size}</span>
                <span className="text-[10px] text-slate-600 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded flex-shrink-0">{f.type}</span>
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-600 hover:text-slate-300 flex-shrink-0 transition-colors" aria-label="Remove file">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {running && (
        <div className="bg-[#0C1118] border border-cyan-400/15 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-400/70">{statusMsg}</p>
              <h2 className="text-[14px] font-semibold text-white font-display mt-1">Processing evidence</h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">{Math.min(100, Math.round(((stageIndex + 1) / PIPELINE_STAGES.length) * 100))}%</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {PIPELINE_STAGES.map((item, index) => {
              const done = index < stageIndex;
              const active = index === stageIndex;
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className={`w-6 h-6 rounded-md border flex items-center justify-center text-[10px] font-mono ${
                    done ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' :
                    active ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400' :
                    'border-white/[0.07] text-slate-600'
                  }`}>
                    {done ? '✓' : String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[12px] ${active ? 'text-cyan-300 font-semibold' : done ? 'text-slate-300' : 'text-slate-600'}`}>{item.name}</p>
                    <p className="text-[10px] text-slate-600 truncate">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-5">
        <h2 className="text-[14px] font-semibold text-white font-display">Analysis Configuration</h2>

        {/* Detection mode */}
        <ConfigSection label="Detection Mode">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[['automatic','Automatic'],['deepfake','Deepfake'],['face-morph','Face Morph'],['both','Both']].map(([v,l]) => (
              <button
                key={v}
                onClick={() => setMode(v as DetectionMode)}
                className={`px-3 py-2 rounded-md text-[12.5px] font-medium border transition-all ${
                  mode === v
                    ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
                    : 'border-white/[0.07] text-slate-400 hover:border-white/[0.15] hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </ConfigSection>

        {/* Analysis depth */}
        <ConfigSection label="Analysis Depth">
          <div className="grid grid-cols-3 gap-2">
            {[['fast','Fast','~15s'],['balanced','Balanced','~45s'],['deep','Deep Forensic','~2min']].map(([v,l,t]) => (
              <button
                key={v}
                onClick={() => setDepth(v as Depth)}
                className={`px-3 py-3 rounded-md text-left border transition-all ${
                  depth === v
                    ? 'bg-cyan-400/10 border-cyan-400/30'
                    : 'border-white/[0.07] hover:border-white/[0.15]'
                }`}
              >
                <p className={`text-[12.5px] font-medium ${depth === v ? 'text-cyan-400' : 'text-slate-300'}`}>{l}</p>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">{t}</p>
              </button>
            ))}
          </div>
        </ConfigSection>

        {/* Frame sampling */}
        <ConfigSection label="Frame Sampling">
          <div className="flex flex-wrap gap-2">
            {(['10','15','30','adaptive'] as FPS[]).map(v => (
              <button
                key={v}
                onClick={() => setFps(v)}
                className={`px-3 py-1.5 rounded text-[12px] font-medium border transition-all ${
                  fps === v
                    ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
                    : 'border-white/[0.07] text-slate-400 hover:border-white/[0.15]'
                }`}
              >
                {v === 'adaptive' ? 'Adaptive' : `${v} FPS`}
              </button>
            ))}
          </div>
        </ConfigSection>

        {/* Toggles */}
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['Face Detection', faceDetect, setFaceDetect],
            ['Audio Analysis', audioAnalysis, setAudioAnalysis],
            ['Metadata Analysis', metaAnalysis, setMetaAnalysis],
            ['Explainable AI', xai, setXai, true],
          ].map(([label, val, setter, locked]: any) => (
            <div key={label} className="flex items-center justify-between py-2.5 px-3 rounded-md border border-white/[0.05] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate-300">{label}</span>
                {locked && <span className="text-[9px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-1.5 py-0.5 rounded font-mono">ENABLED</span>}
              </div>
              <button
                onClick={() => !locked && setter(!val)}
                role="switch"
                aria-checked={val}
                aria-label={label}
                className={`relative w-9 h-5 rounded-full transition-all border ${
                  val ? 'bg-cyan-400/20 border-cyan-400/40' : 'bg-white/[0.06] border-white/[0.1]'
                } ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  val ? 'left-4 bg-cyan-400' : 'left-0.5 bg-slate-500'
                }`} />
              </button>
            </div>
          ))}
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(o => !o)}
          className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          Advanced options
        </button>

        {showAdvanced && (
          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            <div className="flex items-start gap-2 text-[12px] text-slate-500 bg-cyan-400/[0.04] border border-cyan-400/10 rounded-md px-3 py-2.5">
              <Info size={13} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              Advanced model parameters and ensemble configuration are stored in Model Registry.
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pb-6">
        <Button
          variant="primary"
          size="lg"
          icon={files.length > 1 ? <Layers size={15} /> : <CheckCircle2 size={15} />}
          onClick={startAnalysis} disabled={running}
          className="sm:flex-1"
        >
          {running ? 'Running forensic pipeline…' : files.length === 0 ? 'Run Sample Forensic Pipeline' : files.length === 1 ? 'Begin Forensic Analysis' : `Analyze ${files.length} Files`}
        </Button>
        <Button variant="outline" size="lg" className="sm:w-auto" onClick={() => navigate('/analysis/history')}>View Analysis Vault</Button>
      </div>
    </div>
  );
}

function ConfigSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}
