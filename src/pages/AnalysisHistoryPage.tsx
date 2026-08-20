import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, LayoutGrid, List, Trash2, RefreshCw, Film, Image as ImageIcon,
  ChevronLeft, ChevronRight, Database, CheckCircle2
} from 'lucide-react';
import { VerdictBadge, RiskBadge, StatusBadge, ConfidenceBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getAnalysisHistory, deleteAnalysis, subscribeToAnalyses } from '../lib/av/services';
import type { AnalysisRecord } from '../lib/av/types';

type ViewMode = 'table' | 'grid';

export default function AnalysisHistoryPage() {
  const [analysesList, setAnalysesList] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterVerdict, setFilterVerdict] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterKind, setFilterKind] = useState<'all' | 'video' | 'image'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    getAnalysisHistory().then(data => {
      setAnalysesList(data);
      setLoading(false);
    });

    // Real-time Firestore sync
    const unsubscribe = subscribeToAnalyses((records) => {
      setAnalysesList(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete forensic analysis record ${id}?`)) {
      return;
    }
    setDeletingId(id);
    await deleteAnalysis(id);
    setAnalysesList(prev => prev.filter(a => a.id !== id));
    setDeletingId(null);
  };

  const filtered = analysesList.filter(a => {
    const matchSearch = search === '' || 
      a.filename.toLowerCase().includes(search.toLowerCase()) || 
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      (a.caseId && a.caseId.toLowerCase().includes(search.toLowerCase()));
    const matchVerdict = filterVerdict === 'all' || a.verdict === filterVerdict;
    const matchRisk = filterRisk === 'all' || a.risk === filterRisk;
    const matchKind = filterKind === 'all' || a.kind === filterKind;
    return matchSearch && matchVerdict && matchRisk && matchKind;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-[0.12em] font-mono">FIRESTORE VAULT</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
              <CheckCircle2 size={10} /> SYNCED
            </span>
          </div>
          <h1 className="text-[22px] font-bold text-white font-display">Forensic Analysis History</h1>
          <p className="text-[13px] text-slate-500">
            Persistent multimodal case files and model detections · <span className="font-mono text-cyan-400">{analysesList.length}</span> records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/analysis/new">
            <Button variant="primary" size="sm">New Analysis</Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by file, case ID, or analysis ID…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 py-2 text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/40"
          />
        </div>

        {/* Media Kind Filter */}
        <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-md p-0.5">
          <button
            onClick={() => { setFilterKind('all'); setCurrentPage(1); }}
            className={`px-2.5 py-1 text-[11px] font-medium rounded ${filterKind === 'all' ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            All
          </button>
          <button
            onClick={() => { setFilterKind('image'); setCurrentPage(1); }}
            className={`px-2.5 py-1 text-[11px] font-medium rounded flex items-center gap-1 ${filterKind === 'image' ? 'bg-white/[0.08] text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ImageIcon size={11} /> Image
          </button>
          <button
            onClick={() => { setFilterKind('video'); setCurrentPage(1); }}
            className={`px-2.5 py-1 text-[11px] font-medium rounded flex items-center gap-1 ${filterKind === 'video' ? 'bg-white/[0.08] text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Film size={11} /> Video
          </button>
        </div>

        <select
          value={filterVerdict}
          onChange={e => { setFilterVerdict(e.target.value); setCurrentPage(1); }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[12.5px] text-slate-300 focus:outline-none focus:border-cyan-400/40"
          aria-label="Filter by verdict"
        >
          <option value="all">All Classifications</option>
          <option value="authentic">Authentic</option>
          <option value="deepfake">Deepfake</option>
          <option value="suspicious">Suspicious</option>
          <option value="morph">Face Morph</option>
          <option value="inconclusive">Inconclusive</option>
        </select>

        <select
          value={filterRisk}
          onChange={e => { setFilterRisk(e.target.value); setCurrentPage(1); }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[12.5px] text-slate-300 focus:outline-none focus:border-cyan-400/40"
          aria-label="Filter by risk"
        >
          <option value="all">All Risk Tiers</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-md p-0.5 ml-auto">
          <button 
            onClick={() => setViewMode('table')} 
            className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`} 
            aria-label="Table view"
          >
            <List size={14} />
          </button>
          <button 
            onClick={() => setViewMode('grid')} 
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`} 
            aria-label="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-[12px] flex items-center justify-center gap-2">
          <RefreshCw size={14} className="animate-spin text-cyan-400" />
          Loading forensic vault from Firestore database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-12 text-center space-y-3">
          <Database size={28} className="mx-auto text-slate-600" />
          <p className="text-slate-300 font-medium text-[15px]">No analyses match current filters</p>
          <p className="text-slate-500 text-[13px] max-w-sm mx-auto">
            Try adjusting your search criteria or ingest a new image or video for forensic evaluation.
          </p>
          <Link to="/analysis/new" className="inline-block pt-2">
            <Button variant="primary" size="sm">Ingest New Media</Button>
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="forensic-table">
              <thead>
                <tr>
                  <th>Analysis ID</th>
                  <th>Media File</th>
                  <th>Type</th>
                  <th>Classification</th>
                  <th>Confidence</th>
                  <th>Risk Tier</th>
                  <th>Case Docket</th>
                  <th>Date Recorded</th>
                  <th>Analyst</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td>
                      <Link to={`/analysis/${a.id}`} className="font-mono text-[12px] text-cyan-400 hover:underline">
                        {a.id}
                      </Link>
                    </td>
                    <td>
                      <div className="max-w-[180px] truncate text-[13px] text-slate-200 font-medium" title={a.filename}>
                        {a.filename}
                      </div>
                    </td>
                    <td>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                        {a.kind === 'video' ? <Film size={11} className="text-cyan-400" /> : <ImageIcon size={11} className="text-emerald-400" />}
                        {a.kind}
                      </span>
                    </td>
                    <td><VerdictBadge verdict={a.verdict} /></td>
                    <td><ConfidenceBadge confidence={a.confidence} /></td>
                    <td><RiskBadge risk={a.risk} /></td>
                    <td>
                      <span className="font-mono text-[11px] text-slate-400">{a.caseId || 'CASE-104'}</span>
                    </td>
                    <td><span className="text-[12px] text-slate-400 font-mono">{new Date(a.analyzedAt || '').toLocaleDateString()}</span></td>
                    <td><span className="text-[12px] text-slate-400">{a.analyst || 'System'}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link to={`/analysis/${a.id}`} className="text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                          Inspect
                        </Link>
                        <button
                          onClick={(e) => handleDelete(a.id, e)}
                          disabled={deletingId === a.id}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded"
                          title="Delete Analysis"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="px-5 py-3.5 border-t border-white/[0.06] flex items-center justify-between text-[12px] text-slate-400">
            <span>
              Showing <span className="text-slate-200 font-mono">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="text-slate-200 font-mono">{Math.min(currentPage * pageSize, filtered.length)}</span> of{' '}
              <span className="text-slate-200 font-mono">{filtered.length}</span> analyses
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded bg-white/[0.03] border border-white/[0.06] disabled:opacity-30 hover:bg-white/[0.08] text-slate-300"
                aria-label="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono text-[11px] px-2 text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded bg-white/[0.03] border border-white/[0.06] disabled:opacity-30 hover:bg-white/[0.08] text-slate-300"
                aria-label="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map(a => (
              <Link 
                key={a.id} 
                to={`/analysis/${a.id}`} 
                className="block bg-[#0C1118] border border-white/[0.07] rounded-xl p-4 hover:border-cyan-500/40 hover:bg-white/[0.02] transition-all group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <VerdictBadge verdict={a.verdict} />
                  <RiskBadge risk={a.risk} />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mb-1">
                  {a.kind === 'video' ? <Film size={11} className="text-cyan-400" /> : <ImageIcon size={11} className="text-emerald-400" />}
                  <span className="uppercase">{a.kind}</span> · {a.caseId || 'CASE-104'}
                </div>
                <p className="text-[13px] font-medium text-slate-200 truncate mb-1 group-hover:text-cyan-300 transition-colors">
                  {a.filename}
                </p>
                <p className="text-[11px] font-mono text-cyan-400/70 mb-3">{a.id}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <ConfidenceBadge confidence={a.confidence} />
                  <span className="text-[11px] text-slate-500 font-mono">{new Date(a.analyzedAt || '').toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Grid pagination */}
          <div className="flex items-center justify-between pt-3 text-[12px] text-slate-400">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
