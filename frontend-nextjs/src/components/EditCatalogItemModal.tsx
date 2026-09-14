'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, Palette, Check, Box, Save } from 'lucide-react';
import { CatalogItem } from '../types/plan';
import { CatalogThumbnail3D } from './CatalogThumbnail3D';

interface EditCatalogItemModalProps {
  item: CatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: CatalogItem) => void;
}

const CATEGORIES = [
  'Living',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Lighting',
  'Doors & Windows',
  'Wall Designs',
  'Shelves & Storage',
  'Decor & Plants',
  'Stairs & Structural',
];

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#1e293b',
  '#0284c7', '#38bdf8', '#059669', '#10b981', '#d97706', '#f59e0b',
  '#dc2626', '#ef4444', '#7c3aed', '#a855f7', '#78350f', '#b45309'
];

export const EditCatalogItemModal: React.FC<EditCatalogItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Living');
  const [width, setWidth] = useState(50);
  const [depth, setDepth] = useState(50);
  const [height, setHeight] = useState(50);
  const [defaultColor, setDefaultColor] = useState('#94a3b8');
  const [placementType, setPlacementType] = useState<'floor' | 'tabletop' | 'ceiling' | 'wall'>('floor');
  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0.1);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || 'Living');
      setWidth(item.width || 50);
      setDepth(item.depth || 50);
      setHeight(item.height || 50);
      setDefaultColor(item.defaultColor || '#94a3b8');
      setPlacementType((item.placementType as any) || 'floor');
      setRoughness(item.roughness ?? 0.5);
      setMetalness(item.metalness ?? 0.1);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: CatalogItem = {
      ...item,
      name: name.trim(),
      category,
      width: Math.max(5, Number(width) || 5),
      depth: Math.max(5, Number(depth) || 5),
      height: Math.max(5, Number(height) || 5),
      defaultColor,
      placementType,
      placeOnTable: placementType === 'tabletop',
      roughness,
      metalness,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Edit Catalog Item</h3>
              <p className="text-[11px] text-slate-400">Modify dimensions, finishes, and catalog metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar text-xs">
          {/* Top preview row */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-16 h-16 rounded-lg bg-[#0b1120] border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
              <CatalogThumbnail3D
                model={item.model}
                category={category}
                name={name}
                width={width}
                depth={depth}
                height={height}
                color={defaultColor}
                size={60}
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{category}</span>
              <h4 className="text-sm font-bold text-white truncate">{name || 'Unnamed Item'}</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {width} × {depth} × {height} cm
              </p>
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Dimensions */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dimensions (cm)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Width (X)</span>
                <input
                  type="number"
                  min={5}
                  value={width}
                  onChange={(e) => setWidth(Math.max(5, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 font-mono text-xs rounded-lg border bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Depth (Y)</span>
                <input
                  type="number"
                  min={5}
                  value={depth}
                  onChange={(e) => setDepth(Math.max(5, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 font-mono text-xs rounded-lg border bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Height (Z)</span>
                <input
                  type="number"
                  min={5}
                  value={height}
                  onChange={(e) => setHeight(Math.max(5, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 font-mono text-xs rounded-lg border bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Placement Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Placement Surface</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'floor', label: 'Floor' },
                { id: 'tabletop', label: 'Tabletop' },
                { id: 'ceiling', label: 'Ceiling' },
                { id: 'wall', label: 'Wall' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlacementType(p.id as any)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    placementType === p.id
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Material */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Default Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={defaultColor}
                  onChange={(e) => setDefaultColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="font-mono text-xs text-indigo-400 uppercase">{defaultColor}</span>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setDefaultColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-full h-5 rounded-xs border transition hover:scale-110 cursor-pointer ${
                    defaultColor.toLowerCase() === c.toLowerCase()
                      ? 'border-indigo-500 ring-2 ring-indigo-400'
                      : 'border-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Roughness & Metalness */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Roughness (Matte / Gloss)</span>
                <span className="font-mono text-indigo-400">{Math.round(roughness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={roughness}
                onChange={(e) => setRoughness(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Metallic Reflection</span>
                <span className="font-mono text-indigo-400">{Math.round(metalness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={metalness}
                onChange={(e) => setMetalness(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
