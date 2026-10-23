'use client';

import React, { useState } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Armchair,
  Bed,
  UtensilsCrossed,
  Bath,
  Tv,
  Briefcase,
  Box,
  Trees,
  Car,
  Baby,
  Lightbulb,
  Sparkles,
  DoorOpen,
  Layers,
  Plus,
} from 'lucide-react';
import { CatalogItem } from '../types/plan';
import { CatalogThumbnail } from './CatalogThumbnail';
import { Catalog3DPreviewModal } from './Catalog3DPreviewModal';
import { Tooltip } from 'antd';

interface CollapsibleCatalogPanelProps {
  catalog: CatalogItem[];
  onAddItem?: (item: CatalogItem) => void;
  isOpen: boolean;
  onToggleOpen?: () => void;
  onToggle?: () => void;
  theme?: 'dark' | 'light';
}

const CATALOG_CATEGORIES = [
  { id: 'All', name: 'All', icon: Building2 },
  { id: 'Living', name: 'Living', icon: Armchair },
  { id: 'Bedroom', name: 'Bedroom', icon: Bed },
  { id: 'Kitchen', name: 'Kitchen', icon: UtensilsCrossed },
  { id: 'Bathroom', name: 'Bath', icon: Bath },
  { id: 'Appliances', name: 'Appliances', icon: Tv },
  { id: 'Office', name: 'Office', icon: Briefcase },
  { id: 'Storage', name: 'Storage', icon: Box },
  { id: 'Outdoor', name: 'Garden', icon: Trees },
  { id: 'Vehicles', name: 'Garage', icon: Car },
  { id: 'Lighting', name: 'Lighting', icon: Lightbulb },
  { id: 'Decor & Plants', name: 'Decor', icon: Sparkles },
  { id: 'Doors & Windows', name: 'Openings', icon: DoorOpen },
  { id: 'Stairs & Structural', name: 'Stairs', icon: Layers },
];

export const CollapsibleCatalogPanel: React.FC<CollapsibleCatalogPanelProps> = ({
  catalog,
  onAddItem,
  isOpen,
  onToggleOpen,
  onToggle,
  theme = 'light',
}) => {
  const toggleHandler = onToggleOpen || onToggle || (() => {});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewItem, setPreviewItem] = useState<CatalogItem | null>(null);

  const isDark = theme === 'dark';

  const filteredItems = catalog.filter((item) => {
    const itemCat = (item.category || '').toLowerCase();
    const selCat = selectedCategory.toLowerCase();

    let matchCat = true;
    if (selCat !== 'all') {
      if (selCat === 'living') matchCat = itemCat.includes('living') || itemCat.includes('sofa') || itemCat.includes('seating');
      else if (selCat === 'bedroom') matchCat = itemCat.includes('bed') || itemCat.includes('nightstand');
      else if (selCat === 'kitchen') matchCat = itemCat.includes('kitchen') || itemCat.includes('dining');
      else if (selCat === 'bath') matchCat = itemCat.includes('bath') || itemCat.includes('toilet');
      else if (selCat === 'appliances') matchCat = itemCat.includes('appliance') || itemCat.includes('tv');
      else if (selCat === 'office') matchCat = itemCat.includes('office') || itemCat.includes('desk');
      else if (selCat === 'storage') matchCat = itemCat.includes('storage') || itemCat.includes('wardrobe') || itemCat.includes('shelf');
      else if (selCat === 'garden') matchCat = itemCat.includes('outdoor') || itemCat.includes('garden');
      else if (selCat === 'garage') matchCat = itemCat.includes('vehicle') || itemCat.includes('car');
      else if (selCat === 'lighting') matchCat = itemCat.includes('light') || itemCat.includes('lamp');
      else if (selCat === 'decor') matchCat = itemCat.includes('decor') || itemCat.includes('plant') || itemCat.includes('rug');
      else if (selCat === 'openings') matchCat = itemCat.includes('door') || itemCat.includes('window');
      else if (selCat === 'stairs') matchCat = itemCat.includes('stair');
      else matchCat = itemCat.includes(selCat);
    }

    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Collapsed Toggle Tab */}
      {!isOpen && (
        <button
          onClick={toggleHandler}
          className={`absolute left-0 top-14 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-r-xl border-y border-r shadow-md font-sans text-xs font-bold transition-colors cursor-pointer select-none ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-indigo-400 hover:bg-slate-800 hover:text-white'
              : 'bg-white border-slate-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
          title="Open Furniture & Materials Catalog"
        >
          <Armchair className="w-4 h-4" />
          <span className="text-[11px]">Catalog</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      )}

      {/* Expanded Catalog Drawer */}
      {isOpen && (
        <aside
          className={`w-72 h-full flex flex-col shrink-0 select-none border-r z-30 transition-all font-sans relative ${
            isDark
              ? 'bg-[#0b1120] border-slate-800 text-slate-200'
              : 'bg-white border-slate-300 text-slate-800 shadow-sm'
          }`}
        >
          {/* Header */}
          <div
            className={`h-9 px-3 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'border-slate-800 bg-[#080d19]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold">Furniture Catalog</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-500 font-mono">
                {filteredItems.length}
              </span>
            </div>

            <Tooltip title="Collapse Catalog">
              <button
                onClick={toggleHandler}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {/* Search Bar */}
          <div className="p-2 border-b border-inherit shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search furniture & decor..."
                className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-md border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="px-2 py-1.5 border-b border-inherit overflow-x-auto flex gap-1 custom-scrollbar shrink-0">
            {CATALOG_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : isDark
                      ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No items found matching "{search}".
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(item));
                  }}
                  className={`p-2 rounded-xl border transition flex items-center justify-between gap-2.5 group cursor-grab active:cursor-grabbing ${
                    isDark
                      ? 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/40'
                      : 'bg-white hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-300 shadow-2xs'
                  }`}
                  onClick={() => setPreviewItem(item)}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 p-0.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <CatalogThumbnail
                      icon={item.icon}
                      name={item.name}
                      category={item.category}
                      size={40}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.width} × {item.depth} × {item.height} cm
                    </p>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddItem?.(item);
                    }}
                    className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:text-indigo-400 flex items-center justify-center transition shrink-0 cursor-pointer"
                    title="Add to floor plan"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {/* 3D Model Spec & Preview Modal */}
      <Catalog3DPreviewModal
        item={previewItem}
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        onAddItem={onAddItem}
      />
    </>
  );
};
