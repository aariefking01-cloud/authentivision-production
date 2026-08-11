import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { VerdictBadge, RiskBadge, StatusBadge, ConfidenceBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { recentAnalyses } from '../data/mockData';

type ViewMode = 'table' | 'grid';

export default function AnalysisHistoryPage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterVerdict, setFilterVerdict] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  const allAnalyses = [...recentAnalyses, ...recentAnalyses.map(a => ({ ...a, id: a.id + '-b', analyzedAt: 'yesterday' }))];

  const filtered = allAnalyses.filter(a => {
    const matchSearch = search === '' || a.filename.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchVerdict = filterVerdict === 'all' || a.verdict === filterVerdict;
    const matchRisk = filterRisk === 'all' || a.risk === filterRisk;
    return matchSearch && matchVerdict && matchRisk;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Analysis</p>
          <h1 className="text-[22px] font-bold text-white font-display">Analysis History</h1>
          <p className="text-[13px] text-slate-500">All forensic investigations · <span className="font-mono">{allAnalyses.length}</span> total</p>
        </div>
        <Link to="/analysis/new">
          <Button variant="primary" size="sm">New Analysis</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search analyses…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 py-2 text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/40"
          />
        </div>
        <select
          value={filterVerdict}
          onChange={e => setFilterVerdict(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[12.5px] text-slate-300 focus:outline-none focus:border-cyan-400/40"
          aria-label="Filter by verdict"
        >
          <option value="all">All Verdicts</option>
          <option value="authentic">Authentic</option>
          <option value="deepfake">Deepfake</option>
          <option value="suspicious">Suspicious</option>
          <option value="face-morph">Face Morph</option>
          <option value="inconclusive">Inconclusive</option>
        </select>
        <select
          value={filterRisk}
          onChange={e => setFilterRisk(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[12.5px] text-slate-300 focus:outline-none focus:border-cyan-400/40"
          aria-label="Filter by risk"
        >
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-md p-0.5 self-start">
          <button onClick={() => setViewMode('table')} className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`} aria-label="Table view">
            <List size={14} />
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`} aria-label="Grid view">
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
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
                  <th>Analyst</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><span className="font-mono text-[12px] text-cyan-400/80">{a.id}</span></td>
                    <td><div className="max-w-[140px] truncate text-[13px] text-slate-200">{a.filename}</div></td>
                    <td><span className="text-[11px] uppercase tracking-wider text-slate-500">{a.mediaType}</span></td>
                    <td><VerdictBadge verdict={a.verdict} /></td>
                    <td><ConfidenceBadge confidence={a.confidence} /></td>
                    <td><RiskBadge risk={a.risk} /></td>
                    <td><span className="text-[12px] text-slate-500 font-mono">{a.analyzedAt}</span></td>
                    <td><span className="text-[12px] text-slate-400">{a.analyst}</span></td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <Link to={`/analysis/${a.id}`} className="text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between text-[12px] text-slate-500">
            <span>Showing {filtered.length} of {allAnalyses.length} analyses</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-white/[0.07] hover:border-white/[0.15] text-slate-400 hover:text-white transition-colors disabled:opacity-40" disabled>Prev</button>
              <button className="px-3 py-1 rounded border border-white/[0.07] hover:border-white/[0.15] text-slate-400 hover:text-white transition-colors">Next</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(a => (
            <Link key={a.id} to={`/analysis/${a.id}`} className="block bg-[#0C1118] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.15] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <VerdictBadge verdict={a.verdict} />
                <RiskBadge risk={a.risk} />
              </div>
              <p className="text-[13px] font-medium text-slate-200 truncate mb-1">{a.filename}</p>
              <p className="text-[11px] font-mono text-cyan-400/70 mb-3">{a.id}</p>
              <div className="flex items-center justify-between">
                <ConfidenceBadge confidence={a.confidence} />
                <span className="text-[11px] text-slate-500 font-mono">{a.analyzedAt}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
