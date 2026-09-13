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
  LogOut
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

  const handleTabChange = (t: DashboardMenuTab) => {
    setAdminTab(t === 'dashboard' ? 'overview' : t);
  };

  const [userSearch, setUserSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [chartTimeframe, setChartTimeframe] = useState<'monthly' | 'weekly'>('monthly');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Statistics
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

  // Catalog Category Breakdown for Donut Chart
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {
      Living: 0,
      Bedroom: 0,
      Kitchen: 0,
      Office: 0,
      Lighting: 0,
      Outdoor: 0,
      Other: 0,
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
      } else if (cat.includes('plant') || cat.includes('door') || cat.includes('outdoor')) {
        counts.Outdoor += 1;
      } else {
        counts.Other += 1;
      }
    });
    return counts;
  }, [catalog]);

  // Calculate total floor area
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

  // Monthly Activity Chart Dataset
  const monthlyData = [
    { label: 'Apr', renders: 340, cadExports: 85, projects: 4 },
    { label: 'May', renders: 520, cadExports: 120, projects: 7 },
    { label: 'Jun', renders: 480, cadExports: 140, projects: 9 },
    { label: 'Jul', renders: 690, cadExports: 210, projects: 12 },
    { label: 'Aug', renders: 890, cadExports: 290, projects: 16 },
    { label: 'Sep', renders: 1140, cadExports: 380, projects: 22 },
  ];

  const weeklyData = [
    { label: 'Mon', renders: 120, cadExports: 35, projects: 2 },
    { label: 'Tue', renders: 180, cadExports: 55, projects: 4 },
    { label: 'Wed', renders: 240, cadExports: 70, projects: 5 },
    { label: 'Thu', renders: 210, cadExports: 65, projects: 6 },
    { label: 'Fri', renders: 310, cadExports: 95, projects: 8 },
    { label: 'Sat', renders: 160, cadExports: 40, projects: 3 },
    { label: 'Sun', renders: 190, cadExports: 50, projects: 4 },
  ];

  const activeChartData = chartTimeframe === 'monthly' ? monthlyData : weeklyData;
  const maxRenderVal = Math.max(...activeChartData.map((d) => d.renders)) * 1.15;

  // SVG Area Chart Coordinate Generator
  const chartPoints = useMemo(() => {
    const width = 560;
    const height = 180;
    const paddingX = 40;
    const paddingY = 25;
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;

    const points = activeChartData.map((d, index) => {
      const x = paddingX + (index / (activeChartData.length - 1)) * innerWidth;
      const y = height - paddingY - (d.renders / maxRenderVal) * innerHeight;
      return { x, y, data: d };
    });

    const pathString = points.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[idx - 1];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }, '');

    const areaString = `${pathString} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return { points, pathString, areaString, width, height, paddingY, innerHeight };
  }, [activeChartData, maxRenderVal]);

  // Client Projects List for Projects Tab & Dashboard Recent Showcase
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
      {/* FULL-WIDTH DASHBOARD CONTENT (NO SIDEBAR) */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#080f1e] custom-scrollbar select-none">
        {/* Top Header / Sub-Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-[#0a1224]/90 backdrop-blur-xl px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {currentTab === 'dashboard' && 'Enterprise Architectural Dashboard'}
              {currentTab === 'projects' && 'Architectural Projects Directory'}
              {currentTab === 'users' && 'Team & Client Access Management'}
              {currentTab === 'catalog' && '3D CAD Inventory & Element Catalog'}
              {currentTab === 'floors' && 'Multi-Floor Structural Hierarchy'}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
              v2.5 Full View
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action Buttons */}
            <button
              onClick={onOpenAddUserModal}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700/80 transition flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>+ User</span>
            </button>

            <button
              onClick={onOpenAddItemModal}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700/80 transition flex items-center gap-1.5 active:scale-95"
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>+ 3D Model</span>
            </button>

            <button
              onClick={() => {
                if (onOpenClientSelectModal) {
                  onOpenClientSelectModal();
                } else if (onSwitchToStudio) {
                  onSwitchToStudio();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 border border-sky-400/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open 3D Studio</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body (Full Width Container) */}
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* ========================================================= */}
          {/* TAB 1: INITIAL DASHBOARD HOME (GRAPHS, CHARTS, CARDS) */}
          {/* ========================================================= */}
          {currentTab === 'dashboard' && (
            <>
              {/* TOP KPI CARDS STRIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI Card 1: Total Projects */}
                <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 hover:border-sky-500/40 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Architectural Projects
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {users.length + templates.length}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +18.4%
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>{users.length} Client Custom Suites</span>
                    <span className="text-sky-400 font-semibold">{templates.length} Templates</span>
                  </div>
                </div>

                {/* KPI Card 2: 3D Compute & Renders */}
                <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 hover:border-indigo-500/40 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      3D WebGL Compute
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition">
                      <Cpu className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white tracking-tight">
                      60 FPS
                    </span>
                    <span className="text-xs font-bold text-sky-400">
                      WebGL 2.0 Active
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>Hardware Shaders: OK</span>
                    <span className="text-indigo-400 font-semibold">1,140 Renders/mo</span>
                  </div>
                </div>

                {/* KPI Card 3: 3D Catalog Models */}
                <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 hover:border-amber-500/40 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      3D Element Catalog
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition">
                      <Box className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400 tracking-tight">
                      {catalog.length} Models
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      OBJ & GLTF
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>{catalog.filter((c) => c.isCustom).length} Custom Assets</span>
                    <span className="text-amber-400 font-semibold">7 Categories</span>
                  </div>
                </div>

                {/* KPI Card 4: Multi-Floor Total Area */}
                <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/90 shadow-xl shadow-black/20 hover:border-purple-500/40 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Multi-Floor Area
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition">
                      <Building className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-purple-300 tracking-tight">
                      {totalFloorAreaSqM > 0 ? `${totalFloorAreaSqM.toFixed(1)} m²` : '240.0 m²'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {plan.floors?.length || 2} Floors
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>{plan.rooms.length} Active Rooms</span>
                    <span className="text-purple-400 font-semibold">{plan.walls.length} CAD Walls</span>
                  </div>
                </div>
              </div>

              {/* CHARTS SECTION (2 COLUMNS: AREA CHART & DONUT CHART) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Main Render & CAD Activity Area Chart (2 cols) */}
                <div className="lg:col-span-2 bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
                          <BarChart3 className="w-4 h-4" />
                        </span>
                        <h2 className="text-sm font-bold text-white">
                          3D Rendering & CAD Export Activity
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time compute volume, architectural changes, and scene exports.
                      </p>
                    </div>

                    {/* Timeframe Toggle Buttons */}
                    <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setChartTimeframe('monthly')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          chartTimeframe === 'monthly'
                            ? 'bg-sky-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setChartTimeframe('weekly')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          chartTimeframe === 'weekly'
                            ? 'bg-sky-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Weekly
                      </button>
                    </div>
                  </div>

                  {/* SVG Line & Glowing Area Chart */}
                  <div className="relative w-full overflow-hidden flex flex-col items-center justify-center my-2">
                    <svg
                      viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                      className="w-full h-48 overflow-visible"
                    >
                      <defs>
                        <linearGradient id="cyanIndigoArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="50%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0.25, 0.5, 0.75, 1].map((lvl) => {
                        const yPos =
                          chartPoints.height -
                          chartPoints.paddingY -
                          lvl * chartPoints.innerHeight;
                        return (
                          <line
                            key={lvl}
                            x1="35"
                            y1={yPos}
                            x2={chartPoints.width - 35}
                            y2={yPos}
                            stroke="#1e293b"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Area Fill */}
                      <path d={chartPoints.areaString} fill="url(#cyanIndigoArea)" />

                      {/* Line Stroke */}
                      <path
                        d={chartPoints.pathString}
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Data Point Circles & Tooltips */}
                      {chartPoints.points.map((pt, idx) => (
                        <g key={idx} className="cursor-pointer">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredPointIndex === idx ? '6' : '4'}
                            fill="#0f172a"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                            className="transition-all duration-150"
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />
                          {/* Label under point */}
                          <text
                            x={pt.x}
                            y={chartPoints.height - 6}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="11"
                            fontWeight="600"
                          >
                            {pt.data.label}
                          </text>

                          {/* Hover Tooltip */}
                          {hoveredPointIndex === idx && (
                            <g>
                              <rect
                                x={pt.x - 45}
                                y={pt.y - 42}
                                width="90"
                                height="32"
                                rx="8"
                                fill="#091020"
                                stroke="#38bdf8"
                                strokeWidth="1"
                                filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                              />
                              <text
                                x={pt.x}
                                y={pt.y - 22}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                {pt.data.renders} Renders
                              </text>
                            </g>
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Summary Metric Footer */}
                  <div className="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-4 mt-2">
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Monthly Average
                      </span>
                      <span className="text-sm font-black text-sky-400 mt-0.5 block">
                        710 Renders
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        CAD Modifications
                      </span>
                      <span className="text-sm font-black text-indigo-400 mt-0.5 block">
                        2,890 Operations
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Cloud Sync Rate
                      </span>
                      <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                        99.98% Synced
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. 3D Catalog Category Distribution Donut Chart (1 col) */}
                <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
                          <PieChartIcon className="w-4 h-4" />
                        </span>
                        <h2 className="text-sm font-bold text-white">3D Catalog Mix</h2>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {catalog.length} Total
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Asset categorization across interior spaces.
                    </p>

                    {/* Donut Chart Visual */}
                    <div className="flex items-center justify-center my-2 relative">
                      <svg className="w-36 h-36 transform -rotate-90">
                        {/* Circle Segments */}
                        <circle
                          cx="72"
                          cy="72"
                          r="54"
                          stroke="#1e293b"
                          strokeWidth="16"
                          fill="transparent"
                        />
                        {/* Living */}
                        <circle
                          cx="72"
                          cy="72"
                          r="54"
                          stroke="#38bdf8"
                          strokeWidth="16"
                          strokeDasharray="339"
                          strokeDashoffset="180"
                          fill="transparent"
                          strokeLinecap="round"
                        />
                        {/* Bedroom */}
                        <circle
                          cx="72"
                          cy="72"
                          r="54"
                          stroke="#6366f1"
                          strokeWidth="16"
                          strokeDasharray="339"
                          strokeDashoffset="270"
                          fill="transparent"
                          strokeLinecap="round"
                        />
                        {/* Lighting */}
                        <circle
                          cx="72"
                          cy="72"
                          r="54"
                          stroke="#f59e0b"
                          strokeWidth="16"
                          strokeDasharray="339"
                          strokeDashoffset="310"
                          fill="transparent"
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Center Label */}
                      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-400 uppercase">Models</span>
                        <span className="text-xl font-black text-white">{catalog.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Progress Legend */}
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                        <span className="text-slate-300 font-medium">Living & Seating</span>
                      </div>
                      <span className="text-white font-bold">{categoryCounts.Living} items</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-slate-300 font-medium">Bedroom & Storage</span>
                      </div>
                      <span className="text-white font-bold">{categoryCounts.Bedroom} items</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-slate-300 font-medium">Lighting & Ceiling</span>
                      </div>
                      <span className="text-white font-bold">{categoryCounts.Lighting} items</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-slate-300 font-medium">Kitchen & Dining</span>
                      </div>
                      <span className="text-white font-bold">{categoryCounts.Kitchen} items</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS ROW */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
                      <Zap className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-bold text-white">Studio Quick Actions</h2>
                  </div>
                  <span className="text-xs text-slate-400">Instant shortcuts</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <button
                    onClick={() => {
                      if (onSwitchToStudio) onSwitchToStudio();
                      else onOpenStudioWithTemplate('duplex_2floor');
                    }}
                    className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/10 hover:from-sky-500/30 hover:to-indigo-500/20 border border-sky-500/30 text-left transition group active:scale-95"
                  >
                    <Sparkles className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-white block">Launch 3D Studio</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">2D & 3D Split CAD</span>
                  </button>

                  <button
                    onClick={onNewPlan}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition group active:scale-95"
                  >
                    <Plus className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-white block">New Blank Plan</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Start from scratch</span>
                  </button>

                  <button
                    onClick={onOpenBlueprintModal}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition group active:scale-95"
                  >
                    <FileCode2 className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-white block">Import Blueprint</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Scan & calibrate</span>
                  </button>

                  <button
                    onClick={onOpenAddItemModal}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition group active:scale-95"
                  >
                    <Box className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-white block">Add 3D Item</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Custom OBJ model</span>
                  </button>

                  <button
                    onClick={onOpenAddUserModal}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition group active:scale-95"
                  >
                    <UserPlus className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-white block">Onboard Client</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Assign permissions</span>
                  </button>
                </div>
              </div>

              {/* RECENT ARCHITECTURAL PROJECTS SHOWCASE */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
                        <FolderKanban className="w-4 h-4" />
                      </span>
                      <h2 className="text-sm font-bold text-white">Recent Client Projects</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      1-click seamless transition to modify or tour client architectural designs.
                    </p>
                  </div>

                  <button
                    onClick={() => handleTabChange('projects')}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View All {clientProjects.length} Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientProjects.slice(0, 3).map((proj) => (
                    <div
                      key={proj.user.id}
                      className={`rounded-xl p-4 border transition-all flex flex-col justify-between ${
                        proj.isCurrentActive
                          ? 'bg-gradient-to-b from-sky-950/40 to-[#0d162d] border-sky-500/40 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/30'
                          : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-sky-400">
                              {proj.user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white truncate max-w-[140px]">
                                {proj.user.name}
                              </div>
                              <span className="text-[10px] text-slate-400">{proj.user.role}</span>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                              proj.isCurrentActive
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {proj.isCurrentActive ? 'Active in 3D' : proj.status}
                          </span>
                        </div>

                        {/* Project Specs Pill */}
                        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                          <div className="text-xs font-bold text-white truncate mb-1">
                            🏡 {proj.planName}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{proj.floorCount} Floors</span>
                            <span>•</span>
                            <span>{proj.roomCount} Rooms</span>
                            <span>•</span>
                            <span>{proj.itemCount} Items</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{proj.area} m²</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (onOpenClientPlan) onOpenClientPlan(proj.planId);
                          else if (onSwitchToStudio) onSwitchToStudio();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Open in 3D Studio</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PROJECTS MANAGEMENT */}
          {/* ========================================================= */}
          {currentTab === 'projects' && (
            <div className="space-y-6">
              {/* Filter & Search Bar */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
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

                        {/* Project Details */}
                        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate mb-1.5">
                            <span className="text-sky-400">🏡</span>
                            <span className="truncate">{proj.planName}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400">
                            <div>Floors: <span className="text-white font-semibold">{proj.floorCount} Levels</span></div>
                            <div>Rooms: <span className="text-white font-semibold">{proj.roomCount} Areas</span></div>
                            <div>Furniture: <span className="text-white font-semibold">{proj.itemCount} CAD</span></div>
                            <div>Area: <span className="text-emerald-400 font-semibold">{proj.area} m²</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-1.5">
                        <button
                          onClick={() => {
                            if (onOpenClientPlan) onOpenClientPlan(proj.planId);
                            else if (onSwitchToStudio) onSwitchToStudio();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-95"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Open & Modify in Studio</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              if (onStartNewDesignForClient) {
                                onStartNewDesignForClient(proj.user, 'duplex_2floor');
                              }
                            }}
                            className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition text-center truncate"
                            title="Start fresh 2-Floor Duplex for this client"
                          >
                            + New Duplex
                          </button>
                          <button
                            onClick={() => {
                              if (onStartNewDesignForClient) {
                                onStartNewDesignForClient(proj.user, 'studio_apt');
                              }
                            }}
                            className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition text-center truncate"
                            title="Start fresh Studio Loft for this client"
                          >
                            + New Studio
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Baseline Floor Templates */}
              <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      Architectural Baseline Templates
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standard pre-configured multi-floor blueprints ready for instant customization.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-sky-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {tpl.floors} {tpl.floors === 1 ? 'Floor' : 'Floors'} • {tpl.area}
                          </span>
                          <Building className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition" />
                        </div>

                        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-sky-300 transition">
                          {tpl.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {tpl.description}
                        </p>
                      </div>

                      <button
                        onClick={() => onOpenStudioWithTemplate(tpl.id)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>Open Template in Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: USERS DIRECTORY */}
          {/* ========================================================= */}
          {currentTab === 'users' && (
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
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
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Assigned Plan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Studio Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredUsers.map((u) => {
                      const planId = u.assignedPlan || `plan-${u.id}`;
                      const planName = ALL_CLIENT_PLANS[planId]?.name || 'Standard Suite';

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-[10px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
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
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-300">{planName}</span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => onToggleUserStatus(u.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 border ${
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
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  if (onOpenClientPlan) onOpenClientPlan(planId);
                                  else if (onSwitchToStudio) onSwitchToStudio();
                                }}
                                className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs border border-sky-500/30 transition"
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
          )}

          {/* ========================================================= */}
          {/* TAB 4: 3D CATALOG */}
          {/* ========================================================= */}
          {currentTab === 'catalog' && (
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
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
                      <div className="w-full h-24 bg-[#091122] rounded-lg border border-slate-800 flex items-center justify-center p-2 mb-2.5 relative">
                        <Box className="w-8 h-8 text-slate-500 group-hover:text-sky-400 group-hover:scale-110 transition" />
                        {item.isCustom && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Custom
                          </span>
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-500">
                          3D OBJ
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                        {item.category}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.width}×{item.depth}×{item.height}cm</span>
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
          )}

          {/* ========================================================= */}
          {/* TAB 5: MULTI-FLOOR LEVELS */}
          {/* ========================================================= */}
          {currentTab === 'floors' && (
            <div className="bg-[#101c38]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 shadow-xl shadow-black/20 space-y-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-purple-500/40 transition flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{fl.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                              Level {fl.level}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Elevation: <span className="text-white font-mono">{fl.elevation} cm</span> • Ceiling Height: <span className="text-white font-mono">{fl.height} cm</span>
                          </p>
                        </div>
                        <Building className="w-6 h-6 text-purple-400/60" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Rooms</span>
                          <span className="font-bold text-white">{roomsOnLevel.length || 3} Areas</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Walls</span>
                          <span className="font-bold text-white">{wallsOnLevel.length || 8} Segments</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Furniture</span>
                          <span className="font-bold text-white">{furnitureOnLevel.length || 5} Items</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
