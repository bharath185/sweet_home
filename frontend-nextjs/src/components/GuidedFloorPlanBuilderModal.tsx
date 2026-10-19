'use client';

import React, { useState } from 'react';
import {
  X,
  Layers,
  Sparkles,
  Building,
  Home,
  Check,
  Plus,
  Minus,
  Maximize2,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { HomePlan, User } from '../types/plan';
import {
  generateCustomHomePlan,
  RoomSelectionState,
  HomePlanWizardConfig,
} from '../services/floorPlanGenerator';
import { DECOFROG_DEMOS } from '../services/demoPlans';
import { referenceLuxuryPlan } from '../services/referencePlans';

interface GuidedFloorPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: HomePlan) => void;
  onOpenBlankCanvas: () => void;
  onOpenBlueprintImport?: () => void;
  onOpenShowcaseDemos?: () => void;
  currentUser?: User | null;
  theme?: 'dark' | 'light';
}

export const GuidedFloorPlanBuilderModal: React.FC<GuidedFloorPlanBuilderModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
  onOpenBlankCanvas,
  onOpenBlueprintImport,
  onOpenShowcaseDemos,
  currentUser,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  // Wizard State
  const [projectName, setProjectName] = useState('My Custom Residence');
  const [floorsCount, setFloorsCount] = useState<1 | 2 | 3>(1);
  const [scale, setScale] = useState<'compact' | 'standard' | 'spacious'>('standard');
  const [furnishingMode, setFurnishingMode] = useState<'furnished' | 'shell'>('furnished');

  const [rooms, setRooms] = useState<RoomSelectionState>({
    living: true,
    kitchen: true,
    dining: true,
    masterBed: true,
    guestBedCount: 1,
    bathCount: 2,
    office: true,
    balcony: true,
    utility: false,
    foyer: true,
  });

  if (!isOpen) return null;

  // Toggle boolean room
  const toggleRoom = (key: keyof Omit<RoomSelectionState, 'guestBedCount' | 'bathCount'>) => {
    setRooms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Adjust counters
  const setBedCount = (delta: number) => {
    setRooms((prev) => ({
      ...prev,
      guestBedCount: Math.max(0, Math.min(3, prev.guestBedCount + delta)),
    }));
  };

  const setBathCount = (delta: number) => {
    setRooms((prev) => ({
      ...prev,
      bathCount: Math.max(1, Math.min(3, prev.bathCount + delta)),
    }));
  };

  // Calculate live summary
  const totalRoomsCount =
    (rooms.living ? 1 : 0) +
    (rooms.kitchen ? 1 : 0) +
    (rooms.dining ? 1 : 0) +
    (rooms.masterBed ? 1 : 0) +
    rooms.guestBedCount +
    rooms.bathCount +
    (rooms.office ? 1 : 0) +
    (rooms.balcony ? 1 : 0);

  const approxArea = Math.round(
    totalRoomsCount * (scale === 'compact' ? 14 : scale === 'spacious' ? 24 : 18) * (floorsCount === 1 ? 1 : floorsCount * 0.85)
  );

  const handleGenerate = () => {
    const config: HomePlanWizardConfig = {
      projectName: projectName.trim() || 'My Custom Residence',
      floorsCount,
      rooms,
      scale,
      furnishingMode,
      userId: currentUser?.id || 'guest',
    };

    const newPlan = generateCustomHomePlan(config);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('decofrog_demo_chosen', 'true');
    }
    onPlanCreated(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto">
      <div
        className={`w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#181c24] border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? 'bg-[#14171f] border-slate-800'
              : 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                Tailor Your Home Plan
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Custom Studio Setup
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your floors and desired rooms. We generate a clean architectural layout — you furnish the rest.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Form Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Featured 1-Click Layout: Reference 30' x 42' Luxury Villa */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
              isDark
                ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border-emerald-500/30'
                : 'bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50 border-emerald-300/80 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    30&apos; × 42&apos; Premier Luxury Residence
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wide">
                    100% Reference Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  Calacatta white marble floor, dog-leg stairs, L-sofa, arched kitchen, sedan car &amp; luxury suites.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('decofrog_demo_chosen', 'true');
                }
                onPlanCreated(referenceLuxuryPlan);
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 hover:scale-[1.02]"
            >
              <span>Load Reference Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Project Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Modern Minimalist Penthouse, Family Villa"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                isDark
                  ? 'bg-slate-900/80 border-slate-700 text-white focus:ring-emerald-500/40'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500/30 focus:bg-white'
              }`}
            />
          </div>

          {/* STEP 1: How many floors are you planning? */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                1. How many floors are you planning?
              </label>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {floorsCount === 1 ? 'Single Story' : floorsCount === 2 ? 'Two-Story Duplex' : '3-Level Villa'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  count: 1 as const,
                  title: '1 Floor',
                  subtitle: 'Single Level / Apartment',
                  icon: Home,
                },
                {
                  count: 2 as const,
                  title: '2 Floors',
                  subtitle: 'Duplex / Family Home',
                  icon: Building,
                  badge: 'Popular',
                },
                {
                  count: 3 as const,
                  title: '3 Floors',
                  subtitle: 'Multi-Level Luxury Villa',
                  icon: Maximize2,
                },
              ].map((f) => {
                const isSelected = floorsCount === f.count;
                const Icon = f.icon;
                return (
                  <button
                    key={f.count}
                    type="button"
                    onClick={() => setFloorsCount(f.count)}
                    className={`relative p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isDark
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                          : 'bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-sm'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {f.badge && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 uppercase">
                        {f.badge}
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-sm">{f.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {f.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: What rooms are you planning? */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              2. What rooms are you planning? (Rest you can furnish anytime)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Living Room */}
              <div
                onClick={() => toggleRoom('living')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  rooms.living
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 text-white'
                      : 'bg-emerald-50/40 border-emerald-400 text-slate-900'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🛋️</span>
                  <div>
                    <div className="text-xs font-bold">Living Room & Lounge</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Formal reception & seating</div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    rooms.living
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                >
                  {rooms.living && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Kitchen */}
              <div
                onClick={() => toggleRoom('kitchen')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  rooms.kitchen
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 text-white'
                      : 'bg-emerald-50/40 border-emerald-400 text-slate-900'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🍳</span>
                  <div>
                    <div className="text-xs font-bold">Modular Kitchen</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Arched cabinetry & counter zone</div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    rooms.kitchen
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                >
                  {rooms.kitchen && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Dining Salon */}
              <div
                onClick={() => toggleRoom('dining')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  rooms.dining
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 text-white'
                      : 'bg-emerald-50/40 border-emerald-400 text-slate-900'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🍽️</span>
                  <div>
                    <div className="text-xs font-bold">Dining Area</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Table & entertaining space</div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    rooms.dining
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                >
                  {rooms.dining && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Master Bedroom Suite */}
              <div
                onClick={() => toggleRoom('masterBed')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  rooms.masterBed
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 text-white'
                      : 'bg-emerald-50/40 border-emerald-400 text-slate-900'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🛏️</span>
                  <div>
                    <div className="text-xs font-bold">Primary Master Suite</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Spacious master bedroom</div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    rooms.masterBed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                >
                  {rooms.masterBed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Additional Bedrooms Counter */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🛌</span>
                  <div>
                    <div className="text-xs font-bold">Additional Bedrooms</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Guest or children's rooms</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBedCount(-1)}
                    disabled={rooms.guestBedCount <= 0}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-30 ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {rooms.guestBedCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBedCount(1)}
                    disabled={rooms.guestBedCount >= 3}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-30 ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Bathrooms Counter */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🚿</span>
                  <div>
                    <div className="text-xs font-bold">Bathrooms & En-suites</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Master & guest powder baths</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBathCount(-1)}
                    disabled={rooms.bathCount <= 1}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-30 ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {rooms.bathCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBathCount(1)}
                    disabled={rooms.bathCount >= 3}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-30 ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Home Office */}
              <div
                onClick={() => toggleRoom('office')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  rooms.office
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 text-white'
                      : 'bg-emerald-50/40 border-emerald-400 text-slate-900'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">💼</span>
                  <div>
                    <div className="text-xs font-bold">Home Office / Study</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Dedicated workspace zone</div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    rooms.office
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                >
                  {rooms.office && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Balcony / Terrace */}
              <div
                onClick={() => toggleRoom('balcony')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  rooms.balcony
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 text-white'
                      : 'bg-emerald-50/40 border-emerald-400 text-slate-900'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🌿</span>
                  <div>
                    <div className="text-xs font-bold">Balcony & Sun Terrace</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Outdoor living extension</div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    rooms.balcony
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                >
                  {rooms.balcony && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Overall Space Scale */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              3. Desired Home Scale
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'compact' as const, label: 'Cozy / Compact', desc: '~75 – 100 m²' },
                { id: 'standard' as const, label: 'Standard Family', desc: '~140 – 190 m²' },
                { id: 'spacious' as const, label: 'Spacious / Luxury', desc: '~220 – 320 m²' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScale(s.id)}
                  className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                    scale === s.id
                      ? isDark
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : isDark
                      ? 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: Pre-Interiors & Customization Option */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                4. Pre-Staged Interiors & Customization
              </label>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {furnishingMode === 'furnished' ? '✨ Designer Furnished (Full Suite)' : 'Empty Shell'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFurnishingMode('furnished')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  furnishingMode === 'furnished'
                    ? isDark
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                      : 'bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-sm'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>🛋️</span>
                    <span>Curate Designer Interiors (Recommended)</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      furnishingMode === 'furnished'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-400 dark:border-slate-600'
                    }`}
                  >
                    {furnishingMode === 'furnished' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pre-populates Floor 1 & Floor 2 with matched arched cabinetry, sofas, beds, dining sets & fixtures. Every item is 100% customizable in 2D & 3D.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFurnishingMode('shell')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  furnishingMode === 'shell'
                    ? isDark
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                      : 'bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-sm'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>📐</span>
                    <span>Architectural Shell Only</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      furnishingMode === 'shell'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-400 dark:border-slate-600'
                    }`}
                  >
                    {furnishingMode === 'shell' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Generates empty rooms with walls, doors and windows only, ready for complete manual furniture placement from scratch.
                </div>
              </button>
            </div>
          </div>

          {/* Live Summary Pill */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                Configured: <strong className="text-slate-900 dark:text-white">{floorsCount} {floorsCount === 1 ? 'Floor' : 'Floors'}</strong> • <strong className="text-slate-900 dark:text-white">{totalRoomsCount} Selected Rooms</strong>
              </span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Est. ~{approxArea} m² Envelope
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-[#14171f] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Alternative Quick Options */}
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                onOpenBlankCanvas();
                onClose();
              }}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 underline underline-offset-4 cursor-pointer"
            >
              Start Blank Canvas
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            {onOpenShowcaseDemos && (
              <button
                type="button"
                onClick={() => {
                  onOpenShowcaseDemos();
                  onClose();
                }}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 underline underline-offset-4 cursor-pointer"
              >
                Showcase Demos
              </button>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create My Custom Floor Plan</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
