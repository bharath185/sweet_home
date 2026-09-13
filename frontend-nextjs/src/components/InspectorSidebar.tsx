'use client';

import React, { useState } from 'react';
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
  X
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
  theme?: 'dark' | 'light';
}

// 1. Curated 1-Click Aesthetic Style Presets
interface StylePreset {
  id: string;
  name: string;
  tag: string;
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  badgeBg: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'scandi_light', name: 'Scandinavian Warmth', tag: 'Light Oak & Cream', color: '#f5f5f0', roughness: 0.8, metalness: 0.05, opacity: 1.0, badgeBg: 'bg-amber-100/70 text-amber-800 border-amber-300' },
  { id: 'luxury_velvet', name: 'Luxury Velvet', tag: 'Royal Navy & Sheen', color: '#1e3a8a', roughness: 0.5, metalness: 0.2, opacity: 1.0, badgeBg: 'bg-blue-100/70 text-blue-800 border-blue-300' },
  { id: 'forest_emerald', name: 'Emerald Luxe', tag: 'Forest Green Velvet', color: '#064e3b', roughness: 0.45, metalness: 0.2, opacity: 1.0, badgeBg: 'bg-emerald-100/70 text-emerald-800 border-emerald-300' },
  { id: 'warm_walnut', name: 'Warm American Walnut', tag: 'Deep Woodgrain', color: '#5c3d2e', roughness: 0.4, metalness: 0.05, opacity: 1.0, badgeBg: 'bg-amber-900/10 text-amber-900 border-amber-800/30' },
  { id: 'industrial_loft', name: 'Industrial Loft', tag: 'Matte Charcoal & Metal', color: '#18181b', roughness: 0.7, metalness: 0.6, opacity: 1.0, badgeBg: 'bg-zinc-200/80 text-zinc-900 border-zinc-400' },
  { id: 'glass_chrome', name: 'Glass & Polished Steel', tag: 'Crystal Clear & Mirror', color: '#ffffff', roughness: 0.05, metalness: 0.9, opacity: 0.4, badgeBg: 'bg-sky-100/70 text-sky-800 border-sky-300' },
  { id: 'terracotta_boho', name: 'Terracotta Earth', tag: 'Warm Matte Clay', color: '#9a3412', roughness: 0.85, metalness: 0.0, opacity: 1.0, badgeBg: 'bg-orange-100/70 text-orange-800 border-orange-300' },
  { id: 'midnight_obsidian', name: 'Midnight Obsidian', tag: 'Ultra-Gloss Black', color: '#09090b', roughness: 0.15, metalness: 0.4, opacity: 1.0, badgeBg: 'bg-slate-900 text-slate-100 border-slate-700' },
];

