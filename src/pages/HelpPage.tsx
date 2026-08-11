import { useState } from 'react';
import { ChevronRight, Book, MessageCircle, FileText, ExternalLink } from 'lucide-react';

const sections = [
  { title: 'Getting Started', icon: <Book size={16} />, items: ['How to upload media', 'Running your first analysis', 'Understanding verdicts', 'Confidence scores explained'] },
  { title: 'Analysis', icon: <FileText size={16} />, items: ['Detection modes explained', 'Choosing analysis depth', 'Frame sampling options', 'Understanding the pipeline'] },
  { title: 'Evidence & Cases', icon: <MessageCircle size={16} />, items: ['Creating a case', 'Adding evidence', 'Chain of custody', 'Evidence integrity verification'] },
  { title: 'Reports', icon: <FileText size={16} />, items: ['Generating a report', 'Report sections', 'Export formats', 'Legal considerations'] },
];

export default function HelpPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-5 max-w-[900px] mx-auto">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">System</p>
        <h1 className="text-[22px] font-bold text-white font-display">Help & Documentation</h1>
        <p className="text-[13px] text-slate-500">AuthentiVision platform guide</p>
      </div>

      <div className="bg-amber-400/5 border border-amber-400/15 rounded-xl p-4">
        <p className="text-[12.5px] text-amber-400/90">
          <strong>Demo environment:</strong> This is a simulation. Documentation represents intended platform behavior, not implemented backend functionality.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <div key={s.title} className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
              <span className="text-cyan-400">{s.icon}</span>
              <h2 className="text-[14px] font-semibold text-white font-display">{s.title}</h2>
            </div>
            <ul className="divide-y divide-white/[0.04]">
              {s.items.map(item => (
                <li key={item}>
                  <button
                    onClick={() => setOpen(open === item ? null : item)}
                    className="w-full flex items-center justify-between px-5 py-3 text-[13px] text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors text-left"
                  >
                    {item}
                    <ChevronRight size={13} className={`text-slate-600 transition-transform ${open === item ? 'rotate-90' : ''}`} />
                  </button>
                  {open === item && (
                    <div className="px-5 pb-3">
                      <p className="text-[12.5px] text-slate-500 leading-relaxed">
                        Documentation for "{item}" is available in the full platform documentation. This is a simulation UI — please refer to the academic report for full technical details.
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
        <h2 className="text-[14px] font-semibold text-white font-display mb-3">Quick Reference</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-[12.5px]">
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
            <div className="space-y-1.5">
              {[['⌘K / Ctrl+K', 'Open command palette'], ['?', 'Show shortcuts'], ['N', 'New analysis'], ['D', 'Dashboard']].map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <kbd className="text-[10px] font-mono bg-white/[0.06] border border-white/[0.1] px-1.5 py-0.5 rounded text-slate-400">{k}</kbd>
                  <span className="text-slate-500">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Verdict Guide</p>
            <div className="space-y-1.5">
              {[['Authentic', 'text-emerald-400', 'High confidence natural media'], ['Deepfake', 'text-red-400', 'Synthesized facial content detected'], ['Suspicious', 'text-amber-400', 'Anomalies present, review required'], ['Face Morph', 'text-violet-400', 'Biometric fusion attack detected'], ['Inconclusive', 'text-slate-400', 'Insufficient signal for verdict']].map(([v, c, d]) => (
                <div key={v} className="flex items-start gap-2">
                  <span className={`text-[11px] font-semibold w-20 flex-shrink-0 ${c}`}>{v}</span>
                  <span className="text-slate-500">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
