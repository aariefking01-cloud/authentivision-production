import { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { Button } from '../components/ui/Button';

const factors = [
  { label: 'Landmark distortion', score: 0.87, color: '#EF4444' },
  { label: 'Texture blending', score: 0.74, color: '#F97316' },
  { label: 'Identity embedding conflict', score: 0.91, color: '#EF4444' },
  { label: 'Boundary artifacts', score: 0.68, color: '#F59E0B' },
  { label: 'Skin consistency', score: 0.52, color: '#F59E0B' },
  { label: 'Lighting inconsistency', score: 0.41, color: '#64748B' },
];

const landmarkGroups = [
  { label: 'Eyes', x: 90, y: 80 }, { label: 'Nose', x: 130, y: 120 }, { label: 'Mouth', x: 130, y: 158 },
  { label: 'Jaw', x: 130, y: 190 }, { label: 'L Eye', x: 100, y: 85 }, { label: 'R Eye', x: 158, y: 85 },
];

export default function FaceMorphPage() {
  const [analyzed, setAnalyzed] = useState(true);

  return (
    <div className="p-6 space-y-5 max-w-[1100px] mx-auto">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Analysis</p>
        <h1 className="text-[22px] font-bold text-white font-display">Face Morph Analysis</h1>
        <p className="text-[13px] text-slate-500">Biometric fusion attack and morphing detection</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Upload / viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-white font-display">Face Landmark Visualization</h2>
              <span className="text-[10px] font-mono text-cyan-400">BIOMETRIC TENSOR AUDIT</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-0.5 bg-white/[0.04]">
              {/* Original */}
              <div className="bg-[#0A0F17] p-4">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-3 font-mono">Original</p>
                <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-square max-w-[240px] mx-auto">
                  <svg viewBox="0 0 260 260" className="w-full h-full">
                    <ellipse cx="130" cy="120" rx="60" ry="80" fill="rgba(100,116,139,0.15)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    {landmarkGroups.map((lm, i) => (
                      <circle key={i} cx={lm.x} cy={lm.y} r="3" fill="rgba(0,212,255,0.8)" />
                    ))}
                    {[[100,85,158,85],[100,85,130,120],[158,85,130,120],[130,120,130,158]].map(([x1,y1,x2,y2],i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,212,255,0.2)" strokeWidth="0.8" />
                    ))}
                  </svg>
                  <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-500">REFERENCE</div>
                </div>
              </div>
              {/* Analyzed */}
              <div className="bg-[#0A0F17] p-4">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-3 font-mono">Analyzed (Suspected Morph)</p>
                <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-square max-w-[240px] mx-auto">
                  <svg viewBox="0 0 260 260" className="w-full h-full">
                    <ellipse cx="130" cy="122" rx="62" ry="78" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.2)" strokeWidth="1" />
                    {/* Shifted landmarks showing distortion */}
                    {[[97,88],[162,84],[132,119],[133,161],[68,80],[199,76]].map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill="rgba(239,68,68,0.9)" />
                    ))}
                    {/* Anomaly highlight */}
                    <rect x="88" y="74" width="32" height="22" rx="3" stroke="rgba(239,68,68,0.6)" strokeWidth="1" fill="rgba(239,68,68,0.06)" />
                    <rect x="148" y="72" width="32" height="22" rx="3" stroke="rgba(239,68,68,0.6)" strokeWidth="1" fill="rgba(239,68,68,0.06)" />
                  </svg>
                  <div className="absolute bottom-2 left-2 text-[8px] font-mono text-red-500">MORPH DETECTED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis factors */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-white font-display mb-4">Analysis Factors</h3>
            <div className="space-y-3">
              {factors.map(f => (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12.5px] text-slate-300">{f.label}</span>
                    <span className="text-[12px] font-mono font-semibold" style={{ color: f.color }}>{(f.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${f.score * 100}%`, background: f.color + '90' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#0C1118] to-[#100A0A] border border-red-500/15 rounded-xl p-5 text-center">
            <p className="text-[9px] font-mono text-slate-600 tracking-[0.15em] uppercase mb-3">Morphing Risk</p>
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg viewBox="0 0 112 112" className="-rotate-90 w-full h-full">
                <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="56" cy="56" r="44" fill="none" stroke="#EF4444" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - 0.928)}`}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[26px] font-bold text-red-400 font-mono leading-none">92.8%</span>
              </div>
            </div>
            <p className="text-[13px] font-semibold text-red-400 font-mono">HIGH RISK</p>
            <p className="text-[11px] text-slate-500 mt-1">Morphing artifacts confirmed</p>
          </div>

          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
            <h3 className="text-[12px] font-semibold text-white font-display mb-3">Detection Metrics</h3>
            <div className="space-y-2">
              {[
                ['Morph Probability', '92.8%', 'text-red-400'],
                ['Identity Similarity', '41.2%', 'text-amber-400'],
                ['Landmark Deviation', '0.34 px avg', 'text-orange-400'],
                ['Texture Anomaly', '74.1%', 'text-orange-400'],
                ['Embedding Distance', '0.68', 'text-red-400'],
                ['Face Detect Conf.', '99.1%', 'text-emerald-400'],
              ].map(([k, v, c]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[11.5px] text-slate-500">{k}</span>
                  <span className={`text-[12px] font-mono font-semibold ${c}`}>{v}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-3 pt-3 border-t border-white/[0.05]">LANDMARK DRIFT · EMBEDDING MANIFOLD CALIBRATION</p>
          </div>

          <Button variant="primary" size="sm" className="w-full">Generate Morph Report</Button>
          <Button variant="outline" size="sm" className="w-full" icon={<Upload size={13} />}>Upload New Image</Button>
        </div>
      </div>
    </div>
  );
}
