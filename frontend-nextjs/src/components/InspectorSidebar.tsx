'use client';

import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Move,
  Maximize,
  Palette,
  Trash2,
  Copy,
  Layers,
  Square,
  AlertTriangle,
  RotateCw,
  RotateCcw,
  Lock,
  Unlock,
  ArrowUpRight,
  Compass,
  Sparkles,
  Sun,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  Check,
  Eye,
  Sliders,
  Flame,
  Droplets,
  Box,
  X,
  Search,
  Armchair,
  Bed,
  UtensilsCrossed,
  Bath,
  DoorOpen,
  Building2,
  ChevronRight,
  ChevronLeft,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { HomePlan, FurnitureItem, Wall, CatalogItem } from '../types/plan';
import { isTabletopItem, findSupportingHost, findNearestSupportingSurface } from '../services/tabletopAttachment';
import { fallbackCatalog } from '../services/api';

interface InspectorSidebarProps {
  plan: HomePlan;
  selectedId: string | null;
  onUpdatePlan: (updated: HomePlan) => void;
  onSelectId: (id: string | null) => void;
  collidingItemIds?: Set<string>;
  collisionReasons?: Map<string, string>;
  catalog?: CatalogItem[];
  onAddItem?: (item: CatalogItem) => void;
  theme?: 'dark' | 'light';
  isOpen?: boolean;
  onToggleOpen?: () => void;
  isWalkMode?: boolean;
}

interface MaterialSwatch {
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  opacity?: number;
}

