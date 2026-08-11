import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, Share2, ChevronDown, ChevronRight, AlertTriangle, Eye, Layers, Shield, Film } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RiskBadge } from '../components/ui/Badge';

const signals = [
  { label: 'Facial boundary inconsistencies', severity: 'critical', contribution: 34, detail: 'Abrupt transitions detected along face perimeter at 0.4px frequency, inconsistent with natural facial geometry.' },
  { label: 'Temporal frame instability', severity: 'high', contribution: 22, detail: 'Inter-frame consistency score below threshold at frames 128–244. GAN-characteristic flickering pattern detected.' },
  { label: 'Unnatural eye-region artifacts', severity: 'high', contribution: 18, detail: 'Iris texture entropy deviation of 2.4σ from reference distribution. Specular reflection anomalies detected.' },
  { label: 'Compression inconsistencies', severity: 'medium', contribution: 12, detail: 'Non-uniform compression artifacts across facial region inconsistent with source codec fingerprint.' },
  { label: 'Lighting mismatch', severity: 'medium', contribution: 9, detail: 'Ambient light gradient direction at variance with detected shadow vectors by 34°.' },
  { label: 'Identity embedding anomaly', severity: 'low', contribution: 5, detail: 'Feature embedding distance of 0.38 from reference identity manifold, indicating identity substitution.' },
];

const stages = [
  { num: '01', label: 'Media Ingestion', status: 'complete', time: '0.4s' },
  { num: '02', label: 'Metadata Extraction', status: 'complete', time: '0.8s' },
  { num: '03', label: 'Frame Sampling', status: 'complete', time: '3.2s' },
  { num: '04', label: 'Face Detection', status: 'complete', time: '2.1s' },
  { num: '05', label: 'Artifact Analysis', status: 'complete', time: '8.4s' },
  { num: '06', label: 'Temporal Analysis', status: 'complete', time: '5.7s' },
  { num: '07', label: 'Model Inference', status: 'complete', time: '12.3s' },
  { num: '08', label: 'Confidence Calibration', status: 'complete', time: '1.1s' },
  { num: '09', label: 'Forensic Report', status: 'complete', time: '0.9s' },
];

const overlayModes = ['Original', 'Heatmap', 'Face Landmarks', 'Artifact Map', 'Attention Map', 'Bounding Boxes'];

