'use client';

import React, { useState } from 'react';
import { X, Settings, Check, Ruler, Magnet, Eye } from 'lucide-react';
import { ProjectPreferences, UnitSystem } from '../types/plan';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: ProjectPreferences;
  onSavePreferences: (pref: ProjectPreferences) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(preferences.unitSystem || 'cm');
  const [defaultWallThickness, setDefaultWallThickness] = useState(preferences.defaultWallThickness || 15);
  const [defaultWallHeight, setDefaultWallHeight] = useState(preferences.defaultWallHeight || 250);
  const [gridSize, setGridSize] = useState(preferences.gridSize || 20);
  const [magnetismEnabled, setMagnetismEnabled] = useState(preferences.magnetismEnabled ?? true);
  const [showRulers, setShowRulers] = useState(preferences.showRulers ?? true);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({
      unitSystem,
      defaultWallThickness: Number(defaultWallThickness),
      defaultWallHeight: Number(defaultWallHeight),
      gridSize: Number(gridSize),
      magnetismEnabled,
      showRulers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Preferences & Units</h3>
              <p className="text-[11px] text-slate-500">Configure measurement scales and wall defaults</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Unit System */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-sky-600" />
              <span>Unit System</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-center">
              {[
                { id: 'cm', label: 'Centimeters (cm)' },
                { id: 'm', label: 'Meters (m)' },
                { id: 'mm', label: 'Millimeters (mm)' },
                { id: 'ft_in', label: 'Feet & Inches (ft/in)' },
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnitSystem(u.id as UnitSystem)}
                  className={`py-1.5 px-1 rounded-lg transition text-[11px] font-medium ${
                    unitSystem === u.id
                      ? 'bg-white text-sky-700 shadow-sm border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {u.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Wall Defaults */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Default Wall Thickness (cm)
              </label>
              <input
                type="number"
                value={defaultWallThickness}
                onChange={(e) => setDefaultWallThickness(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Default Ceiling Height (cm)
              </label>
              <input
                type="number"
                value={defaultWallHeight}
                onChange={(e) => setDefaultWallHeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Magnetism and Snapping */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-2">
                <Magnet className="w-4 h-4 text-sky-600" />
                <span>Magnetism & Wall Snapping</span>
              </span>
              <input
                type="checkbox"
                checked={magnetismEnabled}
                onChange={(e) => setMagnetismEnabled(e.target.checked)}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600" />
                <span>Show Architectural Rulers & Grid</span>
              </span>
              <input
                type="checkbox"
                checked={showRulers}
                onChange={(e) => setShowRulers(e.target.checked)}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-sky-500/20 border border-transparent transition flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