const MATERIAL_LIBRARIES: { [cat: string]: { label: string; icon: any; swatches: MaterialSwatch[] } } = {
  wood: {
    label: 'Wood & Timber',
    icon: Box,
    swatches: [
      { name: 'Natural Oak', color: '#d4a373', roughness: 0.7, metalness: 0.05 },
      { name: 'American Walnut', color: '#5c3d2e', roughness: 0.45, metalness: 0.05 },
      { name: 'Rich Teak', color: '#8c5a3c', roughness: 0.5, metalness: 0.05 },
      { name: 'Smoked Ash', color: '#3e3835', roughness: 0.6, metalness: 0.08 },
      { name: 'Blonde Birch', color: '#ece0d1', roughness: 0.8, metalness: 0.02 },
      { name: 'Espresso Wenge', color: '#271c19', roughness: 0.4, metalness: 0.05 },
    ],
  },
  fabric: {
    label: 'Fabrics & Velvet',
    icon: Sparkles,
    swatches: [
      { name: 'Cream Bouclé', color: '#f5f5f0', roughness: 0.9, metalness: 0.02 },
      { name: 'Royal Navy Velvet', color: '#1e3a8a', roughness: 0.5, metalness: 0.2 },
      { name: 'Emerald Velvet', color: '#064e3b', roughness: 0.5, metalness: 0.2 },
      { name: 'Heather Grey Tweed', color: '#64748b', roughness: 0.85, metalness: 0.05 },
      { name: 'Mustard Linen', color: '#d97706', roughness: 0.8, metalness: 0.02 },
      { name: 'Blush Velvet', color: '#e11d48', roughness: 0.55, metalness: 0.15 },
    ],
  },
  leather: {
    label: 'Fine Leathers',
    icon: Flame,
    swatches: [
      { name: 'Cognac Saddle', color: '#9a3412', roughness: 0.45, metalness: 0.1 },
      { name: 'Caramel Napa', color: '#b45309', roughness: 0.4, metalness: 0.1 },
      { name: 'Jet Black Nappa', color: '#18181b', roughness: 0.35, metalness: 0.15 },
      { name: 'Vintage Espresso', color: '#3e2723', roughness: 0.5, metalness: 0.1 },
      { name: 'Ivory White', color: '#fafaf9', roughness: 0.4, metalness: 0.05 },
      { name: 'Oxblood Red', color: '#881337', roughness: 0.4, metalness: 0.12 },
    ],
  },
  metal: {
    label: 'Metals & Finishes',
    icon: Sliders,
    swatches: [
      { name: 'Brushed Brass', color: '#eab308', roughness: 0.25, metalness: 0.85 },
      { name: 'Polished Chrome', color: '#cbd5e1', roughness: 0.08, metalness: 0.95 },
      { name: 'Matte Obsidian', color: '#1e293b', roughness: 0.6, metalness: 0.7 },
      { name: 'Rose Copper', color: '#fb7185', roughness: 0.2, metalness: 0.8 },
      { name: 'Gunmetal Titanium', color: '#475569', roughness: 0.3, metalness: 0.85 },
      { name: 'Champagne Gold', color: '#fef08a', roughness: 0.2, metalness: 0.9 },
    ],
  },
  stone: {
    label: 'Stone & Marble',
    icon: Droplets,
    swatches: [
      { name: 'Carrara White', color: '#f1f5f9', roughness: 0.15, metalness: 0.05 },
      { name: 'Nero Marquina', color: '#0f172a', roughness: 0.2, metalness: 0.05 },
      { name: 'Travertine Beige', color: '#e2d9cc', roughness: 0.5, metalness: 0.02 },
      { name: 'Terrazzo Fleck', color: '#cbd5e1', roughness: 0.4, metalness: 0.05 },
      { name: 'Emerald Marble', color: '#064e3b', roughness: 0.18, metalness: 0.08 },
      { name: 'Grey Granite', color: '#64748b', roughness: 0.55, metalness: 0.05 },
    ],
  },
  glass: {
    label: 'Glass & Acrylic',
    icon: Sparkles,
    swatches: [
      { name: 'Clear Crystal', color: '#e0f2fe', roughness: 0.05, metalness: 0.1, opacity: 0.35 },
      { name: 'Smoked Obsidian', color: '#1e293b', roughness: 0.1, metalness: 0.15, opacity: 0.5 },
      { name: 'Frosted White', color: '#f8fafc', roughness: 0.4, metalness: 0.05, opacity: 0.65 },
      { name: 'Amber Tint', color: '#d97706', roughness: 0.05, metalness: 0.1, opacity: 0.4 },
      { name: 'Emerald Glass', color: '#065f46', roughness: 0.05, metalness: 0.2, opacity: 0.38 },
      { name: 'Sapphire Glass', color: '#1e40af', roughness: 0.05, metalness: 0.2, opacity: 0.38 },
    ],
  },
};

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#1e293b',
  '#0284c7', '#38bdf8', '#059669', '#10b981', '#d97706', '#f59e0b',
  '#dc2626', '#ef4444', '#7c3aed', '#a855f7', '#78350f', '#b45309'
];

