'use client';

import React from 'react';
import { X, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
import { HomePlan, User } from '../types/plan';
import { DECOFROG_DEMOS, DecoFrogDemoItem } from '../services/demoPlans';

interface SelectDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDemo: (plan: HomePlan) => void;
  onOpenExistingProjects?: () => void;
  currentUser?: User | null;
  theme?: 'dark' | 'light';
}

export const SelectDemoModal: React.FC<SelectDemoModalProps> = ({
  isOpen,
  onClose,
  onSelectDemo,
  onOpenExistingProjects,
  currentUser,
  theme = 'light',
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleCardClick = (demo: DecoFrogDemoItem) => {
    // Clone plan deeply and give fresh ID
    const clonedPlan: HomePlan = JSON.parse(JSON.stringify(demo.plan));
    clonedPlan.id = `plan_${currentUser?.id || 'demo'}_${Date.now()}`;
    clonedPlan.updatedAt = new Date().toISOString();
    onSelectDemo(clonedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto">
      <div
        className={`w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#1e232d] border-slate-700/80 text-slate-100'
            : 'bg-[#e2e4e8] border-slate-300 text-slate-900'
        }`}
      >
        {/* Modal Window Header - Classic & Refined */}
        <div
          className={`px-5 py-3 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? 'bg-[#181c24] border-slate-700/70 text-slate-200'
              : 'bg-[#d2d6dc] border-slate-300 text-slate-800'
          }`}
        >
          <div className="w-6" /> {/* spacer */}
          <h2 className="text-sm sm:text-base font-bold tracking-normal text-center">
            Select a demo
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 x 3 Demos Grid Container */}
        <div
          className={`flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar ${
            isDark ? 'bg-[#181c24]/90' : 'bg-[#d8dce2]'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {DECOFROG_DEMOS.map((demo) => (
              <div
                key={demo.id}
                onClick={() => handleCardClick(demo)}
                className={`group flex flex-col items-center justify-between p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isDark
                    ? 'bg-[#232834] border-slate-700/70 hover:border-amber-400/80 hover:bg-[#2a303e] shadow-md hover:shadow-xl'
                    : 'bg-white border-slate-300 hover:border-amber-500 hover:bg-amber-50/20 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Visual Thumbnail Area */}
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-300/60 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center relative group-hover:scale-[1.01] transition-transform">
                  {/* Visual Renderings depending on demo */}
                  {demo.id === 'empty-home' && (
                    <div className="w-full h-full relative bg-white flex items-center justify-center">
                      {/* Blueprint Grid Lines */}
                      <svg className="w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="gridPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#94a3b8" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#gridPattern)" />
                      </svg>
                      {/* Border preview */}
                      <div className="absolute inset-4 border-2 border-slate-700/60 rounded-xs" />
                    </div>
                  )}

                  {demo.id === 'studio' && (
                    <div className="w-full h-full bg-[#1e293b] p-2 flex flex-col justify-between relative overflow-hidden">
                      {/* Top kitchen area */}
                      <div className="h-1/3 bg-[#f8fafc] border-b-2 border-slate-800 p-1 flex justify-between items-center">
                        <div className="w-7 h-5 bg-slate-300 rounded-xs border border-slate-400" />
                        <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[7px] text-white font-mono">●</div>
                        <div className="w-8 h-4 bg-slate-700 rounded-xs" />
                      </div>
                      {/* Bottom living / bed area */}
                      <div className="flex-1 flex">
                        <div className="w-2/5 bg-[#0284c7] border-r-2 border-slate-800 flex items-center justify-center">
                          <div className="w-8 h-10 bg-white rounded-xs border border-sky-300" />
                        </div>
                        <div className="flex-1 bg-[#fda4af] p-1 flex items-center justify-center relative">
                          <div className="w-12 h-14 bg-[#f43f5e] rounded-xs shadow-xs border border-rose-600" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white absolute top-2 right-2 opacity-80" />
                        </div>
                      </div>
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-slate-900 rounded-xs" />
                    </div>
                  )}

                  {demo.id === '1-bedroom-apt' && (
                    <div className="w-full h-full bg-[#3e2723] p-1.5 flex flex-col relative overflow-hidden">
                      <div className="flex-1 flex gap-1">
                        {/* Living salon */}
                        <div className="flex-1 bg-[#4e342e] rounded-xs p-1 flex flex-col justify-between border border-amber-900/60">
                          <div className="w-4 h-4 rounded-full bg-[#84cc16] border border-lime-600" />
                          <div className="w-12 h-8 bg-[#ea580c] rounded-xs self-center border border-amber-600 shadow-xs" />
                          <div className="w-8 h-3 bg-amber-950 rounded-xs" />
                        </div>
                        {/* Bathroom + Bed */}
                        <div className="w-2/5 flex flex-col gap-1">
                          <div className="h-10 bg-[#0284c7] rounded-xs flex items-center justify-center border border-sky-500">
                            <div className="w-6 h-6 bg-white rounded-full border border-sky-300" />
                          </div>
                          <div className="flex-1 bg-[#fef3c7] rounded-xs p-1 flex items-center justify-center border border-amber-200">
                            <div className="w-9 h-12 bg-[#3b82f6] rounded-xs border border-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {demo.id === '2-bedroom-apt' && (
                    <div className="w-full h-full bg-[#cbd5e1] p-1.5 flex flex-col relative overflow-hidden">
                      <div className="flex-1 flex flex-col gap-1">
                        {/* Top wing */}
                        <div className="flex-1 flex gap-1">
                          <div className="w-1/3 bg-[#b91c1c] rounded-xs flex items-center justify-center p-1 border border-red-800">
                            <div className="w-7 h-9 bg-white rounded-xs" />
                          </div>
                          <div className="w-1/3 bg-[#fef08a] rounded-xs flex items-center justify-center border border-yellow-400">
                            <div className="w-6 h-5 bg-slate-800 rounded-xs" />
                          </div>
                          <div className="flex-1 bg-[#38bdf8] rounded-xs flex items-center justify-center border border-sky-400">
                            <div className="w-9 h-7 bg-[#0284c7] rounded-xs" />
                          </div>
                        </div>
                        {/* Bottom L-wing */}
                        <div className="h-2/5 flex gap-1">
                          <div className="w-1/2 bg-[#d97706] rounded-xs flex items-center justify-center border border-amber-700">
                            <div className="w-8 h-8 bg-[#f59e0b] rounded-xs border border-amber-900" />
                          </div>
                          <div className="w-1/3 bg-[#e2e8f0] rounded-xs border border-slate-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {demo.id === '3-bedroom-apt' && (
                    <div className="w-full h-full bg-[#334155] p-1.5 flex flex-col gap-1 relative overflow-hidden">
                      <div className="flex-1 flex gap-1">
                        {/* Central living */}
                        <div className="w-5/12 bg-[#1e293b] rounded-xs flex flex-col justify-between p-1 border border-slate-700">
                          <div className="w-7 h-7 rounded-full bg-[#38bdf8] border border-sky-500 self-center" />
                          <div className="w-full h-4 bg-slate-700 rounded-xs" />
                        </div>
                        {/* Bedroom columns */}
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex-1 bg-[#818cf8] rounded-xs flex items-center justify-center border border-indigo-500">
                            <div className="w-8 h-9 bg-[#4338ca] rounded-xs border border-indigo-700" />
                          </div>
                          <div className="flex-1 bg-[#34d399] rounded-xs flex items-center justify-center border border-emerald-500">
                            <div className="w-8 h-9 bg-[#059669] rounded-xs border border-emerald-700" />
                          </div>
                        </div>
                        <div className="w-3/12 bg-[#fef3c7] rounded-xs flex items-center justify-center border border-amber-300">
                          <div className="w-6 h-8 bg-[#f59e0b] rounded-xs" />
                        </div>
                      </div>
                    </div>
                  )}

                  {demo.id === 'bow-window-apt' && (
                    <div className="w-full h-full bg-[#78350f] p-1.5 flex flex-col relative overflow-hidden">
                      {/* Faceted bow contour */}
                      <div className="flex-1 flex gap-1">
                        <div className="w-5/12 bg-[#92400e] rounded-l-2xl border-l-4 border-amber-400 p-1 flex flex-col justify-between">
                          <div className="w-5 h-5 rounded-full bg-emerald-500" />
                          <div className="w-8 h-6 bg-amber-950 rounded-xs self-center" />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex-1 bg-[#f43f5e] rounded-xs flex items-center justify-center border border-rose-500">
                            <div className="w-8 h-8 bg-white rounded-xs border border-rose-300" />
                          </div>
                          <div className="h-10 bg-[#0ea5e9] rounded-xs flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {demo.id === '2-bedroom-house-basement' && (
                    <div className="w-full h-full bg-gradient-to-b from-[#bae6fd] to-[#65a30d] p-1 relative flex items-center justify-center overflow-hidden">
                      {/* Sky & Sloped terrain with House */}
                      <svg className="w-full h-full" viewBox="0 0 200 150">
                        {/* Sloped Hill */}
                        <polygon points="0,110 200,90 200,150 0,150" fill="#65a30d" />
                        {/* Basement retaining wall & ramp */}
                        <polygon points="20,110 90,80 90,135 20,135" fill="#a8a29e" stroke="#78716c" strokeWidth="1.5" />
                        {/* House Body */}
                        <polygon points="65,45 180,40 180,95 65,100" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="1.5" />
                        {/* Roof */}
                        <polygon points="60,45 125,25 185,40" fill="#b91c1c" />
                        {/* Porch / deck rail */}
                        <line x1="30" y1="85" x2="65" y2="85" stroke="#78716c" strokeWidth="2" />
                        <line x1="30" y1="85" x2="30" y2="105" stroke="#78716c" strokeWidth="2" />
                        {/* Windows */}
                        <rect x="80" y="55" width="16" height="20" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                        <rect x="110" y="55" width="16" height="20" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                        <rect x="140" y="55" width="22" height="28" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                      </svg>
                    </div>
                  )}

                  {demo.id === '3-bedroom-house-attic' && (
                    <div className="w-full h-full bg-gradient-to-b from-[#bae6fd] to-[#84cc16] p-1 relative flex items-center justify-center overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 200 150">
                        {/* Lawn */}
                        <rect x="0" y="105" width="200" height="45" fill="#65a30d" />
                        {/* Main White House Facade */}
                        <polygon points="50,55 120,25 155,55 155,115 50,115" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                        {/* Steep Attic Pitched Roof */}
                        <polygon points="45,55 120,20 160,55 120,25" fill="#dc2626" />
                        {/* Garage Annex */}
                        <polygon points="155,80 185,85 185,115 155,115" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                        <polygon points="152,80 185,80 185,85" fill="#b91c1c" />
                        <rect x="160" y="90" width="20" height="25" fill="#64748b" />
                        {/* Attic Window */}
                        <rect x="95" y="40" width="14" height="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                        {/* 1st Floor Windows */}
                        <rect x="70" y="65" width="16" height="18" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                        <rect x="120" y="65" width="16" height="18" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                        {/* Ground Floor Windows & Door */}
                        <rect x="70" y="92" width="16" height="18" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                        <rect x="100" y="92" width="14" height="23" fill="#78350f" />
                      </svg>
                    </div>
                  )}

                  {demo.id === '3-bedroom-house-mezzanine' && (
                    <div className="w-full h-full bg-gradient-to-b from-[#bae6fd] to-[#84cc16] p-1 relative flex items-center justify-center overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 200 150">
                        {/* Green Garden */}
                        <polygon points="0,115 200,105 200,150 0,150" fill="#65a30d" />
                        {/* White Terrace Slab */}
                        <polygon points="40,115 175,95 185,135 70,140" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                        {/* Ground Floor Block */}
                        <polygon points="65,65 170,55 170,110 65,115" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="1.5" />
                        {/* Upper Mezzanine Balcony / Terrace Cutout */}
                        <polygon points="50,40 185,30 185,75 50,85" fill="#bfa597" stroke="#8d6e63" strokeWidth="1.5" />
                        {/* Mezzanine Open Glass Walls */}
                        <rect x="80" y="50" width="30" height="25" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" />
                        <rect x="130" y="45" width="35" height="25" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" />
                        {/* Red plant on mezzanine terrace */}
                        <circle cx="68" cy="65" r="4" fill="#ef4444" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Card Title Label */}
                <div className="pt-2.5 pb-1 w-full text-center">
                  <span
                    className={`text-xs sm:text-[13px] font-semibold tracking-tight transition-colors ${
                      isDark
                        ? 'text-slate-200 group-hover:text-amber-300'
                        : 'text-slate-800 group-hover:text-amber-800'
                    }`}
                  >
                    {demo.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Options Bar */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 text-xs ${
            isDark ? 'bg-[#181c24] border-slate-700/70 text-slate-400' : 'bg-[#d2d6dc] border-slate-300 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Click any demo to open and start editing</span>
          </div>

          {onOpenExistingProjects && (
            <button
              onClick={() => {
                onClose();
                onOpenExistingProjects();
              }}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Browse My Saved Projects</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
