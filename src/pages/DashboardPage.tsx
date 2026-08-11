import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Upload, FolderOpen, FileText, Activity, Shield, Eye, Layers, AlertTriangle, CheckCircle2, Cpu } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { VerdictBadge, RiskBadge, StatusBadge, ConfidenceBadge, SystemStatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { kpiData, recentAnalyses, activityChartData, systemComponents } from '../data/mockData';

type TimeRange = '24H' | '7D' | '30D' | '90D' | '1Y';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141D27] border border-white/[0.1] rounded-lg p-3 shadow-2xl">
      <p className="text-[11px] text-slate-500 font-mono mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-[12px]">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span className="text-white font-semibold font-mono">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const chartData = activityChartData[timeRange];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Overview</p>
          <h1 className="text-[22px] font-bold text-white font-display">Media Forensics Overview</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Monitor authenticity investigations, detection activity, and forensic intelligence.</p>
        </div>
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Link to="/analysis/new">
            <Button variant="primary" size="sm" icon={<Plus size={13} />}>New Analysis</Button>
          </Link>
          <Button variant="outline" size="sm" icon={<Upload size={13} />}>Upload Media</Button>
          <Button variant="outline" size="sm" icon={<FolderOpen size={13} />} className="hidden sm:inline-flex">Create Case</Button>
          <Button variant="ghost" size="sm" icon={<FileText size={13} />} className="hidden lg:inline-flex">Reports</Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard label="Total Analyses" value={kpiData.totalAnalyses} accent="text-white" icon={<Activity size={14} />} trend={{ value: '4.2%', up: true }} />
        <MetricCard label="Authentic" value={kpiData.authentic} accent="text-emerald-400" icon={<CheckCircle2 size={14} />} />
        <MetricCard label="Suspicious" value={kpiData.suspicious} accent="text-amber-400" icon={<AlertTriangle size={14} />} />
        <MetricCard label="Deepfakes" value={kpiData.deepfakes} accent="text-red-400" icon={<Eye size={14} />} />
        <MetricCard label="Face Morphs" value={kpiData.faceMorphs} accent="text-violet-400" icon={<Shield size={14} />} />
        <MetricCard label="Avg Confidence" value={`${kpiData.avgConfidence}%`} accent="text-cyan-400" icon={<Cpu size={14} />} sub="DEMO DATA" />
      </div>

      {/* Main content grid */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Activity chart */}
        <div className="xl:col-span-2 bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-[14px] font-semibold text-white font-display">Authenticity Detection Activity</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Detection classifications over time · <span className="font-mono text-amber-400/70">DEMO DATA</span></p>
            </div>
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-md p-0.5">
              {(['24H', '7D', '30D', '90D', '1Y'] as TimeRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all ${
                    timeRange === r ? 'bg-cyan-400/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="authentic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="suspicious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="deepfake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="faceMorph" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#4A5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4A5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="authentic" stroke="#10B981" strokeWidth={1.5} fill="url(#authentic)" name="Authentic" />
              <Area type="monotone" dataKey="suspicious" stroke="#F59E0B" strokeWidth={1.5} fill="url(#suspicious)" name="Suspicious" />
              <Area type="monotone" dataKey="deepfake" stroke="#EF4444" strokeWidth={1.5} fill="url(#deepfake)" name="Deepfake" />
              <Area type="monotone" dataKey="faceMorph" stroke="#7C3AED" strokeWidth={1.5} fill="url(#faceMorph)" name="Face Morph" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-3 justify-center">
            {[['#10B981','Authentic'],['#F59E0B','Suspicious'],['#EF4444','Deepfake'],['#7C3AED','Face Morph']].map(([color,label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[11px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk panel + System health */}
        <div className="flex flex-col gap-5">
          <RiskLandscape />
          <SystemHealth />
        </div>
      </div>

      {/* Recent analyses */}
      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[14px] font-semibold text-white font-display">Recent Analyses</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Latest forensic investigations</p>
          </div>
          <Link to="/analysis/history" className="text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Media</th>
                <th>Type</th>
                <th>Detection</th>
                <th>Confidence</th>
                <th>Risk</th>
                <th>Analyzed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalyses.map(a => (
                <tr key={a.id}>
                  <td><span className="font-mono text-[12px] text-cyan-400/80">{a.id}</span></td>
                  <td>
                    <div className="max-w-[160px] truncate text-[13px] text-slate-200" title={a.filename}>
                      {a.filename}
                    </div>
                  </td>
                  <td><span className="text-[11px] uppercase tracking-wider text-slate-500">{a.mediaType}</span></td>
                  <td><VerdictBadge verdict={a.verdict} /></td>
                  <td><ConfidenceBadge confidence={a.confidence} /></td>
                  <td><RiskBadge risk={a.risk} /></td>
                  <td><span className="text-[12px] text-slate-500 font-mono">{a.analyzedAt}</span></td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <Link to={`/analysis/${a.id}`} className="text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                      View
                    </Link>
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

function RiskLandscape() {
  const risks = [
    { label: 'Critical', count: 3, pct: 18, color: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'High', count: 8, pct: 47, color: '#F97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Medium', count: 14, pct: 82, color: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Low', count: 42, pct: 100, color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-white font-display">Current Risk Landscape</h2>
        <p className="text-[11px] text-slate-500">Active investigation risk distribution · <span className="font-mono text-amber-400/70">DEMO</span></p>
      </div>
      <div className="space-y-3">
        {risks.map(r => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                <span className="text-[12px] text-slate-400">{r.label}</span>
              </div>
              <span className="text-[12px] font-mono text-slate-400">{r.count}</span>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${r.pct}%`, background: r.color + '90' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3">
        <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 text-center">
          <p className="text-[22px] font-bold text-red-400 font-display">3</p>
          <p className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">Critical Active</p>
        </div>
        <div className="bg-cyan-400/5 border border-cyan-400/15 rounded-lg p-3 text-center">
          <p className="text-[22px] font-bold text-cyan-400 font-display">67</p>
          <p className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">Total Open</p>
        </div>
      </div>
    </div>
  );
}

function SystemHealth() {
  return (
    <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 flex-1">
      <h2 className="text-[14px] font-semibold text-white font-display mb-4">System Health</h2>
      <div className="space-y-3">
        {systemComponents.map(sc => (
          <div key={sc.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <SystemStatusBadge status={sc.status} />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {sc.latency && <span className="text-[10px] font-mono text-slate-600">{sc.latency}</span>}
              <span className="text-[11px] text-slate-500 hidden sm:block max-w-[100px] truncate">{sc.name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/[0.05]">
        {systemComponents.map(sc => (
          <div key={sc.name} className="flex items-center gap-2 mb-2">
            <span className="text-[11px] text-slate-500 w-28 truncate">{sc.name}</span>
            {sc.load !== undefined && (
              <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${sc.load > 80 ? 'bg-amber-500' : 'bg-cyan-500/60'}`}
                  style={{ width: `${sc.load}%` }}
                />
              </div>
            )}
            {sc.load !== undefined && <span className="text-[10px] font-mono text-slate-600 w-8 text-right">{sc.load}%</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
