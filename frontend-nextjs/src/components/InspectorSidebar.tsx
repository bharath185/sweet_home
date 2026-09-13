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
}

interface StylePreset {
  id: string;
  name: string;
  tag: string;
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'scandi_light', name: 'Scandinavian Warmth', tag: 'Light Oak & Cream', color: '#f5f5f0', roughness: 0.8, metalness: 0.05, opacity: 1.0 },
  { id: 'luxury_velvet', name: 'Luxury Velvet', tag: 'Royal Navy & Sheen', color: '#1e3a8a', roughness: 0.5, metalness: 0.2, opacity: 1.0 },
  { id: 'forest_emerald', name: 'Emerald Luxe', tag: 'Forest Green Velvet', color: '#064e3b', roughness: 0.45, metalness: 0.2, opacity: 1.0 },
  { id: 'warm_walnut', name: 'Warm American Walnut', tag: 'Deep Woodgrain', color: '#5c3d2e', roughness: 0.4, metalness: 0.05, opacity: 1.0 },
  { id: 'industrial_loft', name: 'Industrial Loft', tag: 'Matte Charcoal & Metal', color: '#18181b', roughness: 0.7, metalness: 0.6, opacity: 1.0 },
  { id: 'glass_chrome', name: 'Glass & Polished Steel', tag: 'Crystal Clear & Mirror', color: '#ffffff', roughness: 0.05, metalness: 0.9, opacity: 0.4 },
  { id: 'terracotta_boho', name: 'Terracotta Earth', tag: 'Warm Matte Clay', color: '#9a3412', roughness: 0.85, metalness: 0.0, opacity: 1.0 },
  { id: 'midnight_obsidian', name: 'Midnight Obsidian', tag: 'Ultra-Gloss Black', color: '#09090b', roughness: 0.15, metalness: 0.4, opacity: 1.0 },
];

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
    icon: Square,
    swatches: [
      { name: 'Carrara White', color: '#f8fafc', roughness: 0.15, metalness: 0.1 },
      { name: 'Nero Marquina', color: '#0f172a', roughness: 0.18, metalness: 0.12 },
      { name: 'Calacatta Gold', color: '#fffbeb', roughness: 0.2, metalness: 0.15 },
      { name: 'Roman Travertine', color: '#e2d9cc', roughness: 0.5, metalness: 0.05 },
      { name: 'Concrete Grey', color: '#94a3b8', roughness: 0.8, metalness: 0.05 },
      { name: 'Terrazzo Tile', color: '#fed7aa', roughness: 0.3, metalness: 0.1 },
    ],
  },
  glass: {
    label: 'Glass & Translucent',
    icon: Droplets,
    swatches: [
      { name: 'Crystal Clear Glass', color: '#ffffff', roughness: 0.05, metalness: 0.1, opacity: 0.35 },
      { name: 'Smoked Charcoal', color: '#334155', roughness: 0.08, metalness: 0.2, opacity: 0.45 },
      { name: 'Frosted Mist', color: '#e2e8f0', roughness: 0.5, metalness: 0.05, opacity: 0.6 },
      { name: 'Bronze Tint Glass', color: '#78350f', roughness: 0.08, metalness: 0.3, opacity: 0.4 },
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
  isOpen = true,
  onToggleOpen,
}) => {
  const selectedFurniture = plan.furniture.find((f) => f.id === selectedId);
  const selectedWall = plan.walls.find((w) => w.id === selectedId);
  const isColliding = selectedFurniture ? collidingItemIds.has(selectedFurniture.id) : false;
  const collisionReason = selectedFurniture ? collisionReasons.get(selectedFurniture.id) : undefined;

  // Active Tab state: 'catalog' | 'design' | 'transform'
  const [activeTab, setActiveTab] = useState<'catalog' | 'design' | 'transform'>('catalog');
  const [activeMatCategory, setActiveMatCategory] = useState<string>('wood');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('All');

  // Automatically switch tab when an item or wall is selected
  useEffect(() => {
    if (selectedFurniture) {
      setActiveTab('design');
    } else if (selectedWall) {
      setActiveTab('transform');
    } else {
      setActiveTab('catalog');
    }
  }, [selectedId]);

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
    }
  };

  const wallLength = selectedWall
    ? Math.round(Math.hypot(selectedWall.xEnd - selectedWall.xStart, selectedWall.yEnd - selectedWall.yStart))
    : 0;

  if (!isOpen) {
    return (
      <aside
        className={`w-10 border-l flex flex-col items-center py-2 shrink-0 select-none z-10 transition-all font-sans ${
          isDark
            ? 'bg-[#0a1120] border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
        }`}
      >
        {/* Expand / Open Toggle Button */}
        <button
          onClick={onToggleOpen}
          className={`w-7 h-7 rounded-sm flex items-center justify-center transition cursor-pointer mb-2 ${
            isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title="Expand 3D Inspector & Catalog"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className={`w-5 h-[1px] mb-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Action Icon 1: 3D Catalog */}
        <button
          onClick={() => {
            setActiveTab('catalog');
            if (onToggleOpen) onToggleOpen();
          }}
          className={`w-7 h-7 rounded-sm flex items-center justify-center transition cursor-pointer mb-2 relative ${
            activeTab === 'catalog'
              ? isDark
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              : isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title="3D Catalog (Browse & Add Models)"
        >
          <Box className="w-3.5 h-3.5" />
        </button>

        {/* Action Icon 2: 3D Finish / Materials */}
        <button
          onClick={() => {
            if (selectedFurniture) {
              setActiveTab('design');
            }
            if (onToggleOpen) onToggleOpen();
          }}
          className={`w-7 h-7 rounded-sm flex items-center justify-center transition cursor-pointer mb-2 relative ${
            activeTab === 'design'
              ? isDark
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              : isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title={selectedFurniture ? `3D Finish: ${selectedFurniture.name}` : '3D Finish (Select an item to edit materials)'}
        >
          <Palette className="w-3.5 h-3.5" />
          {selectedFurniture && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute top-0.5 right-0.5" />
          )}
        </button>

        {/* Action Icon 3: Properties / Transform */}
        <button
          onClick={() => {
            if (selectedFurniture || selectedWall) {
              setActiveTab('transform');
            }
            if (onToggleOpen) onToggleOpen();
          }}
          className={`w-7 h-7 rounded-sm flex items-center justify-center transition cursor-pointer mb-2 relative ${
            activeTab === 'transform'
              ? isDark
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              : isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title={selectedFurniture || selectedWall ? 'Properties & Transform' : 'Properties (Select an item or wall)'}
        >
          <Maximize className="w-3.5 h-3.5" />
          {(selectedFurniture || selectedWall) && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute top-0.5 right-0.5" />
          )}
        </button>

        {/* Vertical Text Label */}
        <div className="flex-1 flex items-center justify-center py-4 cursor-pointer" onClick={onToggleOpen}>
          <span className="text-[10px] font-bold tracking-wider uppercase [writing-mode:vertical-rl] rotate-180 text-slate-400 hover:text-indigo-400 transition">
            📦 3D Catalog & Properties
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`w-80 border-l flex flex-col h-full select-none shrink-0 transition-all font-sans ${
        isDark
          ? 'bg-[#0a1120] border-slate-800 text-slate-200'
          : 'bg-[#f8fafc] border-slate-200 text-slate-800'
      }`}
    >
      {/* 1. Sharp Pro Tab Strip (Catalog | Design | Transform) */}
      <div className={`flex border-b text-[11px] font-bold shrink-0 items-stretch ${
        isDark ? 'border-slate-800 bg-[#080d19]' : 'border-slate-200 bg-slate-100'
      }`}>
        {/* Tab 1: 3D Catalog */}
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-r ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          } ${
            activeTab === 'catalog'
              ? isDark
                ? 'bg-[#0a1120] text-indigo-400 border-b-2 border-b-indigo-500'
                : 'bg-white text-indigo-600 border-b-2 border-b-indigo-600 shadow-2xs'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Catalog</span>
        </button>

        {/* Tab 2: 3D Finish / Design */}
        <button
          onClick={() => {
            if (selectedFurniture) setActiveTab('design');
          }}
          disabled={!selectedFurniture}
          className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition border-r ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          } ${
            !selectedFurniture
              ? 'opacity-40 cursor-not-allowed text-slate-500'
              : activeTab === 'design'
              ? isDark
                ? 'bg-[#0a1120] text-indigo-400 border-b-2 border-b-indigo-500'
                : 'bg-white text-indigo-600 border-b-2 border-b-indigo-600 shadow-2xs'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 cursor-pointer'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 cursor-pointer'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>3D Finish</span>
        </button>

        {/* Tab 3: Size & Transform */}
        <button
          onClick={() => {
            if (selectedFurniture || selectedWall) setActiveTab('transform');
          }}
          disabled={!selectedFurniture && !selectedWall}
          className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition ${
            !selectedFurniture && !selectedWall
              ? 'opacity-40 cursor-not-allowed text-slate-500'
              : activeTab === 'transform'
              ? isDark
                ? 'bg-[#0a1120] text-indigo-400 border-b-2 border-b-indigo-500'
                : 'bg-white text-indigo-600 border-b-2 border-b-indigo-600 shadow-2xs'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 cursor-pointer'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 cursor-pointer'
          }`}
        >
          <Maximize className="w-3.5 h-3.5" />
          <span>Transform</span>
        </button>

        {/* Optional Collapse Button */}
        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className={`px-2 flex items-center justify-center transition cursor-pointer border-l ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
            title="Collapse Inspector Panel"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Selected Object Header Banner (If item or wall is selected) */}
      {(selectedFurniture || selectedWall) && (
        <div className={`px-3 py-2 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-[#0d1527]' : 'border-slate-200 bg-slate-100/70'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 ${
              isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {selectedFurniture ? <Palette className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0">
              <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedFurniture ? selectedFurniture.name : 'Wall Segment'}
              </h4>
              <span className="text-[10px] text-slate-400 block truncate">
                {selectedFurniture ? selectedFurniture.category : `${wallLength} cm length`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {selectedFurniture && (
              <>
                <button
                  onClick={() => updateFurniture({ isLocked: !selectedFurniture.isLocked })}
                  className={`p-1 transition cursor-pointer ${
                    selectedFurniture.isLocked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title={selectedFurniture.isLocked ? 'Unlock item' : 'Lock item'}
                >
                  {selectedFurniture.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDuplicate}
                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectId(null)}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title="Deselect"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Panel Body according to active tab */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
        {/* ============================================================ */}
        {/* TAB 1: 3D CATALOG                                           */}
        {/* ============================================================ */}
        {activeTab === 'catalog' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search furniture & decor..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className={`w-full pl-8 pr-2 py-1.5 text-[11px] border focus:outline-none transition ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {CATALOG_CATEGORIES.map((cat) => {
                const isSelected = selectedCatalogCategory.toLowerCase() === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatalogCategory(cat.id)}
                    className={`px-2 py-1 text-[10px] font-semibold whitespace-nowrap transition cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isDark
                        ? 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
                        : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Catalog Items Grid */}
            <div className="space-y-1.5">
              {filteredCatalogItems.length === 0 ? (
                <div className="py-8 text-center text-[11px] text-slate-400">
                  No 3D items found.
                </div>
              ) : (
                filteredCatalogItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onAddItem) onAddItem(item);
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(item));
                    }}
                    className={`p-2 border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isDark
                        ? 'bg-slate-900/60 hover:bg-slate-800/90 border-slate-800/90 hover:border-indigo-500/40 text-slate-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-400 text-slate-800 shadow-2xs'
                    }`}
                    title={`Click to place ${item.name} (${item.width}×${item.depth}×${item.height} cm)`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <Box className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[11px] font-bold truncate group-hover:text-indigo-400 transition-colors">
                          {item.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.width} × {item.depth} × {item.height} cm
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] px-1.5 py-0.2 uppercase font-bold tracking-wider shrink-0 border ${
                      isDark ? 'bg-slate-800/80 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: 3D DESIGN & FINISH                                    */}
        {/* ============================================================ */}
        {activeTab === 'design' && selectedFurniture && (
          <div className="space-y-3">
            {/* Collision Alert */}
            {isColliding && (
              <div className="p-2.5 bg-rose-950/30 border border-rose-500/40 text-rose-300 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Collision Warning</span>
                </div>
                <p className="text-[10px] text-rose-300 leading-tight">
                  {collisionReason || 'This piece overlaps with another object or wall.'}
                </p>
              </div>
            )}

            {/* Quick 1-Click Aesthetic Presets */}
            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Curated Style Presets
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      updateFurniture({
                        color: preset.color,
                        roughness: preset.roughness,
                        metalness: preset.metalness,
                        opacity: preset.opacity,
                        stylePreset: preset.id,
                      });
                    }}
                    className={`p-1.5 text-left border transition cursor-pointer ${
                      selectedFurniture.stylePreset === preset.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : isDark
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 rounded-full border border-black/30 shrink-0" style={{ backgroundColor: preset.color }} />
                      <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block truncate">{preset.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PBR Material Library */}
            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Box className="w-3 h-3 text-indigo-400" />
                  PBR Materials & Textures
                </span>
              </div>

              {/* Material Category Selector */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-2 pb-1">
                {Object.keys(MATERIAL_LIBRARIES).map((catKey) => {
                  const lib = MATERIAL_LIBRARIES[catKey];
                  const isSelected = activeMatCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      onClick={() => setActiveMatCategory(catKey)}
                      className={`px-2 py-0.5 text-[10px] font-bold border whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : isDark
                          ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {lib.label}
                    </button>
                  );
                })}
              </div>

              {/* Swatches Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {MATERIAL_LIBRARIES[activeMatCategory]?.swatches.map((swatch) => (
                  <button
                    key={swatch.name}
                    onClick={() => {
                      updateFurniture({
                        color: swatch.color,
                        roughness: swatch.roughness,
                        metalness: swatch.metalness,
                        opacity: swatch.opacity ?? 1.0,
                        materialCategory: activeMatCategory as any,
                        materialFinish: swatch.name,
                      });
                    }}
                    className={`p-1.5 text-center border transition cursor-pointer ${
                      selectedFurniture.materialFinish === swatch.name
                        ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-400'
                        : isDark
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-full h-5 mb-1 border border-black/20"
                      style={{ backgroundColor: swatch.color }}
                    />
                    <span className="text-[9px] font-semibold text-slate-300 block truncate">
                      {swatch.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Palette */}
            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Custom Color</span>
                <input
                  type="color"
                  value={selectedFurniture.color || '#ffffff'}
                  onChange={(e) => updateFurniture({ color: e.target.value })}
                  className="w-5 h-5 cursor-pointer bg-transparent border-0"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateFurniture({ color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-4.5 h-4.5 border transition-all cursor-pointer ${
                      selectedFurniture.color === c ? 'border-indigo-500 scale-110 shadow-xs' : 'border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Lighting Properties (If Lamp / Light source) */}
            {selectedFurniture.category.toLowerCase().includes('light') && (
              <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                  Lighting & Luminescence
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Intensity</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {Math.round((selectedFurniture.lightIntensity || 1.0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={selectedFurniture.lightIntensity || 1.0}
                    onChange={(e) => updateFurniture({ lightIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SIZE & TRANSFORM                                      */}
        {/* ============================================================ */}
        {activeTab === 'transform' && selectedFurniture && (
          <div className="space-y-3">
            {/* Dimensions */}
            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dimensions (cm)</span>
                <span className="font-mono text-[10px] text-indigo-400 font-bold">
                  {selectedFurniture.width} × {selectedFurniture.depth} × {selectedFurniture.height}
                </span>
              </div>

              {/* Quick Scale Buttons */}
              <div className="grid grid-cols-4 gap-1 mb-2.5">
                {[-20, -10, 10, 20].map((delta) => (
                  <button
                    key={delta}
                    onClick={() => {
                      const factor = 1 + delta / 100;
                      updateFurniture({
                        width: Math.round(selectedFurniture.width * factor),
                        depth: Math.round(selectedFurniture.depth * factor),
                        height: Math.round(selectedFurniture.height * factor),
                      });
                    }}
                    className={`py-1 text-[10px] font-bold border transition cursor-pointer ${
                      isDark ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                  >
                    {delta > 0 ? `+${delta}%` : `${delta}%`}
                  </button>
                ))}
              </div>

              {/* Inputs for Width, Depth, Height */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Width</label>
                  <input
                    type="number"
                    value={selectedFurniture.width}
                    onChange={(e) => updateFurniture({ width: Math.max(10, parseInt(e.target.value) || 10) })}
                    className={`w-full p-1 text-[11px] font-mono border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Depth</label>
                  <input
                    type="number"
                    value={selectedFurniture.depth}
                    onChange={(e) => updateFurniture({ depth: Math.max(10, parseInt(e.target.value) || 10) })}
                    className={`w-full p-1 text-[11px] font-mono border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Height</label>
                  <input
                    type="number"
                    value={selectedFurniture.height}
                    onChange={(e) => updateFurniture({ height: Math.max(10, parseInt(e.target.value) || 10) })}
                    className={`w-full p-1 text-[11px] font-mono border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Placement Surface & Auto-Attachment */}
            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Placement Mode
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'floor', label: 'Floor Standing' },
                  { id: 'tabletop', label: 'On Tabletop' },
                  { id: 'ceiling', label: 'Ceiling Mounted' },
                  { id: 'wall', label: 'Wall Mounted' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updateFurniture({ placementType: mode.id as any })}
                    className={`py-1.5 px-2 text-[10px] font-bold border transition text-center cursor-pointer ${
                      (selectedFurniture.placementType || 'floor') === mode.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isDark
                        ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                        : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position & Elevation */}
            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Coordinates & Elevation (cm)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">X Pos</label>
                  <input
                    type="number"
                    value={Math.round(selectedFurniture.x)}
                    onChange={(e) => updateFurniture({ x: parseInt(e.target.value) || 0 })}
                    className={`w-full p-1 text-[11px] font-mono border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Y Pos</label>
                  <input
                    type="number"
                    value={Math.round(selectedFurniture.y)}
                    onChange={(e) => updateFurniture({ y: parseInt(e.target.value) || 0 })}
                    className={`w-full p-1 text-[11px] font-mono border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Elevation (Z)</label>
                  <input
                    type="number"
                    value={Math.round(selectedFurniture.elevation || 0)}
                    onChange={(e) => updateFurniture({ elevation: parseInt(e.target.value) || 0 })}
                    className={`w-full p-1 text-[11px] font-mono border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Rotation Angle */}
            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rotation Angle</span>
                <span className="font-mono text-[10px] text-indigo-400 font-bold">
                  {Math.round(((selectedFurniture.angle || 0) * 180) / Math.PI)}°
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step={Math.PI / 36}
                value={selectedFurniture.angle || 0}
                onChange={(e) => updateFurniture({ angle: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 mb-2"
              />
              <div className="grid grid-cols-4 gap-1">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => updateFurniture({ angle: (deg * Math.PI) / 180 })}
                    className={`py-1 text-[10px] font-bold border transition cursor-pointer ${
                      isDark ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* WALL TRANSFORM PROPERTIES                                    */}
        {/* ============================================================ */}
        {activeTab === 'transform' && selectedWall && (
          <div className="space-y-3">
            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Wall Segment Geometry
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Thickness (cm)</label>
                  <input
                    type="number"
                    value={selectedWall.thickness || 15}
                    onChange={(e) => updateWall({ thickness: parseInt(e.target.value) || 15 })}
                    className={`w-full p-1 text-[11px] font-mono border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Height (cm)</label>
                  <input
                    type="number"
                    value={selectedWall.height || 250}
                    onChange={(e) => updateWall({ height: parseInt(e.target.value) || 250 })}
                    className={`w-full p-1 text-[11px] font-mono border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Wall Color</span>
                <input
                  type="color"
                  value={selectedWall.color || '#f8fafc'}
                  onChange={(e) => updateWall({ color: e.target.value })}
                  className="w-5 h-5 cursor-pointer bg-transparent border-0"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateWall({ color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-4.5 h-4.5 border transition-all cursor-pointer ${
                      selectedWall.color === c ? 'border-indigo-500 scale-110' : 'border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default InspectorSidebar;
