'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Palette,
  Check,
  RefreshCw,
  Home,
  Layers,
  Wand2,
  ChevronRight,
  Eye
} from 'lucide-react';
import { HomePlan, Room, Wall, FurnitureItem } from '../types/plan';
import { PBRTextureId } from '../services/pbrTextures';

export interface StyleTheme {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  wallColor: string;
  wallTexture?: PBRTextureId;
  floorColor: string;
  floorTexture?: PBRTextureId;
  furnitureColors: {
    primarySeating: string;
    woodwork: string;
    accent: string;
    secondary: string;
  };
}

export const CURATED_THEMES: StyleTheme[] = [
  {
    id: 'japandi',
    name: 'Japandi Serenity',
    subtitle: 'Japanese Wabi-Sabi meets Scandinavian Simplicity',
    description: 'Natural solid oak flooring, warm rice-paper linen walls, textured oat upholstery, and earthen bamboo accents.',
    icon: '🎋',
    wallColor: '#f5f2eb',
    floorColor: '#d4a373',
    floorTexture: 'wood_oak',
    furnitureColors: {
      primarySeating: '#e6e2dd',
      woodwork: '#bfa588',
      accent: '#9c7c58',
      secondary: '#44403c',
    },
  },
  {
    id: 'scandi_light',
    name: 'Nordic Scandinavian',
    subtitle: 'Airy, Minimalist, Sunlit & Functional',
    description: 'Whitewashed pine herringbone parquet, crisp gallery white walls, pale arctic gray seating, and sky blue accents.',
    icon: '❄️',
    wallColor: '#f8fafc',
    floorColor: '#e2d9cc',
    floorTexture: 'wood_parquet',
    furnitureColors: {
      primarySeating: '#cbd5e1',
      woodwork: '#e0cfb3',
      accent: '#38bdf8',
      secondary: '#475569',
    },
  },
  {
    id: 'industrial_loft',
    name: 'Industrial Urban Loft',
    subtitle: 'Raw Textures, Steel, Concrete & Heritage',
    description: 'Polished architectural concrete floors, exposed rustic brick accent walls, distressed cognac leather sofas, and matte black steel frames.',
    icon: '🏭',
    wallColor: '#78716c',
    wallTexture: 'brick_red',
    floorColor: '#475569',
    floorTexture: 'concrete_loft',
    furnitureColors: {
      primarySeating: '#78350f',
      woodwork: '#1e293b',
      accent: '#d97706',
      secondary: '#0f172a',
    },
  },
  {
    id: 'italian_luxury',
    name: 'Milanese Penthouse',
    subtitle: 'Opulent High-End Architectural Glamour',
    description: 'Carrara white veined marble floors, moody deep charcoal walls, emerald green velvet sectionals, and brushed gold brass accents.',
    icon: '💎',
    wallColor: '#1e293b',
    floorColor: '#ffffff',
    floorTexture: 'marble_carrara',
    furnitureColors: {
      primarySeating: '#065f46',
      woodwork: '#09090b',
      accent: '#eab308',
      secondary: '#334155',
    },
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Villa',
    subtitle: 'Sunbaked Earth, Terracotta & Coastal Ease',
    description: 'Warm terracotta tile floors, sunlit textured stucco walls, washed cream linen seating, olive wood tables, and sage green pottery.',
    icon: '☀️',
    wallColor: '#fef3c7',
    floorColor: '#c2410c',
    floorTexture: 'tile_subway',
    furnitureColors: {
      primarySeating: '#fafaf9',
      woodwork: '#92400e',
      accent: '#65a30d',
      secondary: '#b45309',
    },
  },
  {
    id: 'mid_century',
    name: 'Mid-Century Modern',
    subtitle: 'Timeless 1960s Retro Palm Springs Style',
    description: 'Rich dark walnut plank flooring, warm off-white walls, iconic mustard yellow & teal seating, and warm teak wood credenzas.',
    icon: '🍸',
    wallColor: '#fefce8',
    floorColor: '#5c3d2e',
    floorTexture: 'wood_walnut',
    furnitureColors: {
      primarySeating: '#eab308',
      woodwork: '#78350f',
      accent: '#0d9488',
      secondary: '#ea580c',
    },
  },
];

interface AiStylerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: HomePlan;
  activeFloor: number;
  onUpdatePlan: (newPlan: HomePlan) => void;
}

