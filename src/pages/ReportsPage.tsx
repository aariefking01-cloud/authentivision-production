import { useState } from 'react';
import { FileText, Download, Eye, Plus, File } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RiskBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

const reports = [
  { id: 'RPT-0047', title: 'Operation Mirage — Deepfake Analysis', case: 'CASE-0092', verdict: 'Deepfake Confirmed', risk: 'critical' as const, generated: 'Aug 10, 2026', analyst: 'M. Okonkwo', pages: 18 },
  { id: 'RPT-0046', title: 'Identity Fraud Ring — Face Morph Analysis', case: 'CASE-0091', verdict: 'Face Morphing Detected', risk: 'high' as const, generated: 'Aug 09, 2026', analyst: 'S. Reyes', pages: 12 },
  { id: 'RPT-0045', title: 'Media Verification Batch — Full Report', case: 'CASE-0090', verdict: 'Mixed Results', risk: 'medium' as const, generated: 'Aug 08, 2026', analyst: 'L. Nakamura', pages: 34 },
  { id: 'RPT-0044', title: 'Credential Fraud Investigation', case: 'CASE-0088', verdict: 'Manipulation Confirmed', risk: 'high' as const, generated: 'Jul 16, 2026', analyst: 'S. Reyes', pages: 9 },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setShowBuilder(false); }, 1500);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Evidence</p>
          <h1 className="text-[22px] font-bold text-white font-display">Forensic Reports</h1>
          <p className="text-[13px] text-slate-500">Generated investigation reports · {reports.length} total</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowBuilder(o => !o)}>
          Generate Report
        </Button>
      </div>

      {/* Report builder */}
      {showBuilder && (
        <div className="bg-[#0C1118] border border-cyan-400/15 rounded-xl p-5 space-y-4">
          <h2 className="text-[14px] font-semibold text-white font-display">Generate Forensic Report</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-2">Select Analysis</label>
              <select className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[13px] text-slate-300 focus:outline-none focus:border-cyan-400/40">
                <option>AV-2026-00481 — interview_clip.mp4</option>
                <option>AV-2026-00480 — press_conference.mp4</option>
                <option>AV-2026-00479 — passport_photo.jpg</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-2">Format</label>
              <div className="flex gap-2">
                {['PDF', 'JSON', 'CSV'].map(fmt => (
                  <button key={fmt} className="px-3 py-2 rounded-md border border-white/[0.07] text-[12.5px] text-slate-400 hover:border-cyan-400/30 hover:text-cyan-400 transition-all">
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Report Sections</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Executive Summary', 'Media Information', 'Analysis Config', 'Detection Result', 'Confidence', 'Evidence', 'Visual Findings', 'Model Info', 'Technical Findings', 'Timeline', 'Integrity', 'Conclusion'].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-white/20 accent-cyan-400" />
                  <span className="text-[12px] text-slate-400">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" size="sm" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating…' : 'Generate Report'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowBuilder(false)}>Cancel</Button>
            <p className="text-[11px] text-slate-600 self-center ml-2 font-mono">SIMULATION — export is simulated</p>
          </div>
        </div>
      )}

      {/* Reports list */}
      {reports.length === 0 ? (
        <EmptyState icon={<FileText size={24} />} title="No reports yet" description="Generate a forensic report from a completed analysis." action={{ label: 'Generate Report', onClick: () => setShowBuilder(true) }} />
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 hover:border-white/[0.12] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-cyan-400/70">{r.id}</span>
                    <RiskBadge risk={r.risk} />
                    <span className="font-mono text-[10px] text-slate-600">{r.case}</span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-white font-display">{r.title}</h3>
                  <p className="text-[12px] text-slate-500 mt-1">Verdict: <span className="text-slate-300">{r.verdict}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right mr-3 hidden sm:block">
                    <p className="text-[11px] text-slate-500 font-mono">{r.generated}</p>
                    <p className="text-[11px] text-slate-600">{r.analyst} · {r.pages} pages</p>
                  </div>
                  <Button variant="ghost" size="sm" icon={<Eye size={13} />}>View</Button>
                  <Button variant="outline" size="sm" icon={<Download size={13} />}>Export</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
