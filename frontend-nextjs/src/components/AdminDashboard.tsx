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
  Layers3
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
    { month: 'Apr', projects: 8, clients: 5, renders: 340 },
    { month: 'May', projects: 12, clients: 8, renders: 520 },
    { month: 'Jun', projects: 15, clients: 11, renders: 480 },
    { month: 'Jul', projects: 19, clients: 14, renders: 690 },
    { month: 'Aug', projects: 24, clients: 18, renders: 890 },
    { month: 'Sep', projects: 31, clients: 22, renders: 1140 },
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
      {/* FIT-SCREEN DASHBOARD VIEW (NO VERTICAL SCROLL) */}
      {/* ========================================================= */}
      <main className="flex-1 h-full flex flex-col p-3 sm:p-4 lg:p-4.5 gap-3 overflow-hidden select-none">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD HOME (FITS 100% OF SCREEN) */}
        {/* ========================================================= */}
        {currentTab === 'dashboard' && (
          <div className="flex-1 flex flex-col justify-between gap-3 h-full min-h-0 overflow-hidden">
            {/* ROW 1: 4 COMPACT ESSENTIAL KPI CARDS (~14% Height) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
              {/* Card 1: Clients & Team */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-xl p-3 border border-slate-800/90 shadow-lg shadow-black/20 flex items-center justify-between hover:border-emerald-500/40 transition">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Clients & Team
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-white">{users.length} Users</span>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {onlineUsersCount} Online
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {clientCount} Clients • {designerCount} Designers
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              {/* Card 2: Projects */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-xl p-3 border border-slate-800/90 shadow-lg shadow-black/20 flex items-center justify-between hover:border-sky-500/40 transition">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Architectural Plans
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-white">{users.length + templates.length} Projects</span>
                    <span className="text-[11px] font-bold text-sky-400">+24% Active</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {users.length} Suites • {templates.length} Templates
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-4 h-4" />
                </div>
              </div>

              {/* Card 3: 3D Catalog Items */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-xl p-3 border border-slate-800/90 shadow-lg shadow-black/20 flex items-center justify-between hover:border-amber-500/40 transition">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    3D Element Catalog
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-amber-400">{catalog.length} Models</span>
                    <span className="text-[11px] font-bold text-slate-400">OBJ / GLTF</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {catalog.filter((c) => c.isCustom).length} Custom • 6 Room Categories
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Box className="w-4 h-4" />
                </div>
              </div>

              {/* Card 4: Multi-Floor Total Area */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-xl p-3 border border-slate-800/90 shadow-lg shadow-black/20 flex items-center justify-between hover:border-purple-500/40 transition">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Multi-Floor Area & Walls
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-purple-300">
                      {totalFloorAreaSqM > 0 ? `${totalFloorAreaSqM.toFixed(1)} m²` : '240 m²'}
                    </span>
                    <span className="text-[11px] font-bold text-purple-400">
                      {plan.floors?.length || 2} Levels
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {plan.rooms.length} Rooms • {plan.walls.length} CAD Walls
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* ROW 2: MAIN VISUAL CHARTS GRID (FLEXIBLE HEIGHT, ~72% Height) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
              {/* CHART 1: MONTHLY PROJECTS & CLIENTS BAR CHART (6 Cols) */}
              <div className="lg:col-span-6 bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-sky-500/10 text-sky-400">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </span>
                    <h2 className="text-xs font-bold text-white">Monthly Projects & Client Growth</h2>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[11px] font-semibold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-sky-400" />
                      <span className="text-slate-300">Projects ({users.length + templates.length})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                      <span className="text-slate-300">Clients ({clientCount})</span>
                    </div>
                  </div>
                </div>

                {/* SVG Bar Chart Graphic */}
                <div className="relative w-full flex-1 min-h-[140px] flex items-center justify-center my-1">
                  <svg viewBox="0 0 520 160" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="skyBarG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                      <linearGradient id="indigoBarG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    {[0, 10, 20, 30].map((val) => {
                      const y = 135 - (val / 35) * 115;
                      return (
                        <g key={val}>
                          <line x1="30" y1={y} x2="505" y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                          <text x="20" y={y + 3} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="end">{val}</text>
                        </g>
                      );
                    })}

                    {/* Bars */}
                    {barChartData.map((d, idx) => {
                      const groupX = 55 + idx * 75;
                      const pHeight = (d.projects / 35) * 115;
                      const cHeight = (d.clients / 35) * 115;
                      const isHovered = hoveredBarIndex === idx;

                      return (
                        <g
                          key={d.month}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        >
                          {isHovered && (
                            <rect x={groupX - 6} y="15" width="56" height="122" rx="6" fill="#1e293b" opacity="0.6" />
                          )}
                          <rect x={groupX} y={135 - pHeight} width="18" height={pHeight} rx="3" fill="url(#skyBarG)" />
                          <rect x={groupX + 22} y={135 - cHeight} width="18" height={cHeight} rx="3" fill="url(#indigoBarG)" />
                          <text x={groupX + 20} y="150" fill={isHovered ? '#ffffff' : '#94a3b8'} fontSize="10" fontWeight="bold" textAnchor="middle">
                            {d.month}
                          </text>

                          {/* Hover Tooltip */}
                          {isHovered && (
                            <g>
                              <rect x={groupX - 22} y={Math.min(135 - pHeight, 135 - cHeight) - 30} width="84" height="24" rx="5" fill="#091020" stroke="#38bdf8" strokeWidth="1" />
                              <text x={groupX + 20} y={Math.min(135 - pHeight, 135 - cHeight) - 14} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                                {d.projects} Proj • {d.clients} Cli
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Bottom Bar Metrics */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-2 text-center text-[10px]">
                  <div><span className="text-slate-400 block">Average</span><strong className="text-sky-400 font-bold">18 Proj/mo</strong></div>
                  <div><span className="text-slate-400 block">Conversion</span><strong className="text-emerald-400 font-bold">86.5%</strong></div>
                  <div><span className="text-slate-400 block">Peak Month</span><strong className="text-indigo-400 font-bold">+31 (Sep)</strong></div>
                </div>
              </div>

              {/* CHART 2: 3D CATALOG DONUT & PROGRESS BARS (3 Cols) */}
              <div className="lg:col-span-3 bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                      <PieChartIcon className="w-3.5 h-3.5" />
                    </span>
                    <h2 className="text-xs font-bold text-white">3D Catalog Mix</h2>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {catalog.length} Total
                  </span>
                </div>

                {/* Donut Graphic */}
                <div className="flex items-center justify-center my-0.5 relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="36" stroke="#1e293b" strokeWidth="11" fill="transparent" />
                    <circle cx="48" cy="48" r="36" stroke="#38bdf8" strokeWidth="11" strokeDasharray="226" strokeDashoffset="120" fill="transparent" strokeLinecap="round" />
                    <circle cx="48" cy="48" r="36" stroke="#818cf8" strokeWidth="11" strokeDasharray="226" strokeDashoffset="180" fill="transparent" strokeLinecap="round" />
                    <circle cx="48" cy="48" r="36" stroke="#f59e0b" strokeWidth="11" strokeDasharray="226" strokeDashoffset="205" fill="transparent" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Models</span>
                    <span className="text-sm font-black text-white">{catalog.length}</span>
                  </div>
                </div>

                {/* Compact Progress Bars */}
                <div className="space-y-1.5 text-[10px]">
                  <div>
                    <div className="flex justify-between font-semibold mb-0.5">
                      <span className="text-slate-300">🛋️ Living</span>
                      <span className="text-white font-bold">{categoryCounts.Living}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, (categoryCounts.Living / (catalog.length || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-0.5">
                      <span className="text-slate-300">🛏️ Bedroom</span>
                      <span className="text-white font-bold">{categoryCounts.Bedroom}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400" style={{ width: `${Math.min(100, (categoryCounts.Bedroom / (catalog.length || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-0.5">
                      <span className="text-slate-300">💡 Lighting</span>
                      <span className="text-white font-bold">{categoryCounts.Lighting}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (categoryCounts.Lighting / (catalog.length || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-0.5">
                      <span className="text-slate-300">🍳 Kitchen</span>
                      <span className="text-white font-bold">{categoryCounts.Kitchen}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (categoryCounts.Kitchen / (catalog.length || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* CHART 3: MULTI-FLOOR LEVEL DISTRIBUTION & COMPUTE (3 Cols) */}
              <div className="lg:col-span-3 bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-purple-500/10 text-purple-400">
                      <Layers3 className="w-3.5 h-3.5" />
                    </span>
                    <h2 className="text-xs font-bold text-white">Multi-Floor Space</h2>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {plan.floors?.length || 2} Floors
                  </span>
                </div>

                {/* Level Stack Cards */}
                <div className="space-y-2 my-1 text-[11px]">
                  {(plan.floors || [
                    { level: 0, name: 'Ground Floor', height: 250 },
                    { level: 1, name: '1st Floor', height: 250 },
                  ]).slice(0, 2).map((fl, i) => {
                    const areaSqM = i === 0 ? 120 : 95;
                    return (
                      <div key={fl.level} className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-[10px]">L{fl.level}: {fl.name}</span>
                          <span className="text-emerald-400 font-bold text-[10px]">{areaSqM} m²</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${(areaSqM / 140) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* WebGL 60 FPS Telemetry Pill */}
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-300 font-semibold">WebGL 2.0 Engine</span>
                  </div>
                  <strong className="text-sky-400 font-bold">60 FPS Active</strong>
                </div>

                {/* Action Link */}
                <button
                  onClick={() => {
                    if (onSwitchToStudio) onSwitchToStudio();
                    else onOpenStudioWithTemplate('duplex_2floor');
                  }}
                  className="w-full py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[11px] font-bold shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-1 active:scale-95"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Open 3D Viewport</span>
                </button>
              </div>
            </div>

            {/* ROW 3: COMPACT 1-LINE STUDIO QUICK SHORTCUTS & TELEMETRY (~14% Height) */}
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
