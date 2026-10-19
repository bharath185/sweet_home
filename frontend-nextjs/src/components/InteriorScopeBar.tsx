'use client';

import React, { useState } from 'react';
import {
  Armchair,
  Bed,
  UtensilsCrossed,
  Bath,
  Lightbulb,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Lamp,
  Layers,
  Palette,
  Columns,
  Maximize2,
  Minimize2,
  ChevronDown,
  Camera,
  Wand2,
  Compass,
  Building2,
  Eye,
  Check,
  Tv,
  Briefcase,
  Trees,
  Car,
} from 'lucide-react';
import { HomePlan, Room, CatalogItem } from '../types/plan';

interface InteriorScopeBarProps {
  plan: HomePlan;
  onUpdatePlan: (plan: HomePlan) => void;
  activeFloor: number;
  onFloorChange: (floor: number) => void;
  targetRoomToFocus: Room | null;
  onFocusRoom: (room: Room) => void;
  isDark: boolean;
  onOpenCatalogCategory: (category: string) => void;
  onOpenAiStyler: () => void;
  studioLayout?: 'split' | '2d' | '3d' | 'tour';
  onLayoutChange?: (layout: 'split' | '2d' | '3d' | 'tour') => void;
}

// Quick Luxury Flooring Presets
const FLOORING_PRESETS = [
  { id: 'oak_parquet', name: 'Natural Oak Parquet', texture: 'hardwood_plank', color: '#c89666', preview: '#c89666', desc: 'Warm natural oak planks' },
  { id: 'walnut_herringbone', name: 'Smoked Walnut Herringbone', texture: 'parquet', color: '#5c3d2e', preview: '#5c3d2e', desc: 'Rich dark walnut' },
  { id: 'carrara_marble', name: 'Italian Carrara Marble', texture: 'marble', color: '#f1f5f9', preview: '#e2e8f0', desc: 'White vein polished stone' },
  { id: 'slate_tile', name: 'Charcoal Slate Tiles', texture: 'ceramic_tile_grid', color: '#334155', preview: '#334155', desc: 'Modern kitchen/bath stone' },
  { id: 'plush_carpet', name: 'Emerald Velvet Carpet', texture: 'carpet_plush', color: '#064e3b', preview: '#064e3b', desc: 'Soft acoustic bouclé' },
  { id: 'terracotta', name: 'Terracotta Warm Tile', texture: 'ceramic_tile_grid', color: '#b45309', preview: '#b45309', desc: 'Mediterranean warmth' },
];

// Quick Designer Wall Paint Presets
const WALL_PAINT_PRESETS = [
  { id: 'pure_white', name: 'Architectural Pure White', color: '#f8fafc', texture: 'matte_wall_paint', preview: '#f8fafc', desc: 'Crisp gallery finish' },
  { id: 'cashmere_greige', name: 'Warm Cashmere Greige', color: '#e2d9cc', texture: 'matte_wall_paint', preview: '#e2d9cc', desc: 'Cozy neutral tone' },
  { id: 'nordic_slate', name: 'Nordic Slate Grey', color: '#64748b', texture: 'matte_wall_paint', preview: '#64748b', desc: 'Contemporary mood' },
  { id: 'emerald_accent', name: 'Emerald Velvet Accent', color: '#064e3b', texture: 'matte_wall_paint', preview: '#064e3b', desc: 'Luxury jewel accent' },
  { id: 'midnight_navy', name: 'Midnight Blue Velvet', color: '#1e3a8a', texture: 'matte_wall_paint', preview: '#1e3a8a', desc: 'Dramatic modern wall' },
  { id: 'exposed_brick', name: 'Exposed Loft Brick', color: '#b45309', texture: 'brick', preview: '#b45309', desc: 'Industrial urban brick' },
  { id: 'wood_slats', name: 'Wood Slat Panels', color: '#3e3835', texture: 'royale_play', preview: '#5c3d2e', desc: 'Acoustic architectural slats' },
];

