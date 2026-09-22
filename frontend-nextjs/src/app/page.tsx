'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminDashboard } from '../components/AdminDashboard';
import { FurnitureListPane } from '../components/FurnitureListPane';
import { PlanCanvas2D } from '../components/PlanCanvas2D';
import { Viewport3D } from '../components/Viewport3D';
import { InspectorSidebar } from '../components/InspectorSidebar';
import { CustomerPresentationView } from '../components/CustomerPresentationView';
import { LoginPage } from '../components/LoginPage';
import { ShareModal } from '../components/ShareModal';
import { AddUserModal } from '../components/AddUserModal';
import { AddItemModal } from '../components/AddItemModal';
import { BlueprintImportModal } from '../components/BlueprintImportModal';
import { PreferencesModal } from '../components/PreferencesModal';
import { ClientProjectSelectModal } from '../components/ClientProjectSelectModal';
import { HomePlan, CatalogItem, FurnitureItem, User, UserRole, FloorTemplate, BlueprintImage, ProjectPreferences, VisitorCameraState } from '../types/plan';
import { detectCollisions } from '../services/collisionDetector';
import { isTabletopItem, findNearestSupportingSurface, autoAttachToTabletop } from '../services/tabletopAttachment';
import {
  sampleDefaultPlan,
  ALL_CLIENT_PLANS,
  fetchPlanById,
  fetchCatalog,
  savePlanToBackend,
  checkBackendHealth,
  decodePlanFromShareUrl,
  fetchUsers,
  createAdminUser,
  toggleUserStatus,
  addCustomCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  fetchFloorTemplates
} from '../services/api';
import {
  Layers,
  Sparkles,
  LayoutDashboard,
  Box,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  ArrowRight,
  Home,
  UserPlus,
  FolderKanban,
  RotateCcw,
  RotateCw,
  Sun,
  Moon,
  FolderOpen,
  Share2,
  Save,
  Sliders,
  Image as ImageIcon,
  Building,
  Columns,
  Eye,
  AlertTriangle,
  DollarSign,
  Wand2
} from 'lucide-react';
import { CostEstimatorModal } from '../components/CostEstimatorModal';
import { AiStylerModal } from '../components/AiStylerModal';

