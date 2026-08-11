import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewAnalysisPage from './pages/NewAnalysisPage';
import AnalysisResultsPage from './pages/AnalysisResultsPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import FaceMorphPage from './pages/FaceMorphPage';
import BatchAnalysisPage from './pages/BatchAnalysisPage';
import CasesPage from './pages/CasesPage';
import EvidencePage from './pages/EvidencePage';
import ReportsPage from './pages/ReportsPage';
import InsightsPage from './pages/InsightsPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import ThreatIntelligencePage from './pages/ThreatIntelligencePage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

function CaseDetailPage() {
  const { id } = useParams();
  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-5">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-[0.12em] font-mono mb-1">Case Management</p>
        <h1 className="text-[22px] font-bold text-white font-display">{id}</h1>
      </div>
      <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-6">
        <p className="text-[13px] text-slate-400 mb-4">Case detail — explore the case tabs below.</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          {['Overview','Evidence','Analyses','Findings','Timeline','Notes','Reports','Audit Trail'].map(t => (
            <button key={t} className="px-3 py-1.5 rounded-md border border-white/[0.07] text-[12.5px] text-slate-400 hover:border-cyan-400/30 hover:text-cyan-400 transition-all">{t}</button>
          ))}
        </div>
        <div className="mt-5 text-[13px] text-slate-500">
          <p className="font-mono text-[11px] text-amber-400/70 mb-3">SIMULATION — case detail content is simulated</p>
          <Link to="/cases" className="text-cyan-400 hover:text-cyan-300">← Back to Cases</Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analysis/new" element={<NewAnalysisPage />} />
          <Route path="/analysis/video" element={<NewAnalysisPage />} />
          <Route path="/analysis/image" element={<NewAnalysisPage />} />
          <Route path="/analysis/face-morph" element={<FaceMorphPage />} />
          <Route path="/analysis/batch" element={<BatchAnalysisPage />} />
          <Route path="/analysis/history" element={<AnalysisHistoryPage />} />
          <Route path="/analysis/:id" element={<AnalysisResultsPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/evidence/:id" element={<EvidencePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/model-performance" element={<ModelPerformancePage />} />
          <Route path="/threat-intelligence" element={<ThreatIntelligencePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
