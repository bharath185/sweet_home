'use client';

import React, { useState } from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  Columns,
  Eye,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { HomePlan, Room, VisitorCameraState } from '../types/plan';
import { PlanCanvas2D } from './PlanCanvas2D';

interface MinimizedFloorPlanProps {
  plan: HomePlan;
  onUpdatePlan: (plan: HomePlan) => void;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  activeFloor: number;
  onFloorChange: (floor: number) => void;
  floorMode: 'single' | 'sideBySide' | 'stacked';
  onFloorModeChange: (mode: 'single' | 'sideBySide' | 'stacked') => void;
  collidingItemIds: Set<string>;
  collisionReasons: Map<string, string>;
  onOpenBlueprintModal: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  visitorCamera: VisitorCameraState;
  onUpdateVisitorCamera: (state: Partial<VisitorCameraState>) => void;
  isWalkMode: boolean;
  onToggleWalkMode: () => void;
  onExpandToSplit: () => void;
  isDark: boolean;
}

export const MinimizedFloorPlan: React.FC<MinimizedFloorPlanProps> = ({
  plan,
  onUpdatePlan,
  selectedId,
  onSelectId,
  activeFloor,
  onFloorChange,
  floorMode,
  onFloorModeChange,
  collidingItemIds,
  collisionReasons,
  onOpenBlueprintModal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  visitorCamera,
  onUpdateVisitorCamera,
  isWalkMode,
  onToggleWalkMode,
  onExpandToSplit,
  isDark,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Total floor area
  const totalArea = (plan.rooms || []).reduce((acc, r) => acc + (r.areaSquareMeters || 0), 0);
  const roomsCount = (plan.rooms || []).length;

  if (isCollapsed) {
    return (
      <div
        onClick={() => setIsCollapsed(false)}
        className="absolute bottom-5 left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl cursor-pointer transition-all hover:scale-105 select-none"
        title="Click to expand 2D Floor Plan Navigator"
      >
        <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-black">
          📐
        </div>
        <div className="text-xs font-bold">Floor Plan Navigator</div>
        <div className="text-[10px] text-slate-400">
          ({totalArea.toFixed(0)} m² • {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'})
        </div>
        <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </div>
    );
  }

  return (
    <div
      className={`absolute bottom-5 left-5 z-20 w-[310px] rounded-2xl overflow-hidden backdrop-blur-xl border shadow-2xl transition-all select-none ${
        isDark
          ? 'bg-[#0b1120]/95 border-slate-700/80 text-slate-100 shadow-black/60'
          : 'bg-white/95 border-slate-300 text-slate-800 shadow-xl'
      }`}
    >
      {/* Header Bar */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between text-xs font-bold ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/80'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-sm">📐</span>
          <span className="truncate">Floor Plan Navigator</span>
          <span className="text-[10px] font-semibold text-slate-400 truncate">
            {totalArea > 0 ? `${totalArea.toFixed(0)} m²` : 'CAD'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Expand to 50/50 Split button */}
          <button
            onClick={onExpandToSplit}
            className={`p-1 rounded-md transition cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title="Expand to Side-by-Side 50/50 Split View"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Minimize button */}
          <button
            onClick={() => setIsCollapsed(true)}
            className={`p-1 rounded-md transition cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title="Minimize floor plan to compact badge"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Miniature 2D Canvas */}
      <div className="w-full h-[200px] relative bg-slate-950 overflow-hidden">
        <PlanCanvas2D
          plan={plan}
          onUpdatePlan={onUpdatePlan}
          selectedId={selectedId}
          onSelectId={onSelectId}
          activeFloor={activeFloor}
          onFloorChange={onFloorChange}
          floorMode={floorMode}
          onFloorModeChange={onFloorModeChange}
          collidingItemIds={collidingItemIds}
          collisionReasons={collisionReasons}
          onOpenBlueprintModal={onOpenBlueprintModal}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          visitorCamera={visitorCamera}
          onUpdateVisitorCamera={onUpdateVisitorCamera}
          isWalkMode={isWalkMode}
          onToggleWalkMode={onToggleWalkMode}
        />

        {/* Subtle overlay pill with hint */}
        <div className="absolute top-1.5 right-1.5 pointer-events-none px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-medium text-slate-300 border border-white/10">
          Interactive Mini-Map
        </div>
      </div>

      {/* Footer Info */}
      <div
        className={`px-3 py-1.5 text-[10px] flex items-center justify-between border-t ${
          isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        <span>{roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'} • {plan.walls?.length || 0} Walls</span>
        <button
          onClick={onExpandToSplit}
          className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
        >
          Expand Split ⤢
        </button>
      </div>
    </div>
  );
};
