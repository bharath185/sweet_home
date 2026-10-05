'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Eye,
  ChevronLeft,
  Check,
  Sparkles,
  Layers,
  PhoneCall,
  Share2,
  MapPin,
  ListFilter,
  Plus,
  AlertTriangle,
  RotateCw,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Palette,
  Copy,
  Sliders,
  X,
  GripHorizontal,
  Minimize2,
  Maximize2,
  Pin,
  Box,
  Search,
  Hand,
  Compass,
  Navigation
} from 'lucide-react';
import { HomePlan, Room, CatalogItem, FurnitureItem, UserRole, VisitorCameraState } from '../types/plan';
import { isTabletopItem, findNearestSupportingSurface } from '../services/tabletopAttachment';
import { Viewport3D } from './Viewport3D';

interface CustomerPresentationViewProps {
  plan: HomePlan;
  catalog: CatalogItem[];
  clientName?: string;
  userRole?: UserRole;
  onUpdatePlan: (plan: HomePlan) => void;
  onSwitchToStudio: () => void;
  onOpenShare: () => void;
  collidingItemIds: Set<string>;
  activeFloor: number;
  onFloorChange: (floor: number) => void;
  floorMode?: 'single' | 'sideBySide' | 'stacked';
  onFloorModeChange?: (mode: 'single' | 'sideBySide' | 'stacked') => void;
  visitorCamera?: VisitorCameraState;
  onUpdateVisitorCamera?: (state: Partial<VisitorCameraState>) => void;
}

const CLIENT_PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#94a3b8', '#1e293b', '#0284c7',
  '#38bdf8', '#059669', '#10b981', '#f59e0b', '#ef4444',
  '#7c3aed', '#78350f', '#d97706'
];

