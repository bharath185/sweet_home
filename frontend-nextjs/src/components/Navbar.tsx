'use client';

import React from 'react';
import {
  Layers,
  Box,
  Eye,
  Share2,
  Save,
  Download,
  PlusCircle,
  Sparkles,
  Server,
  LayoutDashboard,
  AlertTriangle,
  Menu,
  Settings,
  ImageIcon,
  Ruler,
  Undo2,
  Redo2,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { HomePlan, UserRole, User } from '../types/plan';

interface ClientProjectOption {
  id: string;
  name: string;
  clientName: string;
  role?: string;
}

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
  onToggleAdminSidebar: () => void;
  clientProjects?: ClientProjectOption[];
  onSelectClientProject?: (planId: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  currentUser?: import('../types/plan').User | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  plan,
  activeView,
  setActiveView,
  isBackendConnected,
  onSave,
  onNew,
  onExport,
  onOpenShare,
  onOpenBlueprint,
  onOpenPreferences,
  onOpenAddUserModal,
  onOpenCreateItemModal,
  isSaving,
  userRole,
  setUserRole,
  collidingCount,
  activeFloor,
  onFloorChange,
  onToggleAdminSidebar,
  clientProjects = [],
  onSelectClientProject,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  currentUser,
  onLogout,
}) => {
  const unit = plan.preferences?.unitSystem?.toUpperCase() || 'CM';

  return (
    <header className="h-14 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 flex items-center justify-between select-none z-30 shadow-sm shadow-slate-900/5 relative">
      {/* Brand, Admin Menu Toggle & Plan Title / Client Project Switcher */}
      <div className="flex items-center gap-3">
        {userRole !== 'CLIENT' && (
          <button
            onClick={onToggleAdminSidebar}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5 text-sky-600" />
          </button>
        )}

        <div className={`flex items-center justify-center w-8 h-8 rounded-xl text-white font-bold shadow-md ${
          userRole === 'ADMIN'
            ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-sky-500/25'
            : userRole === 'DESIGNER'
            ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/25'
            : 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/25'
        }`}>
          <Layers className="w-4 h-4" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              SweetHome <span className={userRole === 'CLIENT' ? 'text-emerald-600 font-semibold' : userRole === 'DESIGNER' ? 'text-indigo-600 font-semibold' : 'text-sky-600 font-semibold'}>
                {userRole === 'CLIENT' ? '3D Presentation' : userRole === 'DESIGNER' ? 'Design Studio' : 'CAD Studio'}
              </span>
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
              userRole === 'ADMIN'
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : userRole === 'DESIGNER'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {userRole}
            </span>
          </div>

          {/* Client Project Switcher Dropdown */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {userRole === 'CLIENT' ? 'Your Suite:' : 'Client:'}
            </span>
            {userRole !== 'CLIENT' && clientProjects.length > 0 && onSelectClientProject ? (
              <div className="flex items-center gap-1">
                <select
                  value={plan.id}
                  onChange={(e) => onSelectClientProject(e.target.value)}
                  className="bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg px-2.5 py-0.5 border border-slate-200 hover:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer max-w-[210px] truncate shadow-sm transition"
                  title="Switch Client Design Project"
                >
                  {clientProjects.map((cp) => (
                    <option key={cp.id} value={cp.id} className="bg-white text-slate-800">
                      {cp.clientName} — {cp.name}
                    </option>
                  ))}
                </select>
                {userRole === 'ADMIN' && onOpenAddUserModal && (
                  <button
                    onClick={onOpenAddUserModal}
                    className="px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold transition flex items-center gap-1"
                    title="Onboard New Client with Fresh Design"
                  >
                    <span>+ Client</span>
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs text-sky-700 font-semibold truncate max-w-[180px]">
                {plan.name || 'Untitled Home'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Viewport & Workspace Switches */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
        {/* Dashboard button strictly for ADMIN */}
        {userRole === 'ADMIN' && (
          <>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Admin Control Dashboard & User Directory"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dashboard</span>
            </button>
            <div className="w-[1px] h-4 bg-slate-300 mx-1" />
          </>
        )}

        {/* Studio CAD views for ADMIN & DESIGNER */}
        {userRole !== 'CLIENT' && (
          <>
            <button
              onClick={() => setActiveView('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'split'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="4-Pane CAD & 3D WebGL View"
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>2D / 3D Studio</span>
            </button>

            <button
              onClick={() => setActiveView('2d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === '2d'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Full 2D Floor Plan CAD Canvas"
            >
              <Box className="w-3.5 h-3.5 text-sky-600" />
              <span>2D Plan</span>
            </button>

            <button
              onClick={() => setActiveView('3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === '3d'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Full 3D WebGL Render View"
            >
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              <span>3D View</span>
            </button>

            <div className="w-[1px] h-4 bg-slate-300 mx-1" />
          </>
        )}

        {/* Client Tour for All */}
        <button
          onClick={() => setActiveView('customer')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeView === 'customer'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm font-bold'
              : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
          }`}
          title="Client Presentation & 3D Interactive Walkthrough"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Client Tour</span>
        </button>
      </div>

      {/* Action Controls, Unit Toggle & Settings */}
      <div className="flex items-center gap-2">
        {/* Undo & Redo History Controls - for Admin & Designer only */}
        {userRole !== 'CLIENT' && (
          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition flex items-center gap-1 ${
                canUndo
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-white shadow-2xs active:scale-95 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed opacity-50'
              }`}
              title="Undo Last Action (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition flex items-center gap-1 ${
                canRedo
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-white shadow-2xs active:scale-95 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed opacity-50'
              }`}
              title="Redo Next Action (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Unit & Preferences Button - for Admin & Designer only */}
        {userRole !== 'CLIENT' && (
          <button
            onClick={onOpenPreferences}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 transition shadow-sm"
            title="Units & Project Preferences"
          >
            <Ruler className="w-3.5 h-3.5 text-sky-600" />
            <span>{unit}</span>
            <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>
        )}

        {/* Blueprint Import Button - for Admin & Designer only */}
        {userRole !== 'CLIENT' && (
          <button
            onClick={onOpenBlueprint}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200 bg-slate-50 shadow-sm"
            title="Import Blueprint Scan (Background Image)"
          >
            <ImageIcon className="w-4 h-4 text-sky-600" />
          </button>
        )}

        {/* 3D Item Creator Studio Button - for Admin & Designer */}
        {userRole !== 'CLIENT' && onOpenCreateItemModal && (
          <button
            onClick={onOpenCreateItemModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 border border-sky-200 text-xs font-bold text-sky-800 transition shadow-2xs active:scale-95"
            title="Create New 3D Item with Design Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>+ 3D Item</span>
          </button>
        )}

        {/* Collision Status Indicator */}
        {collidingCount > 0 ? (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm animate-pulse"
            title={`${collidingCount} overlapping item(s)`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{collidingCount} Overlaps</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
            title="All clearances valid"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Valid</span>
          </div>
        )}

        {/* New Plan & Export JSON - for Admin & Designer */}
        {userRole !== 'CLIENT' && (
          <>
            <button
              onClick={onNew}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200 bg-slate-50 shadow-sm"
              title="Create New Blank Plan"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onExport}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200 bg-slate-50 shadow-sm"
              title="Export Plan JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
              title="Save Plan to Spring Boot backend"
            >
              <Save className="w-3.5 h-3.5 text-sky-600" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </>
        )}

        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition active:scale-95"
          title="Generate Shareable Client Link"
        >
          <Share2 className="w-4 h-4" />
          <span>Share 3D</span>
        </button>

        {/* User Profile & Logout Gate */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${
                currentUser.role === 'ADMIN'
                  ? 'bg-gradient-to-tr from-sky-600 to-indigo-600'
                  : currentUser.role === 'DESIGNER'
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
              }`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 leading-none truncate max-w-[110px]">
                  {currentUser.name}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                  currentUser.role === 'ADMIN'
                    ? 'text-sky-600'
                    : currentUser.role === 'DESIGNER'
                    ? 'text-indigo-600'
                    : 'text-emerald-600'
                }`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 bg-white shadow-2xs transition"
                title="Log out of session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

