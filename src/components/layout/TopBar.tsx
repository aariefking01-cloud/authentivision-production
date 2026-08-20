import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, CheckCheck, AlertTriangle, CheckCircle2, Info, Shield, LogOut } from 'lucide-react';
import { notifications as mockNotifications } from '../../data/mockData';
import type { Notification } from '../../types';
import { useAuth, type UserRole } from '../../lib/firebase/auth';

interface TopBarProps {
  onMenuClick: () => void;
  onCommandOpen: () => void;
}

export function TopBar({ onMenuClick, onCommandOpen }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { profile, logout, updateRole } = useAuth();
  const navigate = useNavigate();

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRoleChange = async (role: UserRole) => {
    await updateRole(role);
    setProfileOpen(false);
  };

  const notifIcon = (type: Notification['type']) => {
    const cls = 'w-4 h-4 flex-shrink-0';
    if (type === 'error') return <AlertTriangle className={`${cls} text-red-400`} />;
    if (type === 'warning') return <AlertTriangle className={`${cls} text-amber-400`} />;
    if (type === 'success') return <CheckCircle2 className={`${cls} text-emerald-400`} />;
    return <Info className={`${cls} text-blue-400`} />;
  };

  const currentInitials = profile?.displayName
    ? profile.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AV';

  return (
    <header className="h-14 border-b border-white/[0.06] bg-[#070A0F]/95 backdrop-blur-sm flex items-center px-4 gap-3 z-30 flex-shrink-0">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:text-white p-1.5 rounded transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Search trigger */}
      <button
        onClick={onCommandOpen}
        className="flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] rounded-md px-3 py-1.5 text-slate-500 hover:text-slate-300 transition-all duration-150 flex-1 max-w-xs text-left"
        aria-label="Open command palette"
      >
        <Search size={13} />
        <span className="text-[12.5px]">Search cases, analyses, evidence…</span>
        <kbd className="ml-auto text-[10px] text-slate-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08] font-mono">⌘K</kbd>
      </button>

      <div className="flex-1" />

      {/* Role Badge */}
      {profile && (
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
          <Shield size={12} className="text-cyan-400" />
          <span>{profile.role}</span>
        </div>
      )}

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
          className="relative p-2 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          aria-label={`Notifications (${unread} unread)`}
          aria-expanded={notifOpen}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-[#070A0F]" aria-hidden="true" />
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-[340px] bg-[#0C1118] border border-white/[0.08] rounded-lg shadow-2xl overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div>
                <p className="text-[13px] font-semibold text-white font-display">Notifications</p>
                {unread > 0 && <p className="text-[11px] text-slate-500">{unread} unread</p>}
              </div>
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
              {notifs.map(n => (
                <li key={n.id} className={`px-4 py-3 hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-cyan-400/[0.03]' : ''}`}>
                  <div className="flex gap-3">
                    {notifIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-slate-200">{n.title}</p>
                      <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1 font-mono">{n.time}</p>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
          className="flex items-center gap-2 p-1.5 pr-2.5 rounded-md hover:bg-white/[0.06] transition-all"
          aria-label="User profile"
          aria-expanded={profileOpen}
        >
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white font-mono">
            {currentInitials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[12px] font-medium text-slate-200 leading-tight">{profile?.displayName || 'M. Okonkwo'}</p>
            <p className="text-[10px] text-slate-500 capitalize">{profile?.role ? profile.role.toLowerCase() : 'Investigator'}</p>
          </div>
          <ChevronDown size={12} className="text-slate-500 hidden sm:block" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-[#0C1118] border border-white/[0.08] rounded-lg shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-[13px] font-semibold text-white">{profile?.displayName || 'M. Okonkwo'}</p>
              <p className="text-[11px] text-slate-500">{profile?.email || 'analyst@forensics.gov'}</p>
              <p className="text-[10px] text-cyan-400 font-mono mt-1">{profile?.organizationName || 'Federal Forensic Bureau'}</p>
            </div>

            <div className="px-4 py-2 border-b border-white/[0.06]">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Switch Active Role</p>
              <div className="grid grid-cols-2 gap-1">
                {(['INVESTIGATOR', 'ANALYST', 'REVIEWER', 'ADMIN'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`text-[10.5px] px-2 py-1 rounded text-left font-mono transition-colors ${
                      profile?.role === r ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {[['Settings', '/settings'], ['Activity Log', '/activity'], ['Help', '/help']].map(([label, path]) => (
              <Link key={path} to={path} onClick={() => setProfileOpen(false)} className="flex items-center px-4 py-2.5 text-[12.5px] text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors">
                {label}
              </Link>
            ))}
            <div className="border-t border-white/[0.06] p-2">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 rounded text-[12.5px] text-red-400 hover:bg-red-400/10 transition-colors">
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
