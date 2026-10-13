'use client';

import React from 'react';
import { Volume2, VolumeX, Eye, User, Footprints, Shield, Compass } from 'lucide-react';

interface PubgGameHudProps {
  yaw: number; // in radians
  pitch: number; // in radians
  isPointerLocked?: boolean;
  isDragging?: boolean;
  perspectiveMode?: 'tpp' | 'fpp';
  isSprinting: boolean;
  isCrouching: boolean;
  isMoving: boolean;
  isSoundEnabled: boolean;
  activeFloorLevel: number;
  currentRoomName?: string;
  nearbyDoorPrompt?: { name: string; isOpen: boolean } | null;
  onTogglePerspective?: () => void;
  onToggleSound: () => void;
  onRequestPointerLock?: () => void;
  isCustomerMode?: boolean;
}

export const PubgGameHud: React.FC<PubgGameHudProps> = ({
  yaw,
  isPointerLocked = false,
  isDragging = false,
  perspectiveMode,
  isSprinting,
  isCrouching,
  isMoving,
  isSoundEnabled,
  activeFloorLevel,
  currentRoomName,
  nearbyDoorPrompt,
  onTogglePerspective,
  onToggleSound,
  onRequestPointerLock,
  isCustomerMode = false,
}) => {
  const isCompactMode = isDragging || isPointerLocked;
  // Convert Three.js visitorYaw into compass heading in degrees (0..360)
  // Three.js: forward is -Z (yaw=0 -> North = 0 deg)
  const deg = (Math.round((-yaw * 180) / Math.PI) % 360 + 360) % 360;

  // Cardinal direction text
  const getCardinal = (d: number) => {
    if (d >= 337.5 || d < 22.5) return 'N';
    if (d >= 22.5 && d < 67.5) return 'NE';
    if (d >= 67.5 && d < 112.5) return 'E';
    if (d >= 112.5 && d < 157.5) return 'SE';
    if (d >= 157.5 && d < 202.5) return 'S';
    if (d >= 202.5 && d < 247.5) return 'SW';
    if (d >= 247.5 && d < 292.5) return 'W';
    return 'NW';
  };

  // Generate compass ribbon items across 360 degrees plus wraparound for smooth rendering
  // Render marks from (deg - 90) to (deg + 90)
  const compassWindow = 120; // visible degree range (+-60)
  const compassItems: { mark: number; label: string; isCardinal: boolean }[] = [];
  const startMark = Math.floor((deg - compassWindow / 2) / 15) * 15;
  const endMark = Math.ceil((deg + compassWindow / 2) / 15) * 15;

  for (let m = startMark; m <= endMark; m += 15) {
    const normalized = (m % 360 + 360) % 360;
    let label = `${normalized}`;
    let isCardinal = false;
    if (normalized === 0) { label = 'N'; isCardinal = true; }
    else if (normalized === 45) { label = 'NE'; isCardinal = true; }
    else if (normalized === 90) { label = 'E'; isCardinal = true; }
    else if (normalized === 135) { label = 'SE'; isCardinal = true; }
    else if (normalized === 180) { label = 'S'; isCardinal = true; }
    else if (normalized === 225) { label = 'SW'; isCardinal = true; }
    else if (normalized === 270) { label = 'W'; isCardinal = true; }
    else if (normalized === 315) { label = 'NW'; isCardinal = true; }

    compassItems.push({ mark: m, label, isCardinal });
  }

  const crosshairSpread = isSprinting ? 14 : isMoving ? 8 : 4;

  return (
    <div className={`absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between overflow-hidden font-mono ${isCustomerMode ? 'pt-16 pb-4 px-4' : 'p-4'}`}>
      {/* ---------------- TOP COMPASS RIBBON ---------------- */}
      <div className="flex flex-col items-center">
        {isCompactMode ? (
          /* Max-reduced sleek micro-compass tape during mouse drag operations */
          <div className="relative w-56 h-6 bg-slate-950/60 backdrop-blur-xs rounded-lg border border-amber-500/25 shadow-md flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              {compassItems.map(({ mark, label, isCardinal }) => {
                const diff = mark - deg;
                const offsetPx = diff * 2.6;
                if (Math.abs(offsetPx) > 105) return null;

                return (
                  <div
                    key={mark}
                    className="absolute flex flex-col items-center"
                    style={{ transform: `translateX(${offsetPx}px)` }}
                  >
                    <span
                      className={`text-[8px] font-black leading-none ${
                        isCardinal ? 'text-amber-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                    <div
                      className={`w-[1px] mt-0.5 ${
                        isCardinal ? 'h-2 bg-amber-400' : 'h-1 bg-slate-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="absolute top-0 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-amber-400" />
            </div>
          </div>
        ) : (
          /* Sleek compass ribbon when idle */
          <>
            <div className="relative w-80 md:w-96 h-10 bg-slate-950/80 backdrop-blur-md rounded-xl border border-amber-500/30 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <div className="relative w-full h-full flex items-center justify-center">
                {compassItems.map(({ mark, label, isCardinal }) => {
                  const diff = mark - deg;
                  const offsetPx = diff * 3.2;
                  if (Math.abs(offsetPx) > 180) return null;

                  return (
                    <div
                      key={mark}
                      className="absolute flex flex-col items-center transition-transform"
                      style={{ transform: `translateX(${offsetPx}px)` }}
                    >
                      <span
                        className={`text-[10px] font-black leading-none ${
                          isCardinal ? 'text-amber-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {label}
                      </span>
                      <div
                        className={`w-[1.5px] mt-1 ${
                          isCardinal ? 'h-3 bg-amber-400' : 'h-1.5 bg-slate-500'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-0 flex flex-col items-center pointer-events-none">
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400" />
              </div>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <div className="px-3 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-[11px] font-black tracking-wider text-amber-400 shadow-md flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>{deg}°</span>
                <span className="text-white font-extrabold">{getCardinal(deg)}</span>
              </div>

              <div className="px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300 text-[10px] font-medium shadow-sm flex items-center gap-1.5">
                <span>🖱️ Drag mouse to look in directions</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---------------- CENTER RETICLE & INTERACTION PROMPT ---------------- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* PUBG 4-Bar Crosshair */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs" />
          <div
            className="absolute w-[2px] h-3 bg-white/90 rounded-full transition-all duration-75"
            style={{ transform: `translateY(-${crosshairSpread + 8}px)` }}
          />
          <div
            className="absolute w-[2px] h-3 bg-white/90 rounded-full transition-all duration-75"
            style={{ transform: `translateY(${crosshairSpread + 8}px)` }}
          />
          <div
            className="absolute h-[2px] w-3 bg-white/90 rounded-full transition-all duration-75"
            style={{ transform: `translateX(-${crosshairSpread + 8}px)` }}
          />
          <div
            className="absolute h-[2px] w-3 bg-white/90 rounded-full transition-all duration-75"
            style={{ transform: `translateX(${crosshairSpread + 8}px)` }}
          />
        </div>

        {/* Nearby Door Interaction Prompt */}
        {nearbyDoorPrompt && (
          <div className="mt-8 px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-400 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px]">
              F
            </span>
            <span>
              {nearbyDoorPrompt.isOpen ? `Close ${nearbyDoorPrompt.name}` : `Open ${nearbyDoorPrompt.name}`}
            </span>
          </div>
        )}
      </div>

      {/* ---------------- BOTTOM HUD BAR ---------------- */}
      {isCompactMode ? (
        /* Max-reduced sleek micro-status line during active mouse drag operations */
        <div className={`flex items-center justify-between w-full ${isCustomerMode ? 'pl-56 md:pl-60 pr-36' : ''}`}>
          <div className="px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-xs border border-slate-700/60 text-slate-300 text-[10px] font-semibold flex items-center gap-2 shadow-sm">
            <span className="text-amber-400 font-bold">
              {isSprinting ? 'SPRINT' : isCrouching ? 'CROUCH' : isMoving ? 'WALK' : 'STAND'}
            </span>
            <span className="text-slate-600">•</span>
            <span>LEVEL: {activeFloorLevel === 0 ? 'GROUND' : '1ST'}</span>
            {currentRoomName && (
              <>
                <span className="text-slate-600">•</span>
                <span>📍 {currentRoomName.toUpperCase()}</span>
              </>
            )}
          </div>
          <div className="px-2.5 py-1 rounded-full bg-slate-950/50 text-slate-400 text-[9px] font-medium border border-slate-800">
            🖱️ Dragging Direction
          </div>
        </div>
      ) : (
        /* Full status bar with audio toggle and complete hotkey guide */
        <div className="flex items-end justify-between w-full">
          <div className={`flex flex-col gap-2 ${isCustomerMode ? 'ml-56 md:ml-60' : ''}`}>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleSound}
                className={`pointer-events-auto p-1.5 rounded-xl border transition shadow-xl cursor-pointer ${
                  isSoundEnabled
                    ? 'bg-slate-900/90 text-emerald-400 border-emerald-500/50 hover:bg-slate-800'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
                title="Toggle Footsteps Audio (Press M)"
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isSprinting ? 'SPRINTING' : isCrouching ? 'CROUCHED' : isMoving ? 'WALKING' : 'IDLE'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-[10px] font-semibold">
              <span className="text-amber-400 font-bold">🖱️ Drag</span> Look
              <span className="text-amber-400 font-bold">[WASD]</span> Move
              <span className="text-amber-400 font-bold">[SHIFT]</span> Sprint
              <span className="text-amber-400 font-bold">[C]</span> Crouch
              <span className="text-amber-400 font-bold">[SPACE]</span> Jump
              <span className="text-amber-400 font-bold">[F]</span> Door
            </div>
          </div>

          {!isCustomerMode && (
            <div className="flex flex-col items-end gap-1.5">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-indigo-500/50 text-indigo-300 text-xs font-black shadow-xl flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>LEVEL: {activeFloorLevel === 0 ? 'GROUND FLOOR' : `1ST FLOOR (Penthouse)`}</span>
              </div>

              {currentRoomName && (
                <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-[11px] font-bold shadow-md">
                  📍 {currentRoomName.toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
