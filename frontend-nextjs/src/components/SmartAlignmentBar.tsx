'use client';

import React from 'react';
import {
  Magnet,
  Maximize2,
  RotateCw,
  FlipHorizontal2,
  Palette,
  Trash2,
  Sparkles,
  Check,
  Compass,
} from 'lucide-react';
import { FurnitureItem, Wall, Room, HomePlan } from '../types/plan';
import {
  snapFurnitureToNearestWall,
  centerFurnitureInRoom,
  rotateFurnitureByAngle,
} from '../services/smartAlignment';

interface SmartAlignmentBarProps {
  plan: HomePlan;
  selectedFurniture: FurnitureItem | null;
  onUpdatePlan: (updated: HomePlan) => void;
  onDeselect: () => void;
  theme?: 'dark' | 'light';
}

const QUICK_FINISHES = [
  { name: 'Natural Oak', color: '#d4a373' },
  { name: 'Parisian Sage', color: '#4d6059' },
  { name: 'Fluted Greige', color: '#c29f79' },
  { name: 'Calacatta White', color: '#faf8f5' },
  { name: 'Emerald Velvet', color: '#065f46' },
  { name: 'Charcoal Noir', color: '#1e293b' },
  { name: 'Brushed Brass', color: '#d4af37' },
];

export const SmartAlignmentBar: React.FC<SmartAlignmentBarProps> = ({
  plan,
  selectedFurniture,
  onUpdatePlan,
  onDeselect,
  theme = 'light',
}) => {
  if (!selectedFurniture) return null;

  const isDark = theme === 'dark';

  const handleSnapToWall = () => {
    const updated = snapFurnitureToNearestWall(selectedFurniture, plan.walls, plan.rooms);
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === updated.id ? updated : f)),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCenterInRoom = () => {
    const updated = centerFurnitureInRoom(selectedFurniture, plan.rooms);
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === updated.id ? updated : f)),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRotate90 = () => {
    const updated = rotateFurnitureByAngle(selectedFurniture, Math.PI / 2);
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === updated.id ? updated : f)),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleFlip180 = () => {
    const updated = rotateFurnitureByAngle(selectedFurniture, Math.PI);
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === updated.id ? updated : f)),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleApplyFinish = (hexColor: string) => {
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedFurniture.id
          ? {
              ...f,
              color: hexColor,
              partColors: f.partColors
                ? { ...f.partColors, body: hexColor, top: hexColor, doors: hexColor }
                : undefined,
            }
          : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDelete = () => {
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.filter((f) => f.id !== selectedFurniture.id),
      updatedAt: new Date().toISOString(),
    });
    onDeselect();
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none">
      <div
        className={`px-3 py-2 rounded-2xl border shadow-2xl flex items-center gap-2 max-w-full overflow-x-auto ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-white shadow-black/70'
            : 'bg-white border-slate-300 text-slate-800 shadow-slate-900/20'
        }`}
      >
        {/* Selected Item Label */}
        <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-inherit shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold truncate max-w-[120px] sm:max-w-[160px]">
            {selectedFurniture.name}
          </span>
        </div>

        {/* 1. Snap to Wall (The big customer lifesaver!) */}
        <button
          onClick={handleSnapToWall}
          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer shrink-0"
          title="Instantly snap this item flush against the nearest wall and face into the room"
        >
          <Magnet className="w-3.5 h-3.5 text-indigo-200" />
          <span>Snap to Wall</span>
        </button>

        {/* 2. Center in Room */}
        <button
          onClick={handleCenterInRoom}
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0 ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Center this item in the room it's currently inside"
        >
          <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Center</span>
        </button>

        {/* 3. Rotate 90° */}
        <button
          onClick={handleRotate90}
          className={`p-1.5 rounded-xl transition active:scale-95 cursor-pointer shrink-0 ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Turn 90° clockwise"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* 4. Flip 180° */}
        <button
          onClick={handleFlip180}
          className={`p-1.5 rounded-xl transition active:scale-95 cursor-pointer shrink-0 ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Flip facing direction 180°"
        >
          <FlipHorizontal2 className="w-3.5 h-3.5" />
        </button>

        {/* Quick Finishes Swatches */}
        <div className="flex items-center gap-1 pl-1.5 pr-1 border-l border-inherit shrink-0">
          {QUICK_FINISHES.map((fin) => {
            const isMatch = (selectedFurniture.color || '').toLowerCase() === fin.color.toLowerCase();
            return (
              <button
                key={fin.name}
                onClick={() => handleApplyFinish(fin.color)}
                style={{ backgroundColor: fin.color }}
                className={`w-5 h-5 rounded-full border transition hover:scale-115 cursor-pointer shrink-0 ${
                  isMatch
                    ? 'border-indigo-500 ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900'
                    : 'border-white/40 shadow-2xs'
                }`}
                title={`Finish: ${fin.name}`}
              />
            );
          })}
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition active:scale-95 cursor-pointer shrink-0 ml-1"
          title="Remove item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
