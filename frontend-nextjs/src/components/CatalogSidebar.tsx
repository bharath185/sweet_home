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
  PlusCircle
} from 'lucide-react';
import { CatalogItem } from '../types/plan';

interface CatalogSidebarProps {
  catalog: CatalogItem[];
  onAddItem: (item: CatalogItem) => void;
  onOpenCreateItemModal?: () => void;
}

const CATEGORIES = [
  { id: 'All', name: 'All Furniture', icon: Building2 },
  { id: 'Living', name: 'Living Room', icon: Armchair },
  { id: 'Bedroom', name: 'Bedroom', icon: Bed },
  { id: 'Kitchen', name: 'Kitchen', icon: UtensilsCrossed },
  { id: 'Bathroom', name: 'Bathroom', icon: Bath },
  { id: 'Doors & Windows', name: 'Doors & Windows', icon: DoorOpen },
  { id: 'Lighting', name: 'Lighting', icon: Lightbulb },
  { id: 'Stairs & Structural', name: 'Structural & Stairs', icon: Building2 },
];

export const CatalogSidebar: React.FC<CatalogSidebarProps> = ({
  catalog,
  onAddItem,
  onOpenCreateItemModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isExpanded = !isCollapsed || isHovered;

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
      className={`bg-white/95 backdrop-blur-xl border-r border-slate-200/90 flex flex-col h-full select-none shadow-sm shadow-slate-900/5 relative z-10 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-72' : 'w-14'
      }`}
    >
      {/* Header & Search */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between mb-2">
          {isExpanded && (
            <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Catalog</span>
            </h2>
          )}
          {!isExpanded && (
            <div className="w-full flex justify-center">
              <Building2 className="w-4 h-4 text-sky-600" />
            </div>
          )}
          {isExpanded && (
            <div className="flex items-center gap-1.5">
              {onOpenCreateItemModal && (
                <button
                  onClick={onOpenCreateItemModal}
                  className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-[10px] font-bold shadow-xs transition flex items-center gap-1"
                  title="Create New 3D Item with Design Studio"
                >
                  <Plus className="w-3 h-3" />
                  <span>New 3D</span>
                </button>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono font-bold">
                {filteredItems.length}
              </span>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                title={isCollapsed ? 'Expand Catalog' : 'Collapse Catalog'}
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="relative animate-in fade-in duration-150">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 shadow-sm transition"
            />
          </div>
        )}
      </div>

      {/* Category Tabs Scroll / Collapsed Category Rail */}
      {isExpanded ? (
        <div className="flex gap-1.5 p-2.5 overflow-x-auto border-b border-slate-200 custom-scrollbar bg-slate-50/30">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setIsCollapsed(false);
                }}
                className={`p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={cat.name}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Item Grid (Only rendered when expanded) */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start custom-scrollbar animate-in fade-in duration-150">
          {/* Create Item Quick Banner Card */}
          {onOpenCreateItemModal && (
            <div
              onClick={onOpenCreateItemModal}
              className="col-span-2 p-2.5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-200/80 hover:border-sky-400 cursor-pointer transition-all hover:shadow-md flex items-center justify-between gap-2 shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-sky-600 transition">
                    + Create New 3D Item
                  </div>
                  <div className="text-[9px] text-slate-500">Design Studio with 3D Preview</div>
                </div>
              </div>
              <PlusCircle className="w-4 h-4 text-sky-600 group-hover:scale-110 transition" />
            </div>
          )}

          {filteredItems.map((item) => (
            <div
              key={item.id}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(item));
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onAddItem(item)}
              className="group relative bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-sky-400 rounded-2xl p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 shadow-sm"
              title={`${item.name} (${item.width}x${item.depth}x${item.height}cm) - Drag into 2D or 3D view`}
            >
              {/* Custom Badge */}
              {item.isCustom && (
                <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-[8px] font-bold shadow-2xs">
                  Custom
                </div>
              )}

              {/* Thumbnail */}
              <div className="w-14 h-14 relative flex items-center justify-center bg-slate-50 rounded-xl p-1 mb-1.5 border border-slate-100 group-hover:border-sky-200 transition shadow-inner">
                {item.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain filter group-hover:scale-105 transition drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Armchair className="w-6 h-6 text-slate-400 group-hover:text-sky-600 transition" />
                )}
              </div>

              {/* Title & Dimensions */}
              <div className="w-full text-center">
                <div className="text-[11px] font-semibold text-slate-800 group-hover:text-sky-600 truncate transition">
                  {item.name}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {Math.round(item.width)}×{Math.round(item.depth)}×{Math.round(item.height)}cm
                </div>
              </div>

              {/* Quick Add Overlay Icon */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-sky-600 hover:bg-sky-500 text-white rounded-full p-1 shadow-sm">
                <Plus className="w-3 h-3" />
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
              No furniture matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}

      {/* Bottom Hint */}
      {isExpanded && (
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-center font-medium">
          Click or drag item to place in room
        </div>
      )}
    </aside>
  );
};

export default CatalogSidebar;

