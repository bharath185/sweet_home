'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminDashboard } from '../components/AdminDashboard';
import { FurnitureListPane } from '../components/FurnitureListPane';
import { PlanCanvas2D, ToolMode } from '../components/PlanCanvas2D';
import { Viewport3D } from '../components/Viewport3D';
import { InspectorSidebar } from '../components/InspectorSidebar';
import { SweetHomeRibbon } from '../components/SweetHomeRibbon';
import { SweetHomeCatalogTree } from '../components/SweetHomeCatalogTree';
import { SweetHomeFurnitureTable } from '../components/SweetHomeFurnitureTable';
import { InteriorScopeBar } from '../components/InteriorScopeBar';
import { MinimizedFloorPlan } from '../components/MinimizedFloorPlan';
import { CustomerPresentationView } from '../components/CustomerPresentationView';
import { LoginPage } from '../components/LoginPage';
import { ShareModal } from '../components/ShareModal';
import { AddUserModal } from '../components/AddUserModal';
import { AddItemModal } from '../components/AddItemModal';
import { BlueprintImportModal } from '../components/BlueprintImportModal';
import { PreferencesModal } from '../components/PreferencesModal';
import { ClientProjectSelectModal } from '../components/ClientProjectSelectModal';
import { HomePlan, CatalogItem, FurnitureItem, User, UserRole, FloorTemplate, BlueprintImage, ProjectPreferences, VisitorCameraState, FloorLevel, Room } from '../types/plan';
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
  Wand2,
  Crown,
  Download,
  Upload,
  ShieldCheck,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { CostEstimatorModal } from '../components/CostEstimatorModal';
import { AiStylerModal } from '../components/AiStylerModal';
import UpgradeModal from '../components/UpgradeModal';
import { SubscriptionPaywall } from '../components/SubscriptionPaywall';
import { ProjectManagerModal } from '../components/ProjectManagerModal';
import { SelectDemoModal } from '../components/SelectDemoModal';
import { GuidedFloorPlanBuilderModal } from '../components/GuidedFloorPlanBuilderModal';
import { SmartAlignmentBar } from '../components/SmartAlignmentBar';
import { CustomerWelcomeGuideModal } from '../components/CustomerWelcomeGuideModal';
import { RoomQuickStyleCard } from '../components/RoomQuickStyleCard';
import {
  UserProjectSummary,
  getUserProjects,
  syncUserProjectsWithCloud,
  saveUserProject,
  deleteUserProject,
  exportPlanAsJson,
  parseAndValidateProjectJson,
  STARTER_TEMPLATES,
} from '../services/projectService';
import { DECOFROG_DEMOS } from '../services/demoPlans';
import { cleanUnrealisticStairs } from '../services/referencePlans';
import {
  canAccessFeature,
  getUserSubscriptionTier,
  hasActiveSubscription,
  getSubscriptionRemainingText,
  saveSubscriptionLocally,
  isUserOnFreeTrial,
  hasCompletedFreeTrial,
  start48HourFreeTrialLocally,
} from '../services/subscriptionService';

