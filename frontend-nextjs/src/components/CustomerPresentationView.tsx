'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
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
  Search
} from 'lucide-react';
import { HomePlan, Room, CatalogItem, FurnitureItem } from '../types/plan';
import { isTabletopItem, findNearestSupportingSurface } from '../services/tabletopAttachment';
import { Viewport3D } from './Viewport3D';

interface CustomerPresentationViewProps {
  plan: HomePlan;
  catalog: CatalogItem[];
  onUpdatePlan: (plan: HomePlan) => void;
  onSwitchToStudio: () => void;
  onOpenShare: () => void;
  collidingItemIds: Set<string>;
  activeFloor: number;
  onFloorChange: (floor: number) => void;
  floorMode?: 'single' | 'sideBySide' | 'stacked';
  onFloorModeChange?: (mode: 'single' | 'sideBySide' | 'stacked') => void;
}

const CLIENT_PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#94a3b8', '#1e293b', '#0284c7',
  '#38bdf8', '#059669', '#10b981', '#f59e0b', '#ef4444',
  '#7c3aed', '#78350f', '#d97706'
];

export const CustomerPresentationView: React.FC<CustomerPresentationViewProps> = ({
  plan,
  catalog,
  onUpdatePlan,
  onSwitchToStudio,
  onOpenShare,
  collidingItemIds,
  activeFloor,
  onFloorChange,
  floorMode,
  onFloorModeChange,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(plan.rooms[0] || null);
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
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');

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

  // Adjust dimension
  const adjustDimension = (prop: 'width' | 'depth' | 'height', delta: number) => {
    if (!selectedFurniture) return;
    const current = selectedFurniture[prop];
    const updated = Math.max(10, Math.round(current + delta));
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
    let targetElevation = 0;
    let hostId: string | undefined = undefined;

    if (selectedRoom && selectedRoom.points.length > 0) {
      const xs = selectedRoom.points.map((p) => p.x);
      const ys = selectedRoom.points.map((p) => p.y);
      targetX = Math.round((Math.min(...xs) + Math.max(...xs)) / 2);
      targetY = Math.round((Math.min(...ys) + Math.max(...ys)) / 2);
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
        />
      </div>

      {/* Top Virtual Tour Header Bar */}
      <header className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto bg-white/95 px-3.5 py-2 rounded-2xl shadow-md flex items-center gap-2.5 border border-slate-200 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-extrabold text-slate-900 tracking-tight truncate max-w-[170px]">
                {plan.name}
              </h1>
              <span className="text-[9px] font-bold uppercase px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                🚶 Human Eye-Level (1.6m)
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              WASD or Arrow Keys to walk • Click items to move, recolor, or add pieces
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

          <button
            onClick={onSwitchToStudio}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm border border-sky-700/20 transition active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>CAD Studio</span>
          </button>
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

      {/* Floating Tour Guidance at Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 bg-white/95 rounded-full border border-slate-200 text-xs text-slate-700 shadow-md backdrop-blur-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Click 3D pieces to customize • Use "+ Add 3D Items" to furnish room</span>
      </div>
    </div>
  );
};
