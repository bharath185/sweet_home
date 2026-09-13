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
  Plus,
  Sparkles,
  Box,
  Layers
} from 'lucide-react';
import { CatalogItem } from '../types/plan';

interface CatalogSidebarProps {
  catalog: CatalogItem[];
  onAddItem: (item: CatalogItem) => void;
  onOpenCreateItemModal?: () => void;
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
  onOpenCreateItemModal,
  theme = 'dark',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isExpanded = !isCollapsed || isHovered;
  const isDark = theme === 'dark';

  const filteredItems = catalog.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${
        isDark
          ? 'bg-[#0a1120] border-slate-800 text-slate-100 shadow-slate-950/50'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-900/5'
      } border-r flex flex-col h-full select-none relative z-10 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-72' : 'w-14'
      }`}
    >
      {/* Header & Search */}
      <div className={`p-3 border-b ${isDark ? 'border-slate-800/80 bg-[#0d1527]' : 'border-slate-200 bg-slate-50/80'}`}>
        <div className="flex items-center justify-between mb-2">
          {isExpanded && (
            <h2 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <Box className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>3D Catalog</span>
            </h2>
          )}
          {!isExpanded && (
            <div className="w-full flex justify-center">
              <Box className="w-4 h-4 text-indigo-400" />
            </div>
          )}
          {isExpanded && (
            <div className="flex items-center gap-1.5">
              {onOpenCreateItemModal && (
                <button
                  onClick={onOpenCreateItemModal}
                  className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-[10px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                  title="Create New 3D Item"
                >
                  <Plus className="w-3 h-3" />
                  <span>New 3D</span>
                </button>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {filteredItems.length}
              </span>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-1 rounded-lg transition ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title={isCollapsed ? 'Pin Open' : 'Collapse'}
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {isExpanded && (
          <div className="relative mt-2">
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
        )}
      </div>

      {/* Category Pills Strip */}
      {isExpanded && (
        <div className={`px-2.5 py-2 border-b flex items-center gap-1 overflow-x-auto no-scrollbar ${
          isDark ? 'border-slate-800/60 bg-[#0c1424]' : 'border-slate-200/80 bg-slate-50/50'
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
      )}

      {/* Catalog Items Grid */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
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
                  ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 hover:border-indigo-500/50 text-slate-200'
                  : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-indigo-400 text-slate-800 shadow-2xs hover:shadow-xs'
              }`}
              title={`Add ${item.name} (${item.width}x${item.depth}x${item.height} cm)`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Box className="w-5 h-5" />
              </div>

              {isExpanded && (
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
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
