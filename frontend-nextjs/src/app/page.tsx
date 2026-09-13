'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminDashboard } from '../components/AdminDashboard';
import { CatalogSidebar } from '../components/CatalogSidebar';
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
import { HomePlan, CatalogItem, FurnitureItem, User, UserRole, FloorTemplate, BlueprintImage, ProjectPreferences } from '../types/plan';
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
  deleteCatalogItem,
  fetchFloorTemplates
} from '../services/api';

export default function HomeStudioPage() {
  const [plan, setPlan] = useState<HomePlan>(sampleDefaultPlan);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<FloorTemplate[]>([]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<'split' | '2d' | '3d' | 'customer' | 'dashboard'>('split');
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'catalog' | 'floors'>('overview');
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [floorMode, setFloorMode] = useState<'single' | 'sideBySide' | 'stacked'>('single');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState<boolean>(false);
  const [isFurnitureListOpen, setIsFurnitureListOpen] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState<boolean>(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);
  const [isClientSelectModalOpen, setIsClientSelectModalOpen] = useState<boolean>(false);

  // Ref-Backed Undo / Redo History Stack
  const historyRef = useRef<HomePlan[]>([JSON.parse(JSON.stringify(sampleDefaultPlan))]);
  const historyIndexRef = useRef<number>(0);
  const isHistoryActionRef = useRef<boolean>(false);
  const historyTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Commit clean snapshot to history
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

  // Wrap plan state updater to record undo/redo history and persist to client cache
  const handleUpdatePlan = useCallback(
    (updated: HomePlan | ((prev: HomePlan) => HomePlan), immediate: boolean = false) => {
      setPlan((prev) => {
        const nextPlan = typeof updated === 'function' ? updated(prev) : updated;
        ALL_CLIENT_PLANS[nextPlan.id] = nextPlan;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`sweethome_plan_${nextPlan.id}`, JSON.stringify(nextPlan));
        }

        if (immediate) {
          if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
          commitSnapshot(nextPlan);
        } else {
          if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
          historyTimerRef.current = setTimeout(() => {
            commitSnapshot(nextPlan);
          }, 300);
        }

        return nextPlan;
      });
    },
    [commitSnapshot]
  );

  // Handle Undo action
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;

    historyIndexRef.current -= 1;
    const targetPlan = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));

    isHistoryActionRef.current = true;
    setPlan(targetPlan);
    ALL_CLIENT_PLANS[targetPlan.id] = targetPlan;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sweethome_plan_${targetPlan.id}`, JSON.stringify(targetPlan));
    }
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);

    setTimeout(() => {
      isHistoryActionRef.current = false;
    }, 40);
  }, []);

  // Handle Redo action
  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;

    historyIndexRef.current += 1;
    const targetPlan = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));

    isHistoryActionRef.current = true;
    setPlan(targetPlan);
    ALL_CLIENT_PLANS[targetPlan.id] = targetPlan;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sweethome_plan_${targetPlan.id}`, JSON.stringify(targetPlan));
    }
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);

    setTimeout(() => {
      isHistoryActionRef.current = false;
    }, 40);
  }, []);

  // Global Keyboard Shortcuts (Ctrl+Z for Undo, Ctrl+Y / Ctrl+Shift+Z for Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Real-time Collision Detection Computation (isolated by active floor)
  const collisionReport = useMemo(() => {
    return detectCollisions(plan.furniture, plan.walls, activeFloor);
  }, [plan.furniture, plan.walls, activeFloor]);

  // Client Projects List
  const clientProjects = useMemo(() => {
    const list: { id: string; name: string; clientName: string; role?: string }[] = [];
    users.forEach((u) => {
      const planId = u.assignedPlan || `plan_${u.id}`;
      const defaultPlanName = ALL_CLIENT_PLANS[planId]?.name || `${u.name}'s Custom Plan`;
      list.push({
        id: planId,
        name: plan.id === planId ? plan.name : defaultPlanName,
        clientName: u.name,
        role: u.role,
      });
    });
    return list;
  }, [users, plan]);

  // Handle Switching Client Project Design
  const handleSelectClientProject = async (planId: string) => {
    const loaded = await fetchPlanById(planId);
    setPlan(loaded);
    historyRef.current = [JSON.parse(JSON.stringify(loaded))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setSelectedId(null);
    setActiveFloor(0);
  };

  // Session hydration on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('sweethome_auth_user');
      if (savedAuth) {
        try {
          const parsed: User = JSON.parse(savedAuth);
          setCurrentUser(parsed);
          setUserRole(parsed.role);
          if (parsed.role === 'CLIENT') {
            setActiveView('customer');
          }
        } catch {
          // Ignore parse errors
        }
      }
      setIsAuthLoaded(true);
    }
  }, []);

  // Handle Login
  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sweethome_auth_user', JSON.stringify(user));
    }
    if (user.role === 'CLIENT') {
      const planToLoad = user.assignedPlan || 'plan-sarah-suite';
      await handleSelectClientProject(planToLoad);
      setActiveView('customer');
    } else if (user.role === 'DESIGNER') {
      const planToLoad = user.assignedPlan || 'plan-david-villa';
      await handleSelectClientProject(planToLoad);
      setActiveView('split');
    } else {
      setActiveView('dashboard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sweethome_auth_user');
    }
    setSelectedId(null);
    setActiveView('split');
  };

  // Decode URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const role = urlParams.get('role') as UserRole | null;
      const planId = urlParams.get('planId');
      const data = urlParams.get('data');

      if (role) {
        setUserRole(role);
      }

      if (data) {
        const decoded = decodePlanFromShareUrl(data);
        if (decoded) {
          setPlan(decoded);
          historyRef.current = [JSON.parse(JSON.stringify(decoded))];
          historyIndexRef.current = 0;
          if (mode === 'customer') {
            setActiveView('customer');
          }
        }
      } else if (planId) {
        handleSelectClientProject(planId);
        if (mode === 'customer') {
          setActiveView('customer');
        }
      } else if (mode === 'customer') {
        setActiveView('customer');
      }
    }
  }, []);

  // Fetch initial data from Spring Boot
  useEffect(() => {
    async function loadData() {
      const [items, userList, templateList, isHealthy] = await Promise.all([
        fetchCatalog(),
        fetchUsers(),
        fetchFloorTemplates(),
        checkBackendHealth(),
      ]);
      setCatalog(items);
      setUsers(userList);
      setTemplates(templateList);
      setIsBackendConnected(isHealthy);
    }
    loadData();

    const interval = setInterval(async () => {
      const healthy = await checkBackendHealth();
      setIsBackendConnected(healthy);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Save Plan
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await savePlanToBackend(plan);
      alert(res.message || 'Plan saved successfully to Spring Boot!');
    } catch (err) {
      alert('Error saving plan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Create new blank plan
  const handleNewPlan = () => {
    if (confirm('Create a new blank plan? Any unsaved changes will be lost.')) {
      const freshPlanCreated: HomePlan = {
        id: `plan_${Date.now()}`,
        name: 'New Space Plan Project',
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentFloor: 0,
        floors: [
          { level: 0, name: 'Ground Floor', elevation: 0, height: 250 },
          { level: 1, name: '1st Floor', elevation: 250, height: 250 },
        ],
        walls: [
          { id: 'w1', xStart: -300, yStart: -200, xEnd: 300, yEnd: -200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
          { id: 'w2', xStart: 300, yStart: -200, xEnd: 300, yEnd: 200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
          { id: 'w3', xStart: 300, yStart: 200, xEnd: -300, yEnd: 200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
          { id: 'w4', xStart: -300, yStart: 200, xEnd: -300, yEnd: -200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
        ],
        furniture: [],
        rooms: [
          {
            id: 'r1',
            name: 'Main Living Room',
            floorLevel: 0,
            points: [
              { x: -300, y: -200 },
              { x: 300, y: -200 },
              { x: 300, y: 200 },
              { x: -300, y: 200 },
            ],
            floorColor: '#e2e8f0',
            areaSquareMeters: 24.0,
          }
        ],
        dimensionLines: [],
        textNotes: [],
        preferences: {
          unitSystem: 'cm',
          defaultWallThickness: 15,
          defaultWallHeight: 250,
          gridSize: 20,
          magnetismEnabled: true,
          showRulers: true,
        },
      };
      setPlan(freshPlanCreated);
      historyRef.current = [JSON.parse(JSON.stringify(freshPlanCreated))];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      setSelectedId(null);
    }
  };

  // Export Plan JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${plan.name.replace(/\s+/g, '_')}_SpacePlanner.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Add Item from Catalog to Floor Plan (with Tabletop Auto-Attachment)
  const handleAddItem = (item: CatalogItem) => {
    let targetX = 0;
    let targetY = 0;
    let targetElevation = 0;
    let hostId: string | undefined = undefined;

    if (item.placementType === 'tabletop' || item.placeOnTable || isTabletopItem(item)) {
      const nearestTable = findNearestSupportingSurface(
        { x: 0, y: 0, floorLevel: activeFloor, id: 'temp' } as any,
        plan.furniture
      );
      if (nearestTable) {
        targetX = nearestTable.x;
        targetY = nearestTable.y;
        targetElevation = (nearestTable.elevation || 0) + nearestTable.height;
        hostId = nearestTable.id;
      }
    } else if (item.placementType === 'ceiling') {
      const activeFloorObj = plan.floors?.find((fl) => fl.level === activeFloor);
      const floorHeight = activeFloorObj?.height || plan.preferences?.defaultWallHeight || 250;
      targetElevation = Math.max(0, floorHeight - item.height);
    }

    const newItem: FurnitureItem = {
      id: `f_${Date.now()}`,
      catalogId: item.id,
      name: item.name,
      category: item.category,
      x: targetX,
      y: targetY,
      elevation: targetElevation,
      angle: 0,
      width: item.width,
      depth: item.depth,
      height: item.height,
      model: item.model,
      icon: item.icon,
      color: item.defaultColor,
      floorLevel: activeFloor,
      isVisible: true,
      isLocked: false,
      placementType: item.placementType || (isTabletopItem(item) ? 'tabletop' : 'floor'),
      placeOnTable: item.placeOnTable || isTabletopItem(item),
      hostFurnitureId: hostId,
    };

    handleUpdatePlan((prev) => ({
      ...prev,
      furniture: [...prev.furniture, newItem],
      updatedAt: new Date().toISOString(),
    }), true);
    setSelectedId(newItem.id);
  };

  // Toggle Item Visibility
  const handleToggleItemVisibility = (id: string) => {
    handleUpdatePlan((prev) => ({
      ...prev,
      furniture: prev.furniture.map((f) =>
        f.id === id ? { ...f, isVisible: !(f.isVisible ?? true) } : f
      ),
      updatedAt: new Date().toISOString(),
    }), true);
  };

  // Toggle Item Lock
  const handleToggleItemLock = (id: string) => {
    handleUpdatePlan((prev) => ({
      ...prev,
      furniture: prev.furniture.map((f) =>
        f.id === id ? { ...f, isLocked: !f.isLocked } : f
      ),
      updatedAt: new Date().toISOString(),
    }), true);
  };

  // Delete Item from Plan
  const handleDeleteItem = (id: string) => {
    const item = plan.furniture.find((f) => f.id === id);
    if (item?.isLocked) {
      alert(`⚠️ Cannot delete "${item.name}": This item is LOCKED.\nPlease unlock it first before deleting.`);
      return;
    }
    handleUpdatePlan((prev) => ({
      ...prev,
      furniture: prev.furniture.filter((f) => f.id !== id),
      updatedAt: new Date().toISOString(),
    }), true);
    if (selectedId === id) setSelectedId(null);
  };

  // Add Custom 3D Catalog Item & Automatically Load / Place in 3D Scene
  const handleAddCustomItem = async (newItem: CatalogItem, autoPlaceInScene: boolean = true) => {
    const saved = await addCustomCatalogItem(newItem);
    setCatalog((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)]);

    if (autoPlaceInScene) {
      let targetX = 0;
      let targetY = 0;
      let targetElevation = 0;
      let hostId: string | undefined = undefined;

      if (saved.placementType === 'tabletop' || saved.placeOnTable || isTabletopItem(saved)) {
        const nearestTable = findNearestSupportingSurface(
          { x: 0, y: 0, floorLevel: activeFloor, id: 'temp' } as any,
          plan.furniture
        );
        if (nearestTable) {
          targetX = nearestTable.x;
          targetY = nearestTable.y;
          targetElevation = (nearestTable.elevation || 0) + nearestTable.height;
          hostId = nearestTable.id;
        }
      } else if (saved.placementType === 'ceiling') {
        const activeFloorObj = plan.floors?.find((fl) => fl.level === activeFloor);
        const floorHeight = activeFloorObj?.height || plan.preferences?.defaultWallHeight || 250;
        targetElevation = Math.max(0, floorHeight - saved.height);
      }

      const placedItem: FurnitureItem = {
        id: `f_${Date.now()}`,
        catalogId: saved.id,
        name: saved.name,
        category: saved.category,
        x: targetX,
        y: targetY,
        elevation: targetElevation,
        angle: 0,
        width: saved.width,
        depth: saved.depth,
        height: saved.height,
        model: saved.model,
        icon: saved.icon,
        color: saved.defaultColor,
        materialCategory: saved.materialCategory,
        materialFinish: saved.materialFinish,
        roughness: saved.roughness,
        metalness: saved.metalness,
        opacity: saved.opacity,
        stylePreset: saved.stylePreset,
        lightIntensity: saved.lightIntensity,
        lightColor: saved.lightColor,
        floorLevel: activeFloor,
        isVisible: true,
        isLocked: false,
        placementType: saved.placementType,
        placeOnTable: saved.placeOnTable,
        hostFurnitureId: hostId,
      };

      handleUpdatePlan((prev) => ({
        ...prev,
        furniture: [...prev.furniture, placedItem],
        updatedAt: new Date().toISOString(),
      }), true);

      setSelectedId(placedItem.id);

      if (activeView === 'dashboard') {
        setActiveView('split');
      }
    }
  };

  // Delete Item from Catalog
  const handleDeleteCatalogItem = async (itemId: string) => {
    if (confirm('Delete this item from the catalog?')) {
      await deleteCatalogItem(itemId);
      setCatalog((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  // Create User & Fresh Dedicated Design Project
  const handleAddUser = async (userData: Partial<User>, templateType?: string) => {
    const { user: newUser, plan: newPlan } = await createAdminUser(userData, templateType);
    setUsers((prev) => [newUser, ...prev]);
    // Immediately select and switch to the new client's fresh design!
    handleUpdatePlan(newPlan, true);
    setSelectedId(null);
    setActiveFloor(0);
    setActiveView('split');
    alert(`🎉 Client "${newUser.name}" onboarded successfully!\nA fresh, dedicated design project has been created and opened.`);
  };

  // Toggle User Online Status
  const handleToggleUserStatus = async (userId: string) => {
    await toggleUserStatus(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isOnline: !u.isOnline } : u))
    );
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    if (confirm('Remove this user from the directory?')) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  // Load Template in Studio
  
  // Start New Design for a specific Client
  const handleStartNewDesignForClient = (client: User, templateId?: string) => {
    let basePlan: HomePlan;

    if (templateId === 'duplex_2floor' && ALL_CLIENT_PLANS['plan-sarah-suite']) {
      basePlan = JSON.parse(JSON.stringify(ALL_CLIENT_PLANS['plan-sarah-suite']));
      basePlan.name = `${client.name}'s Luxury Duplex`;
    } else if (templateId === 'studio_apt' && ALL_CLIENT_PLANS['plan-david-villa']) {
      basePlan = JSON.parse(JSON.stringify(ALL_CLIENT_PLANS['plan-david-villa']));
      basePlan.name = `${client.name}'s Modern Studio`;
    } else {
      // Blank / Custom Template
      basePlan = {
        id: `plan-${client.id || Date.now()}`,
        name: `${client.name}'s Custom Suite`,
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentFloor: 0,
        floors: [
          { level: 0, name: 'Ground Floor', elevation: 0, height: 250 },
          { level: 1, name: '1st Floor', elevation: 250, height: 250 },
        ],
        walls: [
          { id: 'w1', xStart: -300, yStart: -200, xEnd: 300, yEnd: -200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
          { id: 'w2', xStart: 300, yStart: -200, xEnd: 300, yEnd: 200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
          { id: 'w3', xStart: 300, yStart: 200, xEnd: -300, yEnd: 200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
          { id: 'w4', xStart: -300, yStart: 200, xEnd: -300, yEnd: -200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
        ],
        furniture: [],
        rooms: [
          {
            id: 'r1',
            name: 'Main Living Room',
            floorLevel: 0,
            points: [
              { x: -300, y: -200 },
              { x: 300, y: -200 },
              { x: 300, y: 200 },
              { x: -300, y: 200 },
            ],
            floorColor: '#e2e8f0',
            areaSquareMeters: 24.0,
          },
        ],
        dimensionLines: [],
        textNotes: [],
        preferences: {
          unitSystem: 'cm',
          defaultWallThickness: 15,
          defaultWallHeight: 250,
          gridSize: 20,
          magnetismEnabled: true,
          showRulers: true,
        },
      };
    }

    const newPlanId = `plan-${client.id || Date.now()}`;
    basePlan.id = newPlanId;
    basePlan.updatedAt = new Date().toISOString();

    // Cache in global memory & localStorage
    ALL_CLIENT_PLANS[newPlanId] = basePlan;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sweethome_plan_${newPlanId}`, JSON.stringify(basePlan));
    }

    // Link plan to client
    setUsers((prev) =>
      prev.map((u) => (u.id === client.id ? { ...u, assignedPlan: newPlanId } : u))
    );

    setPlan(basePlan);
    historyRef.current = [JSON.parse(JSON.stringify(basePlan))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setSelectedId(null);
    setActiveFloor(0);

    setIsClientSelectModalOpen(false);
    setActiveView(userRole === 'CLIENT' ? 'customer' : 'split');
  };

  const handleOpenStudioWithTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      handleUpdatePlan((prev) => ({
        ...prev,
        name: tpl.name,
        version: '1.0',
      }), true);
    }
    setActiveView('split');
  };

  // Save Blueprint Image
  const handleSaveBlueprint = (blueprint: BlueprintImage | undefined) => {
    handleUpdatePlan((prev) => ({
      ...prev,
      blueprint,
      updatedAt: new Date().toISOString(),
    }), true);
  };

  // Save Preferences
  const handleSavePreferences = (preferences: ProjectPreferences) => {
    handleUpdatePlan((prev) => ({
      ...prev,
      preferences,
      updatedAt: new Date().toISOString(),
    }), true);
  };

  const onlineUsersCount = users.filter((u) => u.isOnline).length;

  // Strict Authentication Guard: without logging in, users CANNOT access anything
  if (!currentUser) {
    if (!isAuthLoaded) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-400">Loading SweetHome 3D Studio...</p>
          </div>
        </div>
      );
    }
    return <LoginPage onLogin={handleLogin} availableUsers={users} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        plan={plan}
        activeView={activeView}
        setActiveView={setActiveView}
        isBackendConnected={isBackendConnected}
        onSave={handleSave}
        onNew={handleNewPlan}
        onExport={handleExport}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenBlueprint={() => setIsBlueprintModalOpen(true)}
        onOpenPreferences={() => setIsPreferencesModalOpen(true)}
        onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
        onOpenCreateItemModal={() => setIsAddItemModalOpen(true)}
        isSaving={isSaving}
        userRole={userRole}
        setUserRole={setUserRole}
        collidingCount={collisionReport.totalCollisions}
        activeFloor={activeFloor}
        onFloorChange={setActiveFloor}
        onToggleAdminSidebar={() => setIsAdminSidebarOpen(!isAdminSidebarOpen)}
        clientProjects={clientProjects}
        onSelectClientProject={handleSelectClientProject}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenClientSelectModal={() => setIsClientSelectModalOpen(true)}
      />

      {/* Main Workspace Body */}
      {/* Main Workspace Body - Clean Full-Width Easy Access Mode */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: ADMIN CONTROL DASHBOARD */}
        {activeView === 'dashboard' && (
          <AdminDashboard
            users={users}
            catalog={catalog}
            templates={templates}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            onOpenStudioWithTemplate={handleOpenStudioWithTemplate}
            onOpenClientPlan={(planId) => {
              handleSelectClientProject(planId);
              setActiveView('split');
            }}
            onStartNewDesignForClient={handleStartNewDesignForClient}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onDeleteCatalogItem={handleDeleteCatalogItem}
            onOpenAddItemModal={() => setIsAddItemModalOpen(true)}
            onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
            onOpenClientSelectModal={() => setIsClientSelectModalOpen(true)}
            plan={plan}
          />
        )}

        {/* VIEW 2: CUSTOMER / CLIENT 3D INTERACTIVE TOUR */}
        {activeView === 'customer' && (
          <main className="flex-1 h-full overflow-hidden bg-slate-100 relative">
            <CustomerPresentationView
              plan={plan}
              catalog={catalog}
              onUpdatePlan={handleUpdatePlan}
              onSwitchToStudio={() => setActiveView('split')}
              onOpenShare={() => setIsShareModalOpen(true)}
              collidingItemIds={collisionReport.collidingItemIds}
              activeFloor={activeFloor}
              onFloorChange={setActiveFloor}
              floorMode={floorMode}
              onFloorModeChange={setFloorMode}
            />
          </main>
        )}

        {/* VIEW 3: 4-PANE CAD & 3D DESIGN STUDIO */}
        {(activeView === 'split' || activeView === '2d' || activeView === '3d') && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              {/* Left Pane 1: Furniture & Element Catalog */}
              <CatalogSidebar
                catalog={catalog}
                onAddItem={handleAddItem}
                onOpenCreateItemModal={() => setIsAddItemModalOpen(true)}
              />

              {/* Center Viewports */}
              <div className="flex-1 flex relative overflow-hidden">
                {/* Split Mode: 2D on Left, 3D on Right */}
                {activeView === 'split' && (
                  <>
                    <div className="w-1/2 h-full border-r border-slate-200 relative">
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
                    />
                  </div>
                )}
              </div>

              {/* Right Pane 2: Properties & Transform Inspector */}
              <InspectorSidebar
                plan={plan}
                selectedId={selectedId}
                onUpdatePlan={handleUpdatePlan}
                onSelectId={setSelectedId}
                collidingItemIds={collisionReport.collidingItemIds}
                collisionReasons={collisionReport.reasons}
                catalog={catalog}
              />
            </div>

            {/* Bottom Pane: Furniture Element List */}
            <FurnitureListPane
              furniture={plan.furniture}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              onToggleVisibility={handleToggleItemVisibility}
              onToggleLock={handleToggleItemLock}
              onDeleteItem={handleDeleteItem}
              collidingItemIds={collisionReport.collidingItemIds}
              isOpen={isFurnitureListOpen}
              setIsOpen={setIsFurnitureListOpen}
            />
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        plan={plan}
      />

      {/* Onboard User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleAddUser}
      />

      {/* 3D Item Studio Modal */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddItem={handleAddCustomItem}
      />

      {/* Blueprint Scan Import Modal */}
      <BlueprintImportModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        currentBlueprint={plan.blueprint}
        onSaveBlueprint={handleSaveBlueprint}
      />

      
      {/* Client Project Selector Modal */}
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

      {/* Project Preferences Modal */}
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
    </div>
  );
}
