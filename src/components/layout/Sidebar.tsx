import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Plus, Film, Image, User, Layers, Clock, Shield,
  BarChart2, Cpu, Vault, FolderOpen, FileText, Settings, Terminal,
  Activity, HelpCircle, ChevronRight, X, Eye
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={15} /> },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { label: 'New Analysis', path: '/analysis/new', icon: <Plus size={15} /> },
      { label: 'Video Analysis', path: '/analysis/video', icon: <Film size={15} /> },
      { label: 'Image Analysis', path: '/analysis/image', icon: <Image size={15} /> },
      { label: 'Face Morph', path: '/analysis/face-morph', icon: <User size={15} /> },
      { label: 'Batch Analysis', path: '/analysis/batch', icon: <Layers size={15} /> },
      { label: 'History', path: '/analysis/history', icon: <Clock size={15} /> },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Threat Intelligence', path: '/threat-intelligence', icon: <Shield size={15} /> },
      { label: 'Detection Insights', path: '/insights', icon: <BarChart2 size={15} /> },
      { label: 'Model Performance', path: '/model-performance', icon: <Cpu size={15} /> },
    ],
  },
  {
    label: 'Evidence',
    items: [
      { label: 'Evidence Vault', path: '/evidence', icon: <Vault size={15} /> },
      { label: 'Case Management', path: '/cases', icon: <FolderOpen size={15} /> },
      { label: 'Reports', path: '/reports', icon: <FileText size={15} /> },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: <Settings size={15} /> },
      { label: 'Activity Log', path: '/activity', icon: <Activity size={15} /> },
      { label: 'Help & Docs', path: '/help', icon: <HelpCircle size={15} /> },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[220px] bg-[#0A0F17] border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06] flex-shrink-0">
          <a href="/" className="flex items-center gap-2.5 focus-visible:outline-none">
            <LogoMark />
            <div>
              <div className="text-[13px] font-bold tracking-tight text-white font-display leading-none">AUTHENTIVISION</div>
              <div className="text-[9px] text-cyan-400/70 tracking-[0.15em] uppercase font-mono mt-0.5">AI MEDIA FORENSICS</div>
            </div>
          </a>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white p-1 rounded" aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Navigation sections">
          {navSections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-slate-600 px-2 mb-1.5 font-display">
                {section.label}
              </p>
              <ul role="list" className="space-y-0.5">
                {section.items.map((item) => {
                  const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center justify-between gap-2.5 px-2.5 py-2 rounded text-[12.5px] font-medium transition-all duration-150 group ${
                          active
                            ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/15'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}>{item.icon}</span>
                          {item.label}
                        </span>
                        {active && <ChevronRight size={11} className="text-cyan-400/60" />}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Demo indicator */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2 bg-amber-400/5 border border-amber-400/15 rounded px-2.5 py-2">
            <Terminal size={10} className="text-amber-400 flex-shrink-0" />
            <span className="text-[10px] font-mono text-amber-400/80 tracking-wide">DEMO ENVIRONMENT</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function LogoMark() {
  return (
    <div className="w-8 h-8 flex-shrink-0 relative">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Shield base */}
        <path d="M16 2L4 7v9c0 6.6 5.1 12.8 12 14.3C23 28.8 28 22.6 28 16V7L16 2z" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.5)" strokeWidth="1.2" strokeLinejoin="round"/>
        {/* Eye */}
        <ellipse cx="16" cy="16" rx="5" ry="3.5" stroke="rgba(0,212,255,0.9)" strokeWidth="1.2"/>
        <circle cx="16" cy="16" r="2" fill="#00D4FF"/>
        {/* Neural dots */}
        <circle cx="9" cy="12" r="0.8" fill="rgba(0,212,255,0.4)"/>
        <circle cx="23" cy="12" r="0.8" fill="rgba(0,212,255,0.4)"/>
        <circle cx="9" cy="20" r="0.8" fill="rgba(0,212,255,0.4)"/>
        <circle cx="23" cy="20" r="0.8" fill="rgba(0,212,255,0.4)"/>
        {/* Lines */}
        <line x1="11" y1="16" x2="9" y2="12" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
        <line x1="21" y1="16" x2="23" y2="12" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
        <line x1="11" y1="16" x2="9" y2="20" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
        <line x1="21" y1="16" x2="23" y2="20" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
      </svg>
    </div>
  );
}
