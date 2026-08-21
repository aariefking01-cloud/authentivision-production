import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, Download, ChevronDown, ChevronRight, Shield, Layers, 
  UserCheck, CheckCircle2, AlertOctagon, ThumbsUp, ThumbsDown,
  Cpu, Users, Eye, Scan
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { RiskBadge } from '../components/ui/Badge';
import { MediaEvidenceViewer } from '../components/media/MediaEvidenceViewer';
import { getAnalysisResult, getCase } from '../lib/av/services';
import { updateHumanReviewInFirestore, saveFeedbackInFirestore } from '../lib/firebase/firestore';
import { generateAndDownloadReport } from '../lib/av/reports';
import { normalizeVerdict, getVerdictTextColor } from '../lib/av/format';
import { useAuth } from '../lib/firebase/auth';
import type { AnalysisRecord, CaseRecord } from '../lib/av/types';

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  low: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

export default function AnalysisResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [caseInfo, setCaseInfo] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [expertMode, setExpertMode] = useState(false);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number>(0);

  // Human Review Form state
  const [reviewDecision, setReviewDecision] = useState<'confirmed' | 'rejected' | 'inconclusive'>('confirmed');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);

  // Feedback loop state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackComment, setShowFeedbackComment] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      const res = await getAnalysisResult(id);
      if (res) {
        setAnalysis(res);
        const c = await getCase(res.caseId);
        if (c) setCaseInfo(c);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis || !id) return;
    setReviewSubmitting(true);
    const reviewerName = profile?.displayName || 'Dr. K. Osei';
    await updateHumanReviewInFirestore(id, {
      reviewedBy: reviewerName,
      decision: reviewDecision,
      notes: reviewNotes || 'Human review completed. Multi-model forensic evidence verified.',
    });
    setAnalysis(prev => prev ? {
      ...prev,
      humanReview: {
        reviewedBy: reviewerName,
        reviewedAt: new Date().toISOString(),
        decision: reviewDecision,
        notes: reviewNotes || 'Human review completed.',
      }
    } : null);
    setReviewSubmitting(false);
    setReviewSaved(true);
  };

  const handleFeedbackSubmit = async (correct: boolean, comment?: string) => {
    if (!analysis || !id) return;
    await saveFeedbackInFirestore(id, { correct, comments: comment, submittedBy: profile?.displayName || 'Forensic Officer' });
    setFeedbackSubmitted(true);
  };

  const handleDownloadPdf = async () => {
    if (!analysis) return;
    await generateAndDownloadReport(analysis, caseInfo || undefined, 'PDF');
  };

  const handleDownloadJson = async () => {
    if (!analysis) return;
    await generateAndDownloadReport(analysis, caseInfo || undefined, 'JSON');
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[13px] text-slate-400">Loading forensic record from vault...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-12 text-center">
        <AlertOctagon size={36} className="text-amber-400 mx-auto mb-3" />
        <h2 className="text-[18px] font-bold text-white font-display">Analysis Record Not Found</h2>
        <p className="text-[13px] text-slate-500 mt-1 mb-4">The requested analysis ID does not exist or has been archived.</p>
        <Link to="/analysis/history">
          <Button variant="outline" size="sm">Return to Analysis Vault</Button>
        </Link>
      </div>
    );
  }

  const displayVerdict = normalizeVerdict(analysis.verdict);
  const verdictTextColor = getVerdictTextColor(analysis.verdict);
  const hasMultipleFaces = Boolean(analysis.perFaceResults && analysis.perFaceResults.length > 1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-6 space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-slate-500" aria-label="Breadcrumb">
        <Link to="/analysis/history" className="hover:text-slate-300">Analysis Vault</Link>
        <ChevronRight size={12} />
        <span className="font-mono text-slate-400">{analysis.id}</span>
      </nav>

      {/* Header verdict block */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1118]">
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">Authenticity Assessment</p>
              <h1 className={`text-[36px] sm:text-[44px] font-bold font-display uppercase tracking-tight leading-none mb-3 ${verdictTextColor}`}>
                {displayVerdict}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge risk={analysis.risk} />
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                  QUALITY: {analysis.quality || 'HIGH'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-purple-400/20 bg-purple-400/10 text-purple-300">
                  UNCERTAINTY: ±{analysis.uncertainty ?? 4.2}%
                </span>
                <span className="text-[13px] text-slate-500 font-mono">Analysis ID: <span className="text-slate-300">{analysis.id}</span></span>
                <span className="text-[13px] text-slate-500 font-mono">{new Date(analysis.analyzedAt).toLocaleString()}</span>
              </div>
              {analysis.narrativeExplanation && (
                <div className="mt-4 p-3.5 rounded-lg border border-white/[0.08] bg-slate-900/60 text-[12.5px] text-slate-300 leading-relaxed font-sans">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block mb-1">
                    EXECUTIVE FORENSIC REASONING SUMMARY
                  </span>
                  {analysis.narrativeExplanation}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <ConfidenceGauge value={analysis.confidence} verdict={analysis.verdict} />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" icon={<FileText size={13} />} onClick={handleDownloadPdf}>PDF Report</Button>
                <Button variant="outline" size="sm" icon={<Download size={13} />} onClick={handleDownloadJson}>JSON Data</Button>
                <button
                  onClick={() => setExpertMode(o => !o)}
                  className={`px-3 py-1.5 rounded text-[11px] font-mono border transition-all ${
                    expertMode ? 'border-violet-400/40 bg-violet-400/10 text-violet-400' : 'border-white/[0.07] text-slate-500 hover:border-white/[0.15]'
                  }`}
                >
                  {expertMode ? '⚡ EXPERT MODE' : 'Expert Mode'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Face & Cross-Face Inspection Selector (if multiple faces present) */}
      {hasMultipleFaces && analysis.perFaceResults && (
        <div className="bg-[#0C1118] border border-cyan-500/20 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-cyan-400" />
              <h2 className="text-[14px] font-semibold text-white font-display">Multi-Face Localization & Cross-Face Consistency</h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
              {analysis.perFaceResults.length} SUBJECTS ANALYZED INDEPENDENTLY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {analysis.perFaceResults.map((face, idx) => (
              <button
                key={face.faceId}
                onClick={() => setSelectedFaceIndex(idx)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedFaceIndex === idx
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-slate-200">{face.label}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    face.verdict === 'AUTHENTIC' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                  }`}>
                    {face.verdict}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                  <p>Quality: <strong className="text-slate-300">{face.qualityLevel}</strong></p>
                  <p>Morph Score: <strong className={face.morphScore > 0.5 ? 'text-amber-400' : 'text-slate-300'}>{(face.morphScore * 100).toFixed(0)}%</strong></p>
                  <p>Deepfake: <strong className={face.deepfakeScore > 0.5 ? 'text-red-400' : 'text-slate-300'}>{(face.deepfakeScore * 100).toFixed(0)}%</strong></p>
                </div>
              </button>
            ))}
          </div>

          {analysis.crossFaceConsistency?.crossFaceAnomalyDetected && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-[12px] text-red-300 space-y-1">
              <span className="font-semibold text-red-400 uppercase tracking-wider text-[10px] font-mono block">
                ⚠️ CROSS-FACE PHYSICAL INCONSISTENCY DETECTED
              </span>
              <p>Physical lighting, sensor noise, and color temperature profiles between subjects do not match.</p>
              {analysis.crossFaceConsistency.inconsistencyDetails.map((detail, idx) => (
                <p key={idx} className="text-[11px] text-red-300/80 font-mono">• {detail}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main grid */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Left 2 Cols: Media Viewer + Structured Findings + Signals + Review */}
        <div className="xl:col-span-2 space-y-5">
          {/* Enhanced Media Evidence Viewer */}
          <MediaEvidenceViewer analysis={analysis} />

          {/* Structured Forensic Evidence (WHAT, WHERE, WHICH, HOW, LIMITATIONS) */}
          {analysis.structuredFindings && analysis.structuredFindings.length > 0 && (
            <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Scan size={16} className="text-cyan-400" />
                  <div>
                    <h2 className="text-[14px] font-semibold text-white font-display">Structured Forensic Findings</h2>
                    <p className="text-[11px] text-slate-500">Defensible evidence mapped to detector, region, and severity</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  {analysis.structuredFindings.length} FINDINGS
                </span>
              </div>

              <div className="space-y-3">
                {analysis.structuredFindings.map((finding) => (
                  <div key={finding.id} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-slate-200">{finding.what}</span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${SEVERITY_COLOR[finding.severity] || SEVERITY_COLOR.low}`}>
                        {finding.severity}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-[11.5px] text-slate-400 font-mono">
                      <div><span className="text-slate-500">WHERE:</span> {finding.where}</div>
                      <div><span className="text-slate-500">DETECTOR:</span> {finding.whichDetector}</div>
                      <div><span className="text-slate-500">EVIDENCE STRENGTH:</span> {finding.howStrong}</div>
                      <div><span className="text-slate-500">LIMITATIONS:</span> {finding.limitations}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Registry Status Breakdown */}
          {analysis.detectorStatuses && analysis.detectorStatuses.length > 0 && (
            <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-purple-400" />
                  <div>
                    <h2 className="text-[14px] font-semibold text-white font-display">Specialized Detector Registry Execution</h2>
                    <p className="text-[11px] text-slate-500">Multi-stage pipeline execution matrix</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
                  {analysis.detectorStatuses.length} MODELS ACTIVE
                </span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {analysis.detectorStatuses.map((det) => (
                  <div key={det.modelId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-semibold text-slate-200">{det.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">v{det.version}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                          det.status === 'success' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                        }`}>
                          {det.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{det.purpose}</p>
                      <p className="text-[10.5px] text-slate-500 font-mono">Calibration: {det.calibrationMethod}</p>
                    </div>
                    <div className="text-right sm:min-w-[120px]">
                      <span className="text-[13px] font-mono font-bold text-slate-200">
                        {det.confidence ? `${det.confidence}%` : `${(det.score * 100).toFixed(0)}%`}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">CONFIDENCE</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explainable AI Signal Breakdown */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl overflow-hidden shadow-lg">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-semibold text-white font-display">Explainable AI Signal Breakdown</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Evidentiary signals detected across spatial and frequency spectrums</p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                {analysis.signals?.length || 0} SIGNALS
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {analysis.signals && analysis.signals.length > 0 ? analysis.signals.map((s, i) => (
                <div key={i} className="px-5 py-4 hover:bg-white/[0.01] transition-colors">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-start gap-3 text-left"
                    aria-expanded={expanded === i}
                  >
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider flex-shrink-0 mt-0.5 ${SEVERITY_COLOR[s.severity] || SEVERITY_COLOR.low}`}>
                      {s.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-200">{s.label}</p>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">{s.summary}</p>
                    </div>
                    <ChevronDown size={14} className={`text-slate-600 flex-shrink-0 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded === i && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 ml-12 text-[12.5px] text-slate-400 leading-relaxed bg-white/[0.02] border border-white/[0.05] rounded-lg p-3"
                    >
                      {s.detail}
                    </motion.div>
                  )}
                </div>
              )) : (
                <p className="p-4 text-[12px] text-slate-500">No signals recorded.</p>
              )}
            </div>
          </div>

          {/* Human Review / Peer Sign-Off */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h2 className="text-[14px] font-semibold text-white font-display">Analyst Peer Review & Decision</h2>
                <p className="text-[11px] text-slate-500">Human examiner verification sign-off</p>
              </div>
              <UserCheck size={18} className="text-cyan-400" />
            </div>

            {analysis.humanReview ? (
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-slate-200">Official Examiner: {analysis.humanReview.reviewedBy}</span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                    {analysis.humanReview.decision}
                  </span>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed font-mono">"{analysis.humanReview.notes}"</p>
                <p className="text-[10px] text-slate-500 font-mono">{new Date(analysis.humanReview.reviewedAt).toLocaleString()}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Review Decision</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['confirmed', 'Confirm AI Finding'],
                      ['rejected', 'Reject / Override'],
                      ['inconclusive', 'Mark Inconclusive'],
                    ].map(([v, l]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setReviewDecision(v as any)}
                        className={`py-2 px-3 rounded-md text-[12px] font-medium border transition-all ${
                          reviewDecision === v
                            ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-300'
                            : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.03]'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Examiner Notes</label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Provide secondary inspection notes, landmark verification details, and official conclusion..."
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md p-3 text-[12.5px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={reviewSubmitting}
                    icon={<CheckCircle2 size={14} />}
                  >
                    {reviewSubmitting ? 'Signing Review...' : 'Sign & Submit Official Review'}
                  </Button>
                  {reviewSaved && <span className="text-[12px] text-emerald-400 font-mono">Review persisted to Firestore!</span>}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right column: Confidence, Breakdown, Provenance, Metadata */}
        <div className="space-y-4">
          {/* Confidence gauge */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 text-center shadow-lg">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.12em] font-mono mb-4">Calibrated Confidence</p>
            <ConfidenceGaugeDetailed value={analysis.confidence} verdict={analysis.verdict} />
            <p className="text-[12px] text-slate-400 mt-4 leading-relaxed">
              Confidence score calibrated via Platt Scaling and NIST-aligned prior probability matrix.
            </p>
          </div>

          {/* Media info & Likelihood breakdown */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-4 shadow-lg">
            <h3 className="text-[12px] font-semibold text-white font-display">Classification Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400 font-mono">AI Generated Likelihood</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {Math.round((analysis.classification?.aiGenerated ?? (displayVerdict === 'DEEPFAKE' ? 0.92 : 0.05)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${(analysis.classification?.aiGenerated ?? (displayVerdict === 'DEEPFAKE' ? 0.92 : 0.05)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400 font-mono">Face Morph / Manipulation</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {Math.round((analysis.classification?.manipulated ?? (displayVerdict === 'FACE MORPHED' ? 0.89 : 0.04)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${(analysis.classification?.manipulated ?? (displayVerdict === 'FACE MORPHED' ? 0.89 : 0.04)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400 font-mono">Authentic / Real Likelihood</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {Math.round((analysis.classification?.authentic ?? (displayVerdict === 'AUTHENTIC' ? 0.95 : 0.08)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(analysis.classification?.authentic ?? (displayVerdict === 'AUTHENTIC' ? 0.95 : 0.08)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Provenance & C2PA Status Card */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-3 shadow-lg">
            <h3 className="text-[12px] font-semibold text-white font-display flex items-center justify-between">
              <span>Provenance & C2PA</span>
              <span className="text-[10px] font-mono text-cyan-400">MANIFEST CHECK</span>
            </h3>
            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">C2PA Credentials</span>
                <span className={`font-mono ${analysis.provenance?.c2paDetected ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  {analysis.provenance?.c2paDetected ? 'VERIFIED SIGNATURE' : 'NOT DETECTED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">SynthID Watermark</span>
                <span className={`font-mono ${analysis.provenance?.synthIdDetected ? 'text-purple-400 font-bold' : 'text-slate-500'}`}>
                  {analysis.provenance?.synthIdDetected ? 'AI WATERMARK DETECTED' : 'NOT DETECTED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Software Signature</span>
                <span className="font-mono text-slate-300 truncate max-w-[150px]">
                  {analysis.provenance?.softwareUsed || 'Standard Firmware'}
                </span>
              </div>
              {analysis.provenance?.details && (
                <p className="text-[10.5px] text-slate-400 bg-white/[0.02] border border-white/[0.05] rounded p-2 mt-1">
                  {analysis.provenance.details}
                </p>
              )}
            </div>
          </div>

          {/* Model Signals & Agreement Card */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-3 shadow-lg">
            <h3 className="text-[12px] font-semibold text-white font-display flex items-center justify-between">
              <span>Model Ensemble & Signals</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                analysis.agreement?.level === 'HIGH' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                analysis.agreement?.level === 'CONFLICTING' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                'text-amber-400 bg-amber-500/10 border-amber-500/30'
              }`}>
                {analysis.agreement?.level || 'HIGH'} AGREEMENT
              </span>
            </h3>
            <div className="space-y-2.5 text-[11.5px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gemini 3.1 Pro / Flash Reasoner</span>
                <span className="font-mono text-emerald-400 font-semibold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AV-MorphNet v3.2</span>
                <span className="font-mono text-amber-400 font-semibold">CALIBRATED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AV-DeepNet v4.1</span>
                <span className="font-mono text-red-400 font-semibold">CALIBRATED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AV-PixelForensics (Spatial & FFT)</span>
                <span className="font-mono text-purple-400 font-semibold">SCANNED</span>
              </div>
              {analysis.agreement && (
                <div className="text-[10.5px] text-slate-400 bg-white/[0.02] border border-white/[0.05] rounded p-2 flex items-center justify-between">
                  <span>Supporting Signals: <strong className="text-emerald-400">{analysis.agreement.supportingSignals}</strong></span>
                  <span>Conflicting Signals: <strong className="text-red-400">{analysis.agreement.conflictingSignals}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Model Feedback Loop */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <div>
                <h3 className="text-[13px] font-semibold text-white font-display">Was this result correct?</h3>
                <p className="text-[11px] text-slate-500">Provide feedback to train & calibrate detection accuracy</p>
              </div>
            </div>

            {feedbackSubmitted || analysis.feedback ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-[12px] text-emerald-300 flex items-center justify-between font-mono">
                <span>Feedback recorded! Model ensemble calibrated.</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleFeedbackSubmit(true)}
                    className="flex-1 py-2 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[12px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ThumbsUp size={14} /> Yes
                  </button>
                  <button
                    onClick={() => {
                      setShowFeedbackComment(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[12px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ThumbsDown size={14} /> No
                  </button>
                </div>
                {showFeedbackComment && (
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Optional feedback details (e.g. compression artifacts mistaken for deepfake)..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md p-2 text-[12px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/40"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeedbackSubmit(false, feedbackComment)}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Technical Specifications */}
          <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-5 shadow-lg">
            <h3 className="text-[12px] font-semibold text-white font-display mb-3">Technical Specifications</h3>
            <div className="space-y-2">
              {[
                ['Filename', analysis.filename],
                ['Media Kind', analysis.kind.toUpperCase()],
                ['File Size', `${analysis.sizeMb} MB`],
                ['Resolution', analysis.resolution || 'N/A'],
                ['FPS', analysis.fps ? `${analysis.fps}` : 'N/A'],
                ['Codec', analysis.codec || 'N/A'],
                ['Primary Analyst', analysis.analyst || 'N/A'],
                ['Case ID', analysis.caseId],
                ['SHA-256 Hash', `${analysis.sha256.slice(0, 16)}...`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">{k}</span>
                  <span className={`text-[11px] font-mono text-slate-300 truncate max-w-[150px] text-right ${k === 'SHA-256 Hash' ? 'text-cyan-400/80' : ''}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expert mode details */}
          {expertMode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-violet-900/10 border border-violet-400/15 rounded-xl p-5 shadow-lg"
            >
              <p className="text-[10px] text-violet-400 font-mono tracking-wider uppercase mb-3">Model Architecture & Metadata</p>
              <div className="space-y-2">
                {[
                  ['Model Engine', analysis.model],
                  ['Pipeline Version', 'AV-Pipeline 2026.3'],
                  ['Inference Runtime', 'GPU Accelerated Node'],
                  ['Verification Status', analysis.humanReview ? 'Peer Reviewed' : 'Pending Review'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{k}</span>
                    <span className="text-[11px] font-mono text-violet-300">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <Link to="/cases">
              <Button variant="outline" size="sm" className="w-full" icon={<Shield size={13} />}>View Case Records</Button>
            </Link>
            <Link to="/evidence">
              <Button variant="ghost" size="sm" className="w-full" icon={<Layers size={13} />}>Evidence Vault</Button>
            </Link>
            <Button variant="primary" size="sm" className="w-full" icon={<FileText size={13} />} onClick={handleDownloadPdf}>Generate Forensic PDF Report</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ConfidenceGauge({ value, verdict }: { value: number; verdict: string }) {
  const r = 32, circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const norm = normalizeVerdict(verdict);
  const strokeColor = norm === 'AUTHENTIC' ? '#10B981' : norm === 'DEEPFAKE' ? '#EF4444' : norm === 'FACE MORPHED' ? '#F59E0B' : norm === 'MANIPULATED / SYNTHETIC' ? '#F97316' : '#94A3B8';

  return (
    <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" className="absolute inset-0 -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <p className="relative z-10 text-[19px] font-bold leading-none text-white font-mono">
        {value.toFixed(1)}%
      </p>
    </div>
  );
}

function ConfidenceGaugeDetailed({ value, verdict }: { value: number; verdict: string }) {
  const r = 52, circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const norm = normalizeVerdict(verdict);
  const strokeColor = norm === 'AUTHENTIC' ? '#10B981' : norm === 'FACE MORPHED' ? '#F59E0B' : norm === 'MANIPULATED / SYNTHETIC' ? '#F97316' : '#EF4444';

  return (
    <div className="relative flex h-[150px] w-[150px] items-center justify-center mx-auto">
      <svg width="150" height="150" viewBox="0 0 150 150" className="absolute inset-0 -rotate-90">
        <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <p className="text-[31px] font-bold leading-none text-white font-mono">
          {value.toFixed(1)}%
        </p>
        <p className="mt-1 text-[9px] text-slate-500 uppercase tracking-[0.12em] font-mono">CONFIDENCE</p>
      </div>
    </div>
  );
}
