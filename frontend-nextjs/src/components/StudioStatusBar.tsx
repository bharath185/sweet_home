'use client';

import React, { useState } from 'react';
import { Popover, Button, Badge, Tooltip } from 'antd';
import {
  AlertTriangle,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Box,
  MapPin,
  ChevronUp,
} from 'lucide-react';
import { HomePlan, FurnitureItem } from '../types/plan';

interface StudioStatusBarProps {
  plan: HomePlan;
  activeFloor: number;
  collidingItemIds: Set<string>;
  collisionReasons?: Map<string, string>;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  zoomScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onToggleFurnitureList?: () => void;
  theme?: 'dark' | 'light';
}

export const StudioStatusBar: React.FC<StudioStatusBarProps> = ({
  plan,
  activeFloor,
  collidingItemIds,
  collisionReasons = new Map(),
  selectedId,
  onSelectId,
  zoomScale,
  onZoomIn,
  onZoomOut,
  onFit,
  onToggleFurnitureList,
  theme = 'light',
}) => {
  const [isIssuesOpen, setIsIssuesOpen] = useState(false);
  const isDark = theme === 'dark';

  const floorFurniture = plan.furniture.filter((f) => (f.floorLevel ?? 0) === activeFloor);
  const floorRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === activeFloor);
  const floorWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === activeFloor);

  // Collect colliding items
  const collidingItems: FurnitureItem[] = plan.furniture.filter((f) =>
    collidingItemIds.has(f.id)
  );

  const issuesCount = collidingItems.length;

  const issuesContent = (
    <div className="w-80 max-h-96 flex flex-col font-sans select-none text-xs">
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold">
          {issuesCount > 0 ? (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Layout Issues ({issuesCount})</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>All Clear (0 Issues)</span>
            </>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Floor {activeFloor}
        </span>
      </div>

      <div className="overflow-y-auto max-h-72 p-2 space-y-1.5 custom-scrollbar">
        {issuesCount === 0 ? (
          <div className="p-4 text-center text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-1" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No Collisions Detected
            </p>
            <p className="text-[11px] text-slate-400">
              All furniture, walls, and doorways have proper architectural clearances.
            </p>
          </div>
        ) : (
          collidingItems.map((item) => {
            const isSelected = selectedId === item.id;
            const reason = collisionReasons.get(item.id) || 'Overlapping with adjacent structure';
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectId(item.id);
                  setIsIssuesOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg border transition flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                    {reason}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {item.width} × {item.depth} cm • {item.category || 'Furniture'}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 shrink-0">
                  Select
                </span>
              </button>
            );
          })
        )}
      </div>

      {issuesCount > 0 && (
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center">
          Click an item to select and center it on the canvas
        </div>
      )}
    </div>
  );

  return (
    <footer
      className={`h-7 px-3 border-t flex items-center justify-between text-[11px] select-none shrink-0 z-30 transition-colors font-sans ${
        isDark
          ? 'bg-[#0a101d] border-slate-800/80 text-slate-300'
          : 'bg-[#edf2f7] border-slate-300/80 text-slate-700'
      }`}
    >
      {/* Left: Summary Metrics */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleFurnitureList}
          className="font-medium flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          title="Click to toggle furniture & fixtures inventory pane"
        >
          <Box className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            <strong>{floorFurniture.length}</strong> items
          </span>
        </button>

        <span className="text-slate-400">•</span>

        <span className="font-medium flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-500" />
          <span>
            <strong>{floorRooms.length}</strong> rooms
          </span>
        </span>

        <span className="text-slate-400">•</span>

        <span className="font-medium hidden sm:inline-flex items-center gap-1.5">
          <span>
            <strong>{floorWalls.length}</strong> walls
          </span>
        </span>
      </div>

      {/* Center: Single "N issues" button */}
      <div className="flex items-center justify-center">
        <Popover
          content={issuesContent}
          trigger="click"
          open={isIssuesOpen}
          onOpenChange={setIsIssuesOpen}
          placement="top"
        >
          <button
            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer border ${
              issuesCount > 0
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title={issuesCount > 0 ? `${issuesCount} items overlapping or colliding` : 'No collision issues'}
          >
            {issuesCount > 0 ? (
              <>
                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{issuesCount} {issuesCount === 1 ? 'issue' : 'issues'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>0 issues</span>
              </>
            )}
            <ChevronUp className="w-3 h-3 opacity-60" />
          </button>
        </Popover>
      </div>

      {/* Right: Zoom controls and Fit */}
      <div className="flex items-center gap-1">
        <Tooltip title="Zoom Out (-)">
          <button
            onClick={onZoomOut}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
        </Tooltip>

        <span
          className="font-mono text-[10px] min-w-[36px] text-center font-bold px-1 py-0.5 rounded text-slate-800 dark:text-slate-200"
          title="Current Zoom Level"
        >
          {Math.round(zoomScale * 100)}%
        </span>

        <Tooltip title="Zoom In (+)">
          <button
            onClick={onZoomIn}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </Tooltip>

        <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700 mx-1" />

        <Tooltip title="Fit Plan & 3D to Viewport">
          <button
            onClick={onFit}
            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[10px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 text-indigo-500" />
            <span>Fit</span>
          </button>
        </Tooltip>
      </div>
    </footer>
  );
};
