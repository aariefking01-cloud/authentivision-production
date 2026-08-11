import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Film, Image, User, FolderOpen, FileText, BarChart2, Settings, Activity, X, ArrowRight } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  category: string;
  path: string;
  icon: React.ReactNode;
  keywords?: string[];
}

const commands: Command[] = [
  { id: '1', label: 'New Analysis', category: 'Actions', path: '/analysis/new', icon: <Plus size={14} />, keywords: ['analyze', 'upload', 'start'] },
  { id: '2', label: 'Dashboard', category: 'Navigation', path: '/dashboard', icon: <BarChart2 size={14} /> },
  { id: '3', label: 'Video Analysis', category: 'Navigation', path: '/analysis/video', icon: <Film size={14} /> },
  { id: '4', label: 'Image Analysis', category: 'Navigation', path: '/analysis/image', icon: <Image size={14} /> },
  { id: '5', label: 'Face Morph Analysis', category: 'Navigation', path: '/analysis/face-morph', icon: <User size={14} /> },
  { id: '6', label: 'Batch Analysis', category: 'Navigation', path: '/analysis/batch', icon: <BarChart2 size={14} /> },
  { id: '7', label: 'Case Management', category: 'Navigation', path: '/cases', icon: <FolderOpen size={14} /> },
  { id: '8', label: 'Evidence Vault', category: 'Navigation', path: '/evidence', icon: <FileText size={14} /> },
  { id: '9', label: 'Reports', category: 'Navigation', path: '/reports', icon: <FileText size={14} /> },
  { id: '10', label: 'Detection Insights', category: 'Intelligence', path: '/insights', icon: <BarChart2 size={14} /> },
  { id: '11', label: 'Settings', category: 'System', path: '/settings', icon: <Settings size={14} /> },
  { id: '12', label: 'Activity Log', category: 'System', path: '/activity', icon: <Activity size={14} /> },
  { id: '13', label: 'Open Case AV-0092', category: 'Recent', path: '/cases', icon: <FolderOpen size={14} />, keywords: ['case', '0092', 'mirage'] },
  { id: '14', label: 'Analysis History', category: 'Navigation', path: '/analysis/history', icon: <Activity size={14} /> },
  { id: '15', label: 'Model Performance', category: 'Intelligence', path: '/model-performance', icon: <BarChart2 size={14} /> },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = query
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.keywords?.some(k => k.includes(query.toLowerCase()))
      )
    : commands;

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelected(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, filtered.length - 1));
      if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0));
      if (e.key === 'Enter' && filtered[selected]) {
        navigate(filtered[selected].path);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selected, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] bg-[#0C1118] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden animate-fade-up">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
          <Search size={15} className="text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search cases, analyses, commands…"
            className="flex-1 bg-transparent text-[13.5px] text-slate-200 placeholder-slate-600 outline-none"
            aria-label="Command search"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white p-0.5 rounded">
              <X size={14} />
            </button>
          )}
          <kbd className="text-[10px] text-slate-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08] font-mono flex-shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 text-[12.5px] py-8">No results found for "{query}"</p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-600">{category}</p>
                {items.map((cmd) => {
                  const idx = filtered.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => { navigate(cmd.path); onClose(); }}
                      onMouseEnter={() => setSelected(idx)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                        idx === selected ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={idx === selected ? 'text-cyan-400' : 'text-slate-500'}>{cmd.icon}</span>
                        <span className="text-[13px]">{cmd.label}</span>
                      </span>
                      {idx === selected && <ArrowRight size={13} className="text-cyan-400/60" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/[0.06] px-4 py-2 flex gap-4 text-[10px] text-slate-600">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
