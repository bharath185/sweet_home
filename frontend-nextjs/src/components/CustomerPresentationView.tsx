'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
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
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  Pin
} from 'lucide-react';
import { HomePlan, Room, CatalogItem, FurnitureItem } from '../types/plan';
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
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(plan.rooms[0] || null);
  const [showSpecDrawer, setShowSpecDrawer] = useState<boolean>(false);
  const [consultationBooked, setConsultationBooked] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  const isSelectedColliding = selectedFurniture ? collidingItemIds.has(selectedFurniture.id) : false;

  // Delete Item (if client wants to remove an unwanted item)
  const handleDeleteFurniture = (id: string) => {
    const item = plan.furniture.find((f) => f.id === id);
    if (item?.isLocked) {
      alert(`⚠️ Cannot delete "${item.name}": This item is LOCKED.\nPlease unlock it first before deleting.`);
      return;
    }
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.filter((f) => f.id !== id),
      updatedAt: new Date().toISOString(),
    });
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  // Update Selected Furniture Properties
  const updateSelected = (patch: Partial<FurnitureItem>) => {
    if (!selectedFurniture) return;
    const updated = plan.furniture.map((f) =>
      f.id === selectedFurniture.id ? { ...f, ...patch } : f
    );
    onUpdatePlan({
      ...plan,
      furniture: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Move / Nudge Selected Item
  const nudgeItem = (dx: number, dy: number) => {
    if (!selectedFurniture) return;
    updateSelected({
      x: Math.round(selectedFurniture.x + dx),
      y: Math.round(selectedFurniture.y + dy),
    });
  };

  // Rotate Selected Item
  const rotateItem = (deltaAngle: number) => {
    if (!selectedFurniture) return;
    const newAngle = ((selectedFurniture.angle || 0) + deltaAngle + Math.PI * 2) % (Math.PI * 2);
    updateSelected({ angle: newAngle });
  };

  // Scale Item Up / Down by percentage
  const scaleItem = (multiplier: number) => {
    if (!selectedFurniture) return;
    updateSelected({
      width: Math.max(10, Math.round(selectedFurniture.width * multiplier)),
      depth: Math.max(10, Math.round(selectedFurniture.depth * multiplier)),
      height: Math.max(10, Math.round(selectedFurniture.height * multiplier)),
    });
  };

  // Adjust individual dimension
  const adjustDimension = (dim: 'width' | 'depth' | 'height', delta: number) => {
    if (!selectedFurniture) return;
    updateSelected({
      [dim]: Math.max(10, Math.round(selectedFurniture[dim] + delta)),
    });
  };

  // Duplicate Selected Item
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
        />
      </div>

      {/* Top Virtual Tour Header Bar */}
      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-white/95 px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-3 border border-slate-200 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">{plan.name}</h1>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                🚶 Human Eye-Level Tour (165 cm)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              WASD / Arrow Keys to walk • Drag mouse to look around • Click pieces to customize finish
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowSpecDrawer(!showSpecDrawer)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xl border transition shadow-xs ${
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs border border-slate-200 transition"
          >
            <Share2 className="w-4 h-4 text-sky-600" />
            <span>Share 3D</span>
          </button>

          <button
            onClick={onSwitchToStudio}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm border border-sky-700/20 transition active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Open CAD Studio</span>
          </button>
        </div>
      </header>

      {/* Collision Alert Pill (Non-overlapping at bottom-left) */}
      {collidingItemIds.size > 0 && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-rose-600 text-white backdrop-blur-xl px-4 py-1.5 rounded-full shadow-lg border border-rose-500 text-xs font-bold animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span>
            {collidingItemIds.size} {collidingItemIds.size === 1 ? 'Item' : 'Items'} in Collision & Glowing Red
          </span>
        </div>
      )}

      {/* Floor & Room Selector at Top Center */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/95 p-1.5 rounded-full border border-slate-200 shadow-md backdrop-blur-xl text-xs">
        {(plan.floors || [
          { level: 0, name: 'Ground Floor' },
          { level: 1, name: '1st Floor' }
        ]).map((fl) => (
          <button
            key={fl.level}
            onClick={() => onFloorChange(fl.level)}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              activeFloor === fl.level
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {fl.name}
          </button>
        ))}

        {plan.rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
              selectedRoom?.id === room.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>{room.name}</span>
          </button>
        ))}
      </div>

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
              title="Deselect item"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selectedFurniture && !isMinimized && (
        <div
          style={{ left: `${panelPos.x}px`, top: `${panelPos.y}px` }}
          className="absolute z-30 bg-white/95 border border-slate-200 p-3.5 rounded-2xl shadow-2xl w-84 max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
        >
          {/* Draggable Header */}
          <div
            onMouseDown={handleStartDrag}
            className={`flex items-center justify-between border-b border-slate-200 pb-2.5 cursor-grab select-none ${
              isDraggingPanel ? 'cursor-grabbing' : ''
            }`}
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
                title="Minimize menu (leave screen unobstructed)"
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

            {/* Quick Scale Buttons */}
            <div className="flex items-center gap-1.5 mb-2">
              <button
                onClick={() => scaleItem(0.9)}
                className="flex-1 py-1 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition text-center border border-slate-200 shadow-2xs"
                title="Scale Down (-10%)"
              >
                -10% Size
              </button>
              <button
                onClick={() => scaleItem(1.1)}
                className="flex-1 py-1 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition text-center shadow-2xs"
                title="Scale Up (+10%)"
              >
                +10% Size
              </button>
            </div>

            {/* Dimension Steppers */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
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

      {/* Slide-out Furniture & Specifications Drawer (WITH DELETE & SELECT CONTROLS) */}
      {showSpecDrawer && (
        <div className="absolute top-20 right-4 bottom-24 w-84 bg-white/95 border border-slate-200 rounded-2xl shadow-xl z-20 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 backdrop-blur-xl">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Furniture Specifications
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

      {/* Floating Tour Guidance at Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-white/95 rounded-full border border-slate-200 text-xs text-slate-700 shadow-md backdrop-blur-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Click any 3D piece to pick, move, rotate, recolor, or delete • Overlapping items glow RED</span>
      </div>
    </div>
  );
};
