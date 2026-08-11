import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, FolderOpen } from 'lucide-react';
import { RiskBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { cases } from '../data/mockData';
import type { CaseStatus } from '../types';

export default function CasesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

  const filtered = cases.filter(c => {
    const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Evidence</p>
          <h1 className="text-[22px] font-bold text-white font-display">Case Management</h1>
          <p className="text-[13px] text-slate-500">Digital forensics investigation cases · {cases.length} total</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} />}>New Case</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          ['All', cases.length, 'all'],
          ['Open', cases.filter(c => c.status === 'open').length, 'open'],
          ['Investigating', cases.filter(c => c.status === 'investigating').length, 'investigating'],
          ['Review', cases.filter(c => c.status === 'review').length, 'review'],
          ['Closed', cases.filter(c => c.status === 'closed' || c.status === 'archived').length, 'closed'],
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

      {/* Cases */}
      {filtered.length === 0 ? (
        <EmptyState icon={<FolderOpen size={24} />} title="No cases found" description='Create your first investigation case to get started.' action={{ label: 'Create Case', onClick: () => {} }} />
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
    </div>
  );
}