export default function HomeStudioPage() {
  const [plan, setPlan] = useState<HomePlan>(sampleDefaultPlan);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<FloorTemplate[]>([]);

  // Theme Management (Dark & Light)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sweethome_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('sweethome_theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      return nextTheme;
    });
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<'split' | '2d' | '3d' | 'customer' | 'dashboard'>('dashboard');
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'catalog' | 'floors'>('overview');
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [floorMode, setFloorMode] = useState<'single' | 'sideBySide' | 'stacked'>('single');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [cameraMode3D, setCameraMode3D] = useState<'aerial' | 'visitor'>('aerial');
  const [visitorCamera, setVisitorCamera] = useState<VisitorCameraState>({
    x: 0,
    y: 0,
    yaw: 0,
    elevation: 160,
    floorLevel: 0,
  });

  const handleUpdateVisitorCamera = useCallback((partial: Partial<VisitorCameraState>) => {
    setVisitorCamera((prev) => {
      const next = { ...prev, ...partial };
      if (next.floorLevel !== undefined && next.floorLevel !== activeFloor) {
        setActiveFloor(next.floorLevel);
      }
      return next;
    });
  }, [activeFloor]);

  // When activeFloor changes from top navbar or floor clicks, sync visitor camera to that floor
  useEffect(() => {
    setVisitorCamera((prev) => {
      if (prev.floorLevel !== activeFloor) {
        const targetRoom = plan.rooms.find((r) => (r.floorLevel ?? 0) === activeFloor) || plan.rooms[0];
        let initX = 0;
        let initY = 0;
        if (targetRoom && targetRoom.points.length > 0) {
          initX = Math.round(targetRoom.points.reduce((acc, p) => acc + p.x, 0) / targetRoom.points.length);
          initY = Math.round(targetRoom.points.reduce((acc, p) => acc + p.y, 0) / targetRoom.points.length);
        }
        return {
          ...prev,
          x: initX,
          y: initY,
          floorLevel: activeFloor,
        };
      }
      return prev;
    });
  }, [activeFloor, plan.rooms]);

  const [isFurnitureListOpen, setIsFurnitureListOpen] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-open Inspector & Properties panel when any item or wall is selected (in Orbit / 2D mode)
  useEffect(() => {
    if (selectedId && cameraMode3D !== 'visitor') {
      setIsInspectorOpen(true);
    }
  }, [selectedId, cameraMode3D]);

  // When switching to Walk view (Visitor mode), immediately close properties & deselect items
  useEffect(() => {
    if (cameraMode3D === 'visitor') {
      setSelectedId(null);
      setIsInspectorOpen(false);
    }
  }, [cameraMode3D]);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState<boolean>(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);
  const [isClientSelectModalOpen, setIsClientSelectModalOpen] = useState<boolean>(false);
  const [isCostEstimatorModalOpen, setIsCostEstimatorModalOpen] = useState<boolean>(false);
  const [isAiStylerModalOpen, setIsAiStylerModalOpen] = useState<boolean>(false);

  // Ref-Backed Undo / Redo History Stack
  const historyRef = useRef<HomePlan[]>([JSON.parse(JSON.stringify(sampleDefaultPlan))]);
  const historyIndexRef = useRef<number>(0);
  const isHistoryActionRef = useRef<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  const isIdenticalStructure = (a: HomePlan, b: HomePlan) => {
    if (
      a.furniture.length !== b.furniture.length ||
      a.walls.length !== b.walls.length ||
      a.rooms.length !== b.rooms.length ||
      (a.dimensionLines?.length || 0) !== (b.dimensionLines?.length || 0) ||
      (a.textNotes?.length || 0) !== (b.textNotes?.length || 0)
    ) {
      return false;
    }
    return (
      JSON.stringify(a.furniture) === JSON.stringify(b.furniture) &&
      JSON.stringify(a.walls) === JSON.stringify(b.walls) &&
      JSON.stringify(a.rooms) === JSON.stringify(b.rooms) &&
      JSON.stringify(a.dimensionLines || []) === JSON.stringify(b.dimensionLines || []) &&
      JSON.stringify(a.textNotes || []) === JSON.stringify(b.textNotes || [])
    );
  };

  const commitSnapshot = useCallback((newPlan: HomePlan) => {
    if (isHistoryActionRef.current) return;

    const currentHead = historyRef.current[historyIndexRef.current];
    if (currentHead && isIdenticalStructure(currentHead, newPlan)) {
      return;
    }

    const cleanCopy: HomePlan = JSON.parse(JSON.stringify(newPlan));
    const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHist.push(cleanCopy);
    if (newHist.length > 50) newHist.shift();

    historyRef.current = newHist;
    historyIndexRef.current = newHist.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const handleUpdatePlan = useCallback(
    (newPlan: HomePlan) => {
      setPlan(newPlan);
      commitSnapshot(newPlan);

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      setCloudSyncStatus('saving');

      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await savePlanToBackend(newPlan);
          setCloudSyncStatus('synced');
          setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (e) {
          setCloudSyncStatus('offline');
        }
      }, 1200);
    },
    [commitSnapshot]
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isHistoryActionRef.current = true;
      historyIndexRef.current -= 1;
      const prevPlan = historyRef.current[historyIndexRef.current];
      setPlan(JSON.parse(JSON.stringify(prevPlan)));
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      setTimeout(() => {
        isHistoryActionRef.current = false;
      }, 50);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isHistoryActionRef.current = true;
      historyIndexRef.current += 1;
      const nextPlan = historyRef.current[historyIndexRef.current];
      setPlan(JSON.parse(JSON.stringify(nextPlan)));
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      setTimeout(() => {
        isHistoryActionRef.current = false;
      }, 50);
    }
  }, []);

  // Initial Data Fetching & Auth Check
  useEffect(() => {
    const savedUser = localStorage.getItem('sweethome_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setUserRole(u.role);
      } catch (e) {}
    }
    setIsAuthLoaded(true);

    const initData = async () => {
      try {
        const [catData, usersData, tplData] = await Promise.all([
          fetchCatalog(),
          fetchUsers(),
          fetchFloorTemplates()
        ]);
        setCatalog(catData);
        setUsers(usersData);
        setTemplates(tplData);

        const isHealthy = await checkBackendHealth();
        setIsBackendConnected(isHealthy);
      } catch (err) {
        setIsBackendConnected(false);
      }
    };

    initData();
  }, []);

  const collisionReport = useMemo(() => {
    return detectCollisions(plan.furniture, plan.walls, activeFloor);
  }, [plan.furniture, plan.walls, activeFloor]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setUserRole(user.role);
    localStorage.setItem('sweethome_current_user', JSON.stringify(user));
    if (user.role === 'CLIENT') {
      setActiveView('customer');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sweethome_current_user');
    setActiveView('dashboard');
  };

  const handleAddItem = (catalogItem: CatalogItem) => {
    const newItem: FurnitureItem = {
      id: `f_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      catalogId: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      x: 0,
      y: 0,
      elevation: catalogItem.defaultElevation || 0,
      angle: 0,
      width: catalogItem.width,
      depth: catalogItem.depth,
      height: catalogItem.height,
      model: catalogItem.model,
      icon: catalogItem.icon,
      color: catalogItem.defaultColor || '#cbd5e1',
      floorLevel: activeFloor,
      isVisible: true,
      isLocked: false
    };

    const updated = {
      ...plan,
      furniture: [...plan.furniture, newItem],
      updatedAt: new Date().toISOString()
    };
    handleUpdatePlan(updated);
    setSelectedId(newItem.id);
  };

  const handleToggleItemVisibility = (id: string) => {
    const updated = {
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === id ? { ...f, isVisible: f.isVisible === false ? true : false } : f))
    };
    handleUpdatePlan(updated);
  };

  const handleToggleItemLock = (id: string) => {
    const updated = {
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === id ? { ...f, isLocked: !f.isLocked } : f))
    };
    handleUpdatePlan(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = {
      ...plan,
      furniture: plan.furniture.filter((f) => f.id !== id),
      walls: plan.walls.filter((w) => w.id !== id),
      rooms: plan.rooms.filter((r) => r.id !== id),
      dimensionLines: (plan.dimensionLines || []).filter((d) => d.id !== id),
      textNotes: (plan.textNotes || []).filter((n) => n.id !== id),
    };
    handleUpdatePlan(updated);
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePlanToBackend(plan);
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      setCloudSyncStatus('offline');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomItem = async (newItem: CatalogItem, autoPlaceInScene?: boolean) => {
    try {
      const created = await addCustomCatalogItem(newItem);
      setCatalog((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      if (autoPlaceInScene) {
        handleAddItem(created);
      }
      setIsAddItemModalOpen(false);
    } catch (e) {
      console.warn('Backend catalog offline, adding locally:', e);
      setCatalog((prev) => [newItem, ...prev.filter((c) => c.id !== newItem.id)]);
      if (autoPlaceInScene) {
        handleAddItem(newItem);
      }
      setIsAddItemModalOpen(false);
    }
  };

  const handleUpdateCatalogItem = async (updatedItem: CatalogItem) => {
    try {
      const saved = await updateCatalogItem(updatedItem);
      setCatalog((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      setPlan((prev) => ({
        ...prev,
        furniture: prev.furniture.map((f) =>
          f.catalogId === saved.id
            ? {
                ...f,
                name: saved.name,
                category: saved.category,
                width: saved.width,
                depth: saved.depth,
                height: saved.height,
                model: saved.model,
                color: f.color || saved.defaultColor,
              }
            : f
        ),
      }));
    } catch (e) {
      console.error('Failed to update catalog item:', e);
    }
  };

  const handleAddUser = async (user: User) => {
    try {
      const res = await createAdminUser(user);
      if (res && res.user) {
        setUsers((prev) => [...prev, res.user]);
      }
      setIsAddUserModalOpen(false);
    } catch (e) {}
  };

  const handleSaveBlueprint = (bp: BlueprintImage | null) => {
    const updated = {
      ...plan,
      blueprint: bp || undefined
    };
    handleUpdatePlan(updated);
    setIsBlueprintModalOpen(false);
  };

  const handleSavePreferences = (prefs: ProjectPreferences) => {
    const updated = {
      ...plan,
      preferences: prefs
    };
    handleUpdatePlan(updated);
    setIsPreferencesModalOpen(false);
  };

  const handleSelectClientProject = async (planId: string) => {
    try {
      const loaded = await fetchPlanById(planId);
      if (loaded) {
        setPlan(loaded);
        historyRef.current = [JSON.parse(JSON.stringify(loaded))];
        historyIndexRef.current = 0;
        setCanUndo(false);
        setCanRedo(false);
      }
    } catch (e) {}
  };

  const handleStartNewDesignForClient = (client: User, templateId?: string) => {
    const freshPlan: HomePlan = {
      ...sampleDefaultPlan,
      id: `plan_${client.id}_${Date.now()}`,
      name: `${client.name}'s Residence`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPlan(freshPlan);
    historyRef.current = [JSON.parse(JSON.stringify(freshPlan))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setIsClientSelectModalOpen(false);
    setActiveView('split');
  };

  if (!isAuthLoaded) {
    return (
      <div className="h-screen w-screen bg-[#080d19] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading SweetHome 3D Studio...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLoginSuccess} availableUsers={users} />;
  }

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans ${isDark ? 'bg-[#080d19] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Main Navigation Bar */}
      <Navbar
        plan={plan}
        activeView={activeView}
        setActiveView={setActiveView}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        userRole={userRole}
        setUserRole={setUserRole}
        cloudSyncStatus={cloudSyncStatus}
        lastSyncedAt={lastSyncedAt}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: Admin / Enterprise Dashboard */}
        {activeView === 'dashboard' && (
          <AdminDashboard
            users={users}
            catalog={catalog}
            templates={templates}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            onOpenStudioWithTemplate={(tplId) => {
              setActiveView('split');
            }}
            onOpenClientPlan={(planId) => {
              handleSelectClientProject(planId);
              setActiveView('split');
            }}
            onStartNewDesignForClient={handleStartNewDesignForClient}
            onToggleUserStatus={async (uId) => {
              await toggleUserStatus(uId);
              setUsers((prev) => prev.map((u) => (u.id === uId ? { ...u, isOnline: !u.isOnline } : u)));
            }}
            onDeleteUser={(uId) => {
              setUsers((prev) => prev.filter((u) => u.id !== uId));
            }}
            onDeleteCatalogItem={async (itemId) => {
              await deleteCatalogItem(itemId);
              setCatalog((prev) => prev.filter((c) => c.id !== itemId));
            }}
            onOpenAddItemModal={() => setIsAddItemModalOpen(true)}
            onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
            onOpenClientSelectModal={() => setIsClientSelectModalOpen(true)}
            plan={plan}
            onOpenBlueprintModal={() => setIsBlueprintModalOpen(true)}
            onNewPlan={() => {
              const fresh: HomePlan = {
                ...sampleDefaultPlan,
                id: `plan_${Date.now()}`,
                name: 'New Custom Home Plan',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setPlan(fresh);
              setActiveView('split');
            }}
            onSwitchToStudio={() => setActiveView('split')}
            currentUser={currentUser}
            onLogout={handleLogout}
            onAddItem={handleAddItem}
            onUpdateCatalogItem={handleUpdateCatalogItem}
          />
        )}

        {/* VIEW 2: Client Presentation / 3D Walkthrough View */}
        {activeView === 'customer' && (
          <CustomerPresentationView
            plan={plan}
            catalog={catalog}
            clientName={currentUser?.name || 'Client'}
            userRole={userRole}
            onUpdatePlan={handleUpdatePlan}
            onSwitchToStudio={() => setActiveView('split')}
            onOpenShare={() => setIsShareModalOpen(true)}
            collidingItemIds={collisionReport.collidingItemIds}
            activeFloor={activeFloor}
            onFloorChange={setActiveFloor}
            floorMode={floorMode}
            onFloorModeChange={setFloorMode}
          />
        )}

        {/* VIEW 3: Interactive Design Studio (Split, 2D Blueprint, 3D WebGL) */}
        {(activeView === 'split' || activeView === '2d' || activeView === '3d') && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Beautiful Scattered Pro Design Studio Command Center */}
            <div className={`flex-shrink-0 px-4 py-2 border-b flex items-center justify-between gap-2 select-none z-20 backdrop-blur-md ${
              isDark ? 'bg-[#0b1222]/90 border-slate-800/90 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800 shadow-xs'
            }`}>
              {/* Cluster 1: View Mode Pill Switcher */}
              <div className={`flex items-center p-1 rounded-xl border ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setActiveView('2d')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeView === '2d'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="2D CAD Architectural Floor Plan"
                >
                  <span>📐</span>
                  <span>2D Plan</span>
                </button>

                <button
                  onClick={() => setActiveView('3d')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeView === '3d'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="3D WebGL Real-time Orbit Viewport"
                >
                  <span>🧊</span>
                  <span>3D View</span>
                </button>

                <button
                  onClick={() => setActiveView('split')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeView === 'split'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="Simultaneous 2D & 3D Split Screen"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split View</span>
                </button>

                <button
                  onClick={() => setActiveView('customer')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="Interactive Client Walkthrough & Room Presentation"
                >
                  <span>🚶</span>
                  <span>Tour</span>
                </button>
              </div>

              {/* Cluster 2: Multi-Floor & Elevation Navigator */}
              <div className={`flex items-center p-1 rounded-xl border ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="flex items-center gap-1 px-1">
                  <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Level:</span>
                </div>

                {(plan.floors || [
                  { level: 0, name: 'Ground Floor' },
                  { level: 1, name: '1st Floor' }
                ]).map((fl) => (
                  <button
                    key={fl.level}
                    onClick={() => {
                      setActiveFloor(fl.level);
                      setFloorMode('single');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      floorMode !== 'sideBySide' && activeFloor === fl.level
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {fl.level === 0 ? 'Ground' : fl.level === 1 ? '1st Fl' : `L${fl.level}`}
                  </button>
                ))}

                <button
                  onClick={() => setFloorMode(floorMode === 'sideBySide' ? 'single' : 'sideBySide')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ml-1 cursor-pointer ${
                    floorMode === 'sideBySide'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Display all floors side-by-side"
                >
                  🔲 All Levels
                </button>
              </div>

              {/* Cluster 3: History, Calibration & Tools */}
              <div className="flex items-center gap-1.5">
                {/* Undo / Redo */}
                <div className={`flex items-center p-0.5 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className={`p-1.5 rounded-lg transition ${
                      canUndo
                        ? isDark
                          ? 'text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 cursor-pointer'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200 active:scale-95 cursor-pointer'
                        : 'text-slate-500 opacity-40 cursor-not-allowed'
                    }`}
                    title="Undo (Ctrl+Z)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className={`p-1.5 rounded-lg transition ${
                      canRedo
                        ? isDark
                          ? 'text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 cursor-pointer'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200 active:scale-95 cursor-pointer'
                        : 'text-slate-500 opacity-40 cursor-not-allowed'
                    }`}
                    title="Redo (Ctrl+Y)"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3D Catalog & Inspector Toggle Button */}
                <button
                  onClick={() => setIsInspectorOpen(!isInspectorOpen)}
                  className={`px-2.5 py-1.5 rounded-md border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    isInspectorOpen
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                  title="Toggle 3D Catalog & Inspector Panel"
                >
                  <Box className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Catalog / Inspector</span>
                </button>

                {/* Blueprint Scan Importer */}
                <button
                  onClick={() => setIsBlueprintModalOpen(true)}
                  className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                  title="Import Blueprint Scan Overlay"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">Blueprint</span>
                </button>

                {/* Grid Preferences */}
                <button
                  onClick={() => setIsPreferencesModalOpen(true)}
                  className={`p-1.5 rounded-xl border transition cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                  title="Grid & Unit Preferences"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>

                {/* Cost Estimator & BOM Button */}
                <button
                  onClick={() => setIsCostEstimatorModalOpen(true)}
                  className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-500/30'
                      : 'bg-white hover:bg-slate-100 text-emerald-700 border-emerald-300 shadow-2xs'
                  }`}
                  title="Bill of Materials (BOM) & Project Cost Estimator"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden lg:inline">Cost / BOM</span>
                </button>

                {/* AI Room Styler Button */}
                <button
                  onClick={() => setIsAiStylerModalOpen(true)}
                  className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-fuchsia-300 border-fuchsia-500/30'
                      : 'bg-white hover:bg-slate-100 text-fuchsia-700 border-fuchsia-300 shadow-2xs'
                  }`}
                  title="AI Room Styler & Color Theme Preset Generator"
                >
                  <Wand2 className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span className="hidden lg:inline">AI Styler</span>
                </button>

                {/* Collision Warning Indicator */}
                {collisionReport.totalCollisions > 0 && (
                  <span
                    className="px-2 py-1 rounded-xl text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse flex items-center gap-1"
                    title={`${collisionReport.totalCollisions} collision(s) detected`}
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>{collisionReport.totalCollisions} Overlap</span>
                  </span>
                )}
              </div>

              {/* Cluster 4: Theme Toggle & Cloud Actions */}
              <div className="flex items-center gap-1.5">
                {/* Theme Switcher Button */}
                <button
                  onClick={handleToggleTheme}
                  className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                  title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                </button>

                {/* Projects Switcher */}
                <button
                  onClick={() => setIsClientSelectModalOpen(true)}
                  className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                  title="Switch Client Project Plan"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Projects</span>
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-indigo-500/30'
                      : 'bg-white hover:bg-slate-100 text-indigo-700 border-indigo-300 shadow-2xs'
                  }`}
                  title="Save plan to backend"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Share 3D Client Presentation Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Design Studio Viewport & Floating Sidebars Area */}
            <div className="flex-1 flex relative overflow-hidden w-full h-full">
              {/* Full Width Center Viewports */}
              <div className="flex-1 flex relative overflow-hidden w-full h-full">
                {/* Split Mode: 2D Blueprint on Left, 3D Orbit on Right */}
                {activeView === 'split' && (
                  <>
                    <div className={`w-1/2 h-full border-r relative ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <PlanCanvas2D
                        plan={plan}
                        onUpdatePlan={handleUpdatePlan}
                        selectedId={selectedId}
                        onSelectId={setSelectedId}
                        activeFloor={activeFloor}
                        onFloorChange={setActiveFloor}
                        floorMode={floorMode}
                        onFloorModeChange={setFloorMode}
                        collidingItemIds={collisionReport.collidingItemIds}
                        collisionReasons={collisionReport.reasons}
                        onOpenBlueprintModal={() => setIsBlueprintModalOpen(true)}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        visitorCamera={visitorCamera}
                        onUpdateVisitorCamera={handleUpdateVisitorCamera}
                        isWalkMode={cameraMode3D === 'visitor'}
                      />
                    </div>
                    <div className="w-1/2 h-full relative">
                      <Viewport3D
                        plan={plan}
                        selectedId={selectedId}
                        onSelectId={setSelectedId}
                        onUpdatePlan={handleUpdatePlan}
                        activeFloor={activeFloor}
                        onFloorChange={setActiveFloor}
                        floorMode={floorMode}
                        onFloorModeChange={setFloorMode}
                        collidingItemIds={collisionReport.collidingItemIds}
                        isSplitMode={true}
                        cameraModeProp={cameraMode3D}
                        onCameraModeChangeProp={setCameraMode3D}
                        visitorCameraProp={visitorCamera}
                        onVisitorCameraChange={handleUpdateVisitorCamera}
                      />
                    </div>
                  </>
                )}

                {/* Full 2D View Mode */}
                {activeView === '2d' && (
                  <div className="w-full h-full relative">
                    <PlanCanvas2D
                      plan={plan}
                      onUpdatePlan={handleUpdatePlan}
                      selectedId={selectedId}
                      onSelectId={setSelectedId}
                      activeFloor={activeFloor}
                      onFloorChange={setActiveFloor}
                      floorMode={floorMode}
                      onFloorModeChange={setFloorMode}
                      collidingItemIds={collisionReport.collidingItemIds}
                      collisionReasons={collisionReport.reasons}
                      onOpenBlueprintModal={() => setIsBlueprintModalOpen(true)}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      visitorCamera={visitorCamera}
                      onUpdateVisitorCamera={handleUpdateVisitorCamera}
                      isWalkMode={cameraMode3D === 'visitor'}
                    />
                  </div>
                )}

                {/* Full 3D View Mode */}
                {activeView === '3d' && (
                  <div className="w-full h-full relative">
                    <Viewport3D
                      plan={plan}
                      selectedId={selectedId}
                      onSelectId={setSelectedId}
                      onUpdatePlan={handleUpdatePlan}
                      activeFloor={activeFloor}
                      onFloorChange={setActiveFloor}
                      floorMode={floorMode}
                      onFloorModeChange={setFloorMode}
                      collidingItemIds={collisionReport.collidingItemIds}
                      isSplitMode={false}
                      cameraModeProp={cameraMode3D}
                      onCameraModeChangeProp={setCameraMode3D}
                      visitorCameraProp={visitorCamera}
                      onVisitorCameraChange={handleUpdateVisitorCamera}
                    />
                  </div>
                )}
              </div>

              {/* Right Unified 3D Catalog, Finish & Transform Inspector */}
              <InspectorSidebar
                plan={plan}
                selectedId={selectedId}
                onUpdatePlan={handleUpdatePlan}
                onSelectId={setSelectedId}
                collidingItemIds={collisionReport.collidingItemIds}
                collisionReasons={collisionReport.reasons}
                catalog={catalog}
                onAddItem={handleAddItem}
                theme={theme}
                isOpen={isInspectorOpen}
                onToggleOpen={() => setIsInspectorOpen(!isInspectorOpen)}
                isWalkMode={cameraMode3D === 'visitor'}
                onOpenAddItemModal={() => setIsAddItemModalOpen(true)}
              />
            </div>

            {/* Bottom Expandable Furniture List Pane */}
            <FurnitureListPane
              furniture={plan.furniture.filter((f) => (f.floorLevel ?? 0) === activeFloor)}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              onToggleVisibility={handleToggleItemVisibility}
              onToggleLock={handleToggleItemLock}
              onDeleteItem={handleDeleteItem}
              collidingItemIds={collisionReport.collidingItemIds}
              isOpen={isFurnitureListOpen}
              setIsOpen={setIsFurnitureListOpen}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        plan={plan}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleAddUser}
      />

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddItem={handleAddCustomItem}
      />

      <BlueprintImportModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        currentBlueprint={plan.blueprint}
        onSaveBlueprint={handleSaveBlueprint}
      />

      <ClientProjectSelectModal
        isOpen={isClientSelectModalOpen}
        onClose={() => setIsClientSelectModalOpen(false)}
        users={users}
        templates={templates}
        currentPlanId={plan.id}
        onSelectExistingPlan={(planId) => {
          handleSelectClientProject(planId);
          setIsClientSelectModalOpen(false);
          setActiveView(userRole === 'CLIENT' ? 'customer' : 'split');
        }}
        onStartNewDesignForClient={handleStartNewDesignForClient}
        onOpenAddClientModal={() => setIsAddUserModalOpen(true)}
      />

      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        preferences={plan.preferences || {
          unitSystem: 'cm',
          defaultWallThickness: 15,
          defaultWallHeight: 250,
          gridSize: 20,
          magnetismEnabled: true,
          showRulers: true,
        }}
        onSavePreferences={handleSavePreferences}
      />

      <CostEstimatorModal
        isOpen={isCostEstimatorModalOpen}
        onClose={() => setIsCostEstimatorModalOpen(false)}
        plan={plan}
        activeFloor={activeFloor}
      />

      <AiStylerModal
        isOpen={isAiStylerModalOpen}
        onClose={() => setIsAiStylerModalOpen(false)}
        plan={plan}
        activeFloor={activeFloor}
        onUpdatePlan={handleUpdatePlan}
      />
    </div>
  );
};