export const AiStylerModal: React.FC<AiStylerModalProps> = ({
  isOpen,
  onClose,
  plan,
  activeFloor,
  onUpdatePlan,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>('japandi');
  const [scope, setScope] = useState<'entire_home' | 'active_floor'>('entire_home');
  const [customGeneratedTheme, setCustomGeneratedTheme] = useState<StyleTheme | null>(null);

  if (!isOpen) return null;

  const currentTheme =
    customGeneratedTheme && selectedThemeId === customGeneratedTheme.id
      ? customGeneratedTheme
      : CURATED_THEMES.find((t) => t.id === selectedThemeId) || CURATED_THEMES[0];

  // Procedural Color Harmony Generator (Simulated AI Engine)
  const handleGenerateAiTheme = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const compHue = (randomHue + 180) % 360;
    const triadicHue = (randomHue + 120) % 360;

    const toHex = (h: number, s: number, l: number) => {
      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };

    const wallCol = toHex(randomHue, 15, 93);
    const floorCol = toHex((randomHue + 30) % 360, 45, 60);
    const seatCol = toHex(randomHue, 55, 35);
    const woodCol = toHex((randomHue + 25) % 360, 50, 25);
    const accentCol = toHex(compHue, 75, 52);
    const secCol = toHex(triadicHue, 40, 40);

    const textures: PBRTextureId[] = ['wood_oak', 'wood_walnut', 'wood_parquet', 'marble_carrara', 'concrete_loft'];
    const randomTexture = textures[Math.floor(Math.random() * textures.length)];

    const aiTheme: StyleTheme = {
      id: `ai_${Date.now()}`,
      name: `AI Harmony #${Math.floor(Math.random() * 900 + 100)}`,
      subtitle: `Harmonic HSL Spectrum (${randomHue}° / ${compHue}°)`,
      description: 'Algorithmically synthesized interior harmony balancing daylight luminance, chromatic contrast, and organic material warmth.',
      icon: '✨',
      wallColor: wallCol,
      floorColor: floorCol,
      floorTexture: randomTexture,
      furnitureColors: {
        primarySeating: seatCol,
        woodwork: woodCol,
        accent: accentCol,
        secondary: secCol,
      },
    };

    setCustomGeneratedTheme(aiTheme);
    setSelectedThemeId(aiTheme.id);
  };

  const handleApplyTheme = () => {
    const isTargetFloor = (fl?: number) => {
      if (scope === 'entire_home') return true;
      return (fl ?? 0) === activeFloor;
    };

    // 1. Transform Rooms (floor colors & textures)
    const updatedRooms = plan.rooms.map((room) => {
      if (!isTargetFloor(room.floorLevel)) return room;
      return {
        ...room,
        floorColor: currentTheme.floorColor,
        floorTexture: currentTheme.floorTexture,
      };
    });

    // 2. Transform Walls
    const updatedWalls = plan.walls.map((wall) => {
      if (!isTargetFloor(wall.floorLevel)) return wall;
      return {
        ...wall,
        color: currentTheme.wallColor,
        wallTexture: currentTheme.wallTexture,
      };
    });

    // 3. Transform Furniture & Fixtures harmoniously
    const updatedFurniture = plan.furniture.map((item) => {
      if (!isTargetFloor(item.floorLevel)) return item;

      let newColor = item.color;
      const cat = (item.category || '').toLowerCase();
      const name = (item.name || '').toLowerCase();

      if (cat.includes('living') || name.includes('sofa') || name.includes('chair') || name.includes('armchair')) {
        newColor = currentTheme.furnitureColors.primarySeating;
      } else if (name.includes('table') || name.includes('desk') || name.includes('cabinet') || name.includes('bookcase')) {
        newColor = currentTheme.furnitureColors.woodwork;
      } else if (cat.includes('bedroom') || name.includes('bed')) {
        newColor = currentTheme.furnitureColors.accent;
      } else if (cat.includes('decor') || cat.includes('plant') || cat.includes('lighting')) {
        newColor = currentTheme.furnitureColors.secondary;
      } else {
        newColor = currentTheme.furnitureColors.woodwork;
      }

      return {
        ...item,
        color: newColor,
      };
    });

    onUpdatePlan({
      ...plan,
      rooms: updatedRooms,
      walls: updatedWalls,
      furniture: updatedFurniture,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Interior Room Styler</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Instant Aesthetics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Apply professionally curated interior design palettes or synthesize procedural color harmonies across your architectural plan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Top Actions: AI Generator & Scope */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Scope:</span>
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-700/80">
                <button
                  onClick={() => setScope('entire_home')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    scope === 'entire_home' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Entire Home</span>
                </button>
                <button
                  onClick={() => setScope('active_floor')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    scope === 'active_floor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Current Floor ({activeFloor === 0 ? 'Ground' : `Floor ${activeFloor}`})</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateAiTheme}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white transition flex items-center gap-2 shadow-md shadow-fuchsia-600/20 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Generate AI Harmony Palette</span>
            </button>
          </div>

          {/* Theme Grid */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Curated Architectural Aesthetic Themes
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[...(customGeneratedTheme ? [customGeneratedTheme] : []), ...CURATED_THEMES].map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/60'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{theme.icon}</span>
                          <span className="font-bold text-sm text-white">{theme.name}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-indigo-300 font-medium mb-1">{theme.subtitle}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{theme.description}</p>
                    </div>

                    {/* Palette Swatches Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Wall</span>
                        <span>Floor</span>
                        <span>Seating</span>
                        <span>Wood</span>
                        <span>Accent</span>
                      </div>
                      <div className="flex items-center gap-1.5 h-4 w-full rounded-md overflow-hidden p-0.5 bg-slate-900 border border-slate-700">
                        <div className="h-full flex-1 rounded-xs" style={{ backgroundColor: theme.wallColor }} title={`Wall: ${theme.wallColor}`} />
                        <div className="h-full flex-1 rounded-xs" style={{ backgroundColor: theme.floorColor }} title={`Floor: ${theme.floorColor}`} />
                        <div className="h-full flex-1 rounded-xs" style={{ backgroundColor: theme.furnitureColors.primarySeating }} title={`Seating: ${theme.furnitureColors.primarySeating}`} />
                        <div className="h-full flex-1 rounded-xs" style={{ backgroundColor: theme.furnitureColors.woodwork }} title={`Woodwork: ${theme.furnitureColors.woodwork}`} />
                        <div className="h-full flex-1 rounded-xs" style={{ backgroundColor: theme.furnitureColors.accent }} title={`Accent: ${theme.furnitureColors.accent}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Theme Preview Breakdown */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentTheme.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{currentTheme.name} Palette Breakdown</h4>
                  <p className="text-xs text-slate-400">{currentTheme.description}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                Floor Texture: {currentTheme.floorTexture || 'Standard Solid'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 rounded-lg shadow-inner border border-white/20" style={{ backgroundColor: currentTheme.wallColor }} />
                <span className="text-[10px] font-bold text-slate-300">Wall Tone</span>
                <span className="text-[9px] font-mono text-slate-500">{currentTheme.wallColor}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 rounded-lg shadow-inner border border-white/20" style={{ backgroundColor: currentTheme.floorColor }} />
                <span className="text-[10px] font-bold text-slate-300">Floor Finish</span>
                <span className="text-[9px] font-mono text-slate-500">{currentTheme.floorColor}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 rounded-lg shadow-inner border border-white/20" style={{ backgroundColor: currentTheme.furnitureColors.primarySeating }} />
                <span className="text-[10px] font-bold text-slate-300">Sofas / Chairs</span>
                <span className="text-[9px] font-mono text-slate-500">{currentTheme.furnitureColors.primarySeating}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 rounded-lg shadow-inner border border-white/20" style={{ backgroundColor: currentTheme.furnitureColors.woodwork }} />
                <span className="text-[10px] font-bold text-slate-300">Wood / Tables</span>
                <span className="text-[9px] font-mono text-slate-500">{currentTheme.furnitureColors.woodwork}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 rounded-lg shadow-inner border border-white/20" style={{ backgroundColor: currentTheme.furnitureColors.accent }} />
                <span className="text-[10px] font-bold text-slate-300">Accent Tone</span>
                <span className="text-[9px] font-mono text-slate-500">{currentTheme.furnitureColors.accent}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Applying this style will update room floors, wall colors & furniture finishes across {scope === 'entire_home' ? 'the entire home' : `Floor ${activeFloor}`}.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyTheme}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply {currentTheme.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
