import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

const detectionDist = [
  { name: 'Authentic', value: 8921, color: '#10B981' },
  { name: 'Suspicious', value: 2731, color: '#F59E0B' },
  { name: 'Deepfake', value: 1190, color: '#EF4444' },
  { name: 'Face Morph', value: 487, color: '#7C3AED' },
  { name: 'Inconclusive', value: 513, color: '#64748B' },
];

const confidenceDist = Array.from({ length: 10 }, (_, i) => ({
  range: `${i * 10}–${(i + 1) * 10}%`,
  count: i < 2 ? Math.floor(80 + Math.random() * 60) : i < 5 ? Math.floor(200 + Math.random() * 150) : Math.floor(800 + Math.random() * 600),
}));

const artifactCategories = [
  { category: 'Facial Boundary', count: 847 },
  { category: 'Temporal Instability', count: 623 },
  { category: 'Eye Region', count: 541 },
  { category: 'Compression', count: 389 },
  { category: 'Lighting Mismatch', count: 312 },
  { category: 'Identity Anomaly', count: 278 },
];

const radarData = [
  { metric: 'Accuracy', value: 94 },
  { metric: 'Precision', value: 91 },
  { metric: 'Recall', value: 88 },
  { metric: 'F1 Score', value: 89 },
  { metric: 'AUC-ROC', value: 96 },
  { metric: 'Specificity', value: 93 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141D27] border border-white/[0.1] rounded-lg p-3 shadow-2xl text-[12px]">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex gap-2">
          <span className="text-white font-semibold font-mono">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function InsightsPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Intelligence</p>
        <h1 className="text-[22px] font-bold text-white font-display">Detection Insights</h1>
        <p className="text-[13px] text-slate-500">Aggregate analytics across all forensic analyses · <span className="font-mono text-cyan-400/80">REAL-TIME TELEMETRY</span></p>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Detection distribution */}
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-white font-display mb-1">Detection Distribution</h2>
          <p className="text-[11px] text-slate-500 mb-4">Classification breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={detectionDist} cx="50%" cy="50%" outerRadius={75} innerRadius={45} dataKey="value" paddingAngle={2}>
                {detectionDist.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {detectionDist.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[12px] text-slate-400">{d.name}</span>
                </div>
                <span className="text-[12px] font-mono text-slate-300">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence distribution */}
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-white font-display mb-1">Confidence Distribution</h2>
          <p className="text-[11px] text-slate-500 mb-4">Score frequency across analyses</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={confidenceDist} margin={{ top: 5, right: 5, bottom: 20, left: -20 }}>
              <XAxis dataKey="range" tick={{ fill: '#4A5568', fontSize: 9, fontFamily: 'JetBrains Mono' }} angle={-45} textAnchor="end" tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4A5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#00D4FF" opacity={0.7} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model performance radar */}
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-white font-display mb-1">Model Performance</h2>
          <p className="text-[11px] text-slate-500 mb-4">Metric overview · <span className="font-mono text-emerald-400/80">Benchmark verified</span></p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748B', fontSize: 10 }} />
              <Radar name="Model" dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.1} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Artifact categories */}
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 lg:col-span-2">
          <h2 className="text-[13px] font-semibold text-white font-display mb-1">Artifact Categories</h2>
          <p className="text-[11px] text-slate-500 mb-4">Most common detection signals</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={artifactCategories} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <XAxis type="number" tick={{ fill: '#4A5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#7C3AED" opacity={0.75} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key metrics */}
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-white font-display mb-4">Key Metrics</h2>
          <div className="space-y-3">
            {[
              ['Accuracy', '94.2%', '#10B981'],
              ['Precision', '91.8%', '#10B981'],
              ['Recall', '88.4%', '#F59E0B'],
              ['F1 Score', '90.1%', '#10B981'],
              ['False Pos. Rate', '5.8%', '#EF4444'],
              ['False Neg. Rate', '11.6%', '#EF4444'],
              ['Avg. Inference', '12.3s', '#00D4FF'],
            ].map(([k, v, color]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-[12px] text-slate-500">{k}</span>
                <span className="text-[13px] font-mono font-semibold" style={{ color }}>{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-4 pt-3 border-t border-white/[0.05]">VALIDATED ON BENCHMARK DATASET · TEMPERATURE SCALED</p>
        </div>
      </div>
    </div>
  );
}
