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

  const onlineUsersCount = users.filter((u) => u.isOnline).length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredCatalog = catalog.filter(
    (item) =>
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-y-auto p-6 select-none space-y-6 custom-scrollbar">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Sweet Home 3D Command & Admin Center</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Spring Boot + Next.js
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-floor designs, user permissions, online client sessions, and 3D furniture catalog.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddUserModal}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center gap-2 shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>Create User</span>
          </button>
          <button
            onClick={onOpenAddItemModal}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm border border-sky-700/20 transition flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add 3D Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Online Users */}
        <div className="bg-white rounded-2xl p-4.5 shadow-xs flex items-center justify-between border border-slate-200/80">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Online Active Users
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
              <span>{onlineUsersCount}</span>
              <span className="text-xs font-normal text-slate-400">/ {users.length} total</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Metric 2: Catalog Items */}
        <div className="bg-white rounded-2xl p-4.5 shadow-xs flex items-center justify-between border border-slate-200/80">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Furniture & 3D Items
            </div>
            <div className="text-2xl font-bold text-sky-600 mt-1">
              {catalog.length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Active Floor Plan */}
        <div className="bg-white rounded-2xl p-4.5 shadow-xs flex items-center justify-between border border-slate-200/80">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Project Levels
            </div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              {plan.floors?.length || 2} Floors
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Placed Pieces */}
        <div className="bg-white rounded-2xl p-4.5 shadow-xs flex items-center justify-between border border-slate-200/80">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Placed Design Items
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {plan.furniture.length} Pieces
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setAdminTab('overview')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            adminTab === 'overview'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Templates
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            adminTab === 'users'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>User Directory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            {users.length}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('catalog')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            adminTab === 'catalog'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>3D Catalog Manager</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            {catalog.length}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('floors')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            adminTab === 'floors'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Multi-Floor Levels & Initial Designs
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Templates Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Baseline Floor Templates for Clients</h3>
                <p className="text-xs text-slate-500">
                  Select a pre-designed baseline template to open and modify in the CAD Studio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white hover:border-sky-300 rounded-2xl p-4.5 flex flex-col justify-between transition-all hover:shadow-md group border border-slate-200 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {tpl.floors} {tpl.floors === 1 ? 'Floor' : 'Floors'} • {tpl.area}
                      </span>
                      <Building className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{tpl.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{tpl.description}</p>
                  </div>

                  <button
                    onClick={() => onOpenStudioWithTemplate(tpl.id)}
                    className="mt-4 w-full py-2 rounded-xl bg-slate-50 hover:bg-sky-600 text-slate-700 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-slate-200 hover:border-transparent"
                  >
                    <span>Load in Studio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Active Sessions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Online Client Activity</h3>
            <div className="divide-y divide-slate-100">
              {users.slice(0, 4).map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.assignedPlan}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-semibold transition flex items-center gap-1 border border-sky-200 hover:border-transparent"
                        title="Open Client Design in 2D/3D Studio"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Open Design</span>
                      </button>
                    )}
                    <button
                      onClick={() => onToggleUserStatus(u.id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
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

      {/* TAB CONTENT 2: USER DIRECTORY */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
              {(['ALL', 'ADMIN', 'DESIGNER', 'CLIENT'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    roleFilter === r
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Floor Plan</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                          }`}
                        />
                        <span className={u.isOnline ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                          {u.isOnline ? 'Active Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {u.assignedPlan}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {onOpenClientPlan && u.assignedPlan && (
                        <button
                          onClick={() => onOpenClientPlan(u.assignedPlan!)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white text-[11px] font-semibold transition inline-flex items-center gap-1 border border-sky-200 hover:border-transparent"
                          title="Open Client Design in 2D/3D Studio"
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
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
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

      {/* TAB CONTENT 3: 3D CATALOG MANAGER */}
      {adminTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search furniture items or categories..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <button
              onClick={onOpenAddItemModal}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm border border-sky-700/20 transition flex items-center gap-2 active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import / Add New 3D Model</span>
            </button>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="bg-white hover:border-sky-300 rounded-2xl p-3 flex flex-col justify-between transition group relative border border-slate-200 shadow-2xs hover:shadow-md"
              >
                <div className="w-full h-20 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-2 relative border border-slate-100 group-hover:border-sky-200 transition">
                  {item.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.icon} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow" />
                  ) : (
                    <Box className="w-8 h-8 text-slate-400" />
                  )}
                  {item.isCustom && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-sky-600 text-white font-bold shadow">
                      Custom
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-600 transition">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {Math.round(item.width)}×{Math.round(item.depth)}×{Math.round(item.height)} cm
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium mt-1 inline-block">
                    {item.category}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-400 truncate max-w-[80px]">
                    {item.model.split('/').pop()}
                  </span>
                  <button
                    onClick={() => onDeleteCatalogItem(item.id)}
                    className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
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

      {/* TAB CONTENT 4: MULTI-FLOOR MANAGER */}
      {adminTab === 'floors' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Multi-Floor Architecture Configuration</h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure building levels (Ground Floor, Upper Floors, Basements) for the active CAD Studio.
            </p>

            <div className="space-y-3">
              {(plan.floors || [
                { level: 0, name: 'Ground Floor (Level 0)', elevation: 0, height: 250 },
                { level: 1, name: '1st Floor / Penthouse (Level 1)', elevation: 250, height: 250 }
              ]).map((fl) => (
                <div
                  key={fl.level}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-sm">
                      L{fl.level}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{fl.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Elevation: {fl.elevation}cm • Ceiling Height: {fl.height}cm
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Level
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
