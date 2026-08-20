import { useState, useEffect } from 'react';
import { Search, Shield, Film, Image as ImageIcon } from 'lucide-react';
import { IntegrityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { fetchEvidenceByCase } from '../lib/firebase/firestore';
import type { EvidenceRecord } from '../lib/av/types';

export default function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvidence() {
      setLoading(true);
      const data = await fetchEvidenceByCase();
      setEvidenceList(data);
      if (data.length > 0) setSelected(data[0].id);
      setLoading(false);
    }
    loadEvidence();
  }, []);

  const filtered = evidenceList.filter(e =>
    search === '' || e.filename.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase())
  );

  const sel = selected ? evidenceList.find(e => e.id === selected) : null;

  return (
    <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Evidence</p>
          <h1 className="text-[22px] font-bold text-white font-display">Evidence Vault</h1>
          <p className="text-[13px] text-slate-500">Cryptographically secured forensic evidence · {evidenceList.length} items</p>
        </div>
        <Button variant="outline" size="sm" icon={<Shield size={13} />}>Verify Integrity</Button>
      </div>

      <div className="relative max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search evidence…"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 py-2 text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/40"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="forensic-table">
              <thead>
                <tr>
                  <th>Evidence ID</th>
                  <th>Filename</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Added</th>
                  <th>Integrity</th>
                  <th>Case</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-slate-500 font-mono text-[12px]">Loading Evidence Vault...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-slate-500 text-[12px]">No evidence items found.</td>
                  </tr>
                ) : filtered.map(e => (
                  <tr key={e.id} onClick={() => setSelected(e.id)} className={`cursor-pointer ${selected === e.id ? 'bg-cyan-400/[0.05]' : ''}`}>
                    <td><span className="font-mono text-[12px] text-cyan-400/80">{e.id}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        {e.kind === 'video' ? <Film size={12} className="text-violet-400" /> : <ImageIcon size={12} className="text-cyan-400" />}
                        <span className="text-[13px] text-slate-200 max-w-[140px] truncate">{e.filename}</span>
                      </div>
                    </td>
                    <td><span className="text-[11px] uppercase tracking-wider text-slate-500">{e.kind}</span></td>
                    <td><span className="font-mono text-[12px] text-slate-400">{e.sizeMb} MB</span></td>
                    <td><span className="font-mono text-[11px] text-slate-500">{new Date(e.addedAt).toLocaleDateString()}</span></td>
                    <td><IntegrityBadge integrity={e.integrity} /></td>
                    <td><span className="font-mono text-[11px] text-cyan-400/70">{e.caseId}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {sel ? (
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              {sel.kind === 'video' ? <Film size={14} className="text-violet-400" /> : <ImageIcon size={14} className="text-cyan-400" />}
              <h3 className="text-[13px] font-semibold text-white font-display truncate">{sel.filename}</h3>
            </div>
            <IntegrityBadge integrity={sel.integrity} />
            <div className="space-y-3 pt-2">
              <HashRow label="SHA-256" value={sel.sha256} />
              {sel.sha1 && <HashRow label="SHA-1" value={sel.sha1} />}
              {sel.md5 && <HashRow label="MD5" value={sel.md5} />}
              <HashRow label="Evidence ID" value={sel.id} />
              <HashRow label="Case" value={sel.caseId} />
              {[
                ['Type', sel.kind.toUpperCase()],
                ['Size', `${sel.sizeMb} MB`],
                ['Added', new Date(sel.addedAt).toLocaleString()],
                ['Status', sel.status]
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">{k}</p>
                  <p className="text-[12.5px] text-slate-300 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 flex items-center justify-center">
            <p className="text-[12.5px] text-slate-600 text-center">Select an evidence item<br />to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
      <p className="text-[11px] font-mono text-cyan-400/70 mt-0.5 break-all">{value}</p>
    </div>
  );
}
