'use client';

import React, { useState } from 'react';
import {
  Users,
  Box,
  Building,
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
  Edit3
} from 'lucide-react';
import { User, CatalogItem, FloorTemplate, HomePlan } from '../types/plan';
import { ALL_CLIENT_PLANS } from '../services/api';

interface AdminDashboardProps {
  users: User[];
  catalog: CatalogItem[];
  templates: FloorTemplate[];
  adminTab: 'overview' | 'users' | 'catalog' | 'floors';
  setAdminTab: (t: 'overview' | 'users' | 'catalog' | 'floors') => void;
  onOpenStudioWithTemplate: (templateId: string) => void;
  onOpenClientPlan?: (planId: string) => void;
  onStartNewDesignForClient?: (client: User, templateId?: string) => void;
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
  onStartNewDesignForClient,
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
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');

  const onlineUsersCount = users.filter((u) => u.isOnline).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const designerCount = users.filter((u) => u.role === 'DESIGNER').length;
  const clientCount = users.filter((u) => u.role === 'CLIENT').length;

  // Filter clients and users for the Client Projects hub
  const filteredClients = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  // Filter 3D Catalog
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
      {/* 1. HERO BANNER */}
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
              <span>+ Onboard Client</span>
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
              <span>Select Client & Open Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Registered Clients & Users
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

      {/* 3. TABS NAVIGATION */}
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
          <span>Client Projects & Overview</span>
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

      {/* 4. TAB 1: CLIENT PROJECTS & OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-4">
          {/* CLIENT PROJECTS WORKSPACE HUB */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🏡 Client Architectural Projects</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {filteredClients.length} Clients
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select any client below to modify their existing blueprint or start a new 3D design.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search client..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
                <button
                  onClick={onOpenAddUserModal}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Client</span>
                </button>
              </div>
            </div>

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredClients.map((client) => {
                const planId = client.assignedPlan || `plan-${client.id}`;
                const clientPlan = ALL_CLIENT_PLANS[planId];
                const planName = clientPlan?.name || `${client.name}'s Custom Suite`;
                const floorCount = clientPlan?.floors?.length || 2;
                const roomCount = clientPlan?.rooms?.length || 6;
                const itemCount = clientPlan?.furniture?.length || 10;
                const isCurrentActive = plan.id === planId;

                return (
                  <div
                    key={client.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between group ${
                      isCurrentActive
                        ? 'bg-sky-50/50 border-sky-300 ring-2 ring-sky-500/20 shadow-sm'
                        : 'bg-white hover:bg-slate-50/70 border-slate-200/90 shadow-2xs hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Client Header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                              client.role === 'ADMIN'
                                ? 'bg-gradient-to-tr from-sky-600 to-indigo-600'
                                : client.role === 'DESIGNER'
                                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                                : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                            }`}>
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                client.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                                {client.name}
                              </h4>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                client.role === 'ADMIN'
                                  ? 'bg-sky-100 text-sky-700'
                                  : client.role === 'DESIGNER'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {client.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {client.email}
                            </p>
                          </div>
                        </div>

                        {isCurrentActive && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-600 text-white shadow-2xs">
                            Active in Studio
                          </span>
                        )}
                      </div>

                      {/* Project Stats Pill */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate mb-1">
                          <span className="text-sky-600 font-bold">🏡</span>
                          <span className="truncate">{planName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <span>{floorCount} Floors</span>
                          <span>•</span>
                          <span>{roomCount} Rooms</span>
                          <span>•</span>
                          <span>{itemCount} Items</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          if (onOpenClientPlan) {
                            onOpenClientPlan(planId);
                          }
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Open & Modify in Studio</span>
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            if (onStartNewDesignForClient) {
                              onStartNewDesignForClient(client, 'duplex_2floor');
                            }
                          }}
                          className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition text-center truncate"
                          title="Start fresh 2-Floor Duplex for this client"
                        >
                          + New Duplex
                        </button>
                        <button
                          onClick={() => {
                            if (onStartNewDesignForClient) {
                              onStartNewDesignForClient(client, 'studio_apt');
                            }
                          }}
                          className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition text-center truncate"
                          title="Start fresh Studio Loft for this client"
                        >
                          + New Studio
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Baseline Architectural Templates */}
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
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <span>Open Template in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: USER DIRECTORY */}
      {adminTab === 'users' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                User & Client Access Directory
              </h3>
              <p className="text-xs text-slate-500">
                Manage access roles, permissions, and assigned client floor plans.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={onOpenAddUserModal}
                className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold transition flex items-center gap-1.5 hover:bg-sky-500 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Assigned Plan</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Studio Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((u) => {
                  const planId = u.assignedPlan || `plan-${u.id}`;
                  const planName = ALL_CLIENT_PLANS[planId]?.name || 'Standard Suite';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-sky-100 text-sky-700'
                            : u.role === 'DESIGNER'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700">{planName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 ${
                            u.isOnline
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{u.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              if (onOpenClientPlan) {
                                onOpenClientPlan(planId);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] border border-sky-200 transition"
                          >
                            Open in Studio
                          </button>
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => onDeleteUser(u.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Remove User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 3: 3D CATALOG */}
      {adminTab === 'catalog' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                3D CAD Catalog & Custom Elements
              </h3>
              <p className="text-xs text-slate-500">
                Manage all 3D furniture, ceiling lamps, tables, and architectural items.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search catalog..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={onOpenAddItemModal}
                className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold transition flex items-center gap-1.5 hover:bg-sky-500 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New 3D Item</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/60 hover:bg-white transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-full h-20 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-2 mb-2 relative">
                    <Box className="w-8 h-8 text-slate-400 group-hover:text-sky-600 transition" />
                    {item.isCustom && (
                      <span className="absolute top-1 left-1 text-[8px] font-bold px-1 rounded bg-sky-100 text-sky-700">
                        Custom
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase">{item.category}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{item.width}×{item.depth}cm</span>
                  {item.isCustom && (
                    <button
                      onClick={() => onDeleteCatalogItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 4: MULTI-FLOOR LEVELS */}
      {adminTab === 'floors' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">
            Multi-Floor Architecture & Elevation Management
          </h3>
          <p className="text-xs text-slate-500">
            Current project multi-floor structural configuration.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {(plan.floors || [
              { level: 0, name: 'Ground Floor', height: 250, elevation: 0 },
              { level: 1, name: '1st Floor', height: 250, elevation: 250 },
            ]).map((fl) => (
              <div key={fl.level} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{fl.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold">
                      Level {fl.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Elevation: {fl.elevation}cm • Ceiling Height: {fl.height}cm
                  </p>
                </div>
                <Building className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