export const CustomerPresentationView: React.FC<CustomerPresentationViewProps> = ({
  plan,
  catalog,
  clientName,
  userRole,
  onUpdatePlan,
  onSwitchToStudio,
  onOpenShare,
  collidingItemIds,
  activeFloor,
  onFloorChange,
  floorMode,
  onFloorModeChange,
  visitorCamera,
  onUpdateVisitorCamera,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(plan.rooms[0] || null);
  const [tourCameraMode, setTourCameraMode] = useState<'visitor' | 'aerial'>('visitor');
  const [tourToolMode, setTourToolMode] = useState<'select' | 'pan'>('select');
  const [showSpecDrawer, setShowSpecDrawer] = useState<boolean>(false);
  const [showAddCatalogDrawer, setShowAddCatalogDrawer] = useState<boolean>(false);
  const [consultationBooked, setConsultationBooked] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Catalog search & category filter in Client View
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [justAddedItemName, setJustAddedItemName] = useState<string | null>(null);

  // Close drawers on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddCatalogDrawer(false);
        setShowSpecDrawer(false);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // When in Walk tour mode, close all property panels and disable item selection
  useEffect(() => {
    if (tourCameraMode === 'visitor') {
      setSelectedId(null);
      setShowAddCatalogDrawer(false);
      setShowSpecDrawer(false);
    }
  }, [tourCameraMode]);
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');

  // Interactive 2D Tour Mini-Map HUD with Glowing Client View Pointer
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const miniMapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = miniMapCanvasRef.current;
    if (!canvas || !showMiniMap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Compute active floor bounding box
    const floorRooms = (plan.rooms || []).filter((r) => (r.floorLevel ?? 0) === activeFloor);
    const floorWalls = (plan.walls || []).filter((w) => (w.floorLevel ?? 0) === activeFloor);

    let minX = -350, maxX = 350, minY = -250, maxY = 250;
    if (floorRooms.length > 0 || floorWalls.length > 0) {
      minX = Infinity; maxX = -Infinity; minY = Infinity; maxY = -Infinity;
      floorRooms.forEach((r) => r.points.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }));
      floorWalls.forEach((w) => { minX = Math.min(minX, w.xStart, w.xEnd); maxX = Math.max(maxX, w.xStart, w.xEnd); minY = Math.min(minY, w.yStart, w.yEnd); maxY = Math.max(maxY, w.yStart, w.yEnd); });
    }
    const pad = 50;
    minX -= pad; maxX += pad; minY -= pad; maxY += pad;
    const spanX = Math.max(80, maxX - minX);
    const spanY = Math.max(80, maxY - minY);
    const scale = Math.min((width - 20) / spanX, (height - 20) / spanY);

    const toScreen = (x: number, y: number) => ({
      x: 10 + (x - minX) * scale,
      y: 10 + (y - minY) * scale,
    });

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 15) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 15) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

    // Rooms
    floorRooms.forEach((r) => {
      if (r.points.length < 3) return;
      ctx.beginPath();
      const p0 = toScreen(r.points[0].x, r.points[0].y);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < r.points.length; i++) {
        const pi = toScreen(r.points[i].x, r.points[i].y);
        ctx.lineTo(pi.x, pi.y);
      }
      ctx.closePath();
      ctx.fillStyle = r.id === selectedRoom?.id ? 'rgba(14, 165, 233, 0.2)' : 'rgba(241, 245, 249, 0.85)';
      ctx.fill();
      ctx.strokeStyle = r.id === selectedRoom?.id ? '#0284c7' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Walls
    floorWalls.forEach((w) => {
      const p1 = toScreen(w.xStart, w.yStart);
      const p2 = toScreen(w.xEnd, w.yEnd);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = Math.max(2, (w.thickness || 15) * scale * 0.9);
      ctx.stroke();
    });

    // Client View Pointer Reticle in Tour Mode (Matching media_1791085406444.png)
    const vCam = visitorCamera || { x: 0, y: 0, yaw: 0 };
    const vp = toScreen(vCam.x, vCam.y);
    const vAngle = vCam.yaw || 0;
    const screenLookAngle = Math.atan2(-Math.cos(vAngle), Math.sin(vAngle));

    ctx.save();
    ctx.translate(vp.x, vp.y);

    // Vision cone
    const fovRad = (65 * Math.PI) / 180;
    const coneDist = 28;
    const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, coneDist);
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.45)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, coneDist, screenLookAngle - fovRad / 2, screenLookAngle + fovRad / 2);
    ctx.closePath();
    ctx.fill();

    // Reticle halo & circle
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // 4 crosshairs
    ctx.beginPath();
    ctx.moveTo(0, -9); ctx.lineTo(0, -5.5);
    ctx.moveTo(0, 9); ctx.lineTo(0, 5.5);
    ctx.moveTo(-9, 0); ctx.lineTo(-5.5, 0);
    ctx.moveTo(9, 0); ctx.lineTo(5.5, 0);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [plan, activeFloor, visitorCamera, selectedRoom, showMiniMap]);

  const handleMiniMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onUpdateVisitorCamera) return;
    const canvas = miniMapCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const floorRooms = (plan.rooms || []).filter((r) => (r.floorLevel ?? 0) === activeFloor);
    const floorWalls = (plan.walls || []).filter((w) => (w.floorLevel ?? 0) === activeFloor);

    let minX = -350, maxX = 350, minY = -250, maxY = 250;
    if (floorRooms.length > 0 || floorWalls.length > 0) {
      minX = Infinity; maxX = -Infinity; minY = Infinity; maxY = -Infinity;
      floorRooms.forEach((r) => r.points.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }));
      floorWalls.forEach((w) => { minX = Math.min(minX, w.xStart, w.xEnd); maxX = Math.max(maxX, w.xStart, w.xEnd); minY = Math.min(minY, w.yStart, w.yEnd); maxY = Math.max(maxY, w.yStart, w.yEnd); });
    }
    const pad = 50;
    minX -= pad; maxX += pad; minY -= pad; maxY += pad;
    const spanX = Math.max(80, maxX - minX);
    const spanY = Math.max(80, maxY - minY);
    const scale = Math.min((canvas.width - 20) / spanX, (canvas.height - 20) / spanY);

    const planX = Math.round(minX + (clickX - 10) / scale);
    const planY = Math.round(minY + (clickY - 10) / scale);

    onUpdateVisitorCamera({
      x: planX,
      y: planY,
      floorLevel: activeFloor,
    });
  };

  // Draggable & Collapsible Customizer Panel State
  const [panelPos, setPanelPos] = useState<{ x: number; y: number }>({ x: 24, y: 140 });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const handleStartDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    e.preventDefault();
    setIsDraggingPanel(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: panelPos.x,
      startY: panelPos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(10, Math.min(window.innerWidth - 340, dragStartRef.current.startX + dx));
      const newY = Math.max(70, Math.min(window.innerHeight - 80, dragStartRef.current.startY + dy));
      setPanelPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      setIsDraggingPanel(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const dockPanel = (position: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left') => {
    if (position === 'bottom-left') {
      setPanelPos({ x: 24, y: Math.max(80, window.innerHeight - 560) });
    } else if (position === 'bottom-right') {
      setPanelPos({ x: Math.max(20, window.innerWidth - 360), y: Math.max(80, window.innerHeight - 560) });
    } else if (position === 'top-right') {
      setPanelPos({ x: Math.max(20, window.innerWidth - 360), y: 90 });
    } else if (position === 'top-left') {
      setPanelPos({ x: 24, y: 90 });
    }
  };

  const selectedFurniture = plan.furniture.find((f) => f.id === selectedId);
  const isSelectedColliding = selectedId ? collidingItemIds.has(selectedId) : false;

  const updateSelected = (changes: Partial<FurnitureItem>) => {
    if (!selectedId) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === selectedId ? { ...f, ...changes } : f)),
      updatedAt: new Date().toISOString(),
    });
  };

  // Nudge selected item in 2D / 3D space
  const nudgeItem = (dx: number, dy: number) => {
    if (!selectedFurniture) return;
    updateSelected({
      x: selectedFurniture.x + dx,
      y: selectedFurniture.y + dy,
    });
  };

  // Rotate selected item
  const rotateItem = (deltaAngle: number) => {
    if (!selectedFurniture) return;
    const newAngle = ((selectedFurniture.angle || 0) + deltaAngle + Math.PI * 2) % (Math.PI * 2);
    updateSelected({ angle: newAngle });
  };

  // Adjust dimension or elevation
  const adjustDimension = (prop: 'width' | 'depth' | 'height' | 'elevation', delta: number) => {
    if (!selectedFurniture) return;
    const current = selectedFurniture[prop] || 0;
    const minVal = prop === 'elevation' ? 0 : 10;
    const updated = Math.max(minVal, Math.round(current + delta));
    updateSelected({ [prop]: updated });
  };

  // Delete furniture
  const handleDeleteFurniture = (id: string) => {
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.filter((f) => f.id !== id),
      updatedAt: new Date().toISOString(),
    });
    if (selectedId === id) setSelectedId(null);
  };

  // Duplicate furniture
  const duplicateSelected = () => {
    if (!selectedFurniture) return;
    const duplicated: FurnitureItem = {
      ...selectedFurniture,
      id: 'f_' + Math.random().toString(36).substr(2, 9),
      name: `${selectedFurniture.name} (Copy)`,
      x: selectedFurniture.x + 30,
      y: selectedFurniture.y + 30,
    };
    onUpdatePlan({
      ...plan,
      furniture: [...plan.furniture, duplicated],
      updatedAt: new Date().toISOString(),
    });
    setSelectedId(duplicated.id);
  };

  // Client Adds Item from 3D Catalog to Active Room
  const handleAddCatalogItem = (item: CatalogItem) => {
    let targetX = 0;
    let targetY = 0;
    let targetElevation = item.elevation || item.defaultElevation || 0;
    let hostId: string | undefined = undefined;

    const isDoor = (item.name || '').toLowerCase().includes('door') ||
                   (item.id || '').toLowerCase().includes('door') ||
                   (item.model || '').toLowerCase().includes('door');

    const isWindow = !isDoor && (
      (item.name || '').toLowerCase().includes('window') ||
      (item.id || '').toLowerCase().includes('window') ||
      (item.model || '').toLowerCase().includes('window')
    );

    const isPanoramic = (item.name || '').toLowerCase().includes('panoramic') ||
                        (item.id || '').toLowerCase().includes('panoramic');

    const isCeiling =
      item.placementType === 'ceiling' ||
      (item.category || '').toLowerCase().includes('ceiling') ||
      (item.name || '').toLowerCase().includes('pendant') ||
      (item.name || '').toLowerCase().includes('chandelier') ||
      (item.name || '').toLowerCase().includes('ceiling fan') ||
      (item.name || '').toLowerCase().includes('downlight') ||
      (item.name || '').toLowerCase().includes('flush');

    // DOORS: Must stay grounded at floor level (elevation = 0)
    if (isDoor) {
      targetElevation = 0;
    } else if (isWindow && !isPanoramic && targetElevation === 0) {
      // WINDOWS: Standard architectural sill height (85cm above floor)
      targetElevation = item.elevation || item.defaultElevation || 85;
    } else if (isCeiling && (targetElevation === 0 || targetElevation < 100)) {
      // CEILING FIXTURES: Mount to room ceiling height (250cm - height)
      targetElevation = Math.max(120, 250 - (item.height || 50));
    }

    if (selectedRoom && selectedRoom.points.length > 0) {
      const xs = selectedRoom.points.map((p) => p.x);
      const ys = selectedRoom.points.map((p) => p.y);
      targetX = Math.round((Math.min(...xs) + Math.max(...xs)) / 2);
      
      // If window, door, or wall design, place along wall perimeter line
      if (isWindow || (item.category || '').toLowerCase().includes('wall') || (item.category || '').toLowerCase().includes('door')) {
        targetY = Math.min(...ys) + Math.round(item.depth / 2);
      } else {
        targetY = Math.round((Math.min(...ys) + Math.max(...ys)) / 2);
      }
    }

    if (item.placementType === 'tabletop' || item.placeOnTable || isTabletopItem(item)) {
      const nearestTable = findNearestSupportingSurface(
        { x: targetX, y: targetY, floorLevel: activeFloor, id: 'temp' } as any,
        plan.furniture
      );
      if (nearestTable) {
        targetX = nearestTable.x;
        targetY = nearestTable.y;
        targetElevation = (nearestTable.elevation || 0) + nearestTable.height;
        hostId = nearestTable.id;
      }
    }

    const newPiece: FurnitureItem = {
      id: 'f_' + Math.random().toString(36).substr(2, 9),
      catalogId: item.id,
      name: item.name,
      category: item.category,
      x: targetX,
      y: targetY,
      width: item.width,
      depth: item.depth,
      height: item.height,
      elevation: targetElevation,
      model: item.model,
      icon: item.icon,
      color: item.defaultColor || '#cbd5e1',
      angle: 0,
      floorLevel: activeFloor,
      isVisible: true,
      isLocked: false,
      materialCategory: item.materialCategory,
      materialFinish: item.materialFinish,
      roughness: item.roughness,
      metalness: item.metalness,
      opacity: item.opacity,
      placementType: item.placementType || (isTabletopItem(item) ? 'tabletop' : 'floor'),
      placeOnTable: item.placeOnTable || isTabletopItem(item),
      allowedOnFloor: item.allowedOnFloor,
      hostFurnitureId: hostId,
    };

    onUpdatePlan({
      ...plan,
      furniture: [...plan.furniture, newPiece],
      updatedAt: new Date().toISOString(),
    });

    setSelectedId(newPiece.id);
    setIsMinimized(false);
    // Auto-close catalog drawer so the user immediately sees their placed 3D item in the design!
    setShowAddCatalogDrawer(false);
    setJustAddedItemName(item.name);
    setTimeout(() => {
      setJustAddedItemName(null);
    }, 5000);
  };

  // Filter Catalog
  const categories = ['ALL', ...Array.from(new Set(catalog.map((i) => i.category)))];
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogCategory === 'ALL' || item.category === catalogCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col overflow-hidden select-none">
      {/* 3D WebGL Fullscreen Viewport in First-Person Human Visitor Mode */}
      <div className="absolute inset-0">
        <Viewport3D
          plan={plan}
          selectedId={selectedId}
          onSelectId={setSelectedId}
          onUpdatePlan={onUpdatePlan}
          isCustomerMode={true}
          collidingItemIds={collidingItemIds}
          activeFloor={activeFloor}
          floorMode={floorMode}
          onFloorModeChange={onFloorModeChange}
          onFloorChange={onFloorChange}
          cameraModeProp={tourCameraMode}
          onCameraModeChangeProp={setTourCameraMode}
          targetRoomToFocus={selectedRoom}
          toolModeProp={tourToolMode}
          onToolModeChangeProp={setTourToolMode}
          visitorCameraProp={visitorCamera}
          onVisitorCameraChange={onUpdateVisitorCamera}
        />
      </div>

      {/* Top Virtual Tour Header Bar */}
      <header className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto bg-white/95 px-3.5 py-2 rounded-2xl shadow-md flex items-center gap-2.5 border border-slate-200 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono shadow-2xs">
                👤 Client: {clientName || 'Sarah Jenkins'}
              </span>
              <h1 className="text-xs font-black text-slate-900 tracking-tight truncate max-w-[170px]">
                {plan.name}
              </h1>
              {/* Tour Camera Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
                <button
                  onClick={() => setTourCameraMode('visitor')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                    tourCameraMode === 'visitor'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="First-Person Human Walking View (1.6m)"
                >
                  <User className="w-3 h-3" />
                  <span>🚶 Walk Tour (1.6m)</span>
                </button>
                <button
                  onClick={() => setTourCameraMode('aerial')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                    tourCameraMode === 'aerial'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="3D Aerial Orbit View"
                >
                  <Eye className="w-3 h-3" />
                  <span>🌐 Aerial View</span>
                </button>
                <div className="w-[1px] h-3 bg-slate-300 mx-0.5" />
                <button
                  onClick={() => setTourToolMode(tourToolMode === 'pan' ? 'select' : 'pan')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                    tourToolMode === 'pan'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Free Hand / Pan View Tool (H or Hold Space) - Move 3D scene without selecting items"
                >
                  <Hand className="w-3 h-3" />
                  <span>🖐️ Free Hand</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              {tourToolMode === 'pan'
                ? '🖐️ Free Hand Tool: Click & drag anywhere to pan view without touching furniture • Press H or click Free Hand to exit'
                : tourCameraMode === 'visitor'
                ? '🚶 Use WASD, Arrow Keys, or on-screen D-Pad to walk • Doors auto-open when approaching!'
                : '🌐 Left-click + drag to orbit • Scroll to zoom • Press H for Free Hand'}
            </p>
          </div>
        </div>

        {/* Action Controls: + Add 3D Items, Design Specs, Share, CAD Studio */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* + ADD 3D ITEMS BUTTON FOR CLIENT */}
          <button
            onClick={() => {
              setShowAddCatalogDrawer(!showAddCatalogDrawer);
              setShowSpecDrawer(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-xl border transition shadow-xs active:scale-95 ${
              showAddCatalogDrawer
                ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
            title="Browse & Add 3D Furniture, Lighting & Decor to this room"
          >
            <Plus className={`w-4 h-4 ${showAddCatalogDrawer ? 'text-white' : 'text-sky-600'}`} />
            <span>+ Add 3D Items</span>
          </button>

          <button
            onClick={() => {
              setShowSpecDrawer(!showSpecDrawer);
              setShowAddCatalogDrawer(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xl border transition shadow-xs ${
              showSpecDrawer
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Design Specs ({plan.furniture.length})</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs border border-slate-200 transition"
          >
            <Share2 className="w-4 h-4 text-sky-600" />
            <span>Share</span>
          </button>

          {/* Only show CAD Studio switch if not client */}
          {userRole !== 'CLIENT' && (
            <button
              onClick={onSwitchToStudio}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm border border-sky-700/20 transition active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>CAD Studio</span>
            </button>
          )}
        </div>
      </header>

      {/* Collision Alert Pill (Non-overlapping at Bottom Left) */}
      {collidingItemIds.size > 0 && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-rose-600 text-white backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-lg border border-rose-500 text-xs font-bold animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span>
            {collidingItemIds.size} {collidingItemIds.size === 1 ? 'Item' : 'Items'} Overlapping (Red)
          </span>
        </div>
      )}

      {/* Floor & Room Selector at Top Center (Non-overlapping with clear clearance) */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/95 p-1 rounded-full border border-slate-200 shadow-md backdrop-blur-xl text-xs">
        {(plan.floors || [
          { level: 0, name: 'Ground Floor' },
          { level: 1, name: '1st Floor' }
        ]).map((fl) => (
          <button
            key={fl.level}
            onClick={() => onFloorChange(fl.level)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeFloor === fl.level
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {fl.name}
          </button>
        ))}

        <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

        {plan.rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition ${
              selectedRoom?.id === room.id
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span>{room.name}</span>
          </button>
        ))}
      </div>

      {/* SLIDE-OUT 1: ADD 3D ITEMS CATALOG DRAWER FOR CLIENT */}
      {showAddCatalogDrawer && (
        <>
          {/* Backdrop Click-To-Close overlay so design is easy to return to */}
          <div
            onClick={() => setShowAddCatalogDrawer(false)}
            className="absolute inset-0 bg-black/20 backdrop-blur-xs z-25 transition-opacity"
            title="Click to go back to 3D View"
          />

          <div className="absolute top-16 right-4 bottom-14 w-96 max-w-[calc(100vw-2rem)] bg-white/98 border border-slate-200/90 rounded-3xl shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 backdrop-blur-2xl">
            {/* Drawer Header with Prominent Back to Design button */}
            <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/90">
              <button
                onClick={() => setShowAddCatalogDrawer(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition shadow-2xs group"
                title="Go back to 3D Design (Esc)"
              >
                <ChevronLeft className="w-4 h-4 text-sky-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to 3D View</span>
              </button>

              <div className="text-right">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Add 3D Items
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Floor {activeFloor} • {selectedRoom ? selectedRoom.name : 'Main Room'}
                </span>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="p-3 border-b border-slate-100 bg-white space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search sofas, lamps, dining, tables..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition ${
                      catalogCategory === cat
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Items Grid */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 custom-scrollbar bg-slate-50/50">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="bg-white hover:border-sky-300 border border-slate-200/90 rounded-2xl p-2.5 flex flex-col justify-between transition hover:shadow-md group"
                >
                  <div>
                    <div className="w-full h-16 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-center p-1.5 mb-1.5 group-hover:scale-105 transition-transform">
                      {item.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.icon} alt={item.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Box className="w-6 h-6 text-sky-600" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase mt-0.5">
                      <span>{item.category}</span>
                      <span className="font-mono text-slate-500 font-semibold">
                        {item.width}×{item.depth}cm
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddCatalogItem(item)}
                    className="w-full mt-2 py-1.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Place in Room</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom Footer Bar with Done & Close Button */}
            <div className="p-2.5 border-t border-slate-200/80 bg-white flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-medium">
                Tip: Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-300 text-slate-600 text-[9px]">ESC</kbd> to close
              </span>
              <button
                onClick={() => setShowAddCatalogDrawer(false)}
                className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <span>Done & View Design</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* SLIDE-OUT 2: FURNITURE & SPECIFICATIONS DRAWER */}
      {showSpecDrawer && (
        <div className="absolute top-18 right-4 bottom-16 w-84 bg-white/95 border border-slate-200 rounded-3xl shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 backdrop-blur-xl">
          <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/90">
            <button
              onClick={() => setShowSpecDrawer(false)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition shadow-2xs group"
              title="Go back to 3D Design (Esc)"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to 3D View</span>
            </button>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Furniture Specs
            </h3>
            <span className="text-xs text-sky-600 font-mono font-bold">
              {plan.furniture.length} Pieces
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-2 custom-scrollbar">
            {plan.furniture.map((f) => {
              const isColliding = collidingItemIds.has(f.id);
              const isSelected = selectedId === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className={`border rounded-xl p-2.5 flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-300 text-slate-900 shadow-xs font-semibold'
                      : isColliding
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1 border border-slate-200">
                      {f.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.icon} alt={f.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-sky-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span className="truncate max-w-[130px]">{f.name}</span>
                        {isColliding && (
                          <span className="text-[9px] px-1 rounded bg-rose-600 text-white font-bold">
                            Collision
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {Math.round(f.width)}×{Math.round(f.depth)}×{Math.round(f.height)} cm
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFurniture(f.id);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title="Delete Furniture Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200">
            {consultationBooked ? (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Consultation request sent to design team!</span>
              </div>
            ) : (
              <button
                onClick={() => setConsultationBooked(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm border border-emerald-700/20 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Request Quotation / Approval</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* FLOATING DRAGGABLE & COLLAPSIBLE ITEM CUSTOMIZER */}
      {selectedFurniture && isMinimized && (
        <div
          style={{ left: `${panelPos.x}px`, top: `${panelPos.y}px` }}
          className="absolute z-30 bg-white/95 border border-slate-200 px-3.5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in select-none cursor-grab active:cursor-grabbing border-sky-200"
          onMouseDown={handleStartDrag}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-slate-400" />
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Move className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 max-w-[150px] truncate">
                {selectedFurniture.name}
              </div>
              <div className="text-[10px] text-sky-700 font-mono font-semibold">
                {Math.round(selectedFurniture.width)}×{Math.round(selectedFurniture.depth)}×{Math.round(selectedFurniture.height)} cm
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              title="Expand full properties panel"
            >
              <Maximize2 className="w-4 h-4 text-sky-600" />
            </button>
            <button
              onClick={() => setSelectedId(null)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FULL DRAGGABLE ITEM CUSTOMIZER PANEL */}
      {selectedFurniture && !isMinimized && (
        <div
          style={{ left: `${panelPos.x}px`, top: `${panelPos.y}px` }}
          className="absolute z-30 w-76 sm:w-80 bg-white/95 border border-slate-200/90 rounded-3xl shadow-2xl p-4 flex flex-col gap-3 backdrop-blur-2xl animate-in zoom-in-95 duration-150 select-none border-sky-100"
        >
          {/* Draggable Header */}
          <div
            onMouseDown={handleStartDrag}
            className="flex items-center justify-between pb-2 border-b border-slate-100 cursor-grab active:cursor-grabbing"
            title="Click and drag anywhere on screen"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                <Move className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                  {selectedFurniture.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  ⠿ Drag to move anywhere
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                title="Minimize menu"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Dock Presets */}
          <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
            <span className="font-semibold px-1 text-slate-400 flex items-center gap-0.5">
              <Pin className="w-3 h-3" /> Dock:
            </span>
            <button
              onClick={() => dockPanel('bottom-left')}
              className="flex-1 py-0.5 rounded-lg hover:bg-white hover:text-slate-800 hover:shadow-2xs transition font-semibold"
            >
              Bottom-L
            </button>
            <button
              onClick={() => dockPanel('bottom-right')}
              className="flex-1 py-0.5 rounded-lg hover:bg-white hover:text-slate-800 hover:shadow-2xs transition font-semibold"
            >
              Bottom-R
            </button>
            <button
              onClick={() => dockPanel('top-right')}
              className="flex-1 py-0.5 rounded-lg hover:bg-white hover:text-slate-800 hover:shadow-2xs transition font-semibold"
            >
              Top-R
            </button>
          </div>

          {/* Collision Warning if overlapping */}
          {isSelectedColliding && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Overlapping obstacle! Glowing red in 3D.</span>
            </div>
          )}

          {/* Elevation & Sill Height Control */}
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-1.5">
              <span>Elevation / Sill Height</span>
              <span className="font-mono text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 text-[10px]">
                {Math.round(selectedFurniture.elevation || 0)} cm above floor
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustDimension('elevation', -10)}
                className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs"
                title="Lower (-10cm)"
              >
                -10cm
              </button>
              <input
                type="range"
                min="0"
                max="260"
                step="5"
                value={selectedFurniture.elevation || 0}
                onChange={(e) => updateSelected({ elevation: parseFloat(e.target.value) })}
                className="flex-1 accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => adjustDimension('elevation', 10)}
                className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs"
                title="Raise (+10cm)"
              >
                +10cm
              </button>
            </div>
          </div>

          {/* Size & Scale Controls */}
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-1.5">
              <span>Size & Scale</span>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                {Math.round(selectedFurniture.width)}×{Math.round(selectedFurniture.depth)}×{Math.round(selectedFurniture.height)} cm
              </span>
            </div>

            {/* Quick Dimension Controls */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">W ({Math.round(selectedFurniture.width)})</span>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => adjustDimension('width', -5)}
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustDimension('width', 5)}
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">D ({Math.round(selectedFurniture.depth)})</span>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => adjustDimension('depth', -5)}
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustDimension('depth', 5)}
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">H ({Math.round(selectedFurniture.height)})</span>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => adjustDimension('height', -5)}
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustDimension('height', 5)}
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pick & Move Nudge Controls */}
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl shadow-xs">
            <label className="text-[11px] font-bold text-slate-800 block mb-1.5">
              Nudge Position (20cm)
            </label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => nudgeItem(-20, 0)}
                className="p-1.5 rounded-xl bg-white hover:bg-sky-600 text-slate-700 hover:text-white transition active:scale-90 border border-slate-200 shadow-2xs"
                title="Move Left / West (-20cm)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => nudgeItem(0, -20)}
                  className="p-1.5 rounded-xl bg-white hover:bg-sky-600 text-slate-700 hover:text-white transition active:scale-90 border border-slate-200 shadow-2xs"
                  title="Move North (-20cm)"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => nudgeItem(0, 20)}
                  className="p-1.5 rounded-xl bg-white hover:bg-sky-600 text-slate-700 hover:text-white transition active:scale-90 border border-slate-200 shadow-2xs"
                  title="Move South (+20cm)"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => nudgeItem(20, 0)}
                className="p-1.5 rounded-xl bg-white hover:bg-sky-600 text-slate-700 hover:text-white transition active:scale-90 border border-slate-200 shadow-2xs"
                title="Move Right / East (+20cm)"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-1.5">
              <span>Rotation Angle</span>
              <span className="font-mono text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 text-[10px]">
                {Math.round(((selectedFurniture.angle || 0) * 180) / Math.PI)}°
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => rotateItem(-Math.PI / 4)}
                className="p-1.5 rounded-xl bg-white hover:bg-sky-600 text-slate-700 hover:text-white transition border border-slate-200 shadow-2xs"
                title="Rotate -45°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.05"
                value={selectedFurniture.angle || 0}
                onChange={(e) => updateSelected({ angle: parseFloat(e.target.value) })}
                className="flex-1 accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => rotateItem(Math.PI / 4)}
                className="p-1.5 rounded-xl bg-white hover:bg-sky-600 text-slate-700 hover:text-white transition border border-slate-200 shadow-2xs"
                title="Rotate +45°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Color Finish Picker */}
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl shadow-xs">
            <label className="text-[11px] font-bold text-slate-800 block mb-1.5">
              Finish Color
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CLIENT_PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateSelected({ color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-lg border transition-all ${
                    selectedFurniture.color === c
                      ? 'border-sky-600 scale-125 shadow-md ring-2 ring-sky-300'
                      : 'border-slate-300 hover:scale-110 shadow-2xs'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Duplicate & Delete Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              onClick={duplicateSelected}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-slate-200 shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-sky-600" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={() => handleDeleteFurniture(selectedFurniture.id)}
              className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
              title="Delete this furniture item"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Item</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Notification when item is added to room */}
      {justAddedItemName && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 bg-slate-900/95 text-white rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-medium">
            Placed <span className="font-bold text-sky-300">"{justAddedItemName}"</span> in your 3D design!
          </div>
          <button
            onClick={() => setShowAddCatalogDrawer(true)}
            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition ml-1"
          >
            + Add Another
          </button>
          <button
            onClick={() => setJustAddedItemName(null)}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive 2D Tour Mini-Map HUD with Glowing Client View Pointer */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        {showMiniMap ? (
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-2.5 flex flex-col gap-2 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 shadow-sm shadow-sky-500/80 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-800 tracking-tight">Client Tour Radar</span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">L{activeFloor}</span>
              </div>
              <button
                onClick={() => setShowMiniMap(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                title="Minimize Mini-Map"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
              <canvas
                ref={miniMapCanvasRef}
                width={190}
                height={150}
                onClick={handleMiniMapClick}
                className="block cursor-crosshair"
                title="Click anywhere to teleport in 3D"
              />
              <div className="absolute bottom-1 right-1.5 text-[9px] font-semibold text-slate-400 pointer-events-none">
                Click to Move
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowMiniMap(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-700 rounded-xl shadow-lg border border-slate-200 backdrop-blur-xl text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-black/5"
            title="Open Tour Mini-Map"
          >
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Show Mini-Map</span>
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse ml-0.5" />
          </button>
        )}
      </div>

      {/* Floating Tour Guidance at Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 bg-white/95 rounded-full border border-slate-200 text-xs text-slate-700 shadow-md backdrop-blur-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Walk near Doors & Windows to auto-open • Click 3D pieces to customize</span>
      </div>
    </div>
  );
};
