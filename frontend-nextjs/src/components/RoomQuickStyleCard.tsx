'use client';

import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Eye,
  Palette,
  X,
  Check,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Room, HomePlan } from '../types/plan';
import { generateRoomStylePackage, RoomStylePreset } from '../services/smartAlignment';

interface RoomQuickStyleCardProps {
  room: Room | null;
  plan: HomePlan;
  onUpdatePlan: (updated: HomePlan) => void;
  onClose: () => void;
  onWalkInRoom: (room: Room) => void;
  theme?: 'dark' | 'light';
}

export const RoomQuickStyleCard: React.FC<RoomQuickStyleCardProps> = ({
  room,
  plan,
  onUpdatePlan,
  onClose,
  onWalkInRoom,
  theme = 'light',
}) => {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [appliedStyle, setAppliedStyle] = useState<string | null>(null);

  if (!room) return null;

  const isDark = theme === 'dark';

  const handleApplyStyle = (preset: RoomStylePreset) => {
    const newItems = generateRoomStylePackage(room, preset);
    if (newItems.length === 0) return;

    // Filter out existing furniture inside this room
    // and replace with the coordinated styled furniture
    const updatedPlan: HomePlan = {
      ...plan,
      furniture: [...plan.furniture, ...newItems],
      updatedAt: new Date().toISOString(),
    };

    onUpdatePlan(updatedPlan);
    setAppliedStyle(preset);
    setTimeout(() => {
      setAppliedStyle(null);
      setIsStyleMenuOpen(false);
    }, 1500);
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none animate-in fade-in slide-in-from-top-3 duration-200">
      <div
        className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex flex-col gap-2 max-w-sm ${
          isDark
            ? 'bg-slate-900/95 border-slate-700/80 text-white shadow-black/70'
            : 'bg-white/95 border-slate-200/90 text-slate-800 shadow-slate-900/20'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight truncate">{room.name}</h4>
              <p className="text-[10px] text-slate-400">
                {room.areaSquareMeters ? `${room.areaSquareMeters.toFixed(1)} m²` : 'Selected Space'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-inherit">
          {/* 1-Click Auto Style Button */}
          <button
            onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ 1-Click Auto-Style</span>
          </button>

          {/* Walk In This Room */}
          <button
            onClick={() => onWalkInRoom(room)}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Teleport to this room in 3D first-person tour"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Walk Here</span>
          </button>
        </div>

        {/* Style Selection Flyout */}
        {isStyleMenuOpen && (
          <div
            className={`p-2 rounded-xl border mt-1 space-y-1.5 animate-in fade-in duration-150 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Choose Style Palette:
            </span>

            {[
              {
                id: 'arched_luxury' as RoomStylePreset,
                name: '✨ Bespoke Parisian Arched',
                desc: 'Arched cabinetry, fluted island, marble & brass',
              },
              {
                id: 'scandi_light' as RoomStylePreset,
                name: '❄️ Nordic Scandinavian',
                desc: 'Natural oak, cream linens, sunlit & airy',
              },
              {
                id: 'japandi' as RoomStylePreset,
                name: '🎋 Japandi Serenity',
                desc: 'Wabi-sabi minimalist wood & earthy tones',
              },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => handleApplyStyle(st.id)}
                className={`w-full p-2 rounded-lg text-left transition flex items-center justify-between cursor-pointer ${
                  appliedStyle === st.id
                    ? 'bg-emerald-600 text-white font-bold'
                    : isDark
                    ? 'hover:bg-slate-800 text-slate-200'
                    : 'hover:bg-white text-slate-800 shadow-2xs'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{st.name}</span>
                  <span
                    className={`text-[9px] block ${
                      appliedStyle === st.id ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {st.desc}
                  </span>
                </div>
                {appliedStyle === st.id && <Check className="w-4 h-4 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