const timelineEvents = [
  { t: 5, type: 'face', label: 'Face anomaly' },
  { t: 18, type: 'temporal', label: 'Temporal spike' },
  { t: 31, type: 'artifact', label: 'Artifact cluster' },
  { t: 44, type: 'face', label: 'Eye artifact' },
  { t: 58, type: 'compression', label: 'Compression break' },
  { t: 71, type: 'temporal', label: 'GAN flicker' },
  { t: 84, type: 'face', label: 'Boundary break' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  low: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

export default function AnalysisResultsPage() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [overlay, setOverlay] = useState('Original');
  const [expertMode, setExpertMode] = useState(false);
  const [timelinePos, setTimelinePos] = useState(35);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-slate-500" aria-label="Breadcrumb">
        <Link to="/analysis/history" className="hover:text-slate-300">History</Link>
        <ChevronRight size={12} />
        <span className="font-mono text-slate-400">{id}</span>
      </nav>

      {/* Header verdict block */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-gradient-to-br from-[#0C1118] to-[#100A0A]">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.04] to-transparent" aria-hidden="true" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-600 tracking-[0.15em] uppercase mb-2">Authenticity Assessment</p>
              <h1 className="text-[36px] sm:text-[44px] font-bold font-display text-red-400 text-glow-cyan leading-none mb-3" style={{ textShadow: '0 0 30px rgba(239,68,68,0.3)' }}>
                DEEPFAKE DETECTED
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge risk="critical" />
                <span className="text-[13px] text-slate-500 font-mono">Analysis ID: <span className="text-slate-300">{id}</span></span>
                <span className="text-[13px] text-slate-500 font-mono">Aug 10, 2026 · 14:32:07</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <ConfidenceGauge value={97.4} />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" icon={<FileText size={13} />}>Report</Button>
                <Button variant="outline" size="sm" icon={<Download size={13} />}>Export</Button>
                <Button variant="ghost" size="sm" icon={<Share2 size={13} />}>Share</Button>
                <button
                  onClick={() => setExpertMode(o => !o)}
                  className={`px-3 py-1.5 rounded text-[11px] font-mono border transition-all ${
                    expertMode ? 'border-violet-400/40 bg-violet-400/10 text-violet-400' : 'border-white/[0.07] text-slate-500 hover:border-white/[0.15]'
                  }`}
                >
                  {expertMode ? '⚡ EXPERT' : 'Expert Mode'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Evidence viewer */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <h2 className="text-[13px] font-semibold text-white font-display">Forensic Evidence Viewer</h2>
              <div className="flex gap-1 overflow-x-auto">
                {overlayModes.map(m => (
                  <button
                    key={m}
                    onClick={() => setOverlay(m)}
                    className={`px-2.5 py-1 text-[10.5px] font-medium rounded whitespace-nowrap transition-all flex-shrink-0 ${
                      overlay === m ? 'bg-cyan-400/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Video frame mock */}
            <div className="relative bg-black aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative overflow-hidden">
                  {/* Simulated video frame */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    {/* Face placeholder */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40">
                      <div className="w-full h-full rounded-full border border-white/10 bg-slate-700/30" />
                    </div>
                  </div>

                  {/* Heatmap overlay */}
                  {overlay !== 'Original' && (
                    <div className="absolute inset-0">
                      {overlay === 'Heatmap' && (
                        <div className="absolute top-1/3 left-1/3 w-40 h-48 rounded-full blur-2xl"
                          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.1) 60%, transparent 100%)' }} />
                      )}
                      {overlay === 'Bounding Boxes' && (
                        <div className="absolute top-[30%] left-[35%] w-[30%] h-[45%] border-2 border-red-500/80 rounded" />
                      )}
                      {overlay === 'Face Landmarks' && (
                        <svg className="absolute inset-0 w-full h-full">
                          {[[250,140],[290,138],[270,158],[258,178],[282,178]].map(([x,y],i) => (
                            <circle key={i} cx={`${x/5.6}%`} cy={`${y/3.15}%`} r="3" fill="#00D4FF" opacity="0.8" />
                          ))}
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Artifact markers */}
                  <div className="absolute top-[35%] left-[39%] w-16 h-10 border border-red-500/60 rounded text-[8px] text-red-400 font-mono flex items-end justify-end p-0.5 bg-red-500/5">BND</div>
                  <div className="absolute top-[32%] right-[28%] w-14 h-8 border border-amber-500/60 rounded text-[8px] text-amber-400 font-mono flex items-end justify-end p-0.5 bg-amber-500/5">EYE</div>

                  {/* Overlay label */}
                  <div className="absolute top-3 left-3 bg-[#070A0F]/80 border border-white/[0.1] rounded px-2 py-1 text-[10px] font-mono text-cyan-400">
                    {overlay.toUpperCase()}
                  </div>

                  {/* Frame counter */}
                  <div className="absolute bottom-3 right-3 bg-[#070A0F]/80 border border-white/[0.1] rounded px-2 py-1 text-[10px] font-mono text-slate-400">
                    FRAME 1847 / 5280
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-mono">Forensic Timeline</p>
              <div className="relative h-6 bg-white/[0.04] rounded-full overflow-hidden cursor-pointer"
                onClick={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setTimelinePos(Math.round(((e.clientX - r.left) / r.width) * 100));
                }}
              >
                {timelineEvents.map(ev => (
                  <div
                    key={ev.t}
                    title={ev.label}
                    className={`absolute top-1 w-1 h-4 rounded-full ${
                      ev.type === 'face' ? 'bg-red-500' : ev.type === 'temporal' ? 'bg-violet-500' : ev.type === 'compression' ? 'bg-amber-500' : 'bg-orange-500'
                    }`}
                    style={{ left: `${ev.t}%` }}
                  />
                ))}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-cyan-400"
                  style={{ left: `${timelinePos}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400/10 to-transparent"
                  style={{ width: `${timelinePos}%` }}
                />
              </div>
              <div className="flex gap-3 mt-2">
                {[['red','Face anomaly'],['violet','Temporal'],['amber','Compression'],['orange','Identity']].map(([c,l]) => (
                  <div key={l} className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${c}-500`} />
                    <span className="text-[9px] text-slate-600">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signal evidence */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[13px] font-semibold text-white font-display">Why AuthentiVision Flagged This Media</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Explainable AI signal breakdown</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {signals.map((s, i) => (
                <div key={i} className="px-5 py-4">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-start gap-3 text-left"
                    aria-expanded={expanded === i}
                  >
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider flex-shrink-0 mt-0.5 ${SEVERITY_COLOR[s.severity]}`}>
                      {s.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-200">{s.label}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-white/[0.06] rounded-full max-w-[120px] overflow-hidden">
                          <div className="h-full bg-red-500/70 rounded-full" style={{ width: `${(s.contribution / 34) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{s.contribution}% contribution</span>
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-600 flex-shrink-0 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded === i && (
                    <div className="mt-3 ml-16 text-[12.5px] text-slate-400 leading-relaxed bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
                      {s.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Confidence gauge */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-4">Model Confidence</p>
            <ConfidenceGaugeDetailed value={97.4} />
            <p className="text-[12px] text-slate-500 mt-4 leading-relaxed">
              High confidence classification based on spatial artifacts, facial inconsistencies, and temporal instability.
            </p>
          </div>

          {/* Media info */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
            <h3 className="text-[12px] font-semibold text-white font-display mb-3">Media Information</h3>
            <div className="space-y-2">
              {[
                ['Filename', 'interview_clip.mp4'],
                ['Duration', '3m 42s'],
                ['Resolution', '1920 × 1080'],
                ['FPS', '29.97'],
                ['Codec', 'H.264/AVC'],
                ['File size', '84.2 MB'],
                ['Frames', '6,629'],
                ['Audio', 'AAC · 2ch · 48kHz'],
                ['Hash', 'a3f8e2b1...e4f5'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-600">{k}</span>
                  <span className={`text-[11px] font-mono text-slate-300 truncate max-w-[140px] text-right ${k === 'Hash' ? 'text-cyan-400/70' : ''}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expert mode details */}
          {expertMode && (
            <div className="bg-violet-900/10 border border-violet-400/15 rounded-xl p-5">
              <p className="text-[10px] text-violet-400 font-mono tracking-wider uppercase mb-3">Expert Mode</p>
              <div className="space-y-2">
                {[
                  ['Model', 'AV-DeepNet v2.4.1'],
                  ['Ensemble', '4-model weighted'],
                  ['Embedding dist.', '0.382'],
                  ['Frame score (μ)', '0.947'],
                  ['Frame score (σ)', '0.031'],
                  ['Face detect conf.', '99.1%'],
                  ['Inference time', '12.3s · GPU'],
                  ['Dataset', 'FaceForensics++ v5'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">{k}</span>
                    <span className="text-[11px] font-mono text-violet-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline summary */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
            <h3 className="text-[12px] font-semibold text-white font-display mb-3">Analysis Pipeline</h3>
            <div className="space-y-2">
              {stages.map(s => (
                <div key={s.num} className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-slate-700 w-5 flex-shrink-0">{s.num}</span>
                  <span className="text-[11px] text-slate-400 flex-1">{s.label}</span>
                  <span className="text-[10px] font-mono text-slate-600">{s.time}</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link to="/cases">
              <Button variant="outline" size="sm" className="w-full" icon={<Shield size={13} />}>Assign to Case</Button>
            </Link>
            <Link to="/evidence">
              <Button variant="ghost" size="sm" className="w-full" icon={<Layers size={13} />}>Add to Evidence Vault</Button>
            </Link>
            <Button variant="primary" size="sm" className="w-full" icon={<FileText size={13} />}>Generate Forensic Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  const r = 32, circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center">
      <svg
        width="88"
        height="88"
        viewBox="0 0 88 88"
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#EF4444"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))' }}
        />
      </svg>
      <p className="relative z-10 whitespace-nowrap text-[19px] font-bold leading-none tracking-[-0.04em] text-red-400 font-mono">
        {value.toFixed(1)}%
      </p>
    </div>
  );
}

function ConfidenceGaugeDetailed({ value }: { value: number }) {
  const r = 52, circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative flex h-[150px] w-[150px] items-center justify-center">
      <svg
        width="150"
        height="150"
        viewBox="0 0 150 150"
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke="#EF4444"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.5))' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <p className="whitespace-nowrap text-[31px] font-bold leading-none tracking-[-0.04em] text-red-400 font-mono">
          {value.toFixed(1)}%
        </p>
        <p className="mt-1 text-[9px] text-slate-500 uppercase tracking-[0.12em]">CONFIDENCE</p>
      </div>
    </div>
  );
}
