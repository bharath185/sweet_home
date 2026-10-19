'use client';

import React from 'react';
import {
  X,
  Sparkles,
  Magnet,
  Maximize2,
  Eye,
  Box,
  Compass,
  ArrowRight,
  CheckCircle2,
  Home,
  Layers,
  Wand2,
} from 'lucide-react';

interface CustomerWelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTemplates: () => void;
  onOpenCatalog: () => void;
  onStartWalkTour: () => void;
  theme?: 'dark' | 'light';
}

export const CustomerWelcomeGuideModal: React.FC<CustomerWelcomeGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenTemplates,
  onOpenCatalog,
  onStartWalkTour,
  theme = 'light',
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const STEPS = [
    {
      num: '1',
      title: 'Pick a Layout or Room',
      desc: 'Start with a ready-to-design template (1-Bedroom, 2-Bedroom, Studio, or Villa), or work with your existing walls.',
      icon: Home,
      actionText: 'Choose Template',
      action: () => {
        onClose();
        onOpenTemplates();
      },
    },
    {
      num: '2',
      title: 'Add Furniture & Snap to Walls',
      desc: 'Browse 3D items from the catalog. Click any item, then click 🧲 "Snap to Wall" — it instantly aligns flush against the wall and faces into the room!',
      icon: Magnet,
      actionText: 'Open 3D Catalog',
      action: () => {
        onClose();
        onOpenCatalog();
      },
    },
    {
      num: '3',
      title: 'Customize Luxury Arched Finishes',
      desc: 'Select any arched cabinet or island to change wood stains, Calacatta Gold marble countertops, and knurled brass hardware with 1 click.',
      icon: Sparkles,
      actionText: 'Browse Arched Details',
      action: () => {
        onClose();
        onOpenCatalog();
      },
    },
    {
      num: '4',
      title: 'Take an Interactive 3D Walk Tour',
      desc: 'Switch to first-person walk mode to walk through your home, open cabinet doors and windows, and experience your realistic spaces.',
      icon: Eye,
      actionText: 'Start 3D Tour',
      action: () => {
        onClose();
        onStartWalkTour();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDark
            ? 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/30'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-6 border-b flex items-center justify-between relative overflow-hidden ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  Beginner Friendly
                </span>
                <span className="text-[10px] text-slate-400">Zero CAD Experience Required</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">
                How to Design Your Dream Home
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome to <strong className="text-slate-800 dark:text-slate-200">DecoFrog 3D Studio</strong>. You don’t need any architectural knowledge or complex CAD tools — here is how to design your home in 4 easy steps:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800/90 hover:border-indigo-500/50'
                      : 'bg-slate-50/70 border-slate-200/90 hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {step.num}
                      </div>
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold leading-tight mb-1">{step.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {step.desc}
                    </p>
                  </div>

                  <button
                    onClick={step.action}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>{step.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Golden Pro Tip Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
              <Magnet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-500 dark:text-amber-400">
                Quick Alignment Tip:
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Whenever you click on any furniture in your room, look at the floating bar at the bottom: click <strong>🧲 "Snap to Wall"</strong> to immediately align it flush with the wall, or <strong>🎯 "Center"</strong> to center it in the room!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <span className="text-[11px] text-slate-400">
            Press anytime from the top bar: <strong>💡 How to Design</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            Start Designing Now
          </button>
        </div>
      </div>
    </div>
  );
};
