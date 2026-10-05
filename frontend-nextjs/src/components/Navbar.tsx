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
  Crown,
  CreditCard,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { HomePlan, UserRole, User } from '../types/plan';
import { hasActiveSubscription, getSubscriptionRemainingText } from '../services/subscriptionService';

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
  onOpenUpgradeModal?: () => void;
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
  onOpenUpgradeModal,
  theme = 'light',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const isAdmin = userRole === 'ADMIN' || currentUser?.role === 'ADMIN';

  return (
    <header className={`h-14 px-4 sm:px-6 flex items-center justify-between select-none z-30 relative transition-colors duration-200 ${
      isDark
        ? 'bg-[#0B0F17]/95 backdrop-blur border-b border-slate-800 text-slate-100'
        : 'bg-white/95 backdrop-blur border-b border-slate-200/80 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
    }`}>
      {/* 1. Left: Brand Mark */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs shrink-0">
          <Layers className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
            DecoForge
          </span>
          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border tracking-wider ${
            isAdmin
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60'
              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}>
            {isAdmin ? 'Admin Console' : userRole}
          </span>
        </div>
      </div>

      {/* 2. Center: Segmented Navigation Switcher */}
      {isAdmin ? (
        <nav className={`flex items-center p-1 rounded-xl border text-xs transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/70'
        }`}>
          <button
            onClick={() => {
              setActiveView('dashboard');
              if (setAdminTab) setAdminTab('overview');
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'dashboard'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
            <span>Admin Control Center</span>
          </button>

          <button
            onClick={() => {
              setActiveView('split');
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView !== 'dashboard'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Design Studio</span>
          </button>
        </nav>
      ) : (
        /* Regular Designers & Clients: Clean View Switcher */
        <nav className={`flex items-center p-1 rounded-xl border text-xs transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/70'
        }`}>
          <button
            onClick={() => setActiveView('split')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'split'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Split 2D / 3D</span>
          </button>

          <button
            onClick={() => setActiveView('2d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === '2d'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>2D CAD Blueprint</span>
          </button>

          <button
            onClick={() => setActiveView('3d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === '3d'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>3D Walkthrough</span>
          </button>
        </nav>
      )}

      {/* 3. Right: Telemetry Dot, Theme Toggle & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Real-time Telemetry Dot */}
        <div
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-1 rounded-lg"
          title={
            cloudSyncStatus === 'saving'
              ? 'Saving changes...'
              : cloudSyncStatus === 'offline'
              ? 'Database offline - using cache'
              : `Connected to cloud sync${lastSyncedAt ? ' (' + lastSyncedAt + ')' : ''}`
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              cloudSyncStatus === 'saving'
                ? 'bg-amber-500 animate-ping'
                : cloudSyncStatus === 'offline'
                ? 'bg-slate-400'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-[11px] font-medium">
            {cloudSyncStatus === 'saving' ? 'Saving' : cloudSyncStatus === 'offline' ? 'Offline' : 'Live'}
          </span>
        </div>

        {/* Regular User Studio Pass (Hidden for Admins) */}
        {!isAdmin && onOpenUpgradeModal && (
          <button
            onClick={onOpenUpgradeModal}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              hasActiveSubscription(currentUser)
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
            }`}
            title="Studio Pass Subscription"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {hasActiveSubscription(currentUser)
                ? getSubscriptionRemainingText(currentUser)
                : 'Get Pass (₹200 Trial)'}
            </span>
          </button>
        )}

        {/* Theme Switcher Toggle (Sun / Moon) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800 border-slate-800 bg-slate-900/60'
                : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100 border-slate-200/80 bg-slate-50'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        )}

        {/* User profile & Logout */}
        {currentUser && (
          <div className={`flex items-center gap-2 pl-2 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100/70 border-slate-200/80 text-slate-800'
            }`}>
              <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-semibold truncate max-w-[90px]">
                {currentUser.name}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border-slate-800 bg-slate-900/60'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200/80 bg-slate-50'
                }`}
                title="Sign Out"
                aria-label="Sign Out"
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
