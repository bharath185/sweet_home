'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Box,
  Building,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Pin,
  PinOff,
  PlusCircle,
  Activity,
  LogOut
} from 'lucide-react';
import { UserRole } from '../types/plan';

interface AdminSidebarProps {
  currentView: 'dashboard' | 'studio' | 'customer';
  setCurrentView: (view: 'dashboard' | 'studio' | 'customer') => void;
  adminTab: 'overview' | 'users' | 'catalog' | 'floors';
  setAdminTab: (tab: 'overview' | 'users' | 'catalog' | 'floors') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onlineCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenAddItemModal: () => void;
  onOpenAddUserModal: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  setCurrentView,
  adminTab,
  setAdminTab,
  userRole,
  setUserRole,
  onlineCount,
  isOpen,
  setIsOpen,
  onOpenAddItemModal,
  onOpenAddUserModal,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpen || isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-white/95 backdrop-blur-xl border-r border-slate-200/90 transition-all duration-300 ease-in-out flex flex-col z-30 select-none shadow-sm shadow-slate-900/5 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header / Brand */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {isExpanded && (
            <div className="flex flex-col overflow-hidden animate-in fade-in duration-200">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight truncate">
                Admin Center
              </span>
              <span className="text-[10px] text-sky-600 font-semibold truncate">
                Control & Multi-Floor Studio
              </span>
            </div>
          )}
        </div>

        {isExpanded && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-1.5 rounded-xl transition shrink-0 ${
              isOpen
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={isOpen ? 'Unpin Sidebar (Auto-collapse on mouse leave)' : 'Pin Sidebar Open'}
          >
            {isOpen ? <Pin className="w-3.5 h-3.5 rotate-45" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Role Switcher Pill */}
      {isExpanded && (
        <div className="p-3 border-b border-slate-200 bg-slate-50/40 animate-in fade-in duration-200">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Active Workspace Role
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-xl text-[11px] font-semibold">
            {(['ADMIN', 'DESIGNER', 'CLIENT'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setUserRole(r)}
                className={`py-1 rounded-lg text-center transition ${
                  userRole === r
                    ? r === 'ADMIN'
                      ? 'bg-white text-sky-700 shadow-sm font-bold'
                      : r === 'DESIGNER'
                      ? 'bg-white text-indigo-700 shadow-sm font-bold'
                      : 'bg-white text-emerald-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {r === 'ADMIN' ? 'Admin' : r === 'DESIGNER' ? 'Designer' : 'Client'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {/* Workspace Views */}
        <div className={`px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold ${!isExpanded ? 'text-center' : ''}`}>
          {isExpanded ? 'Workspaces' : '•'}
        </div>

        <button
          onClick={() => {
            setCurrentView('dashboard');
            setAdminTab('overview');
          }}
          className={`w-full flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-semibold transition ${
            currentView === 'dashboard'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
          }`}
          title="Admin Control Dashboard"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0 text-sky-600" />
          {isExpanded && <span className="truncate">Admin Dashboard</span>}
        </button>

        <button
          onClick={() => setCurrentView('studio')}
          className={`w-full flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-semibold transition ${
            currentView === 'studio'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
          }`}
          title="2D CAD & 3D WebGL Design Studio"
        >
          <Layers className="w-4 h-4 shrink-0 text-sky-600" />
          {isExpanded && <span className="truncate">CAD Design Studio</span>}
        </button>

        <button
          onClick={() => setCurrentView('customer')}
          className={`w-full flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-semibold transition ${
            currentView === 'customer'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
          }`}
          title="Customer 3D Virtual Tour & Customizer"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          {isExpanded && <span className="truncate">Client 3D Tour</span>}
        </button>

        {/* Admin Management Tabs */}
        {userRole === 'ADMIN' && (
          <>
            <div className={`px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold ${!isExpanded ? 'text-center' : ''}`}>
              {isExpanded ? 'Admin Management' : '•'}
            </div>

            <button
              onClick={() => {
                setCurrentView('dashboard');
                setAdminTab('users');
              }}
              className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-semibold transition ${
                currentView === 'dashboard' && adminTab === 'users'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
              title={`User Directory (${onlineCount} Online)`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0 text-sky-600" />
                {isExpanded && <span className="truncate">User Directory</span>}
              </div>
              {isExpanded && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shrink-0">
                  {onlineCount} Online
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentView('dashboard');
                setAdminTab('catalog');
              }}
              className={`w-full flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-semibold transition ${
                currentView === 'dashboard' && adminTab === 'catalog'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
              title="Furniture & 3D Item Manager"
            >
              <Box className="w-4 h-4 shrink-0 text-sky-600" />
              {isExpanded && <span className="truncate">Item & 3D Catalog</span>}
            </button>

            <button
              onClick={() => {
                setCurrentView('dashboard');
                setAdminTab('floors');
              }}
              className={`w-full flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-semibold transition ${
                currentView === 'dashboard' && adminTab === 'floors'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
              title="Multi-Floor Levels & Initial Templates"
            >
              <Building className="w-4 h-4 shrink-0 text-sky-600" />
              {isExpanded && <span className="truncate">Floor Templates</span>}
            </button>
          </>
        )}
      </div>

      {/* Quick Action Buttons at Bottom */}
      {isExpanded && userRole === 'ADMIN' && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 animate-in fade-in duration-200">
          <button
            onClick={onOpenAddItemModal}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add / Import 3D Item</span>
          </button>

          <button
            onClick={onOpenAddUserModal}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>Create New User</span>
          </button>
        </div>
      )}

      {/* Live Server Indicator */}
      <div className={`p-3 border-t border-slate-200 flex items-center ${isExpanded ? 'gap-2 px-3' : 'justify-center px-0'} text-[11px] text-slate-600 bg-slate-50`}>
        <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
        {isExpanded && (
          <span className="truncate font-medium animate-in fade-in duration-150">Spring Boot 8090 Connected</span>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
