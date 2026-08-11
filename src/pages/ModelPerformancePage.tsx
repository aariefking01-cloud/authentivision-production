import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const versionHistory = [
  { version: 'v2.0', accuracy: 88.2, precision: 85.1, recall: 82.4, f1: 83.7 },
  { version: 'v2.1', accuracy: 90.1, precision: 87.8, recall: 84.9, f1: 86.3 },
  { version: 'v2.2', accuracy: 91.8, precision: 89.3, recall: 86.1, f1: 87.7 },
  { version: 'v2.3', accuracy: 93.0, precision: 90.4, recall: 87.8, f1: 89.0 },
  { version: 'v2.4.1', accuracy: 94.2, precision: 91.8, recall: 88.4, f1: 90.1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141D27] border border-white/[0.1] rounded-lg p-3 shadow-2xl text-[12px]">
      <p className="text-slate-400 mb-1 font-mono">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-mono">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function ModelPerformancePage() {
  const current = versionHistory[versionHistory.length - 1];

  return (
    <div className="p-6 space-y-5 max-w-[1100px] mx-auto">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Intelligence</p>
        <h1 className="text-[22px] font-bold text-white font-display">Model Performance</h1>
        <p className="text-[13px] text-slate-500">AI detection model metrics · <span className="font-mono text-amber-400/70">DEMO / SIMULATION VALUES</span></p>
      </div>

      {/* Current model */}
      <div className="bg-gradient-to-br from-[#0C1118] to-[#0C1020] border border-cyan-400/10 rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-[15px] font-semibold text-white font-display">Current Model: AV-DeepNet</h2>
          <span className="font-mono text-[11px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded">v2.4.1</span>
          <span className="font-mono text-[11px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded">ACTIVE</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Accuracy', `${current.accuracy}%`, '#10B981'],
            ['Precision', `${current.precision}%`, '#10B981'],
            ['Recall', `${current.recall}%`, '#F59E0B'],
            ['F1 Score', `${current.f1}%`, '#10B981'],
            ['AUC-ROC', '96.3%', '#10B981'],
            ['False Pos.', '5.8%', '#EF4444'],
            ['False Neg.', '11.6%', '#EF4444'],
            ['Avg Inference', '12.3s', '#00D4FF'],
          ].map(([k, v, c]) => (
            <div key={k} className="bg-white/[0.03] rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{k}</p>
              <p className="text-[20px] font-bold font-display mt-1" style={{ color: c }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Version history chart */}
      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-white font-display mb-4">Performance Over Versions</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={versionHistory} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <XAxis dataKey="version" tick={{ fill: '#4A5568', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis domain={[80, 96]} tick={{ fill: '#4A5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} name="Accuracy" />
            <Line type="monotone" dataKey="precision" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', r: 3 }} name="Precision" />
            <Line type="monotone" dataKey="recall" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 3 }} name="Recall" />
            <Line type="monotone" dataKey="f1" stroke="#7C3AED" strokeWidth={2} dot={{ fill: '#7C3AED', r: 3 }} name="F1 Score" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-4 justify-center mt-3">
          {[['#10B981','Accuracy'],['#00D4FF','Precision'],['#F59E0B','Recall'],['#7C3AED','F1 Score']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-[11px] text-slate-500">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset info */}
      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-white font-display mb-3">Training Information</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-[12.5px]">
          {[
            ['Dataset', 'FaceForensics++ v5 + custom extensions'],
            ['Training samples', '2.4M frames'],
            ['Test split', '20% held-out'],
            ['Architecture', '4-model ensemble (CNN + Transformer)'],
            ['Last trained', 'Aug 01, 2026'],
            ['Next evaluation', 'Sep 01, 2026'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">{k}</p>
              <p className="text-slate-300">{v}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-mono text-amber-400/60 mt-4 pt-3 border-t border-white/[0.05]">DEMO / SIMULATION DATA — not real operational metrics. Values are illustrative only.</p>
      </div>
    </div>
  );
}
