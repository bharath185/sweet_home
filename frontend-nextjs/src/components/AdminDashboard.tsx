'use client';

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
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
  Edit3,
  Activity,
  TrendingUp,
  Cpu,
  Database,
  BarChart3,
  PieChart as PieChartIcon,
  Compass,
  ArrowUpRight,
  Shield,
  ShieldCheck,
  Palette,
  Clock,
  Zap,
  Server,
  Maximize2,
  Layers2,
  FileCode2,
  Sliders,
  ChevronRight,
  RefreshCw,
  LogOut,
  BarChart2,
  Layers3,
  HardDrive,
  Gauge
} from 'lucide-react';
import { User, CatalogItem, FloorTemplate, HomePlan, UserRole } from '../types/plan';
import { ALL_CLIENT_PLANS } from '../services/api';

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
}) => {
  // Normalize active tab (if 'overview' -> 'dashboard')
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
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // User breakdown statistics
  const onlineUsersCount = users.filter((u) => u.isOnline).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const designerCount = users.filter((u) => u.role === 'DESIGNER').length;
  const clientCount = users.filter((u) => u.role === 'CLIENT').length;

  // Filter clients and users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    });
  }, [users, userSearch]);

  // Filter 3D Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesCategory = catalogCategory === 'ALL' || item.category === catalogCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalog, catalogSearch, catalogCategory]);

  // Catalog Category Breakdown for Donut Chart & Progress Bars
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {
      Living: 0,
      Bedroom: 0,
      Kitchen: 0,
      Office: 0,
      Lighting: 0,
      Outdoor: 0,
    };
    catalog.forEach((item) => {
      const cat = item.category?.toLowerCase() || '';
      if (cat.includes('living') || cat.includes('sofa') || cat.includes('chair') || cat.includes('table')) {
        counts.Living += 1;
      } else if (cat.includes('bed') || cat.includes('wardrobe')) {
        counts.Bedroom += 1;
      } else if (cat.includes('kitchen') || cat.includes('dining')) {
        counts.Kitchen += 1;
      } else if (cat.includes('office') || cat.includes('desk')) {
        counts.Office += 1;
      } else if (cat.includes('light') || cat.includes('lamp') || cat.includes('ceiling')) {
        counts.Lighting += 1;
      } else {
        counts.Outdoor += 1;
      }
    });
    return counts;
  }, [catalog]);

  // Total floor area computation
  const totalFloorAreaSqM = useMemo(() => {
    return plan.rooms.reduce((acc, r) => {
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
  }, [plan.rooms]);

  // Dataset 1: Monthly Bar Chart (Projects Created vs Clients Onboarded)
  const barChartData = [
    { month: 'Apr', projects: 8, clients: 5, renders: 340, trend: 12 },
    { month: 'May', projects: 12, clients: 8, renders: 520, trend: 18 },
    { month: 'Jun', projects: 15, clients: 11, renders: 480, trend: 22 },
    { month: 'Jul', projects: 19, clients: 14, renders: 690, trend: 28 },
    { month: 'Aug', projects: 24, clients: 18, renders: 890, trend: 35 },
    { month: 'Sep', projects: 31, clients: 22, renders: 1140, trend: 44 },
  ];

  // Client Projects List for Projects Tab
  const clientProjects = useMemo(() => {
    return users.map((u) => {
      const planId = u.assignedPlan || `plan-${u.id}`;
      const clientPlan = ALL_CLIENT_PLANS[planId];
      const planName = clientPlan?.name || `${u.name}'s Custom Suite`;
      const floorCount = clientPlan?.floors?.length || 2;
      const roomCount = clientPlan?.rooms?.length || 5;
      const itemCount = clientPlan?.furniture?.length || 12;
      const wallCount = clientPlan?.walls?.length || 18;
      const isCurrentActive = plan.id === planId;

      return {
        user: u,
        planId,
        planName,
        floorCount,
        roomCount,
        itemCount,
        wallCount,
        isCurrentActive,
        area: 120 + ((u.id.charCodeAt(0) * 7) % 180),
        status: u.role === 'ADMIN' ? 'ARCHITECTURAL MASTER' : u.isOnline ? 'ACTIVE IN 3D' : 'SAVED TO CLOUD',
      };
    });
  }, [users, plan.id]);

  const filteredProjects = useMemo(() => {
    return clientProjects.filter((p) => {
      const matchesSearch =
        p.planName.toLowerCase().includes(userSearch.toLowerCase()) ||
        p.user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        p.user.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesFilter =
        projectFilter === 'ALL' ||
        (projectFilter === 'ONLINE' && p.user.isOnline) ||
        (projectFilter === 'ACTIVE' && p.isCurrentActive);
      return matchesSearch && matchesFilter;
    });
  }, [clientProjects, userSearch, projectFilter]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080f1e] text-slate-100 overflow-hidden font-sans select-none">
      {/* ========================================================= */}
      {/* FIT-SCREEN ADJUSTABLE DASHBOARD (HIGH DENSITY, NO GAPS) */}
      {/* ========================================================= */}
      <main className="flex-1 h-full flex flex-col p-3 lg:p-4 gap-3 overflow-hidden select-none">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD HOME (PERFECTLY SCALED TO FIT SCREEN) */}
        {/* ========================================================= */}
        {currentTab === 'dashboard' && (
          <div className="flex-1 flex flex-col justify-between gap-3 h-full min-h-0 overflow-hidden">
            {/* ROW 1: 4 HIGH-IMPACT KPI METRIC CARDS (SHRINK-0) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
              {/* Card 1: Clients & Team */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Clients & Team
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-2xl font-black text-white tracking-tight">
                    {users.length} <span className="text-xs font-normal text-slate-400">Users</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {onlineUsersCount} Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 mt-1">
                  <span className="text-sky-400 font-semibold">{clientCount} Clients</span>
                  <span>•</span>
                  <span className="text-indigo-400 font-semibold">{designerCount} Designers</span>
                  <span>•</span>
                  <span className="text-slate-300 font-semibold">{adminCount} Admins</span>
                </div>
              </div>

              {/* Card 2: Architectural Plans */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between hover:border-sky-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Architectural Plans
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                    <FolderKanban className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-2xl font-black text-white tracking-tight">
                    {users.length + templates.length} <span className="text-xs font-normal text-slate-400">Plans</span>
                  </div>
                  <span className="text-[11px] font-bold text-sky-400 flex items-center gap-0.5 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                    <TrendingUp className="w-3 h-3" /> +24% MoM
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 mt-1">
                  <span>{users.length} Custom Suites</span>
                  <span>•</span>
                  <span className="text-sky-400 font-semibold">{templates.length} Blueprints</span>
                </div>
              </div>

              {/* Card 3: 3D Catalog Models */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    3D Element Catalog
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <Box className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-2xl font-black text-amber-400 tracking-tight">
                    {catalog.length} <span className="text-xs font-normal text-slate-400">Models</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                    OBJ & GLTF
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 mt-1">
                  <span>{catalog.filter((c) => c.isCustom).length} Custom Assets</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">6 Categories</span>
                </div>
              </div>

              {/* Card 4: Multi-Floor Total Space */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between hover:border-purple-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Multi-Floor Area & Walls
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-2xl font-black text-purple-300 tracking-tight">
                    {totalFloorAreaSqM > 0 ? `${totalFloorAreaSqM.toFixed(1)} m²` : '240.0 m²'}
                  </div>
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                    {plan.floors?.length || 2} Floors
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 mt-1">
                  <span>{plan.rooms.length} Defined Rooms</span>
                  <span>•</span>
                  <span className="text-purple-400 font-semibold">{plan.walls.length} CAD Walls</span>
                </div>
              </div>
            </div>

            {/* ROW 2: MAIN HIGH-DENSITY VISUAL CHARTS GRID (FLEX-1, ZERO EMPTY VOIDS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
              {/* 1. CHART 1: MONTHLY PROJECTS & CLIENT GROWTH BAR CHART (6 COLS) */}
              <div className="lg:col-span-6 bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 shrink-0 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                      <BarChart2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-xs font-bold text-white leading-tight">Monthly Projects & Client Growth</h2>
                      <span className="text-[10px] text-slate-400">Architectural velocity vs client onboarding</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[10px] font-semibold bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-sky-400 shadow-sm shadow-sky-400/50" />
                      <span className="text-slate-300">Projects ({users.length + templates.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-sm shadow-indigo-400/50" />
                      <span className="text-slate-300">Clients ({clientCount})</span>
                    </div>
                  </div>
                </div>

                {/* SVG Bar Chart (Fills available vertical area dynamically) */}
                <div className="relative w-full flex-1 min-h-[160px] flex items-center justify-center my-1">
                  <svg viewBox="0 0 520 200" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="skyBarGradFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                      <linearGradient id="indigoBarGradFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    {[0, 10, 20, 30].map((val) => {
                      const y = 165 - (val / 35) * 145;
                      return (
                        <g key={val}>
                          <line x1="30" y1={y} x2="510" y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                          <text x="20" y={y + 3} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">{val}</text>
                        </g>
                      );
                    })}

                    {/* Bars */}
                    {barChartData.map((d, idx) => {
                      const groupX = 55 + idx * 76;
                      const pHeight = (d.projects / 35) * 145;
                      const cHeight = (d.clients / 35) * 145;
                      const isHovered = hoveredBarIndex === idx;

                      return (
                        <g
                          key={d.month}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        >
                          {isHovered && (
                            <rect x={groupX - 6} y="15" width="58" height="152" rx="6" fill="#1e293b" opacity="0.6" />
                          )}
                          
                          {/* Project Bar */}
                          <rect
                            x={groupX}
                            y={165 - pHeight}
                            width="20"
                            height={pHeight}
                            rx="4"
                            fill="url(#skyBarGradFill)"
                            filter={isHovered ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))' : undefined}
                          />

                          {/* Client Bar */}
                          <rect
                            x={groupX + 24}
                            y={165 - cHeight}
                            width="20"
                            height={cHeight}
                            rx="4"
                            fill="url(#indigoBarGradFill)"
                            filter={isHovered ? 'drop-shadow(0 0 8px rgba(129, 140, 248, 0.5))' : undefined}
                          />

                          {/* Value above bar if hovered */}
                          {isHovered && (
                            <>
                              <text x={groupX + 10} y={158 - pHeight} fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">{d.projects}</text>
                              <text x={groupX + 34} y={158 - cHeight} fill="#818cf8" fontSize="9" fontWeight="bold" textAnchor="middle">{d.clients}</text>
                            </>
                          )}

                          {/* Month Label */}
                          <text x={groupX + 22} y="185" fill={isHovered ? '#ffffff' : '#94a3b8'} fontSize="11" fontWeight="bold" textAnchor="middle">
                            {d.month}
                          </text>

                          {/* Tooltip */}
                          {isHovered && (
                            <g>
                              <rect x={groupX - 25} y={Math.min(165 - pHeight, 165 - cHeight) - 34} width="95" height="26" rx="6" fill="#091020" stroke="#38bdf8" strokeWidth="1" />
                              <text x={groupX + 22} y={Math.min(165 - pHeight, 165 - cHeight) - 17} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                                {d.projects} Plans • {d.clients} Clients
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Dense Metric Summary Strip */}
                <div className="grid grid-cols-4 gap-2 border-t border-slate-800/80 pt-2 text-center text-[10px] shrink-0">
                  <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Monthly Avg</span>
                    <strong className="text-sky-400 font-bold text-xs">18 Plans/mo</strong>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Conversion</span>
                    <strong className="text-emerald-400 font-bold text-xs">86.5% Closed</strong>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">CAD Exports</span>
                    <strong className="text-indigo-400 font-bold text-xs">380/mo</strong>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Peak Month</span>
                    <strong className="text-purple-400 font-bold text-xs">+31 (Sep)</strong>
                  </div>
                </div>
              </div>

              {/* 2. CHART 2: 3D CATALOG DONUT & COMPLETE CATEGORY BREAKDOWN (3 COLS) */}
              <div className="lg:col-span-3 bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                      <PieChartIcon className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-xs font-bold text-white leading-tight">3D Catalog Mix</h2>
                      <span className="text-[10px] text-slate-400">{catalog.length} Verified Models</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    OBJ/GLTF
                  </span>
                </div>

                {/* Large Donut Graphic */}
                <div className="flex items-center justify-center my-1 relative shrink-0">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="42" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                    <circle cx="56" cy="56" r="42" stroke="#38bdf8" strokeWidth="12" strokeDasharray="264" strokeDashoffset="140" fill="transparent" strokeLinecap="round" />
                    <circle cx="56" cy="56" r="42" stroke="#818cf8" strokeWidth="12" strokeDasharray="264" strokeDashoffset="200" fill="transparent" strokeLinecap="round" />
                    <circle cx="56" cy="56" r="42" stroke="#f59e0b" strokeWidth="12" strokeDasharray="264" strokeDashoffset="230" fill="transparent" strokeLinecap="round" />
                    <circle cx="56" cy="56" r="42" stroke="#10b981" strokeWidth="12" strokeDasharray="264" strokeDashoffset="250" fill="transparent" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">3D Models</span>
                    <span className="text-base font-black text-white">{catalog.length}</span>
                  </div>
                </div>

                {/* High Density Room Category Progress Bars */}
                <div className="space-y-1.5 text-[10px] flex-1 flex flex-col justify-center overflow-hidden">
                  <div>
                    <div className="flex justify-between font-semibold mb-0.5">
                      <span className="text-slate-300">🛋️ Living & Seating</span>
                      <span className="text-sky-400 font-bold">{categoryCounts.Living} items</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, (categoryCounts.Living / (catalog.length || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-0.5">
                      <span className="text-slate-300">💡 Lighting & Ceiling</span>
                      <span className="text-amber-400 font-bold">{categoryCounts.Lighting} items</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (categoryCounts.Lighting / (catalog.length || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-0.5">
                      <span className="text-slate-300">🛏️ Bedroom & Storage</span>
                      <span className="text-indigo-400 font-bold">{categoryCounts.Bedroom} items</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400" style={{ width: `${Math.min(100, (categoryCounts.Bedroom / (catalog.length || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-0.5">
                      <span className="text-slate-300">🍳 Kitchen & Dining</span>
                      <span className="text-emerald-400 font-bold">{categoryCounts.Kitchen} items</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (categoryCounts.Kitchen / (catalog.length || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Format Tags Footer */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[9px] text-slate-400 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300 font-mono">.OBJ</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-mono">.GLTF</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-mono">PBR Shaders</span>
                  <span className="text-emerald-400 font-bold">100% CAD Ready</span>
                </div>
              </div>

              {/* 3. CHART 3: MULTI-FLOOR ARCHITECTURE & 3D ENGINE TELEMETRY (3 COLS) */}
              <div className="lg:col-span-3 bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                      <Layers3 className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-xs font-bold text-white leading-tight">Multi-Floor Space</h2>
                      <span className="text-[10px] text-slate-400">Vertical level distribution</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {plan.floors?.length || 2} Floors
                  </span>
                </div>

                {/* Level Cards Stack */}
                <div className="space-y-2 my-1 flex-1 flex flex-col justify-center overflow-hidden">
                  {(plan.floors || [
                    { level: 0, name: 'Ground Floor (Living & Dining)', height: 250 },
                    { level: 1, name: '1st Floor (Master Suite & Terrace)', height: 250 },
                  ]).map((fl, i) => {
                    const areaSqM = i === 0 ? 120 : 95;
                    return (
                      <div key={fl.level} className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-white truncate max-w-[150px]">L{fl.level}: {fl.name}</span>
                          <span className="text-emerald-400 font-bold font-mono">{areaSqM} m²</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${(areaSqM / 140) * 100}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span>{i === 0 ? '4 Rooms • 18 Items' : '3 Rooms • 12 Items'}</span>
                          <span className="text-purple-300 font-mono">H: {fl.height}cm</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Real-Time WebGL 60 FPS Telemetry Pill */}
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[10px] my-1 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-200 font-bold">Three.js WebGL 2.0</span>
                  </div>
                  <span className="text-sky-400 font-mono font-bold">60 FPS • 128 Draws</span>
                </div>

                {/* Primary Launch Action Button */}
                <button
                  onClick={() => {
                    if (onSwitchToStudio) onSwitchToStudio();
                    else onOpenStudioWithTemplate('duplex_2floor');
                  }}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/25 transition flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open 3D Viewport Studio</span>
                </button>
              </div>
            </div>

            {/* ROW 3: STUDIO QUICK SHORTCUTS & SERVER HEALTH (SHRINK-0) */}
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-xl p-2.5 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Quick Actions:
                </span>
                <button
                  onClick={() => {
                    if (onSwitchToStudio) onSwitchToStudio();
                    else onOpenStudioWithTemplate('duplex_2floor');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch 3D Studio</span>
                </button>

                <button
                  onClick={onNewPlan}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Plan</span>
                </button>

                <button
                  onClick={onOpenBlueprintModal}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Blueprint Scan</span>
                </button>

                <button
                  onClick={onOpenAddItemModal}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Box className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add 3D Item</span>
                </button>

                <button
                  onClick={onOpenAddUserModal}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Onboard Client</span>
                </button>
              </div>

              {/* Live Server Telemetry */}
              <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Spring Boot :8090
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-sky-400" />
                  PostgreSQL 17 Live
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROJECTS DIRECTORY (INTERNAL SMOOTH SCROLL) */}
        {/* ========================================================= */}
        {currentTab === 'projects' && (
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🏡 Client Architectural Projects</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {filteredProjects.length} Projects
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filter and manage dedicated client floor plans and multi-floor architectural suites.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search project or client..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
                    />
                  </div>

                  <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700/80 text-xs">
                    {(['ALL', 'ONLINE', 'ACTIVE'] as const).map((filterVal) => (
                      <button
                        key={filterVal}
                        onClick={() => setProjectFilter(filterVal)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          projectFilter === filterVal
                            ? 'bg-sky-500 text-slate-950 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {filterVal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.user.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      proj.isCurrentActive
                        ? 'bg-gradient-to-b from-sky-950/40 to-[#0d162d] border-sky-500/40 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                        : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                              {proj.user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                                proj.user.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs font-bold text-white truncate max-w-[130px]">
                                {proj.user.name}
                              </h3>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 uppercase">
                                {proj.user.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {proj.user.email}
                            </p>
                          </div>
                        </div>

                        {proj.isCurrentActive && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 shadow-sm font-black">
                            Active in Studio
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate mb-1">
                          <span className="text-sky-400">🏡</span>
                          <span className="truncate">{proj.planName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                          <div>Floors: <span className="text-white font-semibold">{proj.floorCount}</span></div>
                          <div>Rooms: <span className="text-white font-semibold">{proj.roomCount}</span></div>
                          <div>Items: <span className="text-white font-semibold">{proj.itemCount}</span></div>
                          <div>Area: <span className="text-emerald-400 font-semibold">{proj.area} m²</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          if (onOpenClientPlan) onOpenClientPlan(proj.planId);
                          else if (onSwitchToStudio) onSwitchToStudio();
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Open & Modify in Studio</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Baseline Floor Templates */}
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Baseline Architectural Blueprints
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-sky-500/40 rounded-xl p-3.5 flex flex-col justify-between transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {tpl.floors} {tpl.floors === 1 ? 'Floor' : 'Floors'} • {tpl.area}
                        </span>
                        <Building className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition" />
                      </div>

                      <h3 className="text-xs font-bold text-white mb-1 group-hover:text-sky-300 transition">
                        {tpl.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {tpl.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenStudioWithTemplate(tpl.id)}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span>Open Blueprint in Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: USERS & ROLES */}
        {/* ========================================================= */}
        {currentTab === 'users' && (
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    User & Team Directory
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage roles, permissions, and assigned client floor plan instances.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button
                    onClick={onOpenAddUserModal}
                    className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Assigned Plan</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Studio Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredUsers.map((u) => {
                      const planId = u.assignedPlan || `plan-${u.id}`;
                      const planName = ALL_CLIENT_PLANS[planId]?.name || 'Standard Suite';

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-sky-400">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs">{u.name}</div>
                                <div className="text-[10px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                u.role === 'ADMIN'
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                  : u.role === 'DESIGNER'
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-slate-300">{planName}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => onToggleUserStatus(u.id)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 border ${
                                u.isOnline
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                }`}
                              />
                              <span>{u.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  if (onOpenClientPlan) onOpenClientPlan(planId);
                                  else if (onSwitchToStudio) onSwitchToStudio();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs border border-sky-500/30 transition"
                              >
                                Open in Studio
                              </button>
                              {u.role !== 'ADMIN' && (
                                <button
                                  onClick={() => onDeleteUser(u.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
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
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: 3D CATALOG */}
        {/* ========================================================= */}
        {currentTab === 'catalog' && (
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    3D CAD Inventory & Element Catalog
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Browse and inspect 3D furniture, lighting, and architectural assets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search 3D catalog..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <select
                    value={catalogCategory}
                    onChange={(e) => setCatalogCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Living">Living & Seating</option>
                    <option value="Bedroom">Bedroom & Bed</option>
                    <option value="Kitchen">Kitchen & Dining</option>
                    <option value="Office">Office & Work</option>
                    <option value="Lighting">Lighting & Lamps</option>
                    <option value="Outdoor">Doors & Windows</option>
                  </select>

                  <button
                    onClick={onOpenAddItemModal}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New 3D Item</span>
                  </button>
                </div>
              </div>

              {/* 3D Catalog Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-800/90 rounded-xl p-3 bg-slate-900/60 hover:bg-slate-900 hover:border-sky-500/40 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-full h-24 bg-[#091122] rounded-lg border border-slate-800 flex items-center justify-center p-2 mb-2 relative">
                        <Box className="w-7 h-7 text-slate-500 group-hover:text-sky-400 group-hover:scale-110 transition" />
                        {item.isCustom && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Custom
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                        {item.category}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.width}×{item.depth}cm</span>
                      {item.isCustom && (
                        <button
                          onClick={() => onDeleteCatalogItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MULTI-FLOOR LEVELS */}
        {/* ========================================================= */}
        {currentTab === 'floors' && (
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Multi-Floor Architecture & Elevation Management
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Structural vertical layout, ceiling heights, and level-specific room distribution.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onSwitchToStudio) onSwitchToStudio();
                    else onOpenStudioWithTemplate('duplex_2floor');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Configure in 3D</span>
                </button>
              </div>

              {/* Floor Levels Visual Stack */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {(plan.floors || [
                  { level: 0, name: 'Ground Floor', height: 250, elevation: 0 },
                  { level: 1, name: '1st Floor', height: 250, elevation: 250 },
                  { level: 2, name: 'Penthouse Roof Terrace', height: 250, elevation: 500 },
                ]).map((fl) => {
                  const roomsOnLevel = plan.rooms.filter((r) => (r.floorLevel || 0) === fl.level);
                  const furnitureOnLevel = plan.furniture.filter((f) => (f.floorLevel || 0) === fl.level);
                  const wallsOnLevel = plan.walls.filter((w) => (w.floorLevel || 0) === fl.level);

                  return (
                    <div
                      key={fl.level}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-purple-500/40 transition flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{fl.name}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                              Level {fl.level}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Elevation: <span className="text-white font-mono">{fl.elevation} cm</span> • Height: <span className="text-white font-mono">{fl.height} cm</span>
                          </p>
                        </div>
                        <Building className="w-5 h-5 text-purple-400/60" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-[10px] text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[9px]">Rooms</span>
                          <span className="font-bold text-white">{roomsOnLevel.length || 3} Areas</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Walls</span>
                          <span className="font-bold text-white">{wallsOnLevel.length || 8} Walls</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Items</span>
                          <span className="font-bold text-white">{furnitureOnLevel.length || 5} CAD</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
