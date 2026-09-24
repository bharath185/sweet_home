'use client';

import React, { useState } from 'react';
import {
  Camera,
  Download,
  X,
  Sparkles,
  Maximize2,
  Check,
  Ratio,
  Sliders,
  Palette,
} from 'lucide-react';

interface RenderStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureSnapshot: (settings: RenderSnapshotSettings) => Promise<string | null>;
  projectName?: string;
  activeFloor?: number;
  onUpgradePrompt?: (featureName: string) => void;
  isPro?: boolean;
}

export interface RenderSnapshotSettings {
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  resolutionMultiplier: 1 | 2 | 4; // 1x preview, 2x standard HD, 4x Ultra 4K
  includeWatermark: boolean;
  lightingPreset: 'natural' | 'warm_golden' | 'dusk' | 'bright_studio';
  watermarkText: string;
}

export const RenderStudioModal: React.FC<RenderStudioModalProps> = ({
  isOpen,
  onClose,
  onCaptureSnapshot,
  projectName = '3D_Studio_Project',
  activeFloor = 0,
  onUpgradePrompt,
  isPro = true,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '9:16'>('16:9');
  const [resolutionMultiplier, setResolutionMultiplier] = useState<1 | 2 | 4>(2);
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>('Visual Rendered 3D Studio');
  const [lightingPreset, setLightingPreset] = useState<'natural' | 'warm_golden' | 'dusk' | 'bright_studio'>('natural');

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  const handleGenerateRender = async () => {
    setIsRendering(true);
    try {
      const dataUrl = await onCaptureSnapshot({
        aspectRatio,
        resolutionMultiplier,
        includeWatermark,
        lightingPreset,
        watermarkText,
      });
      if (dataUrl) {
        setPreviewImage(dataUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownload = () => {
    if (!previewImage) return;
    const a = document.createElement('a');
    a.href = previewImage;
    const floorLabel = activeFloor === 0 ? 'Ground_Floor' : `Floor_${activeFloor}`;
    a.download = `${projectName.replace(/\s+/g, '_')}_${floorLabel}_${resolutionMultiplier === 4 ? '4K_Ultra' : 'HD'}_Render.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Cinematic Render Studio</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  4K Photo Snapshot
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export presentation-grade architectural renders with custom aspect ratios, high DPI, and watermark.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left Settings Column */}
          <div className="space-y-4">
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Ratio className="w-3.5 h-3.5 text-sky-500" />
                <span>Camera Frame & Aspect Ratio</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '16:9', label: '16:9 Landscape', desc: 'Presentation & TV' },
                  { id: '4:3', label: '4:3 Architectural', desc: 'Standard CAD View' },
                  { id: '1:1', label: '1:1 Square', desc: 'Social & Portfolio' },
                  { id: '9:16', label: '9:16 Vertical', desc: 'Mobile Story' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAspectRatio(item.id as any);
                      setPreviewImage(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      aspectRatio === item.id
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Quality */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-500" />
                <span>Export Quality & Resolution</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mult: 1, label: 'Standard (1x)', desc: 'Fast Web' },
                  { mult: 2, label: 'HD 2K (2x)', desc: 'Sharp Print' },
                  { mult: 4, label: !isPro ? 'Ultra 4K 👑' : 'Ultra 4K (4x)', desc: !isPro ? 'Pro Feature' : 'Master Render' },
                ].map((res) => (
                  <button
                    key={res.mult}
                    onClick={() => {
                      if (res.mult === 4 && !isPro && onUpgradePrompt) {
                        onUpgradePrompt('4K Ultra Raytracing Master Snapshot Engine');
                        return;
                      }
                      setResolutionMultiplier(res.mult as any);
                      setPreviewImage(null);
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      resolutionMultiplier === res.mult
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{res.label}</div>
                    <div className="text-[9px] text-slate-400">{res.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark Branding */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Branded Studio Watermark
                </span>
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => {
                    setIncludeWatermark(e.target.checked);
                    setPreviewImage(null);
                  }}
                  className="rounded-sm accent-sky-600 cursor-pointer"
                />
              </label>

              {includeWatermark && (
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => {
                    setWatermarkText(e.target.value);
                    setPreviewImage(null);
                  }}
                  placeholder="Watermark text (e.g. Visual Rendered Studio)"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Right Live Preview Column */}
          <div className="flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/60 relative min-h-[260px]">
            {previewImage ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={previewImage}
                  alt="3D Scene Render Preview"
                  className="max-h-[220px] max-w-full rounded-lg object-contain shadow-lg border border-slate-200 dark:border-slate-700"
                />
                <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Snapshot Captured Ready for Download</span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 max-w-[220px]">
                <Camera className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Ready to capture 3D view
                </p>
                <p className="text-[11px] text-slate-400">
                  Position your camera in the 3D viewport, then click "Generate Snapshot" below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Aspect: <strong className="text-slate-800 dark:text-white">{aspectRatio}</strong> • Resolution:{' '}
            <strong className="text-slate-800 dark:text-white">{resolutionMultiplier}x</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateRender}
              disabled={isRendering}
              className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{isRendering ? 'Rendering...' : 'Generate Snapshot'}</span>
            </button>

            {previewImage && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
