'use client';

import React, { useState } from 'react';
import { X, UploadCloud, Check, Sliders, Eye, EyeOff, Trash2, Image as ImageIcon } from 'lucide-react';
import { BlueprintImage } from '../types/plan';

interface BlueprintImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlueprint?: BlueprintImage;
  onSaveBlueprint: (blueprint: BlueprintImage | undefined) => void;
}

const SAMPLE_BLUEPRINTS = [
  { name: '2BHK Modern Floor Plan Scan', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', width: 700, height: 500 },
  { name: 'Studio Loft Blueprint', url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80', width: 600, height: 450 },
];

export const BlueprintImportModal: React.FC<BlueprintImportModalProps> = ({
  isOpen,
  onClose,
  currentBlueprint,
  onSaveBlueprint,
}) => {
  const [imageUrl, setImageUrl] = useState(currentBlueprint?.url || '');
  const [name, setName] = useState(currentBlueprint?.name || 'Architect Blueprint');
  const [realWidthCm, setRealWidthCm] = useState(currentBlueprint?.width || 700);
  const [realHeightCm, setRealHeightCm] = useState(currentBlueprint?.height || 500);
  const [opacity, setOpacity] = useState(currentBlueprint?.opacity || 0.45);
  const [isVisible, setIsVisible] = useState(currentBlueprint?.isVisible ?? true);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    if (!imageUrl) {
      onSaveBlueprint(undefined);
    } else {
      onSaveBlueprint({
        url: imageUrl,
        name,
        x: 0,
        y: 0,
        width: Number(realWidthCm),
        height: Number(realHeightCm),
        opacity: Number(opacity),
        isVisible,
        isLocked: false,
      });
    }
    onClose();
  };

  const handleRemove = () => {
    onSaveBlueprint(undefined);
    setImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Import Blueprint / Floor Plan Image</h3>
              <p className="text-[11px] text-slate-500">Trace accurate walls over scanned architectural drawings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* File Upload Zone */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Upload Blueprint Scan (PNG, JPG, SVG)
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-sky-50/50">
              <UploadCloud className="w-9 h-9 text-sky-600 mb-1.5" />
              <span className="text-xs font-semibold text-slate-700">Click to browse or drag & drop</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Supports high-resolution architectural scans</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Quick Preset Blueprints */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              Or Choose Sample Floor Plan
            </label>
            <div className="flex gap-2">
              {SAMPLE_BLUEPRINTS.map((sb) => (
                <button
                  key={sb.name}
                  type="button"
                  onClick={() => {
                    setImageUrl(sb.url);
                    setName(sb.name);
                    setRealWidthCm(sb.width);
                    setRealHeightCm(sb.height);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 transition"
                >
                  {sb.name}
                </button>
              ))}
            </div>
          </div>

          {/* Blueprint Scale Calibration (Known Real-World Dimension) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-sky-700">
              Real-World Scale Calibration
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Known Real Width (cm)</label>
                <input
                  type="number"
                  value={realWidthCm}
                  onChange={(e) => setRealWidthCm(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                  placeholder="e.g. 700"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Known Real Height (cm)</label>
                <input
                  type="number"
                  value={realHeightCm}
                  onChange={(e) => setRealHeightCm(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                <span className="font-medium">Background Tracing Opacity</span>
                <span className="font-mono font-bold text-sky-700">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            {currentBlueprint && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Blueprint</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-sky-500/20 border border-transparent transition flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Blueprint</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
