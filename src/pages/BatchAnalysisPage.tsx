import { useState } from 'react';
import { Upload, Filter } from 'lucide-react';
import { VerdictBadge, RiskBadge, ConfidenceBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const batchFiles = [
  { name: 'interview_01.mp4', type: 'Video', progress: 100, verdict: 'deepfake' as const, confidence: 97.4, risk: 'critical' as const, status: 'complete' },
  { name: 'photo_001.jpg', type: 'Image', progress: 100, verdict: 'authentic' as const, confidence: 91.2, risk: 'low' as const, status: 'complete' },
  { name: 'clip_003.mp4', type: 'Video', progress: 75, verdict: null, confidence: null, risk: null, status: 'processing' },
  { name: 'id_scan.jpg', type: 'Image', progress: 100, verdict: 'face-morph' as const, confidence: 88.6, risk: 'high' as const, status: 'complete' },
  { name: 'social_02.jpg', type: 'Image', progress: 100, verdict: 'suspicious' as const, confidence: 63.4, risk: 'medium' as const, status: 'complete' },
  { name: 'video_long.mp4', type: 'Video', progress: 0, verdict: null, confidence: null, risk: null, status: 'queued' },
];

export default function BatchAnalysisPage() {
  const [search, setSearch] = useState('');

  const total = batchFiles.length;
  const completed = batchFiles.filter(f => f.status === 'complete').length;
  const processing = batchFiles.filter(f => f.status === 'processing').length;
  const flagged = batchFiles.filter(f => f.risk === 'high' || f.risk === 'critical').length;

  return (
    <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Analysis</p>
          <h1 className="text-[22px] font-bold text-white font-display">Batch Analysis</h1>
          <p className="text-[13px] text-slate-500">Multi-file forensic processing workspace</p>
        </div>
        <Button variant="primary" size="sm" icon={<Upload size={13} />}>Add Files</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Total', total, 'text-white'], ['Completed', completed, 'text-emerald-400'], ['Processing', processing, 'text-cyan-400'], ['Flagged', flagged, 'text-red-400']].map(([l, v, c]) => (
          <div key={String(l)} className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-4 text-center">
            <p className={`text-[24px] font-bold font-display ${c}`}>{v}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-slate-400">Overall progress</span>
          <span className="text-[12px] font-mono text-slate-300">{completed}/{total} files</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      </div>

      {/* File table */}
      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="forensic-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Progress</th>
                <th>Detection</th>
                <th>Confidence</th>
                <th>Risk</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batchFiles.map((f, i) => (
                <tr key={i}>
                  <td><span className="text-[13px] text-slate-200">{f.name}</span></td>
                  <td><span className="text-[11px] uppercase tracking-wider text-slate-500">{f.type}</span></td>
                  <td>
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400/70 rounded-full transition-all" style={{ width: `${f.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 w-8 text-right">{f.progress}%</span>
                    </div>
                  </td>
                  <td>{f.verdict ? <VerdictBadge verdict={f.verdict} /> : <span className="text-[12px] text-slate-600">—</span>}</td>
                  <td>{f.confidence ? <ConfidenceBadge confidence={f.confidence} /> : <span className="text-[12px] text-slate-600">—</span>}</td>
                  <td>{f.risk ? <RiskBadge risk={f.risk} /> : <span className="text-[12px] text-slate-600">—</span>}</td>
                  <td>
                    <span className={`text-[12px] font-medium capitalize ${
                      f.status === 'complete' ? 'text-emerald-400' : f.status === 'processing' ? 'text-cyan-400 animate-pulse-glow' : 'text-slate-500'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td>
                    {f.status === 'complete' && <button className="text-[12px] text-cyan-400 hover:text-cyan-300">View</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
