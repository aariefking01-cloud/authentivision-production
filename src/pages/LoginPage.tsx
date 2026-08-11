import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('analyst@forensics.gov');
  const [password, setPassword] = useState('••••••••••••');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { navigate('/dashboard'); }, 900);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-white/[0.06]">
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-600/[0.06]" aria-hidden="true" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3 focus-visible:outline-none">
          <div className="w-10 h-10">
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
              <path d="M16 2L4 7v9c0 6.6 5.1 12.8 12 14.3C23 28.8 28 22.6 28 16V7L16 2z" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.6)" strokeWidth="1.2" strokeLinejoin="round"/>
              <ellipse cx="16" cy="16" rx="5" ry="3.5" stroke="rgba(0,212,255,0.9)" strokeWidth="1.2"/>
              <circle cx="16" cy="16" r="2" fill="#00D4FF"/>
              <circle cx="9" cy="12" r="0.8" fill="rgba(0,212,255,0.4)"/>
              <circle cx="23" cy="12" r="0.8" fill="rgba(0,212,255,0.4)"/>
              <circle cx="9" cy="20" r="0.8" fill="rgba(0,212,255,0.4)"/>
              <circle cx="23" cy="20" r="0.8" fill="rgba(0,212,255,0.4)"/>
              <line x1="11" y1="16" x2="9" y2="12" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
              <line x1="21" y1="16" x2="23" y2="12" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
              <line x1="11" y1="16" x2="9" y2="20" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
              <line x1="21" y1="16" x2="23" y2="20" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-bold tracking-tight text-white font-display">AUTHENTIVISION</div>
            <div className="text-[9px] text-cyan-400/60 tracking-[0.15em] uppercase font-mono">AI MEDIA FORENSICS</div>
          </div>
        </Link>

        {/* Main copy */}
        <div className="relative">
          <h1 className="text-[48px] font-bold leading-[1.1] font-display text-white mb-5">
            Verify<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">What You See.</span>
          </h1>
          <p className="text-[16px] text-slate-400 leading-relaxed max-w-sm">
            AI-powered media forensics for a more trustworthy digital world. Evidence-driven. Explainable. Verifiable.
          </p>

          <div className="mt-10 space-y-3">
            {[
              'Deepfake detection with frame-level precision',
              'Face morph analysis for identity verification',
              'Explainable AI with forensic evidence trails',
              'Cryptographic evidence chain of custody',
            ].map(point => (
              <div key={point} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 flex-shrink-0" />
                <span className="text-[13px] text-slate-400">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative flex items-center gap-3 text-[11px] text-slate-600">
          <Lock size={12} className="text-slate-700" />
          <span className="font-mono">TLS 1.3 ENCRYPTED · AUDIT LOGGED · SECURE SESSION</span>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <Shield size={22} className="text-cyan-400" />
            <span className="text-[13px] font-bold text-white font-display tracking-tight">AUTHENTIVISION</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-white font-display">Sign in</h2>
            <p className="text-[13px] text-slate-500 mt-1">Access the forensic analysis platform</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 mb-5">
              <div>
                <label htmlFor="email" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3.5 py-2.5 text-[13.5px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/[0.03] transition-all"
                  placeholder="you@organization.gov"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3.5 py-2.5 text-[13.5px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/[0.03] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(o => !o)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border border-white/[0.15] bg-transparent accent-cyan-400 cursor-pointer"
                />
                <span className="text-[12.5px] text-slate-400">Remember me</span>
              </label>
              <button type="button" className="text-[12.5px] text-cyan-400 hover:text-cyan-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-cyan-400 text-[#070A0F] font-semibold py-2.5 rounded-md hover:bg-cyan-300 disabled:opacity-60 transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.35)] text-[14px]"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-[#070A0F]/30 border-t-[#070A0F] rounded-full animate-spin" /> Authenticating…</>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#070A0F] px-3 text-[11px] text-slate-600">or</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-white/[0.08] text-slate-400 py-2.5 rounded-md hover:border-white/[0.15] hover:text-slate-200 transition-all text-[13px]"
          >
            <Shield size={14} className="text-slate-500" /> Continue with organization SSO
          </button>

          <p className="text-center text-[11px] text-slate-700 mt-8 font-mono">
            DEMO ENVIRONMENT — Any credentials accepted
          </p>
        </div>
      </div>
    </div>
  );
}
