import { activityLog } from '../data/mockData';
import { Shield, LogIn, Upload, CheckCircle2, FileText, AlertTriangle, Settings, Eye } from 'lucide-react';

const actionIcon: Record<string, React.ReactNode> = {
  'Login': <LogIn size={13} className="text-cyan-400" />,
  'Upload': <Upload size={13} className="text-violet-400" />,
  'Analysis Completed': <CheckCircle2 size={13} className="text-emerald-400" />,
  'Model Inference': <Shield size={13} className="text-cyan-400" />,
  'Report Generated': <FileText size={13} className="text-amber-400" />,
  'Evidence Accessed': <Eye size={13} className="text-slate-400" />,
  'Case Modified': <Settings size={13} className="text-orange-400" />,
  'Model Updated': <Shield size={13} className="text-violet-400" />,
};

const resultColor = (r: string) => {
  if (r === 'Success' || r.includes('exported')) return 'text-emerald-400';
  if (r.includes('Deepfake') || r.includes('Morph')) return 'text-red-400';
  return 'text-slate-400';
};

export default function ActivityPage() {
  return (
    <div className="p-6 space-y-5 max-w-[1000px] mx-auto">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">System</p>
        <h1 className="text-[22px] font-bold text-white font-display">Activity Log</h1>
        <p className="text-[13px] text-slate-500">Immutable audit trail — all platform events</p>
      </div>

      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Shield size={13} className="text-cyan-400" />
          <span className="text-[12px] text-slate-400">Cryptographic audit log — entries are append-only</span>
          <span className="ml-auto text-[10px] font-mono text-amber-400/60">DEMO</span>
        </div>
        <div className="overflow-x-auto">
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP / Device</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map(ev => (
                <tr key={ev.id}>
                  <td><span className="font-mono text-[11px] text-slate-500">{ev.timestamp}</span></td>
                  <td><span className="text-[12.5px] text-slate-300">{ev.actor}</span></td>
                  <td>
                    <span className="flex items-center gap-2">
                      {actionIcon[ev.action] ?? <Shield size={13} className="text-slate-500" />}
                      <span className="text-[12.5px] text-slate-200">{ev.action}</span>
                    </span>
                  </td>
                  <td><span className="font-mono text-[12px] text-cyan-400/70">{ev.resource}</span></td>
                  <td><span className="font-mono text-[11px] text-slate-600">{ev.ip}</span></td>
                  <td><span className={`text-[12px] font-medium ${resultColor(ev.result)}`}>{ev.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between text-[12px] text-slate-500">
          <span>Showing {activityLog.length} recent entries</span>
          <button className="text-cyan-400 hover:text-cyan-300">Export log</button>
        </div>
      </div>
    </div>
  );
}