export const InteriorScopeBar: React.FC<InteriorScopeBarProps> = ({
  plan,
  onUpdatePlan,
  activeFloor,
  onFloorChange,
  targetRoomToFocus,
  onFocusRoom,
  isDark,
  onOpenCatalogCategory,
  onOpenAiStyler,
  studioLayout,
  onLayoutChange,
}) => {
  const [activeScopeDropdown, setActiveScopeDropdown] = useState<'floors' | 'walls' | 'lighting' | null>(null);

  const roomsOnFloor = (plan.rooms || []).filter((r) => (r.floorLevel ?? 0) === activeFloor);

  // Apply flooring preset to currently focused room (or first room)
  const handleApplyFlooring = (preset: typeof FLOORING_PRESETS[0]) => {
    const targetRoomId = targetRoomToFocus?.id || roomsOnFloor[0]?.id;
    if (!targetRoomId) return;

    const updatedRooms = (plan.rooms || []).map((r) => {
      if (r.id === targetRoomId) {
        return {
          ...r,
          floorColor: preset.color,
          floorTexture: preset.texture,
        };
      }
      return r;
    });

    onUpdatePlan({ ...plan, rooms: updatedRooms });
    setActiveScopeDropdown(null);
  };

  // Apply wall paint preset to all walls on this floor
  const handleApplyWallPaint = (preset: typeof WALL_PAINT_PRESETS[0]) => {
    const updatedWalls = (plan.walls || []).map((w) => {
      if ((w.floorLevel ?? 0) === activeFloor) {
        return {
          ...w,
          color: preset.color,
          texture: preset.texture,
        };
      }
      return w;
    });

    onUpdatePlan({ ...plan, walls: updatedWalls });
    setActiveScopeDropdown(null);
  };

  return (
    <div
      className={`flex-shrink-0 px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 z-30 select-none backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#080d1a]/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800 shadow-xs'
      }`}
    >
      {/* LEFT SECTION: Contextual Room Navigator & Focus */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 px-1 py-0.5">
          <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Room:
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {roomsOnFloor.length > 0 ? (
            roomsOnFloor.map((room) => {
              const isTarget = targetRoomToFocus?.id === room.id;
              let icon = '🛋️';
              const nameLower = (room.name || '').toLowerCase();
              if (nameLower.includes('bed')) icon = '🛏️';
              else if (nameLower.includes('bath') || nameLower.includes('toilet')) icon = '🛁';
              else if (nameLower.includes('kitchen') || nameLower.includes('dining')) icon = '🍳';
              else if (nameLower.includes('balcony') || nameLower.includes('terrace')) icon = '🌿';
              else if (nameLower.includes('office') || nameLower.includes('study')) icon = '💼';

              return (
                <button
                  key={room.id}
                  onClick={() => onFocusRoom(room)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                    isTarget
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs font-bold'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                  }`}
                  title={`Focus on ${room.name}`}
                >
                  <span>{icon}</span>
                  <span className="truncate max-w-[130px]">{room.name || 'Room'}</span>
                </button>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 italic px-2">Open Floor Area</span>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Complete Interior Scope Toolbars */}
      <div className="flex items-center gap-2">
        {/* 1. Quick Furniture Scope Drawers */}
        <div
          className={`flex items-center p-0.5 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => onOpenCatalogCategory('Living')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Living Room Sofas, Consoles, Armchairs"
          >
            <Armchair className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Living</span>
          </button>

          <button
            onClick={() => onOpenCatalogCategory('Bedroom')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Bedroom Beds, Wardrobes, Nightstands"
          >
            <Bed className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Bedroom</span>
          </button>

          <button
            onClick={() => onOpenCatalogCategory('Kitchen')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Kitchen Counters, Dining Tables, Stools"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Kitchen</span>
          </button>

          <button
            onClick={() => onOpenCatalogCategory('Bathroom')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Bathroom Tubs, Vanities, Showers & Laundry"
          >
            <Bath className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Bath</span>
          </button>

          <button
            onClick={() => onOpenCatalogCategory('Appliances')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Refrigerators, Washers, Dryers, ACs & Electronics"
          >
            <Tv className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden lg:inline">Appliances</span>
          </button>

          <button
            onClick={() => onOpenCatalogCategory('Office')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Desks, Ergonomic Chairs & Computer Setups"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Office</span>
          </button>

          <button
            onClick={() => onOpenCatalogCategory('Decor & Plants')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Rugs, Plants, Artwork, Mirrors & Decor"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Decor</span>
          </button>

          <button
            onClick={() => onOpenCatalogCategory('Outdoor')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Garden Trees, Plants, Hedges, Pergolas & Patio"
          >
            <Trees className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Garden</span>
          </button>

          <button
            onClick={() => onOpenCatalogCategory('Vehicles')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Garage Automobiles, SUVs, Sports Cars, Scooters, Bicycles"
          >
            <Car className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Garage</span>
          </button>
        </div>

        {/* 2. Room Flooring Scope Dropdown */}
        <div className="relative">
          <button
            onClick={() => setActiveScopeDropdown(activeScopeDropdown === 'floors' ? null : 'floors')}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeScopeDropdown === 'floors'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-2 ring-amber-500/20'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
            }`}
            title="Apply Luxury Flooring Textures to Room"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Flooring</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {activeScopeDropdown === 'floors' && (
            <div
              className={`absolute top-full right-0 mt-2 w-64 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                1-Click Room Flooring
              </div>
              <div className="space-y-1">
                {FLOORING_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyFlooring(p)}
                    className={`w-full px-2 py-1.5 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shrink-0 shadow-xs"
                      style={{ backgroundColor: p.preview }}
                    />
                    <div className="flex-1 truncate">
                      <div className="font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Wall Paint & Finishes Scope Dropdown */}
        <div className="relative">
          <button
            onClick={() => setActiveScopeDropdown(activeScopeDropdown === 'walls' ? null : 'walls')}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeScopeDropdown === 'walls'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 ring-2 ring-indigo-500/20'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
            }`}
            title="Apply Wall Finishes & Paint Colors"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Walls</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {activeScopeDropdown === 'walls' && (
            <div
              className={`absolute top-full right-0 mt-2 w-64 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                1-Click Designer Wall Paint
              </div>
              <div className="space-y-1">
                {WALL_PAINT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyWallPaint(p)}
                    className={`w-full px-2 py-1.5 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shrink-0 shadow-xs"
                      style={{ backgroundColor: p.preview }}
                    />
                    <div className="flex-1 truncate">
                      <div className="font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
