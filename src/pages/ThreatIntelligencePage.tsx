import { AlertTriangle, TrendingUp, Shield, Eye } from 'lucide-react';

const threats = [
  { id: 'THR-0041', pattern: 'GAN-based face reenactment', trend: 'Rising', severity: 'critical', frequency: 284, signature: 'Temporal boundary flicker at 8–12Hz, embedding shift >0.3' },
  { id: 'THR-0040', pattern: 'Face morph passport fraud', trend: 'Stable', severity: 'high', frequency: 147, signature: 'Alpha-blending seams at facial midline, landmark deviation >0.25px' },
  { id: 'THR-0039', pattern: 'Audio-visual sync deepfake', trend: 'Rising', severity: 'high', frequency: 98, signature: 'Lip-sync latency 40–80ms, phoneme-lip mismatch index >0.4' },
  { id: 'THR-0038', pattern: 'Identity swap video', trend: 'Declining', severity: 'medium', frequency: 62, signature: 'Skin tone gradient discontinuity at face boundary, texture entropy delta >1.8' },
  { id: 'THR-0037', pattern: 'Synthetic document manipulation', trend: 'Stable', severity: 'medium', frequency: 51, signature: 'Metadata timestamp inconsistency, compression profile mismatch' },
];

const sevColor: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  low: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

const trendColor: Record<string, string> = {
  Rising: 'text-red-400',
  Stable: 'text-amber-400',
  Declining: 'text-emerald-400',
};

export default function ThreatIntelligencePage() {
  return (
    <div className="p-6 space-y-5 max-w-[1100px] mx-auto">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Intelligence</p>
        <h1 className="text-[22px] font-bold text-white font-display">Threat Intelligence</h1>
        <p className="text-[13px] text-slate-500">Emerging manipulation patterns and risk categories · <span className="font-mono text-amber-400/70">DEMO / SIMULATED DATA</span></p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Active Threats', '5', <AlertTriangle size={14} />, 'text-red-400'],
          ['Rising Patterns', '2', <TrendingUp size={14} />, 'text-orange-400'],
          ['Signatures', '127', <Shield size={14} />, 'text-cyan-400'],
          ['Monitored', '12,842', <Eye size={14} />, 'text-violet-400'],
        ].map(([l, v, icon, c]: any) => (
          <div key={l} className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{l}</span>
              <span className={c}>{icon}</span>
            </div>
            <p className={`text-[24px] font-bold font-display ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {/* Threat patterns */}
      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[14px] font-semibold text-white font-display">Active Threat Patterns</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Simulated intelligence feed — not operational data</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {threats.map(t => (
            <div key={t.id} className="p-5 hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <span className="font-mono text-[11px] text-cyan-400/60">{t.id}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${sevColor[t.severity]}`}>{t.severity}</span>
                <span className={`text-[12px] font-medium ${trendColor[t.trend]}`}>↗ {t.trend}</span>
                <span className="ml-auto text-[11px] font-mono text-slate-500">{t.frequency} detections</span>
              </div>
              <h3 className="text-[14px] font-semibold text-white font-display mb-1.5">{t.pattern}</h3>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-md px-3 py-2 mt-2">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 font-mono">Signature</p>
                <p className="text-[12px] text-slate-400 font-mono">{t.signature}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
