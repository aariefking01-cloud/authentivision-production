import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, FolderOpen, X, Check } from 'lucide-react';
import { RiskBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { getCases } from '../lib/av/services';
import { createCaseInFirestore } from '../lib/firebase/firestore';
import { useAuth } from '../lib/firebase/auth';
import type { CaseRecord, CaseStatus } from '../lib/av/types';

export default function CasesPage() {
  const { profile } = useAuth();
  const [casesList, setCasesList] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

  // New Case Modal state
  const [showModal, setShowModal] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [caseDesc, setCaseDesc] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    setLoading(true);
    const data = await getCases();
    setCasesList(data);
    setLoading(false);
  }

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName) return;
    setCreating(true);
    const caseId = `CASE-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: CaseRecord = {
      id: caseId,
      name: caseName,
      description: caseDesc || 'Digital forensic investigation into suspicious media content.',
      status: 'open',
      priority,
      investigator: profile?.displayName || 'M. Okonkwo',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      evidenceCount: 0,
      analysisCount: 0,
      findings: [],
    };

    await createCaseInFirestore(newRecord);
    setCasesList(prev => [newRecord, ...prev]);
    setCreating(false);
    setShowModal(false);
    setCaseName('');
    setCaseDesc('');
  };

  const filtered = casesList.filter(c => {
    const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Evidence Vault</p>
          <h1 className="text-[22px] font-bold text-white font-display">Case Management</h1>
          <p className="text-[13px] text-slate-500">Digital forensics investigation cases · {casesList.length} total</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowModal(true)}>
          New Case
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          ['All', casesList.length, 'all'],
          ['Open', casesList.filter(c => c.status === 'open').length, 'open'],
          ['Investigating', casesList.filter(c => c.status === 'investigating').length, 'investigating'],
          ['Review', casesList.filter(c => c.status === 'review').length, 'review'],
          ['Closed', casesList.filter(c => c.status === 'closed' || c.status === 'archived').length, 'closed'],
        ].map(([label, count, val]) => (
          <button
            key={String(val)}
            onClick={() => setStatusFilter(val as any)}
            className={`p-3 rounded-xl border text-left transition-all ${
              statusFilter === val
                ? 'border-cyan-400/30 bg-cyan-400/8'
                : 'border-white/[0.07] bg-[#0C1118] hover:border-white/[0.12]'
            }`}
          >
            <p className={`text-[20px] font-bold font-display ${statusFilter === val ? 'text-cyan-400' : 'text-white'}`}>{count}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search cases…"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 py-2 text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/40"
        />
      </div>

      {/* Cases list */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-mono text-[12px]">Loading case registry...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FolderOpen size={24} />} title="No cases found" description="Create your first investigation case to get started." action={{ label: 'Create Case', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Link key={c.id} to={`/cases/${c.id}`} className="block bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 hover:border-white/[0.12] transition-all group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-cyan-400/70">{c.id}</span>
                    <RiskBadge risk={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white font-display group-hover:text-cyan-400 transition-colors">{c.name}</h3>
                  <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1">{c.description}</p>
                </div>
                <div className="flex sm:flex-col items-start sm:items-end gap-3 sm:gap-1 flex-shrink-0 text-right">
                  <div className="flex gap-4 sm:gap-2">
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-white font-display">{c.analysisCount}</p>
                      <p className="text-[9px] text-slate-600 uppercase tracking-wider">Analyses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-white font-display">{c.evidenceCount}</p>
                      <p className="text-[9px] text-slate-600 uppercase tracking-wider">Evidence</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-white/[0.05] text-[11px] text-slate-600">
                <span>Investigator: <span className="text-slate-400">{c.investigator}</span></span>
                <span>Created: <span className="text-slate-400 font-mono">{c.createdAt}</span></span>
                <span>Updated: <span className="text-slate-400 font-mono">{c.updatedAt}</span></span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0C1118] border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-[16px] font-bold text-white font-display">Create Investigation Case</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Case Name</label>
                <input
                  required
                  value={caseName}
                  onChange={e => setCaseName(e.target.value)}
                  placeholder="e.g., Operation Deep Shield - Executive Impersonation"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3.5 py-2.5 text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={caseDesc}
                  onChange={e => setCaseDesc(e.target.value)}
                  placeholder="Provide scope, source, and context of investigation..."
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md p-3 text-[12.5px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['critical', 'high', 'medium', 'low'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 text-[11px] font-mono uppercase rounded border transition-all ${
                        priority === p ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-300 font-bold' : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.03]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={creating} icon={<Check size={14} />}>
                  {creating ? 'Saving Case...' : 'Create Case'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
