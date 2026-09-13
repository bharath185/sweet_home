'use client';

import React, { useState } from 'react';
import {
  Search,
  Armchair,
  Bed,
  UtensilsCrossed,
  Bath,
  DoorOpen,
  Lightbulb,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Box,
  Layers,
  X
} from 'lucide-react';
import { CatalogItem } from '../types/plan';

interface CatalogSidebarProps {
  catalog: CatalogItem[];
  onAddItem: (item: CatalogItem) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  theme?: 'dark' | 'light';
}

const CATEGORIES = [
  { id: 'All', name: 'All Furniture', icon: Building2 },
  { id: 'Living', name: 'Living Room', icon: Armchair },
  { id: 'Bedroom', name: 'Bedroom', icon: Bed },
  { id: 'Kitchen', name: 'Kitchen', icon: UtensilsCrossed },
  { id: 'Bathroom', name: 'Bathroom', icon: Bath },
  { id: 'Lighting', name: 'Lighting', icon: Lightbulb },
  { id: 'Doors & Windows', name: 'Doors & Windows', icon: DoorOpen },
  { id: 'Wall Designs', name: 'Wall Designs', icon: Sparkles },
  { id: 'Shelves & Storage', name: 'Shelves & Storage', icon: Box },
  { id: 'Decor & Plants', name: 'Decor & Plants', icon: Sparkles },
  { id: 'Stairs & Structural', name: 'Structural & Stairs', icon: Layers },
];

export const CatalogSidebar: React.FC<CatalogSidebarProps> = ({
  catalog,
  onAddItem,
  isOpen,
  onToggleOpen,
  theme = 'dark',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isDark = theme === 'dark';

  const filteredItems = catalog.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!isOpen) {
    return (
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onToggleOpen}
          className={`px-3 py-2 rounded-xl shadow-lg border backdrop-blur-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
            isDark
              ? 'bg-[#0f172a]/90 hover:bg-[#1e293b] border-slate-700/80 text-white shadow-black/40'
              : 'bg-white/95 hover:bg-slate-50 border-slate-200 text-slate-800 shadow-slate-300/40'
          }`}
          title="Open 3D Furniture Catalog Drawer"
        >
          <Box className="w-4 h-4 text-indigo-400" />
          <span>3D Catalog</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
          }`}>
            {catalog.length}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-3 bottom-3 z-30 flex">
      <aside
        className={`w-72 rounded-2xl border shadow-2xl backdrop-blur-xl flex flex-col h-full select-none overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${
          isDark
            ? 'bg-[#0b1222]/95 border-slate-800 text-slate-100 shadow-black/60'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-900/15'
        }`}
      >
        {/* Header with Title & Close Button */}
        <div className={`p-3.5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800/90 bg-[#0e172a]/80' : 'border-slate-200 bg-slate-50/90'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">3D Furniture Catalog</h2>
              <span className="text-[10px] text-slate-400">{filteredItems.length} models available</span>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Close Catalog Drawer (More Space for Design)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search 3D models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none transition ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-inner'
              }`}
            />
          </div>
        </div>

        {/* Categories Strip */}
        <div className={`px-2.5 py-2 border-b flex items-center gap-1 overflow-x-auto no-scrollbar ${
          isDark ? 'border-slate-800/60 bg-[#0c1424]/60' : 'border-slate-200/80 bg-slate-50/50'
        }`}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <cat.icon className="w-3 h-3" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No 3D items found.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onAddItem(item)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(item));
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex items-center gap-3 ${
                  isDark
                    ? 'bg-slate-900/60 hover:bg-slate-800/90 border-slate-800/80 hover:border-indigo-500/50 text-slate-200'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-indigo-400 text-slate-800 shadow-2xs hover:shadow-xs'
                }`}
                title={`Click to place ${item.name} (${item.width}x${item.depth}x${item.height} cm)`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <Box className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold truncate group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h4>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase font-bold tracking-wider ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.width} × {item.depth} × {item.height} cm
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};
