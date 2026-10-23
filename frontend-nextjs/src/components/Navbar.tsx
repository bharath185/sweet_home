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
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { HomePlan, UserRole, User } from '../types/plan';
import { hasActiveSubscription, getSubscriptionRemainingText, isUserOnFreeTrial } from '../services/subscriptionService';
import { APP_NAME } from '../constants/app';

interface NavbarProps {
  plan: HomePlan;
  activeView: 'split' | '2d' | '3d' | 'customer' | 'dashboard';
  setActiveView: (v: 'split' | '2d' | '3d' | 'customer' | 'dashboard') => void;
  studioLayout?: 'sweethome' | 'split' | '2d' | '3d' | 'tour';
  setStudioLayout?: (layout: 'sweethome' | 'split' | '2d' | '3d' | 'tour') => void;
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
  onOpenWelcomeGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  plan,
  activeView,
  setActiveView,
  studioLayout = 'split',
  setStudioLayout,
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
  onOpenWelcomeGuide,
}) => {
  const isDark = theme === 'dark';

  const isAdmin = userRole === 'ADMIN' || currentUser?.role === 'ADMIN';

  return (
    <header className={`h-11 px-3 sm:px-4 flex items-center justify-between select-none z-30 relative transition-colors duration-200 ${
      isDark
        ? 'bg-[#0B0F17]/95 backdrop-blur border-b border-slate-800 text-slate-100'
        : 'bg-white/95 backdrop-blur border-b border-slate-200/80 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
    }`}>
      {/* 1. Left: Brand Mark */}
      <div className="flex items-center gap-2.5 min-w-[180px]">
        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs shrink-0">
          <Layers className="w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
            <span>{APP_NAME}</span>
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

      {/* 2. Center: Navigation or Studio Title */}
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
              if (setStudioLayout) setStudioLayout('split');
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
        /* Regular Designers & Clients: Elegant Studio Project Breadcrumb */
        <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800/90' : 'bg-slate-100/80 border-slate-200/70'
        }`}>
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>{APP_NAME} Design Studio</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[220px]">
            {plan.name || 'Custom Home Plan'}
          </span>
        </div>
      )}

      {/* 3. Right: Telemetry Dot, Theme Toggle & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Header Save State Indicator */}
        <div
          className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
            cloudSyncStatus === 'saving'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300'
              : cloudSyncStatus === 'offline'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
          }`}
          title={
            cloudSyncStatus === 'saving'
              ? 'Saving changes to cloud...'
              : cloudSyncStatus === 'offline'
              ? 'Cloud sync unreachable. All changes saved safely in local storage.'
              : `All changes saved${lastSyncedAt ? ' (' + lastSyncedAt + ')' : ''}`
          }
        >
          {cloudSyncStatus === 'saving' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />
              <span className="text-[11px] font-semibold">Saving...</span>
            </>
          ) : cloudSyncStatus === 'offline' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              <span className="text-[11px] font-semibold">Saved locally</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[11px] font-semibold">Saved</span>
            </>
          )}
        </div>

        {/* Beginner & Customer Quick Guide */}
        {onOpenWelcomeGuide && (
          <button
            onClick={onOpenWelcomeGuide}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isDark
                ? 'bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-700/60 text-indigo-300'
                : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
            }`}
            title="Open Beginner & Customer Design Guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">💡 How to Design</span>
            <span className="sm:hidden">💡 Help</span>
          </button>
        )}

        {/* Regular User Studio Pass & Free Trial Upgrade Button */}
        {!isAdmin && onOpenUpgradeModal && (
          <button
            onClick={onOpenUpgradeModal}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isUserOnFreeTrial(currentUser)
                ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 text-amber-700 border-amber-500/40 hover:border-amber-500 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-700/60 hover:scale-[1.02]'
                : hasActiveSubscription(currentUser)
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
            }`}
            title="Studio Pass & Upgrade Options"
          >
            {isUserOnFreeTrial(currentUser) ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{getSubscriptionRemainingText(currentUser)}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Upgrade
                </span>
              </>
            ) : (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {hasActiveSubscription(currentUser)
                    ? getSubscriptionRemainingText(currentUser)
                    : 'Upgrade to Pro'}
                </span>
              </>
            )}
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
