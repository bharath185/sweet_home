'use client';

import React, { useState } from 'react';
import {
  ListFilter,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Box,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { FurnitureItem } from '../types/plan';
import { formatDistance } from '../services/unitConverter';

interface FurnitureListPaneProps {
  furniture: FurnitureItem[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteItem: (id: string) => void;
  collidingItemIds?: Set<string>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  theme?: 'dark' | 'light';
}

export const FurnitureListPane: React.FC<FurnitureListPaneProps> = ({
  furniture,
  selectedId,
  onSelectId,
  onToggleVisibility,
  onToggleLock,
  onDeleteItem,
  collidingItemIds = new Set(),
  isOpen,
  setIsOpen,
  theme = 'dark',
}) => {
  const [search, setSearch] = useState('');
  const isDark = theme === 'dark';

  const filteredItems = furniture.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`${
        isDark
          ? 'bg-[#0a1120] border-slate-800 text-slate-100 shadow-slate-950/60'
          : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
      } border-t transition-all duration-300 flex flex-col z-20 select-none shadow-lg ${
        isOpen ? 'h-56' : 'h-10'
      }`}
    >
      {/* Header bar / Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 px-4 border-b flex items-center justify-between cursor-pointer text-xs transition select-none ${
          isDark
            ? 'bg-[#0d1527] hover:bg-[#111d35] border-slate-800/80 text-slate-200'
            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <ListFilter className="w-4 h-4 text-indigo-400" />
          <span className="font-bold">
            Floor Furniture & Fixtures List
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            {furniture.length} Placed
          </span>
          {collidingItemIds.size > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse">
              {collidingItemIds.size} Colliding
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isOpen && (
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Search className="w-3.5 h-3.5 absolute left-2 top-1.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter placed items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-7 pr-2 py-1 text-[11px] rounded-lg border focus:outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          )}
          <button className={`p-1 rounded transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Items Table / List */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No placed items on this floor.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredItems.map((item) => {
                const isSelected = selectedId === item.id;
                const isColliding = collidingItemIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectId(item.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? isDark
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-xs'
                          : 'bg-indigo-50 border-indigo-500 shadow-xs'
                        : isColliding
                        ? 'bg-rose-950/20 border-rose-500/50'
                        : isDark
                        ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : isDark
                          ? 'bg-slate-800 text-indigo-400'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        <Box className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className={`text-xs font-semibold truncate ${
                          isSelected ? 'text-indigo-400 font-bold' : isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {item.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.width}×{item.depth}×{item.height} cm
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onToggleVisibility(item.id)}
                        className={`p-1 rounded transition ${
                          item.isVisible === false
                            ? 'text-slate-500 hover:text-slate-300'
                            : 'text-indigo-400 hover:text-indigo-300'
                        }`}
                        title={item.isVisible === false ? 'Show' : 'Hide'}
                      >
                        {item.isVisible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => onToggleLock(item.id)}
                        className={`p-1 rounded transition ${
                          item.isLocked
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={item.isLocked ? 'Unlock' : 'Lock'}
                      >
                        {item.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
