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
}) => {
  const [search, setSearch] = useState('');

  const filteredItems = furniture.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`bg-white border-t border-slate-200 transition-all duration-300 flex flex-col z-20 select-none shadow-lg ${
        isOpen ? 'h-56' : 'h-10'
      }`}
    >
      {/* Header bar / Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 bg-slate-50 hover:bg-slate-100/80 border-b border-slate-200 flex items-center justify-between cursor-pointer text-xs transition select-none"
      >
        <div className="flex items-center gap-2.5">
          <ListFilter className="w-4 h-4 text-sky-600" />
          <span className="font-bold text-slate-800">
            Home Furniture List (Bill of Materials)
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            {furniture.length} Items Placed
          </span>
          {collidingItemIds.size > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold animate-pulse">
              {collidingItemIds.size} Colliding
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-[11px]">
            {isOpen ? 'Click to minimize BOM table' : 'Click to expand BOM & item locks'}
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-sky-600" /> : <ChevronUp className="w-4 h-4 text-sky-600" />}
        </div>
      </div>

      {/* Expanded Table Content */}
      {isOpen && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Filter subbar */}
          <div className="p-2 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search placed items by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2 px-3.5 w-10 text-center">View</th>
                  <th className="py-2 px-3.5 w-10 text-center">Lock</th>
                  <th className="py-2 px-3.5">Item Name</th>
                  <th className="py-2 px-3.5">Category</th>
                  <th className="py-2 px-3.5">Dimensions (W×D×H)</th>
                  <th className="py-2 px-3.5">Elevation</th>
                  <th className="py-2 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((f) => {
                  const isSelected = selectedId === f.id;
                  const isColliding = collidingItemIds.has(f.id);
                  const isVisible = f.isVisible ?? true;
                  const isLocked = f.isLocked ?? false;

                  return (
                    <tr
                      key={f.id}
                      onClick={() => onSelectId(f.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-50 text-slate-900 font-semibold'
                          : isColliding
                          ? 'bg-rose-50/80 hover:bg-rose-100/80'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Visibility Toggle */}
                      <td className="py-2 px-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(f.id);
                          }}
                          className={`p-1 rounded-lg hover:bg-slate-100 transition ${
                            isVisible ? 'text-sky-600' : 'text-slate-300'
                          }`}
                          title={isVisible ? 'Hide from 2D/3D' : 'Show in 2D/3D'}
                        >
                          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Lock Toggle */}
                      <td className="py-2 px-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLock(f.id);
                          }}
                          className={`p-1 rounded-lg hover:bg-slate-100 transition ${
                            isLocked ? 'text-amber-500' : 'text-slate-300'
                          }`}
                          title={isLocked ? 'Locked (Cannot move)' : 'Unlocked'}
                        >
                          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Name & Icon */}
                      <td className="py-2 px-3.5 flex items-center gap-2">
                        {f.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.icon} alt={f.name} className="w-4 h-4 object-contain rounded" />
                        ) : (
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className="truncate max-w-[160px] font-medium text-slate-900">{f.name}</span>
                        {isColliding && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 font-bold">
                            Collision
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3.5 text-slate-500">{f.category}</td>

                      <td className="py-2 px-3.5 font-mono text-slate-700">
                        {Math.round(f.width)}×{Math.round(f.depth)}×{Math.round(f.height)} cm
                      </td>

                      <td className="py-2 px-3.5 font-mono text-slate-700">
                        {Math.round(f.elevation || 0)} cm
                      </td>

                      <td className="py-2 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(f.id);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete from plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
