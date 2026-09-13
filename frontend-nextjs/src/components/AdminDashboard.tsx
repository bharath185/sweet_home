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
  Sparkles,
  Layers,
  Search,
  ArrowRight,
  Home,
  UserPlus,
  Eye,
  FolderKanban,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  UploadCloud
} from 'lucide-react';
import { User, CatalogItem, FloorTemplate, HomePlan, UserRole } from '../types/plan';

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
  onOpenClientSelectModal?: () => void;
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
  onOpenClientSelectModal,
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
    <div className="flex-1 bg-slate-50/70 flex flex-col overflow-y-auto p-4 sm:p-5 lg:p-6 select-none space-y-4 custom-scrollbar">
      {/* 1. COMPACT HERO BANNER & EASY ACCESS BAR */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-4 lg:p-5 text-white shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Architecture Engine v2.4
              </span>
              <span className="text-[10px] font-semibold text-sky-300/80 bg-sky-900/40 px-2 py-0.5 rounded-full border border-sky-700/40">
                Spring Boot API :8090
              </span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white">
              Command & Studio Hub
            </h1>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddUserModal}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold backdrop-blur-md border border-white/15 transition flex items-center gap-1.5 active:scale-95 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>New Client</span>
            </button>

            <button
              onClick={onOpenAddItemModal}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold backdrop-blur-md border border-white/15 transition flex items-center gap-1.5 active:scale-95 shadow-2xs"
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>Add 3D Item</span>
            </button>

            <button
              onClick={() => {
                if (onOpenClientSelectModal) {
                  onOpenClientSelectModal();
                } else {
                  onOpenStudioWithTemplate('duplex_2floor');
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-[11px] font-bold shadow-sm shadow-sky-500/20 border border-sky-400/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open 2D/3D Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. COMPACT EXECUTIVE STATS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Users
            </span>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {onlineUsersCount} Online <span className="text-[11px] font-normal text-slate-400">({users.length} total)</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9px] font-bold">
              <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-100">{adminCount} Adm</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">{designerCount} Des</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">{clientCount} Cli</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              3D CAD Catalog
            </span>
            <div className="text-base sm:text-lg font-black text-sky-600 mt-0.5">
              {catalog.length} Models
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              🪩 Ceiling & Lighting Ready
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <Box className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Multi-Floor Levels
            </span>
            <div className="text-base sm:text-lg font-black text-indigo-600 mt-0.5">
              {plan.floors?.length || 2} Floors <span className="text-[11px] font-normal text-slate-400">({plan.rooms.length} Rooms)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold mt-1 block">
              {totalFloorAreaSqM > 0 ? `${totalFloorAreaSqM.toFixed(1)} m² Area` : '185 m² Area'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Building className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Placed CAD Items
            </span>
            <div className="text-base sm:text-lg font-black text-amber-600 mt-0.5">
              {plan.furniture.length} Pieces
            </div>
            <span className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {plan.walls.length} Walls
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. COMPACT EASY-ACCESS LAUNCHPAD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => {
            if (onOpenClientSelectModal) {
              onOpenClientSelectModal();
            } else {
              onOpenStudioWithTemplate('duplex_2floor');
            }
          }}
          className="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl transition flex flex-col items-start gap-1 text-left shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-50 group-hover:bg-sky-600 text-sky-600 group-hover:text-white flex items-center justify-center transition">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">CAD Studio</span>
          <span className="text-[10px] text-slate-400">2D/3D Workspace</span>
        </button>

        <button
          onClick={() => onOpenStudioWithTemplate('duplex_2floor')}
          className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition flex flex-col items-start gap-1 text-left shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">3D Virtual Tour</span>
          <span className="text-[10px] text-slate-400">Human Eye-Level</span>
        </button>

        <button
          onClick={() => onOpenStudioWithTemplate('duplex_2floor')}
          className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl transition flex flex-col items-start gap-1 text-left shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition">
            <Building className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition">Duplex 2-Floor</span>
          <span className="text-[10px] text-slate-400">Living + Terrace</span>
        </button>

        <button
          onClick={() => onOpenStudioWithTemplate('studio_apt')}
          className="p-3 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-2xl transition flex flex-col items-start gap-1 text-left shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition">
            <Home className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition">Studio 1-Floor</span>
          <span className="text-[10px] text-slate-400">Open Concept</span>
        </button>

        <button
          onClick={onOpenAddItemModal}
          className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-2xl transition flex flex-col items-start gap-1 text-left shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-600 text-amber-600 group-hover:text-white flex items-center justify-center transition">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">Add 3D Model</span>
          <span className="text-[10px] text-slate-400">Ceiling/Floor item</span>
        </button>

        <button
          onClick={onOpenAddUserModal}
          className="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl transition flex flex-col items-start gap-1 text-left shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-50 group-hover:bg-sky-600 text-sky-600 group-hover:text-white flex items-center justify-center transition">
            <UserPlus className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">New Client</span>
          <span className="text-[10px] text-slate-400">Access Control</span>
        </button>
      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 pt-1">
        <button
          onClick={() => setAdminTab('overview')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            adminTab === 'overview'
              ? 'border-sky-600 text-sky-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Overview & Templates</span>
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            adminTab === 'users'
              ? 'border-sky-600 text-sky-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Directory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('catalog')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            adminTab === 'catalog'
              ? 'border-sky-600 text-sky-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Catalog</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            {catalog.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('floors')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            adminTab === 'floors'
              ? 'border-sky-600 text-sky-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Multi-Floor Levels</span>
        </button>
      </div>

      {/* 5. TAB 1: OVERVIEW & TEMPLATES */}
      {adminTab === 'overview' && (
        <div className="space-y-4">
          {/* Architectural Templates Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Baseline Architectural Templates
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white hover:border-sky-300 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm group border border-slate-200/90 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {tpl.floors} {tpl.floors === 1 ? 'Floor' : 'Floors'} • {tpl.area}
                      </span>
                      <Building className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-sky-600 transition">
                      {tpl.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {tpl.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenStudioWithTemplate(tpl.id)}
                    className="w-full py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <span>Open in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Client Sessions Feed */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Online Client Collaborations
              </h3>
              <button
                onClick={onOpenAddUserModal}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold border border-sky-200 transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add User</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-700">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                          u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : u.role === 'DESIGNER'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>

                    {onOpenClientPlan && u.assignedPlan && (
                      <button
                        onClick={() => onOpenClientPlan(u.assignedPlan!)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-semibold transition flex items-center gap-1 border border-sky-200"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Open Design</span>
                      </button>
                    )}

                    <button
                      onClick={() => onToggleUserStatus(u.id)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
                    >
                      {u.isOnline ? 'Offline' : 'Online'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 2: USER DIRECTORY */}
      {adminTab === 'users' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
              {(['ALL', 'ADMIN', 'DESIGNER', 'CLIENT'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg transition font-semibold text-[11px] ${
                    roleFilter === r
                      ? 'bg-sky-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Assigned Plan</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
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
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                          }`}
                        />
                        <span className={u.isOnline ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {u.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-600">
                      {u.assignedPlan || 'Default'}
                    </td>
                    <td className="py-2.5 px-4 text-right space-x-1.5">
                      {onOpenClientPlan && u.assignedPlan && (
                        <button
                          onClick={() => onOpenClientPlan(u.assignedPlan!)}
                          className="px-2 py-0.5 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white text-[10px] font-semibold transition inline-flex items-center gap-1 border border-sky-200"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Open</span>
                        </button>
                      )}
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] border border-slate-200 transition"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 3: 3D CATALOG */}
      {adminTab === 'catalog' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search 3D catalog..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <button
              onClick={onOpenAddItemModal}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-2xs transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add 3D Model</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatalogCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition border ${
                  catalogCategory === cat
                    ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Compact Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="bg-white hover:border-sky-300 rounded-2xl p-2.5 flex flex-col justify-between transition group relative border border-slate-200/90 shadow-2xs"
              >
                <div className="w-full h-18 bg-slate-50 rounded-xl flex items-center justify-center p-1.5 mb-1.5 relative border border-slate-100 group-hover:border-sky-200 transition">
                  {item.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.icon} alt={item.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Box className="w-7 h-7 text-slate-400 group-hover:text-sky-500 transition" />
                  )}

                  {item.placementType === 'ceiling' && (
                    <span className="absolute top-1 left-1 text-[8px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold">
                      Ceiling
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-900 truncate group-hover:text-sky-600 transition">
                    {item.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {Math.round(item.width)}×{Math.round(item.depth)}×{Math.round(item.height)} cm
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                  <button
                    onClick={() => onDeleteCatalogItem(item.id)}
                    className="p-0.5 rounded text-rose-500 hover:bg-rose-50 transition"
                    title="Remove from Catalog"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 4: MULTI-FLOOR ARCHITECTURE */}
      {adminTab === 'floors' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
              Building Levels Configuration
            </h3>

            <div className="space-y-2">
              {(plan.floors || [
                { level: 0, name: 'Ground Floor', elevation: 0, height: 250 },
                { level: 1, name: '1st Floor', elevation: 250, height: 250 }
              ]).map((fl) => (
                <div
                  key={fl.level}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      L{fl.level}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{fl.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Elevation: {fl.elevation || fl.level * 250}cm • Ceiling Height: {fl.height || 250}cm
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Side-by-Side 3D Enabled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