export default function HomeStudioPage() {
  const [plan, setPlan] = useState<HomePlan>(() => cleanUnrealisticStairs(sampleDefaultPlan));
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<FloorTemplate[]>([]);

  // Theme Management (Dark & Light) - Default to Light Mode
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Load theme preference on mount (default to light)
  useEffect(() => {
    const savedTheme = (localStorage.getItem('decofrog_theme') || localStorage.getItem('sweethome_theme')) as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('decofrog_theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      return nextTheme;
    });
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<'split' | '2d' | '3d' | 'customer' | 'dashboard'>('split');
  const [studioLayout, setStudioLayout] = useState<'sweethome' | 'split' | '2d' | '3d' | 'tour'>('sweethome');
  const [cadToolMode, setCadToolMode] = useState<ToolMode>('select');
  const [targetRoomToFocus, setTargetRoomToFocus] = useState<Room | null>(null);
  const [catalogCategoryRequest, setCatalogCategoryRequest] = useState<string | undefined>(undefined);
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'catalog' | 'floors' | 'payments' | string>('overview');
  const [userRole, setUserRole] = useState<UserRole>('DESIGNER');
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [floorMode, setFloorMode] = useState<'single' | 'sideBySide' | 'stacked'>('single');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [cameraMode3D, setCameraMode3D] = useState<'aerial' | 'visitor'>('aerial');
  const [visitorCamera, setVisitorCamera] = useState<VisitorCameraState>({
    x: 0,
    y: 0,
    yaw: 0,
    elevation: 160,
    floorLevel: 0,
  });

  const selectedFurniture = useMemo(() => {
    if (!selectedId) return null;
    return plan.furniture.find((f) => f.id === selectedId) || null;
  }, [plan.furniture, selectedId]);

  const selectedRoom = useMemo(() => {
    if (!selectedId) return null;
    return plan.rooms.find((r) => r.id === selectedId) || null;
  }, [plan.rooms, selectedId]);

  const handleWalkInRoom = useCallback((room: Room) => {
    if (!room.points || room.points.length === 0) return;
    const avgX = Math.round(room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length);
    const avgY = Math.round(room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length);
    setActiveFloor(room.floorLevel ?? 0);
    setVisitorCamera({
      x: avgX,
      y: avgY,
      yaw: 0,
      elevation: 160,
      floorLevel: room.floorLevel ?? 0,
    });
    setCameraMode3D('visitor');
    setActiveView('3d');
    setStudioLayout('tour');
  }, []);

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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeHighlight, setUpgradeHighlight] = useState<string | undefined>(undefined);

  // User Project Persistence & Starter Houses Modal
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState<boolean>(false);
  const [projectManagerTab, setProjectManagerTab] = useState<'projects' | 'new' | 'import'>('projects');
  const [userProjects, setUserProjects] = useState<UserProjectSummary[]>([]);
  const [isSelectDemoModalOpen, setIsSelectDemoModalOpen] = useState<boolean>(false);
  const [isGuidedBuilderOpen, setIsGuidedBuilderOpen] = useState<boolean>(false);
  const [isCustomerGuideOpen, setIsCustomerGuideOpen] = useState<boolean>(false);
  const directImportFileInputRef = useRef<HTMLInputElement | null>(null);

  // User-friendly onboarding: Tailor your floor plan wizard on first session load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyPicked =
        sessionStorage.getItem('decofrog_initial_demo_selected') ||
        sessionStorage.getItem('sweethome_initial_demo_selected');
      if (!alreadyPicked) {
        setIsGuidedBuilderOpen(true);
      }
    }
  }, []);

  const handleOpenUpgrade = useCallback((highlight?: string) => {
    setUpgradeHighlight(highlight);
    setIsUpgradeModalOpen(true);
  }, []);

  // Return URL & Server Payment Verification States
  const [isVerifyingReturnPayment, setIsVerifyingReturnPayment] = useState<boolean>(false);
  const [returnVerificationStatus, setReturnVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [returnVerificationMsg, setReturnVerificationMsg] = useState<string>('');
  const [isRefreshingStatus, setIsRefreshingStatus] = useState<boolean>(false);

  const currentUserRef = useRef<User | null>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Sync user status with server-side payment store (stable callback, no infinite loops)
  const refreshUserPaymentStatus = useCallback(async (userToSync?: User | null) => {
    const targetUser = userToSync || currentUserRef.current;
    if (!targetUser) return;
    setIsRefreshingStatus(true);
    try {
      const res = await fetch(
        `/api/user/status?userId=${encodeURIComponent(targetUser.id)}&email=${encodeURIComponent(targetUser.email)}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const isServerPaid = data.isPaid || data.user.payment_status === 'paid';
        const isFreeTrial = Boolean(data.isFreeTrial ?? targetUser.isFreeTrial);
        const trialExpiresAt = data.trialExpiresAt || data.user.trial_expires_at || targetUser.trialExpiresAt;
        const hasCompletedTrial = Boolean(data.hasCompletedTrial ?? targetUser.hasCompletedTrial);

        const updatedUser: User = {
          ...targetUser,
          payment_status: data.user.payment_status,
          plan: data.user.plan || targetUser.plan,
          paid_at: data.user.paid_at || targetUser.paid_at,
          expires_at: data.user.expires_at || targetUser.expires_at,
          cashfree_order_id: data.user.cashfree_order_id || targetUser.cashfree_order_id,
          cashfree_payment_id: data.user.cashfree_payment_id || targetUser.cashfree_payment_id,
          subscriptionTier: isServerPaid ? (isFreeTrial ? 'TRIAL' : 'PRO') : targetUser.subscriptionTier,
          subscriptionStatus: isServerPaid ? (isFreeTrial ? 'trial' : 'active') : targetUser.subscriptionStatus,
          isFreeTrial,
          trialExpiresAt,
          hasCompletedTrial,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('decofrog_current_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      // Ignored
    } finally {
      setIsRefreshingStatus(false);
    }
  }, []);

  const userSubTier = getUserSubscriptionTier(currentUser);
  const hasPass = hasActiveSubscription(currentUser);
  const remainingPassText = getSubscriptionRemainingText(currentUser);
  const isProOrAdmin = hasPass;

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

      if (currentUserRef.current) {
        const updatedList = saveUserProject(currentUserRef.current.id, newPlan);
        setUserProjects(updatedList);
      }

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
    const savedUser =
      localStorage.getItem('decofrog_current_user') ||
      localStorage.getItem('sweethome_current_user');
    let loadedUser: User | null = null;
    if (savedUser) {
      try {
        let u = JSON.parse(savedUser);
        if (u.role !== 'ADMIN' && !u.paid_at && !u.trialExpiresAt) {
          u = start48HourFreeTrialLocally(u);
        }
        loadedUser = u;
        setCurrentUser(u);
        setUserRole(u.role);
        const projs = getUserProjects(u.id);
        setUserProjects(projs);
        syncUserProjectsWithCloud(u.id, u.email).then((cloudProjs) => {
          if (cloudProjs && cloudProjs.length > 0) {
            setUserProjects(cloudProjs);
          }
        });
        if (u.role === 'ADMIN') {
          setActiveView('dashboard');
        } else {
          setActiveView('split');
          if (projs.length > 0) {
            setPlan(cleanUnrealisticStairs(projs[0].plan));
          }
        }
      } catch (e) {}
    }
    setIsAuthLoaded(true);

    // Return URL verification for Cashfree payment callbacks
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const returnOrderId = params.get('cf_order_id') || params.get('order_id');

      if (returnOrderId) {
        setIsVerifyingReturnPayment(true);
        setReturnVerificationStatus('verifying');
        setReturnVerificationMsg('Verifying Cashfree payment securely with backend...');

        const planId =
          localStorage.getItem('decofrog_last_checkout_plan') ||
          localStorage.getItem('sweethome_last_checkout_plan') ||
          'trial_2days';

        fetch('/api/cashfree/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: returnOrderId,
            planId,
            userId: loadedUser?.id,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setReturnVerificationStatus('success');
              setReturnVerificationMsg('Payment verified successfully! Welcome to DecoFrog 3D Studio.');
              if (loadedUser) {
                const updated = saveSubscriptionLocally(
                  loadedUser,
                  data.tier || 'PRO',
                  data.paymentId,
                  data.subscriptionToken,
                  data.orderId,
                  data.durationDays || (planId === 'yearly' ? 365 : planId === 'trial_2days' ? 2 : 30),
                  planId as any,
                  'cashfree'
                );
                setCurrentUser(updated);
              }
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete('cf_order_id');
              cleanUrl.searchParams.delete('order_id');
              window.history.replaceState({}, document.title, cleanUrl.toString());

              setTimeout(() => {
                setIsVerifyingReturnPayment(false);
              }, 1800);
            } else {
              setReturnVerificationStatus('failed');
              setReturnVerificationMsg(data.error || 'Payment verification failed with Cashfree.');
            }
          })
          .catch((err) => {
            setReturnVerificationStatus('failed');
            setReturnVerificationMsg(err.message || 'Error connecting to verification server.');
          });
      } else if (loadedUser) {
        refreshUserPaymentStatus(loadedUser);
      }
    }

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
    const userToSet = (user.role !== 'ADMIN' && !user.paid_at && !user.trialExpiresAt)
      ? start48HourFreeTrialLocally(user)
      : user;
    setCurrentUser(userToSet);
    setUserRole(userToSet.role);
    localStorage.setItem('decofrog_current_user', JSON.stringify(userToSet));
    refreshUserPaymentStatus(userToSet);
    const projs = getUserProjects(userToSet.id);
    setUserProjects(projs);
    syncUserProjectsWithCloud(userToSet.id, userToSet.email).then((cloudProjs) => {
      if (cloudProjs && cloudProjs.length > 0) {
        setUserProjects(cloudProjs);
        if (user.role !== 'ADMIN') {
          setPlan(cleanUnrealisticStairs(cloudProjs[0].plan));
        }
      }
    });

    if (user.role === 'ADMIN') {
      setActiveView('dashboard');
    } else {
      setActiveView('split');
      if (projs.length > 0) {
        setPlan(cleanUnrealisticStairs(projs[0].plan));
      } else {
        setProjectManagerTab('new');
        setIsProjectManagerOpen(true);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('decofrog_current_user');
    localStorage.removeItem('sweethome_current_user');
    setActiveView('split');
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
    if (currentUser) {
      const updatedList = saveUserProject(currentUser.id, plan, currentUser.email);
      setUserProjects(updatedList);
    }
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

  const handleOpenUserProject = (selectedPlan: HomePlan) => {
    setPlan(selectedPlan);
    historyRef.current = [JSON.parse(JSON.stringify(selectedPlan))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setActiveView('split');
  };

  const handleSaveNewUserProject = (newPlan: HomePlan) => {
    if (currentUser) {
      const updatedList = saveUserProject(currentUser.id, newPlan, currentUser.email);
      setUserProjects(updatedList);
    }
    setPlan(newPlan);
    historyRef.current = [JSON.parse(JSON.stringify(newPlan))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setActiveView('split');
  };

  const handleDeleteUserProject = (projectId: string) => {
    if (currentUser) {
      const updatedList = deleteUserProject(currentUser.id, projectId);
      setUserProjects(updatedList);
    }
  };

  const handleDirectImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const validatedPlan = parseAndValidateProjectJson(text);
        if (currentUser) {
          validatedPlan.id = `plan_${currentUser.id}_${Date.now()}`;
          const updatedList = saveUserProject(currentUser.id, validatedPlan);
          setUserProjects(updatedList);
        }
        setPlan(validatedPlan);
        commitSnapshot(validatedPlan);
        setActiveView('split');
        alert(`✓ Project "${validatedPlan.name}" imported successfully! You can now continue designing.`);
      } catch (err: any) {
        alert(err.message || 'Failed to parse project file. Please provide a valid project CAD .json file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSelectDemoPlan = (selectedPlan: HomePlan) => {
    if (currentUser) {
      const updatedList = saveUserProject(currentUser.id, selectedPlan, currentUser.email);
      setUserProjects(updatedList);
    }
    setPlan(selectedPlan);
    historyRef.current = [JSON.parse(JSON.stringify(selectedPlan))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setActiveFloor(selectedPlan.currentFloor || 0);
    setActiveView('split');
    sessionStorage.setItem('decofrog_initial_demo_selected', 'true');
    setIsSelectDemoModalOpen(false);
  };

  const handleCustomPlanCreated = (newPlan: HomePlan) => {
    if (currentUser) {
      const updatedList = saveUserProject(currentUser.id, newPlan, currentUser.email);
      setUserProjects(updatedList);
    }
    setPlan(newPlan);
    historyRef.current = [JSON.parse(JSON.stringify(newPlan))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setActiveFloor(newPlan.currentFloor || 0);
    setActiveView('split');
    setCameraMode3D('aerial');
    const isSingle = newPlan.floors.length === 1;
    const livingCamX = isSingle ? 220 : -240;
    const livingCamY = isSingle ? 180 : 0;
    setVisitorCamera({
      x: livingCamX,
      y: livingCamY,
      elevation: 120,
      yaw: 0,
      floorLevel: 0,
    });
    sessionStorage.setItem('decofrog_initial_demo_selected', 'true');
    setIsGuidedBuilderOpen(false);
  };

  const handleStartBlankCanvas = () => {
    const blankPlan: HomePlan = {
      id: `plan_${currentUser?.id || 'guest'}_${Date.now()}`,
      name: 'Untitled Custom Floor Plan',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentFloor: 0,
      floors: [{ level: 0, name: 'Ground Floor', elevation: 0, height: 280 }],
      walls: [],
      furniture: [],
      rooms: [],
      dimensionLines: [],
      textNotes: [],
      preferences: {
        unitSystem: 'cm',
        defaultWallThickness: 15,
        defaultWallHeight: 280,
        gridSize: 20,
        magnetismEnabled: true,
        showRulers: true,
      },
    };
    if (currentUser) {
      const updatedList = saveUserProject(currentUser.id, blankPlan, currentUser.email);
      setUserProjects(updatedList);
    }
    setPlan(blankPlan);
    historyRef.current = [JSON.parse(JSON.stringify(blankPlan))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setActiveFloor(0);
    setActiveView('split');
    sessionStorage.setItem('decofrog_initial_demo_selected', 'true');
    setIsGuidedBuilderOpen(false);
  };

  const handleOpenStudioWithTemplate = (tplId: string) => {
    // 1. Look in loaded templates array (which comes from Supabase Cloud DB)
    const found = templates.find((t) => t.id === tplId);
    if (found && (found.plan || found.data)) {
      const planToLoad: HomePlan = JSON.parse(JSON.stringify(found.plan || found.data));
      planToLoad.id = `proj_${currentUser?.id || 'admin'}_${Date.now()}`;
      planToLoad.updatedAt = new Date().toISOString();
      if (currentUser) {
        const updatedList = saveUserProject(currentUser.id, planToLoad, currentUser.email);
        setUserProjects(updatedList);
      }
      setPlan(planToLoad);
      historyRef.current = [JSON.parse(JSON.stringify(planToLoad))];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      setActiveFloor(planToLoad.currentFloor || 0);
      setActiveView('split');
      return;
    }

    // 2. Look in DECOFROG_DEMOS
    const demo = DECOFROG_DEMOS.find((d) => d.id === tplId);
    if (demo) {
      const cloned: HomePlan = JSON.parse(JSON.stringify(demo.plan));
      cloned.id = `proj_${currentUser?.id || 'admin'}_${Date.now()}`;
      cloned.updatedAt = new Date().toISOString();
      if (currentUser) {
        const updatedList = saveUserProject(currentUser.id, cloned, currentUser.email);
        setUserProjects(updatedList);
      }
      setPlan(cloned);
      historyRef.current = [JSON.parse(JSON.stringify(cloned))];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      setActiveFloor(cloned.currentFloor || 0);
      setActiveView('split');
      return;
    }

    // 3. Look in STARTER_TEMPLATES
    const starter = STARTER_TEMPLATES.find((s) => s.id === tplId);
    if (starter) {
      const cloned: HomePlan = JSON.parse(JSON.stringify(starter.basePlan));
      cloned.id = `proj_${currentUser?.id || 'admin'}_${Date.now()}`;
      cloned.updatedAt = new Date().toISOString();
      if (currentUser) {
        const updatedList = saveUserProject(currentUser.id, cloned, currentUser.email);
        setUserProjects(updatedList);
      }
      setPlan(cloned);
      historyRef.current = [JSON.parse(JSON.stringify(cloned))];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      setActiveFloor(cloned.currentFloor || 0);
      setActiveView('split');
      return;
    }

    setActiveView('split');
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
    let basePlan: HomePlan = sampleDefaultPlan;
    if (templateId === 'duplex_2floor' || templateId === 'starter-sarah-suite') {
      const found = STARTER_TEMPLATES.find((s) => s.id === 'starter-sarah-suite');
      if (found) basePlan = found.basePlan;
    } else if (templateId === 'studio_apt' || templateId === 'starter-emma-studio' || templateId === 'studio') {
      const found = STARTER_TEMPLATES.find((s) => s.id === 'starter-emma-studio');
      if (found) basePlan = found.basePlan;
    } else if (templateId) {
      const match = templates.find((t) => t.id === templateId);
      if (match && (match.plan || match.data)) {
        basePlan = match.plan || match.data;
      }
    }

    const freshPlan: HomePlan = {
      ...JSON.parse(JSON.stringify(basePlan)),
      id: `plan_${client.id}_${Date.now()}`,
      name: `${client.name}'s Residence`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (client.id) {
      const updatedList = saveUserProject(client.id, freshPlan, client.email);
      if (currentUser?.id === client.id) {
        setUserProjects(updatedList);
      }
    }
    setPlan(freshPlan);
    historyRef.current = [JSON.parse(JSON.stringify(freshPlan))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setActiveFloor(freshPlan.currentFloor || 0);
    setIsClientSelectModalOpen(false);
    setActiveView('split');
  };

  // 1. Return URL Payment Verification Screen
  if (isVerifyingReturnPayment) {
    return (
      <div className="h-screen w-screen bg-[#080d19] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
          {returnVerificationStatus === 'verifying' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verifying Payment</h2>
              <p className="text-sm text-slate-400 mb-6">{returnVerificationMsg}</p>
              <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
                <ShieldCheck className="w-4 h-4" />
                <span>Confirming with Cashfree API...</span>
              </div>
            </>
          )}

          {returnVerificationStatus === 'success' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Payment Verified!</h2>
              <p className="text-sm text-emerald-300 mb-4">{returnVerificationMsg}</p>
              <p className="text-xs text-slate-400">Opening DecoFrog 3D Studio...</p>
            </>
          )}

          {returnVerificationStatus === 'failed' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verification Notice</h2>
              <p className="text-sm text-rose-300 mb-6">{returnVerificationMsg}</p>
              <button
                onClick={() => setIsVerifyingReturnPayment(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors border border-slate-700"
              >
                Continue to Studio
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 2. Loading state
  if (!isAuthLoaded) {
    return (
      <div className="h-screen w-screen bg-[#080d19] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading DecoFrog 3D Studio...</span>
        </div>
      </div>
    );
  }

  // 3. Not logged in -> Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLoginSuccess}
        availableUsers={users}
        onSignUp={(newUser) => {
          setUsers((prev) => [newUser, ...prev]);
          handleLoginSuccess(newUser);
        }}
      />
    );
  }

  // 4. Strict Route Guard: If user is logged in, not ADMIN, and has not paid -> Subscription Paywall
  if (currentUser.role !== 'ADMIN' && !hasActiveSubscription(currentUser)) {
    return (
      <SubscriptionPaywall
        currentUser={currentUser}
        onUserUpdated={(updated) => {
          setCurrentUser(updated);
          setActiveView('split');
          const projs = getUserProjects(updated.id);
          setUserProjects(projs);
          if (projs.length === 0) {
            setProjectManagerTab('new');
            setIsProjectManagerOpen(true);
          } else {
            setPlan(cleanUnrealisticStairs(projs[0].plan));
          }
        }}
        onLogout={handleLogout}
        onRefreshStatus={() => refreshUserPaymentStatus(currentUser)}
        status={currentUser.payment_status || 'unpaid'}
        isRefreshing={isRefreshingStatus}
      />
    );
  }

  // Guard: If regular user somehow has dashboard as activeView, redirect immediately to Design Studio
  if (currentUser.role !== 'ADMIN' && activeView === 'dashboard') {
    setActiveView('split');
  }

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans ${isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Top Main Navigation Bar */}
      <Navbar
        plan={plan}
        activeView={activeView}
        setActiveView={setActiveView}
        studioLayout={studioLayout}
        setStudioLayout={setStudioLayout}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        userRole={userRole}
        setUserRole={setUserRole}
        cloudSyncStatus={cloudSyncStatus}
        lastSyncedAt={lastSyncedAt}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenUpgradeModal={() => handleOpenUpgrade()}
        onOpenWelcomeGuide={() => setIsCustomerGuideOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 48-Hour Free Trial Active Banner with Upgrade Button */}
      {currentUser.role !== 'ADMIN' && isUserOnFreeTrial(currentUser) && (
        <div className={`px-4 py-1.5 flex items-center justify-between text-xs z-30 select-none border-b transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 border-amber-500/20 text-amber-300'
            : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-bold">48-Hour Free Trial Active:</span>
            <span className="font-normal opacity-90">
              Full 2D blueprint drafting, 3D walking & custom layout features are unlocked ({getSubscriptionRemainingText(currentUser).replace(' • Upgrade', '')}).
            </span>
          </div>
          <button
            onClick={() => handleOpenUpgrade()}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: Admin / Enterprise Dashboard (Admin Only) */}
        {activeView === 'dashboard' && currentUser?.role === 'ADMIN' && (
          <AdminDashboard
            users={users}
            catalog={catalog}
            templates={templates}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenStudioWithTemplate={(tplId) => {
              handleOpenStudioWithTemplate(tplId);
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
            visitorCamera={visitorCamera}
            onUpdateVisitorCamera={handleUpdateVisitorCamera}
          />
        )}

        {/* VIEW 3: Interactive Design Studio (Split, 2D Blueprint, 3D WebGL) */}
        {(activeView === 'split' || activeView === '2d' || activeView === '3d') && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Sweet Home 3D Authentic Menu & Ribbon Bar */}
            <SweetHomeRibbon
              plan={plan}
              activeToolMode={cadToolMode}
              onSelectToolMode={(mode) => setCadToolMode(mode)}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onDeleteSelected={() => {
                if (selectedId) handleDeleteItem(selectedId);
              }}
              hasSelection={Boolean(selectedId)}
              onSave={handleSave}
              isSaving={isSaving}
              onOpenGuidedBuilder={() => setIsGuidedBuilderOpen(true)}
              onOpenBlueprintModal={() => setIsBlueprintModalOpen(true)}
              onExportJson={() => exportPlanAsJson(plan, currentUser)}
              onImportJson={() => directImportFileInputRef.current?.click()}
              onOpenAiStyler={() => setIsAiStylerModalOpen(true)}
              onOpenCostEstimator={() => setIsCostEstimatorModalOpen(true)}
              studioLayout={studioLayout}
              onLayoutChange={(newLayout) => {
                setStudioLayout(newLayout);
                if (newLayout === '2d') {
                  setActiveView('2d');
                } else if (newLayout === '3d') {
                  setActiveView('3d');
                  setCameraMode3D('aerial');
                } else if (newLayout === 'tour') {
                  setActiveView('split');
                  setCameraMode3D('visitor');
                } else {
                  setActiveView('split');
                }
              }}
              cameraMode3D={cameraMode3D}
              onToggleCameraMode3D={() => setCameraMode3D((prev) => (prev === 'visitor' ? 'aerial' : 'visitor'))}
              theme={theme}
              onOpenWelcomeGuide={() => setIsCustomerGuideOpen(true)}
            />

            {/* Hidden File Input for Direct JSON Import */}
            <input
              ref={directImportFileInputRef}
              type="file"
              accept=".json,.cad,.project"
              onChange={handleDirectImportFile}
              className="hidden"
            />

            {/* Design Studio Viewport & Floating Sidebars Area */}
            <div className="flex-1 flex relative overflow-hidden w-full h-full">
              {/* Full Width Center Viewports */}
              <div className="flex-1 flex relative overflow-hidden w-full h-full">
                {/* 1. Classic Sweet Home 3D 4-Pane Studio Layout (Default matching Sweet Home 3D) */}
                {activeView === 'split' && studioLayout === 'sweethome' && (
                  <div className="flex-1 flex overflow-hidden w-full h-full">
                    {/* Left Column (Width ~310px, Split vertically: Top: Catalog Tree, Bottom: Furniture List Table) */}
                    <div className="w-[300px] xl:w-[320px] h-full flex flex-col shrink-0 border-r border-slate-300 dark:border-slate-800">
                      <div className="h-[52%] flex flex-col overflow-hidden">
                        <SweetHomeCatalogTree
                          catalog={catalog}
                          onAddItem={handleAddItem}
                          theme={theme}
                        />
                      </div>
                      <div className="h-[48%] flex flex-col overflow-hidden">
                        <SweetHomeFurnitureTable
                          furniture={plan.furniture.filter((f) => (f.floorLevel ?? 0) === activeFloor)}
                          selectedId={selectedId}
                          onSelectId={setSelectedId}
                          onToggleVisibility={handleToggleItemVisibility}
                          onToggleLock={handleToggleItemLock}
                          onDeleteItem={handleDeleteItem}
                          collidingItemIds={collisionReport.collidingItemIds}
                          theme={theme}
                        />
                      </div>
                    </div>

                    {/* Right Workspace: Split horizontally: Top: 2D Blueprint Canvas, Bottom: 3D Viewport */}
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      {/* Top: 2D Floor Plan with Architectural Rulers & Floor Tabs */}
                      <div className="h-1/2 w-full border-b border-slate-300 dark:border-slate-800 relative">
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
                          onToggleWalkMode={() => setCameraMode3D((prev) => (prev === 'visitor' ? 'aerial' : 'visitor'))}
                          activeToolModeProp={cadToolMode}
                          onToolModeChangeProp={setCadToolMode}
                          hideFloatingToolbar={true}
                        />
                      </div>

                      {/* Bottom: Real-time 3D Viewport */}
                      <div className="h-1/2 w-full relative">
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
                          onUpgradePrompt={handleOpenUpgrade}
                          isPro={isProOrAdmin}
                          targetRoomToFocus={targetRoomToFocus}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Side-by-Side Dual View (50% 2D on Left, 50% 3D on Right) */}
                {activeView === 'split' && studioLayout === 'split' && (
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
                        onToggleWalkMode={() => setCameraMode3D((prev) => (prev === 'visitor' ? 'aerial' : 'visitor'))}
                        activeToolModeProp={cadToolMode}
                        onToolModeChangeProp={setCadToolMode}
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
                        onUpgradePrompt={handleOpenUpgrade}
                        isPro={isProOrAdmin}
                        targetRoomToFocus={targetRoomToFocus}
                      />
                    </div>
                  </>
                )}

                {/* 3. First-Person Walkthrough Tour */}
                {activeView === 'split' && studioLayout === 'tour' && (
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
                      cameraModeProp="visitor"
                      onCameraModeChangeProp={setCameraMode3D}
                      visitorCameraProp={visitorCamera}
                      onVisitorCameraChange={handleUpdateVisitorCamera}
                      onUpgradePrompt={handleOpenUpgrade}
                      isPro={isProOrAdmin}
                      targetRoomToFocus={targetRoomToFocus}
                    />

                    {/* Minimized Floor Plan Navigator in Tour Mode */}
                    <MinimizedFloorPlan
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
                      isWalkMode={true}
                      onToggleWalkMode={() => setCameraMode3D((prev) => (prev === 'visitor' ? 'aerial' : 'visitor'))}
                      onExpandToSplit={() => setStudioLayout('split')}
                      isDark={isDark}
                    />
                  </div>
                )}

                {/* 4. Full 2D Drafting Blueprint Mode */}
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
                      onToggleWalkMode={() => setCameraMode3D((prev) => (prev === 'visitor' ? 'aerial' : 'visitor'))}
                      activeToolModeProp={cadToolMode}
                      onToolModeChangeProp={setCadToolMode}
                    />
                  </div>
                )}

                {/* 5. Full 3D Aerial Orbit View Mode */}
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
                      onUpgradePrompt={handleOpenUpgrade}
                      isPro={isProOrAdmin}
                      targetRoomToFocus={targetRoomToFocus}
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
                externalCategory={catalogCategoryRequest}
                onOpenAiStyler={() => setIsAiStylerModalOpen(true)}
                onOpenGuidedBuilder={() => setIsGuidedBuilderOpen(true)}
                onOpenProjects={() => {
                  setProjectManagerTab('projects');
                  setIsProjectManagerOpen(true);
                }}
                onOpenBlueprintModal={() => setIsBlueprintModalOpen(true)}
                onOpenCostEstimator={() => setIsCostEstimatorModalOpen(true)}
                onOpenPreferences={() => setIsPreferencesModalOpen(true)}
                onExportJson={() => exportPlanAsJson(plan, currentUser)}
                onImportJson={() => directImportFileInputRef.current?.click()}
                onToggleFurnitureList={() => setIsFurnitureListOpen(!isFurnitureListOpen)}
                isFurnitureListOpen={isFurnitureListOpen}
              />

              {/* Floating Smart Alignment Bar for Beginners (When Furniture Selected in non-sweethome layout) */}
              {selectedFurniture && cameraMode3D !== 'visitor' && studioLayout !== 'sweethome' && (
                <SmartAlignmentBar
                  plan={plan}
                  selectedFurniture={selectedFurniture}
                  onUpdatePlan={handleUpdatePlan}
                  onDeselect={() => setSelectedId(null)}
                  theme={theme}
                />
              )}

              {/* Floating Room Quick-Style Card for Beginners (When Room Selected in non-sweethome layout) */}
              {selectedRoom && cameraMode3D !== 'visitor' && studioLayout !== 'sweethome' && (
                <RoomQuickStyleCard
                  room={selectedRoom}
                  plan={plan}
                  onUpdatePlan={handleUpdatePlan}
                  onClose={() => setSelectedId(null)}
                  onWalkInRoom={handleWalkInRoom}
                  theme={theme}
                />
              )}
            </div>

            {/* Bottom Expandable Furniture List Pane (Shown in standard layouts; SweetHome 4-Pane uses the dedicated left table) */}
            {studioLayout !== 'sweethome' && (
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
            )}
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
        onUpgradePrompt={handleOpenUpgrade}
        isPro={isProOrAdmin}
      />

      <AiStylerModal
        isOpen={isAiStylerModalOpen}
        onClose={() => setIsAiStylerModalOpen(false)}
        plan={plan}
        activeFloor={activeFloor}
        onUpdatePlan={handleUpdatePlan}
      />

      {/* Premium Subscription Upgrade Modal with Razorpay */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updated) => {
          setCurrentUser(updated);
        }}
        initialFeatureHighlight={upgradeHighlight}
      />

      {/* Project Center Modal: User Saved Projects, Pre-defined Starter Houses & JSON Import/Export */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        currentUser={currentUser}
        currentPlan={plan}
        userProjects={userProjects}
        onOpenProject={handleOpenUserProject}
        onSaveNewProject={handleSaveNewUserProject}
        onDeleteProject={handleDeleteUserProject}
        theme={theme}
        defaultTab={projectManagerTab}
      />

      {/* Interactive Tailored Floor Plan Builder Modal (Custom Rooms & Floors) */}
      <GuidedFloorPlanBuilderModal
        isOpen={isGuidedBuilderOpen}
        onClose={() => setIsGuidedBuilderOpen(false)}
        onPlanCreated={handleCustomPlanCreated}
        onOpenBlankCanvas={handleStartBlankCanvas}
        onOpenBlueprintImport={() => setIsBlueprintModalOpen(true)}
        onOpenShowcaseDemos={() => setIsSelectDemoModalOpen(true)}
        currentUser={currentUser}
        theme={theme}
      />

      {/* Pre-built Showcase Inspiration Dialog */}
      <SelectDemoModal
        isOpen={isSelectDemoModalOpen}
        onClose={() => setIsSelectDemoModalOpen(false)}
        onSelectDemo={handleSelectDemoPlan}
        onOpenExistingProjects={() => {
          setProjectManagerTab('projects');
          setIsProjectManagerOpen(true);
        }}
        currentUser={currentUser}
        theme={theme}
      />

      {/* Beginner & Customer Quick Guide Modal */}
      <CustomerWelcomeGuideModal
        isOpen={isCustomerGuideOpen}
        onClose={() => setIsCustomerGuideOpen(false)}
        onOpenTemplates={() => {
          setProjectManagerTab('new');
          setIsProjectManagerOpen(true);
        }}
        onOpenCatalog={() => {
          setIsInspectorOpen(true);
        }}
        onStartWalkTour={() => {
          setActiveView('3d');
          setCameraMode3D('visitor');
          setStudioLayout('tour');
        }}
        theme={theme}
      />
    </div>
  );
};
