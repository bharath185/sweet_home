'use client';

import React, { useState } from 'react';
import {
  Users,
  Box,
  Building,
  Activity,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  Layers,
  Search,
  Sliders,
  Shield,
  ArrowUpRight,
  UploadCloud,
  Eye,
  Camera,
  Compass,
  Zap,
  FolderKanban,
  Check,
  UserPlus,
  Sparkle,
  ArrowRight,
  Home,
  Palette,
  FileSpreadsheet
} from 'lucide-react';
import { User, CatalogItem, FloorTemplate, HomePlan, UserRole } from '../types/plan';
import { formatArea } from '../services/unitConverter';

interface AdminDashboardProps {
  users: User[];
  catalog: CatalogItem[];
  templates: FloorTemplate[];
  adminTab: 'overview' | 'users' | 'catalog' | 'floors';
  setAdminTab: (t: 'overview' | 'users' | 'catalog' | 'floors') => void;
  onOpenStudioWithTemplate: (templateId: string) => void;
  onOpenClientPlan?: (planId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onDeleteCatalogItem: (itemId: string) => void;
  onOpenAddItemModal: () => void;
  onOpenAddUserModal: () => void;
  plan: HomePlan;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  catalog,
  templates,
  adminTab,
  setAdminTab,
  onOpenStudioWithTemplate,
  onOpenClientPlan,
  onToggleUserStatus,
  onDeleteUser,
  onDeleteCatalogItem,
  onOpenAddItemModal,
  onOpenAddUserModal,
  plan,
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');

  const onlineUsersCount = users.filter((u) => u.isOnline).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const designerCount = users.filter((u) => u.role === 'DESIGNER').length;
  const clientCount = users.filter((u) => u.role === 'CLIENT').length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const allCategories = ['ALL', ...Array.from(new Set(catalog.map((i) => i.category)))];

  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = catalogCategory === 'ALL' || item.category === catalogCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate total plan floor area
  const totalFloorAreaSqM = plan.rooms.reduce((acc, r) => {
    if (r.areaSquareMeters) return acc + r.areaSquareMeters;
    if (r.points && r.points.length >= 3) {
      let a = 0;
      for (let i = 0; i < r.points.length; i++) {
        const j = (i + 1) % r.points.length;
        a += r.points[i].x * r.points[j].y;
        a -= r.points[j].x * r.points[i].y;
      }
      return acc + (Math.abs(a) / 2) * 0.0001;
    }
    return acc;
  }, 0);

  return (
    <div className="flex-1 bg-slate-50/60 flex flex-col overflow-y-auto p-6 lg:p-8 select-none space-y-6 custom-scrollbar">
      {/* 1. HERO HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 lg:p-8 text-white shadow-xl border border-slate-800/80">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Sweet Home 3D Core Active
              </span>
              <span className="text-[11px] font-semibold text-sky-300/80 bg-sky-900/40 px-3 py-1 rounded-full border border-sky-700/40">
                Spring Boot API :8090
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Architectural Command & Design Studio
            </h1>
            <p className="text-xs lg:text-sm text-slate-300/90 mt-1.5 max-w-2xl leading-relaxed">
              Real-time multi-floor CAD layout engine, realistic human eye-level 3D virtual walkthroughs, procedural ceiling library, and client management.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddUserModal}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xl border border-white/15 transition flex items-center gap-2 shadow-sm active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-sky-400" />
              <span>New Client</span>
            </button>

            <button
              onClick={onOpenAddItemModal}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xl border border-white/15 transition flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Box className="w-4 h-4 text-amber-400" />
              <span>Add 3D Item</span>
            </button>

            <button
              onClick={() => onOpenStudioWithTemplate('duplex_2floor')}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/30 border border-sky-400/30 transition flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open 2D/3D Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Users & Client Sessions */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 hover:border-sky-300 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Client & User Directory
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 flex items-baseline gap-2">
            <span>{onlineUsersCount} Online</span>
            <span className="text-xs font-semibold text-slate-400">/ {users.length} total</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold border border-sky-100">
              {adminCount} Admin
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
              {designerCount} Designer
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
              {clientCount} Clients
            </span>
          </div>
        </div>

        {/* Card 2: 3D Furniture & Lighting Catalog */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 hover:border-sky-300 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              3D CAD Catalog Items
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 flex items-baseline gap-2">
            <span>{catalog.length}</span>
            <span className="text-xs font-semibold text-slate-400">Procedural & OBJ</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>🪩 Ceiling & Lighting Ready</span>
            <span className="font-semibold text-sky-700">100% Scalable</span>
          </div>
        </div>

        {/* Card 3: Active Architecture & Multi-Floor */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 hover:border-sky-300 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Multi-Floor Architecture
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 flex items-baseline gap-2">
            <span>{plan.floors?.length || 2} Floors</span>
            <span className="text-xs font-semibold text-slate-400">({plan.rooms.length} Rooms)</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total Floor Area</span>
            <span className="font-bold text-slate-800">
              {totalFloorAreaSqM > 0 ? `${totalFloorAreaSqM.toFixed(1)} m²` : '185 m²'}
            </span>
          </div>
        </div>

        {/* Card 4: Design Health & Real-Time Sync */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 hover:border-sky-300 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Placed CAD Furniture
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 flex items-baseline gap-2">
            <span>{plan.furniture.length} Pieces</span>
            <span className="text-xs font-semibold text-slate-400">in scene</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {plan.walls.length} Walls Configured
            </span>
            <span className="text-slate-400">v2.4</span>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pt-2">
        <button
          onClick={() => setAdminTab('overview')}
          className={`pb-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            adminTab === 'overview'
              ? 'border-sky-600 text-sky-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Overview & Templates</span>
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`pb-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            adminTab === 'users'
              ? 'border-sky-600 text-sky-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('catalog')}
          className={`pb-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            adminTab === 'catalog'
              ? 'border-sky-600 text-sky-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>3D Catalog Manager</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            {catalog.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('floors')}
          className={`pb-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            adminTab === 'floors'
              ? 'border-sky-600 text-sky-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Multi-Floor Architecture</span>
        </button>
      </div>

      {/* 4. TAB 1: OVERVIEW & TEMPLATES */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Baseline Templates Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Ready-to-Use Architectural Templates
                </h3>
                <p className="text-xs text-slate-500">
                  Launch a pre-designed multi-floor template directly into the 2D CAD Studio or 3D Virtual Tour.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white hover:border-sky-400 rounded-3xl p-5 flex flex-col justify-between transition-all hover:shadow-lg group border border-slate-200/90 shadow-xs relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {tpl.floors} {tpl.floors === 1 ? 'Floor' : 'Floors'} • {tpl.area}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-sky-50 text-slate-400 group-hover:text-sky-600 flex items-center justify-center transition border border-slate-200/60 group-hover:border-sky-200">
                        <Building className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-sky-600 transition">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onOpenStudioWithTemplate(tpl.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-sky-600/20 active:scale-95"
                    >
                      <span>Open CAD Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Active Plan Status & Quick Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20 shrink-0">
                <Home className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{plan.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Design
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {plan.rooms.length} Rooms • {plan.furniture.length} Pieces • {plan.walls.length} Walls • Last Modified: {new Date(plan.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenStudioWithTemplate('duplex_2floor')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-2 border border-slate-200"
              >
                <Eye className="w-4 h-4 text-sky-600" />
                <span>2D Blueprint</span>
              </button>
              <button
                onClick={() => onOpenStudioWithTemplate('duplex_2floor')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>3D Virtual Tour</span>
              </button>
            </div>
          </div>

          {/* Real-time Collaboration & Online Users Feed */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Live Client & Designer Sessions
                </h3>
                <p className="text-xs text-slate-500">
                  Monitor active client sessions and collaborate directly on assigned architectural blueprints.
                </p>
              </div>
              <button
                onClick={onOpenAddUserModal}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-700 shadow-inner">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : u.role === 'DESIGNER'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>

                    <span className="text-[11px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                      {u.assignedPlan || 'Default Workspace'}
                    </span>

                    {onOpenClientPlan && u.assignedPlan && (
                      <button
                        onClick={() => onOpenClientPlan(u.assignedPlan!)}
                        className="text-[11px] px-3 py-1 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-semibold transition flex items-center gap-1 border border-sky-200 hover:border-transparent"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Open Design</span>
                      </button>
                    )}

                    <button
                      onClick={() => onToggleUserStatus(u.id)}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                    >
                      {u.isOnline ? 'Simulate Offline' : 'Simulate Online'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: USER DIRECTORY */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-2xs">
              {(['ALL', 'ADMIN', 'DESIGNER', 'CLIENT'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3.5 py-1.5 rounded-xl transition font-semibold ${
                    roleFilter === r
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Floor Plan</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : u.role === 'DESIGNER'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                          }`}
                        />
                        <span className={u.isOnline ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {u.isOnline ? 'Active Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {u.assignedPlan || 'Default Plan'}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      {onOpenClientPlan && u.assignedPlan && (
                        <button
                          onClick={() => onOpenClientPlan(u.assignedPlan!)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white text-[11px] font-semibold transition inline-flex items-center gap-1 border border-sky-200 hover:border-transparent"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Open Design</span>
                        </button>
                      )}
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] border border-slate-200 transition"
                      >
                        Toggle Status
                      </button>
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 3: 3D CATALOG MANAGER */}
      {adminTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search furniture, lights, ceiling items..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddItemModal}
                className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 border border-sky-500/30 transition flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add 3D Model / Ceiling Item</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatalogCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  catalogCategory === cat
                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="bg-white hover:border-sky-400 rounded-3xl p-3.5 flex flex-col justify-between transition-all group relative border border-slate-200/90 shadow-2xs hover:shadow-md"
              >
                <div className="w-full h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-2 mb-2 relative border border-slate-100 group-hover:border-sky-200 transition">
                  {item.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.icon} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow" />
                  ) : (
                    <Box className="w-10 h-10 text-slate-400 group-hover:text-sky-500 transition" />
                  )}

                  {item.placementType === 'ceiling' && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold shadow-xs">
                      🪩 Ceiling
                    </span>
                  )}

                  {item.isCustom && (
                    <span className="absolute top-1.5 right-1.5 text-[9px] px-2 py-0.5 rounded-full bg-sky-600 text-white font-bold shadow-xs">
                      Custom
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-extrabold text-slate-900 truncate group-hover:text-sky-600 transition">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-semibold">
                    {Math.round(item.width)}×{Math.round(item.depth)}×{Math.round(item.height)} cm
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-medium mt-1 inline-block">
                    {item.category}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.defaultColor && (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: item.defaultColor }}
                      />
                    )}
                    <span className="text-[9px] font-mono text-slate-400 truncate max-w-[65px]">
                      {item.placementType || 'floor'}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteCatalogItem(item.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                    title="Remove from Catalog"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 4: MULTI-FLOOR ARCHITECTURE */}
      {adminTab === 'floors' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1.5">
              Multi-Floor Building Levels Configuration
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Inspect active floor levels, heights, elevations, and ceiling mounting heights for the CAD Studio.
            </p>

            <div className="space-y-3">
              {(plan.floors || [
                { level: 0, name: 'Ground Floor', elevation: 0, height: 250 },
                { level: 1, name: '1st Floor', elevation: 250, height: 250 }
              ]).map((fl) => (
                <div
                  key={fl.level}
                  className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-sky-500/20">
                      L{fl.level}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{fl.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        Base Elevation: {fl.elevation || fl.level * 250} cm • Ceiling Height: {fl.height || 250} cm
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Side-by-Side 3D Enabled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