const CATALOG_CATEGORIES = [
  { id: 'All', name: 'All Models', icon: Building2 },
  { id: 'Living', name: 'Living', icon: Armchair },
  { id: 'Bedroom', name: 'Bedroom', icon: Bed },
  { id: 'Kitchen', name: 'Kitchen', icon: UtensilsCrossed },
  { id: 'Bathroom', name: 'Bath', icon: Bath },
  { id: 'Lighting', name: 'Lighting', icon: Lightbulb },
  { id: 'Doors & Windows', name: 'Doors', icon: DoorOpen },
  { id: 'Wall Designs', name: 'Walls', icon: Sparkles },
  { id: 'Shelves & Storage', name: 'Storage', icon: Box },
  { id: 'Decor & Plants', name: 'Decor', icon: Sparkles },
  { id: 'Stairs & Structural', name: 'Structural', icon: Layers },
];

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  plan,
  selectedId,
  onUpdatePlan,
  onSelectId,
  collidingItemIds = new Set(),
  collisionReasons = new Map(),
  catalog = fallbackCatalog,
  onAddItem,
  theme = 'dark',
  isOpen,
  onToggleOpen,
  isWalkMode = false,
}) => {
  const selectedFurniture = plan.furniture.find((f) => f.id === selectedId);
  const selectedWall = plan.walls.find((w) => w.id === selectedId);
  const selectedRoom = plan.rooms.find((r) => r.id === selectedId);
  const selectedDimension = (plan.dimensionLines || []).find((d) => d.id === selectedId);
  const selectedNote = (plan.textNotes || []).find((n) => n.id === selectedId);
  const isColliding = selectedFurniture ? collidingItemIds.has(selectedFurniture.id) : false;
  const collisionReason = selectedFurniture ? collisionReasons.get(selectedFurniture.id) : undefined;

  // activeTab is null when closed; or 'catalog' | 'design' | 'transform'
  const [activeTab, setActiveTab] = useState<'catalog' | 'design' | 'transform' | null>(null);
  const [activeMatCategory, setActiveMatCategory] = useState<string>('wood');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('All');

  // If in Walk mode, force collapse properties and finish panels
  useEffect(() => {
    if (isWalkMode) {
      setActiveTab(null);
    }
  }, [isWalkMode]);

  // Automatically open Properties panel when any item, wall, or room is selected (in Orbit / 2D mode),
  // and collapse the properties/finish panel when deselected (e.g. in Walk mode or clicking background)
  useEffect(() => {
    if (isWalkMode) {
      setActiveTab(null);
      return;
    }
    if (selectedFurniture || selectedWall || selectedRoom) {
      setActiveTab('transform');
    } else if (!selectedId) {
      setActiveTab((prev) => (prev === 'transform' || prev === 'design' ? null : prev));
    }
  }, [selectedId, selectedFurniture, selectedWall, selectedRoom, isWalkMode]);

  const isDark = theme === 'dark';

  const filteredCatalogItems = catalog.filter((item) => {
    const matchCat =
      selectedCatalogCategory === 'All' || item.category.toLowerCase() === selectedCatalogCategory.toLowerCase();
    const matchSearch =
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const updateFurniture = (patch: Partial<FurnitureItem>) => {
    if (!selectedFurniture) return;
    const updated = plan.furniture.map((f) =>
      f.id === selectedFurniture.id ? { ...f, ...patch } : f
    );
    onUpdatePlan({ ...plan, furniture: updated, updatedAt: new Date().toISOString() });
  };

  const updateWall = (patch: Partial<Wall>) => {
    if (!selectedWall) return;
    const updated = plan.walls.map((w) =>
      w.id === selectedWall.id ? { ...w, ...patch } : w
    );
    onUpdatePlan({ ...plan, walls: updated, updatedAt: new Date().toISOString() });
  };

  const handleDuplicate = () => {
    if (selectedFurniture) {
      const copy: FurnitureItem = {
        ...selectedFurniture,
        id: `f_${Date.now()}`,
        name: `${selectedFurniture.name} (Copy)`,
        x: selectedFurniture.x + 30,
        y: selectedFurniture.y + 30,
      };
      onUpdatePlan({
        ...plan,
        furniture: [...plan.furniture, copy],
        updatedAt: new Date().toISOString(),
      });
      onSelectId(copy.id);
    }
  };

  const handleDelete = () => {
    if (selectedFurniture) {
      if (selectedFurniture.isLocked) {
        alert(`⚠️ Cannot delete "${selectedFurniture.name}": This item is LOCKED. Please unlock first.`);
        return;
      }
      onUpdatePlan({
        ...plan,
        furniture: plan.furniture.filter((f) => f.id !== selectedFurniture.id),
        updatedAt: new Date().toISOString(),
      });
      onSelectId(null);
    } else if (selectedWall) {
      onUpdatePlan({
        ...plan,
        walls: plan.walls.filter((w) => w.id !== selectedWall.id),
        updatedAt: new Date().toISOString(),
      });
      onSelectId(null);
    } else if (selectedRoom) {
      onUpdatePlan({
        ...plan,
        rooms: plan.rooms.filter((r) => r.id !== selectedRoom.id),
        updatedAt: new Date().toISOString(),
      });
      onSelectId(null);
    } else if (selectedDimension) {
      onUpdatePlan({
        ...plan,
        dimensionLines: (plan.dimensionLines || []).filter((d) => d.id !== selectedDimension.id),
        updatedAt: new Date().toISOString(),
      });
      onSelectId(null);
    } else if (selectedNote) {
      onUpdatePlan({
        ...plan,
        textNotes: plan.textNotes?.filter((n) => n.id !== selectedNote.id),
        updatedAt: new Date().toISOString(),
      });
      onSelectId(null);
    }
  };

  const wallLength = selectedWall
    ? Math.round(Math.hypot(selectedWall.xEnd - selectedWall.xStart, selectedWall.yEnd - selectedWall.yStart))
    : 0;

  // Degrees to/from radians
  const currentAngleDeg = selectedFurniture
    ? Math.round(((selectedFurniture.angle || 0) * 180) / Math.PI) % 360
    : 0;
  const normalizedDeg = currentAngleDeg < 0 ? currentAngleDeg + 360 : currentAngleDeg;

  return (
    <div className="relative flex h-full select-none shrink-0 font-sans z-30">
      {/* =========================================================================
          1. FOCUSED DRAWER PANE: Absolute Overlay with high z-index (z-40)
          Floating smoothly over the canvas without resizing/disturbing the design viewport
          ========================================================================= */}
      {activeTab !== null && (
        <aside
          className={`absolute right-10 top-0 bottom-0 w-80 border-l border-r-0 shadow-2xl flex flex-col h-full z-40 transition-all animate-in slide-in-from-right-3 duration-150 ${
            isDark
              ? 'bg-[#0a1120]/95 backdrop-blur-xl border-slate-800 text-slate-200'
              : 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-800'
          }`}
        >
          {/* Top Focused Header with Title & Close [X] */}
          <div
            className={`h-10 px-3 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'border-slate-800 bg-[#080d19]' : 'border-slate-200 bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold truncate">
              {activeTab === 'catalog' && (
                <>
                  <Box className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>3D Models Catalog</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-mono ${
                    isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {filteredCatalogItems.length}
                  </span>
                </>
              )}
              {activeTab === 'design' && (
                <>
                  <Palette className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">
                    {selectedFurniture ? `3D Finish: ${selectedFurniture.name}` : '3D Finish & Materials'}
                  </span>
                </>
              )}
              {activeTab === 'transform' && (
                <>
                  <Maximize className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">
                    {selectedFurniture
                      ? `Properties: ${selectedFurniture.name}`
                      : selectedWall
                      ? 'Properties: Selected Wall'
                      : 'Object Properties'}
                  </span>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActiveTab(null)}
              className={`p-1 rounded-sm transition cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Close panel (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* =====================================================================
              TAB CONTENT 1: 3D CATALOG ONLY
              ===================================================================== */}
          {activeTab === 'catalog' && (
            <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
              {/* Live Search */}
              <div className="p-2.5 border-b border-inherit">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search furniture, fixtures & decor..."
                    className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-sm border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  {catalogSearch && (
                    <button
                      onClick={() => setCatalogSearch('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="p-2 border-b border-inherit overflow-x-auto flex gap-1 custom-scrollbar shrink-0">
                {CATALOG_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCatalogCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatalogCategory(cat.id)}
                      className={`px-2 py-1 rounded-sm text-[10px] font-semibold flex items-center gap-1 whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : isDark
                          ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Models List */}
              <div className="flex-1 p-2 space-y-1.5 overflow-y-auto custom-scrollbar">
                {filteredCatalogItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No models found matching "{catalogSearch}".
                  </div>
                ) : (
                  filteredCatalogItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(item));
                      }}
                      className={`p-2 rounded-sm border transition flex items-center justify-between gap-2 group cursor-grab active:cursor-grabbing ${
                        isDark
                          ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 hover:border-indigo-500/50'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${
                            isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                          }`}
                        >
                          <Box className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold truncate leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {item.width} × {item.depth} × {item.height} cm
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-wider hidden sm:inline-block ${
                          isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.category}
                        </span>
                        {onAddItem && (
                          <button
                            onClick={() => onAddItem(item)}
                            className="px-2 py-1 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition shadow-2xs cursor-pointer flex items-center gap-0.5"
                            title="Add model to floorplan"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB CONTENT 2: 3D FINISH & MATERIALS ONLY
              ===================================================================== */}
          {activeTab === 'design' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar text-xs">
              {!selectedFurniture ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Palette className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                  <p className="font-semibold">No 3D Model Selected</p>
                  <p className="text-[11px] text-slate-500">
                    Click any furniture or fixture on the floorplan to customize its materials, colors, and PBR finish.
                  </p>
                </div>
              ) : (
                <>
                  {/* PBR Texture Material Library Category Tabs */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>PBR Material Presets</span>
                      <span className="text-[10px] text-indigo-400 lowercase">
                        {MATERIAL_LIBRARIES[activeMatCategory]?.label}
                      </span>
                    </label>

                    <div className="grid grid-cols-3 gap-1">
                      {Object.entries(MATERIAL_LIBRARIES).map(([key, lib]) => (
                        <button
                          key={key}
                          onClick={() => setActiveMatCategory(key)}
                          className={`py-1.5 px-1 rounded-sm text-[10px] font-semibold border transition capitalize truncate cursor-pointer ${
                            activeMatCategory === key
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : isDark
                              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {lib.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    {/* Material Swatches Grid */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                      {MATERIAL_LIBRARIES[activeMatCategory]?.swatches.map((swatch) => {
                        const isCurrent =
                          selectedFurniture.color?.toLowerCase() === swatch.color.toLowerCase();
                        return (
                          <button
                            key={swatch.name}
                            onClick={() => {
                              updateFurniture({
                                color: swatch.color,
                                roughness: swatch.roughness,
                                metalness: swatch.metalness,
                                opacity: swatch.opacity ?? 1.0,
                              });
                            }}
                            className={`p-1.5 rounded-sm border text-left flex items-center gap-2 transition cursor-pointer ${
                              isCurrent
                                ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-950/20'
                                : isDark
                                ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div
                              className="w-5 h-5 rounded-xs border border-white/20 shrink-0 shadow-2xs"
                              style={{ backgroundColor: swatch.color }}
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-[10px] truncate leading-tight">
                                {swatch.name}
                              </div>
                              <div className="text-[9px] text-slate-400">
                                R: {swatch.roughness} | M: {swatch.metalness}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="space-y-1.5 pt-2 border-t border-inherit">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Custom Color Tint
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedFurniture.color || '#3b82f6'}
                        onChange={(e) => updateFurniture({ color: e.target.value })}
                        className="w-8 h-8 rounded-sm border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={selectedFurniture.color || '#3b82f6'}
                        onChange={(e) => updateFurniture({ color: e.target.value })}
                        className={`flex-1 px-2.5 py-1 text-xs font-mono rounded-sm border focus:outline-none ${
                          isDark
                            ? 'bg-slate-900 border-slate-800 text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Quick Swatches */}
                    <div className="grid grid-cols-9 gap-1 pt-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateFurniture({ color: c })}
                          style={{ backgroundColor: c }}
                          className={`w-full h-5 rounded-xs border transition hover:scale-110 cursor-pointer ${
                            selectedFurniture.color?.toLowerCase() === c.toLowerCase()
                              ? 'border-indigo-500 ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900'
                              : 'border-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Surface Material Roughness & Metalness */}
                  <div className="space-y-3 pt-2 border-t border-inherit">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold">Roughness (Matte vs Gloss)</span>
                        <span className="font-mono text-indigo-400">
                          {Math.round((selectedFurniture.roughness ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={selectedFurniture.roughness ?? 0.5}
                        onChange={(e) => updateFurniture({ roughness: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold">Metallic Reflection</span>
                        <span className="font-mono text-indigo-400">
                          {Math.round((selectedFurniture.metalness ?? 0.1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={selectedFurniture.metalness ?? 0.1}
                        onChange={(e) => updateFurniture({ metalness: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB CONTENT 3: SIZE, POSITION & TRANSFORM ONLY
              ===================================================================== */}
          {activeTab === 'transform' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar text-xs">
              {!selectedFurniture && !selectedWall ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Maximize className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                  <p className="font-semibold">No Object Selected</p>
                  <p className="text-[11px] text-slate-500">
                    Click any furniture, wall, or fixture on the canvas to inspect its exact dimensions, position, and orientation.
                  </p>
                </div>
              ) : selectedFurniture ? (
                <>
                  {/* Object Name & Actions Header */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={selectedFurniture.name}
                      onChange={(e) => updateFurniture({ name: e.target.value })}
                      className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-sm border focus:outline-none ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Dimensions (W x D x H in cm) */}
                  <div className="space-y-1.5 pt-2 border-t border-inherit">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Dimensions (cm)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Width (X)</span>
                        <input
                          type="number"
                          value={selectedFurniture.width}
                          onChange={(e) => updateFurniture({ width: Math.max(5, parseInt(e.target.value) || 0) })}
                          className={`w-full px-2 py-1 text-xs font-mono rounded-sm border ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Depth (Y)</span>
                        <input
                          type="number"
                          value={selectedFurniture.depth}
                          onChange={(e) => updateFurniture({ depth: Math.max(5, parseInt(e.target.value) || 0) })}
                          className={`w-full px-2 py-1 text-xs font-mono rounded-sm border ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Height (Z)</span>
                        <input
                          type="number"
                          value={selectedFurniture.height}
                          onChange={(e) => updateFurniture({ height: Math.max(5, parseInt(e.target.value) || 0) })}
                          className={`w-full px-2 py-1 text-xs font-mono rounded-sm border ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Scale Quick Buttons */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[-25, -10, 10, 25].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => {
                            const factor = 1 + pct / 100;
                            updateFurniture({
                              width: Math.round(selectedFurniture.width * factor),
                              depth: Math.round(selectedFurniture.depth * factor),
                              height: Math.round(selectedFurniture.height * factor),
                            });
                          }}
                          className={`py-1 text-[10px] font-bold rounded-sm border transition cursor-pointer ${
                            isDark
                              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {pct > 0 ? `+${pct}%` : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Surface Placement Mode */}
                  <div className="space-y-1.5 pt-2 border-t border-inherit">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Placement Surface
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { id: 'floor', label: 'Floor (0 cm)' },
                        { id: 'tabletop', label: 'Tabletop / Surface' },
                        { id: 'ceiling', label: 'Ceiling' },
                        { id: 'wall', label: 'Wall Mounted' },
                      ].map((surf) => {
                        const isCurrent = (selectedFurniture.placementType || 'floor') === surf.id;
                        return (
                          <button
                            key={surf.id}
                            onClick={() => updateFurniture({ placementType: surf.id as any })}
                            className={`py-1 px-1.5 rounded-sm text-[10px] font-semibold border transition text-left cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : isDark
                                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {surf.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coordinates & Rotation */}
                  <div className="space-y-1.5 pt-2 border-t border-inherit">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Position & Rotation
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">X Position (cm)</span>
                        <input
                          type="number"
                          value={Math.round(selectedFurniture.x)}
                          onChange={(e) => updateFurniture({ x: parseInt(e.target.value) || 0 })}
                          className={`w-full px-2 py-1 text-xs font-mono rounded-sm border ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Y Position (cm)</span>
                        <input
                          type="number"
                          value={Math.round(selectedFurniture.y)}
                          onChange={(e) => updateFurniture({ y: parseInt(e.target.value) || 0 })}
                          className={`w-full px-2 py-1 text-xs font-mono rounded-sm border ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Rotation quick buttons */}
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-[10px] text-slate-400 font-mono flex-1">
                        Angle: {normalizedDeg}°
                      </span>
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => updateFurniture({ angle: (deg * Math.PI) / 180 })}
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border transition cursor-pointer ${
                            normalizedDeg === deg
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : isDark
                              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Duplicate, Lock, Delete */}
                  <div className="pt-3 border-t border-inherit flex gap-1.5">
                    <button
                      onClick={handleDuplicate}
                      className={`flex-1 py-1.5 px-2 rounded-sm border font-semibold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer ${
                        isDark
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      onClick={() => updateFurniture({ isLocked: !selectedFurniture.isLocked })}
                      className={`py-1.5 px-2.5 rounded-sm border font-semibold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer ${
                        selectedFurniture.isLocked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : isDark
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                      title={selectedFurniture.isLocked ? 'Unlock item' : 'Lock item'}
                    >
                      {selectedFurniture.isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={handleDelete}
                      className="py-1.5 px-2.5 rounded-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                /* Wall Selected Properties */
                <div className="space-y-3">
                  <div className="p-2.5 rounded-sm bg-indigo-950/20 border border-indigo-500/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                      Wall Dimensions
                    </span>
                    <p className="text-sm font-bold font-mono">
                      Length: {wallLength} cm
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      Thickness: {selectedWall?.thickness || 15} cm | Height: {selectedWall?.height || 280} cm
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Thickness (cm)</span>
                      <input
                        type="number"
                        value={selectedWall?.thickness || 15}
                        onChange={(e) => updateWall({ thickness: parseInt(e.target.value) || 15 })}
                        className={`w-full px-2 py-1 text-xs font-mono rounded-sm border ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Height (cm)</span>
                      <input
                        type="number"
                        value={selectedWall?.height || 280}
                        onChange={(e) => updateWall({ height: parseInt(e.target.value) || 280 })}
                        className={`w-full px-2 py-1 text-xs font-mono rounded-sm border ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleDelete}
                    className="w-full py-1.5 rounded-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Wall</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      )}

      {/* =========================================================================
          2. SLIM PERMANENT DOCK BAR (Far Right Edge)
          ========================================================================= */}
      <aside
        className={`w-10 border-l flex flex-col items-center py-2 shrink-0 select-none transition-all font-sans ${
          isDark
            ? 'bg-[#0a1120] border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
        }`}
      >
        {/* Icon 1: 3D Catalog */}
        <button
          onClick={() => setActiveTab(activeTab === 'catalog' ? null : 'catalog')}
          className={`w-7 h-7 rounded-sm flex items-center justify-center transition cursor-pointer mb-2 relative ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title="3D Catalog (Browse & Add Models)"
        >
          <Box className="w-4 h-4" />
        </button>

        {/* Icon 2: 3D Finish / Materials */}
        <button
          onClick={() => setActiveTab(activeTab === 'design' ? null : 'design')}
          className={`w-7 h-7 rounded-sm flex items-center justify-center transition cursor-pointer mb-2 relative ${
            activeTab === 'design'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title={selectedFurniture ? `3D Finish: ${selectedFurniture.name}` : '3D Finish & Materials'}
        >
          <Palette className="w-4 h-4" />
          {selectedFurniture && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-0.5 right-0.5 ring-1 ring-slate-900" />
          )}
        </button>

        {/* Icon 3: Properties & Transform */}
        <button
          onClick={() => setActiveTab(activeTab === 'transform' ? null : 'transform')}
          className={`w-7 h-7 rounded-sm flex items-center justify-center transition cursor-pointer mb-2 relative ${
            activeTab === 'transform'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title={selectedFurniture || selectedWall ? 'Properties & Transform' : 'Object Properties'}
        >
          <Maximize className="w-4 h-4" />
          {(selectedFurniture || selectedWall) && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-0.5 right-0.5 ring-1 ring-slate-900" />
          )}
        </button>

        <div className={`w-5 h-[1px] my-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Vertical text label */}
        <div className="flex-1 flex items-center justify-center py-2">
          <span className="text-[9px] font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 text-slate-500 hover:text-indigo-400 transition">
            Tools
          </span>
        </div>
      </aside>
    </div>
  );
};
