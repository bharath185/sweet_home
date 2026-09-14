'use client';

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Box,
  Building,
  Plus,
  Trash2,
  Sparkles,
  Search,
  ArrowRight,
  Home,
  UserPlus,
  FolderKanban,
  BarChart3,
  ChevronRight,
  Eye,
  Pencil
} from 'lucide-react';
import { User, CatalogItem, FloorTemplate, HomePlan } from '../types/plan';
import { ALL_CLIENT_PLANS } from '../services/api';
import { CatalogThumbnail3D } from './CatalogThumbnail3D';
import { Catalog3DPreviewModal } from './Catalog3DPreviewModal';
import { EditCatalogItemModal } from './EditCatalogItemModal';

export type DashboardMenuTab = 'dashboard' | 'projects' | 'users' | 'catalog' | 'floors';

interface AdminDashboardProps {
  users: User[];
  catalog: CatalogItem[];
  templates: FloorTemplate[];
  adminTab: 'overview' | 'users' | 'catalog' | 'floors' | string;
  setAdminTab: (t: any) => void;
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
  onOpenBlueprintModal?: () => void;
  onNewPlan?: () => void;
  onSwitchToStudio?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  onAddItem?: (item: CatalogItem) => void;
  onUpdateCatalogItem?: (item: CatalogItem) => void;
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
  onOpenBlueprintModal,
  onNewPlan,
  onSwitchToStudio,
  currentUser,
  onLogout,
  onAddItem,
  onUpdateCatalogItem,
}) => {
  const currentTab: DashboardMenuTab =
    adminTab === 'overview' || adminTab === 'dashboard'
      ? 'dashboard'
      : adminTab === 'projects'
      ? 'projects'
      : adminTab === 'users'
      ? 'users'
      : adminTab === 'catalog'
      ? 'catalog'
      : adminTab === 'floors'
      ? 'floors'
      : 'dashboard';

  const [userSearch, setUserSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [previewCatalogItem, setPreviewCatalogItem] = useState<CatalogItem | null>(null);
  const [editingCatalogItem, setEditingCatalogItem] = useState<CatalogItem | null>(null);

  const clientUsers = useMemo(() => users.filter((u) => u.role === 'CLIENT'), [users]);
  const adminUsers = useMemo(() => users.filter((u) => u.role === 'ADMIN'), [users]);
  const totalClients = clientUsers.length || 148;

  const clientPlansArray = useMemo(() => Object.values(ALL_CLIENT_PLANS), []);
  const projectCount = clientPlansArray.length || 34;

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchCat = catalogCategory === 'ALL' || item.category.toUpperCase() === catalogCategory;
      return matchSearch && matchCat;
    });
  }, [catalog, catalogSearch, catalogCategory]);

  const categories = useMemo(() => {
    const set = new Set(catalog.map((c) => c.category.toUpperCase()));
    return ['ALL', ...Array.from(set)];
  }, [catalog]);

  // Clean, realistic 6-month activity data
  const monthlyData = [
    { month: 'Apr', projects: 18, clients: 12 },
    { month: 'May', projects: 24, clients: 16 },
    { month: 'Jun', projects: 29, clients: 22 },
    { month: 'Jul', projects: 38, clients: 28 },
    { month: 'Aug', projects: 46, clients: 35 },
    { month: 'Sep', projects: 54, clients: 42 }
  ];

  const recentProjects = [
    { id: 'p1', name: 'Azure Coastal Luxury Villa', client: 'John Doe', floors: '3 Floors • 4,200 sq ft', status: 'In Design' },
    { id: 'p2', name: 'Skyline Penthouse Residence', client: 'Sarah Connor', floors: '2 Floors • 2,800 sq ft', status: '3D Rendered' },
    { id: 'p3', name: 'Modern Minimalist Loft', client: 'Michael Scott', floors: '1 Floor • 1,450 sq ft', status: 'Approved' },
    { id: 'p4', name: 'Emerald Hill Duplex', client: 'David Miller', floors: '2 Floors • 3,100 sq ft', status: 'Drafting' },
  ];

  const catalogStats = [
    { name: 'Living & Seating', count: 450, percent: 35, barColor: '#6366f1' },
    { name: 'Bedroom & Wardrobe', count: 320, percent: 25, barColor: '#06b6d4' },
    { name: 'Architectural Lighting', count: 280, percent: 22, barColor: '#f59e0b' },
    { name: 'Kitchen & Bath', count: 230, percent: 18, barColor: '#10b981' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080d19] text-slate-100 overflow-hidden select-none font-sans">
      {/* Main Content Area directly below navbar */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar">
        {currentTab === 'dashboard' && (
          <>
            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Clients */}
              <div
                onClick={() => setAdminTab('users')}
                className="bg-[#0e1628] hover:bg-[#131f38] border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clients</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-white">{totalClients}</div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    +12% mo
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">{clientUsers.length || 42} Active</span> client accounts
                </p>
              </div>

              {/* Active Projects */}
              <div
                onClick={() => setAdminTab('projects')}
                className="bg-[#0e1628] hover:bg-[#131f38] border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-white">{projectCount}</div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    8 In Design
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  <span className="text-cyan-400 font-semibold">26 Finalized</span> & 3D Rendered
                </p>
              </div>

              {/* 3D Catalog Items */}
              <div
                onClick={() => setAdminTab('catalog')}
                className="bg-[#0e1628] hover:bg-[#131f38] border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">3D Catalog Items</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Box className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-white">{catalog.length || 1280}</div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    +64 new
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Furniture, Lights & PBR Materials</p>
              </div>

              {/* Multi-Floor Templates */}
              <div
                onClick={() => setAdminTab('floors')}
                className="bg-[#0e1628] hover:bg-[#131f38] border border-slate-800/90 hover:border-purple-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Floor Templates</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-white">{templates.length || 4} Floors</div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    12.4k sq ft
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Ground, Level 1 & Penthouse</p>
              </div>
            </div>

            {/* Middle Section: Clean Bar Chart & 3D Catalog Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Clean Activity Bar Chart (7 cols) */}
              <div className="lg:col-span-7 bg-[#0e1628] border border-slate-800/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        Design & Client Growth
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Monthly breakdown of floor plans and active clients</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
                        <span className="text-slate-300">Projects</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span>
                        <span className="text-slate-300">Clients</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Visual Bar Chart */}
                  <div className="h-40 w-full flex items-end justify-between gap-3 pt-3 pb-2 border-b border-slate-800/80">
                    {monthlyData.map((item, idx) => {
                      const maxVal = 60;
                      const projHeight = Math.max(16, (item.projects / maxVal) * 100);
                      const clientHeight = Math.max(12, (item.clients / maxVal) * 100);
                      const isHovered = hoveredBarIndex === idx;

                      return (
                        <div
                          key={item.month}
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                        >
                          {/* Tooltip on Hover */}
                          {isHovered && (
                            <div className="absolute -top-9 z-20 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-white shadow-lg whitespace-nowrap">
                              <span className="text-indigo-400 font-bold">{item.projects} Projects</span> •{' '}
                              <span className="text-cyan-400 font-bold">{item.clients} Clients</span>
                            </div>
                          )}

                          {/* Bars Pair */}
                          <div className="w-full flex items-end justify-center gap-1.5 h-full">
                            <div
                              style={{ height: `${projHeight}%` }}
                              className="w-3.5 rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:brightness-125 transition-all"
                            ></div>
                            <div
                              style={{ height: `${clientHeight}%` }}
                              className="w-3.5 rounded-t bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:brightness-125 transition-all"
                            ></div>
                          </div>

                          <span className="text-[11px] font-medium text-slate-400 mt-2 group-hover:text-white transition-colors">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Chart Footer Strip */}
                <div className="mt-3 pt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] uppercase">Render Speed</span>
                    <span className="font-bold text-white text-xs">1.4s (60 FPS)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] uppercase">Active Area</span>
                    <span className="font-bold text-emerald-400 text-xs">12,450 sq ft</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px] uppercase">Cloud Storage</span>
                    <span className="font-bold text-indigo-400 text-xs">14.2 GB</span>
                  </div>
                </div>
              </div>

              {/* 3D Catalog Breakdown & Quick Launch (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* 3D Asset Mix */}
                <div className="bg-[#0e1628] border border-slate-800/90 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <Box className="w-4 h-4 text-amber-400" />
                      3D Catalog Breakdown
                    </h2>
                    <span
                      className="text-xs text-indigo-400 font-semibold cursor-pointer hover:underline"
                      onClick={() => setAdminTab('catalog')}
                    >
                      View all ({catalog.length || 1280}) →
                    </span>
                  </div>

                  <div className="space-y-3 mt-3">
                    {catalogStats.map((cat) => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium">{cat.name}</span>
                          <span className="text-slate-400 font-semibold">{cat.count} models ({cat.percent}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            style={{ width: `${cat.percent}%`, backgroundColor: cat.barColor }}
                            className="h-full rounded-full transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Studio Template Launch */}
                <div className="bg-gradient-to-br from-indigo-950/40 via-[#0e1628] to-[#0e1628] border border-indigo-500/20 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      SweetHome 3D Studio
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Open 2D CAD Blueprint, 3D WebGL, or First-Person Walkthrough mode.
                    </p>
                  </div>
                  {onSwitchToStudio && (
                    <button
                      onClick={onSwitchToStudio}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 whitespace-nowrap cursor-pointer flex items-center gap-1"
                    >
                      Open Studio
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Recent Design Projects Table */}
            <div className="bg-[#0e1628] border border-slate-800/90 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-cyan-400" />
                    Recent Architectural Projects
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Latest client floor plans and design progress</p>
                </div>
                <button
                  onClick={() => setAdminTab('projects')}
                  className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Manage all projects ({projectCount}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-400 font-semibold">
                      <th className="pb-2.5 font-medium">Project Name</th>
                      <th className="pb-2.5 font-medium">Client</th>
                      <th className="pb-2.5 font-medium">Floor Specs</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {recentProjects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="py-3 font-semibold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <Home className="w-3.5 h-3.5" />
                          </div>
                          {proj.name}
                        </td>
                        <td className="py-3 text-slate-300">{proj.client}</td>
                        <td className="py-3 text-slate-400">{proj.floors}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              proj.status === 'Approved'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : proj.status === '3D Rendered'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              if (onSwitchToStudio) onSwitchToStudio();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700 text-[11px] font-medium transition-all cursor-pointer"
                          >
                            Open in 3D
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Sub-tab: Projects */}
        {currentTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">All Client Projects</h2>
                <p className="text-xs text-slate-400">View and open architectural floor plans</p>
              </div>
              {onNewPlan && (
                <button
                  onClick={onNewPlan}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientPlansArray.map((clientPlan) => (
                <div
                  key={clientPlan.id}
                  className="bg-[#0e1628] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        {clientPlan.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{clientPlan.updatedAt ? new Date(clientPlan.updatedAt).toLocaleDateString() : 'Active'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{clientPlan.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">Custom multi-floor residential architectural plan</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                    <span className="text-xs text-slate-400">{clientPlan.floors?.length || 1} Floor(s)</span>
                    <button
                      onClick={() => {
                        if (onOpenClientPlan) onOpenClientPlan(clientPlan.id);
                        if (onSwitchToStudio) onSwitchToStudio();
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all cursor-pointer"
                    >
                      Open in Studio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-tab: Users & Roles */}
        {currentTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Users & Roles Management</h2>
                <p className="text-xs text-slate-400">Manage client and administrator access</p>
              </div>
              <button
                onClick={onOpenAddUserModal}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add User
              </button>
            </div>

            <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-2 font-medium">User</th>
                      <th className="pb-2 font-medium">Email</th>
                      <th className="pb-2 font-medium">Role</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 font-medium text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </td>
                        <td className="py-2.5 text-slate-300">{user.email}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              user.isOnline
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-700 text-slate-400 border border-slate-600'
                            }`}
                          >
                            {user.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right space-x-2">
                          <button
                            onClick={() => onToggleUserStatus(user.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900 text-rose-300 text-[11px]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sub-tab: 3D Catalog */}
        {currentTab === 'catalog' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">3D Furniture & Assets Catalog</h2>
                <p className="text-xs text-slate-400">Manage 3D models, dimensions and textures</p>
              </div>
              <button
                onClick={onOpenAddItemModal}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Catalog Item
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-[#0e1628] px-3 py-2 rounded-xl border border-slate-800">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog items..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      catalogCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#0e1628] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0e1628] border border-slate-800 hover:border-indigo-500/40 rounded-xl p-2.5 transition-all duration-200 flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    {/* 3D Thumbnail */}
                    <div
                      onClick={() => setPreviewCatalogItem(item)}
                      className="h-24 rounded-lg bg-[#0b1120] border border-slate-800/80 flex items-center justify-center mb-2 group-hover:scale-[1.02] group-hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden"
                      title="Click for interactive 360° 3D Preview"
                    >
                      <CatalogThumbnail3D
                        model={item.model}
                        category={item.category}
                        name={item.name}
                        width={item.width}
                        depth={item.depth}
                        height={item.height}
                        color={item.defaultColor || '#94a3b8'}
                        size={88}
                      />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{item.category}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      {item.width} × {item.depth} × {item.height} cm
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {/* 3D Preview */}
                      <button
                        onClick={() => setPreviewCatalogItem(item)}
                        className="px-1.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-900/50 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Interactive 360° 3D Preview"
                      >
                        <Eye className="w-3 h-3" />
                        3D
                      </button>
                      {/* Edit Item */}
                      <button
                        onClick={() => setEditingCatalogItem(item)}
                        className="px-1.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-900/40 text-amber-300 border border-slate-700 hover:border-amber-500/50 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Edit Catalog Item"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                    {/* Delete Item */}
                    <button
                      onClick={() => onDeleteCatalogItem(item.id)}
                      className="p-1 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete from Catalog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Catalog Preview Modal */}
            <Catalog3DPreviewModal
              item={previewCatalogItem}
              isOpen={Boolean(previewCatalogItem)}
              onClose={() => setPreviewCatalogItem(null)}
              onAddItem={onAddItem}
            />

            {/* Edit Catalog Item Modal */}
            <EditCatalogItemModal
              item={editingCatalogItem}
              isOpen={Boolean(editingCatalogItem)}
              onClose={() => setEditingCatalogItem(null)}
              onSave={(updated) => {
                if (onUpdateCatalogItem) {
                  onUpdateCatalogItem(updated);
                }
              }}
            />
          </div>
        )}

        {/* Sub-tab: Floors */}
        {currentTab === 'floors' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Multi-Floor Architectural Templates</h2>
              <p className="text-xs text-slate-400">Select a pre-configured multi-level layout to open in SweetHome 3D Studio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-[#0e1628] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        {tpl.floors || 1} Floor(s)
                      </span>
                      <span className="text-[11px] text-slate-400">{tpl.area || '2,400 sq ft'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{tpl.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{tpl.description || 'Pre-architected blueprint with multi-floor CAD walls'}</p>
                  </div>
                  <button
                    onClick={() => {
                      onOpenStudioWithTemplate(tpl.id);
                      if (onSwitchToStudio) onSwitchToStudio();
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Template in Studio
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
