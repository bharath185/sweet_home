'use client';

import React from 'react';
import {
  Layers,
  Sparkles,
  LayoutDashboard,
  Box,
  Users,
  Palette,
  LogOut,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { HomePlan, UserRole, User } from '../types/plan';

interface NavbarProps {
  plan: HomePlan;
  activeView: 'split' | '2d' | '3d' | 'customer' | 'dashboard';
  setActiveView: (v: 'split' | '2d' | '3d' | 'customer' | 'dashboard') => void;
  adminTab?: string;
  setAdminTab?: (t: any) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  cloudSyncStatus?: 'synced' | 'saving' | 'offline';
  lastSyncedAt?: string | null;
  currentUser?: User | null;
  onLogout?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  plan,
  activeView,
  setActiveView,
  adminTab = 'dashboard',
  setAdminTab,
  userRole,
  cloudSyncStatus = 'synced',
  lastSyncedAt,
  currentUser,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) => {
  // Determine active state for each of the 4 requested tabs
  const isDashboardActive =
    activeView === 'dashboard' &&
    (adminTab === 'dashboard' || adminTab === 'overview' || adminTab === 'floors' || !adminTab);
  const isStudioActive =
    activeView === 'split' || activeView === '2d' || activeView === '3d' || activeView === 'customer';
  const isCatalogActive = activeView === 'dashboard' && adminTab === 'catalog';
  const isUsersActive = activeView === 'dashboard' && adminTab === 'users';

  return (
    <header className="h-14 bg-[#0a1224] border-b border-slate-800/90 px-4 sm:px-6 flex items-center justify-between select-none z-30 shadow-xl relative text-white">
      {/* 1. Left Brand & Active Plan Title */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-[1px] shadow-sm shadow-sky-500/30 shrink-0">
          <div className="w-full h-full bg-[#091020] rounded-xl flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm tracking-tight truncate">
              Visual Rendered
            </span>
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full border shrink-0 ${
                userRole === 'ADMIN'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  : userRole === 'DESIGNER'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {userRole}
            </span>
          </div>

          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[170px]">
            {plan.name || 'Untitled Plan'}
          </span>
        </div>
      </div>

      {/* 2. Center Navigation Tabs (EXACTLY: Dashboard | Design Studio | 3D Catalog | Users & Roles) */}
      <nav className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => {
            setActiveView('dashboard');
            if (setAdminTab) setAdminTab('overview');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isDashboardActive
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Enterprise Overview, Analytics & Recent Projects"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        {/* Tab 2: Design Studio */}
        <button
          onClick={() => {
            setActiveView('split');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isStudioActive
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="2D CAD Blueprint & 3D WebGL Studio Workspace"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Design Studio</span>
        </button>

        {/* Tab 3: 3D Catalog */}
        <button
          onClick={() => {
            setActiveView('dashboard');
            if (setAdminTab) setAdminTab('catalog');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isCatalogActive
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="3D Model Assets Library & Custom Furniture"
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Catalog</span>
        </button>

        {/* Tab 4: Users & Roles */}
        <button
          onClick={() => {
            setActiveView('dashboard');
            if (setAdminTab) setAdminTab('users');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isUsersActive
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Team Roles, Client Portals & Permissions"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users & Roles</span>
        </button>
      </nav>

      {/* 3. Right Side: Cloud Sync & User Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time PostgreSQL Cloud Sync Status Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
            cloudSyncStatus === 'saving'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
              : cloudSyncStatus === 'offline'
              ? 'bg-slate-800 text-slate-400 border-slate-700'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}
          title={
            cloudSyncStatus === 'saving'
              ? 'Saving changes to cloud...'
              : cloudSyncStatus === 'offline'
              ? 'Database offline - saving to local cache'
              : `Cloud sync active${lastSyncedAt ? ' (Synced at ' + lastSyncedAt + ')' : ''}`
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              cloudSyncStatus === 'saving'
                ? 'bg-amber-400 animate-ping'
                : cloudSyncStatus === 'offline'
                ? 'bg-slate-500'
                : 'bg-emerald-400'
            }`}
          />
          <span>
            {cloudSyncStatus === 'saving'
              ? '💾 Auto-saving...'
              : cloudSyncStatus === 'offline'
              ? '⚠️ Local Cache'
              : '☁️ Synced'}
          </span>
        </div>

        {/* Theme Mode Switcher */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 transition flex items-center gap-1 cursor-pointer text-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="hidden sm:inline text-[11px] font-semibold">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>
        )}

        {/* User profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800"
              title={`Logged in as ${currentUser.name} (${currentUser.role})`}
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-sky-600'
                    : currentUser.role === 'DESIGNER'
                    ? 'bg-indigo-600'
                    : 'bg-emerald-600'
                }`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-200 truncate max-w-[85px]">
                {currentUser.name}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 bg-slate-900 transition"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
