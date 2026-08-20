import { useState } from 'react';
import { User, Bell, Shield, Cpu, HardDrive, Key, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';

type Tab = 'profile' | 'appearance' | 'notifications' | 'analysis' | 'security' | 'api';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={14} /> },
  { id: 'appearance', label: 'Appearance', icon: <Eye size={14} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
  { id: 'analysis', label: 'Analysis', icon: <Cpu size={14} /> },
  { id: 'security', label: 'Security', icon: <Shield size={14} /> },
  { id: 'api', label: 'API', icon: <Key size={14} /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1000px] mx-auto">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">System</p>
        <h1 className="text-[22px] font-bold text-white font-display">Settings</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Sidebar tabs */}
        <nav className="sm:w-44 flex-shrink-0">
          <ul className="space-y-0.5">
            {tabs.map(t => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all text-left ${
                    activeTab === t.id
                      ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/15'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                  aria-current={activeTab === t.id ? 'page' : undefined}
                >
                  <span className={activeTab === t.id ? 'text-cyan-400' : 'text-slate-500'}>{t.icon}</span>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-[#0C1118] border border-white/[0.07] rounded-xl p-6 space-y-5">
          {activeTab === 'profile' && (
            <>
              <h2 className="text-[15px] font-semibold text-white font-display">Profile</h2>
              <div className="flex items-center gap-4 pb-4 border-b border-white/[0.06]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-[18px] font-bold text-white">MO</div>
                <div>
                  <p className="text-[14px] font-semibold text-white">M. Okonkwo</p>
                  <p className="text-[12px] text-slate-500">m.okonkwo@forensics.gov</p>
                  <button className="text-[11px] text-cyan-400 hover:text-cyan-300 mt-1">Change avatar</button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[['First Name', 'Marcus'], ['Last Name', 'Okonkwo'], ['Email', 'm.okonkwo@forensics.gov'], ['Organization', 'Digital Forensics Lab'], ['Role', 'Senior Investigator'], ['Department', 'Cybercrime Division']].map(([label, val]) => (
                  <div key={label}>
                    <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <input defaultValue={val} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[13px] text-slate-200 focus:outline-none focus:border-cyan-400/40" />
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === 'appearance' && (
            <>
              <h2 className="text-[15px] font-semibold text-white font-display">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-slate-400 mb-2">Theme</p>
                  <div className="flex gap-3">
                    {['Dark (Default)', 'High Contrast', 'System'].map(t => (
                      <button key={t} className={`px-3 py-2 rounded-md border text-[12.5px] transition-all ${t === 'Dark (Default)' ? 'border-cyan-400/30 bg-cyan-400/8 text-cyan-400' : 'border-white/[0.07] text-slate-400 hover:border-white/[0.15]'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] text-slate-400 mb-2">Interface Density</p>
                  <div className="flex gap-3">
                    {['Compact', 'Default', 'Spacious'].map(d => (
                      <button key={d} className={`px-3 py-2 rounded-md border text-[12.5px] transition-all ${d === 'Default' ? 'border-cyan-400/30 bg-cyan-400/8 text-cyan-400' : 'border-white/[0.07] text-slate-400 hover:border-white/[0.15]'}`}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {activeTab === 'notifications' && (
            <>
              <h2 className="text-[15px] font-semibold text-white font-display">Notifications</h2>
              <div className="space-y-3">
                {[
                  ['Analysis completed', 'Notify when a forensic analysis finishes', true],
                  ['Critical detection', 'Alert on high-risk or critical verdict', true],
                  ['Evidence integrity warning', 'Alert when evidence hash mismatch detected', true],
                  ['Batch analysis complete', 'Notify when batch processing finishes', true],
                  ['System warnings', 'Infrastructure and service degradation alerts', false],
                  ['Report ready', 'Notify when a generated report is available', true],
                ].map(([label, desc, enabled]: any) => (
                  <div key={label} className="flex items-start justify-between py-3 border-b border-white/[0.05] last:border-0">
                    <div>
                      <p className="text-[13px] font-medium text-slate-200">{label}</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={enabled}
                      className={`relative w-9 h-5 rounded-full transition-all border flex-shrink-0 ml-4 ${enabled ? 'bg-cyan-400/20 border-cyan-400/40' : 'bg-white/[0.06] border-white/[0.1]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${enabled ? 'left-4 bg-cyan-400' : 'left-0.5 bg-slate-500'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === 'analysis' && (
            <>
              <h2 className="text-[15px] font-semibold text-white font-display">Analysis Preferences</h2>
              <div className="space-y-4">
                {[['Default Detection Mode', ['Automatic', 'Deepfake', 'Face Morph', 'Both']], ['Default Depth', ['Fast', 'Balanced', 'Deep Forensic']], ['Default FPS', ['10 FPS', '15 FPS', '30 FPS', 'Adaptive']]].map(([label, opts]: any) => (
                  <div key={label}>
                    <label className="block text-[12px] text-slate-400 mb-2">{label}</label>
                    <select className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[13px] text-slate-300 focus:outline-none focus:border-cyan-400/40">
                      {opts.map((o: string) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === 'security' && (
            <>
              <h2 className="text-[15px] font-semibold text-white font-display">Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                  <div>
                    <p className="text-[13px] font-medium text-slate-200">Two-factor authentication</p>
                    <p className="text-[12px] text-slate-500">Enabled via TOTP authenticator</p>
                  </div>
                  <span className="text-[11px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded font-mono">ENABLED</span>
                </div>
                <div>
                  <p className="text-[12px] text-slate-400 mb-2">Session timeout</p>
                  <select className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[13px] text-slate-300 focus:outline-none focus:border-cyan-400/40">
                    {['30 minutes', '1 hour', '4 hours', '8 hours'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <Button variant="danger" size="sm">Change Password</Button>
              </div>
            </>
          )}
          {activeTab === 'api' && (
            <>
              <h2 className="text-[15px] font-semibold text-white font-display">API Access</h2>
              <div className="space-y-4">
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-[12.5px] text-cyan-300">
                  Forensic REST API endpoints provide programmatic access to hash ingestion, tensor pipeline runs, and report generation.
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-2">API Key</label>
                  <div className="flex gap-2">
                    <input value="av_live_9f82d17c4b0e8a32190f84ac29e61234" readOnly className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[12px] font-mono text-slate-400 focus:outline-none" />
                    <Button variant="outline" size="sm">Reveal</Button>
                    <Button variant="ghost" size="sm">Rotate</Button>
                  </div>
                </div>
                <div>
                  <p className="text-[12px] text-slate-400 mb-2">Available endpoints</p>
                  <div className="space-y-1.5">
                    {['POST /api/v1/analyze', 'GET /api/v1/analyses/:id', 'GET /api/v1/analyses', 'GET /api/v1/cases', 'POST /api/v1/reports/generate'].map(ep => (
                      <div key={ep} className="font-mono text-[12px] text-cyan-400/70 bg-white/[0.03] px-3 py-2 rounded">{ep}</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
            <Button variant="primary" size="sm" onClick={save}>
              {saved ? 'Saved ✓' : 'Save Changes'}
            </Button>
            <Button variant="ghost" size="sm">Discard</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