// 2. Material Categories & Realistic Swatches
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

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  plan,
  selectedId,
  onUpdatePlan,
  onSelectId,
  collidingItemIds = new Set(),
  collisionReasons = new Map(),
  catalog = fallbackCatalog,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'design' | 'transform'>('design');
  const [activeMatCategory, setActiveMatCategory] = useState<string>('wood');

  const selectedFurniture = plan.furniture.find((f) => f.id === selectedId);
  const selectedWall = plan.walls.find((w) => w.id === selectedId);
  const isColliding = selectedFurniture ? collidingItemIds.has(selectedFurniture.id) : false;
  const collisionReason = selectedFurniture ? collisionReasons.get(selectedFurniture.id) : undefined;

  const isDark = theme === 'dark';

  if (!selectedFurniture && !selectedWall) {
    return null;
  }

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
        alert(`⚠️ Cannot delete "${selectedFurniture.name}": This item is LOCKED.\nPlease unlock it first before deleting.`);
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

  // Swap Model Variant (preserving position & rotation)
  const handleSwapVariant = (newCatalogItem: CatalogItem) => {
    if (!selectedFurniture) return;
    updateFurniture({
      catalogId: newCatalogItem.id,
      name: newCatalogItem.name,
      category: newCatalogItem.category,
      width: newCatalogItem.width,
      depth: newCatalogItem.depth,
      height: newCatalogItem.height,
      model: newCatalogItem.model,
      icon: newCatalogItem.icon,
      color: newCatalogItem.defaultColor || selectedFurniture.color,
    });
  };

  const compatibleVariants = selectedFurniture
    ? catalog.filter((c) => c.category.toLowerCase() === selectedFurniture.category.toLowerCase())
    : [];

  const wallLength = selectedWall
    ? Math.round(Math.hypot(selectedWall.xEnd - selectedWall.xStart, selectedWall.yEnd - selectedWall.yStart))
    : 0;

  return (
    <div className="absolute top-3 right-3 bottom-3 z-30 flex">
      <aside className={`w-80 rounded-2xl border shadow-2xl backdrop-blur-xl flex flex-col h-full select-none overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-4 ${
        isDark
          ? 'bg-[#0b1222]/95 border-slate-800 text-slate-100 shadow-black/60'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-900/15'
      }`}>
        {/* Header */}
        <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800/90 bg-[#0e172a]/80' : 'border-slate-200 bg-slate-50/90'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}>
              {selectedFurniture ? (
                <Palette className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedFurniture ? selectedFurniture.name : 'Wall Structure'}
              </h3>
              <span className="text-[10px] text-slate-400 block truncate">
                {selectedFurniture ? selectedFurniture.category : `Length: ${wallLength} cm`}
              </span>
            </div>
          </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedFurniture && (
            <>
              <button
                onClick={() => updateFurniture({ isLocked: !selectedFurniture.isLocked })}
                className={`p-1.5 rounded-lg transition ${
                  selectedFurniture.isLocked
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title={selectedFurniture.isLocked ? 'Unlock Placement' : 'Lock Placement'}
              >
                {selectedFurniture.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDuplicate}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                title="Duplicate Item"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            title="Delete (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectId(null)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Close Inspector (Full Canvas View)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs for Furniture: 3D Design vs Dimensions */}
      {selectedFurniture && (
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 shrink-0">
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'design'
                ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-sky-600" />
            <span>3D Design & Finish</span>
          </button>
          <button
            onClick={() => setActiveTab('transform')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'transform'
                ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Maximize className="w-3.5 h-3.5 text-slate-600" />
            <span>Size & Transform</span>
          </button>
        </div>
      )}

      {/* Body Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* COLLISION ALERT CARD */}
        {isColliding && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Collision / Overlap Detected</span>
            </div>
            <p className="text-[11px] text-rose-600 leading-tight">
              {collisionReason || 'This piece overlaps with another object or wall.'}
            </p>
          </div>
        )}

        {/* ---------------- 3D DESIGN STUDIO TAB ---------------- */}
        {selectedFurniture && activeTab === 'design' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* 1. Curated 1-Click Aesthetic Style Presets */}
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Curated Style Presets</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">1-Click</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {STYLE_PRESETS.map((preset) => {
                  const isSelectedStyle = selectedFurniture.stylePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        updateFurniture({
                          stylePreset: preset.id,
                          color: preset.color,
                          roughness: preset.roughness,
                          metalness: preset.metalness,
                          opacity: preset.opacity,
                          materialCategory: 'custom',
                        })
                      }
                      className={`p-2 rounded-lg text-left transition border flex flex-col justify-between relative overflow-hidden ${
                        isSelectedStyle
                          ? 'bg-white border-sky-500 ring-2 ring-sky-100 shadow-sm'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: preset.color }}
                        />
                        {isSelectedStyle && <Check className="w-3 h-3 text-sky-600" />}
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 truncate leading-tight block">
                        {preset.name}
                      </span>
                      <span className="text-[9px] text-slate-500 truncate block mt-0.5">
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Categorized Material & Finish Library */}
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Box className="w-3.5 h-3.5 text-sky-600" />
                  <span>Material & Texture Finish</span>
                </div>
              </div>

              {/* Material Sub-Category Pills */}
              <div className="flex flex-wrap gap-1 bg-slate-200/60 p-1 rounded-lg">
                {Object.keys(MATERIAL_LIBRARIES).map((key) => {
                  const mat = MATERIAL_LIBRARIES[key];
                  const Icon = mat.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveMatCategory(key)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                        activeMatCategory === key
                          ? 'bg-white text-sky-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{mat.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Material Swatches Grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {MATERIAL_LIBRARIES[activeMatCategory]?.swatches.map((swatch) => {
                  const isActive = selectedFurniture.color === swatch.color;
                  return (
                    <button
                      key={swatch.name}
                      onClick={() =>
                        updateFurniture({
                          color: swatch.color,
                          roughness: swatch.roughness,
                          metalness: swatch.metalness,
                          opacity: swatch.opacity ?? 1.0,
                          materialCategory: activeMatCategory as any,
                          materialFinish: swatch.name,
                        })
                      }
                      className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                        isActive
                          ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100 shadow-xs'
                          : 'bg-white hover:bg-slate-100/70 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-md border border-slate-300 shadow-2xs flex items-center justify-center"
                        style={{ backgroundColor: swatch.color }}
                      >
                        {isActive && <Check className="w-3.5 h-3.5 text-slate-800 drop-shadow-sm" />}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 leading-tight line-clamp-1">
                        {swatch.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Surface PBR Tuning (Gloss, Metalness, Opacity) */}
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" />
                  <span>Surface Reflection & Optics</span>
                </span>
              </div>

              {/* Roughness / Gloss */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                  <span>Surface Roughness / Gloss</span>
                  <span className="font-mono font-bold text-sky-700">
                    {selectedFurniture.roughness !== undefined ? Math.round(selectedFurniture.roughness * 100) : 40}%{' '}
                    {(selectedFurniture.roughness ?? 0.4) < 0.25
                      ? '(High Gloss)'
                      : (selectedFurniture.roughness ?? 0.4) > 0.7
                      ? '(Matte)'
                      : '(Satin)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={selectedFurniture.roughness ?? 0.4}
                  onChange={(e) => updateFurniture({ roughness: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Metalness */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                  <span>Metallic Reflection</span>
                  <span className="font-mono font-bold text-sky-700">
                    {selectedFurniture.metalness !== undefined ? Math.round(selectedFurniture.metalness * 100) : 15}%{' '}
                    {(selectedFurniture.metalness ?? 0.15) > 0.7 ? '(Metallic)' : '(Cloth / Wood)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={selectedFurniture.metalness ?? 0.15}
                  onChange={(e) => updateFurniture({ metalness: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Opacity / Transparency */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                  <span>Transparency / Opacity</span>
                  <span className="font-mono font-bold text-sky-700">
                    {selectedFurniture.opacity !== undefined ? Math.round(selectedFurniture.opacity * 100) : 100}%{' '}
                    {(selectedFurniture.opacity ?? 1.0) < 0.95 ? '(Glass)' : '(Solid)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={selectedFurniture.opacity ?? 1.0}
                  onChange={(e) => updateFurniture({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 4. Custom Palette & HTML5 Color Wheel */}
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-sky-600" />
                  <span>Custom Color Palette</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={selectedFurniture.color || '#94a3b8'}
                    onChange={(e) => updateFurniture({ color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-slate-300 bg-transparent"
                    title="Open Color Wheel"
                  />
                  <input
                    type="text"
                    value={selectedFurniture.color || '#94a3b8'}
                    onChange={(e) => updateFurniture({ color: e.target.value })}
                    className="w-18 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-center font-bold text-slate-700 uppercase outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateFurniture({ color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-5.5 h-5.5 rounded-lg border transition-all ${
                      selectedFurniture.color === c
                        ? 'border-sky-600 scale-120 shadow-md ring-2 ring-sky-300'
                        : 'border-slate-300 hover:scale-110 shadow-2xs'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 5. Dynamic Lighting Studio (if Lighting item) */}
            {selectedFurniture.category === 'Lighting' && (
              <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl space-y-2.5 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lighting Emission Studio</span>
                </div>

                {/* Light Tone Presets */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Warm Candle (2200K)', color: '#ffb347' },
                    { label: 'Warm White (2700K)', color: '#ffe4b5' },
                    { label: 'Studio Neutral (4000K)', color: '#fff8eb' },
                    { label: 'Cool Daylight (6500K)', color: '#e0f2fe' },
                  ].map((tone) => (
                    <button
                      key={tone.label}
                      onClick={() => updateFurniture({ lightColor: tone.color })}
                      className={`p-1.5 rounded-lg border text-left text-[10px] font-semibold flex items-center gap-1.5 transition ${
                        selectedFurniture.lightColor === tone.color
                          ? 'bg-amber-100/90 border-amber-400 text-amber-950 font-bold'
                          : 'bg-white hover:bg-amber-50/80 border-amber-200/80 text-amber-800'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-amber-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: tone.color }}
                      />
                      <span className="truncate">{tone.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Light Intensity */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-semibold text-amber-800">
                    <span>Lumen Brightness</span>
                    <span className="font-mono font-bold">
                      {(selectedFurniture.lightIntensity ?? 1.2).toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={selectedFurniture.lightIntensity ?? 1.2}
                    onChange={(e) => updateFurniture({ lightIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-600 h-1.5 bg-amber-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 6. Swap Model Variant in Category */}
            {compatibleVariants.length > 1 && (
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                    <span>Swap Model Variant</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {compatibleVariants.length} models
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {compatibleVariants.map((item) => {
                    const isCurrent = item.id === selectedFurniture.catalogId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSwapVariant(item)}
                        className={`p-1.5 rounded-lg border text-left transition flex items-center gap-2 ${
                          isCurrent
                            ? 'bg-sky-50 border-sky-500 font-bold text-sky-900 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {item.icon ? (
                          <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain shrink-0" />
                        ) : (
                          <Box className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-[10px] truncate leading-tight">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- SIZE & TRANSFORM TAB ---------------- */}
        {selectedFurniture && activeTab === 'transform' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Dimensions (W x D x H) with Quick Increase / Decrease Steppers & Scale Presets */}
            <div className="space-y-2.5 bg-slate-50 border border-slate-200/80 p-3 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Maximize className="w-3.5 h-3.5 text-sky-600" />
                  <span>Dimensions (cm)</span>
                </div>
                <span className="text-[10px] text-sky-700 font-mono font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                  {Math.round(selectedFurniture.width)} × {Math.round(selectedFurniture.depth)} × {Math.round(selectedFurniture.height)}
                </span>
              </div>

              {/* Quick Scale Multipliers */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[10px] font-bold shadow-2xs">
                <span className="text-slate-400 px-1 text-[9px] uppercase">Scale:</span>
                <button
                  onClick={() =>
                    updateFurniture({
                      width: Math.max(10, selectedFurniture.width * 0.8),
                      depth: Math.max(10, selectedFurniture.depth * 0.8),
                      height: Math.max(10, selectedFurniture.height * 0.8),
                    })
                  }
                  className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-center"
                  title="Scale Down 20%"
                >
                  -20%
                </button>
                <button
                  onClick={() =>
                    updateFurniture({
                      width: Math.max(10, selectedFurniture.width * 0.9),
                      depth: Math.max(10, selectedFurniture.depth * 0.9),
                      height: Math.max(10, selectedFurniture.height * 0.9),
                    })
                  }
                  className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-center"
                  title="Scale Down 10%"
                >
                  -10%
                </button>
                <button
                  onClick={() =>
                    updateFurniture({
                      width: selectedFurniture.width * 1.1,
                      depth: selectedFurniture.depth * 1.1,
                      height: selectedFurniture.height * 1.1,
                    })
                  }
                  className="flex-1 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition text-center font-bold"
                  title="Scale Up 10%"
                >
                  +10%
                </button>
                <button
                  onClick={() =>
                    updateFurniture({
                      width: selectedFurniture.width * 1.2,
                      depth: selectedFurniture.depth * 1.2,
                      height: selectedFurniture.height * 1.2,
                    })
                  }
                  className="flex-1 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition text-center font-bold"
                  title="Scale Up 20%"
                >
                  +20%
                </button>
              </div>

              {/* Individual Width, Depth, Height Steppers */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Width</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs focus-within:border-sky-500">
                    <button
                      onClick={() => updateFurniture({ width: Math.max(10, selectedFurniture.width - 5) })}
                      className="px-1.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition"
                      title="Decrease Width (-5cm)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={Math.round(selectedFurniture.width)}
                      onChange={(e) => updateFurniture({ width: Math.max(5, parseFloat(e.target.value) || 10) })}
                      className="w-full bg-transparent text-center text-xs text-slate-800 font-mono font-semibold outline-none min-w-0"
                    />
                    <button
                      onClick={() => updateFurniture({ width: selectedFurniture.width + 5 })}
                      className="px-1.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition"
                      title="Increase Width (+5cm)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Depth</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs focus-within:border-sky-500">
                    <button
                      onClick={() => updateFurniture({ depth: Math.max(10, selectedFurniture.depth - 5) })}
                      className="px-1.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition"
                      title="Decrease Depth (-5cm)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={Math.round(selectedFurniture.depth)}
                      onChange={(e) => updateFurniture({ depth: Math.max(5, parseFloat(e.target.value) || 10) })}
                      className="w-full bg-transparent text-center text-xs text-slate-800 font-mono font-semibold outline-none min-w-0"
                    />
                    <button
                      onClick={() => updateFurniture({ depth: selectedFurniture.depth + 5 })}
                      className="px-1.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition"
                      title="Increase Depth (+5cm)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Height</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs focus-within:border-sky-500">
                    <button
                      onClick={() => updateFurniture({ height: Math.max(10, selectedFurniture.height - 5) })}
                      className="px-1.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition"
                      title="Decrease Height (-5cm)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={Math.round(selectedFurniture.height)}
                      onChange={(e) => updateFurniture({ height: Math.max(5, parseFloat(e.target.value) || 10) })}
                      className="w-full bg-transparent text-center text-xs text-slate-800 font-mono font-semibold outline-none min-w-0"
                    />
                    <button
                      onClick={() => updateFurniture({ height: selectedFurniture.height + 5 })}
                      className="px-1.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition"
                      title="Increase Height (+5cm)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Surface Placement & Table Attachment Studio */}
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-600" />
                  <span>Placement Surface & Auto-Attach</span>
                </span>
                <span className="text-[10px] text-sky-700 font-mono font-bold uppercase">
                  {selectedFurniture.placementType || (isTabletopItem(selectedFurniture) ? 'tabletop' : 'floor')}
                </span>
              </div>

              {/* Surface Placement Selector Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'floor', label: '🏠 Floor Standing' },
                  { id: 'tabletop', label: '🍽️ On Tabletop (Attach)' },
                  { id: 'ceiling', label: '💡 Ceiling Mounted' },
                  { id: 'wall', label: '🧱 Wall Mounted' },
                ].map((s) => {
                  const isCurrent =
                    (selectedFurniture.placementType || (isTabletopItem(selectedFurniture) ? 'tabletop' : 'floor')) === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (s.id === 'tabletop') {
                          const host = findSupportingHost(selectedFurniture, plan.furniture) || findNearestSupportingSurface(selectedFurniture, plan.furniture);
                          if (host) {
                            updateFurniture({
                              placementType: 'tabletop',
                              placeOnTable: true,
                              x: host.x,
                              y: host.y,
                              elevation: (host.elevation || 0) + host.height,
                              hostFurnitureId: host.id,
                            });
                          } else {
                            updateFurniture({
                              placementType: 'tabletop',
                              placeOnTable: true,
                            });
                          }
                        } else {
                          updateFurniture({
                            placementType: s.id as any,
                            placeOnTable: false,
                            hostFurnitureId: undefined,
                            elevation: s.id === 'ceiling' ? 220 : 0,
                          });
                        }
                      }}
                      className={`p-1.5 rounded-lg border text-left text-[11px] font-bold transition flex items-center justify-between ${
                        isCurrent
                          ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-200'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{s.label}</span>
                      {isCurrent && <Check className="w-3 h-3 text-sky-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Tabletop Specific Status & Quick Snap Action */}
              {(selectedFurniture.placementType === 'tabletop' || isTabletopItem(selectedFurniture)) && (() => {
                const host = findSupportingHost(selectedFurniture, plan.furniture);
                const nearest = findNearestSupportingSurface(selectedFurniture, plan.furniture);

                return (
                  <div className="p-2.5 rounded-xl border bg-white space-y-2 shadow-2xs">
                    {host ? (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                        <div>
                          <span className="font-bold block text-emerald-900">
                            Attached to: {host.name}
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            Surface Elevation: +{Math.round((host.elevation || 0) + host.height)}cm (No collision)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Restricted from Bare Floor</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          This item must be placed on top of a table, desk, counter, or cabinet.
                        </p>
                        {nearest && (
                          <button
                            onClick={() =>
                              updateFurniture({
                                x: nearest.x,
                                y: nearest.y,
                                elevation: (nearest.elevation || 0) + nearest.height,
                                hostFurnitureId: nearest.id,
                              })
                            }
                            className="w-full py-1.5 px-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-[11px] font-bold text-sky-800 transition flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <span>🎯 Snap onto {nearest.name}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Position & Elevation */}
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-sky-600" />
                  <span>Placement & Elevation (cm)</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">X Position</label>
                  <input
                    type="number"
                    value={Math.round(selectedFurniture.x)}
                    onChange={(e) => updateFurniture({ x: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono text-center outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(selectedFurniture.y)}
                    onChange={(e) => updateFurniture({ y: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono text-center outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Elevation</label>
                  <input
                    type="number"
                    value={Math.round(selectedFurniture.elevation || 0)}
                    onChange={(e) => updateFurniture({ elevation: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono text-center outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                  <span>Rotation Angle</span>
                </span>
                <span className="font-mono text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                  {Math.round((((selectedFurniture.angle || 0) * 180) / Math.PI) % 360)}°
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.05"
                value={selectedFurniture.angle || 0}
                onChange={(e) => updateFurniture({ angle: parseFloat(e.target.value) })}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[
                  { label: '-45°', delta: -Math.PI / 4 },
                  { label: '+45°', delta: Math.PI / 4 },
                  { label: '90°', setVal: Math.PI / 2 },
                  { label: '180°', setVal: Math.PI },
                ].map((step) => (
                  <button
                    key={step.label}
                    onClick={() => {
                      if (step.setVal !== undefined) {
                        updateFurniture({ angle: step.setVal });
                      } else if (step.delta !== undefined) {
                        const newA = ((selectedFurniture.angle || 0) + step.delta + Math.PI * 2) % (Math.PI * 2);
                        updateFurniture({ angle: newA });
                      }
                    }}
                    className="py-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition text-center"
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- WALL INSPECTOR ---------------- */}
        {selectedWall && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <div className="flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-sky-600" />
                  <span>Wall Structure</span>
                </div>
                <span className="text-[10px] text-sky-700 font-mono font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                  Length: {wallLength} cm
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Thickness (cm)</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs focus-within:border-sky-500">
                    <button
                      onClick={() => updateWall({ thickness: Math.max(5, (selectedWall.thickness || 15) - 5) })}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold"
                      title="Decrease Wall Thickness (-5cm)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={selectedWall.thickness}
                      onChange={(e) => updateWall({ thickness: Math.max(5, parseFloat(e.target.value) || 10) })}
                      className="w-full bg-transparent text-center text-xs text-slate-800 font-mono font-semibold outline-none min-w-0"
                    />
                    <button
                      onClick={() => updateWall({ thickness: (selectedWall.thickness || 15) + 5 })}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold"
                      title="Increase Wall Thickness (+5cm)"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Height (cm)</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs focus-within:border-sky-500">
                    <button
                      onClick={() => updateWall({ height: Math.max(50, (selectedWall.height || 250) - 10) })}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold"
                      title="Decrease Wall Height (-10cm)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={selectedWall.height}
                      onChange={(e) => updateWall({ height: Math.max(50, parseFloat(e.target.value) || 250) })}
                      className="w-full bg-transparent text-center text-xs text-slate-800 font-mono font-semibold outline-none min-w-0"
                    />
                    <button
                      onClick={() => updateWall({ height: (selectedWall.height || 250) + 10 })}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold"
                      title="Increase Wall Height (+10cm)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-sky-600" />
                  <span>Wall Finish Color</span>
                </span>
                <input
                  type="color"
                  value={selectedWall.color || '#f8fafc'}
                  onChange={(e) => updateWall({ color: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-slate-300 bg-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateWall({ color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-5.5 h-5.5 rounded-lg border transition-all ${
                      selectedWall.color === c
                        ? 'border-sky-600 scale-120 shadow-md ring-2 ring-sky-300'
                        : 'border-slate-300 hover:scale-110 shadow-2xs'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  </div>
  );
};
export default InspectorSidebar;

