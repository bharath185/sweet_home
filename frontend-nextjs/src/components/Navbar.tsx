'use client';

import React from 'react';
import {
  Layers,
  Sparkles,
  LayoutDashboard,
  Save,
  Share2,
  Undo2,
  Redo2,
  LogOut,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { HomePlan, UserRole, User } from '../types/plan';

interface NavbarProps {
  plan: HomePlan;
  activeView: 'split' | '2d' | '3d' | 'customer' | 'dashboard';
  setActiveView: (v: 'split' | '2d' | '3d' | 'customer' | 'dashboard') => void;
  isBackendConnected: boolean;
  onSave: () => void;
  onNew: () => void;
  onExport: () => void;
  onOpenShare: () => void;
  onOpenBlueprint: () => void;
  onOpenPreferences: () => void;
  onOpenAddUserModal?: () => void;
  onOpenCreateItemModal?: () => void;
  isSaving: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  collidingCount: number;
  activeFloor: number;
  onFloorChange: (floor: number) => void;
  onToggleAdminSidebar?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  clientProjects?: any[];
  onSelectClientProject?: (planId: string) => void;
  onOpenClientSelectModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  plan,
  activeView,
  setActiveView,
  onSave,
  onOpenShare,
  onOpenPreferences,
  isSaving,
  userRole,
  collidingCount,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="h-14 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between select-none z-30 shadow-2xs relative">
      {/* 1. Left Brand & Active Plan Title (Clean & uncluttered) */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-xl text-white font-bold shadow-sm ${
            userRole === 'ADMIN'
              ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-sky-500/20'
              : userRole === 'DESIGNER'
              ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/20'
              : 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20'
          }`}
        >
          <Layers className="w-4 h-4" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              SweetHome
            </span>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                userRole === 'ADMIN'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : userRole === 'DESIGNER'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {userRole}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[220px]">
            {plan.name || 'Untitled Plan'}
          </span>
        </div>
      </div>

      {/* 2. Center View Switches (Compact & Beautifully Aligned) */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
        {/* Dashboard button for ADMIN */}
        {userRole === 'ADMIN' && (
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'dashboard'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Dashboard & Client Projects Directory"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dashboard</span>
          </button>
        )}

        {/* Studio CAD view for ADMIN & DESIGNER */}
        {userRole !== 'CLIENT' && (
          <button
            onClick={() => setActiveView('split')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'split' || activeView === '2d' || activeView === '3d'
                ? 'bg-white text-sky-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="2D CAD & 3D Interactive Studio"
          >
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>2D / 3D Studio</span>
          </button>
        )}

        {/* Client Tour for All */}
        <button
          onClick={() => setActiveView('customer')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeView === 'customer'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs font-bold'
              : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
          }`}
          title="Client Presentation & 3D Virtual Tour"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Client Tour</span>
        </button>
      </div>

      {/* 3. Right Side Actions (Cleanly aligned without clutter) */}
      <div className="flex items-center gap-2.5">
        {/* Undo & Redo (for Admin & Designer) */}
        {userRole !== 'CLIENT' && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition ${
                canUndo
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-white active:scale-95 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed opacity-40'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition ${
                canRedo
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-white active:scale-95 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed opacity-40'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Preferences / Settings */}
        {userRole !== 'CLIENT' && (
          <button
            onClick={onOpenPreferences}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200 bg-slate-50 shadow-2xs"
            title="Project Preferences & Grid Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Collision Warning indicator if any */}
        {collidingCount > 0 && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
            title={`${collidingCount} overlapping item(s)`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>${collidingCount} Overlap</span>
          </div>
        )}

        {/* Save Plan Button */}
        {userRole !== 'CLIENT' && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition active:scale-95 disabled:opacity-50"
            title="Save plan to backend"
          >
            <Save className="w-3.5 h-3.5 text-sky-600" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        )}

        {/* Share 3D Link */}
        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm shadow-sky-600/20 transition active:scale-95"
          title="Share 3D Client Presentation Link"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* User profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200"
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
              <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">
                {currentUser.name}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 bg-white shadow-2xs transition"
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
