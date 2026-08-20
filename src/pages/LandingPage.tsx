import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Eye, Lock, BarChart2, FileText, ChevronRight, CheckCircle, ArrowRight, Play } from 'lucide-react';

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const features = [
    { icon: <Eye size={20} />, title: 'Deepfake Detection', desc: 'Multi-layer neural analysis detects synthesized facial content across video and imagery with frame-level precision.' },
    { icon: <Shield size={20} />, title: 'Face Morph Detection', desc: 'Identifies biometric fusion attacks, texture blending artifacts, and landmark inconsistencies in identity documents.' },
    { icon: <Zap size={20} />, title: 'Explainable AI', desc: 'Every verdict includes a structured explanation of contributing signals, confidence breakdown, and artifact evidence.' },
    { icon: <FileText size={20} />, title: 'Forensic Evidence', desc: 'Heatmaps, attention maps, and frame-level analysis provide court-admissible visual evidence trails.' },
    { icon: <Lock size={20} />, title: 'Evidence Integrity', desc: 'SHA-256 hash verification and cryptographic chain of custody for every piece of analyzed media.' },
    { icon: <BarChart2 size={20} />, title: 'Analytics & Intelligence', desc: 'Aggregate insights across investigations: detection trends, model performance, and risk landscape metrics.' },
  ];

  const steps = [
    { num: '01', label: 'Upload', desc: 'Submit video or imagery through the secure upload interface.' },
    { num: '02', label: 'Analyze', desc: '9-stage forensic pipeline processes the media across multiple AI models.' },
    { num: '03', label: 'Explain', desc: 'Results include explainable AI signals, confidence scores, and artifact maps.' },
    { num: '04', label: 'Verify', desc: 'Export forensic reports with chain of custody and integrity verification.' },
  ];

  const useCases = [
    { role: 'Digital Forensics', desc: 'Evidence verification for law enforcement and judicial proceedings.' },
    { role: 'Cybersecurity', desc: 'Detect synthetic media used in social engineering and identity fraud.' },
    { role: 'Journalism', desc: 'Verify the authenticity of submitted media before publication.' },
    { role: 'Enterprise', desc: 'Protect against deepfake-enabled fraud in hiring, onboarding, and authentication.' },
    { role: 'Research', desc: 'Study manipulation patterns and evaluate detection model performance.' },
    { role: 'Government', desc: 'Counter disinformation and synthetic media in intelligence contexts.' },
  ];

  const faqs = [
    { q: 'Is AuthentiVision a real-time detection system?', a: 'AuthentiVision processes media through a multi-stage pipeline. Typical analysis completes in 30–120 seconds depending on media duration and selected analysis depth.' },
    { q: 'What file formats are supported?', a: 'Video: MP4, MOV, AVI, MKV. Image: JPG, JPEG, PNG, WEBP. Maximum file size: 2 GB for video, 50 MB for images.' },
    { q: 'How is evidence integrity maintained?', a: 'Every uploaded file is SHA-256 hashed at ingest. The hash is stored alongside all analysis results and verified before any access. Any modification is immediately flagged.' },
    { q: 'Does AuthentiVision claim 100% accuracy?', a: 'No. Detection confidence is always clearly calibrated. Results represent probabilistic classification supported by explainable AI artifact maps and human investigator peer sign-off.' },
    { q: 'Can this be integrated with existing forensic workflows?', a: 'The platform exposes a structured API layer designed for integration with case management systems, SIEM platforms, and forensic workstations.' },
  ];

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-200">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#070A0F]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <span className="text-[13px] font-bold text-white font-display tracking-tight">AUTHENTIVISION</span>
              <div className="text-[9px] text-cyan-400/60 tracking-[0.15em] font-mono">AI MEDIA FORENSICS</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors hidden sm:block">Sign in</Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-[13px] font-semibold bg-cyan-400 text-[#070A0F] px-4 py-2 rounded-md hover:bg-cyan-300 transition-colors shadow-[0_0_16px_rgba(0,212,255,0.2)]">
              Launch Platform <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <GridBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-400/8 border border-cyan-400/15 rounded-full px-3 py-1 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-glow" />
                <span className="text-[11px] text-cyan-400 font-mono tracking-wider">ENTERPRISE FORENSIC ENGINE · v2.5</span>
              </div>
              <h1 className="text-[52px] sm:text-[64px] font-bold leading-[1.05] tracking-tight font-display text-white mb-6">
                Verify<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">What You See.</span>
              </h1>
              <p className="text-[17px] text-slate-400 leading-relaxed mb-8 max-w-md">
                AI-powered digital media forensics for detecting deepfakes, face morphing, and manipulation. Evidence-driven. Explainable. Verifiable.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/analysis/new"
                  className="inline-flex items-center gap-2.5 bg-cyan-400 text-[#070A0F] font-semibold px-6 py-3 rounded-md hover:bg-cyan-300 transition-all shadow-[0_0_24px_rgba(0,212,255,0.25)] hover:shadow-[0_0_36px_rgba(0,212,255,0.4)] text-[14px]"
                >
                  <Shield size={16} /> Start Analysis
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2.5 border border-white/[0.1] text-slate-300 font-medium px-6 py-3 rounded-md hover:border-white/[0.2] hover:text-white hover:bg-white/[0.04] transition-all text-[14px]"
                >
                  <Play size={14} /> Explore Platform
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/[0.06]">
                {[['12,842', 'Analyses'], ['97.4%', 'Peak Confidence'], ['6', 'Analysis Stages']].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-[22px] font-bold text-white font-display">{v}</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider">{l}</p>
                  </div>
                ))}
                <p className="text-[9px] text-emerald-400/80 uppercase tracking-wider self-end pb-1 font-mono">Live Ingestion</p>
              </div>
            </div>
            <div className="relative">
              <HeroVisualization />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] text-cyan-400 tracking-[0.15em] uppercase font-mono mb-3">Methodology</p>
            <h2 className="text-[36px] font-bold font-display text-white">Analyze. Investigate. Verify.</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto text-[15px]">A structured forensic pipeline built for investigative workflows.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-cyan-400/30 to-transparent z-10" />
                )}
                <div className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-6 hover:border-white/[0.12] transition-colors">
                  <div className="text-[11px] font-mono text-cyan-400/60 mb-3">{step.num}</div>
                  <h3 className="text-[18px] font-bold text-white font-display mb-2">{step.label}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#0C1118]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] text-cyan-400 tracking-[0.15em] uppercase font-mono mb-3">Capabilities</p>
            <h2 className="text-[36px] font-bold font-display text-white">Forensic-grade detection</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-[#0C1118] border border-white/[0.07] rounded-xl p-6 hover:border-cyan-400/20 hover:bg-[#0C1118] transition-all group">
                <div className="w-10 h-10 rounded-lg bg-cyan-400/8 border border-cyan-400/15 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-400/12 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-semibold text-white font-display mb-2">{f.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] text-cyan-400 tracking-[0.15em] uppercase font-mono mb-3">Use Cases</p>
            <h2 className="text-[36px] font-bold font-display text-white">Built for investigators</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map(uc => (
              <div key={uc.role} className="flex gap-3 p-5 rounded-xl border border-white/[0.06] bg-[#0C1118] hover:border-white/[0.1] transition-colors">
                <CheckCircle size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-semibold text-white font-display">{uc.role}</p>
                  <p className="text-[12.5px] text-slate-500 mt-1">{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#0C1118]/40">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] text-cyan-400 tracking-[0.15em] uppercase font-mono mb-3">FAQ</p>
            <h2 className="text-[36px] font-bold font-display text-white">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/[0.07] rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] transition-colors"
                  aria-expanded={faqOpen === i}
                >
                  <span className="text-[14px] font-medium text-slate-200">{faq.q}</span>
                  <ChevronRight size={16} className={`text-slate-500 flex-shrink-0 transition-transform ${faqOpen === i ? 'rotate-90' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5 border-t border-white/[0.05]">
                    <p className="text-[13px] text-slate-400 leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[40px] font-bold font-display text-white mb-4">
            Ready to verify?
          </h2>
          <p className="text-[15px] text-slate-400 mb-8">
            Access the full platform to begin forensic media analysis.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2.5 bg-cyan-400 text-[#070A0F] font-semibold px-8 py-3.5 rounded-md hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(0,212,255,0.25)] text-[15px]"
          >
            Launch AuthentiVision <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark small />
            <span className="text-[12px] text-slate-500">AUTHENTIVISION — AI Media Forensics</span>
          </div>
          <p className="text-[11px] text-slate-600 font-mono">CRYPTOGRAPHIC MEDIA INTEGRITY · FORENSIC AUDIT RECORD</p>
        </div>
      </footer>
    </div>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.03] blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-600/[0.04] blur-3xl" />
    </div>
  );
}

function HeroVisualization() {
  return (
    <div className="relative w-full aspect-square max-w-[480px] mx-auto" aria-hidden="true">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-cyan-400/10 animate-spin-slow" />
      <div className="absolute inset-4 rounded-full border border-violet-400/8" style={{ animationDuration: '12s' }} />
      <div className="absolute inset-8 rounded-full border border-white/[0.04]" />

      {/* Central frame */}
      <div className="absolute inset-12 rounded-2xl border border-white/[0.08] bg-[#0C1118] overflow-hidden">
        {/* Scan lines */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.03) 3px, rgba(0,212,255,0.03) 4px)',
        }} />
        {/* Face outline SVG */}
        <svg viewBox="0 0 200 200" className="w-full h-full opacity-40">
          <ellipse cx="100" cy="100" rx="45" ry="55" stroke="rgba(0,212,255,0.6)" strokeWidth="0.8" fill="none" strokeDasharray="3 2" />
          <ellipse cx="86" cy="88" rx="8" ry="6" stroke="rgba(0,212,255,0.5)" strokeWidth="0.6" fill="none" />
          <ellipse cx="114" cy="88" rx="8" ry="6" stroke="rgba(0,212,255,0.5)" strokeWidth="0.6" fill="none" />
          <path d="M88 112 Q100 120 112 112" stroke="rgba(0,212,255,0.4)" strokeWidth="0.8" fill="none" />
          <line x1="100" y1="45" x2="100" y2="38" stroke="rgba(0,212,255,0.3)" strokeWidth="0.5" />
          <line x1="100" y1="155" x2="100" y2="162" stroke="rgba(0,212,255,0.3)" strokeWidth="0.5" />
          <line x1="55" y1="100" x2="48" y2="100" stroke="rgba(0,212,255,0.3)" strokeWidth="0.5" />
          <line x1="145" y1="100" x2="152" y2="100" stroke="rgba(0,212,255,0.3)" strokeWidth="0.5" />
          {/* Landmarks */}
          {[[86,88],[114,88],[100,100],[92,112],[108,112],[75,70],[125,70],[100,60]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(0,212,255,0.8)" />
          ))}
          {/* Artifact markers */}
          <rect x="78" y="82" width="16" height="12" rx="1" stroke="rgba(239,68,68,0.6)" strokeWidth="0.8" fill="rgba(239,68,68,0.05)" />
          <rect x="106" y="82" width="16" height="12" rx="1" stroke="rgba(239,68,68,0.6)" strokeWidth="0.8" fill="rgba(239,68,68,0.05)" />
        </svg>
        {/* Verdict overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#070A0F] to-transparent h-1/3" />
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          <span className="text-[8px] font-mono text-red-400">DEEPFAKE · 97.4%</span>
          <span className="text-[7px] font-mono text-cyan-400/60">CRITICAL</span>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute top-16 -left-4 bg-[#0C1118] border border-emerald-400/20 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[8px] text-slate-500 uppercase tracking-wider">Confidence</p>
        <p className="text-[14px] font-bold text-emerald-400 font-mono">97.4%</p>
      </div>
      <div className="absolute bottom-20 -right-4 bg-[#0C1118] border border-red-400/20 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[8px] text-slate-500 uppercase tracking-wider">Verdict</p>
        <p className="text-[11px] font-bold text-red-400 font-mono">DEEPFAKE</p>
      </div>
      <div className="absolute top-24 -right-6 bg-[#0C1118] border border-white/[0.08] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[8px] text-slate-500">Facial boundary</p>
        <div className="w-20 h-1 bg-white/[0.08] rounded-full mt-1.5 overflow-hidden">
          <div className="h-full bg-red-500 rounded-full" style={{ width: '82%' }} />
        </div>
      </div>
    </div>
  );
}

function LogoMark({ small = false }: { small?: boolean }) {
  const size = small ? 'w-6 h-6' : 'w-8 h-8';
  return (
    <div className={`${size} flex-shrink-0`}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M16 2L4 7v9c0 6.6 5.1 12.8 12 14.3C23 28.8 28 22.6 28 16V7L16 2z" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.5)" strokeWidth="1.2" strokeLinejoin="round"/>
        <ellipse cx="16" cy="16" rx="5" ry="3.5" stroke="rgba(0,212,255,0.9)" strokeWidth="1.2"/>
        <circle cx="16" cy="16" r="2" fill="#00D4FF"/>
      </svg>
    </div>
  );
}
