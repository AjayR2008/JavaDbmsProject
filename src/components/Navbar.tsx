import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  Zap,
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  PlusCircle,
  Sliders,
  Trash2,
  ShieldAlert,
  Database,
  Terminal,
  RotateCcw,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenAuth }) => {
  const {
    users,
    currentUser,
    switchUser,
    canAddStation,
    canUpdateCharger,
    canRemoveStation,
    canAccessDbmsConsole,
    resetDatabase
  } = useDatabase();

  const roleBadgeStyles = {
    ADMIN: 'border-red-500 text-red-400 bg-red-950/40',
    OPERATOR: 'border-amber-500 text-amber-400 bg-amber-950/40',
    USER: 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
  }[currentUser.role];

  return (
    <header className="w-full no-print">
      {/* Top Brand Bar */}
      <div className="bg-[#062817] text-white px-4 md:px-7 py-3 border-b-2 border-[#a3e635] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-[#a3e635] tracking-wide flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#a3e635] fill-current" />
              EV Charging Station System
            </h1>
            <span className="bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635] px-2 py-0.5 text-[11px] font-semibold rounded uppercase tracking-wider">
              React + ACID Engine
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Role-Based Access Control (RBAC) &bull; Anna University / REC Dept of IT
          </p>
        </div>

        {/* User Session Switcher & Auth */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md border border-white/15">
            <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${roleBadgeStyles}`}>
              {currentUser.role}
            </span>

            <label htmlFor="user-switch" className="sr-only">Switch User</label>
            <select
              id="user-switch"
              value={currentUser.user_id}
              onChange={(e) => switchUser(Number(e.target.value))}
              className="bg-slate-900 text-slate-100 border border-slate-700 text-xs rounded px-2.5 py-1 outline-none cursor-pointer focus:border-[#a3e635]"
            >
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.role === 'ADMIN' ? '🛡️' : u.role === 'OPERATOR' ? '🔧' : '👤'} {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onTabChange('college-pdf')}
            className="inline-flex items-center gap-1.5 bg-[#5c1c72] hover:bg-[#72238c] text-amber-300 border border-amber-400/80 text-xs font-bold px-3 py-1.5 rounded transition shadow-sm"
            title="Open official Rajalakshmi Engineering College project report submission PDF"
          >
            <span>🎓</span>
            <span className="hidden sm:inline">College PDF Report</span>
            <span className="sm:hidden">Report</span>
          </button>

          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
            title="Log in with another account or register"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auth</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset database back to initial seed data?')) {
                resetDatabase();
              }
            }}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs px-2 py-1.5 rounded hover:bg-white/5 transition"
            title="Restore seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset DB</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="bg-[#0b3d22] text-[#d1fae5] flex overflow-x-auto px-4 md:px-7 border-b border-[#14532d] scrollbar-thin">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : 'border-transparent hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </button>

        <button
          onClick={() => onTabChange('stations')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'stations'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : 'border-transparent hover:text-white hover:bg-white/5'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          View Stations (All)
        </button>

        <button
          onClick={() => onTabChange('book')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'book'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : 'border-transparent hover:text-white hover:bg-white/5'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Reserve Slot (All)
        </button>

        <button
          onClick={() => onTabChange('add-station')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'add-station'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : canAddStation
              ? 'border-transparent hover:text-white hover:bg-white/5'
              : 'text-slate-400 opacity-60 border-transparent hover:bg-white/5'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {canAddStation ? 'Add Station' : '🔒 Add Station (Admin/Op)'}
        </button>

        <button
          onClick={() => onTabChange('update-charger')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'update-charger'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : canUpdateCharger
              ? 'border-transparent hover:text-white hover:bg-white/5'
              : 'text-slate-400 opacity-60 border-transparent hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {canUpdateCharger ? 'Update Charger' : '🔒 Update Charger (Admin/Op)'}
        </button>

        <button
          onClick={() => onTabChange('remove-station')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'remove-station'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : canRemoveStation
              ? 'border-transparent hover:text-white hover:bg-white/5'
              : 'text-slate-400 opacity-60 border-transparent hover:bg-white/5'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {canRemoveStation ? 'Decommission' : '🔒 Decommission (Admin)'}
        </button>

        <button
          onClick={() => onTabChange('roles')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'roles'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : 'border-transparent hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          RBAC Verification Matrix
        </button>

        <button
          onClick={() => onTabChange('dbms')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'dbms'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : canAccessDbmsConsole
              ? 'border-transparent hover:text-white hover:bg-white/5'
              : 'text-slate-400 opacity-60 border-transparent hover:bg-white/5'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          {canAccessDbmsConsole ? 'SQL Console' : '🔒 SQL Console (Admin)'}
        </button>

        <button
          onClick={() => onTabChange('swing-guide')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'swing-guide'
              ? 'text-[#a3e635] border-[#a3e635] bg-[#a3e635]/10 font-bold'
              : 'border-transparent hover:text-white hover:bg-white/5'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Swing Execution Guide
        </button>

        <button
          onClick={() => onTabChange('college-pdf')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap bg-gradient-to-r from-purple-900/60 to-emerald-900/60 ${
            activeTab === 'college-pdf'
              ? 'text-[#a3e635] border-[#a3e635] font-black'
              : 'text-amber-300 border-amber-400/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <span className="text-sm">🎓</span>
          <span>College PDF Submission (REC 2026)</span>
          <span className="px-1.5 py-0.2 bg-[#f5a623] text-purple-950 text-[10px] rounded font-extrabold uppercase">
            Official
          </span>
        </button>
      </nav>
    </header>
  );
};
