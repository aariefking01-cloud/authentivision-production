import { useState, useEffect } from 'react';
import { FileText, Download, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RiskBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { fetchReports, fetchAnalyses } from '../lib/firebase/firestore';
import { generateAndDownloadReport } from '../lib/av/reports';
import type { ReportRecord, AnalysisRecord } from '../lib/av/types';

export default function ReportsPage() {
  const [reportsList, setReportsList] = useState<ReportRecord[]>([]);
  const [analysesList, setAnalysesList] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [reps, ans] = await Promise.all([fetchReports(), fetchAnalyses()]);
      setReportsList(reps);
      setAnalysesList(ans);
      if (ans.length > 0) setSelectedAnalysisId(ans[0].id);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedAnalysisId) return;
    setGenerating(true);
    const targetAnalysis = analysesList.find(a => a.id === selectedAnalysisId);
    if (targetAnalysis) {
      const generated = await generateAndDownloadReport(targetAnalysis, undefined, 'PDF');
      setReportsList(prev => [generated, ...prev]);
    }
    setGenerating(false);
    setShowBuilder(false);
  };

  const handleDownload = async (rep: ReportRecord) => {
    const targetAnalysis = analysesList.find(a => a.id === rep.analysisId);
    if (targetAnalysis) {
      await generateAndDownloadReport(targetAnalysis, undefined, rep.format === 'JSON' ? 'JSON' : 'PDF');
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Evidence</p>
          <h1 className="text-[22px] font-bold text-white font-display">Forensic Reports</h1>
          <p className="text-[13px] text-slate-500">Generated investigation reports · {reportsList.length} total</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowBuilder(o => !o)}>
          Generate Report
        </Button>
      </div>

      {/* Report builder */}
      {showBuilder && (
        <div className="bg-[#0C1118] border border-cyan-400/15 rounded-xl p-5 space-y-4">
          <h2 className="text-[14px] font-semibold text-white font-display">Generate Forensic Report</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-2">Select Analysis</label>
              <select
                value={selectedAnalysisId}
                onChange={e => setSelectedAnalysisId(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[13px] text-slate-300 focus:outline-none focus:border-cyan-400/40"
              >
                {analysesList.map(a => (
                  <option key={a.id} value={a.id}>{a.id} — {a.filename} ({a.verdict})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-2">Export Format</label>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded-md border border-cyan-400/40 bg-cyan-400/10 text-[12.5px] text-cyan-300">
                  PDF (Official Forensic Document)
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="primary" size="sm" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating Forensic PDF…' : 'Generate & Download PDF'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowBuilder(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Reports list */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-mono text-[12px]">Loading reports vault...</div>
      ) : reportsList.length === 0 ? (
        <EmptyState icon={<FileText size={24} />} title="No reports yet" description="Generate a forensic report from a completed analysis." action={{ label: 'Generate Report', onClick: () => setShowBuilder(true) }} />
      ) : (
        <div className="space-y-3">
          {reportsList.map(r => (
            <div key={r.id} className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 hover:border-white/[0.12] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-cyan-400/70">{r.id}</span>
                    <RiskBadge risk={r.risk || 'high'} />
                    <span className="font-mono text-[10px] text-slate-600">{r.caseId}</span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-white font-display">{r.title}</h3>
                  <p className="text-[12px] text-slate-500 mt-1">Verdict: <span className="text-slate-300 font-mono uppercase">{r.verdict}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right mr-3 hidden sm:block">
                    <p className="text-[11px] text-slate-500 font-mono">{new Date(r.generatedAt || r.createdAt).toLocaleDateString()}</p>
                    <p className="text-[11px] text-slate-600">{r.analyst || r.author}</p>
                  </div>
                  <Button variant="outline" size="sm" icon={<Download size={13} />} onClick={() => handleDownload(r)}>
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
